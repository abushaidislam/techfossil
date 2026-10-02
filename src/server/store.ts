import {
  Signal,
  Technology,
  TimelineEvent,
  Release,
  SecurityAdvisory,
  ResearchPaper,
  RelationshipNode,
  RelationshipEdge,
  DailyDigest,
  ProcessingJob,
  SearchQuery,
  VerificationStatus,
} from '../types';
import { SEED_TECHNOLOGIES } from '../data/seed-technologies';
import { SEED_SIGNALS } from '../data/seed-signals';
import {
  SEED_TIMELINE_EVENTS,
  SEED_RELEASES,
  SEED_SECURITY_ADVISORIES,
  SEED_RESEARCH_PAPERS,
} from '../data/seed-timelines';
import { SEED_GRAPH_NODES, SEED_GRAPH_EDGES } from '../data/seed-relationships';
import { SEED_DAILY_DIGEST, SEED_PROCESSING_JOBS } from '../data/seed-digests';

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can\'t', 'cannot', 'could',
  'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each', 'few', 'for',
  'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll',
  'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d',
  'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me',
  'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s',
  'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them',
  'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
  'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which',
  'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d',
  'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves', 'year', 'month'
]);

class ArchiveStore {
  private technologies: Map<string, Technology> = new Map();
  private signals: Map<string, Signal> = new Map();
  private timelineEvents: Map<string, TimelineEvent> = new Map();
  private releases: Map<string, Release> = new Map();
  private securityAdvisories: Map<string, SecurityAdvisory> = new Map();
  private researchPapers: Map<string, ResearchPaper> = new Map();
  private graphNodes: Map<string, RelationshipNode> = new Map();
  private graphEdges: Map<string, RelationshipEdge> = new Map();
  private dailyDigests: Map<string, DailyDigest> = new Map();
  private processingJobs: ProcessingJob[] = [];
  private duplicateCandidates: Array<{
    id: string;
    targetName: string;
    aliasMatched: string;
    canonicalSlug: string;
    confidence: number;
    status: 'pending' | 'merged' | 'rejected';
  }> = [];

  constructor() {
    this.seed();
  }

  private seed() {
    for (const tech of SEED_TECHNOLOGIES) {
      this.technologies.set(tech.slug, { ...tech });
    }
    for (const sig of SEED_SIGNALS) {
      this.signals.set(sig.id, { ...sig });
    }
    for (const evt of SEED_TIMELINE_EVENTS) {
      this.timelineEvents.set(evt.id, { ...evt });
    }
    for (const rel of SEED_RELEASES) {
      this.releases.set(rel.id, { ...rel });
    }
    for (const sec of SEED_SECURITY_ADVISORIES) {
      this.securityAdvisories.set(sec.id, { ...sec });
    }
    for (const paper of SEED_RESEARCH_PAPERS) {
      this.researchPapers.set(paper.id, { ...paper });
    }
    for (const node of SEED_GRAPH_NODES) {
      this.graphNodes.set(node.id, { ...node });
    }
    for (const edge of SEED_GRAPH_EDGES) {
      this.graphEdges.set(edge.id, { ...edge });
    }
    this.dailyDigests.set(SEED_DAILY_DIGEST.date, { ...SEED_DAILY_DIGEST });
    this.processingJobs = [...SEED_PROCESSING_JOBS];

    this.duplicateCandidates = [
      {
        id: 'dup-1',
        targetName: 'ReactJS',
        aliasMatched: 'React.js',
        canonicalSlug: 'react',
        confidence: 0.99,
        status: 'pending',
      },
      {
        id: 'dup-2',
        targetName: 'NextJS v16 Canary',
        aliasMatched: 'Next.js',
        canonicalSlug: 'nextjs',
        confidence: 0.97,
        status: 'pending',
      },
      {
        id: 'dup-3',
        targetName: 'TypeScript Compiler (tsc)',
        aliasMatched: 'TypeScript',
        canonicalSlug: 'typescript',
        confidence: 0.94,
        status: 'pending',
      },
    ];
  }

  // Technologies
  getAllTechnologies(): Technology[] {
    return Array.from(this.technologies.values()).sort(
      (a, b) => b.stats.signals_count - a.stats.signals_count
    );
  }

  getTechnology(slug: string): Technology | undefined {
    // Check exact slug
    if (this.technologies.has(slug)) return this.technologies.get(slug);

    // Check aliases
    const lower = slug.toLowerCase();
    for (const tech of this.technologies.values()) {
      if (
        tech.slug.toLowerCase() === lower ||
        tech.name.toLowerCase() === lower ||
        tech.aliases.some((alias) => alias.toLowerCase() === lower)
      ) {
        return tech;
      }
    }
    return undefined;
  }

