import {
  transformDocument,
  chunkArray,
  validateMigrationCount,
  runMigration,
  type MigrationDeps,
} from '@/services/amigosMigration';

describe('transformDocument', () => {
  it('transforms a visita document to amigo format with migratedFrom', () => {
    const visita = {
      nombre: 'Juan Perez',
      telefono: '3001234567',
      notas: 'Vino el domingo',
      fechaRegistro: '2026-01-15',
    };

    const result = transformDocument(visita, 'visitas');

    expect(result).toEqual({
      nombre: 'Juan Perez',
      telefono: '3001234567',
      notas: 'Vino el domingo',
      fechaRegistro: '2026-01-15',
      migratedFrom: 'visitas',
    });
  });

  it('transforms a simpatizante document to amigo format with migratedFrom', () => {
    const simpatizante = {
      nombre: 'Maria Gomez',
      telefono: '3109876543',
      notas: 'Interesada en grupos',
      fechaRegistro: '2026-02-20',
    };

    const result = transformDocument(simpatizante, 'simpatizantes');

    expect(result).toEqual({
      nombre: 'Maria Gomez',
      telefono: '3109876543',
      notas: 'Interesada en grupos',
      fechaRegistro: '2026-02-20',
      migratedFrom: 'simpatizantes',
    });
  });

  it('handles documents with additional fields', () => {
    const doc = {
      nombre: 'Carlos Ruiz',
      telefono: '3150000000',
      direccion: 'Calle 123',
      email: 'carlos@test.com',
      edad: 30,
    };

    const result = transformDocument(doc, 'visitas');

    expect(result).toEqual({
      nombre: 'Carlos Ruiz',
      telefono: '3150000000',
      direccion: 'Calle 123',
      email: 'carlos@test.com',
      edad: 30,
      migratedFrom: 'visitas',
    });
  });

  it('handles empty documents', () => {
    const result = transformDocument({}, 'simpatizantes');

    expect(result).toEqual({
      migratedFrom: 'simpatizantes',
    });
  });

  it('preserves the id field if present in document data', () => {
    const doc = {
      nombre: 'Test',
      externalId: 'ext-001',
    };

    const result = transformDocument(doc, 'visitas');
    expect(result.nombre).toBe('Test');
    expect(result.externalId).toBe('ext-001');
    expect(result.migratedFrom).toBe('visitas');
  });
});

describe('chunkArray', () => {
  it('splits array into chunks of specified size', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = chunkArray(items, 3);

    expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]);
  });

  it('returns single chunk when batch size exceeds array length', () => {
    const items = [1, 2, 3];
    const result = chunkArray(items, 10);

    expect(result).toEqual([[1, 2, 3]]);
  });

  it('returns empty array when input is empty', () => {
    const result = chunkArray([], 500);
    expect(result).toEqual([]);
  });

  it('handles exact multiple of batch size', () => {
    const items = [1, 2, 3, 4];
    const result = chunkArray(items, 2);

    expect(result).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it('throws error if batch size is less than 1', () => {
    expect(() => chunkArray([1, 2], 0)).toThrow(
      'Batch size must be at least 1'
    );
  });
});

describe('validateMigrationCount', () => {
  it('returns success when counts match', () => {
    const result = validateMigrationCount(10, 6, 4);
    expect(result.valid).toBe(true);
    expect(result.message).toContain('10');
  });

  it('returns failure when counts do not match', () => {
    const result = validateMigrationCount(9, 6, 4);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('10 expected');
    expect(result.message).toContain('9 created');
  });

  it('handles zero counts', () => {
    const result = validateMigrationCount(0, 0, 0);
    expect(result.valid).toBe(true);
    expect(result.message).toContain('0');
  });
});

