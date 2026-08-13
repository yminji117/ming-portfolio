# MINJI Portfolio Site — PRD (Product Requirements Document)

| 항목 | 내용 |
| --- | --- |
| 문서명 | MINJI 포트폴리오 사이트 기획서 |
| 버전 | v1.0 |
| 작성일 | 2026.08.13 |
| 작성자 | 윤민지 |
| 상태 | Draft (검토 요청) |
| 개발 방식 | React 기반 직접 개발 (Claude Code 페어 프로그래밍) |

---

## 1. 프로젝트 개요

### 1.1 배경 및 목적

기존 PDF·노션 기반 포트폴리오는 (1) 업데이트 시마다 파일을 다시 만들어야 하고, (2) 링크 하나로 "나"라는 사람 전체를 보여주기 어렵다는 한계가 있다. 본 프로젝트는 **직접 운영·확장 가능한 개인 포트폴리오 웹사이트**를 구축하여 다음을 달성한다.

1. **정체성 전달** — 실무 프로젝트(Professional)와 사이드 프로젝트(Side)를 구분해 "무엇을 할 수 있는 사람인지" 즉시 인지시킨다.
2. **성장 기록** — Study와 Currently Doing 영역을 통해 "지금도 자라고 있는 사람"이라는 인상을 남긴다.
3. **자립 운영** — 어드민을 통해 개발자 도움 없이 콘텐츠를 등록·수정·노출 제어할 수 있다.
4. **관계 유지** — 방명록([here→])으로 비공개 소통 창구를 확보한다.

### 1.2 핵심 성공 지표 (Success Metrics)

| 구분 | 지표 | 목표 |
| --- | --- | --- |
| 운영 | 신규 프로젝트 1건 등록 소요 시간 | 10분 이내 (개발자 개입 0) |
| 사용성 | Main 진입 → 프로젝트 상세 도달률 | 40% 이상 |
| 성능 | Lighthouse Performance (Mobile) | 85점 이상 |
| 성능 | LCP (히어로 영상 포함) | 2.5초 이내 |
| 접근성 | Lighthouse Accessibility | 90점 이상 |
| 안정성 | 방명록 스팸/도배 차단률 | 등록 실패 없이 rate limit 동작 |

### 1.3 타깃 사용자

| 페르소나 | 설명 | 니즈 | 주요 진입 경로 |
| --- | --- | --- | --- |
| **채용 담당자 / 리크루터** | 5분 내에 역량을 판단해야 함 | Works > Professional, About me의 연혁·스킬 | Main → Works |
| **협업 제안자 / 동료 기획자** | 결이 맞는지, 무엇에 관심 있는지 확인 | Study, Currently Doing, Side 프로젝트 | Main → Study |
| **지인 / 친구** | 근황 확인, 인사 남기기 | About me, [here→] 방명록 | GNB → here |
| **운영자(본인)** | 콘텐츠 등록·노출 관리 | 어드민 전 영역 | /admin |

### 1.4 범위 (Scope)

**In Scope (v1.0)**

- 반응형 사용자 사이트 (Main / Works / Study / About me / here / 상세 페이지)
- PC 최적화 어드민 (콘텐츠 CRUD, 메인 노출 관리, 방명록 관리, 사이트 설정)
- 이미지·영상 업로드 및 관리
- 방명록 비공개 처리 및 비밀번호 기반 수정

**Out of Scope (v1.0)**

- 다국어(i18n) — 구조만 고려, 실제 번역 미제공
- 댓글·좋아요 등 공개 소셜 기능
- 뉴스레터 구독, 검색 엔진 내 사이트 검색
- 다중 관리자 계정 및 권한 분리 (단일 운영자 전제)
- 방문자 회원가입 / 로그인

---

## 2. 톤앤매너 및 디자인 방향

### 2.1 컨셉: **Modern / Interactive**

"정적인 이력서가 아니라, 스크롤할수록 반응하는 공간."

| 원칙 | 정의 |
| --- | --- |
| **여백이 주인공** | 콘텐츠 밀도를 낮추고, 섹션 간 충분한 호흡을 둔다. |
| **움직임은 의미가 있을 때만** | 장식용 애니메이션 금지. 등장(reveal)·전환(transition)·피드백(hover) 3가지 목적에만 사용. |
| **타이포 우선** | Works / Study / About me 등 섹션 타이틀은 크게(clamp 기반), 부제(professional, side)는 작게 대비를 준다. |
| **한 가지 포인트 컬러** | 무채색 베이스 + 포인트 컬러 1개로 CTA·라벨·hover를 통일한다. |

### 2.2 디자인 토큰 (제안)

```
/* Color */
--color-bg:         #0A0A0A   /* 다크 베이스 */
--color-surface:    #141414
--color-text:       #FAFAFA
--color-text-muted: #8A8A8A
--color-line:       #2A2A2A
--color-accent:     #E4FF3C   /* 포인트 (라임) — 협의 후 확정 */
--color-accent-ink: #0A0A0A   /* 포인트 위 텍스트 */

/* Typography */
--font-display: 'Pretendard', 'Helvetica Now Display', sans-serif
--font-body:    'Pretendard', sans-serif
--fs-hero:      clamp(40px, 8vw, 120px)
--fs-section:   clamp(32px, 5vw, 72px)   /* Works / Study / About me */
--fs-sub:       clamp(13px, 1.2vw, 16px) /* professional / side */
--fs-body:      16px
--fs-caption:   13px

/* Spacing / Radius / Motion */
--section-gap-pc:     160px
--section-gap-mobile: 96px
--radius:             4px
--ease-out:           cubic-bezier(0.22, 1, 0.36, 1)
--dur-fast:           200ms
--dur-base:           400ms
--dur-slow:           800ms
```

> 다크 베이스는 제안값입니다. 라이트 베이스를 원하시면 컬러 토큰만 교체하면 되도록 설계합니다.

### 2.3 인터랙션 스펙

| 인터랙션 | 적용 대상 | 스펙 |
| --- | --- | --- |
| **Scroll Reveal** | 모든 섹션 타이틀·카드 | IntersectionObserver, `opacity 0→1`, `translateY 24px→0`, stagger 60ms |
| **Hero Video** | 2영역 | autoplay / muted / loop / playsinline, 포스터 이미지 선노출 후 영상 페이드인 |
| **Card Hover (PC)** | Works·Study 썸네일 | 이미지 `scale 1→1.04`, 오버레이 타이틀 상승, 400ms |
| **Cursor Follow** | Works 카드 위 | "VIEW" 커스텀 커서 (PC 전용, 성능 이슈 시 Phase 3로 이연) |
| **Marquee** | 섹션 구분 또는 스킬 영역 | 무한 가로 스크롤 텍스트, `prefers-reduced-motion` 시 정지 |
| **Page Transition** | 라우팅 전환 | 페이드 200ms (과한 전환 애니메이션 지양) |
| **접근성 가드** | 전역 | `prefers-reduced-motion: reduce` 시 모든 모션 비활성화, 즉시 최종 상태 렌더 |

---

## 3. 기술 스택 및 아키텍처

### 3.1 스택

| 레이어 | 선택 | 선정 사유 |
| --- | --- | --- |
| Framework | **Next.js 15 (App Router) + React 19** | 이미지 최적화·SEO·서버 액션이 기본 제공되어 포트폴리오에 최적. Claude Code와의 협업 문서량도 가장 풍부. |
| Language | **TypeScript** | 데이터 스키마가 많아 타입 안정성 필요 |
| Styling | **Tailwind CSS v4** | 디자인 토큰을 CSS 변수로 관리하며 빠르게 반응형 구현 |
| Animation | **Framer Motion** (+ 필요 시 Lenis 스무스 스크롤) | 선언적 애니메이션, reduced-motion 지원 |
| Backend / DB | **Supabase** (PostgreSQL + Auth + Storage) | 어드민 로그인, DB, 이미지·영상 저장을 한 번에 해결. 무료 티어로 충분 |
| Editor | **Tiptap** 또는 마크다운 에디터 | 상세 페이지 본문 작성용 |
| Deploy | **Vercel** | Next.js 네이티브, 커스텀 도메인 연결 용이 |
| Analytics | **Vercel Analytics** 또는 GA4 | 유입 경로 확인 |

