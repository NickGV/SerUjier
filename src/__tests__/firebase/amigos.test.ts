import { cleanDataForFirebase } from '@/firebase/amigos';

describe('cleanDataForFirebase', () => {
  it('strips undefined values from data', () => {
    const input = { name: 'Test', age: undefined, city: 'Bogotá' };
    const result = cleanDataForFirebase(input);
    expect(result).toEqual({ name: 'Test', city: 'Bogotá' });
  });

  it('strips null values from data', () => {
    const input = { name: 'Test', phone: null, email: 'test@test.com' };
    const result = cleanDataForFirebase(input);
    expect(result).toEqual({ name: 'Test', email: 'test@test.com' });
  });

  it('strips empty string values from data', () => {
    const input = { name: 'Test', notes: '', city: 'Bogotá' };
    const result = cleanDataForFirebase(input);
    expect(result).toEqual({ name: 'Test', city: 'Bogotá' });
  });

  it('preserves valid values including empty arrays and zero', () => {
    const input = { name: 'Test', count: 0, tags: [], active: false };
    const result = cleanDataForFirebase(input);
    expect(result).toEqual({ name: 'Test', count: 0, tags: [], active: false });
  });

  it('returns empty object when all values are stripped', () => {
    const input = { a: undefined, b: null, c: '' };
    const result = cleanDataForFirebase(input);
    expect(result).toEqual({});
  });

  it('returns same object when no values need stripping', () => {
    const input = { name: 'Ana', telefono: '3001234567' };
    const result = cleanDataForFirebase(input);
    expect(result).toEqual(input);
  });
});
