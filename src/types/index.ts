export type SourceType =
  | 'github'
  | 'github_release'
  | 'github_trending'
  | 'npm'
  | 'pypi'
  | 'hacker_news'
  | 'arxiv'
  | 'cve_feed'
  | 'official_blog'
  | 'documentation'
  | 'rss_feed'
  | 'api';

export type CategoryType =
  | 'AI'
  | 'AI Agents'
  | 'Machine Learning'
  | 'Research'
  | 'Open Source'
  | 'JavaScript'
  | 'TypeScript'
  | 'Python'
  | 'Rust'
  | 'Go'
  | 'Web'
  | 'Frontend'
  | 'Backend'
  | 'Cloud'
  | 'DevTools'
  | 'Databases'
  | 'Security'
  | 'Cybersecurity'
  | 'APIs'
  | 'Developer Platforms'
  | 'Operating Systems'
  | 'Browsers'
  | 'Mobile'
  | 'Infrastructure'
  | 'DevOps'
  | 'Programming Languages'
  | 'Frameworks'
  | 'Libraries'
  | 'Hardware'
  | 'Startups'
  | 'Developer Experience';

export type VerificationStatus = 'verified' | 'partially_verified' | 'unverified';

export type LifecycleStatus =
  | 'discovered'
  | 'processed'
  | 'verified'
  | 'published'
  | 'updated'
  | 'archived';

export interface EvidenceItem {
  id: string;
  type: 'official_source' | 'github_release' | 'documentation' | 'cve' | 'arxiv_paper' | 'secondary_report';
  label: string;
  url: string;
  verified: boolean;
  discovered_at: string;
  details?: string;
}

export interface InferredRelationship {
  target: string;
  target_name: string;
  relationship: 'developed_by' | 'depends_on' | 'related_to' | 'affects' | 'competes_with' | 'extends' | 'studies';
  confidence: number;
}


export interface Signal {
  id: string;
  title: string;
  canonical_url: string;
  source: SourceType;
  source_label: string;
  published_at: string;
  discovered_at: string;
  category: CategoryType;
  subcategory?: string;
  summary: string;
  detailed_summary: string;
  importance_score: number; // 1-100
  confidence_score: number; // 0.0 - 1.0
  entities: string[];
  technologies: string[]; // slugs
  organizations: string[];
  tags: string[];
  evidence: EvidenceItem[];
  verification_status: VerificationStatus;
  lifecycle_status: LifecycleStatus;
  source_derived_facts: string[];
  ai_analysis: string;
  inferred_relationships: InferredRelationship[];
  related_signals: string[];
  created_at: string;
  updated_at: string;
}

export interface Technology {
  slug: string;
  name: string;
  category: CategoryType;
  subcategory: string;
  description: string;
  website?: string;
  repository?: string;
  license?: string;
  first_observed: string;
  latest_update: string;
  aliases: string[];
  tags: string[];
  organization?: string;
  stats: {
    signals_count: number;
    releases_count: number;
    vulnerabilities_count: number;
    velocity_score: number;
  };
}

export interface Release {
  id: string;
  technology_slug: string;
  version: string;
  tag_name: string;
  release_date: string;
  is_breaking: boolean;
  highlights: string[];
  changelog_url?: string;
  source_url: string;
  signal_id?: string;
}

export interface SecurityAdvisory {
  id: string;
  cve_id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_technology_slug: string;
  affected_versions: string;
  patched_version: string;
  published_at: string;
  description: string;
  source_url: string;
  signal_id?: string;
}

export interface ResearchPaper {
  id: string;
  arxiv_id: string;
  title: string;
  authors: string[];
  abstract: string;
  published_at: string;
  primary_category: string;
  related_technologies: string[];
  pdf_url: string;
  source_url: string;
  signal_id?: string;
}

export interface RelationshipNode {
  id: string;
  label: string;
  type: 'technology' | 'organization' | 'category';
  category?: string;
  importance?: number;
}

export interface RelationshipEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: 'developed_by' | 'depends_on' | 'related_to' | 'affects' | 'competes_with' | 'extends' | 'studies';
  confidence: number;
}


export interface TimelineEvent {
  id: string;
  technology_slug: string;
  year: number;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  date: string;
  event_type: 'release' | 'breaking_change' | 'security' | 'announcement' | 'rfc' | 'research' | 'ecosystem';
  title: string;
  description: string;
  importance: number;
  signal_id?: string;
  source_url?: string;
}

export interface DailyDigest {
  id: string;
  date: string;
  total_signals: number;
  category_counts: Record<string, number>;
  top_developments: Array<{
    rank: number;
    signal_id: string;
    title: string;
    summary: string;
    category: CategoryType;
    importance: number;
    sources: string[];
    technology_slugs: string[];
  }>;
  executive_summary: string;
  emerging_patterns: string[];
  generated_at: string;
}

export interface ProcessingJob {
  id: string;
  source: SourceType | 'all' | 'synthetic_cycle' | string;
  started_at: string;
  finished_at?: string;
  status: 'running' | 'completed' | 'failed';
  records_found: number;
  records_processed: number;
  records_created: number;
  duplicates: number;
  errors: string[];
  logs: Array<{
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    message: string;
  }>;
}

export interface SearchQuery {
  q?: string;
  category?: string;
  technology?: string;
  source?: string;
  verification?: VerificationStatus;
  minImportance?: number;
  startDate?: string;
  endDate?: string;
  aiResearchMode?: boolean;
}

export interface AIResearchSynthesis {
  question: string;
  answer: string;
  synthesis_points: string[];
  direct_citations: Array<{
    signal_id: string;
    title: string;
    date: string;
    source: string;
    url: string;
  }>;
  analyzed_signals_count: number;
  confidence: 'high' | 'moderate' | 'tentative';
  disclaimer: string;
}
