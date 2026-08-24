import {
  deriveEsMiembro,
  transformMiembroDocument,
  runMiembroTagMigration,
  type MiembroTagMigrationDeps,
} from '@/services/miembroTagMigration';

describe('deriveEsMiembro', () => {
  it('returns true for hermano', () => {
    expect(deriveEsMiembro('hermano')).toBe(true);
  });

  it('returns true for hermana', () => {
    expect(deriveEsMiembro('hermana')).toBe(true);
  });

  it('returns false for nino', () => {
    expect(deriveEsMiembro('nino')).toBe(false);
  });

  it('returns false for adolescente', () => {
    expect(deriveEsMiembro('adolescente')).toBe(false);
  });

  it('returns false for unknown or missing categoria', () => {
    expect(deriveEsMiembro('other')).toBe(false);
    expect(deriveEsMiembro(undefined)).toBe(false);
  });
});

describe('transformMiembroDocument', () => {
  it('sets esMiembro true for categoria hermano', () => {
    const result = transformMiembroDocument({
      nombre: 'Juan',
      categoria: 'hermano',
    });
    expect(result.changed).toBe(true);
    expect(result.data.esMiembro).toBe(true);
  });

  it('sets esMiembro true for categoria hermana', () => {
    const result = transformMiembroDocument({
      nombre: 'Maria',
      categoria: 'hermana',
    });
    expect(result.changed).toBe(true);
    expect(result.data.esMiembro).toBe(true);
  });

  it('sets esMiembro false for categoria nino', () => {
    const result = transformMiembroDocument({
      nombre: 'Pedro',
      categoria: 'nino',
    });
    expect(result.changed).toBe(true);
    expect(result.data.esMiembro).toBe(false);
  });

  it('sets esMiembro false for categoria adolescente', () => {
    const result = transformMiembroDocument({
      nombre: 'Ana',
      categoria: 'adolescente',
    });
    expect(result.changed).toBe(true);
    expect(result.data.esMiembro).toBe(false);
  });

  it('is idempotent: leaves a document with a boolean esMiembro unchanged', () => {
    const doc = { nombre: 'Juan', categoria: 'hermano', esMiembro: false };
    const result = transformMiembroDocument(doc);
    expect(result.changed).toBe(false);
    expect(result.data).toBe(doc);
    expect(result.data.esMiembro).toBe(false);
  });

  it('preserves other fields on the transformed document', () => {
    const result = transformMiembroDocument({
      nombre: 'Juan',
      categoria: 'hermano',
      telefono: '3001234567',
    });
    expect(result.data.nombre).toBe('Juan');
    expect(result.data.telefono).toBe('3001234567');
  });
});

describe('runMiembroTagMigration', () => {
  const mockLog = jest.fn();
  const mockErrorLog = jest.fn();

  function createMockDeps(
    miembros: Array<{ id: string; data: Record<string, unknown> }>
  ): MiembroTagMigrationDeps {
    return {
      readCollection: jest
        .fn()
        .mockResolvedValue(
          miembros.map((d) => ({ id: d.id, data: () => d.data }))
        ),
      writeBatch: jest.fn().mockResolvedValue(undefined),
      log: mockLog,
      errorLog: mockErrorLog,
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('dry-run reports counts without writing', async () => {
    const deps = createMockDeps([
      { id: 'm1', data: { categoria: 'hermano' } },
      { id: 'm2', data: { categoria: 'nino' } },
      { id: 'm3', data: { esMiembro: true, categoria: 'hermano' } },
    ]);

    const result = await runMiembroTagMigration(
      { dryRun: true, execute: false },
      deps
    );

    expect(result.success).toBe(true);
    expect(result.totalScanned).toBe(3);
    expect(result.totalUpdated).toBe(2);
    expect(result.totalSkipped).toBe(1);
    expect(deps.writeBatch).not.toHaveBeenCalled();
  });

  it('execute writes only changed documents in batches', async () => {
    const deps = createMockDeps([
      { id: 'm1', data: { categoria: 'hermano' } },
      { id: 'm2', data: { esMiembro: false, categoria: 'nino' } },
    ]);

    const result = await runMiembroTagMigration(
      { dryRun: false, execute: true },
      deps
    );

    expect(result.success).toBe(true);
    expect(result.totalUpdated).toBe(1);
    expect(result.totalSkipped).toBe(1);
    expect(deps.writeBatch).toHaveBeenCalledWith('miembros', [
      { id: 'm1', data: expect.objectContaining({ esMiembro: true }) },
    ]);
  });

  it('logs errors for malformed documents without crashing', async () => {
    const deps: MiembroTagMigrationDeps = {
      readCollection: jest.fn().mockResolvedValue([
        {
          id: 'm1',
          data: () => {
            throw new Error('Corrupt data');
          },
        },
        { id: 'm2', data: () => ({ categoria: 'hermana' }) },
      ]),
      writeBatch: jest.fn().mockResolvedValue(undefined),
      log: mockLog,
      errorLog: mockErrorLog,
    };

    const result = await runMiembroTagMigration(
      { dryRun: false, execute: true },
      deps
    );

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].id).toBe('m1');
    expect(mockErrorLog).toHaveBeenCalledWith(
      expect.stringContaining('miembros/m1')
    );
    expect(deps.writeBatch).toHaveBeenCalledWith('miembros', [
      { id: 'm2', data: expect.objectContaining({ esMiembro: true }) },
    ]);
  });

  it('no mode selected reports without action', async () => {
    const deps = createMockDeps([{ id: 'm1', data: { categoria: 'hermano' } }]);

    const result = await runMiembroTagMigration(
      { dryRun: false, execute: false },
      deps
    );

    expect(result.success).toBe(true);
    expect(result.totalUpdated).toBe(0);
    expect(mockLog).toHaveBeenCalledWith(
      'No operation mode selected. Use --dry-run or --execute.'
    );
    expect(deps.writeBatch).not.toHaveBeenCalled();
  });
});
