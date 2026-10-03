import { RawDiscoveredItem, SourceAdapter, SourceMetadata } from './types';
import { fetchWithTimeout, withRetry } from '../utils/retry';
import { Signal } from '../../types';

const MONITORED_NPM_PACKAGES = [
  { name: '@modelcontextprotocol/sdk', tech: 'ai-agents' },
  { name: 'ai', tech: 'nextjs' },
  { name: 'zod', tech: 'typescript' },
  { name: 'drizzle-orm', tech: 'databases' },
  { name: '@google/genai', tech: 'gemini' },
  { name: 'next', tech: 'nextjs' },
  { name: 'react', tech: 'react' },
];

export class NpmRegistryAdapter implements SourceAdapter {
  getSourceMetadata(): SourceMetadata {
    return {
      id: 'npm_registry',
      name: 'npm Package Registry (Live API)',
      sourceType: 'npm',
      description: 'Monitors real release tags and cryptographic shasums from the official npm public registry.',
      rateLimitPerMinute: 100,
      officialSource: true,
      frequency: 'Every hour',
    };
  }

  identify(item: RawDiscoveredItem): string {
    return `npm_${item.externalId}`;
  }

  async fetch(): Promise<RawDiscoveredItem[]> {
    const discovered: RawDiscoveredItem[] = [];

    for (const target of MONITORED_NPM_PACKAGES) {
      try {
        const item = await withRetry(async () => {
          const url = `https://registry.npmjs.org/${encodeURIComponent(target.name)}`;
          const res = await fetchWithTimeout(url, {
            headers: { Accept: 'application/json' },
          });

          if (!res.ok) {
            throw new Error(`npm registry returned status ${res.status} for ${target.name}`);
          }

          const doc = await res.json();
          const distTags = doc['dist-tags'] || {};
          const latestVersion = distTags.latest;
          if (!latestVersion) return null;

          const verData = doc.versions?.[latestVersion];
          const releaseTime = doc.time?.[latestVersion] || doc.time?.modified || new Date().toISOString();
          const description = verData?.description || doc.description || '';
          const shasum = verData?.dist?.shasum || '';
          const tarball = verData?.dist?.tarball || '';

          return {
            externalId: `${target.name.replace(/[^a-zA-Z0-9_-]/g, '-')}-${latestVersion}`,
            source: 'npm',
            title: `${target.name} v${latestVersion} Released on npm`,
            url: `https://www.npmjs.com/package/${target.name}/v/${latestVersion}`,
            content: `${description}\n\nPackage: ${target.name}\nVersion: ${latestVersion}\nCryptographic Checksum: ${shasum}\nTarball: ${tarball}`,
            publishedAt: releaseTime,
            metadata: {
              package: target.name,
              version: latestVersion,
              shasum,
              technology_slug: target.tech,
              license: verData?.license || 'Open Source',
            },
          } as RawDiscoveredItem;
        }, { maxRetries: 2, initialBackoffMs: 400 });

        if (item) {
          discovered.push(item);
        }
      } catch (err) {
        console.warn(`[npm Adapter] Failed fetching package ${target.name}:`, err);
      }
    }

    return discovered;
  }

  async normalize(item: RawDiscoveredItem): Promise<Partial<Signal>> {
    return {
      title: item.title,
      canonical_url: item.url,
      source: 'npm',
      source_label: 'npm Registry',
      published_at: item.publishedAt,
    };
  }
}
