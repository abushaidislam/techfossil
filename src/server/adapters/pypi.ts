import { RawDiscoveredItem, SourceAdapter, SourceMetadata } from './types';
import { fetchWithTimeout, withRetry } from '../utils/retry';
import { Signal } from '../../types';

const MONITORED_PYPI_PACKAGES = [
  { name: 'fastapi', tech: 'python' },
  { name: 'pydantic', tech: 'python' },
  { name: 'uvicorn', tech: 'python' },
  { name: 'ruff', tech: 'python' },
];

export class PyPiRegistryAdapter implements SourceAdapter {
  getSourceMetadata(): SourceMetadata {
    return {
      id: 'pypi_registry',
      name: 'Python Package Index (PyPI Live API)',
      sourceType: 'pypi',
      description: 'Monitors the official Python Package Index JSON API for high-velocity framework releases.',
      rateLimitPerMinute: 60,
      officialSource: true,
      frequency: 'Every 2 hours',
    };
  }

  identify(item: RawDiscoveredItem): string {
    return `pypi_${item.externalId}`;
  }

  async fetch(): Promise<RawDiscoveredItem[]> {
    const discovered: RawDiscoveredItem[] = [];

    for (const target of MONITORED_PYPI_PACKAGES) {
      try {
        const item = await withRetry(async () => {
          const url = `https://pypi.org/pypi/${target.name}/json`;
          const res = await fetchWithTimeout(url);

          if (!res.ok) {
            throw new Error(`PyPI returned status ${res.status} for ${target.name}`);
          }

          const doc = await res.json();
          const info = doc.info || {};
          const latestVersion = info.version;
          if (!latestVersion) return null;

          const releaseFiles = doc.releases?.[latestVersion] || [];
          const uploadTime = releaseFiles[0]?.upload_time_iso_8601 || new Date().toISOString();
          const sha256 = releaseFiles[0]?.digests?.sha256 || '';

          return {
            externalId: `pypi-${target.name}-${latestVersion}`,
            source: 'pypi',
            title: `${target.name} v${latestVersion} Released on PyPI`,
            url: `https://pypi.org/project/${target.name}/${latestVersion}/`,
            content: `${info.summary || target.name}\n\nPackage: ${target.name}\nVersion: ${latestVersion}\nAuthor: ${info.author || target.name}\nSHA-256 Digest: ${sha256}`,
            publishedAt: uploadTime,
            metadata: {
              package: target.name,
              version: latestVersion,
              sha256,
              technology_slug: target.tech,
              license: info.license || 'MIT / Apache-2.0',
            },
          } as RawDiscoveredItem;
        }, { maxRetries: 2, initialBackoffMs: 500 });

        if (item) {
          discovered.push(item);
        }
      } catch (err) {
        console.warn(`[PyPI Adapter] Failed fetching package ${target.name}:`, err);
      }
    }

    return discovered;
  }

  async normalize(item: RawDiscoveredItem): Promise<Partial<Signal>> {
    return {
      title: item.title,
      canonical_url: item.url,
      source: 'pypi',
      source_label: 'Python Package Index (PyPI)',
      published_at: item.publishedAt,
    };
  }
}
