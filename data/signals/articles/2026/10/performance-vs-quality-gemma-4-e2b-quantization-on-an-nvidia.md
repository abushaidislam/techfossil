# Performance vs Quality: Gemma 4 E2B Quantization on an NVIDIA L4 and a Tesla T4

- **Signal ID:** `sig-2026-1030-dev-4941529`
- **Source:** `dev_to`
- **Category:** Systems & Architecture
- **Published:** 2026-10-29T14:39:09Z
- **Verification:** `verified` (Score: 86/100)
- **Canonical URL:** [https://dev.to/gde/performance-vs-quality-gemma-4-e2b-quantization-on-an-nvidia-l4-and-a-tesla-t4-4b90](https://dev.to/gde/performance-vs-quality-gemma-4-e2b-quantization-on-an-nvidia-l4-and-a-tesla-t4-4b90)
- **Technologies:** `performance`, `aws`

## Summary & Context
Gemma 4 E2B from BF16 to Q2_K, speed against GSM8K accuracy, on an AWS L4 with byte-identical GGUF files and the same llama.cpp build as the Tesla T4. The L4 decodes 1.25 to 1.89 times faster, Q5_K_M is still the best trade, and switching GPUs changes nearly as many grades as quantizing from BF16 to Q5_K_M.

---
*Archived by TechFossil Live Ingestion Daemon on 2026-10-30 10:29:14 UTC*
