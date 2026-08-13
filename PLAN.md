# MINJI 포트폴리오 사이트 — 개발 계획

## Context

`PORTFOLIO/PRD.md`에 정의된 기획을 바탕으로 실제 개발을 시작한다. 사용자는 제작 순서를 **Main 페이지 → 다른 메뉴/상세 페이지 → 어드민** 순으로 지정했다. 디자인은 `ref/` 폴더 레퍼런스 중 **concept05(Whirlball Club, 라이트 배경+라임 포인트+그리드 타이포)** 를 기준 톤으로 채택하고, 사용자 확인에 따라 **라이트 베이스 + 라임 포인트 컬러**로 진행한다. 데이터는 **Supabase를 처음부터 연동**하여, 목업 데이터 없이 실제 스키마 위에서 Main부터 어드민까지 재작업 없이 이어간다.

이 계획은 PRD의 상세 스펙(섹션 5~10)을 그대로 구현 대상으로 삼고, "언제 무엇을 만들지"와 "어떤 순서·기준으로 완료를 판단할지"를 정리한 실행 로드맵이다.

---

## 진행 현황

> 마지막 업데이트: 2026.08.13. 작업이 완료될 때마다 이 표의 상태를 갱신합니다. (✅ 완료 / 🔄 진행중 / ⬜ 대기)

| 상태 | 문서/작업 |
| --- | --- |
| ✅ | 기획서(`PRD.md`) 작성 |
| ✅ | 개발 계획서(`PLAN.md`) 작성 |

| # | 작업 | 상태 | 비고 |
| --- | --- | --- | --- |
| 0-1 | Next.js 16 프로젝트 생성 | ✅ 완료 | `npm run dev` 로컬 확인. PRD는 Next 15 기준이었으나 실제 설치본은 16.3.0 — `middleware.ts`→`proxy.ts` 등 일부 차이는 해당 작업 시점에 반영 |
| 0-2 | Supabase 프로젝트 연결 | ✅ 완료 | `.env.local`에 URL/anon key 설정 (service_role key는 Phase 3에서 추가) |
| 0-3 | DB 스키마 마이그레이션 작성 | ✅ 완료 | `supabase/migrations/0001_init.sql`, SQL Editor로 적용·검증 완료 |
| 0-4 | RLS 정책 적용 | ✅ 완료 | `supabase/migrations/0002_rls.sql`. anon의 guestbook 직접 SELECT는 permission denied로 완전 차단 확인 |
| 0-5 | 시드 데이터 입력 | ✅ 완료 | `supabase/seed.sql`. Professional 3 / Side 4 / Study 5 / Currently 6건 확인 |
| 0-6 | 디자인 토큰 및 기본 레이아웃 | ✅ 완료 | 라이트+라임 토큰, Pretendard, 브레이크포인트 반영 |
| 0-7 | Vercel 배포 연결 | ✅ 완료 | https://minji-portfolio-six.vercel.app |
| - | 코드 리뷰 반영 | ✅ 완료 | `0003_fixes.sql`(guestbook 컬럼 잠금, 정원 체크 else, 날짜 제약), `0004_currently_doing_order_fix.sql`(시드 order 값 실수 수정) |
| Phase 1 | Main 페이지 구현 | ✅ 완료 | 전 섹션 실데이터 렌더 + 반응형 4개 뷰포트 + 인터랙션 브라우저 검증 완료 |
| Phase 2 | 하위 페이지 및 상세 페이지 | ⬜ 대기 | |
| Phase 3 | 어드민 구현 | ⬜ 대기 | |

---

## 0. 디자인 토큰 확정 (라이트 베이스)

PRD 2.2의 다크 토큰을 라이트로 교체. `app/globals.css`에 CSS 변수로 정의:

