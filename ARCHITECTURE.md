# TechFossil System Architecture

## Overview
TechFossil operates on a modular, decoupled architecture optimized for verifiable data provenance, continuous ingestion, and zero-hallucination research queries.

## Component Breakdown

### 1. Ingestion Engine (`src/server/pipeline.ts`)
- Orchestrates multi-source collection every 1–3 hours.
- Handles backoff, rate limits, and network errors gracefully.
- Normalizes diverse formats into the canonical `Signal` schema.

### 2. Entity Deduplication & Aliasing
- Resolves syntax variations (`ReactJS`, `React.js`, `React`) to canonical slugs (`react`).
- Flags uncertain matches for human/editorial review rather than auto-merging erroneously.

### 3. Verification & Evidence Ledger
- Collects multiple corroborating proofs for every major signal:
  - Official blog announcements
  - Signed git tags & GitHub releases
  - Upstream package manifests (npm, PyPI)
  - NIST NVD CVE registrations
  - arXiv peer-reviewed preprints

### 4. Grounded AI Research Engine (`src/server/gemini.ts`)
- Strictly server-side execution with `@google/genai` using `gemini-3.8-flash`.
- Injects retrieved structured archive records into the prompt context.
- Enforces direct citations back to signal IDs.

### 5. Frontend & Visualization
- Built with React 19, TypeScript, and Tailwind CSS.
- Monochromatic, Swiss editorial information density inspired by Bloomberg and Linear.
- Interactive vector Knowledge Graph with node physics relaxation and sub-graph inspection.
- Chronological historical timelines grouped by year and quarter.
