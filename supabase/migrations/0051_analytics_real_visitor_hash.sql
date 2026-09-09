-- MINJI 포트폴리오 — 방문자 IP 캡처 수정
--
-- 문제: analytics_client_ip_hash()는 current_setting('request.headers')의 x-forwarded-for로
-- 해시하는데, 서버 액션에서 RPC를 호출하면 이 헤더는 브라우저→Vercel이 아니라
-- Vercel→Supabase 요청의 것이라 "브라우저 IP"가 아니라 "Vercel egress IP"가 해시된다.
-- 그래서 방문자 수가 부정확하고 "IP 제외"가 사실상 동작하지 않았다.
--
-- 해결: 서버 액션(Next)의 headers()에서 실제 브라우저 x-forwarded-for를 읽어 SHA-256 해시한
-- 값을 p_visitor_hash로 넘긴다. 추적과 제외가 같은 방식으로 해시하므로 같은 IP는 같은 해시가
-- 되어 제외가 정확히 매칭된다. raw IP는 저장하지 않고 해시만 넘긴다.
--
-- (과거 데이터는 남겨두기로 결정 — 부정확한 채 유지되고, 지금부터의 방문·제외가 정확해진다.)

-- ── 수집 함수: p_visitor_hash 인자 추가 (기존 11-인자 → 12-인자) ────────────────
drop function if exists analytics_track_event(
  text, text, text, text, text, text, text, uuid, text, jsonb, text
);

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
  p_user_agent text,
  p_visitor_hash text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  -- 서버 액션이 넘긴 실제 브라우저 IP 해시를 우선 사용. 없으면(직접 호출 등) 기존 방식으로 폴백.
  -- ponytail: anon도 호출 가능하므로 위조 해시로 방문 수를 부풀릴 여지가 있으나, 포트폴리오
  -- 통계 수준에선 허용. 정확한 봇 방어가 필요하면 서버 서명/검증을 추가.
  v_visitor_hash text := coalesce(nullif(p_visitor_hash, ''), analytics_client_ip_hash());
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
  text, text, text, text, text, text, text, uuid, text, jsonb, text, text
) from public;
grant execute on function analytics_track_event(
  text, text, text, text, text, text, text, uuid, text, jsonb, text, text
) to anon, authenticated;

-- ── 제외 등록 함수: p_visitor_hash 인자 추가 (0050의 1-인자 → 2-인자) ───────────
drop function if exists analytics_exclude_current_visitor(text);

create or replace function analytics_exclude_current_visitor(p_note text, p_visitor_hash text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text := coalesce(nullif(p_visitor_hash, ''), analytics_client_ip_hash());
begin
  insert into analytics_excluded_visitors (visitor_hash, note)
    values (v_hash, nullif(p_note, ''))
    on conflict (visitor_hash) do update set note = excluded.note;
  -- 이 해시로 이미 기록된 방문(수정 이후 쌓인 내 방문)은 삭제. 과거 egress 해시 기록은 매칭 안 됨.
  delete from analytics_events where visitor_hash = v_hash;
  return v_hash;
end;
$$;

revoke all on function analytics_exclude_current_visitor(text, text) from public;
grant execute on function analytics_exclude_current_visitor(text, text) to authenticated;
