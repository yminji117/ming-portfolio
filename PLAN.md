# MINJI 포트폴리오 사이트 — 개발 계획

## Context

`PORTFOLIO/PRD.md`에 정의된 기획을 바탕으로 실제 개발을 시작한다. 사용자는 제작 순서를 **Main 페이지 → 다른 메뉴/상세 페이지 → 어드민** 순으로 지정했다. 디자인은 `ref/` 폴더 레퍼런스 중 **concept05(Whirlball Club, 라이트 배경+라임 포인트+그리드 타이포)** 를 기준 톤으로 채택하고, 사용자 확인에 따라 **라이트 베이스 + 라임 포인트 컬러**로 진행한다. 데이터는 **Supabase를 처음부터 연동**하여, 목업 데이터 없이 실제 스키마 위에서 Main부터 어드민까지 재작업 없이 이어간다.

이 계획은 PRD의 상세 스펙(섹션 5~10)을 그대로 구현 대상으로 삼고, "언제 무엇을 만들지"와 "어떤 순서·기준으로 완료를 판단할지"를 정리한 실행 로드맵이다.

---

## 진행 현황

> 마지막 업데이트: 2026.08.21. 작업이 완료될 때마다 이 표의 상태를 갱신합니다. (✅ 완료 / 🔄 진행중 / ⬜ 대기)

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
| - | Figma '최종' 메인 디자인 반영 | ✅ 완료 | 블랙/화이트+블루 톤 리뉴얼, Works Professional industry 필터(하이라이트 방식) 추가, Study 로드맵 카드(단계 입력 시) 신설, 노출 정원 변경(Professional 5/Study 4/Side 2). `0005_industry_and_caps.sql` 작성 완료 — **Supabase SQL Editor에서 아직 미적용, 적용 전까지는 필터 칩·로드맵 카드·5/4/2 정원이 화면에 나타나지 않음**(쿼리 limit은 이미 반영되어 있어 기존 데이터 내에서는 정상 축소 노출됨) |
| Phase 2 | 하위 페이지 및 상세 페이지 | 🔄 구현 완료, 마이그레이션 적용 대기 | `/works`, `/works/[slug]`, `/study`, `/study/[slug]`, `/about`, `/here`(방명록) 전부 구현·빌드·라우트 렌더링 확인 완료. **방명록 작성/인증/수정은 `0009_guestbook_functions.sql`을 Supabase SQL Editor에서 적용해야 동작**(RPC 함수 미존재 상태) — 적용 전까지는 목록 조회만 가능. `.env.local`에 `GUESTBOOK_SESSION_SECRET` 로컬용 자동 생성 완료, **Vercel에도 별도 값으로 등록 필요** |
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
치며
## Phase 0 — 프로젝트 세팅 ✅ 완
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
| 1-3 | ✅ | Works Professional(5.3): `projects` where `category=professional AND is_featured` 최대 5, industry 필터(선택 시 매칭 카드만 화이트 하이라이트, `all`은 전체 블랙) | PRD 5.3, Figma '최종' 반영 | 5건 노출, 필터 인터랙션 동작(마이그레이션 적용 후) |
| 1-4 | ✅ | Study(5.4): 최대 4, `body.steps` 있으면 로드맵 카드 / 없으면 플랫 행 | PRD 5.4, Figma '최종' 반영 | 4건 노출 |
| 1-5 | ✅ | Works Side(5.5): 최대 2, 대형 카드 2열 | PRD 5.5, Figma '최종' 반영 | 2건 노출 |
| 1-6 | ✅ | About me 요약(5.6): 사진/이름/연혁 최신 3건/cover letter 요약/이메일 복사·인스타 링크 | PRD 5.6 | 이메일 복사 토스트 동작 |
| 1-7 | ✅ | Currently Doing(5.7): 라벨 정렬 규칙, 일자 표기 규칙, 최대 6건 | PRD 5.7 | 라벨 3종 스타일·정렬 정확 — 시드 데이터에 순서값이 잘못 들어가 있던 버그 발견·수정(`0004_currently_doing_order_fix.sql`) |
| 1-8 | ✅ | 섹션 진입 Scroll Reveal (IntersectionObserver, stagger 60ms, 1회성) + reduced-motion 전역 가드 | PRD 2.3 | reduced-motion 시 애니메이션 비활성 확인 |
| 1-9 | ✅ | 빈 상태 처리(콘텐츠 0건 시 섹션 비노출) | PRD 5.0 | 각 섹션 컴포넌트에 0건 시 null 반환 처리 |

