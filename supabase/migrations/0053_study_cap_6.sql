-- Study 메인 노출 정원 변경: 4 → 6 (src/lib/featured-caps.ts의 FEATURED_CAP_STUDY와 반드시 같은 값이어야 한다)

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
      when 'professional' then 5
      when 'side' then 2
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
    cap := 6;
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
