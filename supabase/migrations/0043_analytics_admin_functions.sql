-- MINJI 포트폴리오 — Phase 4 방문자 분석 (4b: 어드민 상세 대시보드용 집계 함수 5종)
--
-- authenticated(관리자) 롤은 0041에서 이미 analytics_events 전체 SELECT 권한을 갖고 있으므로,
-- 아래 함수들은 SECURITY DEFINER가 아니라 invoker 보안(기본값)으로 둔다 — 별도 권한 우회 경로를
-- 만들 필요가 없다(최소 권한 원칙).

-- 인기 페이지
create or replace function analytics_top_pages(p_since timestamptz, p_limit int default 10)
returns table (path text, pageviews bigint)
language sql stable as $$
  select path, count(*) as pageviews
  from analytics_events
  where event_type = 'pageview' and created_at >= p_since
  group by path
  order by pageviews desc
  limit p_limit;
$$;

-- 액션
create or replace function analytics_top_actions(p_since timestamptz, p_limit int default 10)
returns table (event_name text, action_count bigint)
language sql stable as $$
  select event_name, count(*) as action_count
  from analytics_events
  where event_type = 'action' and created_at >= p_since
  group by event_name
  order by action_count desc
  limit p_limit;
$$;

-- 유입 경로: 세션의 첫 pageview 행 기준(첫 접점의 referrer/utm이 세션의 "출처")
create or replace function analytics_traffic_sources(p_since timestamptz, p_limit int default 10)
returns table (source text, sessions bigint)
language sql stable as $$
  with first_hit as (
    select distinct on (session_id) session_id, referrer, utm_source
    from analytics_events
    where event_type = 'pageview' and created_at >= p_since
    order by session_id, created_at asc
  )
  select
    coalesce(
      nullif(utm_source, ''),
      nullif(regexp_replace(referrer, '^https?://([^/]+).*', '\1'), ''),
      'direct'
    ) as source,
    count(*) as sessions
  from first_hit
  group by source
  order by sessions desc
  limit p_limit;
$$;

-- 이탈 지점: 세션의 마지막 pageview 행 기준(sendBeacon 없이 쓸 수 있는 근사법)
create or replace function analytics_exit_pages(p_since timestamptz, p_limit int default 10)
returns table (path text, exits bigint)
language sql stable as $$
  with last_hit as (
    select distinct on (session_id) session_id, path
    from analytics_events
    where event_type = 'pageview' and created_at >= p_since
    order by session_id, created_at desc
  )
  select path, count(*) as exits
  from last_hit
  group by path
  order by exits desc
  limit p_limit;
$$;

-- 페이지뷰 추세 (일별, KST 기준)
create or replace function analytics_daily_pageviews(p_days int default 14)
returns table (day date, pageviews bigint, unique_visitors bigint)
language sql stable as $$
  select
    (created_at at time zone 'Asia/Seoul')::date as day,
    count(*) as pageviews,
    count(distinct visitor_hash) as unique_visitors
  from analytics_events
  where event_type = 'pageview'
    and created_at >= now() - (p_days || ' days')::interval
  group by day
  order by day;
$$;

revoke all on function analytics_top_pages(timestamptz, int) from public;
revoke all on function analytics_top_actions(timestamptz, int) from public;
revoke all on function analytics_traffic_sources(timestamptz, int) from public;
revoke all on function analytics_exit_pages(timestamptz, int) from public;
revoke all on function analytics_daily_pageviews(int) from public;
grant execute on function analytics_top_pages(timestamptz, int) to authenticated;
grant execute on function analytics_top_actions(timestamptz, int) to authenticated;
grant execute on function analytics_traffic_sources(timestamptz, int) to authenticated;
grant execute on function analytics_exit_pages(timestamptz, int) to authenticated;
grant execute on function analytics_daily_pageviews(int) to authenticated;
