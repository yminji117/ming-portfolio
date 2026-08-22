-- MINJI 포트폴리오 — 방명록 등록/수정 시 "column reference ... is ambiguous" 에러 수정
-- guestbook_insert/guestbook_apply_update는 RETURNS TABLE(id, nickname, created_at, ...)로
-- 선언돼 있어, 이 이름들이 PL/pgSQL 출력 파라미터(변수)로도 동시에 존재한다. RETURNING 절에서
-- guestbook.id/guestbook.created_at처럼 테이블명으로 명시해도, PL/pgSQL이 변수와 컬럼 중
-- 무엇을 가리키는지 못 정해 에러가 난다. `#variable_conflict use_column`을 선언해 이런 충돌이
-- 생기면 항상 테이블 컬럼을 우선하도록 명확히 한다.
create or replace function guestbook_insert(
  p_nickname text,
  p_content text,
  p_password_hash text,
  p_user_agent text
)
returns table (id uuid, nickname text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_ip_hash text := guestbook_client_ip_hash();
  v_recent_count int;
  v_daily_count int;
  v_url_count int;
  v_id uuid;
  v_nickname text;
  v_created_at timestamptz;
begin
  if p_nickname is null or p_nickname !~ '^[A-Za-z0-9가-힣_]{2,12}$' then
    raise exception 'invalid_nickname';
  end if;
  if p_content is null or length(p_content) = 0 or length(p_content) > 500 then
    raise exception 'invalid_content';
  end if;
  if p_password_hash is null or length(p_password_hash) = 0 then
    raise exception 'invalid_password';
  end if;

  select count(*) into v_recent_count
    from guestbook
    where ip_hash = v_ip_hash and created_at > now() - interval '60 seconds';
  if v_recent_count > 0 then
    raise exception 'rate_limited_short';
  end if;

  select count(*) into v_daily_count
    from guestbook
    where ip_hash = v_ip_hash and created_at > now() - interval '1 day';
  if v_daily_count >= 10 then
    raise exception 'rate_limited_daily';
  end if;

  insert into guestbook (nickname, content, password_hash, ip_hash, user_agent)
  values (p_nickname, p_content, p_password_hash, v_ip_hash, p_user_agent)
  returning guestbook.id, guestbook.nickname, guestbook.created_at
    into v_id, v_nickname, v_created_at;

  v_url_count := (select count(*) from regexp_matches(p_content, 'https?://', 'g'));
  if v_url_count >= 3 then
    update guestbook set flag = 'hold' where guestbook.id = v_id;
  end if;

  return query select v_id, v_nickname, v_created_at;
end;
$$;

revoke all on function guestbook_insert(text, text, text, text) from public;
grant execute on function guestbook_insert(text, text, text, text) to anon, authenticated;

create or replace function guestbook_apply_update(
  p_id uuid,
  p_password text,
  p_content text
)
returns table (id uuid, nickname text, created_at timestamptz, updated_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_ok boolean;
  v_old_content text;
begin
  if p_content is null or length(p_content) = 0 or length(p_content) > 500 then
    raise exception 'invalid_content';
  end if;

  select v.ok into v_ok from guestbook_verify(p_id, p_password) v;
  if not v_ok then
    raise exception 'invalid_credentials';
  end if;

  select content into v_old_content
    from guestbook
    where guestbook.id = p_id and deleted_at is null;
  if v_old_content is null then
    raise exception 'not_found';
  end if;

  insert into guestbook_revisions (guestbook_id, prev_content)
    values (p_id, v_old_content);

  return query
    update guestbook
    set content = p_content, updated_at = now()
    where guestbook.id = p_id
    returning guestbook.id, guestbook.nickname, guestbook.created_at, guestbook.updated_at;
end;
$$;

revoke all on function guestbook_apply_update(uuid, text, text) from public;
grant execute on function guestbook_apply_update(uuid, text, text) to anon, authenticated;
