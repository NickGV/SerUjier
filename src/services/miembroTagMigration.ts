import { chunkArray } from '@/services/amigosMigration';

export interface MiembroMigrationResult {
  success: boolean;
  totalScanned: number;
  totalUpdated: number;
  totalSkipped: number;
  errors: Array<{ id: string; error: string }>;
}

/**
 * Derives the `esMiembro` default from `categoria` for legacy documents
 * that predate the field: `hermano`/`hermana` are members, `nino`,
 * `adolescente`, and any other value are not.
 */
export function deriveEsMiembro(categoria: unknown): boolean {
  return categoria === 'hermano' || categoria === 'hermana';
}

/**
 * Pure transform for a single miembros document. Idempotent: a document
 * that already carries a boolean `esMiembro` is returned unchanged so a
 * re-run (or a partial prior run) never overwrites a manual adjustment.
 */
export function transformMiembroDocument(doc: Record<string, unknown>): {
  data: Record<string, unknown>;
  changed: boolean;
} {
  if (typeof doc.esMiembro === 'boolean') {
    return { data: doc, changed: false };
  }

  return {
    data: { ...doc, esMiembro: deriveEsMiembro(doc.categoria) },
    changed: true,
  };
}

export interface MiembroTagMigrationDeps {
  readCollection: (
    name: string
  ) => Promise<Array<{ id: string; data: () => Record<string, unknown> }>>;
  writeBatch: (
    collectionName: string,
    documents: Array<{ id: string; data: Record<string, unknown> }>
  ) => Promise<void>;
  log: (message: string) => void;
  errorLog: (message: string) => void;
}

/**
 * Runs the `esMiembro` backfill over the miembros collection. Dry-run
 * (the default) reports counts without writing; execute writes only the
 * documents that changed, in batches (mirrors amigosMigration's 500-doc
 * batching via the shared `chunkArray` helper).
 */
export async function runMiembroTagMigration(
  options: { dryRun: boolean; execute: boolean; batchSize?: number },
  deps: MiembroTagMigrationDeps
): Promise<MiembroMigrationResult> {
  const errors: MiembroMigrationResult['errors'] = [];
  const toUpdate: Array<{ id: string; data: Record<string, unknown> }> = [];
  let totalSkipped = 0;

  deps.log('Reading miembros collection...');
  const docs = await deps.readCollection('miembros');
  const totalScanned = docs.length;
  deps.log(`Found ${totalScanned} miembros documents`);

  for (const doc of docs) {
    try {
      const docData = doc.data();
      const { data, changed } = transformMiembroDocument(docData);
      if (changed) {
        toUpdate.push({ id: doc.id, data });
      } else {
        totalSkipped++;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      errors.push({ id: doc.id, error: errorMsg });
      deps.errorLog(`Error transforming miembros/${doc.id}: ${errorMsg}`);
    }
  }

  if (options.dryRun) {
    deps.log(
      `[DRY RUN] Would update ${toUpdate.length} of ${totalScanned} documents (${totalSkipped} already tagged)`
    );
    return {
      success: errors.length === 0,
      totalScanned,
      totalUpdated: toUpdate.length,
      totalSkipped,
      errors,
    };
  }

  if (options.execute) {
    // Minimal update payload: write only the field this migration owns so a
    // concurrent edit to other fields on the same document is never reverted.
    const minimalUpdates = toUpdate.map(({ id, data }) => ({
      id,
      data: { esMiembro: data.esMiembro as boolean },
    }));
    const batches = chunkArray(minimalUpdates, options.batchSize ?? 500);
    deps.log(
      `Updating ${minimalUpdates.length} documents in ${batches.length} batch(es)...`
    );

    let successfulUpdates = 0;
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      try {
        await deps.writeBatch('miembros', batch);
        successfulUpdates += batch.length;
        deps.log(`Wrote batch ${i + 1}/${batches.length}`);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        for (const document of batch) {
          errors.push({ id: document.id, error: errorMsg });
        }
        deps.errorLog(
          `Error writing batch ${i + 1}/${batches.length}: ${errorMsg}`
        );
      }
    }

    deps.log(`Successfully updated ${successfulUpdates} documents`);
    return {
      success: errors.length === 0,
      totalScanned,
      totalUpdated: successfulUpdates,
      totalSkipped,
      errors,
    };
  }

  deps.log('No operation mode selected. Use --dry-run or --execute.');
  return {
    success: true,
    totalScanned,
    totalUpdated: 0,
    totalSkipped,
    errors,
  };
}
