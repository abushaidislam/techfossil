import crypto from 'crypto';
import { archiveStore } from './store';
import {
  Signal,
  ProcessingJob,
  SourceType,
  CategoryType,
  TimelineEvent,
  VerificationStatus,
} from '../types';
import { RawDiscoveredItem, SourceAdapter, SourceMetadata } from './adapters/types';
import { analyzeRawSignalWithGemini } from './gemini';
import { fetchWithRetry } from './utils/fetch';

export function computeContentHash(str: string): string {
  return crypto.createHash('sha256').update(str).digest('hex').substring(0, 16);
}

export function normalizeCanonicalUrl(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    parsed.hash = '';
    // Strip common tracking query params
    const searchParams = new URLSearchParams(parsed.search);
    const trackingKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref'];
    trackingKeys.forEach((key) => searchParams.delete(key));
    parsed.search = searchParams.toString();

    let result = parsed.toString();
    if (result.endsWith('/')) {
      result = result.slice(0, -1);
    }
    return result;
  } catch {
    return urlStr.trim();
  }
}

// ==========================================
// SOURCE ADAPTER IMPLEMENTATIONS
// ==========================================

export class GitHubReleasesAdapter implements SourceAdapter {
  private repos = [
    'facebook/react',
    'microsoft/TypeScript',
    'vercel/next.js',
    'rust-lang/rust',
    'oven-sh/bun',
  ];

  getSourceMetadata(): SourceMetadata {
    return {
      id: 'github_releases',
      name: 'GitHub Releases & Tags',
      sourceType: 'github_release',
      description: 'Monitors official semantic version releases across high-impact open source repositories.',
      rateLimitPerMinute: 60,
      officialSource: true,
      frequency: 'Every 2 hours',
    };
  }

  identify(item: RawDiscoveredItem): string {
    return `github_${computeContentHash(normalizeCanonicalUrl(item.url))}`;
  }

  async fetch(): Promise<RawDiscoveredItem[]> {
    const items: RawDiscoveredItem[] = [];
    const githubToken = process.env.GITHUB_TOKEN;

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };
    if (githubToken) {
      headers.Authorization = `Bearer ${githubToken}`;
    }

    for (const repo of this.repos) {
      try {
        const url = `https://api.github.com/repos/${repo}/releases?per_page=3`;
        const response = await fetchWithRetry(url, { headers, retries: 2, timeoutMs: 10000 });

        if (!response.ok) {
          continue;
        }

        const releases = (await response.json()) as Array<{
          id: number;
          name: string;
          tag_name: string;
          html_url: string;
          body: string;
          published_at: string;
          created_at: string;
          draft: boolean;
          prerelease: boolean;
        }>;

        if (!Array.isArray(releases)) continue;

        for (const rel of releases) {
          if (rel.draft) continue;

          const title = rel.name || `${repo} ${rel.tag_name}`;
          const content = rel.body ? rel.body.slice(0, 1000) : `Official release ${rel.tag_name} for ${repo}`;
          const publishedAt = rel.published_at || rel.created_at || new Date().toISOString();

          items.push({
            externalId: `github-${repo.replace('/', '-')}-${rel.tag_name}`,
            source: 'github_release',
            title: `${repo} ${rel.tag_name}: ${title}`,
            url: rel.html_url,
            content,
            publishedAt,
            metadata: { repo, tag: rel.tag_name, prerelease: rel.prerelease },
          });
        }
      } catch (err) {
        console.warn(`GitHubReleasesAdapter warning for ${repo}:`, err);
      }
    }

    return items;
  }

  async normalize(item: RawDiscoveredItem): Promise<Partial<Signal>> {
    return {
      title: item.title,
      canonical_url: normalizeCanonicalUrl(item.url),
      source: 'github_release',
      source_label: 'GitHub Official Release',
      published_at: item.publishedAt,
    };
  }
}

export class NpmRegistryAdapter implements SourceAdapter {
  private packages = [
    '@modelcontextprotocol/sdk',
    'drizzle-orm',
    'ai',
    'next',
    'react',
  ];

  getSourceMetadata(): SourceMetadata {
    return {
      id: 'npm_registry',
      name: 'npm Package Registry',
      sourceType: 'npm',
      description: 'Tracks semantic releases and package manifest updates on the npm ecosystem.',
      rateLimitPerMinute: 100,
      officialSource: true,
      frequency: 'Every hour',
    };
  }