```css
--color-bg:         #FAFAFA
--color-surface:    #FFFFFF
--color-text:       #0A0A0A
--color-text-muted: #6B6B6B
--color-line:       #E5E5E0
--color-accent:     #013DFF   /* 블루 포인트 — concept05 기준 */
--color-accent-ink: #0A0A0A
```
나머지 타이포·spacing·motion 토큰(`--fs-*`, `--section-gap-*`, `--ease-out`, `--dur-*`)은 PRD 2.2 값을 그대로 사용.

---

## Phase 0 — 프로젝트 세팅 ✅ 완료

| # | 상태 | 작업 | 완료 기준 |
| --- | --- | --- | --- |
| 0-1 | ✅ | `PORTFOLIO/` 안에 Next.js 15(App Router) + TypeScript + Tailwind v4 프로젝트 생성 | `npm run dev` 로컬 실행 |
| 0-2 | ✅ | Supabase 프로젝트 생성 (사용자가 계정/프로젝트 직접 생성 필요) + `.env.local`에 URL/anon key/service role key 설정 | 연결 확인 |
| 0-3 | ✅ | PRD 8.2 전 테이블(`projects`, `project_blocks`(단일 jsonb `body` 컬럼 방식, PRD 8.2 대안 채택), `studies`, `study_blocks`→동일하게 `body` jsonb, `about`, `careers`, `skills`, `currently_doing`, `guestbook`, `guestbook_revisions`, `site_settings`, `media`) 마이그레이션 SQL 작성 | 스키마 적용 확인 |
| 0-4 | ✅ | RLS 정책 적용 — 특히 `guestbook`: anon은 INSERT만 가능, SELECT는 `guestbook_public` 뷰(`id, nickname, created_at, updated_at`만)로 제한 | anon 키로 `content` 조회 시도 시 차단 확인 |
| 0-5 | ✅ | 시드 SQL로 각 테이블에 샘플 데이터 입력 (Professional 3, Side 4, Study 5+, Currently Doing 6+, About 1건 등) — Main 화면 작업이 바로 실데이터로 진행되도록 | Supabase 콘솔에서 데이터 확인 |
| 0-6 | ✅ | 디자인 토큰(`globals.css`) + Pretendard 폰트 로드 + 기본 레이아웃(container, grid) 유틸 | 토큰 기반 스타일 동작 |
| 0-7 | ✅ | Vercel 프로젝트 연결 + 프리뷰 배포 | 프리뷰 URL 접속 가능 |

---

## Phase 1 — Main 페이지 (단일 페이지, PRD 5장) ✅ 완료

섹션 순서대로 구현: GNB → Hero → Works(Professional) → Study → Works(Side) → About me → Currently Doing → Footer.

| # | 상태 | 작업 | 참고 | 완료 기준 |
| --- | --- | --- | --- | --- |
| 1-1 | ✅ | 공통 레이아웃: GNB(5.1, sticky+auto-hide, 반응형 햄버거) + Footer(5.8) | PRD 5.1 / 5.8 | 5개 브레이크포인트 검수 |
| 1-2 | ✅ | Hero(5.2): `site_settings`에서 hero_title/video/image 읽기, 영상 우선순위·fallback·`prefers-reduced-motion`·`saveData` 분기 | PRD 5.2, `img/main/hi.mp4` 활용 | 저속 회선 fallback 동작 |
| 1-3 | ✅ | Works Professional(5.3): `projects` where `category=professional AND is_featured` 최대 3, 지그재그 레이아웃 | PRD 5.3 | 3건 노출, 상세 이동(현재는 slug 라우트 미완성이므로 링크만 연결) |
| 1-4 | ✅ | Study(5.4): 최대 5, Desktop 5열/모바일 캐러셀(스크롤 스냅) | PRD 5.4 | 5건 노출 |
| 1-5 | ✅ | Works Side(5.5): 최대 4, 균등 그리드 | PRD 5.5 | 4건 노출 |
| 1-6 | ✅ | About me 요약(5.6): 사진/이름/연혁 최신 3건/cover letter 요약/이메일 복사·인스타 링크 | PRD 5.6 | 이메일 복사 토스트 동작 |
| 1-7 | ✅ | Currently Doing(5.7): 라벨 정렬 규칙, 일자 표기 규칙, 최대 6건 | PRD 5.7 | 라벨 3종 스타일·정렬 정확 — 시드 데이터에 순서값이 잘못 들어가 있던 버그 발견·수정(`0004_currently_doing_order_fix.sql`) |
| 1-8 | ✅ | 섹션 진입 Scroll Reveal (IntersectionObserver, stagger 60ms, 1회성) + reduced-motion 전역 가드 | PRD 2.3 | reduced-motion 시 애니메이션 비활성 확인 |
| 1-9 | ✅ | 빈 상태 처리(콘텐츠 0건 시 섹션 비노출) | PRD 5.0 | 각 섹션 컴포넌트에 0건 시 null 반환 처리 |

