# TechFossil REST API Reference

All responses return standard JSON.

### Endpoints

#### Signals
- `GET /api/signals`: List signals with query filters (`q`, `category`, `technology`, `source`, `verification`, `minImportance`).
- `GET /api/signals/:id`: Retrieve single signal with complete evidence ledger.

#### Technologies
- `GET /api/technologies`: List all monitored technologies.
- `GET /api/technologies/:slug`: Retrieve technology dossier with timeline, releases, CVEs, and papers.

#### Historical Timeline
- `GET /api/timeline?tech=`: Retrieve chronological milestones.

#### Knowledge Graph
- `GET /api/graph`: Retrieve nodes and edges for the relationship visualizer.

#### Daily Digest
- `GET /api/digest/daily?date=`: Retrieve daily intelligence report.

#### AI Research Mode
- `POST /api/ai/research`: Submit research question for grounded synthesis over archive.
  ```json
  {
    "question": "What changed in React during 2026?"
  }
  ```

#### Public Dataset Export
- `GET /api/export?format=json|jsonl|csv|markdown`: Stream public dataset in requested format.