### 3.2 아키텍처 개요

```
[방문자] ──▶ Next.js (SSG/ISR) ──▶ Supabase DB (읽기, public)
                    │
                    └──▶ Supabase Storage (이미지/영상 CDN)

[운영자] ──▶ /admin (CSR, 인증 필요) ──▶ Supabase Auth
                    │
                    └──▶ Server Action ──▶ DB 쓰기 + revalidatePath()
```

- 사용자 페이지는 **ISR(revalidate 60초)** 로 서빙하고, 어드민에서 저장 시 `revalidatePath()`로 즉시 반영한다.
- 방명록 본문은 **RLS(Row Level Security)** 로 익명 사용자의 SELECT를 차단한다. (핵심 보안 요구사항)

### 3.3 반응형 브레이크포인트

| 명칭 | 범위 | 주요 레이아웃 |
| --- | --- | --- |
| Desktop L | 1440px 이상 | 최대 컨테이너 1320px, 그리드 5열 |
| Desktop | 1280–1439px | 그리드 5열 |
| Laptop | 1024–1279px | 그리드 4열, GNB 유지 |
| Tablet | 768–1023px | 그리드 3열, GNB → 햄버거 |
| Mobile | 767px 이하 | 그리드 2열(Study는 1.5열 가로 스크롤), 단일 컬럼 |

- **어드민**: 1024px 이상 최적화. 1024px 미만은 "PC에서 접속해 주세요" 안내 화면 노출 + 방명록 열람만 읽기 전용 지원.

---

## 4. 정보 구조 (IA) 및 사이트맵

```
/                          Main
├── /works                 Works (Tab: Professional | Side)
│   ├── /works?tab=professional
│   ├── /works?tab=side
│   └── /works/[slug]      프로젝트 상세
├── /study                 Study 리스트
│   └── /study/[slug]      스터디 상세
├── /about                 About me
├── /here                  방명록
└── /admin                 어드민 (인증)
    ├── /admin/login
    ├── /admin/dashboard
    ├── /admin/works
    ├── /admin/study
    ├── /admin/about
    ├── /admin/currently
    ├── /admin/guestbook
    ├── /admin/main        메인 노출 관리
    └── /admin/settings    사이트 설정(히어로 등)
```

**URL 규칙**

- 상세 페이지는 `slug` 기반 (예: `/works/toss-payment-renewal`). 어드민에서 자동 생성 + 수동 수정 가능.
- Works 탭은 쿼리스트링으로 관리하여 탭 상태 공유 가능.

---

## 5. 화면별 상세 기능정의서 — Main

> 표기 규칙: **[필수]** = v1.0 필수 / **[선택]** = 여유 시 반영 / `데이터` = DB 연동 항목

### 5.0 공통 사항

| 구분 | 정의 |
| --- | --- |
| 섹션 순서 | GNB → Hero → Works(Professional) → Study → Works(Side) → About me → Currently Doing → Footer |
| 섹션 진입 | 각 섹션은 스크롤 진입 시 reveal 애니메이션 1회 실행 (재진입 시 재실행 없음) |
| 빈 상태 | 등록된 콘텐츠가 지정 개수보다 적을 경우 해당 섹션은 **있는 만큼만 노출**, 0건이면 섹션 전체 비노출 |
| 이미지 | 전부 `next/image` 사용, `lazy` (히어로만 `priority`), WebP 자동 변환 |

---

### 5.1 [1영역] GNB — Global Navigation Bar

**목적**: 어느 위치에서든 주요 페이지로 이동하고, 방명록 진입을 유도한다.

| 구성 요소 | 내용 | 동작 |
| --- | --- | --- |
| Logo | `MINJI` (텍스트 로고) | 클릭 시 `/` 이동. Main 최상단에서는 스크롤 top |
| Menu 1 | Works | `/works?tab=professional` 이동 |
| Menu 2 | Study | `/study` 이동 |
| Menu 3 | About me | `/about` 이동 |
| CTA | `[here→]` 버튼 | `/here` 이동. 포인트 컬러 배경 + hover 시 화살표 4px 우측 이동 |

**상세 동작 [필수]**

1. **고정 방식**: `position: sticky; top: 0`. 스크롤 다운 시 숨김 / 스크롤 업 시 재노출(auto-hide). 최상단에서는 배경 투명, 스크롤 시 `backdrop-filter: blur(12px)` + 반투명 배경.
2. **현재 위치 표시**: 하위 페이지 진입 시 해당 메뉴에 underline 또는 포인트 컬러 적용.
3. **반응형**
   - Laptop 이상: 로고 좌측 / 메뉴+CTA 우측 가로 배열
   - Tablet 이하: 로고 좌측 / 햄버거 우측 → 클릭 시 풀스크린 오버레이 메뉴 (메뉴 4개 세로 큰 타이포, 하단 Contact 노출)
4. **접근성**: `<nav>` + `aria-label="주요 메뉴"`, 햄버거 `aria-expanded`, 오버레이 오픈 시 포커스 트랩 및 `Esc` 닫기, body 스크롤 잠금.

**예외 처리**

- 페이지 이동 시 오버레이 메뉴는 자동 닫힘.
- 히어로 영상 위에서도 로고·메뉴 가독성이 확보되도록 상단 그라데이션 딤(0→40%) 적용.

---

### 5.2 [2영역] Hero — 'Welcome To My Home'

**목적**: 첫 3초 안에 사이트의 인상을 결정한다.

| 구성 요소 | 내용 | 데이터 |
| --- | --- | --- |
| 타이틀 | `Welcome To My Home` | `site_settings.hero_title` (어드민 수정 가능) |
| 서브 카피 [선택] | 한 줄 소개 | `site_settings.hero_subtitle` |
| 배경 미디어 | 이미지 **또는** 영상(`hi.mp4`) | `site_settings.hero_image` / `hero_video` |
| 스크롤 인디케이터 | `Scroll ↓` 또는 라인 애니메이션 | - |

**상세 동작 [필수]**

1. **미디어 우선순위**: 영상이 등록되어 있으면 영상 우선 재생, 없으면 이미지 노출. 둘 다 없으면 컬러 배경 + 타이틀만.
2. **영상 재생 옵션**: `autoplay muted loop playsinline preload="metadata"`. 포스터 이미지(`hero_image`)를 먼저 그려 LCP를 확보하고 영상 `canplay` 시점에 300ms 페이드인.
3. **높이**: PC `100dvh`, Mobile `85dvh` (주소창 대응 위해 `dvh` 사용).
4. **타이틀 등장**: 문자 단위 stagger reveal (`opacity + translateY`), 총 800ms 이내.
5. **패럴랙스 [선택]**: 스크롤 시 미디어 `translateY 0→10%`, 타이틀은 `opacity 1→0`.
6. **음소거 토글 [선택]**: 영상에 사운드가 있는 경우에만 우하단 아이콘 노출.

**예외 처리 / 성능**

| 상황 | 처리 |
| --- | --- |
| 모바일 데이터 절약 모드 / 저속 네트워크 | `navigator.connection.saveData` 감지 시 영상 미로드, 이미지 대체 |
| `prefers-reduced-motion` | 영상 자동재생 중단, 포스터 이미지 고정 |
| 영상 로드 실패 | `onError` 시 이미지 fallback |
| 파일 용량 | 업로드 시 **20MB 이하** 권장 안내, 초과 시 어드민에서 경고 (권장 스펙: 1920×1080, H.264 MP4, 10초 내외 루프) |

---

### 5.3 [3영역] Works — Professional

**목적**: 실무 역량을 대표하는 프로젝트 3건을 노출한다.

| 구성 요소 | 내용 |
| --- | --- |
| 섹션 타이틀 | `Works` (크게, `--fs-section`) + `professional` (작게, muted, Works 우측 하단 또는 우측 정렬 배치) |
| 콘텐츠 | 어드민에서 지정한 프로젝트 **3개** |
| 카드 구성 | 썸네일 / 프로젝트명 / 한 줄 요약 / 태그(역할·툴) / 기간 |
| CTA | `[더보기]` → `/works?tab=professional` |

**상세 동작 [필수]**

