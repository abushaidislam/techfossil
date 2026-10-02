# Ingestion Pipeline Specification

## Lifecycle Progression
Every ingested item transitions through verifiable states:
```
DISCOVERED → PROCESSED → VERIFIED → PUBLISHED → UPDATED → ARCHIVED
```

## Source Adapters Interface
To add a new adapter, implement the `SourceAdapter` interface in `src/server/adapters/`:
```typescript
export interface SourceAdapter {
  getSourceMetadata(): SourceMetadata;
  fetch(): Promise<RawDiscoveredItem[]>;
  normalize(item: RawDiscoveredItem): Promise<Partial<Signal>>;
  identify(item: RawDiscoveredItem): string;
}
```

## Ingestion Policies
1. **Respect Upstream Policies**: Adhere strictly to rate limits, robots.txt, and canonical headers.
2. **Deterministic Deduplication**: Signals with identical canonical URLs or matching content fingerprints are discarded as duplicate counts.
3. **No Synthetic Manipulation**: Commits and events are only published when real upstream changes occur.
