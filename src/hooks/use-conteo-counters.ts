"use client";

import { useState } from "react";
import { CounterData, ConteoState } from "@/components/conteo/types";
import { MiembroSimplificado } from "@/app/types";
import { CATEGORIA_COLORS } from "@/components/conteo/constants";

interface UseConteoCountersProps {
  conteoState: ConteoState;
  updateConteo: (updates: Partial<ConteoState>) => void;
  datosServicioBase: {
    hermanos?: number;
    hermanas?: number;
    ninos?: number;
    adolescentes?: number;
    simpatizantes?: number;
    hermanosApartados?: number;
    hermanosVisitas?: number;
    miembrosAsistieron?: {
      hermanos?: MiembroSimplificado[];
      hermanas?: MiembroSimplificado[];
      ninos?: MiembroSimplificado[];
      adolescentes?: MiembroSimplificado[];
      hermanosApartados?: MiembroSimplificado[];
    };
    simpatizantesAsistieron?: { id: string; nombre: string }[];
    hermanosVisitasAsistieron?: { id: string; nombre: string; iglesia?: string }[];
  } | null;
}

export function useConteoCounters({
  conteoState,
  updateConteo,
  datosServicioBase,
}: UseConteoCountersProps) {
  const [editingCounter, setEditingCounter] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");

  const handleCounterEdit = (type: string, value: number) => {
    setEditingCounter(type);
    setTempValue(value.toString());
  };

  const saveCounterEdit = () => {
    const newValue = parseInt(tempValue) || 0;
    const updates: Partial<ConteoState> = {};

    switch (editingCounter) {
      case "hermanos":
        updates.hermanos = newValue;
        break;
      case "hermanas":
        updates.hermanas = newValue;
        break;
      case "ninos":
        updates.ninos = newValue;
        break;
      case "adolescentes":
        updates.adolescentes = newValue;
        break;
      case "simpatizantes":
        updates.simpatizantesCount = newValue;
        break;
      case "hermanosApartados":
        updates.hermanosApartados = newValue;
        break;
      case "hermanosVisitas":
        updates.hermanosVisitasCount = newValue;
        break;
    }

    updateConteo(updates);
    setEditingCounter(null);
    setTempValue("");
  };

  const counters: CounterData[] = [
    {
      key: "hermanos",
      label: "Hermanos",
      value: conteoState.hermanos,
      setter: (value: number) => updateConteo({ hermanos: value }),
      color: CATEGORIA_COLORS.hermanos,
      miembrosDelDia: conteoState.hermanosDelDia,
      categoria: "hermanos",
      baseValue: conteoState.modoConsecutivo
        ? datosServicioBase?.hermanos || 0
        : 0,
      baseMiembros: conteoState.modoConsecutivo
        ? datosServicioBase?.miembrosAsistieron?.hermanos || []
        : [],
    },
    {
      key: "hermanas",
      label: "Hermanas",
      value: conteoState.hermanas,
      setter: (value: number) => updateConteo({ hermanas: value }),
      color: CATEGORIA_COLORS.hermanas,
      miembrosDelDia: conteoState.hermanasDelDia,
      categoria: "hermanas",
      baseValue: conteoState.modoConsecutivo
        ? datosServicioBase?.hermanas || 0
        : 0,
      baseMiembros: conteoState.modoConsecutivo
        ? datosServicioBase?.miembrosAsistieron?.hermanas || []
        : [],
    },
    {
      key: "ninos",
      label: "Niños",
      value: conteoState.ninos,
      setter: (value: number) => updateConteo({ ninos: value }),
      color: CATEGORIA_COLORS.ninos,
      miembrosDelDia: conteoState.ninosDelDia,
      categoria: "ninos",
      baseValue: conteoState.modoConsecutivo
        ? datosServicioBase?.ninos || 0
        : 0,
      baseMiembros: conteoState.modoConsecutivo
        ? datosServicioBase?.miembrosAsistieron?.ninos || []
        : [],
    },
    {
      key: "adolescentes",
      label: "Adolescentes",
      value: conteoState.adolescentes,
      setter: (value: number) => updateConteo({ adolescentes: value }),
      color: CATEGORIA_COLORS.adolescentes,
      miembrosDelDia: conteoState.adolescentesDelDia,
      categoria: "adolescentes",
      baseValue: conteoState.modoConsecutivo
        ? datosServicioBase?.adolescentes || 0
        : 0,
      baseMiembros: conteoState.modoConsecutivo
        ? datosServicioBase?.miembrosAsistieron?.adolescentes || []
        : [],
    },
    {
      key: "hermanosApartados",
      label: "Hermanos Apartados",
      value: conteoState.hermanosApartados,
      setter: (value: number) => updateConteo({ hermanosApartados: value }),
      color: CATEGORIA_COLORS.hermanosApartados,
      miembrosDelDia: conteoState.hermanosApartadosDelDia,
      categoria: "hermanosApartados",
      baseValue: conteoState.modoConsecutivo
        ? datosServicioBase?.hermanosApartados || 0
        : 0,
      baseMiembros: conteoState.modoConsecutivo
        ? datosServicioBase?.miembrosAsistieron?.hermanosApartados || []
        : [],
    },
    {
      key: "simpatizantes",
      label: "Simpatizantes",
      value: conteoState.simpatizantesCount,
      setter: (value: number) => updateConteo({ simpatizantesCount: value }),
      color: CATEGORIA_COLORS.simpatizantes,
      categoria: "simpatizantes",
      baseValue: conteoState.modoConsecutivo
        ? datosServicioBase?.simpatizantes || 0
        : 0,
      baseMiembros: conteoState.modoConsecutivo
        ? datosServicioBase?.simpatizantesAsistieron || []
        : [],
      miembrosDelDia: conteoState.simpatizantesDelDia,
    },
    {
      key: "hermanosVisitas",
      label: "Hermanos Visitas",
      value: conteoState.hermanosVisitasCount,
      setter: (value: number) => updateConteo({ hermanosVisitasCount: value }),
      color: CATEGORIA_COLORS.hermanosVisitas,
      categoria: "hermanosVisitas",
      baseValue: conteoState.modoConsecutivo
        ? datosServicioBase?.hermanosVisitas || 0
        : 0,
      baseMiembros: conteoState.modoConsecutivo
        ? datosServicioBase?.hermanosVisitasAsistieron || []
        : [],
      miembrosDelDia: conteoState.hermanosVisitasDelDia,
    },
  ];

  return {
    counters,
    editingCounter,
    tempValue,
    handleCounterEdit,
    saveCounterEdit,
    setTempValue,
  };
}