1. **노출 대상**: `projects` 중 `category = professional` **AND** `is_featured = true` 인 항목을 `featured_order` 오름차순으로 최대 3개.
2. **카드 클릭**: 카드 전체가 클릭 영역. `/works/[slug]` 이동.
3. **레이아웃**
   - Desktop: 3열 그리드 또는 지그재그(1개씩 큰 이미지 좌우 교차) — **지그재그 권장**(3개뿐이므로 임팩트 우선)
   - Tablet: 2열 → 마지막 1개 전폭
   - Mobile: 1열 세로 스택
4. **Hover(PC)**: 썸네일 `scale 1.04`, 딤 오버레이 30%, 프로젝트명 상승 + `VIEW →` 노출.
5. **넘버링 [선택]**: `01 / 02 / 03` 인덱스 표기로 시퀀스 감각 부여.

**예외 처리**

- 지정된 항목이 3개 미만이면 있는 만큼만 노출 (레이아웃 깨짐 없이 정렬 유지).
- 0개일 경우 섹션 전체 비노출 + 어드민 대시보드에 "메인 Professional 미지정" 경고.
- 썸네일 미등록 시 프로젝트명 이니셜 기반 플레이스홀더 렌더.

---

### 5.4 [4영역] Study

**목적**: 학습·탐구의 지속성을 보여준다.

| 구성 요소 | 내용 |
| --- | --- |
| 섹션 타이틀 | `Study` (크게) |
| 콘텐츠 | 어드민에서 지정한 게시물 **5개** |
| 카드 구성 | 썸네일 / 제목 / 카테고리 태그 / 작성일(YYYY.MM.DD) |
| CTA | `[더보기]` → `/study` |

**상세 동작 [필수]**

1. **노출 대상**: `studies` 중 `is_featured = true`, `featured_order` 오름차순 최대 5개.
2. **클릭**: 해당 게시물 상세(`/study/[slug]`)로 **랜딩 및 이동**.
3. **레이아웃**
   - Desktop: 5열 균등 그리드 (Works 하위 페이지와 동일한 5열 규칙 유지 → 시각적 일관성)
   - Laptop: 4열 / Tablet: 3열
   - Mobile: **가로 스크롤 캐러셀** (카드 폭 70vw, 우측 살짝 잘려 보이게 하여 스크롤 가능함을 암시) + 스크롤 스냅
4. **Hover(PC)**: 썸네일 확대 + 제목 밑줄.

**예외 처리**

- 5개 미만이면 있는 만큼만 노출. Desktop 5열 그리드에서 좌측 정렬 유지.
- 외부 링크형 스터디(예: 브런치/노션 글)를 등록한 경우 `external_url` 우선 이동 + 새 탭 열기 + `↗` 아이콘 표기.

---

### 5.5 [5영역] Works — Side

**목적**: 자발적으로 만든 것들을 통해 태도와 취향을 보여준다.

| 구성 요소 | 내용 |
| --- | --- |
| 섹션 타이틀 | `Works` (크게) + `side` (작게) |
| 콘텐츠 | 어드민에서 지정한 프로젝트 **4개** |
| CTA | `[더보기]` → `/works?tab=side` |

**상세 동작 [필수]**

1. **노출 대상**: `projects` 중 `category = side` **AND** `is_featured = true`, `featured_order` 오름차순 최대 4개.
2. **레이아웃**: Desktop 4열(또는 2×2 그리드) / Tablet 2열 / Mobile 1열.
3. **3영역과의 차별화**: 3영역이 지그재그 대형 레이아웃이라면 5영역은 균등 그리드로 리듬을 바꿔 지루함을 방지한다.
4. 그 외 클릭·Hover·예외 처리는 5.3과 동일.

---

### 5.6 [6영역] About me

**목적**: 사람으로서의 나를 요약한다.

| 구성 요소 | 내용 | 데이터 |
| --- | --- | --- |
| 사진 | 프로필 이미지 1장 | `about.photo` |
| 이름 | 국문/영문 이름 | `about.name_ko`, `about.name_en` |
| 회사 연혁 | 회사 이력 리스트 (요약 3건) | `careers` where `type = company` |
| Cover letter | 자기소개 요약 (3~5줄) | `about.cover_letter_summary` |
| Contact | 이메일, 인스타그램 | `about.email`, `about.instagram_url` |
| CTA | `[더보기]` → `/about` | - |

**상세 동작 [필수]**

1. **연혁 표기**: `YYYY.MM ~ YYYY.MM  회사명  직무` 형식. Main에서는 **최신 3건**만, 전체는 About me 페이지에서 확인.
2. **이메일**: 클릭 시 클립보드 복사 + "복사되었습니다" 토스트(2초). `mailto:` 대신 복사 방식 권장(메일 클라이언트 미설정 사용자 대응). 우클릭/롱프레스 시 기본 동작 유지.
3. **인스타그램**: 클릭 시 해당 인스타그램으로 이동. `target="_blank" rel="noopener noreferrer"`.
4. **Cover letter**: Main에서는 요약본만, 전문은 About me 페이지에 노출. 요약 미입력 시 전문의 앞 200자 자동 발췌.
5. **레이아웃**: Desktop 2단(좌 사진 / 우 텍스트) / Mobile 1단(사진 → 텍스트).

**예외 처리**

- 사진 미등록 시 이니셜 `MJ` 플레이스홀더.
- 인스타그램 URL 미입력 시 해당 항목 비노출(빈 링크 노출 금지).

---

### 5.7 [7영역] Currently Doing

**목적**: "지금" 무엇에 관심 있고 무엇을 하고 있는지를 실시간 로그처럼 보여준다.

| 컬럼 | 내용 | 형식 |
| --- | --- | --- |
| 카테고리 | Works / Study / Side | Enum |
| 리스트 명 | 항목 제목 | Text (최대 60자) |
| 라벨 | 하고싶다 / 진행중 / 완료·종료 | Enum (색상 구분) |
| 일자 | 시작~종료 | `YYYY.MM.DD ~ YYYY.MM.DD` |

**상세 동작 [필수]**

1. **형태**: 테이블형 리스트. 각 행은 얇은 구분선(`--color-line`)으로 구분.
2. **정렬**: 라벨 우선순위(`진행중` → `하고싶다` → `완료/종료`), 동일 라벨 내 시작일 최신순. 어드민에서 수동 순서 지정 시 그 값이 우선.
3. **라벨 스타일**
   | 라벨 | 색상 | 비고 |
   | --- | --- | --- |
   | 하고싶다 | muted 아웃라인 | 예정 |
   | 진행중 | 포인트 컬러 배경 | 강조 (점 깜빡임 [선택]) |
   | 완료/종료 | 회색 배경, 텍스트 60% 투명 | 종료 |
4. **일자 표기 규칙**
   - 종료일 미정: `2026.05.01 ~ ` (물결 후 공백, "진행중" 의미)
   - 하루짜리: `2026.05.01`
   - 미정 시작: `미정` 표기
5. **노출 개수**: Main에서는 최대 **6건** (어드민 설정으로 변경 가능). `[더보기]` → `/about` 의 Currently Doing 앵커(`/about#currently`)로 이동.
6. **반응형**: Mobile에서는 `카테고리 + 라벨`을 상단 한 줄, `제목`을 그 아래, `일자`를 최하단 caption으로 재배치(2줄 구조).
7. **행 클릭 [선택]**: 연결된 프로젝트/스터디가 있으면 해당 상세로 이동, 없으면 클릭 불가(커서 default).

**예외 처리**

- 0건이면 섹션 비노출.
- "완료/종료" 항목만 있을 경우에도 정상 노출(단, 어드민 대시보드에 업데이트 권유 알림).

---

### 5.8 Footer (공통)

| 구성 요소 | 내용 |
| --- | --- |
| 대형 텍스트 | `Let's work together` 또는 이메일 주소 (클릭 시 복사) |
| 링크 | Instagram, (선택) LinkedIn, Notion |
| Copyright | `© 2026 MINJI. All rights reserved.` |
| Top 버튼 | 스크롤 500px 이상에서 노출, 클릭 시 smooth scroll |

---

## 6. 화면별 상세 기능정의서 — 하위 페이지 (Phase 2)

### 6.1 Works (`/works`)