**Phase 1 완료 기준**: Main 페이지가 Supabase 실데이터로 전 섹션 렌더, 반응형 4개 뷰포트(1440/1024/768/375) + 햄버거 메뉴 인터랙션까지 Playwright로 실제 브라우저 검증 완료.

---

## Phase 2 — 하위 메뉴 페이지 + 상세 페이지 (PRD 6장, 7장) ⬜ 대기

| # | 상태 | 작업 | 참고 | 완료 기준 |
| --- | --- | --- | --- | --- |
| 2-1 | ⬜ | `/works` 리스트: 탭(Professional/Side, 쿼리스트링), PC 5열 그리드, `[Load more]` 버튼 방식 | PRD 6.1 | 탭 상태 URL 공유 확인 |
| 2-2 | ⬜ | `/works/[slug]` 상세: Hero+Meta+Overview+Body(jsonb 리치텍스트 렌더)+Result+이전/다음 네비 | PRD 6.2 | draft/미존재 slug 404 확인 |
| 2-3 | ⬜ | `/study`, `/study/[slug]`: Works와 동일 그리드 규칙, 외부 링크형 분기 | PRD 6.3 | 외부 링크 새 탭 이동 확인 |
| 2-4 | ⬜ | `/about`: 연혁 타임라인(학교/어학연수/회사), Skills(주사용/사용가능 2단), Cover letter 전문, Currently Doing 전체(`#currently` 앵커) | PRD 6.4 | 앵커 이동 확인 |
| 2-5 | ⬜ | `/here` 방명록 작성(7.2): 500자 카운터, 아이디/비번 유효성, bcrypt 해시 저장 서버 액션, rate limit(60초/1건, 일 10건), 허니팟 | PRD 7.2 | 본문이 응답에 없음(네트워크 탭) ⭐ 필수 검증 |
| 2-6 | ⬜ | `/here` 목록(7.3): 아이디/등록일시/[수정]만 노출, `guestbook_public` 뷰 사용 | PRD 7.3 | RLS로 anon SELECT 차단 재확인 |
| 2-7 | ⬜ | `/here` 수정(7.4): 아이디+비번 서버 검증(bcrypt compare), 세션 10분 유효, 5회 실패 시 10분 잠금, `guestbook_revisions` 스냅샷 | PRD 7.4 | 오인증 시 잠금 동작 확인 |
| 2-8 | ⬜ | 404/에러/빈 상태 공통 페이지 | PRD 12.3 | 전 경로 확인 |

**Phase 2 완료 기준**: 사용자 사이트 전 경로 동작 + 방명록 본문 비공개 요구사항 검증 통과.

---

## Phase 3 — 어드민 (PRD 9장) ⬜ 대기

