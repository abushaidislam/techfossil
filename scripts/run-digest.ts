import { archiveStore } from '../src/server/store';
import { DailyDigest } from '../src/types';

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`[TechFossil CLI] Generating Daily Digest for ${today}...`);

  const signals = archiveStore.getAllSignals();
  const categoryCounts: Record<string, number> = {};

  for (const sig of signals) {
    categoryCounts[sig.category] = (categoryCounts[sig.category] || 0) + 1;
  }

  const topDevelopments = signals
    .slice(0, 5)
    .map((s, index) => ({
      rank: index + 1,
      signal_id: s.id,
      title: s.title,
      summary: s.summary,
      category: s.category,
      importance: s.importance_score,
      sources: [s.source_label || s.source],
      technology_slugs: s.technologies,
    }));

  const digest: DailyDigest = {
    id: `digest-${today}`,
    date: today,
    generated_at: new Date().toISOString(),
    total_signals: signals.length,
    category_counts: categoryCounts,
    executive_summary: `Daily technology summary for ${today}. Analyzed ${signals.length} verified signals across active ecosystem tracks.`,
    emerging_patterns: [
      'Accelerated updates in AI Agents and Model Context Protocol tooling.',
      'Active framework security advisories and dependency updates.',
      'Continued research contributions in multimodal AI architectures.',
    ],
    top_developments: topDevelopments,
  };

  archiveStore.saveDailyDigest(digest);
  console.log(`[TechFossil CLI] Daily Digest saved successfully for date: ${today}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('[TechFossil CLI] Error generating daily digest:', err);
  process.exit(1);
});
