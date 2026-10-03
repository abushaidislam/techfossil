#!/usr/bin/env node
/**
 * TechFossil Standalone CLI Ingestion Runner
 * Usage:
 *   npx tsx scripts/ingest.ts [--source=all|github_releases|npm_registry|arxiv_cs|cve_security|pypi_registry]
 */

import { ingestionPipeline } from '../src/server/pipeline';
import { archiveStore } from '../src/server/store';

async function main() {
  const args = process.argv.slice(2);
  let source = 'all';

  for (const arg of args) {
    if (arg.startsWith('--source=')) {
      source = arg.split('=')[1];
    }
  }

  console.log('='.repeat(70));
  console.log(' TechFossil Automated Ingestion Pipeline');
  console.log(` Target Source: ${source}`);
  console.log(` Started At:    ${new Date().toISOString()}`);
  console.log('='.repeat(70));

  try {
    const job = await ingestionPipeline.executeCycle(source);

    console.log('\n--- EXECUTION LOGS ---');
    for (const log of job.logs) {
      console.log(`[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`);
    }

    console.log('\n' + '='.repeat(70));
    console.log(' SUMMARY');
    console.log('='.repeat(70));
    console.log(` Job ID:            ${job.id}`);
    console.log(` Status:            ${job.status.toUpperCase()}`);
    console.log(` Records Found:     ${job.records_found}`);
    console.log(` Records Processed: ${job.records_processed}`);
    console.log(` Records Created:   ${job.records_created}`);
    console.log(` Duplicates:        ${job.duplicates}`);
    console.log(` Total Archive Size:${archiveStore.getAllSignals().length}`);

    if (job.status === 'failed') {
      console.error('\nPipeline execution encountered errors:');
      for (const err of job.errors) {
        console.error(`- ${err}`);
      }
      process.exit(1);
    }

    console.log('\n[Success] Ingestion cycle completed and persisted to disk.\n');
    process.exit(0);
  } catch (err) {
    console.error('\n[Fatal Error]:', err);
    process.exit(1);
  }
}

main();
