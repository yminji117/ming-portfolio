-- MINJI 포트폴리오 — 방명록 삭제 RPC (Figma '최종' 시안: 각 글 "수정 | 삭제")
-- guestbook.deleted_at은 이미 존재하고 guestbook_public 뷰가 deleted_at is null로
-- 걸러내므로, 실제 row 삭제 대신 soft delete로 처리한다(0009_guestbook_functions.sql의
-- guestbook_apply_update와 동일한 비밀번호 재검증 패턴을 그대로 따른다).
create or replace function guestbook_apply_delete(
  p_id uuid,
  p_password text
)
returns table (id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ok boolean;
  v_exists boolean;
begin
  select v.ok into v_ok from guestbook_verify(p_id, p_password) v;
  if not v_ok then
    raise exception 'invalid_credentials';
  end if;

  select true into v_exists
    from guestbook
    where guestbook.id = p_id and deleted_at is null;
  if v_exists is null then
    raise exception 'not_found';
  end if;

  update guestbook
    set deleted_at = now()
    where guestbook.id = p_id;

  return query select p_id;
end;
$$;

revoke all on function guestbook_apply_delete(uuid, text) from public;
grant execute on function guestbook_apply_delete(uuid, text) to anon, authenticated;