**Phase 1 완료 기준**: Main 페이지가 Supabase 실데이터로 전 섹션 렌더, 반응형 4개 뷰포트(1440/1024/768/375) + 햄버거 메뉴 인터랙션까지 Playwright로 실제 브라우저 검증 완료.

---

## Phase 2 — 하위 메뉴 페이지 + 상세 페이지 (PRD 6장, 7장) 🔄 구현 완료, 마이그레이션 적용 대기

| # | 상태 | 작업 | 참고 | 완료 기준 |
| --- | --- | --- | --- | --- |
| 2-1 | ✅ | `/works` 리스트: 탭(Professional/Side, 쿼리스트링), PC 5열 그리드, `[Load more]` 버튼 방식 | PRD 6.1 | 탭 상태 URL 공유 확인 완료 |
| 2-2 | ✅ | `/works/[slug]` 상세: Hero+Meta+Overview+Body(jsonb 리치텍스트 렌더)+Result+이전/다음 네비 | PRD 6.2 | draft/미존재 slug 접근 시 not-found UI + `noindex` 확인(Next.js 16 스트리밍 특성상 HTTP 상태 자체는 200 — 공식 문서 권장 동작, 아래 참고) |
| 2-3 | ✅ | `/study`, `/study/[slug]`: Works와 동일 그리드 규칙, 외부 링크형 분기 | PRD 6.3 | 외부 링크형은 `/study/[slug]` 직접 접근 시 서버에서 원문으로 redirect 확인 |
| 2-4 | ✅ | `/about`: 연혁 타임라인(학교/어학연수/회사, 라벨 필터), Skills(주사용/사용가능 2단), Cover letter 전문, Currently Doing 전체(`#currently` 앵커, 라벨 필터) | PRD 6.4 | 앵커/필터 렌더링 확인 완료 |
| 2-5 | ✅ | `/here` 방명록 작성(7.2): 500자 카운터, 아이디/비번 유효성, bcrypt 해시 저장 서버 액션, rate limit(60초/1건, 일 10건), 허니팟 | PRD 7.2 | UI/유효성 검증 완료. **RPC(`guestbook_insert`) 미적용 상태라 실제 등록은 마이그레이션 적용 후 확인 필요** |
| 2-6 | ✅ | `/here` 목록(7.3): 아이디/등록일시/[수정]만 노출, `guestbook_public` 뷰 사용 | PRD 7.3 | 실데이터로 본문/해시 응답에 없음(네트워크 탭) 확인 완료 ⭐ 필수 검증 통과 |
| 2-7 | ✅ | `/here` 수정(7.4): 아이디+비번 서버 검증(pgcrypto bcrypt compare, SECURITY DEFINER RPC), 세션 10분(서명 쿠키), 5회 실패 시 10분 잠금, `guestbook_revisions` 스냅샷 | PRD 7.4 | UI 완료. **RPC(`guestbook_verify`/`guestbook_apply_update`) 미적용 상태라 실제 인증/수정은 마이그레이션 적용 후 확인 필요** |
| 2-8 | ✅ | 404/에러/빈 상태 공통 페이지 | PRD 12.3 | 루트 `not-found.tsx`(실제 404 상태 확인)/`error.tsx` + 각 리스트 빈 상태 확인 완료 |

