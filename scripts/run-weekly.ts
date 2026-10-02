import { archiveStore } from '../src/server/store';

async function main() {
  const metrics = archiveStore.getSystemMetrics();
  console.log('[TechFossil CLI] Compiling Weekly Report...');
  console.log(`- Total Signals: ${metrics.totalSignals}`);
  console.log(`- Total Technologies Tracked: ${metrics.totalTechnologies}`);
  console.log(`- Total Releases: ${metrics.totalReleases}`);
  console.log(`- Total Advisories: ${metrics.totalAdvisories}`);
  console.log(`- Verification Rate: ${metrics.verificationRate}%`);

  // Touch store persistence file timestamp / ensure data store is saved
  archiveStore.saveToDisk();
  console.log('[TechFossil CLI] Weekly report statistics compiled and store state saved.');
  process.exit(0);
}

main().catch((err) => {
  console.error('[TechFossil CLI] Error generating weekly report:', err);
  process.exit(1);
});
