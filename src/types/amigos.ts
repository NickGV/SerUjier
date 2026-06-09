export interface Amigo {
  id: string;
  nombre: string;
  telefono?: string;
  direccion?: string;
  fechaRegistro?: string;
  notas?: string;
  migratedFrom: 'visitas' | 'simpatizantes' | null; // Tracks origin for migration
}