**⚠️ 적용 필요**: `supabase/migrations/0009_guestbook_functions.sql`을 Supabase SQL Editor에서 실행해야 방명록 작성/비밀번호 확인/수정이 동작합니다(RLS상 anon이 guestbook을 직접 읽을 수 없어 SECURITY DEFINER RPC로 우회). 로컬 `.env.local`에는 세션 서명용 `GUESTBOOK_SESSION_SECRET`을 자동 생성해 넣어뒀고, **Vercel 배포본에는 별도로(다른 값으로) Production/Preview 환경변수 등록이 필요**합니다. bcryptjs 패키지가 새로 추가되었습니다.

**코드 리뷰 반영(2026.08.21)**: anon key로 RPC를 직접 호출해 도배 방지·잠금·비밀번호 검증을 우회할 수 있는 Critical 3건을 발견해 마이그레이션 미적용 상태에서 수정 완료 — ① `guestbook` 직접 INSERT RLS 정책 제거(작성은 RPC로만), ② IP를 클라이언트 파라미터 대신 서버가 요청 헤더에서 직접 추출(스푸핑으로 rate limit/잠금 우회 불가), ③ 수정 저장 시 서명 쿠키뿐 아니라 비밀번호를 DB에서 다시 검증하도록 변경.

**참고**: Next.js 16에서는 `loading.tsx`(Suspense)가 걸린 라우트에서 `notFound()`를 호출하면 응답이 이미 스트리밍을 시작한 뒤라 HTTP 상태가 200으로 남고 `<meta name="robots" content="noindex">`만 자동 삽입됩니다(공식 문서상 정상 동작 — 검색엔진 색인은 차단됨). 완전히 존재하지 않는 경로(`/nonexistent-route` 등)는 라우팅 단계에서 걸러지므로 정상적으로 404 상태가 반환됩니다.

**Phase 2 완료 기준**: 사용자 사이트 전 경로 동작 + 방명록 본문 비공개 요구사항 검증 통과 — **마이그레이션 적용 후 방명록 작성/수정 E2E 확인 필요**.

**Works 페이지 디자인 재작업(2026.08.22, 페이지별 병렬 리디자인 1건째)**: Figma '최종' 페이지의 `/works` 리스트(229:212/229:355 데스크탑, 229:849/231:2461 모바일)·`/works/[slug]` 상세(229:133 데스크탑) 프레임을 기준으로 카드·필터 칩·상세 레이아웃을 전면 재작업. 리스트는 Professional/Side 두 탭 모두 라이트 톤 필터 칩(흰 배경/검은 active 필)을 새로 갖췄고(기존 Main 전용 어두운 칩과는 별도 컴포넌트), 카드는 16:9 썸네일+기간+제목+요약+태그 2개로 교체. 상세는 풀블리드 히어로를 컨테이너 폭 안 200px 둥근 박스로 교체하고 "목록"(원래 "목록으로")을 상단 pill 버튼으로 이동, 이전/다음 네비를 좌우 끝 정렬로 수정. **`supabase/migrations/0010_project_detail_fields.sql`(스키마) + `0011_project_demo_content.sql`(데모 데이터)를 이미 Supabase SQL Editor에 적용 완료** — `projects`에 `contribution_percent`/`role_note`/`main_tasks`/`retrospective`/`gallery_urls` 5개 컬럼 추가, Side 프로젝트 industry(Community/Popup/Online/Offline) 백필. IMAGE 갤러리는 데스크탑 가로 캐러셀(글라스 화살표, 스와이프 가능, 더 넘길 방향에 콘텐츠 있을 때만 화살표 페이드인/아웃) / 모바일은 기본 3장+펼치기·접기 화살표로 완전히 다른 인터랙션(`src/components/project-gallery.tsx`, `lg` 기준 분기). 모바일 상세 프레임은 Figma에 없어서 dev 서버를 `generate_figma_design`으로 캡처해 새로 만들어 넣음(node-id=246-158, 데스크탑 상세 프레임 옆에 배치).