| # | 상태 | 작업 | 참고 | 완료 기준 |
| --- | --- | --- | --- | --- |
| 3-1 | ⬜ | Supabase Auth 단일 계정 로그인 + `/admin/*` 미들웨어 보호 + 5회 실패 15분 잠금 | PRD 9.1 | 미인증 리다이렉트 확인 |
| 3-2 | ⬜ | `/admin/dashboard`: 노출 정원 경고, 방명록 미읽음 수, 콘텐츠 현황 | PRD 9.3 | 위젯 데이터 정확성 |
| 3-3 | ⬜ | `/admin/works`, `/admin/study`: 목록(필터/검색/일괄작업) + 등록·수정(리치텍스트 에디터, 자동 임시저장 30초, 이미지 업로드+리사이즈) | PRD 9.5 | 등록→Main 반영 E2E |
| 3-4 | ⬜ | `/admin/currently`: 인라인 테이블 편집, 라벨 드롭다운 즉시저장, 종료 리마인드 배너 | PRD 9.6 | 즉시 저장 확인 |
| 3-5 | ⬜ | `/admin/main` ⭐: Professional 3/Study 5/Side 4 정원 관리, 드래그+화살표 순서변경, draft 자동 해제, `revalidatePath('/')` | PRD 9.4 | 정원 초과 차단, 저장 즉시 반영 |
| 3-6 | ⬜ | `/admin/guestbook`: 본문 전문 열람, 필터(미읽음/수정됨/보류/스팸), 수정 이력 비교, 숨김/삭제 | PRD 9.7 | 변경 전후 비교 노출 |
| 3-7 | ⬜ | `/admin/about`, `/admin/settings`: About/연혁/스킬 CRUD, 히어로 미디어 교체, SEO 설정, 점검모드 | PRD 9.8 | 히어로 영상 교체 반영 확인 |
| 3-8 | ⬜ | `/admin/media`, `/admin/trash`: 업로드 자산 관리, soft delete 복구 | PRD 9.2 | 복구 동작 확인 |
| 3-9 | ⬜ | 1024px 미만 접속 시 안내 화면(방명록 열람만 예외) | PRD 9.9 | 모바일 접속 시 안내 노출 |

**Phase 3 완료 기준**: 개발자 개입 없이 신규 프로젝트 1건 등록 → Main 노출까지 10분 이내(PRD 1.2 성공지표).

---

## Cross-cutting (전 Phase 공통, 마무리 단계에서 점검)

- **성능**: LCP 2.5s, CLS 0.1, Lighthouse Mobile 85+ (PRD 10.1)
- **접근성**: WCAG AA, `prefers-reduced-motion`, 키보드 접근, `aria-live` (PRD 10.2)
- **SEO**: 동적 title/description/OG, sitemap/robots(`/admin`,`/here` noindex), JSON-LD Person (PRD 10.3)
- **보안**: 방명록 RLS(최우선), bcrypt, zod 서버 검증, 업로드 MIME/용량 검증, rate limit (PRD 10.4)

## 확정 필요 사항 (해당 작업 착수 전 확인)

PRD 13장 Open Questions는 각 항목이 실제로 필요해지는 시점에 확인한다:
- Phase 1 착수 전: 컬러 베이스(완료: 라이트+라임), 히어로 영상 최종본 준비 여부
- Phase 2-5(방명록) 착수 전: 비밀번호 형식(4자리 숫자 권장값 그대로 진행)
- Phase 2-4(About) 착수 전: `Figma` 오타 확정, Skills 표기
- Phase 3 착수 전: 도메인, 이력서 PDF 제공 여부, 방명록 알림 필요 여부(Phase 3 이후로 이연 가능)

## 검증 방법

- 각 Phase 표의 "완료 기준"을 해당 작업 완료 시점에 로컬(`npm run dev`) + 프리뷰 배포로 직접 확인
- 방명록 본문 비공개는 브라우저 개발자도구 Network 탭에서 응답 페이로드에 `content`/`password_hash`가 없는지 반드시 확인 (PRD 12.1 필수 체크리스트)
- 반응형은 1440/1280/1024/768/375px 5개 뷰포트에서 확인 (PRD 12.2)
- Phase 3 완료 후 PRD 1.2 성공지표(신규 프로젝트 등록 10분 이내) 실측
