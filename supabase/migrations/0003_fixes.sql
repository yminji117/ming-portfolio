-- MINJI 포트폴리오 — 코드 리뷰 반영 패치
-- 0001_init.sql / seed.sql은 이미 적용된 원본을 보존하는 대신 이 파일로 실서비스 DB에 수정사항을 적용한다.
-- (0001_init.sql, seed.sql 소스 파일 자체도 향후 신규 환경 세팅을 위해 동일 내용으로 갱신해두었다)

-- 1) [Critical] guestbook INSERT는 RLS with check(true)라 행 단위 허용일 뿐 컬럼 단위 제한이 없다.
--    anon이 is_read/is_hidden/flag/admin_memo 같은 운영자 전용 필드를 임의로 채워 넣을 수 있었다.
--    INSERT 시 항상 안전한 기본값으로 되돌리는 트리거를 추가한다.
create or replace function guestbook_lock_visitor_fields()
returns trigger as $$
begin
  new.is_read := false;
  new.is_hidden := false;
  new.flag := 'normal';
  new.admin_memo := null;
  return new;
end;
$$ language plpgsql;

drop trigger if exists guestbook_lock_visitor_fields on guestbook;
create trigger guestbook_lock_visitor_fields
  before insert on guestbook
  for each row execute function guestbook_lock_visitor_fields();

-- 2) [Medium] enforce_featured_cap의 category CASE에 else가 없어, 향후 enum에 값이 추가되면
--    cap이 NULL이 되어 정원 검사(current_count >= cap)가 조용히 통과(NULL 비교는 false 취급)해버린다.
create or replace function enforce_featured_cap()
returns trigger as $$
declare
  cap int;
  current_count int;
begin
  if new.is_featured is distinct from true then
    return new;
  end if;

  if new.status is distinct from 'published' then
    raise exception 'draft 상태는 is_featured를 설정할 수 없습니다';
  end if;

  if TG_TABLE_NAME = 'projects' then
    cap := case new.category
      when 'professional' then 3
      when 'side' then 4
      else null
    end;
    if cap is null then
      raise exception '알 수 없는 project category: %', new.category;
    end if;
    select count(*) into current_count from projects
      where category = new.category
        and is_featured = true
        and deleted_at is null
        and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000');
  elsif TG_TABLE_NAME = 'studies' then
    cap := 5;
    select count(*) into current_count from studies
      where is_featured = true
        and deleted_at is null
        and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000');
  else
    raise exception 'enforce_featured_cap: 지원하지 않는 테이블 %', TG_TABLE_NAME;
  end if;

  if current_count >= cap then
    raise exception '% 노출 정원(%)을 초과했습니다', TG_TABLE_NAME, cap;
  end if;

  return new;
end;
$$ language plpgsql;

-- 3) [Medium] projects에만 있던 "종료일 < 시작일 금지" 제약을 careers/currently_doing에도 추가
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'careers_date_order') then
    alter table careers add constraint careers_date_order
      check (end_date is null or start_date is null or end_date >= start_date);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'currently_doing_date_order') then
    alter table currently_doing add constraint currently_doing_date_order
      check (end_date is null or start_date is null or end_date >= start_date);
  end if;
end $$;

-- 4) [Low] 시드 방명록 2건의 비밀번호 해시를 PRD 8.2 규격(bcrypt cost 10)으로 재해시
update guestbook set password_hash = crypt('1234', gen_salt('bf', 10))
where nickname in ('minji_friend', 'hong2');
