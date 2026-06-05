export interface MigrationResult {
  success: boolean;
  totalMigrated: number;
  errors: Array<{ id: string; collection: string; error: string }>;
  validation: { valid: boolean; message: string };
}

/**
 * Transforms a document from visitas or simpatizantes into amigo format
 * by adding the migratedFrom field. Preserves all original fields.
 */
export function transformDocument(
  doc: Record<string, unknown>,
  source: 'visitas' | 'simpatizantes'
): Record<string, unknown> {
  return {
    ...doc,
    migratedFrom: source,
  };
}

/**
 * Splits an array into chunks of the specified batch size.
 */
export function chunkArray<T>(items: T[], batchSize: number): T[][] {
  if (batchSize < 1) {
    throw new Error('Batch size must be at least 1');
  }

  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    chunks.push(items.slice(i, i + batchSize));
  }
  return chunks;
}

/**
 * Validates that the number of migrated documents matches the expected count.
 */
export function validateMigrationCount(
  amigosCount: number,
  visitasCount: number,
  simpatizantesCount: number
): { valid: boolean; message: string } {
  const expected = visitasCount + simpatizantesCount;
  if (amigosCount === expected) {
    return {
      valid: true,
      message: `Migration validated successfully: ${amigosCount} amigos created (${visitasCount} visitas + ${simpatizantesCount} simpatizantes)`,
    };
  }
  return {
    valid: false,
    message: `Migration count mismatch: ${expected} expected (${visitasCount} visitas + ${simpatizantesCount} simpatizantes), ${amigosCount} created`,
  };
}

export interface MigrationDeps {
  readCollection: (
    name: string
  ) => Promise<Array<{ id: string; data: () => Record<string, unknown> }>>;
  writeBatch: (
    collectionName: string,
    documents: Array<{ id?: string; data: Record<string, unknown> }>
  ) => Promise<void>;
  backupCollection?: (
    name: string,
    documents: Array<{ id: string; data: Record<string, unknown> }>
  ) => Promise<void>;
  log: (message: string) => void;
  errorLog: (message: string) => void;
}

/**
 * Runs the migration from visitas and simpatizantes to amigos.
 */
export async function runMigration(
  options: { dryRun: boolean; backup: boolean; execute: boolean },
  deps: MigrationDeps
): Promise<MigrationResult> {
  const errors: MigrationResult['errors'] = [];
  let totalMigrated = 0;

  // Read source collections
  deps.log('Reading simpatizantes collection...');
  const simpatizantesDocs = await deps.readCollection('simpatizantes');
  deps.log(`Found ${simpatizantesDocs.length} simpatizantes`);

  deps.log('Reading visitas collection...');
  const visitasDocs = await deps.readCollection('visitas');
  deps.log(`Found ${visitasDocs.length} visitas`);

  const totalDocuments = simpatizantesDocs.length + visitasDocs.length;
  deps.log(`Total documents to migrate: ${totalDocuments}`);

  if (totalDocuments === 0) {
    deps.log('No documents found to migrate. Nothing to do.');
    return {
      success: true,
      totalMigrated: 0,
      errors: [],
      validation: { valid: true, message: 'No documents to migrate' },
    };
  }

  // Backup mode
  if (options.backup && !options.dryRun && options.execute) {
    deps.log('Creating backup of simpatizantes collection...');
    await deps.backupCollection!(
      'simpatizantes_backup',
      simpatizantesDocs.map((d) => ({ id: d.id, data: d.data() }))
    );

    deps.log('Creating backup of visitas collection...');
    await deps.backupCollection!(
      'visitas_backup',
      visitasDocs.map((d) => ({ id: d.id, data: d.data() }))
    );

    deps.log('Backup completed.');
  }

  // Transform all documents
  const allAmigos: Array<{ data: Record<string, unknown> }> = [];

  for (const doc of simpatizantesDocs) {
    try {
      const docData = doc.data();
      const amigoDoc = transformDocument(docData, 'simpatizantes');
      allAmigos.push({ data: amigoDoc });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      errors.push({ id: doc.id, collection: 'simpatizantes', error: errorMsg });
      deps.errorLog(`Error transforming simpatizantes/${doc.id}: ${errorMsg}`);
    }
  }

  for (const doc of visitasDocs) {
    try {
      const docData = doc.data();
      const amigoDoc = transformDocument(docData, 'visitas');
      allAmigos.push({ data: amigoDoc });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      errors.push({ id: doc.id, collection: 'visitas', error: errorMsg });
      deps.errorLog(`Error transforming visitas/${doc.id}: ${errorMsg}`);
    }
  }

  if (options.dryRun) {
    deps.log(
      `[DRY RUN] Would migrate ${allAmigos.length} documents to amigos collection`
    );
    return {
      success: true,
      totalMigrated: allAmigos.length,
      errors,
      validation: {
        valid: true,
        message: `Dry run: ${allAmigos.length} documents ready to migrate`,
      },
    };
  }

  if (options.execute) {
    deps.log(`Migrating ${allAmigos.length} documents to amigos collection...`);

    // Batch write in groups of 500
    const batches = chunkArray(allAmigos, 500);
    deps.log(`Processing ${batches.length} batch(es)`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      deps.log(
        `Writing batch ${i + 1}/${batches.length} (${batch.length} documents)...`
      );
      await deps.writeBatch('amigos', batch);
    }

    totalMigrated = allAmigos.length;
    deps.log(`Successfully migrated ${totalMigrated} documents`);

    // Validate
    const finalCount = totalMigrated;
    const validation = validateMigrationCount(
      finalCount,
      visitasDocs.length,
      simpatizantesDocs.length
    );

    if (validation.valid) {
      deps.log(validation.message);
    } else {
      deps.errorLog(validation.message);
    }

    return {
      success: validation.valid,
      totalMigrated,
      errors,
      validation,
    };
  }

  // No mode selected — just report
  deps.log(
    'No operation mode selected. Use --dry-run, --backup, or --execute.'
  );
  return {
    success: true,
    totalMigrated: 0,
    errors,
    validation: { valid: true, message: 'No operation mode specified' },
  };
}