describe('runMigration — edge cases', () => {
  const mockLog = jest.fn();
  const mockErrorLog = jest.fn();

  function createMockDeps(
    simpatizantes: Array<{ id: string; data: Record<string, unknown> }> = [],
    visitas: Array<{ id: string; data: Record<string, unknown> }> = []
  ): MigrationDeps {
    return {
      readCollection: jest.fn().mockImplementation((name: string) => {
        if (name === 'simpatizantes') {
          return Promise.resolve(
            simpatizantes.map((d) => ({ id: d.id, data: () => d.data }))
          );
        }
        if (name === 'visitas') {
          return Promise.resolve(
            visitas.map((d) => ({ id: d.id, data: () => d.data }))
          );
        }
        return Promise.resolve([]);
      }),
      writeBatch: jest.fn().mockResolvedValue(undefined),
      backupCollection: jest.fn().mockResolvedValue(undefined),
      log: mockLog,
      errorLog: mockErrorLog,
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles both legacy collections being empty', async () => {
    const deps = createMockDeps([], []);

    const result = await runMigration(
      { dryRun: false, backup: false, execute: true },
      deps
    );

    expect(result.success).toBe(true);
    expect(result.totalMigrated).toBe(0);
    expect(result.errors).toHaveLength(0);
    expect(result.validation.message).toBe('No documents to migrate');
    expect(mockLog).toHaveBeenCalledWith(
      'No documents found to migrate. Nothing to do.'
    );
    // Should not attempt writes
    expect(deps.writeBatch).not.toHaveBeenCalled();
  });

  it('handles empty simpatizantes with data in visitas', async () => {
    const deps = createMockDeps(
      [],
      [{ id: 'v1', data: { nombre: 'Visita Only' } }]
    );

    const result = await runMigration(
      { dryRun: false, backup: false, execute: true },
      deps
    );

    expect(result.success).toBe(true);
    expect(result.totalMigrated).toBe(1);
    expect(deps.writeBatch).toHaveBeenCalledWith('amigos', [
      { data: expect.objectContaining({ nombre: 'Visita Only' }) },
    ]);
  });

  it('handles empty visitas with data in simpatizantes', async () => {
    const deps = createMockDeps(
      [{ id: 's1', data: { nombre: 'Simp Only' } }],
      []
    );

    const result = await runMigration(
      { dryRun: false, backup: false, execute: true },
      deps
    );

    expect(result.success).toBe(true);
    expect(result.totalMigrated).toBe(1);
    expect(deps.writeBatch).toHaveBeenCalledWith('amigos', [
      { data: expect.objectContaining({ nombre: 'Simp Only' }) },
    ]);
  });

  it('handles documents missing the nombre field', async () => {
    const deps = createMockDeps(
      [
        {
          id: 's1',
          data: { telefono: '3001234567', notas: 'Sin nombre' },
        },
      ],
      [
        {
          id: 'v1',
          data: { nombre: 'Con Nombre', telefono: '3109876543' },
        },
      ]
    );

    const result = await runMigration(
      { dryRun: false, backup: false, execute: true },
      deps
    );

    expect(result.success).toBe(true);
    expect(result.totalMigrated).toBe(2);
    // The document without nombre should still be migrated (transform preserves all fields)
    expect(deps.writeBatch).toHaveBeenCalledWith('amigos', [
      {
        data: expect.objectContaining({
          telefono: '3001234567',
          migratedFrom: 'simpatizantes',
        }),
      },
      {
        data: expect.objectContaining({
          nombre: 'Con Nombre',
          migratedFrom: 'visitas',
        }),
      },
    ]);
  });

  it('handles documents with extra fields not in the schema', async () => {
    const deps = createMockDeps(
      [
        {
          id: 's1',
          data: {
            nombre: 'Extra Fields',
            telefono: '3000000000',
            direccion: 'Calle Falsa 123',
            email: 'test@test.com',
            edad: 25,
            activo: true,
            metadata: { source: 'web' },
          },
        },
      ],
      []
    );

    const result = await runMigration(
      { dryRun: false, backup: false, execute: true },
      deps
    );

    expect(result.success).toBe(true);
    expect(result.totalMigrated).toBe(1);
    expect(deps.writeBatch).toHaveBeenCalledWith('amigos', [
      {
        data: expect.objectContaining({
          nombre: 'Extra Fields',
          direccion: 'Calle Falsa 123',
          email: 'test@test.com',
          edad: 25,
          activo: true,
          metadata: { source: 'web' },
          migratedFrom: 'simpatizantes',
        }),
      },
    ]);
  });

  it('logs errors for malformed documents without crashing', async () => {
    const deps: MigrationDeps = {
      readCollection: jest.fn().mockImplementation((name: string) => {
        if (name === 'simpatizantes') {
          return Promise.resolve([
            {
              id: 's1',
              data: () => {
                throw new Error('Corrupt data in simpatizantes');
              },
            },
          ]);
        }
        if (name === 'visitas') {
          return Promise.resolve([
            {
              id: 'v1',
              data: () => ({ nombre: 'Good Record' }),
            },
            {
              id: 'v2',
              data: () => {
                throw new Error('Malformed record');
              },
            },
          ]);
        }
        return Promise.resolve([]);
      }),
      writeBatch: jest.fn().mockResolvedValue(undefined),
      log: mockLog,
      errorLog: mockErrorLog,
    };

    const result = await runMigration(
      { dryRun: false, backup: false, execute: true },
      deps
    );

    // Validation fails because totalMigrated (1) !== expected (3)
    expect(result.success).toBe(false);
    expect(result.totalMigrated).toBe(1);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0].id).toBe('s1');
    expect(result.errors[0].collection).toBe('simpatizantes');
    expect(result.errors[1].id).toBe('v2');
    expect(result.errors[1].collection).toBe('visitas');
    // Verify error logging
    expect(mockErrorLog).toHaveBeenCalledWith(
      expect.stringContaining('simpatizantes/s1')
    );
    expect(mockErrorLog).toHaveBeenCalledWith(
      expect.stringContaining('visitas/v2')
    );
    // Only the good record should be written
    expect(deps.writeBatch).toHaveBeenCalledWith('amigos', [
      { data: expect.objectContaining({ nombre: 'Good Record' }) },
    ]);
  });

  it('dry-run mode does not write or backup', async () => {
    const deps = createMockDeps(
      [{ id: 's1', data: { nombre: 'Test' } }],
      [{ id: 'v1', data: { nombre: 'Test2' } }]
    );

    const result = await runMigration(
      { dryRun: true, backup: false, execute: false },
      deps
    );

    expect(result.success).toBe(true);
    expect(result.totalMigrated).toBe(2);
    expect(mockLog).toHaveBeenCalledWith(
      '[DRY RUN] Would migrate 2 documents to amigos collection'
    );
    expect(deps.writeBatch).not.toHaveBeenCalled();
    expect(deps.backupCollection).not.toHaveBeenCalled();
  });

  it('no mode selected reports without action', async () => {
    const deps = createMockDeps([{ id: 's1', data: { nombre: 'Test' } }], []);

    const result = await runMigration(
      { dryRun: false, backup: false, execute: false },
      deps
    );

    expect(result.success).toBe(true);
    expect(result.totalMigrated).toBe(0);
    expect(mockLog).toHaveBeenCalledWith(
      'No operation mode selected. Use --dry-run, --backup, or --execute.'
    );
    expect(deps.writeBatch).not.toHaveBeenCalled();
    expect(deps.backupCollection).not.toHaveBeenCalled();
  });

  it('backup mode creates backup before migration', async () => {
    const backupCollection = jest.fn().mockResolvedValue(undefined);
    const deps: MigrationDeps = {
      readCollection: jest.fn().mockImplementation((name: string) => {
        if (name === 'simpatizantes') {
          return Promise.resolve([
            { id: 's1', data: () => ({ nombre: 'Simp1' }) },
          ]);
        }
        if (name === 'visitas') {
          return Promise.resolve([
            { id: 'v1', data: () => ({ nombre: 'Vis1' }) },
          ]);
        }
        return Promise.resolve([]);
      }),
      writeBatch: jest.fn().mockResolvedValue(undefined),
      backupCollection,
      log: mockLog,
      errorLog: mockErrorLog,
    };

    await runMigration({ dryRun: false, backup: true, execute: true }, deps);

    expect(backupCollection).toHaveBeenCalledWith(
      'simpatizantes_backup',
      expect.arrayContaining([expect.objectContaining({ id: 's1' })])
    );
    expect(backupCollection).toHaveBeenCalledWith(
      'visitas_backup',
      expect.arrayContaining([expect.objectContaining({ id: 'v1' })])
    );
    expect(deps.writeBatch).toHaveBeenCalled();
  });
});
