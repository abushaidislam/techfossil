# Six Serving Engines, One 8 GB GPU: Gemma 4 E2B on an RTX 3050

- **Signal ID:** `sig-2026-1109-dev-4978026`
- **Source:** `dev_to`
- **Category:** AI & Machine Learning
- **Published:** 2026-11-08T19:08:37Z
- **Verification:** `verified` (Score: 90/100)
- **Canonical URL:** [https://dev.to/gde/six-serving-engines-one-8-gb-gpu-gemma-4-e2b-on-an-rtx-3050-ad7](https://dev.to/gde/six-serving-engines-one-8-gb-gpu-gemma-4-e2b-on-an-rtx-3050-ad7)
- **Technologies:** `llm`

## Summary & Context
llama.cpp, vLLM, SGLang, mistral.rs, a plain PyTorch engine and LiteRT-LM serve the same 4-bit Gemma 4 E2B on one 8 GB RTX 3050, measured with the same prompts, the same load sweep and the same GSM8K and BFCL questions. GSM8K is level on every engine; vLLM is the fastest up to 16 requests and within 3% of SGLang beyond.

---
*Archived by TechFossil Live Ingestion Daemon on 2026-11-09 13:02:49 UTC*
