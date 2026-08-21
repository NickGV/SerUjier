import type { Permission } from './permisos';

// User roles and types
export type User = {
  id: string;
  nombre: string;
  rol: 'ujier' | 'admin' | 'directiva';
  permisos?: Permission[];
};

// Re-export permission types
export * from './permisos';

export type Ujier = User & {
  additionalField: string; // Replace with actual fields
};

export interface HeRestauracion {
  id: string;
  nombre: string;
  telefono?: string;
  notas?: string;
  fechaRegistro?: string;
  [key: string]: unknown; // Permitir propiedades adicionales
}

// Categories of members
export type miembroCategoria = 'hermano' | 'hermana' | 'nino' | 'adolescente';

export interface Miembro {
  id: string;
  nombre: string;
  telefono?: string;
  categoria: miembroCategoria;
  esMiembro: boolean;
  notas?: string;
  fechaRegistro?: string;
  [key: string]: unknown; // Permitir propiedades adicionales
}

// Explicit write contract for miembros CRUD. A Pick (not an Omit of Miembro)
// defeats the index signature above, so a write path that forgets
// `esMiembro` fails type-check instead of silently compiling.
export type MiembroInput = Pick<
  Miembro,
  'nombre' | 'telefono' | 'categoria' | 'esMiembro' | 'notas' | 'fechaRegistro'
>;

export interface MiembroSimplificado {
  id: string;
  nombre: string;
}

export interface MiembrosAsistieron {
  [key: string]: Array<MiembroSimplificado>;
  hermanos: Array<MiembroSimplificado>;
  hermanas: Array<MiembroSimplificado>;
  ninos: Array<MiembroSimplificado>;
  adolescentes: Array<MiembroSimplificado>;
  heRestauracion: Array<MiembroSimplificado>;
}

export interface DatosServicioBase {
  hermanos: number;
  hermanas: number;
  ninos: number;
  adolescentes: number;
  amigos: number;
  heRestauracion: number;
  hermanosVisitas: number;
  total: number;
  servicio: string;
  amigosAsistieron: Array<MiembroSimplificado>;
  miembrosAsistieron: MiembrosAsistieron;
  hermanosVisitasAsistieron: Array<MiembroSimplificado>;
}

export type ApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type Theme = {
  primaryColor: string;
  secondaryColor: string;
  // Add more theme-related properties as needed
};
