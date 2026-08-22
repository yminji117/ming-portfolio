-- MINJI 포트폴리오 — 0027에서 놓친 오타 수정
-- 0027의 정규식이 '^\$2[axy]\$'로 되어 있어 "a", "x", "y"만 정규화 대상으로 잡았는데,
-- 정작 bcryptjs가 생성하는 접두사는 "$2b$"였다 — b가 빠져 있어 실제로는 아무 것도
-- 정규화되지 않았다. 문자 클래스에 b를 추가한다.
create or replace function guestbook_verify(
  p_id uuid,
  p_password text
)
returns table (ok boolean, content text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
  v_norm_hash text;
  v_content text;
  v_ok boolean;
begin
  select password_hash, guestbook.content into v_hash, v_content
    from guestbook
    where guestbook.id = p_id and deleted_at is null;
  if v_hash is null then
    raise exception 'not_found';
  end if;

  v_norm_hash := regexp_replace(v_hash, '^\$2[abxy]\$', '$2a$');
  v_ok := (v_norm_hash = crypt(p_password, v_norm_hash));

  return query select v_ok, (case when v_ok then v_content else null end);
end;
$$;

revoke all on function guestbook_verify(uuid, text) from public;
grant execute on function guestbook_verify(uuid, text) to anon, authenticated;
