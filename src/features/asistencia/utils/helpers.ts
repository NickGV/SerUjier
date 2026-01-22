import {
  type DatosServicioBase,
  type MiembroSimplificado,
} from '@/shared/types';
import type {
  AsistenteInfo,
  MiembroExtended,
  SimpatizanteLite,
  VisitaLite,
} from '../types';

export const getMiembrosPorCategoria = (
  miembros: MiembroExtended[],
  categoria: string
): MiembroExtended[] => {
  // Para hermanos apartados, incluir todos los miembros
  if (categoria === 'hermanosApartados') {
    return miembros;
  }

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
    case 'simpatizantes':
      return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    case 'visitas':
      return 'bg-green-50 border-green-200 text-green-700';
    case 'hermanosApartados':
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
    case 'simpatizantes':
      return 'Simpatizantes';
    case 'visitas':
      return 'Visitas';
    case 'hermanosApartados':
      return 'Hermanos Apartados';
    case 'hermanosVisitas':
      return 'Hermanos Visitas';
    default:
      return categoria;
  }
};

export const getAllAsistentes = (
  conteoState: {
    modoConsecutivo: boolean;
    simpatizantesDelDia: SimpatizanteLite[];
    visitasDelDia?: VisitaLite[];
    hermanos: number;
    hermanas: number;
    ninos: number;
    adolescentes: number;
    hermanosDelDia: MiembroSimplificado[];
    hermanasDelDia: MiembroSimplificado[];
    ninosDelDia: MiembroSimplificado[];
    adolescentesDelDia: MiembroSimplificado[];
    hermanosApartadosDelDia: MiembroSimplificado[];
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

    // Agregar simpatizantes base
    if (datosServicioBase.simpatizantesAsistieron) {
      datosServicioBase.simpatizantesAsistieron.forEach(
        (simpatizante: MiembroSimplificado) => {
          asistentes.push({
            id: `base-simpatizante-${simpatizante.id}`,
            nombre: simpatizante.nombre,
            categoria: 'simpatizantes',
            tipo: 'simpatizante',
            esBase: true,
          });
        }
      );
    }

    // Agregar visitas base
    if (datosServicioBase.visitasAsistieron) {
      datosServicioBase.visitasAsistieron.forEach(
        (visita: MiembroSimplificado) => {
          asistentes.push({
            id: `base-visita-${visita.id}`,
            nombre: visita.nombre,
            categoria: 'visitas',
            tipo: 'simpatizante',
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
    'hermanosApartados',
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

  // Agregar simpatizantes de esta sesión
  conteoState.simpatizantesDelDia.forEach((simpatizante: SimpatizanteLite) => {
    asistentes.push({
      id: simpatizante.id,
      nombre: simpatizante.nombre,
      categoria: 'simpatizantes',
      tipo: 'simpatizante',
      esBase: false,
    });
  });

  // Agregar visitas de esta sesión
  if (conteoState.visitasDelDia) {
    conteoState.visitasDelDia.forEach((visita: VisitaLite) => {
      asistentes.push({
        id: visita.id,
        nombre: visita.nombre,
        categoria: 'visitas',
        tipo: 'simpatizante',
        esBase: false,
      });
    });
  }

  return asistentes;
};
