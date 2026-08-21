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
  industry: string | null;
  is_featured: boolean;
  featured_order: number | null;
  status: ContentStatus;
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
  summary: string | null;
  thumbnail_url: string | null;
  tags: string[];
  external_url: string | null;
  published_at: string;
  body: StudyBody | null;
  gallery_urls: string[] | null;
  is_featured: boolean;
  featured_order: number | null;
  status: ContentStatus;
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
  order: number | null;
}

// guestbook_public 뷰 — content/password_hash는 절대 포함하지 않는다 (PRD 7.3 필수 검증 항목)
export interface GuestbookEntry {
  id: string;
  nickname: string;
  created_at: string;
  updated_at: string | null;
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
}
