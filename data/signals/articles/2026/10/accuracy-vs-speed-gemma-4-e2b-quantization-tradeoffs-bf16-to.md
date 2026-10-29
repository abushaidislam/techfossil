# Accuracy vs Speed: Gemma 4 E2B Quantization Tradeoffs, BF16 to Q2_K

- **Signal ID:** `sig-2026-1029-dev-4935418`
- **Source:** `dev_to`
- **Category:** Software Engineering
- **Published:** 2026-10-28T16:02:20Z
- **Verification:** `verified` (Score: 88/100)
- **Canonical URL:** [https://dev.to/gde/accuracy-vs-speed-gemma-4-e2b-quantization-tradeoffs-bf16-to-q2k-aea](https://dev.to/gde/accuracy-vs-speed-gemma-4-e2b-quantization-tradeoffs-bf16-to-q2k-aea)
- **Technologies:** `software`, `development`, `technology`

## Summary & Context
Gemma 4 E2B quantized from BF16 to Q2_K on one Tesla T4, every rung asked the same 250 GSM8K questions, and each answer buried at the rung where it first goes wrong. Q5_K_M and above hold the score; Q3_K_M loses 38; Q2_K gets 3 right. With thinking on, Q3_K_M wins back 17.

---
*Archived by TechFossil Live Ingestion Daemon on 2026-10-29 11:41:49 UTC*