| 구성 요소 | 내용 |
| --- | --- |
| 페이지 타이틀 | `Works` |
| 탭 | `Professional` / `Side` |
| 리스트 | 썸네일 카드 그리드, **PC 기준 한 줄에 5개** |
| 정렬 | 최신순(기본) / (선택) 연도별 필터 |

**상세 동작**

1. **탭 동작**: 클릭 시 URL 쿼리 변경(`?tab=side`) + 리스트 페이드 전환. 새로고침·공유 시 탭 상태 유지. 탭 옆에 건수 표기(`Professional (12)`).
2. **그리드**: Desktop 5열 / Laptop 4열 / Tablet 3열 / Mobile 2열. `gap: 24px(PC) / 12px(Mobile)`.
3. **카드**: 썸네일(4:3 또는 3:4 고정 비율) / 제목 / 연도 / 태그 1~2개.
4. **더 불러오기**: 20개 초과 시 무한 스크롤 또는 `[Load more]` 버튼 (SEO 고려해 **버튼 방식 권장**).
5. **빈 상태**: "아직 등록된 프로젝트가 없어요." 안내 문구.
6. **로딩**: 스켈레톤 카드 노출.

### 6.2 프로젝트 상세 (`/works/[slug]`)

| 영역 | 내용 |
| --- | --- |
| Hero | 대표 이미지(풀블리드) + 프로젝트명 |
| Meta | 기간 / 소속 / 역할 / 사용 툴 / 팀 구성 / (선택) 외부 링크 |
| Overview | 프로젝트 한 줄 정의 + 배경 |
| Body | 이미지·텍스트 자유 조합 블록 (문제 → 접근 → 결과 구조 권장) |
| Result | 성과 지표 또는 회고 |
| Navigation | `← 이전 프로젝트` / `다음 프로젝트 →` + `목록으로` |

**상세 동작**

1. **본문 블록 타입**: 텍스트 / 이미지 1장 / 이미지 2열 / 영상(mp4·YouTube) / 인용 / 구분선 / 캡션. 어드민에서 블록 추가·순서 변경(드래그) 가능.
2. **이미지 클릭**: 라이트박스 확대([선택]).
3. **읽기 진행바 [선택]**: 상단 1px 진행 인디케이터.
4. **404 처리**: 존재하지 않거나 `draft` 상태인 slug 접근 시 404 페이지 → `Works 목록으로` CTA.
5. **SEO**: 페이지별 `title`, `description`, `og:image`(썸네일) 동적 생성.

### 6.3 Study (`/study`, `/study/[slug]`)

- 리스트: 썸네일 카드, **PC 한 줄 5개**. Works와 동일한 그리드·로딩·빈 상태 규칙 적용.
- 필터 [선택]: 태그 기반 (예: UX, 아티클, 강의, 회고).
- 상세: 프로젝트 상세와 동일한 블록 에디터 구조. 단 Meta는 `작성일 / 태그 / (선택) 원문 링크`로 단순화.
- 외부 링크형 항목은 리스트에서 바로 외부 이동(상세 페이지 미생성).

### 6.4 About me (`/about`)

| 영역 | 내용 |
| --- | --- |
| Profile | 사진, 이름(국/영), 한 줄 소개 |
| 연혁 | 라벨 구분: **학교 / 어학연수 / 회사**, 시간 역순 타임라인 |
| Cover letter | 전문 |
| Contact | 이메일(복사), 인스타그램(이동) |
| Skills | PPT, Figma, Slack, Notion, CapCut, Adobe Illustrator, Adobe Photoshop |
| Currently Doing | Main 7영역과 동일 컴포넌트 (전체 항목 노출), 앵커 `#currently` |

**상세 동작**

1. **연혁 타임라인**: 좌측 라벨 배지(학교/어학연수/회사) + 기간 + 기관명 + 설명. 라벨별 필터 [선택].
2. **Skills**: 아이콘 + 명칭 그리드. 숙련도 게이지는 **미사용**(주관적 지표라 신뢰도 저하). 대신 `주 사용 / 사용 가능` 2단계 그룹 구분 권장.
   > ⚠️ 원 요구사항의 `Pigma`는 **Figma**의 오기로 판단하여 반영했습니다. 확인 부탁드립니다.
3. **Currently Doing**: Main과 동일 컴포넌트를 재사용하되 `limit` 없이 전체 노출 + 라벨 필터 제공.
4. **이력서 다운로드 [선택]**: PDF 파일 어드민 업로드 → `[Resume ↓]` 버튼.

---

## 7. [here→] 방명록 상세 기능정의서

> 본 기능은 **"작성은 공개, 내용은 비공개"** 라는 점이 핵심입니다. 싸이월드 방명록의 정서는 유지하되, 내용은 운영자만 열람합니다.

### 7.1 화면 구성

```
┌──────────────────────────────────────────┐
│  here →                                   │
│  하고 싶은 말을 남겨주세요. 저만 볼게요.       │
├──────────────────────────────────────────┤
│  [ 작성란 (textarea)                   ]  │
│                              0 / 500     │
│  아이디 [        ]  비밀번호 [        ]   │
│                              [ 등록 ]     │
├──────────────────────────────────────────┤
│  minji_friend    2026.08.13 21:04  [수정] │
│  ─────────────────────────────────────── │
│  hong2          2026.08.12 10:22  [수정] │
│  (수정됨 2026.08.12 11:00)                │
└──────────────────────────────────────────┘
```

### 7.2 작성 (Create)

| 필드 | 규칙 |
| --- | --- |
| 내용 | 필수, **500자 이내**, 실시간 카운터(`n / 500`), 490자부터 카운터 경고색 |
| 아이디 | 필수, 2~12자, 한글·영문·숫자·언더바 허용, 공백 불가 |
| 비밀번호 | 필수, **4자리 숫자** 또는 4~16자 문자열 (택1 — 4자리 숫자 권장, 싸이월드 정서 부합) |
| 등록 버튼 | 3개 필드 모두 유효할 때만 활성화 |

**동작**

1. `[등록]` 클릭 → 서버 액션 호출 → 비밀번호 **bcrypt 해시** 저장 → 목록 최상단에 즉시 추가(낙관적 업데이트) → 작성 폼 초기화 → "남겨주셔서 고마워요 :)" 토스트.
2. 등록 즉시 **본문은 화면 어디에도 노출되지 않는다.** 목록에는 `아이디 / 등록 일시 / [수정]` 만 표시.
3. 어드민 방명록 목록에 신규 항목 적재 + `읽지 않음` 뱃지.

**예외 처리**

| 상황 | 처리 |
| --- | --- |
| 500자 초과 입력 | 초과 입력 자체를 차단(`maxLength`) + 카운터 경고 |
| 아이디 중복 | 허용 (동일인이 여러 번 남길 수 있음) |
| 도배 방지 | 동일 IP 기준 **60초에 1건**, 하루 10건 제한. 초과 시 "잠시 후 다시 시도해 주세요." |
| 금칙어 / 스팸 링크 | URL 3개 이상 포함 시 자동 `보류` 처리, 어드민에서만 확인 |
| 네트워크 실패 | 낙관적 업데이트 롤백 + "등록에 실패했어요. 다시 시도해 주세요." |
| 봇 방지 | 허니팟 필드 + (선택) Cloudflare Turnstile |

### 7.3 목록 (Read)

- 노출 항목: **아이디 / 등록 일시(`YYYY.MM.DD HH:mm`) / [수정] 버튼**, 수정된 글은 `(수정됨 YYYY.MM.DD HH:mm)` 병기.
- **본문은 서버에서 아예 전송하지 않는다** (RLS + API 응답 필드 제외). 개발자도구로도 열람 불가해야 한다. — **필수 검증 항목**
- 정렬: 등록 일시 최신순. 20건씩 페이지네이션 또는 `[더보기]`.
- 빈 상태: "첫 번째 방문자가 되어주세요." 문구.

### 7.4 수정 (Update)

**플로우**

```
[수정] 클릭
   └─▶ 비밀번호 입력 박스 노출 (해당 행 인라인 확장 또는 모달)
         ├─ 아이디(읽기전용, 표시용) + 비밀번호 입력 + [확인]
         │
         ├─▶ 아이디 + 비밀번호 일치 ──▶ 본문 노출 + 수정 가능 상태
         │                              (textarea 활성, 500자 제한 동일)
         │                              [등록] 버튼 제공
         │                                 └─▶ 저장 → updated_at 갱신
         │                                      → "등록 일시 / 수정 일시" 둘 다 표시
         │
         └─▶ 불일치 ──▶ "아이디 또는 비밀번호가 일치하지 않아요." (남은 시도 횟수 표기)
```

