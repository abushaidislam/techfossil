# Don't Assume Your Cloud T4 Runs at Spec: Gemma 4 Decode Falls 7% as the Card Warms

- **Signal ID:** `sig-2026-1017-dev-4863183`
- **Source:** `dev_to`
- **Category:** Systems & Architecture
- **Published:** 2026-10-16T15:14:10Z
- **Verification:** `verified` (Score: 88/100)
- **Canonical URL:** [https://dev.to/gde/dont-assume-your-cloud-t4-runs-at-spec-gemma-4-decode-falls-7-as-the-card-warms-3fd3](https://dev.to/gde/dont-assume-your-cloud-t4-runs-at-spec-gemma-4-decode-falls-7-as-the-card-warms-3fd3)
- **Technologies:** `llm`, `cloud`, `performance`

## Summary & Context
The same Tesla T4 on the same Google Cloud VM decoded Gemma 4 E2B at 115 tokens/s at 45 °C and 107 at 77 °C. The card sits at its 70 W limit, a hotter chip draws more power at the same clock, so the clock drops. No thermal throttle fires, and no spec sheet mentions it.

---
*Archived by TechFossil Live Ingestion Daemon on 2026-10-17 20:06:42 UTC*
