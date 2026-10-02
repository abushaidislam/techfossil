# TechFossil Relational Data Model

## Core Entities

### 1. Signal
Represents an individual event, release, or announcement discovered in the software ecosystem.
- `id`: Unique identifier (e.g. `sig-2026-1001-react-compiler`)
- `title`: Canonical headline
- `canonical_url`: Upstream primary URL
- `source`: Source identifier (`github_release`, `npm`, `arxiv`, `cve_feed`, `official_blog`)
- `published_at`: ISO 8601 publication timestamp
- `category`: Primary domain category (one of 30+ domains)
- `importance_score`: Calculated impact score (1–100)
- `confidence_score`: Verification confidence (0.0–1.0)
- `evidence`: Corroborating proof items
- `verification_status`: `verified` | `partially_verified` | `unverified`
- `lifecycle_status`: `discovered` | `processed` | `verified` | `published` | `archived`
- `source_derived_facts`: Array of explicit verifiable facts
- `ai_analysis`: Server-generated context summary
- `inferred_relationships`: Linked dependencies

### 2. Technology
Represents a foundational software entity, language, library, or framework.
- `slug`: Canonical identifier (e.g. `react`, `typescript`, `gemini`)
- `name`: Human-readable title
- `category`: Domain
- `first_observed`: Earliest recorded date
- `aliases`: Recognized aliases for entity resolution
- `stats`: Signals count, release count, CVE count, velocity score

### 3. TimelineEvent
Represents a milestone in a technology's chronological evolution.
- `year`: Numeric year (e.g. `2026`)
- `quarter`: `Q1` | `Q2` | `Q3` | `Q4`
- `event_type`: `release` | `breaking_change` | `security` | `announcement` | `rfc` | `research`
- `importance`: Relative importance (1–100)

### 4. Relationship
Graph edge connecting two entities in the knowledge graph.
- `source`: Source node ID
- `target`: Target node ID
- `type`: `developed_by` | `depends_on` | `related_to` | `affects` | `competes_with` | `extends`
- `confidence`: Confidence score
