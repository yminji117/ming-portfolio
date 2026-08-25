-- MINJI 포트폴리오 — 어드민 이미지 업로드용 Storage 버킷 (PRD 9.5/9.2, PLAN.md Phase 3d 조기 착수)
-- Works 썸네일/커버/갤러리부터 시작. 공개 버킷(public URL) — thumbnail_url 등 기존 컬럼들이
-- 이미 순수 공개 URL 문자열이라 그 관례를 그대로 따른다. 파일 형식/용량은 버킷 레벨에서 강제한다.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media public read" on storage.objects;
create policy "media public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

-- 업로드/교체/삭제는 어드민(authenticated)만 — 0002_rls.sql의 "authenticated = 관리자" 전제와 동일.
drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media');

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');