**Study 페이지 디자인 재작업(2026.08.22)**: `/study` 리스트(229:443 데스크탑, 229:979 모바일)는 Works와 다른 가로형 카드(이미지 좌/본문 우, 회색 테두리)로 확정돼 있어 그대로 반영 — 그리드도 Works(최대 4~5열)와 달리 1열(모바일)/2열(태블릿 이상)까지만. 필터 칩은 태그 배열 기반(`study.tags.includes()`)이라 Works의 단일 industry 필터와 달리 다중 선택 가능한 데이터 특성을 반영. `/study/[slug]` 상세(229:539)는 **아직 Figma에서 손대지 않은, Works 상세를 복붙한 채 남은 프레임**(하단 네비에 "Professional 프로젝트 0/2" 같은 잔재 문구 확인)이라 새 필드(기여도 등)는 추가하지 않고, 이미 확정된 Works 상세의 레이아웃 수정(목록 버튼 위치·간격, 제목 크기, 이전/다음 네비 좌우 정렬)만 동일하게 적용. 대신 기존에 있던 `thumbnail_url`을 메타 컬럼 썸네일로 추가 노출(신규 필드 아님). About/방명록 페이지는 이번 작업 범위 밖.

---

## Phase 3 — 어드민 (PRD 9장) 🔄 진행 중 — 3a 완료, 3b 진행 중

**설계 확정(2026.08.25)**: DB `0002_rls.sql`이 이미 `authenticated` 롤에 전 테이블 `for all` 권한을 부여해 "단일 관리자 계정" 전제로 설계돼 있었음(지금까지는 로그인 로직이 없어 도달 불가능했던 정책) — 이걸 그대로 살려 Supabase Auth(email/password, 계정 1개, Supabase 대시보드에서 직접 생성, 회원가입 플로우 없음)로 로그인만 새로 구현. Works/Study/About/Careers/Skills/Currently&nbsp;Doing/Site&nbsp;Settings/방명록 CRUD는 **새 RPC나 마이그레이션 없이** `supabase.from(table).update(...)` 로 authenticated 세션에서 직접 처리(RLS가 이미 커버). 유일하게 새 마이그레이션이 필요한 곳은 ① 어드민 로그인 브루트포스 잠금(3-1, `guestbook_client_ip_hash()` 재사용)과 ② 3-8 미디어 업로드용 Storage 버킷(아직 없음, 3d에서 처리). Next.js 16에서 `middleware.ts`가 `proxy.ts`로 개명됐고 이 저장소엔 미들웨어가 전혀 없었어서 `src/proxy.ts`가 이 프로젝트 최초의 proxy 파일 — 세션 쿠키 갱신만 담당하고, 실제 인증 재검증은 Server Action이 proxy matcher를 우회할 수 있다는 Next.js 공식 권고에 따라 `/admin/(protected)/layout.tsx` + 각 서버 액션 내부에서 이중으로 수행.

작업량이 많아 하위 단계로 쪼개 순차 진행: **3a**(인증 뼈대 + 방명록 모더레이션, 컬럼 이미 준비돼 있어 마이그레이션 거의 없음) → **3b**(Works/Studies CRUD + 공용 컴포넌트) → **3c**(About/Careers/Skills/Currently Doing/Site Settings) → **3d**(Storage 마이그레이션 + 미디어 업로드).

