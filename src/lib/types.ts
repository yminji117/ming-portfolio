export type ProjectCategory = "professional" | "side";
export type ContentStatus = "draft" | "published";
export type CareerType = "school" | "language" | "company";
export type SkillGroup = "main" | "sub";
export type CurrentlyCategory = "works" | "study" | "side";
export type CurrentlyLabel = "want" | "doing" | "done";
export type CurrentlyRefType = "project" | "study" | "none";
export type HeroMediaType = "image" | "video";

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
  tools: string[];
  team: string | null;
  external_url: string | null;
  overview: string | null;
  result: string | null;
  is_featured: boolean;
  featured_order: number | null;
  status: ContentStatus;
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

export interface SiteSettings {
  hero_title: string;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  hero_video_url: string | null;
  hero_media_type: HeroMediaType;
  currently_limit: number;
  footer_text: string | null;
}
