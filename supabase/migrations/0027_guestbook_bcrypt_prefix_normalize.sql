-- MINJI 포트폴리오 — 방명록 비밀번호 확인 시 정상 비밀번호도 항상 불일치로 나오는 문제 수정
-- 앱(src/app/here/actions.ts)은 bcryptjs로 비밀번호를 해싱하는데, bcryptjs는 "$2b$" 접두사로
-- 해시를 생성한다. 반면 Supabase의 pgcrypto crypt()는 "$2b$"를 인식하지 못해 항상 다른 값을
-- 반환하므로, v_hash = crypt(p_password, v_hash) 비교가 정확한 비밀번호를 넣어도 절대 참이 될
-- 수 없었다 — 즉 등록 이후 수정/삭제가 전부 불가능한 상태였다.
-- "$2a$"/"$2b$"/"$2y$"는 짧은 비밀번호(72바이트 미만)에 한해 알고리즘 결과가 동일하므로,
-- 비교 직전에 저장된 해시와 crypt()에 넘기는 솔트 양쪽 모두를 "$2a$"로 정규화해 비교한다.
-- 이렇게 하면 앱 코드를 건드리지 않고도, 이미 저장된 해시의 접두사와 무관하게 항상 정확히
-- 검증된다.
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

  v_norm_hash := regexp_replace(v_hash, '^\$2[axy]\$', '$2a$');
  v_ok := (v_norm_hash = crypt(p_password, v_norm_hash));

  return query select v_ok, (case when v_ok then v_content else null end);
end;
$$;

revoke all on function guestbook_verify(uuid, text) from public;
grant execute on function guestbook_verify(uuid, text) to anon, authenticated;