**규칙**

| 항목 | 정의 |
| --- | --- |
| 인증 대상 | **아이디 + 비밀번호 모두 일치**해야 함 |
| 인증 검증 | 서버에서 bcrypt `compare`. 클라이언트로 해시·본문을 절대 미리 내려보내지 않음 |
| 인증 유효 | 인증 성공 후 해당 세션에서 **10분간** 유효, 이후 재입력 |
| 시도 제한 | **5회 실패 시 10분 잠금**(해당 글 + IP 기준) |
| 수정 후 표시 | `등록 2026.08.12 10:22 / 수정 2026.08.12 11:00` 두 값 모두 노출 |
| 수정 이력 | `guestbook_revisions` 테이블에 이전 본문 스냅샷 보관 (어드민에서 변경 전후 비교 가능) |
| 삭제 | **작성자 삭제 불가** (요구사항에 없음). 운영자만 어드민에서 삭제/숨김 처리 |
| 비밀번호 분실 | 복구 불가 안내. "비밀번호를 잊으면 수정할 수 없어요."를 작성 폼 하단에 명시 |

**접근성**

- 모달은 포커스 트랩 + `Esc` 닫기. 에러 메시지는 `aria-live="polite"`로 스크린리더 전달.
- 비밀번호 필드 `type="password"` + 보기 토글.

---

## 8. 데이터 구조 설계

### 8.1 ERD 개요

```
site_settings (1)          about (1)
      │                        │
      │                        ├── careers (N)        [학교/어학연수/회사]
      │                        └── skills (N)
      │
projects (N) ──┬── project_blocks (N)      [상세 본문 블록]
               └── category: professional | side
                   is_featured / featured_order  → Main 3영역·5영역 노출

studies (N) ───┴── study_blocks (N)
                   is_featured / featured_order  → Main 4영역 노출

currently_doing (N)        → Main 7영역 · About 페이지
      └── (선택) ref_type / ref_id → projects | studies 연결

guestbook (N)
      └── guestbook_revisions (N)          [수정 이력]

media (N)                                  [업로드 자산 공통 관리]
```

### 8.2 테이블 상세

#### `projects` — Works (Professional / Side 공통)

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `id` | uuid (PK) | ✅ | |
| `slug` | text (unique) | ✅ | URL. 제목 기반 자동 생성 + 수동 수정 |
| `category` | enum(`professional`,`side`) | ✅ | 탭 구분 |
| `title` | text | ✅ | 프로젝트명 (최대 60자) |
| `summary` | text | ✅ | 한 줄 요약 (최대 100자, 카드에 노출) |
| `thumbnail_url` | text | ✅ | 리스트 썸네일 |
| `cover_url` | text |  | 상세 페이지 상단 대표 이미지 |
| `start_date` / `end_date` | date |  | 기간. `end_date` null이면 진행중 |
| `company` | text |  | 소속 (Professional에서 주로 사용) |
| `role` | text[] |  | 역할 태그 (예: 기획, UX, 운영) |
| `tools` | text[] |  | 사용 툴 태그 |
| `team` | text |  | 팀 구성 |
| `external_url` | text |  | 서비스 링크 / 원문 링크 |
| `overview` | text |  | 프로젝트 개요 |
| `result` | text |  | 성과·회고 |
| `is_featured` | boolean | ✅ | Main 노출 여부 (default false) |
| `featured_order` | int |  | Main 노출 순서 (1부터) |
| `status` | enum(`draft`,`published`) | ✅ | draft는 사용자 페이지 비노출 |
| `view_count` | int |  | 조회수 (어드민 참고용) |
| `created_at` / `updated_at` | timestamptz | ✅ | |

**제약**

- `category = professional AND is_featured = true` 인 published 항목은 **최대 3개**
- `category = side AND is_featured = true` 인 published 항목은 **최대 4개**
- `status = draft` 인 항목은 `is_featured` 설정 불가

#### `studies` — Study

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `id` | uuid (PK) | ✅ | |
| `slug` | text (unique) | ✅ | |
| `title` | text | ✅ | 최대 80자 |
| `summary` | text |  | 카드 노출 요약 |
| `thumbnail_url` | text | ✅ | |
| `tags` | text[] |  | UX / 아티클 / 강의 / 회고 등 |
| `external_url` | text |  | 값이 있으면 상세 대신 외부 이동 |
| `published_at` | date | ✅ | 표기용 작성일 |
| `is_featured` | boolean | ✅ | Main 노출 (**최대 5개**) |
| `featured_order` | int |  | |
| `status` | enum(`draft`,`published`) | ✅ | |
| `created_at` / `updated_at` | timestamptz | ✅ | |

#### `project_blocks` / `study_blocks` — 상세 본문 블록

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | uuid (PK) | |
| `parent_id` | uuid (FK) | projects.id 또는 studies.id |
| `order` | int | 블록 순서 (드래그로 변경) |
| `type` | enum | `text` \| `heading` \| `image` \| `image_pair` \| `video` \| `quote` \| `divider` |
| `content` | jsonb | 타입별 payload (텍스트, 이미지 URL, 캡션, alt 등) |

> **대안**: 블록 테이블 대신 `body` 컬럼 하나에 리치텍스트 JSON(Tiptap)을 통째로 저장하는 방식도 가능합니다. 개발 속도는 후자가 빠르고, 레이아웃 자유도는 전자가 높습니다. **v1.0은 후자(단일 jsonb)로 시작하고, 필요 시 블록 분리 마이그레이션**을 권장합니다.

#### `about` — 단일 레코드 (singleton)

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `photo_url` | text | 프로필 사진 |
| `name_ko` / `name_en` | text | 이름 |
| `tagline` | text | 한 줄 소개 |
| `cover_letter` | text | 전문 (About 페이지) |
| `cover_letter_summary` | text | 요약 (Main 6영역). 미입력 시 전문 앞 200자 자동 발췌 |
| `email` | text | |
| `instagram_url` | text | |
| `resume_url` | text | 이력서 PDF (선택) |

#### `careers` — 연혁

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | uuid (PK) | |
| `type` | enum(`school`,`language`,`company`) | 라벨: 학교 / 어학연수 / 회사 |
| `org_name` | text | 기관·회사명 |
| `title` | text | 전공 / 직무 / 과정명 |
| `start_date` / `end_date` | date | `end_date` null → "재직중·재학중" |
| `description` | text | 상세 설명 (선택) |
| `order` | int | 수동 정렬값 |

#### `skills`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | uuid (PK) | |
| `name` | text | PPT, Figma, Slack, Notion, CapCut, Adobe Illustrator, Adobe Photoshop |
| `icon_url` | text | 아이콘 (선택) |
| `group` | enum(`main`,`sub`) | 주 사용 / 사용 가능 |
| `order` | int | |

#### `currently_doing`

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `id` | uuid (PK) | ✅ | |
| `category` | enum(`works`,`study`,`side`) | ✅ | |
| `title` | text | ✅ | 리스트 명 (최대 60자) |
| `label` | enum(`want`,`doing`,`done`) | ✅ | 하고싶다 / 진행중 / 완료·종료 |
| `start_date` | date |  | null 허용(미정) |
| `end_date` | date |  | null이면 "진행중" 표기 |
| `ref_type` | enum(`project`,`study`,`none`) |  | 연결 대상 종류 |
| `ref_id` | uuid |  | 연결 대상 id (클릭 시 이동) |
| `is_visible` | boolean | ✅ | Main 노출 여부 |
| `order` | int |  | 수동 정렬 (미지정 시 기본 정렬 규칙 적용) |
| `created_at` / `updated_at` | timestamptz | ✅ | |

