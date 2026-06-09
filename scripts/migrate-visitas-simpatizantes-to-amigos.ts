/**
 * Migration Script: Merge visitas and simpatizantes into amigos collection.
 *
 * Usage:
 *   ts-node scripts/migrate-visitas-simpatizantes-to-amigos.ts [options]
 *
 * Options:
 *   --dry-run    Log what would be migrated without writing
 *   --backup     Backup original collections before migrating
 *   --execute    Actually perform the migration
 *
 * Modes can be combined:
 *   --backup --execute    Backup then migrate
 *   --dry-run             Preview only (default if no mode specified)
 *
 * Environment variables:
 *   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 *   or FIREBASE_SERVICE_ACCOUNT_BASE64
 */

import { adminDb } from '@/shared/lib/firebase-admin';
import { runMigration, type MigrationDeps } from '@/services/amigosMigration';

function parseArgs(): { dryRun: boolean; backup: boolean; execute: boolean } {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    backup: args.includes('--backup'),
    execute: args.includes('--execute'),
  };
}

function log(message: string): void {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
}

function errorLog(message: string): void {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
}

async function main(): Promise<void> {
  const options = parseArgs();

  console.log('=== Migration: Visitas & Simpatizantes → Amigos ===');
  console.log(
    `Mode: ${options.dryRun ? '--dry-run ' : ''}${options.backup ? '--backup ' : ''}${options.execute ? '--execute' : ''}`
  );
  console.log('');

  if (!options.dryRun && !options.backup && !options.execute) {
    console.log('No mode specified. Use --dry-run, --backup, or --execute.');
    console.log('Running with --dry-run by default.\n');
    options.dryRun = true;
  }

  const deps: MigrationDeps = {
    readCollection: async (name: string) => {
      const snapshot = await adminDb.collection(name).get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        data: () => {
          const data = doc.data();
          // Convert Timestamps to ISO strings for portability
          const cleaned: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(data)) {
            if (value && typeof value === 'object' && 'toDate' in value) {
              cleaned[key] =
                (value as ReturnType<typeof doc.data>)
                  .toDate?.()
                  ?.toISOString() ?? value;
            } else {
              cleaned[key] = value;
            }
          }
          return cleaned;
        },
      }));
    },

    writeBatch: async (collectionName, documents) => {
      const batch = adminDb.batch();
      for (const doc of documents) {
        const ref = adminDb.collection(collectionName).doc();
        batch.set(ref, doc.data);
      }
      await batch.commit();
    },

    backupCollection: async (collectionName, documents) => {
      const batch = adminDb.batch();
      for (const doc of documents) {
        const ref = adminDb.collection(collectionName).doc(doc.id);
        batch.set(ref, doc.data);
      }
      await batch.commit();
    },

    log,
    errorLog,
  };

  const result = await runMigration(options, deps);

  console.log('\n=== Migration Results ===');
  console.log(`Success: ${result.success}`);
  console.log(`Total migrated: ${result.totalMigrated}`);
  console.log(`Errors: ${result.errors.length}`);
  console.log(`Validation: ${result.validation.message}`);

  if (result.errors.length > 0) {
    console.log('\nErrors:');
    for (const err of result.errors) {
      console.log(`  - ${err.collection}/${err.id}: ${err.error}`);
    }
  }

  process.exit(result.success ? 0 : 1);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
