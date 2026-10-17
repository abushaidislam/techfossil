# Do Drafters Work on Small Models? Gemma 4 E2B and E4B on Two Small GPUs

- **Signal ID:** `sig-2026-1017-dev-4863494`
- **Source:** `dev_to`
- **Category:** Software Engineering
- **Published:** 2026-10-16T17:30:10Z
- **Verification:** `verified` (Score: 87/100)
- **Canonical URL:** [https://dev.to/gde/do-drafters-work-on-small-models-gemma-4-e2b-and-e4b-on-two-small-gpus-1b4g](https://dev.to/gde/do-drafters-work-on-small-models-gemma-4-e2b-and-e4b-on-two-small-gpus-1b4g)
- **Technologies:** `software`, `development`, `technology`

## Summary & Context
Yes. Speculative decoding with Google's 59 MB QAT multi-token prediction (MTP) drafters speeds up Gemma 4 E4B 1.72x and E2B 1.40x on an 8 GB RTX 3050, and 1.49x and 1.18x on a 4 GB laptop GTX 1650 Ti, served by llama.cpp one request at a time, with unchanged GSM8K and BFCL scores.

---
*Archived by TechFossil Live Ingestion Daemon on 2026-10-17 19:18:52 UTC*
