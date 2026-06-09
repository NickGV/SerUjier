import {
  type DatosServicioBase,
  type MiembroSimplificado,
} from '@/shared/types';
import type { AmigoLite, AsistenteInfo, MiembroExtended } from '../types';

export const getMiembrosPorCategoria = (
  miembros: MiembroExtended[],
  categoria: string
): MiembroExtended[] => {
  // HeRestauracion is NOT filtered from miembros anymore
  // It now uses its own master collection
  // This function is only used for regular member categories

  return miembros.filter((m) => {
    if (categoria === 'ninos') return m.categoria === 'nino';
    if (categoria === 'adolescentes') return m.categoria === 'adolescente';
    return m.categoria === categoria.slice(0, -1); // remove 's' from end
  });
};

export const getCategoriaColor = (categoria: string) => {
  switch (categoria) {
    case 'hermanos':
      return 'bg-slate-50 border-slate-200 text-slate-700';
    case 'hermanas':
      return 'bg-rose-50 border-rose-200 text-rose-700';
    case 'ninos':
      return 'bg-amber-50 border-amber-200 text-amber-700';
    case 'adolescentes':
      return 'bg-purple-50 border-purple-200 text-purple-700';
    case 'amigos':
      return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    case 'heRestauracion':
      return 'bg-orange-50 border-orange-200 text-orange-700';
    case 'hermanosVisitas':
      return 'bg-indigo-50 border-indigo-200 text-indigo-700';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-700';
  }
};

export const getCategoriaLabel = (categoria: string) => {
  switch (categoria) {
    case 'hermanos':
      return 'Hermanos';
    case 'hermanas':
      return 'Hermanas';
    case 'ninos':
      return 'Niños';
    case 'adolescentes':
      return 'Adolescentes';
    case 'amigos':
      return 'Amigos';
    case 'heRestauracion':
      return 'Hermanos en Restauración';
    case 'hermanosVisitas':
      return 'Hermanos Visitas';
    default:
      return categoria;
  }
};

export const getAllAsistentes = (
  conteoState: {
    modoConsecutivo: boolean;
    amigosDelDia: AmigoLite[];
    hermanos: number;
    hermanas: number;
    ninos: number;
    adolescentes: number;
    hermanosDelDia: MiembroSimplificado[];
    hermanasDelDia: MiembroSimplificado[];
    ninosDelDia: MiembroSimplificado[];
    adolescentesDelDia: MiembroSimplificado[];
    heRestauracionDelDia: MiembroSimplificado[];
    hermanosVisitasDelDia: { id: string; nombre: string }[];
    // Acceso dinámico via index (usamos assertion al leer):
    [key: string]: unknown;
  },
  datosServicioBase: DatosServicioBase | null
): AsistenteInfo[] => {
  const asistentes: AsistenteInfo[] = [];

  // Agregar miembros base (si aplica)
  if (conteoState.modoConsecutivo && datosServicioBase) {
    Object.keys(datosServicioBase.miembrosAsistieron).forEach((catKey) => {
      const members = datosServicioBase.miembrosAsistieron[catKey];
      members.forEach((miembro: MiembroSimplificado) => {
        asistentes.push({
          id: `base-${miembro.id}`,
          nombre: miembro.nombre,
          categoria: catKey,
          tipo: 'miembro',
          esBase: true,
        });
      });
    });

    // Agregar amigos base
    if (datosServicioBase.amigosAsistieron) {
      datosServicioBase.amigosAsistieron.forEach(
        (amigo: MiembroSimplificado) => {
          asistentes.push({
            id: `base-amigo-${amigo.id}`,
            nombre: amigo.nombre,
            categoria: 'amigos',
            tipo: 'amigo',
            esBase: true,
          });
        }
      );
    }
  }

  // Agregar miembros de esta sesión
  const categorias = [
    'hermanos',
    'hermanas',
    'ninos',
    'adolescentes',
    'heRestauracion',
  ] as const;

  categorias.forEach((categoria) => {
    const miembrosDelDia = conteoState[`${categoria}DelDia`] || [];
    miembrosDelDia.forEach((miembro: MiembroSimplificado) => {
      asistentes.push({
        id: miembro.id,
        nombre: miembro.nombre,
        categoria,
        tipo: 'miembro',
        esBase: false,
      });
    });
  });

  // Agregar hermanos visitas de esta sesión
  conteoState.hermanosVisitasDelDia.forEach((hermanoVisita) => {
    asistentes.push({
      id: hermanoVisita.id,
      nombre: hermanoVisita.nombre,
      categoria: 'hermanosVisitas',
      tipo: 'miembro', // Los tratamos como miembros en la lógica
      esBase: false,
    });
  });

  // Agregar amigos de esta sesión
  conteoState.amigosDelDia.forEach((amigo: AmigoLite) => {
    asistentes.push({
      id: amigo.id,
      nombre: amigo.nombre,
      categoria: 'amigos',
      tipo: 'amigo',
      esBase: false,
    });
  });

  return asistentes;
};
