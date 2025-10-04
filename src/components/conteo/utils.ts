import type { AsistenteInfo, SimpatizanteLite } from "./types";
import { MiembroSimplificado, DatosServicioBase } from "@/app/types";

interface MiembroConCategoria extends MiembroSimplificado {
  categoria: "hermano" | "hermana" | "nino" | "adolescente";
  telefono?: string;
  notas?: string;
  fechaRegistro?: string;
}

export const getMiembrosPorCategoria = (
  miembros: MiembroConCategoria[],
  categoria: string
): MiembroConCategoria[] => {
  return miembros.filter((m) => {
    if (categoria === "ninos") return m.categoria === "nino";
    if (categoria === "adolescentes") return m.categoria === "adolescente";
    return m.categoria === categoria.slice(0, -1); // remove 's' from end
  });
};

export const getCategoriaColor = (categoria: string) => {
  switch (categoria) {
    case "hermanos":
      return "bg-slate-50 border-slate-200 text-slate-700";
    case "hermanas":
      return "bg-rose-50 border-rose-200 text-rose-700";
    case "ninos":
      return "bg-amber-50 border-amber-200 text-amber-700";
    case "adolescentes":
      return "bg-purple-50 border-purple-200 text-purple-700";
    case "simpatizantes":
      return "bg-emerald-50 border-emerald-200 text-emerald-700";
    default:
      return "bg-gray-50 border-gray-200 text-gray-700";
  }
};

export const getCategoriaLabel = (categoria: string) => {
  switch (categoria) {
    case "hermanos":
      return "Hermanos";
    case "hermanas":
      return "Hermanas";
    case "ninos":
      return "Niños";
    case "adolescentes":
      return "Adolescentes";
    case "simpatizantes":
      return "Simpatizantes";
    default:
      return categoria;
  }
};

export const getAllAsistentes = (
  conteoState: {
    modoConsecutivo: boolean;
    simpatizantesDelDia: SimpatizanteLite[];
    hermanos: number;
    hermanas: number;
    ninos: number;
    adolescentes: number;
    hermanosDelDia: MiembroSimplificado[];
    hermanasDelDia: MiembroSimplificado[];
    ninosDelDia: MiembroSimplificado[];
    adolescentesDelDia: MiembroSimplificado[];
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
          tipo: "miembro",
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
            categoria: "simpatizantes",
            tipo: "simpatizante",
            esBase: true,
          });
        }
      );
    }
  }

  // Agregar miembros de esta sesión
  const categorias = ["hermanos", "hermanas", "ninos", "adolescentes"] as const;

  categorias.forEach((categoria) => {
    const miembrosDelDia = conteoState[`${categoria}DelDia`] || [];
    miembrosDelDia.forEach((miembro: MiembroSimplificado) => {
      asistentes.push({
        id: miembro.id,
        nombre: miembro.nombre,
        categoria,
        tipo: "miembro",
        esBase: false,
      });
    });
  });

  // Agregar simpatizantes de esta sesión
  conteoState.simpatizantesDelDia.forEach((simpatizante: SimpatizanteLite) => {
    asistentes.push({
      id: simpatizante.id,
      nombre: simpatizante.nombre,
      categoria: "simpatizantes",
      tipo: "simpatizante",
      esBase: false,
    });
  });

  return asistentes;
};