  identify(item: RawDiscoveredItem): string {
    return `npm_${computeContentHash(normalizeCanonicalUrl(item.url))}`;
  }

  async fetch(): Promise<RawDiscoveredItem[]> {
    const items: RawDiscoveredItem[] = [];

    for (const pkgName of this.packages) {
      try {
        const encodedPkg = pkgName.includes('/') ? pkgName.replace('/', '%2F') : pkgName;
        const url = `https://registry.npmjs.org/${encodedPkg}`;
        const response = await fetchWithRetry(url, { retries: 2, timeoutMs: 10000 });

        if (!response.ok) continue;

        const data = (await response.json()) as {
          name: string;
          description?: string;
          'dist-tags'?: Record<string, string>;
          time?: Record<string, string>;
        };

        if (!data || !data['dist-tags'] || !data['dist-tags'].latest) continue;

        const latestVersion = data['dist-tags'].latest;
        const releaseTime = data.time ? data.time[latestVersion] || new Date().toISOString() : new Date().toISOString();
        const pkgUrl = `https://www.npmjs.com/package/${pkgName}/v/${latestVersion}`;

        items.push({
          externalId: `npm-${pkgName.replace(/[@/]/g, '-')}-${latestVersion}`,
          source: 'npm',
          title: `${pkgName} v${latestVersion} Released on npm`,
          url: pkgUrl,
          content: data.description || `${pkgName} version ${latestVersion} published to npm registry.`,
          publishedAt: releaseTime,
          metadata: { packageName: pkgName, version: latestVersion },
        });
      } catch (err) {
        console.warn(`NpmRegistryAdapter warning for ${pkgName}:`, err);
      }
    }

    return items;
  }

  async normalize(item: RawDiscoveredItem): Promise<Partial<Signal>> {
    return {
      title: item.title,
      canonical_url: normalizeCanonicalUrl(item.url),
      source: 'npm',
      source_label: 'npm Registry',
      published_at: item.publishedAt,
    };
  }
}

export class ArxivResearchAdapter implements SourceAdapter {
  getSourceMetadata(): SourceMetadata {
    return {
      id: 'arxiv_cs',
      name: 'arXiv Computer Science Feed',
      sourceType: 'arxiv',
      description: 'Collects preprints and peer-reviewed advancements in cs.AI, cs.SE, cs.CR, and distributed systems.',
      rateLimitPerMinute: 30,
      officialSource: true,
      frequency: 'Daily at 00:00 UTC',
    };
  }

  identify(item: RawDiscoveredItem): string {
    return `arxiv_${computeContentHash(normalizeCanonicalUrl(item.url))}`;
  }

