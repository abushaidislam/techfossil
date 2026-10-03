import { RawDiscoveredItem, SourceAdapter, SourceMetadata } from './types';
import { fetchWithTimeout, withRetry } from '../utils/retry';
import { Signal } from '../../types';

export class SecurityAdvisoriesAdapter implements SourceAdapter {
  getSourceMetadata(): SourceMetadata {
    return {
      id: 'cve_security',
      name: 'GitHub Advisory & CVE Feed (Live API)',
      sourceType: 'cve_feed',
      description: 'Monitors verified public security advisories, CVE identifiers, and CVSS scores from GitHub Security Database.',
      rateLimitPerMinute: 60,
      officialSource: true,
      frequency: 'Every 3 hours',
    };
  }

  identify(item: RawDiscoveredItem): string {
    return `cve_${item.externalId}`;
  }

  async fetch(): Promise<RawDiscoveredItem[]> {
    return withRetry(async () => {
      // Query GitHub Advisories API directly for verified high/critical security disclosures
      const url = 'https://api.github.com/advisories?per_page=6&severity=high,critical';
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'TechFossil-Intelligence-Archive/1.0 (+https://github.com/techfossil/archive)',
      };
      if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
      }

      const res = await fetchWithTimeout(url, { headers });

      if (res.status === 403 || res.status === 429 || !res.ok) {
        console.warn(`[Security Adapter] GitHub advisory status ${res.status}, querying OSV database fallback...`);
        return this.fetchFromOsv();
      }

      const advisories = await res.json();
      if (!Array.isArray(advisories) || advisories.length === 0) {
        return this.fetchFromOsv();
      }

      return advisories.map((adv: any): RawDiscoveredItem => {
        const ghsaId = adv.ghsa_id || 'GHSA-UNKNOWN';
        const cveId = adv.cve_id || ghsaId;
        const summary = adv.summary || 'Security advisory published';
        const severity = (adv.severity || 'high').toLowerCase();
        const publishedAt = adv.published_at || adv.updated_at || new Date().toISOString();
        const description = (adv.description || summary).slice(0, 3000);

        // Extract affected package information
        const firstPkg = adv.vulnerabilities?.[0]?.package;
        const affectedPkgName = firstPkg?.name || 'ecosystem';
        const patchedVer = adv.vulnerabilities?.[0]?.first_patched_version || 'patched release';

        return {
          externalId: cveId.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '-'),
          source: 'cve_feed',
          title: `${cveId}: [${severity.toUpperCase()}] ${summary} in ${affectedPkgName}`,
          url: adv.html_url || `https://github.com/advisories/${ghsaId}`,
          content: `${summary}\n\nAffected Package: ${affectedPkgName}\nPatched In: ${patchedVer}\nSeverity: ${severity}\nCVE: ${cveId}\n\nDetails:\n${description}`,
          publishedAt,
          metadata: {
            cve_id: cveId,
            ghsa_id: ghsaId,
            severity,
            affected_package: affectedPkgName,
            patched_version: patchedVer,
            cvss_score: adv.cvss?.score || 8.5,
          },
        };
      });
    }, { maxRetries: 2, initialBackoffMs: 800 });
  }

  private async fetchFromOsv(): Promise<RawDiscoveredItem[]> {
    const packagesToAudit = [
      { name: 'next', eco: 'npm', tech: 'nextjs' },
      { name: 'fastapi', eco: 'PyPI', tech: 'python' },
      { name: 'jsonwebtoken', eco: 'npm', tech: 'security' },
      { name: 'drizzle-orm', eco: 'npm', tech: 'databases' },
    ];

    const results: RawDiscoveredItem[] = [];

    for (const pkg of packagesToAudit) {
      try {
        const res = await fetchWithTimeout('https://api.osv.dev/v1/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            package: {
              name: pkg.name,
              ecosystem: pkg.eco,
            },
          }),
        }, 5000);

        if (!res.ok) continue;
        const data = await res.json();
        const vulns = Array.isArray(data.vulns) ? data.vulns.slice(0, 2) : [];

        for (const v of vulns) {
          const cveId = (v.aliases && v.aliases.find((a: string) => a.startsWith('CVE-'))) || v.id;
          const summary = v.summary || `Vulnerability in ${pkg.name}`;
          const publishedAt = v.published || new Date().toISOString();
          const details = (v.details || summary).slice(0, 2500);

          results.push({
            externalId: cveId.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '-'),
            source: 'cve_feed',
            title: `${cveId}: High Security Advisory in ${pkg.name}`,
            url: `https://osv.dev/vulnerability/${v.id}`,
            content: `${summary}\n\nAffected Package: ${pkg.name} (${pkg.eco})\nCVE: ${cveId}\n\nDetails:\n${details}`,
            publishedAt,
            metadata: {
              cve_id: cveId,
              osv_id: v.id,
              affected_package: pkg.name,
              severity: 'high',
              technology_slug: pkg.tech,
            },
          });
        }
      } catch (err) {
        console.warn(`[Security Adapter] OSV query failed for ${pkg.name}:`, err);
      }
    }

    return results;
  }

  async normalize(item: RawDiscoveredItem): Promise<Partial<Signal>> {
    return {
      title: item.title,
      canonical_url: item.url,
      source: 'cve_feed',
      source_label: 'GitHub Security Advisory Database',
      published_at: item.publishedAt,
    };
  }
}
