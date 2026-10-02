import { ingestionPipeline } from '../src/server/pipeline';
import { archiveStore } from '../src/server/store';

async function main() {
  const targetSource = process.argv[2] || 'all';
  console.log(`[TechFossil CLI] Starting automated ingestion cycle for target: "${targetSource}"`);

  const initialCount = archiveStore.getAllSignals().length;
  const job = await ingestionPipeline.executeCycle(targetSource);

  console.log(`[TechFossil CLI] Pipeline execution finished.`);
  console.log(`- Job ID: ${job.id}`);
  console.log(`- Status: ${job.status}`);
  console.log(`- Candidates Discovered: ${job.records_found}`);
  console.log(`- New Records Created: ${job.records_created}`);
  console.log(`- Duplicates Ignored: ${job.duplicates}`);
  console.log(`- Errors Encountered: ${job.errors.length}`);
  console.log(`- Total Signals in Store: ${archiveStore.getAllSignals().length} (was ${initialCount})`);

  if (job.status === 'failed') {
    console.error(`[TechFossil CLI] Job failed with errors:`, job.errors);
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('[TechFossil CLI] Fatal execution error:', err);
  process.exit(1);
});