#### `guestbook` — 방명록 ⚠️ 보안 핵심

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `id` | uuid (PK) | ✅ | |
| `nickname` | text | ✅ | 작성자 아이디 (공개) |
| `content` | text | ✅ | 본문 (최대 500자) — **비공개** |
| `password_hash` | text | ✅ | bcrypt 해시 (cost 10) |
| `created_at` | timestamptz | ✅ | 등록 일시 (공개) |
| `updated_at` | timestamptz |  | 수정 일시. null이면 미수정 (공개) |
| `is_read` | boolean | ✅ | 운영자 읽음 여부 (default false) |
| `is_hidden` | boolean | ✅ | 운영자 숨김 처리 (default false) |
| `flag` | enum(`normal`,`hold`,`spam`) | ✅ | 자동 스팸 판정 결과 |
| `admin_memo` | text |  | 운영자 메모 |
| `ip_hash` | text |  | rate limit용 해시 (원문 IP 미저장) |
| `user_agent` | text |  | 참고용 |

**보안 정책 (필수)**

1. 익명 사용자용 공개 뷰 `guestbook_public` 은 `id, nickname, created_at, updated_at` 만 SELECT 허용. `content`, `password_hash` 는 **컬럼 자체를 노출하지 않는다.**
2. RLS: `anon` 롤은 `guestbook` 테이블 직접 SELECT **불가**. INSERT만 허용.
3. 본문 조회는 서버 액션에서 비밀번호 검증 통과 시에만 반환.
4. 어드민(`authenticated` + admin 역할)만 전체 컬럼 SELECT 가능.

#### `guestbook_revisions` — 수정 이력

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | uuid (PK) | |
| `guestbook_id` | uuid (FK) | |
| `prev_content` | text | 수정 전 본문 |
| `revised_at` | timestamptz | 수정 시각 |

#### `site_settings` — 단일 레코드

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `hero_title` | text | 기본값 `Welcome To My Home` |
| `hero_subtitle` | text | 선택 |
| `hero_image_url` | text | 히어로 이미지 / 영상 포스터 |
| `hero_video_url` | text | `hi.mp4` |
| `hero_media_type` | enum(`image`,`video`) | 우선 노출 미디어 |
| `currently_limit` | int | Main 7영역 노출 개수 (default 6) |
| `footer_text` | text | |
| `og_image_url` | text | 공유용 대표 이미지 |
| `is_maintenance` | boolean | 점검 모드 |

#### `media` — 업로드 자산

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | uuid (PK) | |
| `url` | text | Storage 공개 URL |
| `type` | enum(`image`,`video`,`file`) | |
| `file_name` / `size` / `width` / `height` | - | 메타 정보 |
| `alt` | text | 접근성용 대체 텍스트 |
| `uploaded_at` | timestamptz | |

### 8.3 데이터 정합성 규칙

| # | 규칙 | 위반 시 처리 |
| --- | --- | --- |
| 1 | Main Professional 노출은 정확히 3개 권장 (최대 3) | 3개 초과 선택 시 저장 차단, 3개 미만이면 경고 배너 |
| 2 | Main Study 노출은 최대 5개 | 동일 |
| 3 | Main Side 노출은 최대 4개 | 동일 |
| 4 | `slug` 중복 불가 | 저장 시 실시간 중복 체크 + `-2` 자동 접미 제안 |
| 5 | `published` 전환 시 `title`, `thumbnail_url`, `summary` 필수 | 미입력 항목 하이라이트 후 저장 차단 |
| 6 | 삭제는 **soft delete** (`deleted_at`) | 30일 보관 후 영구 삭제. 어드민 휴지통에서 복구 가능 |
| 7 | `end_date < start_date` 불가 | 날짜 선택 UI에서 차단 |

---

## 9. 어드민 상세 정책

> **원칙**: 어드민은 "예쁜 것"보다 **빠르고 실수하지 않는 것**이 중요하다. PC(1024px 이상) 기준으로 설계한다.

### 9.1 인증 및 권한

| 항목 | 정책 |
| --- | --- |
| 계정 | **단일 운영자 계정** (Supabase Auth 이메일+비밀번호) |
| 회원가입 | **비활성화**. 계정은 최초 1회 수동 생성 |
| 세션 | 7일 유지, "로그인 상태 유지" 체크 시 30일 |
| 로그인 실패 | 5회 실패 시 15분 잠금 |
| 2단계 인증 [선택] | 이메일 매직링크 또는 TOTP (Phase 3) |
| 접근 제어 | `/admin/*` 전체 미들웨어 보호. 미인증 시 `/admin/login` 리다이렉트 (원래 목적지 `redirect` 파라미터로 보존) |
| 로그아웃 | 우상단 상시 노출 |
| 비밀번호 재설정 | Supabase 이메일 링크 |

### 9.2 어드민 IA

```
/admin
├── dashboard          현황 요약
├── main               ⭐ 메인 노출 관리 (핵심)
├── works              프로젝트 목록/등록/수정
├── study              스터디 목록/등록/수정
├── currently          Currently Doing 관리
├── about              About me + 연혁 + 스킬
├── guestbook          방명록 (본문 열람)
├── media              업로드 자산 관리
├── settings           히어로·SEO·점검모드
└── trash              휴지통 (soft delete 복구)
```

### 9.3 대시보드 (`/admin/dashboard`)

| 위젯 | 내용 |
| --- | --- |
| 알림 | ⚠️ Main Professional 3개 미지정 / Study 5개 미지정 / Side 4개 미지정 |
| 방명록 | 읽지 않은 메시지 **n건** (클릭 시 방명록으로) |
| 콘텐츠 현황 | Professional n / Side n / Study n (published·draft 구분) |
| Currently Doing | 진행중 n건, 종료일 지난 미갱신 항목 알림 |
| 빠른 등록 | `+ 새 프로젝트` `+ 새 스터디` `+ Currently 추가` |

### 9.4 메인 노출 관리 (`/admin/main`) ⭐

**목적**: Main의 3·4·5·7영역에 무엇이 어떤 순서로 나갈지 한 화면에서 제어한다.

**구성**

```
[ Works — Professional  (3 / 3) ]
 1. ▤ 프로젝트 A   [순서 ↑↓] [해제]
 2. ▤ 프로젝트 B   [순서 ↑↓] [해제]
 3. ▤ 프로젝트 C   [순서 ↑↓] [해제]
 [ + 프로젝트 선택 ]  ← 3개 도달 시 비활성

[ Study  (4 / 5) ]  ⚠️ 1개 더 지정할 수 있어요
 ...
[ Works — Side  (4 / 4) ]
 ...
[ Currently Doing  노출 개수: [6] ]
 ...
```

**동작 정책**

| # | 정책 |
| --- | --- |
| 1 | 항목 선택은 모달에서 published 목록 검색 후 체크 방식 |
| 2 | 순서 변경은 **드래그 앤 드롭** + 화살표 버튼 병행 (드래그 실패 대비) |
| 3 | 정원 초과 선택 불가. 초과 시 "먼저 기존 항목을 해제해 주세요." 안내 |
| 4 | `draft` 상태 항목은 선택 목록에 표시하되 선택 불가(회색 처리 + 사유 표기) |
| 5 | 노출 중인 항목을 `draft`로 되돌리면 **자동으로 노출 해제** + 토스트 경고 |
| 6 | 저장 시 `revalidatePath('/')` 실행 → 즉시 반영. 저장 후 `[사이트에서 확인]` 링크 제공 |
| 7 | 미저장 상태에서 페이지 이탈 시 확인 다이얼로그 |

### 9.5 Works / Study 관리

**목록 화면**

| 컬럼 | 썸네일 / 제목 / 카테고리 / 상태 / Main노출 / 수정일 / 관리 |
| --- | --- |
| 필터 | 카테고리(Professional·Side), 상태(published·draft), Main 노출 여부 |
| 검색 | 제목 키워드 |
| 정렬 | 최신 수정순(기본), 제목순 |
| 일괄 작업 | 체크박스 선택 → 게시/비공개 전환, 삭제 |

**등록·수정 화면**

| 영역 | 구성 |
| --- | --- |
| 기본 정보 | 제목, slug(자동생성+수정), 카테고리, 요약, 기간, 소속, 역할·툴 태그, 외부 링크 |
| 이미지 | 썸네일(필수), 커버(선택) — 드래그 앤 드롭 업로드 |
| 본문 | 블록 에디터 (텍스트·이미지·영상·인용·구분선) |
| 노출 설정 | 상태(draft/published), Main 노출 토글 |
| 액션 | `[임시저장]` `[미리보기]` `[게시하기]` |

