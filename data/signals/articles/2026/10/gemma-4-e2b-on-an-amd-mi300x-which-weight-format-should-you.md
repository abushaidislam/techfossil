# Gemma 4 E2B on an AMD MI300X: Which Weight Format Should You Serve?

- **Signal ID:** `sig-2026-1011-dev-4818530`
- **Source:** `dev_to`
- **Category:** AI & Machine Learning
- **Published:** 2026-10-08T15:59:16Z
- **Verification:** `verified` (Score: 88/100)
- **Canonical URL:** [https://dev.to/gde/gemma-4-e2b-on-an-amd-mi300x-which-weight-format-should-you-serve-1a01](https://dev.to/gde/gemma-4-e2b-on-an-amd-mi300x-which-weight-format-should-you-serve-1a01)
- **Technologies:** `llm`

## Summary & Context
Ten builds of Gemma 4 E2B (bf16, fp8 in both E4M3 flavours, int8 W8A8 and int4 W4A16, each with and without int4 embedding tables) served one after another on one AMD Instinct MI300X with the same vLLM image. fp8 is the only format that keeps pace with bf16, the 4-bit builds run at 0.14x to 0.63x, and int4 embedding tables cost almost nothing.

---
*Archived by TechFossil Live Ingestion Daemon on 2026-10-11 14:09:58 UTC*