  searchTechnologies(query: string): Technology[] {
    if (!query || !query.trim()) {
      return this.getAllTechnologies();
    }
    const cleanQuery = query.toLowerCase().trim();
    const tokens = cleanQuery
      .split(/[^a-z0-9_-]+/)
      .filter((t) => t.length > 1 && !STOP_WORDS.has(t));

    const scored: Array<{ tech: Technology; score: number }> = [];

    for (const tech of this.technologies.values()) {
      let score = 0;
      const lowerName = tech.name.toLowerCase();
      const lowerSlug = tech.slug.toLowerCase();
      const lowerDesc = tech.description.toLowerCase();

      // Exact query match
      if (lowerName === cleanQuery || lowerSlug === cleanQuery) {
        score += 150;
      } else if (lowerName.includes(cleanQuery) || cleanQuery.includes(lowerName)) {
        score += 80;
      }

      // Token matches
      for (const token of tokens) {
        if (lowerSlug === token || lowerName === token) {
          score += 60;
        } else if (lowerName.includes(token) || lowerSlug.includes(token)) {
          score += 35;
        } else if (tech.aliases.some((a) => a.toLowerCase().includes(token))) {
          score += 30;
        } else if (tech.tags.some((tag) => tag.toLowerCase().includes(token))) {
          score += 25;
        } else if (tech.category.toLowerCase().includes(token)) {
          score += 20;
        } else if (lowerDesc.includes(token)) {
          score += 10;
        }
      }

      if (score > 0) {
        scored.push({ tech, score });
      }
    }

    return scored
      .sort((a, b) => b.score - a.score || b.tech.stats.signals_count - a.tech.stats.signals_count)
      .map((item) => item.tech);
  }

