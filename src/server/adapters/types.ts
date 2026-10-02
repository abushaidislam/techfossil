import { Signal, SourceType } from '../../types';

export interface RawDiscoveredItem {
  externalId: string;
  source: SourceType;
  title: string;
  url: string;
  content: string;
  publishedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SourceMetadata {
  id: string;
  name: string;
  sourceType: SourceType;
  description: string;
  rateLimitPerMinute: number;
  officialSource: boolean;
  frequency: string;
}

export interface SourceAdapter {
  getSourceMetadata(): SourceMetadata;
  fetch(): Promise<RawDiscoveredItem[]>;
  normalize(item: RawDiscoveredItem): Promise<Partial<Signal>>;
  identify(item: RawDiscoveredItem): string; // canonical unique hash/ID
}
