-- MINJI 포트폴리오 — Phase 4 방문자 분석 (4c: 내 IP 제외 + 페이지별 통계 + 체류시간)
--
-- 1) 운영자가 직접 드나든 방문을 통계에서 제외(과거 삭제 + 미래 차단)
-- 2) 페이지별(상세 포함) 오늘/누적 방문자·페이지뷰 집계
-- 3) 페이지 체류시간 수집 + 페이지별 중앙 체류시간
--
-- 원본 IP는 저장하지 않고 SHA-256 해시(visitor_hash)만 있으므로, 운영자는 자기 해시를
-- 알 수 없다. 따라서 "현재 접속 IP 제외" RPC가 요청 헤더에서 해시를 직접 계산해 등록한다.
-- 제외는 수집 함수 한 곳에서 막으면 하위 집계(공개 뷰·어드민 함수·푸터)에 자동 반영된다.

-- ── 1) 제외 목록 ─────────────────────────────────────────────────────────────
create table if not exists analytics_excluded_visitors (
  visitor_hash text primary key,
  note text,
  created_at timestamptz not null default now()
);

alter table analytics_excluded_visitors enable row level security;
revoke all on analytics_excluded_visitors from anon;

drop policy if exists "admin full access excluded_visitors" on analytics_excluded_visitors;
create policy "admin full access excluded_visitors"
  on analytics_excluded_visitors for all to authenticated
  using (true) with check (true);

-- 현재 요청 IP 해시를 계산해 등록 + 그 IP의 과거 기록 삭제(되돌릴 수 없음).
-- digest()가 extensions 스키마에 있으므로 search_path에 포함(0042 참고).
create or replace function analytics_exclude_current_visitor(p_note text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text := analytics_client_ip_hash();
begin
  insert into analytics_excluded_visitors (visitor_hash, note)
    values (v_hash, nullif(p_note, ''))
    on conflict (visitor_hash) do update set note = excluded.note;
  delete from analytics_events where visitor_hash = v_hash;
  return v_hash;  -- UI엔 앞 12자만 표시
end;
$$;

revoke all on function analytics_exclude_current_visitor(text) from public;
grant execute on function analytics_exclude_current_visitor(text) to authenticated;

-- 제외 해제 — 이미 지운 과거는 복구되지 않고, 이후 새 방문부터 다시 집계된다.
create or replace function analytics_remove_excluded_visitor(p_hash text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from analytics_excluded_visitors where visitor_hash = p_hash;
$$;

revoke all on function analytics_remove_excluded_visitor(text) from public;
grant execute on function analytics_remove_excluded_visitor(text) to authenticated;

-- ── 2) 수집 함수에 제외 가드 추가 (0041 본문 + 가드 한 블록) ──────────────────
create or replace function analytics_track_event(
  p_event_type text,
  p_event_name text,
  p_path text,
  p_referrer text,
  p_utm_source text,
  p_utm_medium text,
  p_utm_campaign text,
  p_session_id uuid,
  p_device_category text,
  p_meta jsonb,
  p_user_agent text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_visitor_hash text := analytics_client_ip_hash();
  v_recent_count int;
  v_rate_count int;
begin
  -- 통계 제외 대상(운영자 등)이면 아무 것도 기록하지 않는다.
  if exists (select 1 from analytics_excluded_visitors where visitor_hash = v_visitor_hash) then
    return;
  end if;

  if p_event_type not in ('pageview', 'action') then
    raise exception 'invalid_event_type';
  end if;
  if p_path is null or length(p_path) = 0 or length(p_path) > 500 then
    raise exception 'invalid_path';
  end if;
  if p_event_type = 'action' and (p_event_name is null or length(p_event_name) > 100) then
    raise exception 'invalid_event_name';
  end if;
  if p_session_id is null then
    raise exception 'invalid_session';
  end if;

  select count(*) into v_recent_count
    from analytics_events
    where session_id = p_session_id
      and path = p_path
      and event_type = p_event_type
      and coalesce(event_name, '') = coalesce(p_event_name, '')
      and created_at > now() - interval '3 seconds';
  if v_recent_count > 0 then
    return;
  end if;

  select count(*) into v_rate_count
    from analytics_events
    where visitor_hash = v_visitor_hash and created_at > now() - interval '1 minute';
  if v_rate_count >= 60 then
    return;
  end if;

  insert into analytics_events (
    event_type, event_name, path, referrer, utm_source, utm_medium, utm_campaign,
    session_id, visitor_hash, device_category, meta
  ) values (
    p_event_type, p_event_name, left(p_path, 500), left(p_referrer, 500),
    left(p_utm_source, 100), left(p_utm_medium, 100), left(p_utm_campaign, 100),
    p_session_id, v_visitor_hash, p_device_category, p_meta
  );
end;
$$;

revoke all on function analytics_track_event(
  text, text, text, text, text, text, text, uuid, text, jsonb, text
) from public;
grant execute on function analytics_track_event(
  text, text, text, text, text, text, text, uuid, text, jsonb, text
) to anon, authenticated;

-- ── 3) 체류시간 수집 ─────────────────────────────────────────────────────────
alter table analytics_events add column if not exists duration_ms int;

-- 페이지 이탈/전환 시 그 페이지의 체류시간을 최신 pageview 행에 기록한다.
-- visibilitychange로 여러 번 올 수 있어 누적 최댓값(greatest)으로 갱신한다.
create or replace function analytics_track_dwell(
  p_session_id uuid,
  p_path text,
  p_duration_ms int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_duration_ms is null or p_duration_ms < 0 or p_duration_ms > 3600000 then
    return;  -- 음수/과도값(1시간 초과) 방어
  end if;
  update analytics_events
    set duration_ms = greatest(coalesce(duration_ms, 0), p_duration_ms)
    where id = (
      select id from analytics_events
      where session_id = p_session_id and path = p_path and event_type = 'pageview'
      order by created_at desc
      limit 1
    );
end;
$$;

revoke all on function analytics_track_dwell(uuid, text, int) from public;
grant execute on function analytics_track_dwell(uuid, text, int) to anon, authenticated;

-- ── 4) 페이지별 통합 집계 (방문자 + 체류시간) ────────────────────────────────
create or replace function analytics_page_stats(p_limit int default 50)
returns table (
  path text,
  today_visitors bigint,
  total_visitors bigint,
  total_pageviews bigint,
  median_dwell_ms int
)
language sql
stable
as $$
  select
    path,
    count(distinct visitor_hash) filter (
      where created_at at time zone 'Asia/Seoul' >= date_trunc('day', now() at time zone 'Asia/Seoul')
    ) as today_visitors,
    count(distinct visitor_hash) as total_visitors,
    count(*) as total_pageviews,
    (percentile_cont(0.5) within group (order by duration_ms))::int as median_dwell_ms
  from analytics_events
  where event_type = 'pageview'
  group by path
  order by total_visitors desc
  limit p_limit;
$$;

revoke all on function analytics_page_stats(int) from public;
grant execute on function analytics_page_stats(int) to authenticated;
