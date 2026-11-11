export interface SocialLink {
  id: string;
  label: string;
  href: string;
  external?: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface ExperienceRole {
  id: string;
  company: string;
  location: string;
  title: string;
  start: string;
  end: string;
  summary: string[];
  promotions?: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  tagline: string;
  domain: string;
  role: string;
  period: string;
  stack: string[];
  highlights: string[];
  liveUrl?: string;
  repoUrl?: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  skills: string[];
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  location: string;
  period: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface FoundationItem {
  id: string;
  title: string;
  items: string[];
}

export interface ProfileData {
  name: string;
  headline: string;
  location: string;
  email: string;
  phone: string;
  summary: string;
  about: string[];
  resumeUrl: string;
  socials: SocialLink[];
}
