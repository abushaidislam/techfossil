import { GoogleGenAI } from '@google/genai';
import { Signal, Technology, AIResearchSynthesis, CategoryType } from '../types';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * AI Research Mode:
 * Synthesizes comprehensive answers strictly grounded in retrieved TechFossil records.
 * Never answers purely from ungrounded parametric memory.
 */
export async function synthesizeResearchQuery(
  question: string,
  retrievedSignals: Signal[],
  technologies: Technology[]
): Promise<AIResearchSynthesis> {
  const ai = getGeminiClient();

  // If no retrieved signals found, be explicit
  if (retrievedSignals.length === 0) {
    return {
      question,
      answer: `No relevant records were found in the TechFossil structured archive matching "${question}". TechFossil relies on verified historical signals rather than generative speculation.`,
      synthesis_points: ['No archived records found matching search parameters.'],
      direct_citations: [],
      analyzed_signals_count: 0,
      confidence: 'tentative',
      disclaimer: 'TechFossil does not fabricate technological events when evidence is absent from the archive.',
    };
  }

  // Citations mapping
  const citations = retrievedSignals.slice(0, 8).map((s) => ({
    signal_id: s.id,
    title: s.title,
    date: s.published_at.slice(0, 10),
    source: s.source_label || s.source,
    url: s.canonical_url,
  }));

  if (!ai) {
    // Grounded synthesis fallback using structured archive facts directly
    const topSignals = retrievedSignals.slice(0, 5);
    const facts = topSignals.flatMap((s) => s.source_derived_facts).slice(0, 6);
    const bullets = topSignals.map(
      (s) => `• [${s.published_at.slice(0, 10)}] ${s.title}: ${s.summary}`
    );

    return {
      question,
      answer: `Based on ${retrievedSignals.length} verified records in the TechFossil historical archive:\n\n${bullets.join('\n\n')}\n\nKey Technical Facts:\n${facts.map((f) => `- ${f}`).join('\n')}`,
      synthesis_points: facts.length > 0 ? facts : topSignals.map((s) => s.summary),
      direct_citations: citations,
      analyzed_signals_count: retrievedSignals.length,
      confidence: 'high',
      disclaimer: 'Synthesized directly from TechFossil verified structured ledger records.',
    };
  }

  try {
    const archiveContext = retrievedSignals.slice(0, 10).map((s, idx) => `
[Signal #${idx + 1}] ID: ${s.id}
Title: ${s.title}
Date: ${s.published_at}
Category: ${s.category}
Source: ${s.source_label} (${s.canonical_url})
Verification: ${s.verification_status}
Source-Derived Facts:
${s.source_derived_facts.map((f) => `  - ${f}`).join('\n')}
Summary: ${s.summary}
`).join('\n\n');

    const prompt = `You are the lead research analyst for TechFossil, the open-source technology intelligence archive.
A user asked the following research question:
"${question}"

Below are verified signals and evidence from the TechFossil structured archive:
=== ARCHIVE CONTEXT ===
${archiveContext}
=== END CONTEXT ===

CRITICAL INSTRUCTIONS:
1. Answer the question thoroughly and factually using ONLY the provided archive records.
2. Under NO circumstances invent citations, versions, dates, benchmarks, or statistics not present in the context.
3. If the archive records only partially cover the question, explicitly state the boundaries of what is verified in the archive.
4. Format your answer with clear markdown headings, concise synthesis, and explicit citations linking back to [Signal #X].
5. Provide a bulleted list of 3-5 key synthesis takeaways.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const text = response.text || 'Unable to generate synthesis text.';
    const synthesisPoints = retrievedSignals
      .slice(0, 4)
      .flatMap((s) => s.source_derived_facts.slice(0, 1));

    return {
      question,
      answer: text,
      synthesis_points: synthesisPoints.length ? synthesisPoints : [text.slice(0, 150)],
      direct_citations: citations,
      analyzed_signals_count: retrievedSignals.length,
      confidence: 'high',
      disclaimer: 'Grounded in TechFossil verified historical signals using Gemini 3.8 Flash.',
    };
  } catch (err: unknown) {
    console.error('Gemini synthesis failed:', err);
    // Fallback gracefully to direct archive facts
    const bullets = retrievedSignals.slice(0, 4).map(
      (s) => `• [${s.published_at.slice(0, 10)}] ${s.title}: ${s.summary}`
    );
    return {
      question,
      answer: `Archive synthesis (deterministic fallback):\n\n${bullets.join('\n\n')}`,
      synthesis_points: retrievedSignals.slice(0, 3).map((s) => s.summary),
      direct_citations: citations,
      analyzed_signals_count: retrievedSignals.length,
      confidence: 'moderate',
      disclaimer: 'Synthesized via deterministic archive projection.',
    };
  }
}

/**
 * Deterministic extraction helper when Gemini API key is missing or fails
 */
function extractFallbackAnalysis(raw: {
  title: string;
  content: string;
  source: string;
  url: string;
}): {
  summary: string;
  detailed_summary: string;
  category: CategoryType;
  entities: string[];
  technologies: string[];
  source_derived_facts: string[];
  ai_analysis: string;
  importance_score: number;
} {
  const text = `${raw.title} ${raw.content}`.toLowerCase();

  // Category detection
  let category: CategoryType = 'Open Source';
  if (text.includes('cve-') || text.includes('vulnerability') || text.includes('overflow') || raw.source === 'cve_feed') {
    category = 'Security';
  } else if (text.includes('arxiv') || text.includes('paper') || text.includes('theorem') || text.includes('abstract') || raw.source === 'arxiv') {
    category = 'Research';
  } else if (text.includes('agent') || text.includes('mcp') || text.includes('model context protocol')) {
    category = 'AI Agents';
  } else if (text.includes('react') || text.includes('next.js') || text.includes('nextjs') || text.includes('frontend')) {
    category = 'Frontend';
  } else if (text.includes('rust') || text.includes('cargo')) {
    category = 'Rust';
  } else if (text.includes('typescript') || text.includes('tsc')) {
    category = 'TypeScript';
  } else if (text.includes('python')) {
    category = 'Python';
  }

  // Technology extraction
  const techMap: Record<string, string> = {
    react: 'react',
    'next.js': 'nextjs',
    nextjs: 'nextjs',
    typescript: 'typescript',
    rust: 'rust',
    python: 'python',
    bun: 'bun',
    drizzle: 'drizzle-orm',
    mcp: 'ai-agents',
    gemini: 'gemini',
  };

  const detectedTechs = new Set<string>();
  for (const [key, slug] of Object.entries(techMap)) {
    if (text.includes(key)) {
      detectedTechs.add(slug);
    }
  }

  const technologies = Array.from(detectedTechs);
  if (technologies.length === 0) {
    technologies.push('open-source');
  }

  return {
    summary: raw.title,
    detailed_summary: raw.content.length > 300 ? raw.content.slice(0, 300) + '...' : raw.content,
    category,
    entities: [raw.source],
    technologies,
    source_derived_facts: [
      `Source URL: ${raw.url}`,
      `Published event: ${raw.title.slice(0, 80)}`,
    ],
    ai_analysis: 'Structured categorization generated via TechFossil canonical parser.',
    importance_score: raw.source === 'cve_feed' ? 90 : 80,
  };
}

/**
 * AI Summarization and Entity Extraction for Ingested Raw Signals
 */
export async function analyzeRawSignalWithGemini(raw: {
  title: string;
  content: string;
  source: string;
  url: string;
}): Promise<{
  summary: string;
  detailed_summary: string;
  category: CategoryType;
  entities: string[];
  technologies: string[];
  source_derived_facts: string[];
  ai_analysis: string;
  importance_score: number;
}> {
  const ai = getGeminiClient();

  if (!ai) {
    return extractFallbackAnalysis(raw);
  }

  try {
    const prompt = `Analyze this technology ecosystem release/announcement for the TechFossil archive:
Title: ${raw.title}
Source: ${raw.source}
URL: ${raw.url}
Content Snippet: ${raw.content.slice(0, 1500)}

Respond in valid JSON format only with this exact JSON structure:
{
  "summary": "1-2 sentence concise technical summary",
  "detailed_summary": "1 paragraph detailed technical analysis without buzzwords",
  "category": "one of: AI, AI Agents, Machine Learning, Research, Open Source, JavaScript, TypeScript, Python, Rust, Go, Web, Frontend, Backend, Cloud, DevTools, Databases, Security, Cybersecurity, Infrastructure, DevOps, Frameworks, Libraries",
  "entities": ["array", "of", "named", "organizations", "or", "tools"],
  "technologies": ["matching", "technology", "slugs", "like", "react", "nextjs", "typescript", "rust", "python", "gemini", "nodejs", "bun", "postgresql", "ai-agents"],
  "source_derived_facts": ["2-3 factual statements directly verifiable in source"],
  "ai_analysis": "1-2 sentences on architectural significance",
  "importance_score": 75
}`;

    const res = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(res.text || '{}');
    return {
      summary: parsed.summary || raw.title,
      detailed_summary: parsed.detailed_summary || raw.content.slice(0, 200),
      category: (parsed.category as CategoryType) || 'Open Source',
      entities: Array.isArray(parsed.entities) ? parsed.entities : [],
      technologies: Array.isArray(parsed.technologies) && parsed.technologies.length > 0 ? parsed.technologies : ['open-source'],
      source_derived_facts: Array.isArray(parsed.source_derived_facts) ? parsed.source_derived_facts : [raw.title],
      ai_analysis: parsed.ai_analysis || 'Analyzed via Gemini 3.8 Flash pipeline.',
      importance_score: typeof parsed.importance_score === 'number' ? parsed.importance_score : 80,
    };
  } catch (e) {
    console.error('Gemini signal analysis error:', e);
    return extractFallbackAnalysis(raw);
  }
}
