# Gemma 4 on a 4 GB GPU in Plain PyTorch: From Out of Memory to Faster Than llama.cpp

- **Signal ID:** `sig-2026-1028-dev-4908158`
- **Source:** `dev_to`
- **Category:** Systems & Architecture
- **Published:** 2026-10-24T13:44:48Z
- **Verification:** `verified` (Score: 87/100)
- **Canonical URL:** [https://dev.to/gde/gemma-4-on-a-4-gb-gpu-in-plain-pytorch-from-out-of-memory-to-faster-than-llamacpp-31jb](https://dev.to/gde/gemma-4-on-a-4-gb-gpu-in-plain-pytorch-from-out-of-memory-to-faster-than-llamacpp-31jb)
- **Technologies:** `memory`, `ai`

## Summary & Context
On a 4 GB GTX 1650 Ti, Gemma 4 E2B does not fit in 16-bit, and Transformers' own 4-bit path runs out of memory on its first forward pass. Kept in Google's QAT 4-bit end to end, with a few Triton kernels and a CUDA graph, plain PyTorch decodes at 88 tok/s, 1.07x llama.cpp on the same card, and holds the full 131,072-token context.

---
*Archived by TechFossil Live Ingestion Daemon on 2026-10-28 17:25:19 UTC*
