-- MINJI 포트폴리오 — analytics_client_ip_hash()의 "function digest(text, unknown) does not exist" 수정
-- guestbook_client_ip_hash()가 0025에서 겪은 것과 동일한 문제: Supabase는 pgcrypto를 public이
-- 아니라 extensions 스키마에 설치한다. search_path에 extensions를 추가해 digest()를 찾게 한다.
create or replace function analytics_client_ip_hash()
returns text
language sql
stable
set search_path = public, extensions
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