| # | 상태 | 작업 | 참고 | 완료 기준 |
| --- | --- | --- | --- | --- |
| 3-1 | ✅ | **[3a]** Supabase Auth 단일 계정 로그인(`/admin/(auth)/login`) + `src/proxy.ts`(세션 갱신) + `/admin/(protected)/layout.tsx`(서버 재검증) + 5회 실패 15분 잠금(`0030_admin_login_lockout.sql`, IP 기준) | PRD 9.1 | 미인증 리다이렉트 확인 완료(빌드+실제 요청 검증). **마이그레이션 적용 + 관리자 계정 생성 + 실로그인 완료(2026.08.25)** |
| 3-2 | 🔄 | **[3a/3b]** `/admin`(대시보드): 미확인 방명록 수·보류 수·전체 게시글 수 + Draft 프로젝트/스터디 수 + 노출 정원(N/5, N/2, N/4) 위젯 | PRD 9.3 | 위젯 데이터 정확성 |
| 3-3 | 🔄 | **[3b]** `/admin/works`, `/admin/studies`: 목록(카테고리/상태 탭) + 등록·수정(블록 에디터로 `body` 편집, `role`/`tools`/`tags`/`gallery_urls` 배열 필드 편집, slug 자동 제안) — 공용 `admin-form-field`/`content-block-editor`/`study-steps-editor` 컴포넌트 구축. **검색·일괄작업·30초 자동 임시저장은 다음 이터레이션으로 이연**(수동 저장 버튼은 있음), 이미지는 3d 전까지 URL 직접 입력 | PRD 9.5 | 등록→Main 반영 E2E — 코드/빌드 검증 완료, 실사용 CRUD 확인 필요 |
| 3-4 | ⬜ | **[3c]** `/admin/currently-doing`: 인라인 테이블 편집, 라벨 드롭다운 즉시저장, 종료 리마인드 배너 | PRD 9.6 | 즉시 저장 확인 |
| 3-5 | 🔄 | **[3b]** `/admin/main` ⭐: Professional 5/Study 4/Side 2 정원 관리, 화살표 순서변경(드래그는 dnd 라이브러리 미도입으로 이연), draft는 DB 트리거(`enforce_featured_cap`)가 노출 자체를 차단, `revalidatePath('/')` | PRD 9.4, Figma '최종' 반영 | 정원 초과 차단(트리거가 최종 방어선, UI는 cap 도달 시 버튼 비활성화로 선제 차단) — 코드/빌드 검증 완료, 실사용 확인 필요 |
| 3-6 | ✅ | **[3a]** `/admin/guestbook`: 본문 전문 열람, 필터(전체/미확인/보류/스팸/숨김), 읽음 처리·flag·운영 메모·숨김·삭제(soft delete). **수정 이력(`guestbook_revisions`) 비교 UI는 다음 이터레이션으로 이연** | PRD 9.7 | 변경 전후 비교 노출 — 리다이렉트/RLS 이중 방어까지 실측 확인 완료(2026.08.25) |
| 3-7 | ⬜ | **[3c]** `/admin/about`, `/admin/site-settings`: About/연혁/스킬 CRUD, 히어로 미디어 교체, SEO 설정, 점검모드 | PRD 9.8 | 히어로 영상 교체 반영 확인 |
| 3-8 | ⬜ | **[3d]** `/admin/media`, `/admin/trash`: `0030_admin_storage.sql`(Storage 버킷 신설, 유일하게 신규 마이그레이션 필요한 항목) + 업로드 자산 관리, soft delete 복구 | PRD 9.2 | 복구 동작 확인 |
| 3-9 | ⬜ | 1024px 미만 접속 시 안내 화면(방명록 열람만 예외) | PRD 9.9 | 모바일 접속 시 안내 노출 |

**Phase 3 완료 기준**: 개발자 개입 없이 신규 프로젝트 1건 등록 → Main 노출까지 10분 이내(PRD 1.2 성공지표).

**3a 적용 완료(2026.08.25)**: `0030_admin_login_lockout.sql` 적용 + 관리자 계정 생성 + 실제 로그인 성공까지 확인했습니다.

**3b 진행 메모**: Works/Studies CRUD와 `/admin/main` 노출 정원 관리를 새 마이그레이션 없이 붙였습니다(RLS `authenticated for-all` + 기존 `enforce_featured_cap` 트리거를 그대로 재사용). 이번에 새로 만든 파일: `src/app/admin/(protected)/works/**`, `src/app/admin/(protected)/studies/**`, `src/app/admin/(protected)/main/**`, `src/components/admin/{project-form,study-form,study-steps-editor,content-block-editor,featured-manager}.tsx`, `src/lib/slugify.ts`. `tsc`/`eslint`/`next build` 통과 + 개발 서버로 미인증 리다이렉트까지 확인했으나, 실제 프로젝트/스터디 등록→메인 노출 E2E는 아직 브라우저로 직접 확인 전입니다. 이연한 항목: 목록 검색·일괄작업, 30초 자동 임시저장(수동 저장 버튼으로 대체), 정원 관리의 드래그 정렬(화살표로 대체), 이미지 업로드(Storage 버킷 없어 3d까지 URL 직접 입력).

