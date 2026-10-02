import { archiveStore } from '../src/server/store';

async function main() {
  const month = new Date().toISOString().slice(0, 7);
  console.log(`[TechFossil CLI] Creating Monthly Archive Snapshot for ${month}...`);

  // Ensure disk state is synced
  archiveStore.saveToDisk();
  console.log(`[TechFossil CLI] Monthly snapshot state saved successfully.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('[TechFossil CLI] Error generating monthly snapshot:', err);
  process.exit(1);
});
