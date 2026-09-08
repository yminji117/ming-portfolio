export type ProjectCategory = "professional" | "side";
export type ContentStatus = "draft" | "published";
export type CareerType = "school" | "language" | "company" | "academy";
export type SkillGroup = "main" | "sub";
export type CurrentlyCategory = "works" | "study" | "side";
export type CurrentlyLabel = "want" | "doing" | "done";
export type CurrentlyRefType = "project" | "study" | "none";
export type HeroMediaType = "image" | "video";

// PRD 6.2 — 프로젝트/스터디 상세 본문 블록 (텍스트/이미지/2열이미지/영상/인용/구분선/캡션)
export type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; url: string; alt?: string }
  | { type: "image_pair"; urls: [string, string]; alt?: string }
  | { type: "video"; url: string }
  | { type: "quote"; text: string }
  | { type: "divider" }
  | { type: "caption"; text: string };

export interface Project {
  id: string;
  slug: string;
  category: ProjectCategory;
  title: string;
  summary: string;
  thumbnail_url: string | null;
  cover_url: string | null;
  start_date: string | null;
  end_date: string | null;
  company: string | null;
  role: string[];
  role_note: string | null;
  tools: string[];
  team: string | null;
  external_url: string | null;
  overview: string | null;
  main_tasks: string[] | null;
  result: string | null;
  retrospective: string | null;
  body: ContentBlock[] | null;
  gallery_urls: string[] | null;
  contribution_percent: number | null;
  industry: string[] | null;
  is_pinned: boolean;
  is_featured: boolean;
  featured_order: number | null;
  status: ContentStatus;
  deleted_at: string | null;
}

export interface StudyRoadmapStep {
  label: string;
  text: string;
}

export interface StudyBody {
  steps?: StudyRoadmapStep[];
  blocks?: ContentBlock[];
}

export interface Study {
  id: string;
  slug: string;
  title: string;
  org_name: string | null;
  summary: string | null;
  overview: string | null;
  thumbnail_url: string | null;
  main_thumbnail_url: string | null;
  tags: string[];
  external_url: string | null;
  related_url: string | null;
  start_date: string | null;
  end_date: string | null;
  body: StudyBody | null;
  gallery_urls: string[] | null;
  is_pinned: boolean;
  is_featured: boolean;
  featured_order: number | null;
  status: ContentStatus;
  deleted_at: string | null;
}

export interface About {
  photo_url: string | null;
  name_ko: string | null;
  name_en: string | null;
  tagline: string | null;
  cover_letter: string | null;
  cover_letter_summary: string | null;
  email: string | null;
  instagram_url: string | null;
  resume_url: string | null;
}

export interface Career {
  id: string;
  type: CareerType;
  org_name: string;
  title: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  industry: string | null;
}

export interface CurrentlyDoing {
  id: string;
  category: CurrentlyCategory;
  title: string;
  label: CurrentlyLabel;
  start_date: string | null;
  end_date: string | null;
  ref_type: CurrentlyRefType;
  ref_id: string | null;
  // ref_id가 가리키는 프로젝트/스터디의 slug — 상세 페이지 링크 생성용(DB 컬럼이 아니라 조회 시 붙여줌).
  ref_slug: string | null;
  is_visible: boolean;
  order: number | null;
}

// guestbook_public 뷰 — password_hash는 절대 포함하지 않는다 (PRD 7.3 필수 검증 항목).
// content는 is_private=false(공개로 작성)인 글만 값이 채워지고, 그 외엔 항상 null이다.
export interface GuestbookEntry {
  id: string;
  nickname: string;
  created_at: string;
  updated_at: string | null;
  is_private: boolean;
  content: string | null;
}

export type GuestbookFlag = "normal" | "hold" | "spam";

// guestbook 원본 테이블 — password_hash는 절대 select하지 않는다.
// authenticated(어드민) RLS로만 접근 가능(0002_rls.sql "admin full access guestbook").
export interface GuestbookEntryAdmin {
  id: string;
  nickname: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  is_private: boolean;
  is_read: boolean;
  is_hidden: boolean;
  flag: GuestbookFlag;
  admin_memo: string | null;
  deleted_at: string | null;
}

export interface Skill {
  id: string;
  name: string;
  icon_url: string | null;
  group: SkillGroup;
  order: number;
}

export interface SiteSettings {
  hero_title: string;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  hero_video_url: string | null;
  hero_media_type: HeroMediaType;
  currently_limit: number;
  footer_text: string | null;
  og_image_url: string | null;
  is_maintenance: boolean;
  notice_display_mode: NoticeDisplayMode;
  notice_emoji: string;
  notice_title: string;
  notice_subtitle: string;
}

export type NoticeDisplayMode = "off" | "once_session" | "every_entry" | "dismiss_12h";

// Work(Professional/Side) 업종 + Study 카테고리 — 어드민 "카테고리 관리"에서 관리하는 통합 목록.
// name이 곧 저장값(projects.industry/studies.tags)이자 표시 라벨이라 별도 라벨 매핑이 없다.
export type CategoryScope = "work_professional" | "work_side" | "study";

export interface Category {
  id: string;
  scope: CategoryScope;
  name: string;
  sort_order: number;
}

// analytics_public_stats 뷰 — anon도 읽을 수 있는 집계 전용, 개별 방문자 정보 없음.
export interface AnalyticsPublicStats {
  total_pageviews: number;
  total_visitors: number;
  today_pageviews: number;
  today_visitors: number;
}

export interface AnalyticsDailyPoint {
  day: string;
  pageviews: number;
  unique_visitors: number;
}

export interface AnalyticsTopPage {
  path: string;
  pageviews: number;
}

export interface AnalyticsTopAction {
  event_name: string;
  action_count: number;
}

export interface AnalyticsTrafficSource {
  source: string;
  sessions: number;
}

export interface AnalyticsExitPage {
  path: string;
  exits: number;
}
