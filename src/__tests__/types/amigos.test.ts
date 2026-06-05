import { type Amigo } from '@/types/amigos';

describe('Amigo Type Interface', () => {
  it('validates a well-formed Amigo object with all fields', () => {
    const amigo: Amigo = {
      id: 'abc123',
      nombre: 'Juan Perez',
      telefono: '123456789',
      notas: 'Amigo cercano de la iglesia',
      fechaRegistro: '2025-01-15T00:00:00.000Z',
      migratedFrom: null,
    };

    // Verify structure
    expect(amigo).toHaveProperty('id');
    expect(amigo).toHaveProperty('nombre');
    expect(amigo).toHaveProperty('telefono');
    expect(amigo).toHaveProperty('notas');
    expect(amigo).toHaveProperty('fechaRegistro');
    expect(amigo).toHaveProperty('migratedFrom');

    // Verify types at runtime
    expect(typeof amigo.id).toBe('string');
    expect(typeof amigo.nombre).toBe('string');
    expect(typeof amigo.telefono).toBe('string');
    expect(typeof amigo.notas).toBe('string');
    expect(typeof amigo.fechaRegistro).toBe('string');
    expect(amigo.migratedFrom).toBeNull();
  });

  it('validates migratedFrom accepts "visitas"', () => {
    const amigo: Amigo = {
      id: '1',
      nombre: 'Test',
      migratedFrom: 'visitas',
    };

    expect(amigo.migratedFrom).toBe('visitas');
    // Verify it's one of the valid values
    const validOrigins = ['visitas', 'simpatizantes', null] as const;
    expect(validOrigins).toContain(amigo.migratedFrom);
  });

  it('validates migratedFrom accepts "simpatizantes"', () => {
    const amigo: Amigo = {
      id: '2',
      nombre: 'Test',
      migratedFrom: 'simpatizantes',
    };

    expect(amigo.migratedFrom).toBe('simpatizantes');
  });

  it('validates migratedFrom accepts null', () => {
    const amigo: Amigo = {
      id: '3',
      nombre: 'Test',
      migratedFrom: null,
    };

    expect(amigo.migratedFrom).toBeNull();
  });

  it('validates migratedFrom rejects invalid values at runtime', () => {
    // TypeScript prevents this at compile time, but at runtime
    // we should ensure values still work correctly
    const amigo = {
      id: '4',
      nombre: 'Test',
      migratedFrom: 'otro', // Invalid value
    } as unknown as Amigo;

    // At runtime, the value is still accessible
    expect(amigo.migratedFrom).toBe('otro');
    // But it shouldn't be one of the valid values
    const validOrigins: ReadonlyArray<string | null> = [
      'visitas',
      'simpatizantes',
      null,
    ];
    expect(validOrigins).not.toContain(amigo.migratedFrom);
  });

  it('allows optional field telefono to be undefined', () => {
    const amigo: Amigo = {
      id: '5',
      nombre: 'Test',
      migratedFrom: null,
    };

    expect(amigo.telefono).toBeUndefined();
  });

  it('allows optional field notas to be undefined', () => {
    const amigo: Amigo = {
      id: '6',
      nombre: 'Test',
      migratedFrom: null,
    };

    expect(amigo.notas).toBeUndefined();
  });

  it('allows optional field fechaRegistro to be undefined', () => {
    const amigo: Amigo = {
      id: '7',
      nombre: 'Test',
      migratedFrom: null,
    };

    expect(amigo.fechaRegistro).toBeUndefined();
  });

  it('allows all optional fields to be undefined simultaneously', () => {
    const amigo: Amigo = {
      id: '8',
      nombre: 'Sin datos opcionales',
      migratedFrom: 'visitas',
    };

    expect(amigo.telefono).toBeUndefined();
    expect(amigo.notas).toBeUndefined();
    expect(amigo.fechaRegistro).toBeUndefined();
    expect(amigo.migratedFrom).toBe('visitas');
  });

  it('requires id field to be present', () => {
    const amigo: Amigo = {
      id: 'required-id',
      nombre: 'Test',
      migratedFrom: null,
    };

    expect(amigo.id).toBeDefined();
    expect(typeof amigo.id).toBe('string');
    expect(amigo.id.length).toBeGreaterThan(0);
  });

  it('requires nombre field to be present and non-empty', () => {
    const amigo: Amigo = {
      id: '9',
      nombre: 'Maria Lopez',
      migratedFrom: null,
    };

    expect(amigo.nombre).toBeDefined();
    expect(typeof amigo.nombre).toBe('string');
    expect(amigo.nombre.trim().length).toBeGreaterThan(0);
  });

  it('serializes to JSON correctly', () => {
    const amigo: Amigo = {
      id: '10',
      nombre: 'Carlos Ruiz',
      telefono: '987654321',
      notas: 'Nota con acentos: ó í é á ú',
      fechaRegistro: '2025-03-10T12:00:00.000Z',
      migratedFrom: 'visitas',
    };

    const json = JSON.stringify(amigo);
    const parsed = JSON.parse(json);

    expect(parsed.id).toBe('10');
    expect(parsed.nombre).toBe('Carlos Ruiz');
    expect(parsed.telefono).toBe('987654321');
    expect(parsed.notas).toBe('Nota con acentos: ó í é á ú');
    expect(parsed.fechaRegistro).toBe('2025-03-10T12:00:00.000Z');
    expect(parsed.migratedFrom).toBe('visitas');
  });

  it('serializes null migratedFrom correctly', () => {
    const amigo: Amigo = {
      id: '11',
      nombre: 'Directo',
      migratedFrom: null,
    };

    const json = JSON.stringify(amigo);
    const parsed = JSON.parse(json);

    expect(parsed.migratedFrom).toBeNull();
  });

  it('serializes undefined optional fields as missing in JSON', () => {
    const amigo: Amigo = {
      id: '12',
      nombre: 'Minimal',
      migratedFrom: null,
    };

    const json = JSON.stringify(amigo);
    const parsed = JSON.parse(json);

    expect(parsed.id).toBe('12');
    expect(parsed.nombre).toBe('Minimal');
    expect(parsed).not.toHaveProperty('telefono');
    expect(parsed).not.toHaveProperty('notas');
    expect(parsed).not.toHaveProperty('fechaRegistro');
  });

  it('deserializes from JSON with all fields', () => {
    const json = JSON.stringify({
      id: '13',
      nombre: 'Ana Gomez',
      telefono: '5551234',
      notas: 'Amiga',
      fechaRegistro: '2025-06-01T00:00:00.000Z',
      migratedFrom: 'simpatizantes',
    });

    const parsed = JSON.parse(json) as Amigo;

    expect(parsed.id).toBe('13');
    expect(parsed.nombre).toBe('Ana Gomez');
    expect(parsed.telefono).toBe('5551234');
    expect(parsed.notas).toBe('Amiga');
    expect(parsed.fechaRegistro).toBe('2025-06-01T00:00:00.000Z');
    expect(parsed.migratedFrom).toBe('simpatizantes');
  });

  it('handles round-trip JSON serialization and deserialization', () => {
    const original: Amigo = {
      id: '14',
      nombre: 'Round Trip',
      telefono: '111222333',
      notas: undefined,
      fechaRegistro: undefined,
      migratedFrom: null,
    };

    // Serialize and deserialize
    const json = JSON.stringify(original);
    const parsed = JSON.parse(json) as Amigo;

    // id and nombre should survive
    expect(parsed.id).toBe(original.id);
    expect(parsed.nombre).toBe(original.nombre);
    expect(parsed.telefono).toBe(original.telefono);
    // undefined fields are dropped by JSON.stringify, so they should be missing
    expect(parsed).not.toHaveProperty('notas');
    expect(parsed).not.toHaveProperty('fechaRegistro');
    expect(parsed.migratedFrom).toBeNull();
  });
});