**정책**

1. **자동 임시저장**: 30초마다 draft 자동 저장, "n분 전 저장됨" 표기.
2. **미리보기**: 새 탭에서 실제 페이지 렌더 (draft도 토큰 기반 접근 허용).
3. **이미지 업로드**: 클라이언트에서 리사이즈(최대 2000px) 후 업로드, WebP 변환. 개당 10MB 제한.
4. **alt 텍스트**: 업로드 시 입력 권장(미입력 시 저장은 되나 접근성 경고 표시).
5. **삭제**: soft delete → 휴지통 30일 보관. Main 노출 중인 항목 삭제 시 "메인에 노출 중입니다. 삭제할까요?" 재확인.

### 9.6 Currently Doing 관리 (`/admin/currently`)

- **인라인 테이블 편집**: 목록에서 바로 라벨·일자 수정 가능 (별도 상세 페이지 없이 빠르게).
- 컬럼: 카테고리 / 리스트 명 / 라벨 / 시작일 / 종료일 / 노출 / 연결 / 순서
- `[+ 행 추가]` 버튼으로 한 줄씩 추가.
- **라벨 빠른 전환**: 라벨 클릭 → 드롭다운으로 즉시 변경 → 자동 저장.
- **종료 처리 리마인드**: `end_date`가 지났는데 라벨이 `진행중`인 항목은 노란 배경 + "완료로 변경할까요?" 인라인 버튼.

### 9.7 방명록 관리 (`/admin/guestbook`)

| 기능 | 정책 |
| --- | --- |
| 목록 | 아이디 / **본문 전문** / 등록일시 / 수정일시 / 읽음 / 상태 |
| 읽음 처리 | 목록 진입 시 자동 읽음 처리하지 않음. 항목 펼침 시 읽음 |
| 필터 | 읽지 않음 / 수정됨 / 보류(hold) / 스팸 |
| 수정 이력 | `(수정됨)` 표기 클릭 시 **변경 전후 본문 비교** 노출 |
| 숨김 | `is_hidden = true` → 사용자 목록에서도 제거 (아이디·일시조차 비노출) |
| 삭제 | soft delete, 휴지통 보관 |
| 메모 | 항목별 운영자 메모 작성 가능 |
| 내보내기 [선택] | CSV 다운로드 |
| 알림 [선택] | 신규 등록 시 이메일 알림 (Phase 3) |

### 9.8 About / Settings

- **About**: 사진·이름·태그라인·Cover letter 편집, 연혁 CRUD(라벨 선택 + 드래그 정렬), 스킬 CRUD.
- **Settings**:
  - 히어로 타이틀 / 이미지 / 영상(`hi.mp4`) 업로드 및 교체
  - 미디어 타입 선택 (이미지 우선 / 영상 우선)
  - Currently Doing 노출 개수
  - SEO: 사이트 타이틀, description, OG 이미지, favicon
  - 점검 모드 토글 (활성 시 사용자 페이지 → 점검 안내, 어드민은 정상 접근)

### 9.9 어드민 공통 UX 규칙

| # | 규칙 |
| --- | --- |
| 1 | 모든 저장은 **토스트 피드백** (성공/실패 + 실패 사유) |
| 2 | 파괴적 동작(삭제·비공개 전환)은 확인 다이얼로그 필수 |
| 3 | 폼 유효성 검사는 실시간 + 저장 시 2중 검증 (클라이언트 + 서버) |
| 4 | 로딩 시 스켈레톤, 저장 중 버튼 비활성 + 스피너 (중복 제출 방지) |
| 5 | 단축키 [선택]: `⌘S` 저장, `⌘K` 검색 |
| 6 | 1024px 미만 접속 시 안내 화면 (방명록 읽기만 예외 허용) |

---

## 10. 비기능 요구사항

### 10.1 성능

| 항목 | 기준 |
| --- | --- |
| LCP | 2.5초 이내 (히어로 포스터 이미지 `priority` 로드) |
| CLS | 0.1 이하 (모든 이미지 `width/height` 또는 `aspect-ratio` 고정) |
| 이미지 | WebP/AVIF 자동 변환, `sizes` 속성 정확히 지정, lazy loading |
| 영상 | `preload="metadata"`, 모바일·저속 회선에서는 미로드 |
| 번들 | Framer Motion은 필요한 컴포넌트에서만 dynamic import |
| 캐싱 | ISR 60초 + 어드민 저장 시 on-demand revalidate |

### 10.2 접근성 (WCAG 2.1 AA 목표)

- 명도 대비 4.5:1 이상 (다크 배경 위 muted 텍스트 검증 필수)
- 모든 인터랙션 요소 키보드 접근 및 `:focus-visible` 아웃라인 제공
- 이미지 `alt` 필수 (장식 이미지는 `alt=""`)
- `prefers-reduced-motion` 전면 대응
- 폼 `label` 연결, 에러 `aria-live` 안내
- 시맨틱 마크업 (`header/nav/main/section/footer`, `h1`은 페이지당 1개)

### 10.3 SEO / 공유

- 페이지별 동적 `title` / `description` / `og:image` / `twitter:card`
- `sitemap.xml`, `robots.txt` 자동 생성 (`/admin`, `/here` 는 `noindex`)
- JSON-LD `Person` 스키마 (About 페이지)
- 커스텀 도메인 + HTTPS

### 10.4 보안

| 항목 | 정책 |
| --- | --- |
| 방명록 본문 | RLS로 익명 SELECT 차단 — **최우선 검증 항목** |
| 비밀번호 | bcrypt 해시 저장, 평문 로그 금지 |
| 어드민 | 미들웨어 인증 + 서버 액션 내 재검증 |
| 입력값 | 서버 사이드 검증(zod), XSS 방지 위해 리치텍스트 sanitize |
| 파일 업로드 | MIME 타입·확장자·용량 서버 검증 |
| Rate limit | 방명록 등록·수정 시도, 어드민 로그인 |
| 환경변수 | Service Role Key는 서버 전용, 클라이언트 노출 금지 |

### 10.5 브라우저 지원

| 환경 | 버전 |
| --- | --- |
| Chrome / Edge / Safari / Firefox | 최신 2개 버전 |
| iOS Safari | 16 이상 |
| Android Chrome | 최신 |
| IE | 미지원 |

---

## 11. 개발 로드맵

> 전제: 1인 개발(Claude Code 페어), 주 10~15시간 투입 기준. 기간은 참고치입니다.

### Phase 0 — 세팅 (약 1주)

| # | 작업 | 완료 기준 |
| --- | --- | --- |
| 0-1 | Next.js + TypeScript + Tailwind 프로젝트 생성 | 로컬 실행 |
| 0-2 | Supabase 프로젝트 생성, 테이블·RLS 정의 | 스키마 마이그레이션 적용 |
| 0-3 | 디자인 토큰 / 폰트 / 기본 레이아웃 컴포넌트 | 토큰 기반 스타일 동작 |
| 0-4 | Vercel 배포 파이프라인 + 도메인 연결 | 프리뷰 URL 접속 가능 |
| 0-5 | 어드민 로그인 및 라우트 보호 | 미인증 시 리다이렉트 확인 |

### Phase 1 — Main + 어드민 코어 (약 3주) ⭐ **1차 릴리즈**

| # | 작업 | 완료 기준 |
| --- | --- | --- |
| 1-1 | GNB (1영역) + Footer + 반응형 메뉴 | 5개 브레이크포인트 검수 통과 |
| 1-2 | Hero (2영역) + 영상 재생·fallback | 모바일 저속 회선 fallback 동작 |
| 1-3 | Works Professional (3영역) | DB 연동 3건 노출, 상세 이동 |
| 1-4 | Study (4영역) | 5건 노출, 모바일 캐러셀 동작 |
| 1-5 | Works Side (5영역) | 4건 노출 |
| 1-6 | About me (6영역) | 이메일 복사·인스타 이동 동작 |
| 1-7 | Currently Doing (7영역) | 라벨·일자 표기 규칙 반영 |
| 1-8 | 어드민: Works / Study CRUD | 등록→메인 반영 E2E 확인 |
| 1-9 | 어드민: Currently Doing 인라인 편집 | 즉시 저장 동작 |
| 1-10 | 어드민: About / Settings(히어로) | 히어로 영상 교체 가능 |
| 1-11 | 어드민: 메인 노출 관리 | 3/5/4 정원 제어 동작 |
| 1-12 | 스크롤 reveal 기본 인터랙션 | reduced-motion 대응 확인 |

