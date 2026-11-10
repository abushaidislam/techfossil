# Porting Gemma 4 E2B to SGLang-JAX on One Cloud TPU v5e

- **Signal ID:** `sig-2026-1110-dev-5005835`
- **Source:** `dev_to`
- **Category:** Cloud & DevOps
- **Published:** 2026-11-09T17:16:08Z
- **Verification:** `verified` (Score: 94/100)
- **Canonical URL:** [https://dev.to/gde/porting-gemma-4-e2b-to-sglang-jax-on-one-cloud-tpu-v5e-5e9l](https://dev.to/gde/porting-gemma-4-e2b-to-sglang-jax-on-one-cloud-tpu-v5e-5e9l)
- **Technologies:** `cloud`

## Summary & Context
SGLang-JAX serves the Gemma 4 31B and 26B A4B on TPU and fails to load E2B. A two-file patch adds per-layer embeddings, shared K/V and the double-wide MLP; on one flex-start v5e-1 it then serves 159.9 tokens per second for one request and 4,249.4 at 64, 2.52x vLLM, with GSM8K level with the bf16 JAX engine.

---
*Archived by TechFossil Live Ingestion Daemon on 2026-11-10 12:22:28 UTC*
