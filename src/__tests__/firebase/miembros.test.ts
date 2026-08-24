import { normalizeMiembro } from '@/shared/firebase/miembros';

describe('normalizeMiembro', () => {
  it('defaults esMiembro to false when the field is absent', () => {
    const result = normalizeMiembro('1', { nombre: 'Ana' });
    expect(result.esMiembro).toBe(false);
  });

  it('defaults esMiembro to false when the field is null', () => {
    const result = normalizeMiembro('1', { nombre: 'Ana', esMiembro: null });
    expect(result.esMiembro).toBe(false);
  });

  it('defaults esMiembro to false when the field is explicitly false', () => {
    const result = normalizeMiembro('1', { nombre: 'Ana', esMiembro: false });
    expect(result.esMiembro).toBe(false);
  });

  it('preserves esMiembro when the field is explicitly true', () => {
    const result = normalizeMiembro('1', { nombre: 'Ana', esMiembro: true });
    expect(result.esMiembro).toBe(true);
  });

  it('defaults esMiembro to false when the field holds a non-boolean value', () => {
    const result = normalizeMiembro('1', { nombre: 'Ana', esMiembro: 'yes' });
    expect(result.esMiembro).toBe(false);
  });

  it('preserves the document id and remaining fields', () => {
    const result = normalizeMiembro('42', {
      nombre: 'Ana',
      categoria: 'hermana',
      esMiembro: true,
    });
    expect(result.id).toBe('42');
    expect(result.nombre).toBe('Ana');
    expect(result.categoria).toBe('hermana');
  });
});
