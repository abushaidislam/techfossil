import { RawDiscoveredItem, SourceAdapter, SourceMetadata } from './types';
import { fetchWithTimeout, withRetry } from '../utils/retry';
import { Signal } from '../../types';

// Monitored high-impact open-source repositories representing core developer infrastructure
const MONITORED_REPOSITORIES = [
  { owner: 'facebook', repo: 'react', tech: 'react', name: 'React' },
  { owner: 'vercel', repo: 'next.js', tech: 'nextjs', name: 'Next.js' },
  { owner: 'microsoft', repo: 'TypeScript', tech: 'typescript', name: 'TypeScript' },
  { owner: 'rust-lang', repo: 'rust', tech: 'rust', name: 'Rust' },
  { owner: 'oven-sh', repo: 'bun', tech: 'bun', name: 'Bun' },
  { owner: 'nodejs', repo: 'node', tech: 'nodejs', name: 'Node.js' },
  { owner: 'tailwindlabs', repo: 'tailwindcss', tech: 'tailwindcss', name: 'Tailwind CSS' },
  { owner: 'astral-sh', repo: 'uv', tech: 'python', name: 'uv Python Toolchain' },
];

export class GitHubReleasesAdapter implements SourceAdapter {
  getSourceMetadata(): SourceMetadata {
    return {
      id: 'github_releases',
      name: 'GitHub Releases & Tags (Live API)',
      sourceType: 'github_release',
      description: 'Fetches verified semantic version releases and changelogs directly from official GitHub REST API.',
      rateLimitPerMinute: 60,
      officialSource: true,
      frequency: 'Every 2 hours',
    };
  }

  identify(item: RawDiscoveredItem): string {
    return `github_${item.externalId}`;
  }

  async fetch(): Promise<RawDiscoveredItem[]> {
    const discovered: RawDiscoveredItem[] = [];

    // Query upstream repositories with retry and backoff
    for (const target of MONITORED_REPOSITORIES) {
      try {
        const items = await withRetry(async () => {
          const url = `https://api.github.com/repos/${target.owner}/${target.repo}/releases?per_page=3`;
          const headers: Record<string, string> = {
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'TechFossil-Intelligence-Archive/1.0 (+https://github.com/techfossil/archive)',
          };
          if (process.env.GITHUB_TOKEN) {
            headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
          }

          const res = await fetchWithTimeout(url, { headers });

          if (res.status === 403 || res.status === 429) {
            console.warn(`[GitHub Adapter] Rate limited on ${target.owner}/${target.repo}`);
            return [];
          }

          if (!res.ok) {
            throw new Error(`GitHub API returned status ${res.status} for ${target.owner}/${target.repo}`);
          }

          const releases = await res.json();
          if (!Array.isArray(releases)) return [];

          return releases.map((rel: any): RawDiscoveredItem => {
            const tagName = rel.tag_name || 'latest';
            const releaseTitle = rel.name || `${target.name} ${tagName}`;
            const publishedAt = rel.published_at || rel.created_at || new Date().toISOString();
            const body = (rel.body || '').slice(0, 3000); // Truncate huge release notes

            return {
              externalId: `${target.owner}-${target.repo}-${tagName}`.replace(/[^a-zA-Z0-9_-]/g, '-'),
              source: 'github_release',
              title: `${target.owner}/${target.repo} ${tagName}: ${releaseTitle}`,
              url: rel.html_url || `https://github.com/${target.owner}/${target.repo}/releases/tag/${tagName}`,
              content: body || `${target.name} semantic release ${tagName} published on GitHub.`,
              publishedAt,
              metadata: {
                repo: `${target.owner}/${target.repo}`,
                tag: tagName,
                tarball_url: rel.tarball_url,
                technology_slug: target.tech,
                is_prerelease: Boolean(rel.prerelease),
                author: rel.author?.login || target.owner,
              },
            };
          });
        }, { maxRetries: 2, initialBackoffMs: 500 });

        discovered.push(...items);
      } catch (err) {
        console.warn(`[GitHub Adapter] Non-fatal error polling ${target.owner}/${target.repo}:`, err);
      }
    }

    return discovered;
  }

  async normalize(item: RawDiscoveredItem): Promise<Partial<Signal>> {
    return {
      title: item.title,
      canonical_url: item.url,
      source: 'github_release',
      source_label: 'GitHub Official Release',
      published_at: item.publishedAt,
    };
  }
}
