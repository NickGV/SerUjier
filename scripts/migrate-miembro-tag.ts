/**
 * Migration Script: Backfill `esMiembro` on legacy miembros documents.
 *
 * Usage:
 *   npx tsx scripts/migrate-miembro-tag.ts [options]
 *
 * Options:
 *   --dry-run    Report what would change without writing (default)
 *   --execute    Actually perform the migration
 *
 * IMPORTANT: run `node scripts/backup-firestore.js` before --execute.
 * Rollback: `node scripts/restore-firestore.js`.
 *
 * Environment variables (see @/shared/lib/firebase-admin):
 *   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 *   or FIREBASE_SERVICE_ACCOUNT_BASE64
 */

import { adminDb } from '@/shared/lib/firebase-admin';
import {
  runMiembroTagMigration,
  type MiembroTagMigrationDeps,
} from '@/services/miembroTagMigration';

function parseArgs(): { dryRun: boolean; execute: boolean } {
  const args = process.argv.slice(2);
  const execute = args.includes('--execute');
  return { dryRun: !execute, execute };
}

function log(message: string): void {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
}

function errorLog(message: string): void {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
}

async function main(): Promise<void> {
  const options = parseArgs();

  console.log('=== Migration: Backfill esMiembro on miembros ===');
  console.log(`Mode: ${options.execute ? '--execute' : '--dry-run (default)'}`);
  if (options.execute) {
    console.log(
      'Make sure you ran `node scripts/backup-firestore.js` before this step.'
    );
    console.log('Rollback if needed: `node scripts/restore-firestore.js`.');
  }
  console.log('');

  const deps: MiembroTagMigrationDeps = {
    readCollection: async (name: string) => {
      const snapshot = await adminDb.collection(name).get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        data: () => doc.data(),
      }));
    },
    writeBatch: async (collectionName, documents) => {
      const batch = adminDb.batch();
      for (const document of documents) {
        const ref = adminDb.collection(collectionName).doc(document.id);
        batch.update(ref, document.data);
      }
      await batch.commit();
    },
    log,
    errorLog,
  };

  const result = await runMiembroTagMigration(options, deps);

  console.log('\n=== Migration Results ===');
  console.log(`Success: ${result.success}`);
  console.log(`Scanned: ${result.totalScanned}`);
  console.log(`Updated: ${result.totalUpdated}`);
  console.log(`Already tagged (skipped): ${result.totalSkipped}`);
  console.log(`Errors: ${result.errors.length}`);

  if (result.errors.length > 0) {
    console.log('\nErrors:');
    for (const err of result.errors) {
      console.log(`  - miembros/${err.id}: ${err.error}`);
    }
  }

  process.exit(result.success ? 0 : 1);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
