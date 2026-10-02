# TechFossil 🏛️
> **"Preserving the evolution of technology."**

TechFossil is an open-source, continuously growing technology intelligence archive. It systematically ingests important developments from across the software ecosystem, normalizes and deduplicates them into structured knowledge, verifies evidence against primary sources, constructs historical evolution timelines, and maintains a versioned public dataset.

---

## 🌟 Why TechFossil Exists

Large language models frequently suffer from hallucinations, temporal decay, and ungrounded conjectures when answering questions about framework upgrades, breaking changes, or CVE mitigations. 

TechFossil solves this by building an auditable, source-derived historical ledger that compounds in value over time:
- **Day 1**: A verified baseline archive.
- **Day 30**: A daily-updated technology intelligence feed.
- **Day 180**: A searchable dataset of software evolution.
- **Day 365+**: An authoritative open-source historical technology database.

---

## 🏗️ 14-Stage Ingestion Pipeline

```text
SOURCE (GitHub, npm, PyPI, arXiv, CVE, Official Blogs)
  ↓
COLLECT (Generic SourceAdapter Interface)
  ↓
NORMALIZE (Canonical URL, ISO 8601 Timestamps, Schema Enforcement)
  ↓
DEDUPLICATE (URL Deduplication & Content Fingerprinting)
  ↓
CLASSIFY (Category & Domain Assignment across 30+ domains)
  ↓
EXTRACT ENTITIES (Technology, Organization, Person Named Recognition)
  ↓
VERIFY (Primary Proof Validation & Cryptographic Commit Check)
  ↓
GENERATE SUMMARY (Concise Technical Overview via Gemini 3.8 Flash)
  ↓
CALCULATE IMPORTANCE (Algorithmic Velocity & Ecosystem Impact Score)
  ↓
CREATE RELATIONSHIPS (Knowledge Graph Edge Binding)
  ↓
STORE (Relational & Normalized Archive Ledger)
  ↓
INDEX (Inverted Token Index & Semantic Projection)
  ↓
TIMELINE (Milestone Projection across Year / Quarter)
  ↓
DAILY DIGEST & PUBLIC DATASET EXPORT
```

---

## 🔒 The Three Pillars of Truth

TechFossil strictly separates three categories of data:
1. **Source-Derived Facts**: Exact factual claims verified directly in official release notes, git tags, or CVE bulletins.
2. **AI-Generated Synthesis**: High-level architectural analysis generated server-side using Gemini 3.8 Flash, explicitly labeled with confidence metrics.
3. **Derived Relationships**: Inferred knowledge graph edges connecting technologies, organizations, and dependencies.

---

## 🚀 Quickstart

### Prerequisites
- Node.js 20+ or 22+
- npm 10+
- (Optional) Gemini API Key for AI Research Mode & summarization

### Setup
```bash
# Clone repository
git clone https://github.com/techfossil/archive.git
cd archive

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Set GEMINI_API_KEY in .env if desired

# Start local development server on port 3000
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Destination / Action |
| :--- | :--- |
| `/` or `⌘K` | Global Search & AI Research Mode |
| `g` then `a` | Signals Archive |
| `g` then `t` | Technology Profiles Directory |
| `g` then `l` | Historical Timelines |
| `g` then `k` | Knowledge Graph Visualizer |
| `g` then `r` | arXiv Research Papers |
| `g` then `s` | CVE Security Advisories |
| `g` then `d` | System Metrics Dashboard |
| `g` then `i` | Ingestion Control Terminal |
| `?` | Keyboard Shortcuts Cheat-sheet |

---

## 📦 Public Dataset Formats

Download or ingest TechFossil datasets directly:
- **JSON**: Full hierarchical graph with evidence ledgers (`/api/export?format=json`)
- **JSONL / NDJSON**: Streaming format for LLM fine-tuning pipelines (`/api/export?format=jsonl`)
- **CSV**: Tabular rows for Pandas and SQL data warehouses (`/api/export?format=csv`)
- **Markdown**: Formatted research digests (`/api/export?format=markdown`)

---

## 📄 License & Open Data

- Code licensed under [MIT License](LICENSE).
- Historical Dataset licensed under [CC0 1.0 Universal Public Domain Dedication](https://creativecommons.org/publicdomain/zero/1.0/).
