import { type MiembroSimplificado, type HeRestauracion } from '@/shared/types';
import { type Amigo } from '@/types/amigos';

// Usamos el tipo Amigo de @/types/amigos para mantener consistencia
export type AmigoLite = Amigo & { [key: string]: unknown };
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
  amigosCount: number;
  heRestauracionCount: number;
  hermanosVisitasCount: number;
  fecha: string;
  tipoServicio: string;
  ujierSeleccionado: string;
  ujierPersonalizado: string;
  modoConsecutivo: boolean;
  isEditMode: boolean;
  editingRecordId: string | null;
  amigosDelDia: AmigoLite[];
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
  amigos: string;
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
  tipo: 'miembro' | 'amigo';
  esBase?: boolean;
}

export interface ConteoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface AmigosDialogProps extends ConteoDialogProps {
  amigos: AmigoLite[];
  amigosDelDia: AmigoLite[];
  baseAmigos: AmigoLite[];
  onAddAmigos: (amigos: AmigoLite[]) => void;
  onAddNewAmigo: (amigo: Omit<AmigoLite, 'id'>) => Promise<void>;
  onRemoveAmigo: (id: string) => void;
  onClearAllAmigos: () => void;
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
    tipo: 'miembro' | 'amigo'
  ) => void;
}

export interface HermanosVisitasDialogProps extends ConteoDialogProps {
  hermanosVisitasDelDia: HermanoVisita[];
  onAddHermanoVisita: (hermano: { nombre: string; iglesia?: string }) => void;
  onRemoveHermanoVisita: (id: string) => void;
}

// @deprecated Replaced by AmigoLite
export type SimpatizanteLite = AmigoLite;
// @deprecated Replaced by AmigoLite
export type VisitaLite = AmigoLite;

// @deprecated Use AmigosDialogProps instead
export interface SimpatizantesDialogProps extends ConteoDialogProps {
  simpatizantes: AmigoLite[];
  simpatizantesDelDia: AmigoLite[];
  baseSimpatizantes: AmigoLite[];
  onAddSimpatizantes: (simpatizantes: AmigoLite[]) => void;
  onAddNewSimpatizante: (simpatizante: Omit<AmigoLite, 'id'>) => Promise<void>;
  onRemoveSimpatizante: (id: string) => void;
  onClearAllSimpatizantes: () => void;
}
