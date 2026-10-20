# Can a QAT 12B Fit an 8 GB GPU? Gemma 4 12B on an RTX 3050

- **Signal ID:** `sig-2026-1020-dev-4865040`
- **Source:** `dev_to`
- **Category:** Software Engineering
- **Published:** 2026-10-18T14:10:29Z
- **Verification:** `verified` (Score: 87/100)
- **Canonical URL:** [https://dev.to/gde/can-a-qat-12b-fit-an-8-gb-gpu-gemma-4-12b-on-an-rtx-3050-1267](https://dev.to/gde/can-a-qat-12b-fit-an-8-gb-gpu-gemma-4-12b-on-an-rtx-3050-1267)
- **Technologies:** `development`, `technology`, `software`

## Summary & Context
Yes. An exact Q4_0 rebuild of Google's Gemma 4 12B QAT GGUF runs with every layer on an 8 GB RTX 3050 at up to 40,960 tokens of context, and Google's 12B drafter, rebuilt the same way, doubles its generation speed to 56 tok/s with llama.cpp. A 4-bit context cache stretches the drafter setting to 81,920 tokens at the same answers.

---
*Archived by TechFossil Live Ingestion Daemon on 2026-10-20 09:48:32 UTC*
