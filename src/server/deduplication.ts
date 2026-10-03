import { Signal } from '../types';
import { generateContentHash, normalizeCanonicalUrl } from './normalization';

export interface DeduplicationMatch {
  isDuplicate: boolean;
  matchType?: 'canonical_url' | 'content_hash' | 'fuzzy_title';
  matchedSignalId?: string;
  confidence: number;
}

export class DeduplicationEngine {
  private urlIndex: Set<string> = new Set();
  private hashIndex: Map<string, string> = new Map(); // hash -> signalId
  private signals: Map<string, Signal> = new Map();

  constructor(existingSignals: Signal[] = []) {
    this.reindex(existingSignals);
  }

  public reindex(signals: Signal[]) {
    this.urlIndex.clear();
    this.hashIndex.clear();
    this.signals.clear();

    for (const sig of signals) {
      const normUrl = normalizeCanonicalUrl(sig.canonical_url).toLowerCase();
      this.urlIndex.add(normUrl);

      const hash = generateContentHash(sig.source, sig.canonical_url, sig.title);
      this.hashIndex.set(hash, sig.id);

      this.signals.set(sig.id, sig);
    }
  }

  public register(signal: Signal) {
    const normUrl = normalizeCanonicalUrl(signal.canonical_url).toLowerCase();
    this.urlIndex.add(normUrl);

    const hash = generateContentHash(signal.source, signal.canonical_url, signal.title);
    this.hashIndex.set(hash, signal.id);

    this.signals.set(signal.id, signal);
  }

  /**
   * Evaluates whether a candidate item is already recorded in the archive
   */
  public evaluate(
    source: string,
    rawUrl: string,
    title: string
  ): DeduplicationMatch {
    const normUrl = normalizeCanonicalUrl(rawUrl).toLowerCase();

    // 1. Tier 1: Canonical URL exact match
    if (this.urlIndex.has(normUrl)) {
      // Find signal ID by URL
      for (const sig of this.signals.values()) {
        if (normalizeCanonicalUrl(sig.canonical_url).toLowerCase() === normUrl) {
          return {
            isDuplicate: true,
            matchType: 'canonical_url',
            matchedSignalId: sig.id,
            confidence: 1.0,
          };
        }
      }
      return {
        isDuplicate: true,
        matchType: 'canonical_url',
        confidence: 1.0,
      };
    }

    // 2. Tier 2: Deterministic Content Hash match
    const hash = generateContentHash(source, normUrl, title);
    if (this.hashIndex.has(hash)) {
      return {
        isDuplicate: true,
        matchType: 'content_hash',
        matchedSignalId: this.hashIndex.get(hash),
        confidence: 0.99,
      };
    }

    // 2b. Tier 2b: CVE identifier exact match
    const cveMatch = title.match(/CVE-\d{4}-\d+/i);
    if (cveMatch) {
      const cveId = cveMatch[0].toUpperCase();
      for (const sig of this.signals.values()) {
        if (
          sig.title.toUpperCase().includes(cveId) ||
          sig.canonical_url.toUpperCase().includes(cveId) ||
          sig.source_derived_facts.some((f) => f.toUpperCase().includes(cveId))
        ) {
          return {
            isDuplicate: true,
            matchType: 'canonical_url',
            matchedSignalId: sig.id,
            confidence: 0.98,
          };
        }
      }
    }

    // 3. Tier 3: Fuzzy title similarity
    const candidateTokens = this.tokenizeTitle(title);
    if (candidateTokens.size >= 3) {
      for (const sig of this.signals.values()) {
        const existingTokens = this.tokenizeTitle(sig.title);
        const jaccard = this.calculateJaccardSimilarity(candidateTokens, existingTokens);

        // High similarity threshold for cross-source deduplication
        if (jaccard >= 0.82) {
          return {
            isDuplicate: true,
            matchType: 'fuzzy_title',
            matchedSignalId: sig.id,
            confidence: Number(jaccard.toFixed(2)),
          };
        }
      }
    }

    return {
      isDuplicate: false,
      confidence: 0,
    };
  }

  private tokenizeTitle(title: string): Set<string> {
    const clean = title.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const tokens = clean.split(/\s+/).filter((t) => t.length > 2);
    return new Set(tokens);
  }

  private calculateJaccardSimilarity(a: Set<string>, b: Set<string>): number {
    if (a.size === 0 || b.size === 0) return 0;
    let intersection = 0;
    for (const item of a) {
      if (b.has(item)) intersection++;
    }
    const union = a.size + b.size - intersection;
    return union === 0 ? 0 : intersection / union;
  }
}
