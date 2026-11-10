# Six Serving Engines on One Cloud TPU v5e Chip: Gemma 4 E2B

- **Signal ID:** `sig-2026-1110-dev-5005298`
- **Source:** `dev_to`
- **Category:** Cloud & DevOps
- **Published:** 2026-11-09T16:00:42Z
- **Verification:** `verified` (Score: 98/100)
- **Canonical URL:** [https://dev.to/gde/six-serving-engines-on-one-cloud-tpu-v5e-chip-gemma-4-e2b-22hn](https://dev.to/gde/six-serving-engines-on-one-cloud-tpu-v5e-chip-gemma-4-e2b-22hn)
- **Technologies:** `cloud`, `llm`

## Summary & Context
vLLM, SGLang-JAX, a pure-JAX engine, a Rust model over PJRT, and TorchTPU in Python and Rust serve Gemma 4 E2B on one flex-start v5e-1, with the same prompts, the same 1-to-64-request sweep and the same GSM8K questions. vLLM is the engine that serves out of the box; SGLang-JAX with an E2B patch is the fastest at every load from 8 requests up.

---
*Archived by TechFossil Live Ingestion Daemon on 2026-11-10 12:21:19 UTC*
