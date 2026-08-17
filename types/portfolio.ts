export interface SocialLink {
  label: string;
  href: string;
}

export interface Profile {
  name: string;
  role: string;
  label: string;
  headline: string;
  summary: string;
  location: string;
  availability: string;
  portrait: string;
  portraits: Array<{ src: string; alt: string }>;
  cv: string;
  scholar: string;
  scholarId: string;
  email: string;
  phone: string;
  whatsapp: string;
  socials: SocialLink[];
}

export interface Education {
  credential: string;
  institution: string;
  period: string;
}

export interface ExpertiseItem {
  index: string;
  title: string;
  description: string;
}

export interface TechnologyGroup {
  index: string;
  title: string;
  description: string;
  tools: string[];
}

export interface WorkingMethodItem {
  step: string;
  label: string;
  description: string;
}

export interface GalleryItem {
  src: string;
  alt: string;
}

export interface Project {
  slug: string;
  title: string;
  category: string;
  year: string;
  description: string;
  outcome: string;
  tags: string[];
  image: string;
  gallery?: GalleryItem[];
  featured: boolean;
}

export interface Tutorial {
  title: string;
  description: string;
  tags: string[];
  image: string;
  href: string;
}

export interface Experience {
  role: string;
  organization: string;
  type: string;
  period: string;
  location: string;
  description: string;
  tags: string[];
}

export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: string;
  citedBy: number;
  href: string;
  tags: string[];
  ranking?: string;
  publicationType?: string;
}

export interface PublicationSource {
  profileId: string;
  profileUrl: string;
  source: string;
  lastSyncedAt: string | null;
}

export interface Mission {
  id: string;
  label: string;
  num: string;
}
