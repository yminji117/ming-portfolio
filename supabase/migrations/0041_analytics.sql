-- MINJI 포트폴리오 — Phase 4 방문자 분석 (4a: 스키마 + 수집 파이프라인)
--
-- guestbook_insert(0009_guestbook_functions.sql)와 동일한 신뢰 경계 원칙을 따른다:
-- anon key로 RPC를 직접 호출할 수 있으므로, 악용 방지(rate limit/중복 삽입 방지)와 방문자
-- 식별(IP 해시)은 전부 이 함수 안에서 서버가 직접 처리하고 클라이언트가 넘긴 값을 신뢰하지 않는다.

create or replace function analytics_client_ip_hash()
returns text
language sql
stable
as $$
  select encode(
    digest(
      coalesce(
        nullif(trim(split_part(
          (current_setting('request.headers', true)::json ->> 'x-forwarded-for'),
          ',', 1
        )), ''),
        'unknown'
      ),
      'sha256'
    ),
    'hex'
  );
$$;

create table if not exists analytics_events (
  id bigint generated always as identity primary key,
  event_type text not null check (event_type in ('pageview', 'action')),
  event_name text,
  path text not null,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  session_id uuid not null,
  visitor_hash text not null,
  device_category text,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_type_created_idx
  on analytics_events (event_type, created_at desc);
create index if not exists analytics_events_session_idx
  on analytics_events (session_id, created_at);
create index if not exists analytics_events_path_idx
  on analytics_events (path);

alter table analytics_events enable row level security;

-- anon에게는 정책을 하나도 만들지 않는다 — RLS 기본값(전면 차단)에 맡기고, 쓰기는 오직
-- analytics_track_event RPC(SECURITY DEFINER, RLS 우회)로만 가능하게 한다.
revoke all on analytics_events from anon;

drop policy if exists "admin full access analytics_events" on analytics_events;
create policy "admin full access analytics_events"
  on analytics_events for all to authenticated
  using (true) with check (true);

-- 이벤트 삽입 — 입력 검증 + 짧은 시간 내 동일 이벤트 중복 삽입 방지(React 19 StrictMode 이중
-- effect, 중복 클릭 등) + IP 기준 rate limit(분당 60건) 후 insert.
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

-- 공개 집계 뷰 — 방문자 누구나 볼 수 있는 Front 위젯용. 개별 방문자 정보는 노출하지 않고
-- 숫자 4개(오늘/누적 × 방문자/페이지뷰)만 반환한다. 한국 방문자 기준 KST 자정 경계 사용.
create or replace view analytics_public_stats
with (security_invoker = false) as
select
  count(*) filter (where event_type = 'pageview') as total_pageviews,
  count(distinct visitor_hash) filter (where event_type = 'pageview') as total_visitors,
  count(*) filter (
    where event_type = 'pageview'
      and created_at at time zone 'Asia/Seoul' >= date_trunc('day', now() at time zone 'Asia/Seoul')
  ) as today_pageviews,
  count(distinct visitor_hash) filter (
    where event_type = 'pageview'
      and created_at at time zone 'Asia/Seoul' >= date_trunc('day', now() at time zone 'Asia/Seoul')
  ) as today_visitors
from analytics_events;

grant select on analytics_public_stats to anon, authenticated;