**업종 필드 개선(2026.08.25)**: 자유 텍스트였던 `industry`를 분류(Professional/Side)별 Figma 고정 목록(`getIndustryOptions`) 선택 + "+ 직접 입력"으로 변경(`src/components/admin/industry-field.tsx`) — 오타로 `/works` 필터 칩이 어지러워지는 걸 막는다.

**등록 폼에 메인 노출 컨트롤 추가(2026.08.25)**: `/admin/main`에서만 하던 "메인에 노출·몇 번째" 설정을 Works/Studies 등록·수정 폼에도 바로 넣었다(`FeaturedControl` 컴포넌트, `main/actions.ts`의 `setFeaturedPosition` 재사용 — 원하는 순번에 끼워 넣고 같은 그룹을 1..N으로 재정렬). 정원 캡 상수는 `src/lib/featured-caps.ts`로 뽑아 `/admin/main`과 공유. draft 상태는 체크박스 자체를 비활성화해 트리거 예외를 사전에 막는다.

**Works 미디어 업로드로 전환, Phase 3d Storage 조기 착수(2026.08.25)**: 썸네일/커버/갤러리를 URL 붙여넣기 대신 실제 파일 업로드로 바꿨다. `0031_admin_media_storage.sql`로 공개 `media` 버킷을 새로 만들고(파일당 5MB, jpg/png/webp만 버킷 레벨에서 강제), `next.config.ts`엔 이미 `/storage/v1/object/public/**` remotePattern이 준비돼 있어 추가 설정 없이 바로 `next/image`로 렌더된다. 업로드는 서버 액션이 아니라 브라우저에서 `@supabase/ssr` 클라이언트로 직접 Storage에 올린다(로그인 세션 쿠키를 그대로 타므로 `authenticated` RLS로 보호됨). `src/lib/upload-image.ts`(공용 업로드 함수) + `src/components/admin/{image-upload-field,gallery-upload-field}.tsx`. 각 필드 아래에 권장 사이즈/용량/확장자 안내 문구를 넣었다. **아직 Study 폼은 그대로 URL 입력** — 요청 범위가 Works였어서 우선 여기까지만.

**⚠️ 적용 필요**: `supabase/migrations/0031_admin_media_storage.sql`을 Supabase SQL Editor에서 실행해야 업로드가 동작합니다(버킷 자체가 없으면 업로드 시 에러).

**업종 다중 선택 + Front 라벨 정리, 본문 빈 블록 정리(2026.08.25)**: `projects.industry`를 `text` → `text[]`로 변경(`0032_project_industry_array.sql`, 기존 값은 1개짜리 배열로 자동 이관). 어드민 `IndustriesField`(`industry-field.tsx`)가 pill 토글 다중 선택 + 직접 입력으로 바뀌었고, `/works` 카드·필터 칩도 배열 기준으로 갱신(`project-card.tsx`/`works-list-card.tsx`/`works-list-client.tsx`/`works-professional-grid.tsx`). 카드에 노출되는 라벨은 이제 role 없이 **업종만**으로 구성(요청 반영). 본문 블록(Works `body`, Study `body.blocks`)과 로드맵 단계(Study `body.steps`)는 텍스트/URL을 하나도 안 채운 빈 항목을 저장 시 걸러내도록 `src/lib/clean-content-blocks.ts`를 만들어 양쪽 폼에 적용 — 작성한 게 없으면 Front(`ContentBlocks`)에 해당 섹션 자체가 노출되지 않는다(원래도 배열이 완전히 비어 있으면 노출 안 됐지만, "빈 블록 하나만 추가"한 경우까지 걸러내도록 보강).

**⚠️ 적용 필요**: `supabase/migrations/0032_project_industry_array.sql`을 Supabase SQL Editor에서 실행해야 합니다(실행 전엔 `industry` 컬럼이 여전히 단일 값이라 다중 선택 UI가 저장 시 타입 에러를 냅니다).

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
