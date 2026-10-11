# Gemma 4 From E2B to 31B on an AMD MI300X: fp8 Overtakes bf16 From 12B Up

- **Signal ID:** `sig-2026-1011-dev-4820675`
- **Source:** `dev_to`
- **Category:** AI & Machine Learning
- **Published:** 2026-10-09T13:46:34Z
- **Verification:** `verified` (Score: 88/100)
- **Canonical URL:** [https://dev.to/gde/gemma-4-from-e2b-to-31b-on-an-amd-mi300x-fp8-overtakes-bf16-from-12b-up-h4e](https://dev.to/gde/gemma-4-from-e2b-to-31b-on-an-amd-mi300x-fp8-overtakes-bf16-from-12b-up-h4e)
- **Technologies:** `llm`

## Summary & Context
Every Gemma 4 size from E2B to 31B served on one AMD Instinct MI300X in bf16, fp8, int8 W8A8 and int4 W4A16, on the same vLLM image. fp8 goes from 0.75x bf16 for one request at E2B to 1.23x at 31B and is faster than bf16 in every cell at 12B and 31B. The mixture-of-experts 26B sits at bf16's pace, and the 4-bit builds run at 0.14x to 0.69x at every size.

---
*Archived by TechFossil Live Ingestion Daemon on 2026-10-11 11:52:21 UTC*