**1차 릴리즈 판단 기준**: 개발자 개입 없이 프로젝트 1건을 등록해 메인에 노출시킬 수 있으면 배포한다.

### Phase 2 — 하위 페이지 + 방명록 (약 3주) **2차 릴리즈**

| # | 작업 | 완료 기준 |
| --- | --- | --- |
| 2-1 | Works 리스트 (탭 + 5열 그리드) | 탭 상태 URL 공유 가능 |
| 2-2 | 프로젝트 상세 페이지 | 블록 렌더링, 이전/다음 이동 |
| 2-3 | Study 리스트 + 상세 | 외부 링크형 분기 동작 |
| 2-4 | About me 페이지 (연혁·스킬·Cover letter) | 라벨 3종 타임라인 |
| 2-5 | **[here→] 방명록 작성** | 500자 제한, 도배 방지 동작 |
| 2-6 | **방명록 비공개 처리** | 네트워크 탭에서 본문 미노출 검증 ⭐ |
| 2-7 | 방명록 수정 (아이디+비번 검증) | 등록·수정 일시 동시 표기 |
| 2-8 | 어드민 방명록 관리 + 수정 이력 | 변경 전후 비교 노출 |
| 2-9 | 상세 페이지 블록 에디터 | 이미지·영상 블록 삽입 |
| 2-10 | 404 / 에러 / 빈 상태 페이지 | 전 경로 확인 |

### Phase 3 — 고도화 (약 2주)

| # | 작업 |
| --- | --- |
| 3-1 | 인터랙션 고도화 (커스텀 커서, 패럴랙스, 페이지 전환, 마퀴) |
| 3-2 | 성능 최적화 (Lighthouse 목표치 달성) |
| 3-3 | SEO 완성 (sitemap, OG, JSON-LD) |
| 3-4 | 접근성 점검 및 개선 |
| 3-5 | 방명록 신규 등록 이메일 알림 |
| 3-6 | 이력서 PDF 다운로드, 조회수 통계 |
| 3-7 | 휴지통 / soft delete 복구 UI |

### 11.1 마일스톤 요약

```
Week 1        Phase 0  세팅
Week 2 ~ 4    Phase 1  Main + 어드민       ──▶ 1차 배포 (공유 가능)
Week 5 ~ 7    Phase 2  하위 페이지 + 방명록  ──▶ 2차 배포 (기능 완성)
Week 8 ~ 9    Phase 3  고도화               ──▶ 최종
```

---

## 12. 검수 체크리스트 (QA)

### 12.1 기능

- [ ] GNB 5개 항목이 각 목적지로 정확히 이동한다
- [ ] Hero 영상이 자동재생되고, 실패 시 이미지로 대체된다
- [ ] Main 3·4·5영역이 각각 3·5·4개를 노출하고, 카드 클릭 시 해당 상세로 이동한다
- [ ] 각 `[더보기]`가 지정된 페이지·탭으로 이동한다
- [ ] Currently Doing의 라벨 3종과 일자 표기 규칙이 정확하다
- [ ] 이메일 복사·인스타그램 이동이 동작한다
- [ ] 방명록 500자 제한, 아이디·비밀번호 필수 검증이 동작한다
- [ ] **방명록 본문이 사용자 화면·네트워크 응답 어디에도 노출되지 않는다** ⭐
- [ ] 아이디+비밀번호 일치 시에만 수정 가능하며, 등록·수정 일시가 함께 표시된다
- [ ] 어드민에서 등록한 내용이 사이트에 즉시 반영된다

### 12.2 반응형

- [ ] 1440 / 1280 / 1024 / 768 / 375px에서 레이아웃 깨짐이 없다
- [ ] Tablet 이하에서 GNB가 햄버거로 전환되고 오버레이가 정상 동작한다
- [ ] Mobile Study 캐러셀이 스크롤 스냅으로 동작한다
- [ ] 어드민이 1024px 미만에서 안내 화면을 노출한다

### 12.3 예외·경계

- [ ] 콘텐츠 0건 시 섹션이 비노출되고 레이아웃이 깨지지 않는다
- [ ] 존재하지 않는 slug 접근 시 404가 뜬다
- [ ] draft 항목이 사용자 페이지에 노출되지 않는다
- [ ] 방명록 도배 시도 시 rate limit이 동작한다
- [ ] 비밀번호 5회 오입력 시 잠금이 동작한다

---

## 13. 확정 필요 사항 (Open Questions)

| # | 항목 | 확인 필요 내용 | 제안 |
| --- | --- | --- | --- |
| 1 | 스킬 표기 | `Pigma` → **Figma** 오기 여부 | Figma로 반영 |
| 2 | Professional 표기 | `professionel`(프랑스어 철자) → `professional` 통일 여부 | 영문 표준 `Professional` 권장 |
| 3 | 컬러 베이스 | 다크 / 라이트 | 다크 + 라임 포인트 제안 |
| 4 | 방명록 비밀번호 | 4자리 숫자 / 자유 문자열 | **4자리 숫자** (싸이월드 정서) |
| 5 | 도메인 | 사용할 주소 | `minji.works` / `yminji.com` 등 |
| 6 | 상세 본문 | 블록 에디터 vs 마크다운 | v1.0은 단일 리치텍스트로 시작 |
| 7 | Currently Doing 카테고리 | `Works / Study / Side` 중 Works와 Side의 관계 | Works를 실무, Side를 사이드로 분리 해석 |
| 8 | 이력서 PDF | 다운로드 제공 여부 | Phase 3 선택 사항 |
| 9 | 방명록 알림 | 신규 등록 시 이메일 알림 필요 여부 | Phase 3 권장 |
| 10 | 히어로 영상 | `hi.mp4` 최종본 준비 시점 | 1920×1080, 10초 내외, 20MB 이하 |

---

## 부록 A. 용어 정의

| 용어 | 정의 |
| --- | --- |
| Professional | 회사·클라이언트 업무로 진행한 실무 프로젝트 |
| Side | 개인적으로 기획·제작한 사이드 프로젝트 |
| Study | 학습·아티클·강의·회고 등 성장 기록 |
| Currently Doing | 지금 하고 있거나 하고 싶은 일의 상태 로그 |
| Featured | Main 화면에 노출되도록 지정된 상태 |
| Draft / Published | 임시 저장 / 게시 상태 |
| Soft delete | 실제 삭제 대신 삭제 표시만 남겨 복구 가능하게 하는 방식 |

## 부록 B. Main 영역별 요구사항 대조표

| 영역 | 원 요구사항 | 반영 위치 |
| --- | --- | --- |
| 1 | GNB (Logo/Works/Study/About me/[here→]) | 5.1 |
| 2 | 히어로 이미지 업로드 + 'Welcome To My Home' + `hi.mp4` | 5.2 |
| 3 | Works(크게) professional(작게), 프로젝트 3개, [더보기]→Works>Professional | 5.3 |
| 4 | Study 게시물 5개, 선택 시 랜딩·상세 이동, [더보기]→Study | 5.4 |
| 5 | Works(크게) side(작게), 프로젝트 4개, [더보기]→Works>Side | 5.5 |
| 6 | 사진·이름·회사 연혁·Cover letter·Contact(이메일·인스타), [더보기]→About me | 5.6 |
| 7 | Currently Doing 리스트(카테고리·리스트명·라벨·일자), [더보기]→About me | 5.7 |
| Works 페이지 | Professional/Side 탭, 한 줄 5개, 상세 이동 | 6.1 / 6.2 |
| Study 페이지 | 한 줄 5개, 상세 이동 | 6.3 |
| About 페이지 | 사진·이름·연혁(학교/어학연수/회사)·Cover letter·Contact·스킬·Currently Doing | 6.4 |
| here | 방명록 작성·비공개·수정(아이디+비번)·등록/수정 일시 | 7 |
| 공통 | 반응형 | 3.3 / 각 화면 반응형 항목 |
| 공통 | 어드민(PC 위주) | 9 |
