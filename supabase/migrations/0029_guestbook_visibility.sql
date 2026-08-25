-- MINJI 포트폴리오 — 방명록 작성 시 공개/비공개 선택 기능
-- 지금까지는 모든 글의 content가 항상 비공개(비밀번호 확인 후에만 열람)였다.
-- 작성 시 "비공개로 작성" 체크를 해제하면 guestbook_public 뷰에서 content를 바로 노출한다.
-- 기존 글은 전부 is_private=true로 채워져 지금까지의 동작(항상 비공개)을 그대로 유지한다.

alter table guestbook add column is_private boolean not null default true;

create or replace view guestbook_public
with (security_invoker = false) as
  select
    id,
    nickname,
    created_at,
    updated_at,
    is_private,
    case when is_private then null else content end as content
  from guestbook
  where is_hidden = false and deleted_at is null
  order by created_at desc;

grant select on guestbook_public to anon, authenticated;

-- guestbook_insert: 파라미터 목록이 바뀌므로(4개 → 5개) create or replace 대신
-- 이전 4-인자 오버로드를 drop하고 새로 만든다. 로직은 0026과 동일하며 is_private만 추가.
drop function if exists guestbook_insert(text, text, text, text);

create function guestbook_insert(
  p_nickname text,
  p_content text,
  p_password_hash text,
  p_user_agent text,
  p_is_private boolean default true
)
returns table (id uuid, nickname text, created_at timestamptz, is_private boolean)
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
  v_is_private boolean;
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

  insert into guestbook (nickname, content, password_hash, ip_hash, user_agent, is_private)
  values (p_nickname, p_content, p_password_hash, v_ip_hash, p_user_agent, coalesce(p_is_private, true))
  returning guestbook.id, guestbook.nickname, guestbook.created_at, guestbook.is_private
    into v_id, v_nickname, v_created_at, v_is_private;

  v_url_count := (select count(*) from regexp_matches(p_content, 'https?://', 'g'));
  if v_url_count >= 3 then
    update guestbook set flag = 'hold' where guestbook.id = v_id;
  end if;

  return query select v_id, v_nickname, v_created_at, v_is_private;
end;
$$;

revoke all on function guestbook_insert(text, text, text, text, boolean) from public;
grant execute on function guestbook_insert(text, text, text, text, boolean) to anon, authenticated;
