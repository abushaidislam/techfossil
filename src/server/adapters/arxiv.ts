import { RawDiscoveredItem, SourceAdapter, SourceMetadata } from './types';
import { fetchWithTimeout, withRetry } from '../utils/retry';
import { Signal } from '../../types';

export class ArxivResearchAdapter implements SourceAdapter {
  getSourceMetadata(): SourceMetadata {
    return {
      id: 'arxiv_cs',
      name: 'arXiv Computer Science (Live Feed)',
      sourceType: 'arxiv',
      description: 'Queries Cornell University arXiv API for the latest preprints across cs.AI, cs.SE, cs.PL, and cs.CR.',
      rateLimitPerMinute: 20,
      officialSource: true,
      frequency: 'Daily at 00:00 UTC',
    };
  }

  identify(item: RawDiscoveredItem): string {
    return `arxiv_${item.externalId}`;
  }

  async fetch(): Promise<RawDiscoveredItem[]> {
    return withRetry(async () => {
      const url =
        'https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.SE+OR+cat:cs.PL&start=0&max_results=8&sortBy=submittedDate&sortOrder=descending';
      
      const res = await fetchWithTimeout(url, {
        headers: { Accept: 'application/atom+xml, application/xml, text/xml' },
      });

      if (!res.ok) {
        throw new Error(`arXiv API returned status ${res.status}`);
      }

      const xmlText = await res.text();
      return this.parseAtomFeed(xmlText);
    }, { maxRetries: 2, initialBackoffMs: 1000 });
  }

  private parseAtomFeed(xml: string): RawDiscoveredItem[] {
    const items: RawDiscoveredItem[] = [];
    const entries = xml.split(/<entry[\s>]/).slice(1);

    for (const entry of entries) {
      const idMatch = entry.match(/<id>(.*?)<\/id>/);
      const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
      const summaryMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/);
      const publishedMatch = entry.match(/<published>(.*?)<\/published>/);

      // Extract author names
      const authorMatches = Array.from(entry.matchAll(/<author>\s*<name>(.*?)<\/name>/g)).map(
        (m) => m[1].trim()
      );

      // Extract category
      const catMatch = entry.match(/<arxiv:primary_category\s+term="(.*?)"/);
      const primaryCategory = catMatch ? catMatch[1] : 'cs.AI';

      if (idMatch && titleMatch) {
        const rawIdUrl = idMatch[1].trim();
        const arxivNum = rawIdUrl.split('/abs/').pop() || rawIdUrl;
        const cleanTitle = titleMatch[1].replace(/\s+/g, ' ').trim();
        const cleanSummary = (summaryMatch ? summaryMatch[1] : '').replace(/\s+/g, ' ').trim();
        const publishedAt = publishedMatch ? publishedMatch[1].trim() : new Date().toISOString();

        items.push({
          externalId: `arxiv-${arxivNum}`.replace(/[^a-zA-Z0-9_-]/g, '-'),
          source: 'arxiv',
          title: `[${primaryCategory}] ${cleanTitle}`,
          url: rawIdUrl.replace('http://', 'https://'),
          content: `${cleanTitle}\n\nAbstract:\n${cleanSummary}\n\nAuthors: ${authorMatches.join(', ')}`,
          publishedAt,
          metadata: {
            arxiv_id: `arXiv:${arxivNum}`,
            primary_category: primaryCategory,
            authors: authorMatches,
          },
        });
      }
    }

    return items;
  }

  async normalize(item: RawDiscoveredItem): Promise<Partial<Signal>> {
    return {
      title: item.title,
      canonical_url: item.url,
      source: 'arxiv',
      source_label: 'arXiv Computer Science',
      published_at: item.publishedAt,
    };
  }
}
