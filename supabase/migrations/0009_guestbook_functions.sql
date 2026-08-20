-- MINJI 포트폴리오 — 방명록 RPC 함수 (PRD 7.2/7.4)
--
-- ⚠️ 신뢰 경계 주의: Supabase는 anon에 EXECUTE 권한이 부여된 함수를 PostgREST로 그대로 노출한다.
-- 즉 이 함수들은 Next.js Server Action을 거치지 않고도 공개된 anon key만으로 누구나 직접 호출할 수 있다.
-- 그래서 도배 방지·비밀번호 검증·잠금 로직은 전부 이 파일(DB) 안에서 자체 완결되어야 하며,
-- 클라이언트가 넘기는 값(과거 초안의 p_ip_hash 파라미터 등)을 rate limit/잠금 판단에 신뢰해서는 안 된다.
-- IP는 PostgREST가 세팅하는 request.headers GUC에서 서버가 직접 추출한다(클라이언트가 위조 불가).
--
-- 0002_rls.sql은 anon의 guestbook 직접 SELECT/UPDATE를 전면 차단하지만, INSERT는 anon에게 열려 있었다
-- (guestbook_insert RPC를 만들기 전 설계). 이제 작성은 반드시 guestbook_insert RPC로만 하도록
-- 그 직접 INSERT 정책을 닫는다 — 그렇지 않으면 도배 방지 로직 자체가 무의미해진다.
drop policy if exists "anyone can insert guestbook entry" on guestbook;

-- 요청 헤더에서 클라이언트 IP를 뽑아 해시로만 저장 — 원본 IP는 어디에도 남기지 않는다.
-- request.headers가 없는 컨텍스트(SQL Editor 직접 실행 등)에서도 에러 없이 'unknown'으로 처리한다.
create or replace function guestbook_client_ip_hash()
returns text
language sql
stable
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

-- 인증 시도 잠금 상태 — 5회 실패 시 10분 잠금(글 + IP 기준, PRD 7.4)
create table if not exists guestbook_auth_attempts (
  guestbook_id uuid not null references guestbook (id) on delete cascade,
  ip_hash text not null,
  fail_count int not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now(),
  primary key (guestbook_id, ip_hash)
);

alter table guestbook_auth_attempts enable row level security;
-- anon/authenticated 모두 이 테이블을 직접 SELECT/INSERT할 수 없다 — 아래 SECURITY DEFINER
-- 함수만 값을 읽고 쓴다. (정책을 하나도 만들지 않으면 RLS가 모든 접근을 기본 차단한다.)

-- 작성 — 도배 방지(60초/1건, 하루 10건) 확인 후 삽입, URL 3개 이상이면 'hold'로 보류 처리.
-- nickname/content 형식도 여기서 한 번 더 검증한다(Node 레이어 우회 대비 방어적 이중 검증).
-- guestbook_lock_visitor_fields 트리거가 INSERT 시 flag를 항상 'normal'로 되돌리므로,
-- 스팸으로 판단되면 삽입 직후 별도 UPDATE로 'hold'를 붙인다(트리거는 INSERT에만 걸려 있음).
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

-- 비밀번호 검증 — bcrypt(pgcrypto crypt) 대조. 5회 실패 시 10분 잠금, 성공하면 실패 카운트 초기화.
-- IP는 클라이언트가 아니라 서버가 request.headers에서 직접 뽑으므로, RPC를 직접 호출해도
-- 매 호출마다 IP를 바꿔 잠금을 우회할 수 없다.
-- PRD 7.4 "아이디+비밀번호 일치 → 본문 노출"에 따라 성공 시에만 content를 함께 반환한다
-- (실패 시 ok=false, content=null — 대조 실패 응답에 본문이 실려나가는 일이 없다).
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
  v_ip_hash text := guestbook_client_ip_hash();
  v_hash text;
  v_content text;
  v_locked_until timestamptz;
  v_fail_count int;
  v_ok boolean;
begin
  select locked_until, fail_count into v_locked_until, v_fail_count
    from guestbook_auth_attempts
    where guestbook_id = p_id and ip_hash = v_ip_hash;

  if v_locked_until is not null and v_locked_until > now() then
    raise exception 'locked';
  end if;

  select password_hash, guestbook.content into v_hash, v_content
    from guestbook
    where guestbook.id = p_id and deleted_at is null;
  if v_hash is null then
    raise exception 'not_found';
  end if;

  v_ok := (v_hash = crypt(p_password, v_hash));

  if v_ok then
    delete from guestbook_auth_attempts
      where guestbook_id = p_id and ip_hash = v_ip_hash;
  else
    insert into guestbook_auth_attempts (guestbook_id, ip_hash, fail_count, locked_until, updated_at)
      values (p_id, v_ip_hash, 1, null, now())
      on conflict (guestbook_id, ip_hash) do update
        set fail_count = case
              -- 잠금이 이미 풀린 뒤의 실패라면 새로 카운트를 시작한다(풀리자마자 1회 실패로
              -- 바로 재잠금되지 않도록). 잠금 중 실패는 계속 누적한다.
              when guestbook_auth_attempts.locked_until is not null
                   and guestbook_auth_attempts.locked_until <= now()
                then 1
              else guestbook_auth_attempts.fail_count + 1
            end,
            locked_until = case
              when (
                case
                  when guestbook_auth_attempts.locked_until is not null
                       and guestbook_auth_attempts.locked_until <= now()
                    then 1
                  else guestbook_auth_attempts.fail_count + 1
                end
              ) >= 5 then now() + interval '10 minutes'
              else null
            end,
            updated_at = now();
  end if;

  return query select v_ok, (case when v_ok then v_content else null end);
end;
$$;

revoke all on function guestbook_verify(uuid, text) from public;
grant execute on function guestbook_verify(uuid, text) to anon, authenticated;

-- 남은 시도 횟수 조회용 — 잠김 여부와 실패 횟수만 반환(내용/해시 없음)
create or replace function guestbook_auth_status(
  p_id uuid
)
returns table (fail_count int, locked_until timestamptz)
language sql
security definer
set search_path = public
as $$
  select coalesce(a.fail_count, 0), a.locked_until
    from (select p_id as id) target
    left join guestbook_auth_attempts a
      on a.guestbook_id = target.id and a.ip_hash = guestbook_client_ip_hash();
$$;

revoke all on function guestbook_auth_status(uuid) from public;
grant execute on function guestbook_auth_status(uuid) to anon, authenticated;

-- 수정 — 비밀번호를 이 함수 안에서 다시 검증한 뒤(guestbook_verify 재사용)에만 본문을 교체한다.
-- Next.js의 서명 쿠키(10분 세션)는 앱 레이어의 UX 편의일 뿐 신뢰 경계가 아니므로, 실제 쓰기 권한은
-- 매번 이 DB 재검증으로 결정된다 — RPC를 직접 호출해도 올바른 비밀번호 없이는 절대 덮어쓸 수 없다.
-- 이전 본문은 guestbook_revisions에 스냅샷으로 남긴다.
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
