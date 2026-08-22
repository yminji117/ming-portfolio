-- MINJI 포트폴리오 — 방명록 5회 실패 잠금 정책 제거
-- 0009_guestbook_functions.sql의 guestbook_verify는 5회 실패 시 10분 잠그는 로직이 있었는데,
-- 이 정책을 없애고 순수 비밀번호 대조만 하도록 단순화한다. guestbook_auth_attempts 테이블/
-- guestbook_auth_status 함수는 더 이상 이 함수에서 쓰지 않지만, 다른 곳에서 참조할 수 있어
-- 안전하게 남겨둔다(삭제하지 않음).
create or replace function guestbook_verify(
  p_id uuid,
  p_password text
)
returns table (ok boolean, content text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text;
  v_content text;
  v_ok boolean;
begin
  select password_hash, guestbook.content into v_hash, v_content
    from guestbook
    where guestbook.id = p_id and deleted_at is null;
  if v_hash is null then
    raise exception 'not_found';
  end if;

  v_ok := (v_hash = crypt(p_password, v_hash));

  return query select v_ok, (case when v_ok then v_content else null end);
end;
$$;

revoke all on function guestbook_verify(uuid, text) from public;
grant execute on function guestbook_verify(uuid, text) to anon, authenticated;
