# Gemini AI Pipeline & Grounding Architecture

## Model Selection
TechFossil utilizes Google's frontier model **`gemini-3.8-flash`** via the modern `@google/genai` TypeScript SDK.

## Grounded Synthesis Protocol
When processing queries in **AI Research Mode**:
1. Candidate signals matching keywords, technologies, or concepts are fetched from the local structured store.
2. If zero records match, the system explicitly reports that no historical evidence exists in the archive, refusing to hallucinate dates or features.
3. The retrieved records are formatted into a deterministic context block.
4. Gemini synthesizes the answer with mandatory direct citations linking back to `[Signal #X]`.
5. Factual assertions from the primary source are surfaced alongside the synthesis.
