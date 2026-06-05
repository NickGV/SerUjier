export interface Amigo {
  id: string;
  nombre: string;
  telefono?: string;
  notas?: string;
  fechaRegistro?: string;
  migratedFrom: 'visitas' | 'simpatizantes' | null; // Tracks origin for migration
}
