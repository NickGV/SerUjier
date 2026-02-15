import {
  type MiembroSimplificado,
  type Simpatizante,
  type Visita,
  type HeRestauracion,
} from '@/shared/types';

// Usamos el tipo Simpatizante de shared/types para mantener consistencia
export type SimpatizanteLite = Simpatizante & { [key: string]: unknown };
export type VisitaLite = Visita & { [key: string]: unknown };
export type HeRestauracionLite = HeRestauracion & { [key: string]: unknown };

// Tipo para hermanos visitas (solo nombre, son de otra iglesia)
export interface HermanoVisita {
  id: string;
  nombre: string;
  iglesia?: string;
}

// Estado persistente del conteo (refleja use-persistent-conteo)
export interface ConteoStateBase {
  hermanos: number;
  hermanas: number;
  ninos: number;
  adolescentes: number;
  simpatizantesCount: number;
  visitasCount: number;
  heRestauracionCount: number;
  hermanosVisitasCount: number;
  fecha: string;
  tipoServicio: string;
  ujierSeleccionado: string;
  ujierPersonalizado: string;
  modoConsecutivo: boolean;
  isEditMode: boolean;
  editingRecordId: string | null;
  simpatizantesDelDia: SimpatizanteLite[];
  visitasDelDia: VisitaLite[];
  hermanosDelDia: MiembroSimplificado[];
  hermanasDelDia: MiembroSimplificado[];
  ninosDelDia: MiembroSimplificado[];
  adolescentesDelDia: MiembroSimplificado[];
  heRestauracionDelDia: MiembroSimplificado[];
  hermanosVisitasDelDia: HermanoVisita[];
  selectedUjieres: string[];
  searchMiembros: string;
}

export type ConteoState = ConteoStateBase & {
  [K in `${CategoriaPlural}DelDia`]: MiembroSimplificado[];
};

// Permite indexación dinámica segura (uso interno)
export type ConteoStateWithIndex = ConteoState & { [key: string]: unknown };

export interface BulkCounts {
  hermanos: string;
  hermanas: string;
  ninos: string;
  adolescentes: string;
  simpatizantes: string;
  visitas: string;
  heRestauracion: string;
  hermanosVisitas: string;
}

export interface CounterData {
  key: string;
  label: string;
  value: number;
  setter: (value: number) => void;
  color: string;
  miembrosDelDia: MiembroSimplificado[];
  categoria: string;
  baseValue: number;
  baseMiembros: MiembroSimplificado[];
}

export interface AsistenteInfo {
  id: string;
  nombre: string;
  categoria: string;
  tipo: 'miembro' | 'simpatizante';
  esBase?: boolean;
}

export interface ConteoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface SimpatizantesDialogProps extends ConteoDialogProps {
  simpatizantes: SimpatizanteLite[];
  simpatizantesDelDia: SimpatizanteLite[];
  baseSimpatizantes: SimpatizanteLite[];
  onAddSimpatizantes: (simpatizantes: SimpatizanteLite[]) => void;
  onAddNewSimpatizante: (
    simpatizante: Omit<SimpatizanteLite, 'id'>
  ) => Promise<void>;
  onRemoveSimpatizante: (id: string) => void;
  onClearAllSimpatizantes: () => void;
}

export type CategoriaPlural =
  | 'hermanos'
  | 'hermanas'
  | 'ninos'
  | 'adolescentes'
  | 'heRestauracion';

export interface MiembrosDialogProps extends ConteoDialogProps {
  categoria: CategoriaPlural; // hermanos | hermanas | ninos | adolescentes
  miembrosDisponibles: MiembroExtended[]; // fuente completa
  miembrosDelDia: MiembroSimplificado[];
  baseMiembros: MiembroSimplificado[];
  onAddMiembros: (miembros: MiembroExtended[]) => void;
  onRemoveMiembro: (id: string) => void;
  onClearAllMiembros: () => void;
}

// Representa un miembro completo disponible para seleccionar (subset del modelo Miembro)
export interface MiembroExtended extends MiembroSimplificado {
  telefono?: string;
  categoria: 'hermano' | 'hermana' | 'nino' | 'adolescente';
  notas?: string;
  fechaRegistro?: string;
  [key: string]: unknown; // Permitir propiedades adicionales
}

export interface AsistentesDialogProps extends ConteoDialogProps {
  asistentes: AsistenteInfo[];
  onRemoveAsistente: (
    id: string,
    categoria: string,
    tipo: 'miembro' | 'simpatizante'
  ) => void;
}

export interface HermanosVisitasDialogProps extends ConteoDialogProps {
  hermanosVisitasDelDia: HermanoVisita[];
  onAddHermanoVisita: (hermano: { nombre: string; iglesia?: string }) => void;
  onRemoveHermanoVisita: (id: string) => void;
}