  // Signals
  getAllSignals(query?: SearchQuery): Signal[] {
    let list = Array.from(this.signals.values());

    if (query?.category && query.category !== 'all') {
      list = list.filter((s) => s.category.toLowerCase() === query.category?.toLowerCase());
    }

    if (query?.technology && query.technology !== 'all') {
      const techSlug = query.technology.toLowerCase();
      list = list.filter((s) =>
        s.technologies.some((t) => t.toLowerCase() === techSlug)
      );
    }

    if (query?.source && query.source !== 'all') {
      list = list.filter((s) => s.source === query.source);
    }

    if (query?.verification && query.verification !== ('all' as VerificationStatus)) {
      list = list.filter((s) => s.verification_status === query.verification);
    }

    if (query?.minImportance) {
      const min = query.minImportance;
      list = list.filter((s) => s.importance_score >= min);
    }

    if (query?.q && query.q.trim()) {
      const cleanQuery = query.q.toLowerCase().trim();
      const rawTokens = cleanQuery.split(/[^a-z0-9_-]+/).filter((t) => t.length > 1);
      const meaningfulTokens = rawTokens.filter((t) => !STOP_WORDS.has(t));
      const tokens = meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;

      const scoredList: Array<{ signal: Signal; score: number }> = [];

      for (const s of list) {
        let score = 0;
        const titleLower = s.title.toLowerCase();
        const summaryLower = s.summary.toLowerCase();
        const detailedLower = (s.detailed_summary || '').toLowerCase();
        const categoryLower = s.category.toLowerCase();
        const pubYear = s.published_at.slice(0, 4);

        // Substring / exact phrase match boost
        if (titleLower.includes(cleanQuery)) {
          score += 120;
        } else if (summaryLower.includes(cleanQuery) || detailedLower.includes(cleanQuery)) {
          score += 80;
        }

        // Token-level scoring
        for (const token of tokens) {
          // Check technologies
          if (s.technologies.some((t) => t.toLowerCase() === token || t.toLowerCase().includes(token))) {
            score += 45;
          }
          // Check entities
          if (s.entities.some((e) => e.toLowerCase().includes(token))) {
            score += 35;
          }
          // Check tags
          if (s.tags.some((tag) => tag.toLowerCase().includes(token))) {
            score += 30;
          }
          // Check title
          if (titleLower.includes(token)) {
            score += 25;
          }
          // Check category
          if (categoryLower.includes(token)) {
            score += 20;
          }
          // Check source-derived facts
          if (s.source_derived_facts.some((f) => f.toLowerCase().includes(token))) {
            score += 20;
          }
          // Check summary
          if (summaryLower.includes(token) || detailedLower.includes(token)) {
            score += 15;
          }
          // Check year token match
          if (token === pubYear || (token.startsWith('20') && pubYear.includes(token))) {
            score += 25;
          }
        }

        if (score > 0) {
          scoredList.push({ signal: s, score });
        }
      }

      return scoredList
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if (b.signal.importance_score !== a.signal.importance_score) {
            return b.signal.importance_score - a.signal.importance_score;
          }
          return new Date(b.signal.published_at).getTime() - new Date(a.signal.published_at).getTime();
        })
        .map((item) => item.signal);
    }

    return list.sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
  }

  getSignalById(id: string): Signal | undefined {
    return this.signals.get(id);
  }

  getSignalsForTechnology(techSlug: string): Signal[] {
    return Array.from(this.signals.values())
      .filter((s) => s.technologies.includes(techSlug))
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }

  addSignal(signal: Signal): Signal {
    this.signals.set(signal.id, signal);

    // Update technology stats
    for (const techSlug of signal.technologies) {
      const tech = this.technologies.get(techSlug);
      if (tech) {
        tech.stats.signals_count += 1;
        tech.latest_update = signal.published_at.slice(0, 10);
      }
    }
    return signal;
  }

  updateSignal(id: string, updates: Partial<Signal>): Signal | undefined {
    const existing = this.signals.get(id);
    if (!existing) return undefined;
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.signals.set(id, updated);
    return updated;
  }

  // Timelines
  getTimelineEvents(technologySlug?: string): TimelineEvent[] {
    let list = Array.from(this.timelineEvents.values());
    if (technologySlug && technologySlug !== 'all') {
      list = list.filter((e) => e.technology_slug === technologySlug);
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  addTimelineEvent(evt: TimelineEvent): TimelineEvent {
    this.timelineEvents.set(evt.id, evt);
    return evt;
  }

  // Releases
  getReleases(technologySlug?: string): Release[] {
    let list = Array.from(this.releases.values());
    if (technologySlug) {
      list = list.filter((r) => r.technology_slug === technologySlug);
    }
    return list.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
  }

  addRelease(release: Release): Release {
    this.releases.set(release.id, release);
    const tech = this.technologies.get(release.technology_slug);
    if (tech) {
      tech.stats.releases_count += 1;
      tech.latest_update = release.release_date;
    }
    return release;
  }

  // Security Advisories
  getSecurityAdvisories(technologySlug?: string): SecurityAdvisory[] {
    let list = Array.from(this.securityAdvisories.values());
    if (technologySlug) {
      list = list.filter((s) => s.affected_technology_slug === technologySlug);
    }
    return list.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }

  addSecurityAdvisory(advisory: SecurityAdvisory): SecurityAdvisory {
    this.securityAdvisories.set(advisory.id, advisory);
    if (advisory.affected_technology_slug) {
      const tech = this.technologies.get(advisory.affected_technology_slug);
      if (tech) {
        tech.stats.vulnerabilities_count += 1;
      }
    }
    return advisory;
  }

  // Research Papers
  getResearchPapers(technologySlug?: string): ResearchPaper[] {
    let list = Array.from(this.researchPapers.values());
    if (technologySlug) {
      list = list.filter((p) => p.related_technologies.includes(technologySlug));
    }
    return list.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }

  addResearchPaper(paper: ResearchPaper): ResearchPaper {
    this.researchPapers.set(paper.id, paper);
    return paper;
  }

  // Knowledge Graph
  getKnowledgeGraph() {
    return {
      nodes: Array.from(this.graphNodes.values()),
      edges: Array.from(this.graphEdges.values()),
    };
  }

  // Digests
  getDailyDigest(date?: string): DailyDigest | undefined {
    if (date && this.dailyDigests.has(date)) {
      return this.dailyDigests.get(date);
    }
    // Return newest
    const sorted = Array.from(this.dailyDigests.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sorted[0];
  }

  saveDailyDigest(digest: DailyDigest): DailyDigest {
    this.dailyDigests.set(digest.date, digest);
    return digest;
  }

  // Ingestion Jobs
  getProcessingJobs(): ProcessingJob[] {
    return [...this.processingJobs].sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );
  }

  addProcessingJob(job: ProcessingJob): ProcessingJob {
    this.processingJobs.unshift(job);
    return job;
  }

  updateProcessingJob(id: string, updates: Partial<ProcessingJob>): ProcessingJob | undefined {
    const job = this.processingJobs.find((j) => j.id === id);
    if (!job) return undefined;
    Object.assign(job, updates);
    return job;
  }

  // Duplicate candidates
  getDuplicateCandidates() {
    return this.duplicateCandidates;
  }

  resolveDuplicate(id: string, action: 'merge' | 'reject') {
    const item = this.duplicateCandidates.find((c) => c.id === id);
    if (item) {
      item.status = action === 'merge' ? 'merged' : 'rejected';
      if (action === 'merge') {
        const tech = this.technologies.get(item.canonicalSlug);
        if (tech && !tech.aliases.includes(item.targetName)) {
          tech.aliases.push(item.targetName);
        }
      }
    }
    return item;
  }

  // Statistics
  getSystemMetrics() {
    const signals = Array.from(this.signals.values());
    const verifiedCount = signals.filter((s) => s.verification_status === 'verified').length;
    const partialCount = signals.filter((s) => s.verification_status === 'partially_verified').length;
    const unverifiedCount = signals.filter((s) => s.verification_status === 'unverified').length;

    const categories: Record<string, number> = {};
    for (const sig of signals) {
      categories[sig.category] = (categories[sig.category] || 0) + 1;
    }

    return {
      totalSignals: signals.length,
      totalTechnologies: this.technologies.size,
      totalReleases: this.releases.size,
      totalAdvisories: this.securityAdvisories.size,
      totalPapers: this.researchPapers.size,
      verificationRate: Math.round((verifiedCount / (signals.length || 1)) * 100),
      verificationBreakdown: {
        verified: verifiedCount,
        partially_verified: partialCount,
        unverified: unverifiedCount,
      },
      categoryDistribution: categories,
      totalJobs: this.processingJobs.length,
      successfulJobs: this.processingJobs.filter((j) => j.status === 'completed').length,
    };
  }
}

// Global Singleton
export const archiveStore = new ArchiveStore();
