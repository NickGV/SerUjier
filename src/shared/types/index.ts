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

export interface Simpatizante {
  id: string;
  nombre: string;
  telefono?: string;
  notas?: string;
  fechaRegistro?: string;
  [key: string]: unknown; // Permitir propiedades adicionales
}

export interface Visita {
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
  notas?: string;
  fechaRegistro?: string;
  [key: string]: unknown; // Permitir propiedades adicionales
}

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
  hermanosApartados: Array<MiembroSimplificado>;
}

export interface DatosServicioBase {
  hermanos: number;
  hermanas: number;
  ninos: number;
  adolescentes: number;
  simpatizantes: number;
  visitas: number;
  hermanosApartados: number;
  hermanosVisitas: number;
  total: number;
  servicio: string;
  simpatizantesAsistieron: Array<MiembroSimplificado>;
  visitasAsistieron: Array<MiembroSimplificado>;
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
