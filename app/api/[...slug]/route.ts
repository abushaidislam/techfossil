import { NextRequest, NextResponse } from 'next/server';
import { archiveStore } from '@/src/server/store';
import { ingestionPipeline } from '@/src/server/pipeline';
import { synthesizeResearchQuery } from '@/src/server/gemini';

// Helper to sanitize CSV cells against formula injection (CWE-1236)
function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);
  if (/^[=\+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await props.params;
  const path = slug ? slug.join('/') : '';
  const searchParams = req.nextUrl.searchParams;

  // 1. signals
  if (path === 'signals') {
    const q = searchParams.get('q') || undefined;
    const category = searchParams.get('category') || undefined;
    const technology = searchParams.get('technology') || undefined;
    const source = searchParams.get('source') || undefined;
    const verification = searchParams.get('verification') as any;
    const minImportance = searchParams.get('minImportance')
      ? Number(searchParams.get('minImportance'))
      : undefined;

    const signals = archiveStore.getAllSignals({
      q,
      category,
      technology,
      source,
      verification,
      minImportance,
    });
    return NextResponse.json({ count: signals.length, signals });
  }

  // 1b. signals/:id
  if (path.startsWith('signals/')) {
    const id = path.replace('signals/', '');
    const signal = archiveStore.getSignalById(id);
    if (!signal) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 });
    }
    return NextResponse.json(signal);
  }

  // 2. technologies
  if (path === 'technologies') {
    const technologies = archiveStore.getAllTechnologies();
    return NextResponse.json({ count: technologies.length, technologies });
  }

  // 2b. technologies/:slug
  if (path.startsWith('technologies/')) {
    const techSlug = path.replace('technologies/', '');
    const technology = archiveStore.getTechnology(techSlug);
    if (!technology) {
      return NextResponse.json({ error: 'Technology not found' }, { status: 404 });
    }

    const signals = archiveStore.getSignalsForTechnology(technology.slug);
    const timeline = archiveStore.getTimelineEvents(technology.slug);
    const releases = archiveStore.getReleases(technology.slug);
    const advisories = archiveStore.getSecurityAdvisories(technology.slug);
    const papers = archiveStore.getResearchPapers(technology.slug);

    return NextResponse.json({
      technology,
      signals,
      timeline,
      releases,
      security_advisories: advisories,
      research_papers: papers,
    });
  }

  // 3. timeline
  if (path === 'timeline') {
    const tech = searchParams.get('tech') || undefined;
    const events = archiveStore.getTimelineEvents(tech);
    return NextResponse.json({ count: events.length, events });
  }

  // 4. releases
  if (path === 'releases') {
    const tech = searchParams.get('tech') || undefined;
    const releases = archiveStore.getReleases(tech);
    return NextResponse.json({ count: releases.length, releases });
  }

  // 5. security
  if (path === 'security') {
    const advisories = archiveStore.getSecurityAdvisories();
    return NextResponse.json({ count: advisories.length, advisories });
  }

  // 6. research
  if (path === 'research') {
    const papers = archiveStore.getResearchPapers();
    return NextResponse.json({ count: papers.length, papers });
  }

  // 7. graph
  if (path === 'graph') {
    const graph = archiveStore.getKnowledgeGraph();
    return NextResponse.json(graph);
  }

  // 8. digest/daily
  if (path === 'digest/daily') {
    const date = searchParams.get('date') || undefined;
    const digest = archiveStore.getDailyDigest(date);
    return NextResponse.json(digest || null);
  }

  // 9. metrics
  if (path === 'metrics') {
    const metrics = archiveStore.getSystemMetrics();
    return NextResponse.json(metrics);
  }

  // 10. search
  if (path === 'search') {
    const q = searchParams.get('q') || '';
    const isAiMode = searchParams.get('aiMode') === 'true';

    const matchedSignals = archiveStore.getAllSignals({ q });
    const matchedTechnologies = archiveStore.searchTechnologies(q);

    let aiSynthesis = null;
    if (isAiMode && q.trim()) {
      aiSynthesis = await synthesizeResearchQuery(q, matchedSignals, matchedTechnologies);
    }

    return NextResponse.json({
      query: q,
      signals: matchedSignals,
      technologies: matchedTechnologies,
      aiSynthesis,
    });
  }

  // 11. jobs
  if (path === 'jobs') {
    const jobs = archiveStore.getProcessingJobs();
    const adapters = ingestionPipeline.getAdaptersList();
    return NextResponse.json({ jobs, adapters });
  }

  // 12. duplicates
  if (path === 'duplicates') {
    const candidates = archiveStore.getDuplicateCandidates();
    return NextResponse.json({ candidates });
  }

  // 13. export
  if (path === 'export') {
    const format = searchParams.get('format') || 'json';
    const signals = archiveStore.getAllSignals();

    if (format === 'jsonl') {
      const lines = signals.map((s) => JSON.stringify(s)).join('\n');
      return new NextResponse(lines, {
        headers: {
          'Content-Type': 'application/x-ndjson',
          'Content-Disposition': 'attachment; filename="techfossil-signals.jsonl"',
        },
      });
    }

    if (format === 'csv') {
      const header = 'id,title,canonical_url,source,published_at,category,importance_score,verification_status\n';
      const rows = signals
        .map((s) =>
          [
            sanitizeCsvCell(s.id),
            sanitizeCsvCell(s.title),
            sanitizeCsvCell(s.canonical_url),
            sanitizeCsvCell(s.source),
            sanitizeCsvCell(s.published_at),
            sanitizeCsvCell(s.category),
            s.importance_score,
            sanitizeCsvCell(s.verification_status),
          ].join(',')
        )
        .join('\n');
      return new NextResponse(header + rows, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="techfossil-signals.csv"',
        },
      });
    }

    if (format === 'markdown') {
      const md = `# TechFossil Intelligence Archive Export
Generated: ${new Date().toISOString()}
Total Signals: ${signals.length}

${signals
  .map(
    (s) => `### [${s.published_at.slice(0, 10)}] ${s.title}
- **Category:** ${s.category} | **Source:** ${s.source_label} | **Importance:** ${s.importance_score}/100
- **Verification:** ${s.verification_status}
- **Canonical URL:** ${s.canonical_url}
- **Summary:** ${s.summary}

#### Verified Source Facts:
${s.source_derived_facts.map((f) => `- ${f}`).join('\n')}

---`
  )
  .join('\n\n')}
`;
      return new NextResponse(md, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': 'attachment; filename="techfossil-archive.md"',
        },
      });
    }

    return new NextResponse(
      JSON.stringify(
        {
          repository: 'https://github.com/techfossil/archive',
          license: 'Open Data Commons Public Domain Dedication (CC0 / MIT)',
          exported_at: new Date().toISOString(),
          signals_count: signals.length,
          signals,
        },
        null,
        2
      ),
      {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="techfossil-dataset.json"',
        },
      }
    );
  }

  return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await props.params;
  const path = slug ? slug.join('/') : '';
  const body = await req.json().catch(() => ({}));

  // ai/research
  if (path === 'ai/research') {
    const question = typeof body.question === 'string' ? body.question : '';
    if (!question.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const matchedSignals = archiveStore.getAllSignals({ q: question });
    const matchedTechs = archiveStore.getAllTechnologies();
    const synthesis = await synthesizeResearchQuery(question, matchedSignals, matchedTechs);
    return NextResponse.json(synthesis);
  }

  // ingestion/run
  if (path === 'ingestion/run') {
    const source = typeof body.source === 'string' ? body.source : 'all';
    const resultJob = await ingestionPipeline.executeCycle(source);
    return NextResponse.json({ success: true, job: resultJob });
  }

  // duplicates/resolve
  if (path === 'duplicates/resolve') {
    const id = typeof body.id === 'string' ? body.id : '';
    const action = body.action === 'merge' ? 'merge' : 'reject';
    const resolved = archiveStore.resolveDuplicate(id, action);
    return NextResponse.json({ success: true, resolved });
  }

  return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
}
