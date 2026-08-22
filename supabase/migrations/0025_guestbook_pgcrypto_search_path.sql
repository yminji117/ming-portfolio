-- MINJI 포트폴리오 — 방명록 등록 시 "function digest(text, unknown) does not exist" 에러 수정
-- Supabase는 pgcrypto를 public이 아니라 extensions 스키마에 설치한다. 이 두 함수는
-- extensions가 search_path에 없어서 digest()/crypt()를 못 찾고 있었다 —
-- search_path에 extensions를 추가해 어느 스키마에 설치돼 있든 찾을 수 있게 한다.
create or replace function guestbook_client_ip_hash()
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

-- guestbook_verify는 0024에서 재정의됐다(잠금 로직 제거 버전) — 그 정의를 그대로 두고
-- search_path에 extensions만 추가한다.
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