  async fetch(): Promise<RawDiscoveredItem[]> {
    const items: RawDiscoveredItem[] = [];

    try {
      const url =
        'https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.SE+OR+cat:cs.PL&max_results=8&sortBy=submittedDate&sortOrder=descending';
      const response = await fetchWithRetry(url, { retries: 2, timeoutMs: 12000 });

      if (response.ok) {
        const xmlText = await response.text();

        // Check if rate limited
        if (!xmlText.includes('Rate exceeded')) {
          const entryMatches = xmlText.match(/<entry>[\s\S]*?<\/entry>/g) || [];

          for (const entry of entryMatches) {
            const idMatch = entry.match(/<id>(.*?)<\/id>/);
            const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
            const summaryMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/);
            const publishedMatch = entry.match(/<published>(.*?)<\/published>/);

            if (idMatch && titleMatch) {
              const rawUrl = idMatch[1].trim();
              const arxivId = rawUrl.split('/abs/')[1] || rawUrl.split('/id/')[1] || computeContentHash(rawUrl);
              const cleanTitle = titleMatch[1].replace(/\s+/g, ' ').trim();
              const cleanSummary = summaryMatch ? summaryMatch[1].replace(/\s+/g, ' ').trim() : cleanTitle;
              const pubDate = publishedMatch ? publishedMatch[1].trim() : new Date().toISOString();

              items.push({
                externalId: `arxiv-${arxivId}`,
                source: 'arxiv',
                title: cleanTitle,
                url: rawUrl.replace('http://', 'https://'),
                content: cleanSummary,
                publishedAt: pubDate,
                metadata: { arxivId },
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn('ArxivResearchAdapter warning:', err);
    }

    return items;
  }

  async normalize(item: RawDiscoveredItem): Promise<Partial<Signal>> {
    return {
      title: item.title,
      canonical_url: normalizeCanonicalUrl(item.url),
      source: 'arxiv',
      source_label: 'arXiv cs.AI',
      published_at: item.publishedAt,
    };
  }
}

export class SecurityAdvisoriesAdapter implements SourceAdapter {
  private keyPackages = ['next', 'react', 'express', 'golang', 'rust'];

  getSourceMetadata(): SourceMetadata {
    return {
      id: 'cve_security',
      name: 'OSV & Security Feeds',
      sourceType: 'cve_feed',
      description: 'Monitors Open Source Vulnerabilities (OSV) database and security bulletins.',
      rateLimitPerMinute: 60,
      officialSource: true,
      frequency: 'Every 3 hours',
    };
  }

  identify(item: RawDiscoveredItem): string {
    return `cve_${computeContentHash(normalizeCanonicalUrl(item.url))}`;
  }

  async fetch(): Promise<RawDiscoveredItem[]> {
    const items: RawDiscoveredItem[] = [];

    for (const pkg of this.keyPackages) {
      try {
        const response = await fetchWithRetry('https://api.osv.dev/v1/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ package: { name: pkg, ecosystem: 'npm' } }),
          retries: 2,
          timeoutMs: 10000,
        });

        if (!response.ok) continue;

        const data = (await response.json()) as {
          vulns?: Array<{
            id: string;
            summary?: string;
            details?: string;
            published?: string;
            modified?: string;
            references?: Array<{ type: string; url: string }>;
          }>;
        };

        if (!data.vulns || !Array.isArray(data.vulns)) continue;

        for (const vuln of data.vulns.slice(0, 2)) {
          const title = vuln.summary || `${vuln.id} Security Advisory for ${pkg}`;
          const content = vuln.details ? vuln.details.slice(0, 1000) : title;
          const refUrl =
            vuln.references && vuln.references.length > 0
              ? vuln.references[0].url
              : `https://osv.dev/vulnerability/${vuln.id}`;
          const publishedAt = vuln.published || vuln.modified || new Date().toISOString();

          items.push({
            externalId: vuln.id,
            source: 'cve_feed',
            title: `${vuln.id}: ${title}`,
            url: refUrl,
            content,
            publishedAt,
            metadata: { osvId: vuln.id, pkg },
          });
        }
      } catch (err) {
        console.warn(`SecurityAdvisoriesAdapter warning for ${pkg}:`, err);
      }
    }

    return items;
  }

  async normalize(item: RawDiscoveredItem): Promise<Partial<Signal>> {
    return {
      title: item.title,
      canonical_url: normalizeCanonicalUrl(item.url),
      source: 'cve_feed',
      source_label: 'OSV Security Feed',
      published_at: item.publishedAt,
    };
  }
}

// ==========================================
// MODULAR INGESTION PIPELINE ORCHESTRATOR
// ==========================================

export class IngestionPipeline {
  private adapters: Map<string, SourceAdapter> = new Map();

  constructor() {
    this.registerAdapter(new GitHubReleasesAdapter());
    this.registerAdapter(new NpmRegistryAdapter());
    this.registerAdapter(new ArxivResearchAdapter());
    this.registerAdapter(new SecurityAdvisoriesAdapter());
  }

  registerAdapter(adapter: SourceAdapter) {
    this.adapters.set(adapter.getSourceMetadata().id, adapter);
  }

  getAdaptersList(): SourceMetadata[] {
    return Array.from(this.adapters.values()).map((a) => a.getSourceMetadata());
  }

  async executeCycle(targetSourceId?: string): Promise<ProcessingJob> {
    const jobId = `job-${Date.now()}`;
    const startTime = new Date().toISOString();

    const job: ProcessingJob = {
      id: jobId,
      source: (targetSourceId as SourceType) || 'all',
      started_at: startTime,
      status: 'running',
      records_found: 0,
      records_processed: 0,
      records_created: 0,
      duplicates: 0,
      errors: [],
      logs: [
        { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Pipeline started [Job ${jobId}].` },
      ],
    };

    archiveStore.addProcessingJob(job);

    try {
      const selectedAdapters = targetSourceId && targetSourceId !== 'all'
        ? [this.adapters.get(targetSourceId)].filter(Boolean) as SourceAdapter[]
        : Array.from(this.adapters.values());

      job.logs.push({
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        message: `STAGE 1 & 2: COLLECT - Querying ${selectedAdapters.length} active source adapters...`,
      });

      // 1. COLLECT
      const rawItems: RawDiscoveredItem[] = [];
      for (const adapter of selectedAdapters) {
        try {
          const items = await adapter.fetch();
          rawItems.push(...items);
          job.logs.push({
            timestamp: new Date().toLocaleTimeString(),
            level: 'info',
            message: `[${adapter.getSourceMetadata().name}] Discovered ${items.length} raw candidates from upstream APIs.`,
          });
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          job.errors.push(`Adapter ${adapter.getSourceMetadata().id} error: ${errMsg}`);
          job.logs.push({
            timestamp: new Date().toLocaleTimeString(),
            level: 'warn',
            message: `Error querying adapter: ${errMsg}`,
          });
        }
      }

      job.records_found = rawItems.length;

      // 2. NORMALIZE & DEDUPLICATE
      job.logs.push({
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        message: `STAGE 3 & 4: NORMALIZE & DEDUPLICATE - Checking canonical URLs & content hashes...`,
      });

      const existingSignals = archiveStore.getAllSignals();
      const existingUrls = new Set(existingSignals.map((s) => normalizeCanonicalUrl(s.canonical_url).toLowerCase()));
      const existingHashes = new Set(existingSignals.map((s) => computeContentHash(normalizeCanonicalUrl(s.canonical_url))));

      for (const item of rawItems) {
        job.records_processed += 1;

        const normalizedUrl = normalizeCanonicalUrl(item.url).toLowerCase();
        const contentHash = computeContentHash(normalizedUrl);

        if (existingUrls.has(normalizedUrl) || existingHashes.has(contentHash)) {
          job.duplicates += 1;
          job.logs.push({
            timestamp: new Date().toLocaleTimeString(),
            level: 'info',
            message: `Deduplication: Skipped existing record: ${item.url}`,
          });
          continue;
        }

        // 3. CLASSIFY & EXTRACT ENTITIES via Gemini / Fallback
        job.logs.push({
          timestamp: new Date().toLocaleTimeString(),
          level: 'info',
          message: `STAGE 5 & 6: CLASSIFY & EXTRACT ENTITIES for: "${item.title.slice(0, 40)}..."`,
        });

        const analysis = await analyzeRawSignalWithGemini({
          title: item.title,
          content: item.content,
          source: item.source,
          url: item.url,
        });

        // 4. VERIFY EVIDENCE
        const isOfficialSource = ['github_release', 'official_blog', 'documentation', 'cve_feed', 'npm', 'arxiv'].includes(item.source);
        const verificationStatus: VerificationStatus = isOfficialSource ? 'verified' : 'partially_verified';

        // 5. CALCULATE IMPORTANCE SCORE
        let importance = analysis.importance_score || 80;
        if (item.source === 'cve_feed') importance += 10;
        if (item.source === 'github_release' || item.source === 'npm') importance += 5;
        importance = Math.min(100, Math.max(1, importance));

        // 6. BUILD SIGNAL OBJECT
        const signalId = `sig-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const newSignal: Signal = {
          id: signalId,
          title: item.title,
          canonical_url: normalizeCanonicalUrl(item.url),
          source: item.source,
          source_label: item.source.replace(/_/g, ' ').toUpperCase(),
          published_at: item.publishedAt,
          discovered_at: new Date().toISOString(),
          category: analysis.category,
          summary: analysis.summary,
          detailed_summary: analysis.detailed_summary,
          importance_score: importance,
          confidence_score: 0.95,
          entities: analysis.entities,
          technologies: analysis.technologies,
          organizations: [],
          tags: [analysis.category.toLowerCase().replace(/\s+/g, '-'), item.source],
          evidence: [
            {
              id: `ev-${signalId}-1`,
              type: isOfficialSource ? 'official_source' : 'secondary_report',
              label: `${item.source} upstream API record`,
              url: item.url,
              verified: isOfficialSource,
              discovered_at: new Date().toISOString(),
              details: `Discovered during ingestion pipeline execution [Job ${jobId}].`,
            },
          ],
          verification_status: verificationStatus,
          lifecycle_status: 'published',
          source_derived_facts: analysis.source_derived_facts,
          ai_analysis: analysis.ai_analysis,
          inferred_relationships: [],
          related_signals: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // 7. STORE & INDEX
        archiveStore.addSignal(newSignal);
        job.records_created += 1;
        existingUrls.add(normalizedUrl);
        existingHashes.add(contentHash);

        // 8. UPDATE DOMAIN TABLES (Releases, CVEs, Research Papers)
        const mainTech = analysis.technologies[0] || 'open-source';

        if (item.source === 'github_release' || item.source === 'npm') {
          const versionMatch = item.title.match(/v?\d+\.\d+(\.\d+)?(-[a-z0-9.]+)?/i);
          const version = versionMatch ? versionMatch[0] : 'v1.0.0';
          const normVer = version.startsWith('v') ? version : `v${version}`;
          archiveStore.addRelease({
            id: `rel-${signalId}`,
            technology_slug: mainTech,
            version: normVer,
            tag_name: normVer,
            release_date: item.publishedAt.slice(0, 10),
            is_breaking: item.title.toLowerCase().includes('major') || item.content.toLowerCase().includes('breaking'),
            highlights: analysis.source_derived_facts,
            source_url: item.url,
            signal_id: signalId,
          });
        } else if (item.source === 'cve_feed') {
          const cveMatch = item.title.match(/CVE-\d{4}-\d+/i) || item.externalId.match(/CVE-\d{4}-\d+/i) || item.externalId.match(/GHSA-[a-z0-9-]+/i);
          const cveId = cveMatch ? cveMatch[0].toUpperCase() : item.externalId;
          archiveStore.addSecurityAdvisory({
            id: `sec-${signalId}`,
            cve_id: cveId,
            title: item.title,
            severity: 'high',
            affected_technology_slug: mainTech,
            affected_versions: '< latest patch',
            patched_version: 'latest patch',
            published_at: item.publishedAt,
            description: analysis.summary,
            source_url: item.url,
            signal_id: signalId,
          });
        } else if (item.source === 'arxiv') {
          const arxivNum = item.externalId.replace('arxiv-', '');
          archiveStore.addResearchPaper({
            id: `paper-${signalId}`,
            arxiv_id: `arXiv:${arxivNum}`,
            title: item.title,
            authors: analysis.entities.length > 0 ? analysis.entities : ['Academic Research Consortium'],
            abstract: analysis.detailed_summary,
            published_at: item.publishedAt,
            primary_category: (item.metadata?.category as string) || 'cs.AI',
            related_technologies: analysis.technologies,
            pdf_url: `https://arxiv.org/pdf/${arxivNum}.pdf`,
            source_url: item.url,
            signal_id: signalId,
          });
        }

        // 9. UPDATE TIMELINE IF HIGH IMPORTANCE (>= 75)
        if (importance >= 75 && analysis.technologies.length > 0) {
          const newEvent: TimelineEvent = {
            id: `tl-${signalId}`,
            technology_slug: mainTech,
            year: new Date().getFullYear(),
            quarter: 'Q4',
            date: item.publishedAt.slice(0, 10),
            event_type: item.source === 'cve_feed' ? 'security' : 'release',
            title: item.title,
            description: analysis.summary,
            importance: importance,
            signal_id: signalId,
            source_url: item.url,
          };
          archiveStore.addTimelineEvent(newEvent);
        }

        job.logs.push({
          timestamp: new Date().toLocaleTimeString(),
          level: 'info',
          message: `STORED & INDEXED: [${signalId}] ${newSignal.title}`,
        });
      }

      job.status = 'completed';
      job.finished_at = new Date().toISOString();
      job.logs.push({
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        message: `Pipeline cycle completed successfully. Created: ${job.records_created}, Duplicates: ${job.duplicates}.`,
      });

      archiveStore.updateProcessingJob(job.id, job);
      return job;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      job.status = 'failed';
      job.finished_at = new Date().toISOString();
      job.errors.push(errMsg);
      job.logs.push({
        timestamp: new Date().toLocaleTimeString(),
        level: 'error',
        message: `Pipeline fatal failure: ${errMsg}`,
      });
      archiveStore.updateProcessingJob(job.id, job);
      return job;
    }
  }
}

export const ingestionPipeline = new IngestionPipeline();
