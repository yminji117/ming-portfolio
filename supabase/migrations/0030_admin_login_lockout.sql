-- MINJI 포트폴리오 — 어드민 로그인 브루트포스 방지 (PRD 9.1, PLAN.md 3-1)
-- IP 기준 5회 실패 시 15분 잠금. IP 추출은 guestbook_client_ip_hash()를 그대로 재사용한다
-- (0025_guestbook_pgcrypto_search_path.sql에서 정의, 방명록 전용 로직이 아니라 범용 함수).

create table admin_login_attempts (
  ip_hash text primary key,
  fail_count int not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table admin_login_attempts enable row level security;
-- anon/authenticated 정책을 두지 않는다 — 아래 SECURITY DEFINER RPC로만 접근 가능

create or replace function admin_login_guard()
returns table (allowed boolean, locked_until timestamptz)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_ip_hash text := guestbook_client_ip_hash();
  v_locked_until timestamptz;
begin
  select admin_login_attempts.locked_until into v_locked_until
    from admin_login_attempts
    where admin_login_attempts.ip_hash = v_ip_hash;

  if v_locked_until is not null and v_locked_until > now() then
    return query select false, v_locked_until;
  else
    return query select true, null::timestamptz;
  end if;
end;
$$;

revoke all on function admin_login_guard() from public;
grant execute on function admin_login_guard() to anon, authenticated;

create or replace function admin_login_record_attempt(p_success boolean)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_ip_hash text := guestbook_client_ip_hash();
  v_fail_count int;
begin
  if p_success then
    delete from admin_login_attempts where admin_login_attempts.ip_hash = v_ip_hash;
    return;
  end if;

  insert into admin_login_attempts (ip_hash, fail_count, updated_at)
    values (v_ip_hash, 1, now())
  on conflict (ip_hash) do update
    set fail_count = admin_login_attempts.fail_count + 1,
        updated_at = now()
  returning admin_login_attempts.fail_count into v_fail_count;

  if v_fail_count >= 5 then
    update admin_login_attempts
      set locked_until = now() + interval '15 minutes'
      where admin_login_attempts.ip_hash = v_ip_hash;
  end if;
end;
$$;

revoke all on function admin_login_record_attempt(boolean) from public;
grant execute on function admin_login_record_attempt(boolean) to anon, authenticated;
