"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePersistentConteo } from "@/hooks/use-persistent-conteo";
import { useConteoCounters } from "@/hooks/use-conteo-counters";
import { useBulkCount } from "@/hooks/use-bulk-count";
import type { SimpatizanteLite, CounterData } from "@/components/conteo";
import {
  fetchSimpatizantes,
  fetchMiembros,
  addSimpatizante,
  saveConteo,
  fetchUjieres,
  getHistorialRecordById,
  updateHistorialRecord,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Calendar,
  User,
  Clock,
  Save,
  Eye,
  Trash2,
  X,
  Edit3,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DatosServicioBase, Miembro, MiembroSimplificado } from "@/app/types";
import { CategoriaPlural, ConteoStateWithIndex } from "@/components/conteo";

// Componentes modulares
import {
  CounterCard,
  SimpatizantesList,
  BulkCountDialog,
  SimpatizantesDialog,
  MiembrosDialog,
  AsistentesDialog,
  HermanosVisitasDialog,
  servicios,
  getAllAsistentes,
} from "@/components/conteo";

export default function ConteoPage() {
  // Estado para servicio manual
  const [showServicioInput, setShowServicioInput] = useState(false);
  const [servicioManual, setServicioManual] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("editId");

  // Hook persistente para el conteo
  const {
    conteoState,
    updateConteo,
    clearDayData,
    loadHistorialData,
    isLoaded,
  } = usePersistentConteo();

  // Estados locales que no necesitan persistencia (definidos antes de hooks que los usan)
  const [datosServicioBase, setDatosServicioBase] =
    useState<DatosServicioBase | null>(null);

  // Estados para modo edición
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Hook para los contadores (después de definir datosServicioBase)
  const {
    counters,
    editingCounter,
    tempValue,
    handleCounterEdit,
    saveCounterEdit,
    setTempValue,
  } = useConteoCounters({ conteoState, updateConteo, datosServicioBase });

  // Hook para bulk count
  const {
    showBulkCountDialog,
    setShowBulkCountDialog,
    bulkCounts,
    setBulkCounts,
    handleBulkCountSubmit,
    resetBulkCounts,
  } = useBulkCount({ conteoState, updateConteo });
  const [showSimpatizantesDialog, setShowSimpatizantesDialog] = useState(false);
  const [showAsistentesDialog, setShowAsistentesDialog] = useState(false);
  const [showMiembrosDialog, setShowMiembrosDialog] = useState(false);
  const [showHermanosVisitasDialog, setShowHermanosVisitasDialog] =
    useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<
    CategoriaPlural | ""
  >("");
  const [showContinuarDialog, setShowContinuarDialog] = useState(false);

  // Estados para datos de Firebase
  const [simpatizantes, setSimpatizantes] = useState<SimpatizanteLite[]>([]);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [loading, setLoading] = useState(true);

  // Lista de ujieres se carga desde Firebase
  const [ujieres, setUjieres] = useState<string[]>([]);

  // Efecto para cargar datos desde Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [simpatizantesData, miembrosData, ujieresData] =
          await Promise.all([
            fetchSimpatizantes(),
            fetchMiembros(),
            fetchUjieres(),
          ]);
        setSimpatizantes(simpatizantesData);
        setMiembros(miembrosData);
        // Extraer solo los nombres de los ujieres activos
        const nombresUjieres = ujieresData
          .filter((ujier) => ujier.activo)
          .map((ujier) => ujier.nombre)
          .sort();
        setUjieres(nombresUjieres);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Efecto para cargar datos de historial cuando estamos en modo edición
  useEffect(() => {
    const loadEditData = async () => {
      if (editId && isLoaded && !loading) {
        try {
          setLoadingEdit(true);
          const historialRecord = await getHistorialRecordById(editId);
          loadHistorialData(historialRecord);
          setIsEditMode(true);
          setEditingRecordId(editId);
          toast.success("Datos cargados para edición");
        } catch (error) {
          console.error("Error cargando registro para edición:", error);
          toast.error("Error al cargar el registro para edición");
          router.push("/historial");
        } finally {
          setLoadingEdit(false);
        }
      }
    };

    loadEditData();
  }, [editId, isLoaded, loading, loadHistorialData, router]);

  // Nota: En modo consecutivo NO copiamos la base al estado. La base sólo se
  // toma en cuenta al calcular totales y al mostrar asistentes, evitando
  // duplicaciones.

  // Funciones simplificadas para manejar los diálogos
  const handleAddSimpatizantes = (newSimpatizantes: SimpatizanteLite[]) => {
    updateConteo({
      simpatizantesDelDia: [
        ...conteoState.simpatizantesDelDia,
        ...newSimpatizantes,
      ],
    });
    toast.success(
      `${newSimpatizantes.length} simpatizantes agregados exitosamente`
    );
  };

  const handleAddNewSimpatizante = async (
    simpatizanteData: Omit<SimpatizanteLite, "id">
  ) => {
    const withFecha = {
      fechaRegistro: new Date().toISOString().split("T")[0],
      ...simpatizanteData,
    } as Required<Pick<SimpatizanteLite, "fechaRegistro">> &
      Omit<SimpatizanteLite, "id">;
    const result = await addSimpatizante(withFecha);
    const creado: SimpatizanteLite = {
      id: (result as { id: string }).id,
      ...withFecha,
    };

    updateConteo({
      simpatizantesDelDia: [...conteoState.simpatizantesDelDia, creado],
    });
    setSimpatizantes((prev) => [...prev, creado]);
  };

  const handleRemoveSimpatizante = (simpatizanteId: string) => {
    updateConteo({
      simpatizantesDelDia: conteoState.simpatizantesDelDia.filter(
        (s) => s.id !== simpatizanteId
      ),
    });
  };

  const handleClearAllSimpatizantes = () => {
    updateConteo({
      simpatizantesDelDia: [],
    });
  };

  const categoriaKey = (c: CategoriaPlural) => `${c}DelDia` as const;

  const handleAddMiembros = (
    categoria: CategoriaPlural,
    newMiembros: MiembroSimplificado[]
  ) => {
    const key = categoriaKey(categoria);
    const currentList = conteoState[key] as MiembroSimplificado[];
    const updates: Partial<ConteoStateWithIndex> = {};
    const newMembers = newMiembros.map((miembro) => ({
      id: miembro.id,
      nombre: miembro.nombre,
    }));

    (updates as ConteoStateWithIndex)[key] = [...currentList, ...newMembers];
    updateConteo(updates);
  };

  const handleRemoveMiembro = (
    categoria: CategoriaPlural,
    miembroId: string
  ) => {
    const key = categoriaKey(categoria);
    const currentList: MiembroSimplificado[] = conteoState[
      key
    ] as MiembroSimplificado[];
    const updates: Partial<ConteoStateWithIndex> = {};
    (updates as ConteoStateWithIndex)[key] = currentList.filter(
      (m) => m.id !== miembroId
    );
    updateConteo(updates);
  };

  const handleClearAllMiembros = (categoria: CategoriaPlural) => {
    const key = categoriaKey(categoria);
    const updates: Partial<ConteoStateWithIndex> = {};
    (updates as ConteoStateWithIndex)[key] = [];
    updateConteo(updates);
  };

  const openMiembrosDialog = (categoria: CategoriaPlural) => {
    setCategoriaSeleccionada(categoria);
    setShowMiembrosDialog(true);
  };

  const openSimpatizantesDialog = () => {
    setShowSimpatizantesDialog(true);
  };

  const openHermanosVisitasDialog = () => {
    setShowHermanosVisitasDialog(true);
  };

  const handleAddHermanoVisita = (nuevoHermano: { nombre: string }) => {
    const hermanoVisita = {
      id: Date.now().toString(), // ID simple basado en timestamp
      nombre: nuevoHermano.nombre,
    };

    updateConteo({
      hermanosVisitasDelDia: [
        ...conteoState.hermanosVisitasDelDia,
        hermanoVisita,
      ],
    });
  };

  const handleRemoveHermanoVisita = (hermanoId: string) => {
    updateConteo({
      hermanosVisitasDelDia: conteoState.hermanosVisitasDelDia.filter(
        (h) => h.id !== hermanoId
      ),
    });
  };

  const handleCounterIncrement = (counter: CounterData) => {
    counter.setter(counter.value + 1);
  };

  const handleCounterDecrement = (counter: CounterData) => {
    counter.setter(Math.max(0, counter.value - 1));
  };

  const handleOpenDialog = (categoria: string) => {
    if (categoria === "simpatizantes") {
      openSimpatizantesDialog();
    } else if (categoria === "hermanosVisitas") {
      openHermanosVisitasDialog();
    } else {
      openMiembrosDialog(categoria as CategoriaPlural);
    }
  };

  // Función para manejar el guardado del conteo
  const handleSaveConteo = async () => {
    // Usar los ujieres seleccionados
    const ujieresFinal: string[] = conteoState.selectedUjieres;

    if (ujieresFinal.length === 0) {
      toast.info("Por favor seleccione al menos un ujier");
      return;
    }

    // Calcular totales, sumando la base si estamos en modo consecutivo
    const baseHermanos = conteoState.modoConsecutivo
      ? datosServicioBase?.hermanos || 0
      : 0;
    const baseHermanas = conteoState.modoConsecutivo
      ? datosServicioBase?.hermanas || 0
      : 0;
    const baseNinos = conteoState.modoConsecutivo
      ? datosServicioBase?.ninos || 0
      : 0;
    const baseAdolescentes = conteoState.modoConsecutivo
      ? datosServicioBase?.adolescentes || 0
      : 0;
    const baseSimpatizantes = conteoState.modoConsecutivo
      ? datosServicioBase?.simpatizantes || 0
      : 0;
    const baseHermanosApartados = conteoState.modoConsecutivo
      ? datosServicioBase?.hermanosApartados || 0
      : 0;
    const baseHermanosVisitas = conteoState.modoConsecutivo
      ? datosServicioBase?.hermanosVisitas || 0
      : 0;

    const totalSimpatizantes =
      conteoState.simpatizantesCount +
      conteoState.simpatizantesDelDia.length +
      baseSimpatizantes;
    const totalHermanos =
      conteoState.hermanos + conteoState.hermanosDelDia.length + baseHermanos;
    const totalHermanas =
      conteoState.hermanas + conteoState.hermanasDelDia.length + baseHermanas;
    const totalNinos =
      conteoState.ninos + conteoState.ninosDelDia.length + baseNinos;
    const totalAdolescentes =
      conteoState.adolescentes +
      conteoState.adolescentesDelDia.length +
      baseAdolescentes;
    const totalHermanosApartados =
      conteoState.hermanosApartados +
      conteoState.hermanosApartadosDelDia.length +
      baseHermanosApartados;
    const totalHermanosVisitas =
      conteoState.hermanosVisitasCount +
      conteoState.hermanosVisitasDelDia.length +
      baseHermanosVisitas;

    const conteoData = {
      fecha: conteoState.fecha,
      servicio:
        servicios.find((s) => s.value === conteoState.tipoServicio)?.label ||
        conteoState.tipoServicio,
      ujier: ujieresFinal, // Ahora es un array
      hermanos: totalHermanos,
      hermanas: totalHermanas,
      ninos: totalNinos,
      adolescentes: totalAdolescentes,
      simpatizantes: totalSimpatizantes,
      hermanosApartados: totalHermanosApartados,
      hermanosVisitas: totalHermanosVisitas,
      total:
        totalHermanos +
        totalHermanas +
        totalNinos +
        totalAdolescentes +
        totalSimpatizantes +
        totalHermanosApartados +
        totalHermanosVisitas,
      simpatizantesAsistieron: [
        ...(conteoState.modoConsecutivo
          ? datosServicioBase?.simpatizantesAsistieron || []
          : []),
        ...conteoState.simpatizantesDelDia.map((s) => ({
          id: s.id,
          nombre: s.nombre,
        })),
      ],
      miembrosAsistieron: {
        hermanos: [
          ...(conteoState.modoConsecutivo
            ? datosServicioBase?.miembrosAsistieron?.hermanos || []
            : []),
          ...conteoState.hermanosDelDia.map((m) => ({
            id: m.id,
            nombre: m.nombre,
          })),
        ],
        hermanas: [
          ...(conteoState.modoConsecutivo
            ? datosServicioBase?.miembrosAsistieron?.hermanas || []
            : []),
          ...conteoState.hermanasDelDia.map((m) => ({
            id: m.id,
            nombre: m.nombre,
          })),
        ],
        ninos: [
          ...(conteoState.modoConsecutivo
            ? datosServicioBase?.miembrosAsistieron?.ninos || []
            : []),
          ...conteoState.ninosDelDia.map((m) => ({
            id: m.id,
            nombre: m.nombre,
          })),
        ],
        adolescentes: [
          ...(conteoState.modoConsecutivo
            ? datosServicioBase?.miembrosAsistieron?.adolescentes || []
            : []),
          ...conteoState.adolescentesDelDia.map((m) => ({
            id: m.id,
            nombre: m.nombre,
          })),
        ],
        hermanosApartados: [
          ...(conteoState.modoConsecutivo
            ? datosServicioBase?.miembrosAsistieron?.hermanosApartados || []
            : []),
          ...conteoState.hermanosApartadosDelDia.map((m) => ({
            id: m.id,
            nombre: m.nombre,
          })),
        ],
      },
      hermanosVisitasAsistieron: [
        ...(conteoState.modoConsecutivo
          ? datosServicioBase?.hermanosVisitasAsistieron || []
          : []),
        ...conteoState.hermanosVisitasDelDia.map((h) => ({
          id: h.id,
          nombre: h.nombre,
        })),
      ],
    };

    // Si estamos en modo edición, actualizar el registro existente
    if (isEditMode && editingRecordId) {
      try {
        await updateHistorialRecord(editingRecordId, conteoData);

        // Limpiar todo y resetear estados
        setDatosServicioBase(null);
        clearDayData();

        // Resetear modo consecutivo si estaba activo
        updateConteo({
          modoConsecutivo: false,
          tipoServicio: "dominical", // Volver al servicio por defecto
        });

        toast.success("Registro actualizado exitosamente");
        router.push("/historial");
        return;
      } catch (error) {
        console.error("Error actualizando registro:", error);
        toast.error("Error al actualizar el registro. Intente nuevamente.");
        return;
      }
    }

    // Verificar si es evangelismo/misionero (y no estamos en modo consecutivo)
    const esServicioBase =
      conteoState.tipoServicio === "evangelismo" ||
      conteoState.tipoServicio === "misionero";

    try {
      if (esServicioBase && !conteoState.modoConsecutivo) {
        // Guardar datos del evangelismo/misionero y preguntar si continuar
        await saveConteo(conteoData);
        setDatosServicioBase(conteoData); // Guardar el conteo actual como base
        setShowContinuarDialog(true);
        return;
      }

      if (conteoState.modoConsecutivo) {
        // Estamos guardando el dominical después del evangelismo/misionero
        await saveConteo(conteoData);

        // Resetear completamente el modo consecutivo y limpiar todo
        setDatosServicioBase(null);
        clearDayData(); // Limpiar solo los datos del día

        // Resetear el modo consecutivo
        updateConteo({
          modoConsecutivo: false,
          tipoServicio: "dominical", // Volver al servicio por defecto
        });

        toast.success(
          "Conteo dominical guardado exitosamente. Modo consecutivo finalizado."
        );
      } else {
        // Guardado normal
        await saveConteo(conteoData);
        clearDayData(); // Limpiar solo los datos del día
        toast.success("Conteo guardado exitosamente");
      }
    } catch (error) {
      console.error("Error guardando conteo:", error);
      toast.error("Error al guardar el conteo. Intente nuevamente.");
    }
  };

  const continuarConDominical = () => {
    // Activar modo consecutivo y reiniciar contadores/listas del día.
    // Conservamos los ujieres seleccionados.
    updateConteo({
      modoConsecutivo: true,
      tipoServicio: "dominical",
      hermanos: 0,
      hermanas: 0,
      ninos: 0,
      adolescentes: 0,
      simpatizantesCount: 0,
      hermanosApartados: 0,
      hermanosVisitasCount: 0,
      simpatizantesDelDia: [],
      hermanosDelDia: [],
      hermanasDelDia: [],
      ninosDelDia: [],
      adolescentesDelDia: [],
      hermanosApartadosDelDia: [],
      hermanosVisitasDelDia: [],
      // selectedUjieres y campos de ujier se mantienen tal cual
    });
    setShowContinuarDialog(false);
    toast.success(
      "Continuando con el servicio dominical. La base se mantiene y los contadores se reinician."
    );
  };

  const noContinarConDominical = () => {
    setShowContinuarDialog(false);
    setDatosServicioBase(null); // Limpiar los datos base
    clearDayData(); // Limpiar solo los datos del día

    // Asegurar que no quede en modo consecutivo
    updateConteo({
      modoConsecutivo: false,
    });

    toast.success("Conteo guardado exitosamente");
  };

  // Calcular el total de asistentes (incluyendo base si estamos en modo consecutivo)
  const baseHermanosDisplay = conteoState.modoConsecutivo
    ? datosServicioBase?.hermanos || 0
    : 0;
  const baseHermanasDisplay = conteoState.modoConsecutivo
    ? datosServicioBase?.hermanas || 0
    : 0;
  const baseNinosDisplay = conteoState.modoConsecutivo
    ? datosServicioBase?.ninos || 0
    : 0;
  const baseAdolescentesDisplay = conteoState.modoConsecutivo
    ? datosServicioBase?.adolescentes || 0
    : 0;
  const baseSimpatizantesDisplay = conteoState.modoConsecutivo
    ? datosServicioBase?.simpatizantes || 0
    : 0;
  const baseHermanosApartadosDisplay = conteoState.modoConsecutivo
    ? datosServicioBase?.hermanosApartados || 0
    : 0;
  const baseHermanosVisitasDisplay = conteoState.modoConsecutivo
    ? datosServicioBase?.hermanosVisitas || 0
    : 0;

  const totalSimpatizantesActual =
    conteoState.simpatizantesCount +
    conteoState.simpatizantesDelDia.length +
    baseSimpatizantesDisplay;
  const totalHermanosActual =
    conteoState.hermanos +
    conteoState.hermanosDelDia.length +
    baseHermanosDisplay;
  const totalHermanasActual =
    conteoState.hermanas +
    conteoState.hermanasDelDia.length +
    baseHermanasDisplay;
  const totalNinosActual =
    conteoState.ninos + conteoState.ninosDelDia.length + baseNinosDisplay;
  const totalAdolescentesActual =
    conteoState.adolescentes +
    conteoState.adolescentesDelDia.length +
    baseAdolescentesDisplay;
  const totalHermanosApartadosActual =
    conteoState.hermanosApartados +
    conteoState.hermanosApartadosDelDia.length +
    baseHermanosApartadosDisplay;
  const totalHermanosVisitasActual =
    conteoState.hermanosVisitasCount +
    conteoState.hermanosVisitasDelDia.length +
    baseHermanosVisitasDisplay;

  const total =
    totalHermanosActual +
    totalHermanasActual +
    totalNinosActual +
    totalAdolescentesActual +
    totalSimpatizantesActual +
    totalHermanosApartadosActual +
    totalHermanosVisitasActual;

  // Obtener lista de asistentes para el diálogo
  const asistentes = getAllAsistentes(
    conteoState as ConteoStateWithIndex,
    datosServicioBase
  );

  if (loading || !isLoaded || loadingEdit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">
            {loadingEdit
              ? "Cargando datos para edición..."
              : "Cargando datos..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 min-h-screen max-w-full overflow-x-hidden">
      {/* Banner de modo edición */}
      {isEditMode && (
        <Card className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-base sm:text-lg">
                    Modo Edición
                  </div>
                  <div className="text-orange-100 text-xs sm:text-sm">
                    Está editando un registro existente del historial
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (
                    confirm(
                      "¿Desea cancelar la edición? Los cambios no guardados se perderán."
                    )
                  ) {
                    // Limpiar todo y resetear estados
                    setDatosServicioBase(null);
                    clearDayData();

                    // Resetear modo consecutivo si estaba activo
                    updateConteo({
                      modoConsecutivo: false,
                      tipoServicio: "dominical", // Volver al servicio por defecto
                    });

                    router.push("/historial");
                  }
                }}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-3 px-3 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-800">
              Conteo de Asistencia
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkCountDialog(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700 text-xs sm:text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Conteo Múltiple
            </Button>
          </div>

          {/* Campos editables */}
          <div className="space-y-3 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="fecha-input"
                  className="text-sm md:text-base text-gray-600 mb-2 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                  Fecha
                </label>
                <Input
                  id="fecha-input"
                  type="date"
                  value={conteoState.fecha}
                  onChange={(e) => updateConteo({ fecha: e.target.value })}
                  className="h-10 md:h-12 text-sm md:text-base"
                  aria-describedby="fecha-help"
                />
                <div id="fecha-help" className="text-xs text-gray-500 mt-1">
                  Seleccione la fecha del servicio
                </div>
              </div>
              <div>
                <label
                  htmlFor="servicio-select"
                  className="text-sm md:text-base text-gray-600 mb-2 flex items-center gap-2"
                >
                  <Clock className="w-4 h-4 md:w-5 md:h-5" />
                  Servicio
                </label>
                <Select
                  value={conteoState.tipoServicio}
                  onValueChange={(value) => {
                    if (value === "manual") {
                      setShowServicioInput(true);
                    } else {
                      updateConteo({ tipoServicio: value });
                      setShowServicioInput(false);
                    }
                  }}
                >
                  <SelectTrigger
                    id="servicio-select"
                    className="h-10 md:h-12 text-sm md:text-base"
                    aria-describedby="servicio-help"
                  >
                    <SelectValue>
                      {servicios.find(
                        (s) => s.value === conteoState.tipoServicio
                      )?.label || conteoState.tipoServicio}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-64 md:max-h-80">
                    {servicios.map((servicio) => (
                      <SelectItem key={servicio.value} value={servicio.value}>
                        {servicio.label}
                      </SelectItem>
                    ))}
                    <SelectItem key="manual" value="manual">
                      Agregar servicio...
                    </SelectItem>
                  </SelectContent>
                </Select>
                {showServicioInput && (
                  <div className="mt-2 flex gap-2 items-center">
                    <Input
                      type="text"
                      placeholder="Nombre del servicio"
                      value={servicioManual}
                      onChange={(e) => setServicioManual(e.target.value)}
                      className="h-10 md:h-12 text-sm md:text-base"
                    />
                    <button
                      type="button"
                      className="px-3 py-2 bg-blue-600 text-white rounded"
                      onClick={() => {
                        if (servicioManual.trim()) {
                          updateConteo({ tipoServicio: servicioManual.trim() });
                          setShowServicioInput(false);
                        }
                      }}
                    >
                      Guardar
                    </button>
                  </div>
                )}
                <div id="servicio-help" className="text-xs text-gray-500 mt-1">
                  Tipo de servicio a registrar
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="ujier-select"
                className="text-sm md:text-base text-gray-600 mb-2 flex items-center gap-2"
              >
                <User className="w-4 h-4 md:w-5 md:h-5" />
                Ujier(es) -{" "}
                {conteoState.selectedUjieres.length > 0
                  ? `${conteoState.selectedUjieres.length} seleccionados`
                  : "Ninguno seleccionado"}
              </label>

              {/* Ujieres seleccionados */}
              {conteoState.selectedUjieres.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {conteoState.selectedUjieres.map((ujier, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-slate-50 text-slate-700 border-slate-200 flex items-center gap-1"
                    >
                      {ujier}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-slate-200"
                        onClick={() => {
                          const remaining = conteoState.selectedUjieres.filter(
                            (u) => u !== ujier
                          );
                          updateConteo({ selectedUjieres: remaining });

                          // Actualizar ujierSeleccionado y ujierPersonalizado
                          if (remaining.length === 0) {
                            updateConteo({
                              ujierSeleccionado: "",
                              ujierPersonalizado: "",
                            });
                          } else if (
                            remaining.length === 1 &&
                            ujieres.includes(remaining[0])
                          ) {
                            updateConteo({
                              ujierSeleccionado: remaining[0],
                              ujierPersonalizado: "",
                            });
                          } else {
                            updateConteo({
                              ujierSeleccionado: "otro",
                              ujierPersonalizado: remaining.join(", "),
                            });
                          }
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Selector de ujieres */}
              <Select
                value=""
                onValueChange={(value) => {
                  if (value === "otro") {
                    // Abrir input para escribir nombre personalizado
                    const nuevoUjier = prompt("Escriba el nombre del ujier:");
                    if (nuevoUjier && nuevoUjier.trim()) {
                      const ujierLimpio = nuevoUjier.trim();
                      if (!conteoState.selectedUjieres.includes(ujierLimpio)) {
                        const nuevosUjieres = [
                          ...conteoState.selectedUjieres,
                          ujierLimpio,
                        ];
                        updateConteo({
                          selectedUjieres: nuevosUjieres,
                          ujierSeleccionado: "otro",
                          ujierPersonalizado: nuevosUjieres.join(", "),
                        });
                      }
                    }
                  } else if (
                    value &&
                    !conteoState.selectedUjieres.includes(value)
                  ) {
                    const nuevosUjieres = [
                      ...conteoState.selectedUjieres,
                      value,
                    ];
                    updateConteo({ selectedUjieres: nuevosUjieres });
                    if (nuevosUjieres.length === 1) {
                      updateConteo({
                        ujierSeleccionado: value,
                        ujierPersonalizado: "",
                      });
                    } else {
                      updateConteo({
                        ujierSeleccionado: "otro",
                        ujierPersonalizado: nuevosUjieres.join(", "),
                      });
                    }
                  }
                }}
              >
                <SelectTrigger
                  id="ujier-select"
                  className="h-10 md:h-12 text-sm md:text-base"
                  aria-describedby="ujier-help"
                >
                  <SelectValue placeholder="+ Agregar ujier" />
                </SelectTrigger>
                <SelectContent className="max-h-64 md:max-h-80">
                  {ujieres.length > 0 ? (
                    ujieres
                      .filter(
                        (ujier) => !conteoState.selectedUjieres.includes(ujier)
                      )
                      .map((ujier) => (
                        <SelectItem key={ujier} value={ujier}>
                          {ujier}
                        </SelectItem>
                      ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      Cargando ujieres...
                    </SelectItem>
                  )}
                  <SelectItem value="otro">
                    + Escribir nombre personalizado
                  </SelectItem>
                </SelectContent>
              </Select>
              <div id="ujier-help" className="text-xs text-gray-500 mt-1">
                Seleccione los ujieres que participaron en el servicio
              </div>

              {/* Botón para limpiar selección */}
              {conteoState.selectedUjieres.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 text-sm bg-transparent border-red-200 text-red-600 hover:bg-red-50 h-10"
                  onClick={() => {
                    updateConteo({
                      selectedUjieres: [],
                      ujierSeleccionado: "",
                      ujierPersonalizado: "",
                    });
                  }}
                  aria-label="Limpiar selección de ujieres"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpiar selección
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <Badge
              variant="outline"
              className="bg-slate-50 text-slate-700 border-slate-200"
            >
              {
                servicios.find((s) => s.value === conteoState.tipoServicio)
                  ?.label
              }
            </Badge>
            {conteoState.ujierSeleccionado === "otro" &&
            conteoState.ujierPersonalizado ? (
              conteoState.ujierPersonalizado.split(",").map((name, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-slate-50 text-slate-700 border-slate-200"
                >
                  {name.trim()}
                </Badge>
              ))
            ) : conteoState.ujierSeleccionado &&
              conteoState.ujierSeleccionado !== "otro" ? (
              <Badge
                variant="outline"
                className="bg-slate-50 text-slate-700 border-slate-200"
              >
                {conteoState.ujierSeleccionado}
              </Badge>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      {conteoState.modoConsecutivo && datosServicioBase && (
        <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">
                Modo Consecutivo:{" "}
                {
                  servicios.find((s) => s.value === conteoState.tipoServicio)
                    ?.label
                }
              </span>
            </div>
            <div className="text-emerald-100 text-sm">
              Base del {datosServicioBase.servicio}: {datosServicioBase.total}{" "}
              asistentes
            </div>
            <div className="text-emerald-200 text-xs mt-1">
              Los contadores actuales se sumarán a la base del servicio
              anterior.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Total Counter */}
      <Card className="bg-gradient-to-r from-slate-700 to-slate-800 text-white border-0 shadow-lg">
        <CardContent className="p-4 sm:p-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">{total}</h2>
          <p className="text-slate-200 text-sm sm:text-base">
            Total de Asistentes
          </p>
        </CardContent>
      </Card>

      {/* Counters */}
      <div className="space-y-3 sm:space-y-4">
        {counters.map((counter) => (
          <CounterCard
            key={counter.key}
            counter={counter}
            editingCounter={editingCounter}
            tempValue={tempValue}
            onEdit={handleCounterEdit}
            onSaveEdit={saveCounterEdit}
            onTempValueChange={setTempValue}
            onOpenDialog={handleOpenDialog}
            onIncrement={() => handleCounterIncrement(counter)}
            onDecrement={() => handleCounterDecrement(counter)}
          />
        ))}
      </div>

      {/* Ver Lista Asistentes Button */}
      {(conteoState.hermanosDelDia.length > 0 ||
        conteoState.hermanasDelDia.length > 0 ||
        conteoState.ninosDelDia.length > 0 ||
        conteoState.adolescentesDelDia.length > 0 ||
        conteoState.simpatizantesDelDia.length > 0 ||
        (conteoState.modoConsecutivo &&
          ((datosServicioBase?.simpatizantesAsistieron &&
            datosServicioBase.simpatizantesAsistieron.length > 0) ||
            (datosServicioBase?.miembrosAsistieron?.hermanos &&
              datosServicioBase.miembrosAsistieron.hermanos.length > 0) ||
            (datosServicioBase?.miembrosAsistieron?.hermanas &&
              datosServicioBase.miembrosAsistieron.hermanas.length > 0) ||
            (datosServicioBase?.miembrosAsistieron?.ninos &&
              datosServicioBase.miembrosAsistieron.ninos.length > 0) ||
            (datosServicioBase?.miembrosAsistieron?.adolescentes &&
              datosServicioBase.miembrosAsistieron.adolescentes.length >
                0)))) && (
        <Button
          variant="outline"
          className="w-full h-12 md:h-14 bg-transparent border-blue-200 text-blue-700 hover:bg-blue-50 active:bg-blue-100 rounded-xl py-4 md:py-5 shadow-lg text-base md:text-lg font-semibold mb-4"
          onClick={() => setShowAsistentesDialog(true)}
          aria-label="Ver lista completa de asistentes"
        >
          <Eye className="w-5 h-5 md:w-6 md:h-6 mr-2" />
          <span className="flex-1 text-center">Ver Lista de Asistentes</span>
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-700 border-blue-300 ml-2 text-sm"
          >
            {conteoState.hermanosDelDia.length +
              conteoState.hermanasDelDia.length +
              conteoState.ninosDelDia.length +
              conteoState.adolescentesDelDia.length +
              conteoState.simpatizantesDelDia.length +
              (conteoState.modoConsecutivo &&
              datosServicioBase?.miembrosAsistieron?.hermanos
                ? datosServicioBase.miembrosAsistieron.hermanos.length
                : 0) +
              (conteoState.modoConsecutivo &&
              datosServicioBase?.miembrosAsistieron?.hermanas
                ? datosServicioBase.miembrosAsistieron.hermanas.length
                : 0) +
              (conteoState.modoConsecutivo &&
              datosServicioBase?.miembrosAsistieron?.ninos
                ? datosServicioBase.miembrosAsistieron.ninos.length
                : 0) +
              (conteoState.modoConsecutivo &&
              datosServicioBase?.miembrosAsistieron?.adolescentes
                ? datosServicioBase.miembrosAsistieron.adolescentes.length
                : 0) +
              (conteoState.modoConsecutivo &&
              datosServicioBase?.simpatizantesAsistieron
                ? datosServicioBase.simpatizantesAsistieron.length
                : 0)}
          </Badge>
        </Button>
      )}

      {/* Diálogos modulares */}
      <SimpatizantesDialog
        isOpen={showSimpatizantesDialog}
        onClose={() => setShowSimpatizantesDialog(false)}
        simpatizantes={simpatizantes}
        simpatizantesDelDia={conteoState.simpatizantesDelDia}
        onAddSimpatizantes={handleAddSimpatizantes}
        onAddNewSimpatizante={handleAddNewSimpatizante}
        onRemoveSimpatizante={handleRemoveSimpatizante}
        onClearAllSimpatizantes={handleClearAllSimpatizantes}
      />

      {categoriaSeleccionada && (
        <MiembrosDialog
          isOpen={showMiembrosDialog}
          onClose={() => setShowMiembrosDialog(false)}
          categoria={categoriaSeleccionada as CategoriaPlural}
          miembrosDisponibles={miembros}
          miembrosDelDia={
            conteoState[categoriaKey(categoriaSeleccionada as CategoriaPlural)]
          }
          baseMiembros={
            conteoState.modoConsecutivo
              ? (datosServicioBase?.miembrosAsistieron?.[
                  categoriaSeleccionada as keyof typeof datosServicioBase.miembrosAsistieron
                ] as MiembroSimplificado[] | undefined) || []
              : []
          }
          onAddMiembros={(newMiembros) =>
            handleAddMiembros(
              categoriaSeleccionada as CategoriaPlural,
              newMiembros
            )
          }
          onRemoveMiembro={(miembroId) =>
            handleRemoveMiembro(
              categoriaSeleccionada as CategoriaPlural,
              miembroId
            )
          }
          onClearAllMiembros={() =>
            handleClearAllMiembros(categoriaSeleccionada as CategoriaPlural)
          }
        />
      )}

      <AsistentesDialog
        isOpen={showAsistentesDialog}
        onClose={() => setShowAsistentesDialog(false)}
        asistentes={asistentes}
        onRemoveAsistente={(id, categoria, tipo) => {
          if (
            tipo === "miembro" &&
            [
              "hermanos",
              "hermanas",
              "ninos",
              "adolescentes",
              "hermanosApartados",
            ].includes(categoria)
          ) {
            handleRemoveMiembro(categoria as CategoriaPlural, id);
          } else if (categoria === "hermanosVisitas") {
            handleRemoveHermanoVisita(id);
          } else {
            handleRemoveSimpatizante(id);
          }
        }}
      />

      <BulkCountDialog
        isOpen={showBulkCountDialog}
        onClose={() => setShowBulkCountDialog(false)}
        bulkCounts={bulkCounts}
        onBulkCountsChange={setBulkCounts}
        onSubmit={handleBulkCountSubmit}
        onReset={resetBulkCounts}
      />

      <HermanosVisitasDialog
        isOpen={showHermanosVisitasDialog}
        onClose={() => setShowHermanosVisitasDialog(false)}
        hermanosVisitasDelDia={conteoState.hermanosVisitasDelDia}
        onAddHermanoVisita={handleAddHermanoVisita}
        onRemoveHermanoVisita={handleRemoveHermanoVisita}
      />

      {/* Save Button */}
      <Button
        onClick={handleSaveConteo}
        className={`w-full h-12 md:h-14 ${
          isEditMode
            ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            : "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
        } active:from-slate-800 active:to-slate-900 text-white rounded-xl py-4 md:py-5 shadow-lg text-base md:text-lg font-semibold mb-4`}
        aria-label={
          isEditMode ? "Actualizar registro" : "Guardar conteo de asistencia"
        }
      >
        <Save className="w-5 h-5 md:w-6 md:h-6 mr-2" />
        <span className="flex-1 text-center">
          {isEditMode
            ? "Actualizar Registro"
            : conteoState.modoConsecutivo
            ? "Guardar Conteo de Asistencia"
            : "Guardar Conteo de Asistencia"}
        </span>
      </Button>

      {/* Simpatizantes del día */}
      <SimpatizantesList
        simpatizantesDelDia={conteoState.simpatizantesDelDia}
        onRemoveSimpatizante={handleRemoveSimpatizante}
      />

      {/* Dialog para continuar con dominical */}
      {showContinuarDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Servicio Consecutivo
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                El conteo del servicio de {datosServicioBase?.servicio} ha sido
                guardado. ¿Desea continuar con el conteo del servicio dominical
                manteniendo los asistentes actuales como base?
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={continuarConDominical}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl py-3"
              >
                <Plus className="w-5 h-5 mr-2" />
                Sí, Continuar con Dominical
              </Button>
              <Button
                variant="outline"
                onClick={noContinarConDominical}
                className="w-full bg-transparent rounded-xl py-3"
              >
                No, Solo {datosServicioBase?.servicio}
              </Button>
            </div>

            {datosServicioBase && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">
                  Resumen {datosServicioBase.servicio}:
                </div>
                <div className="text-sm font-medium text-gray-800">
                  Total: {datosServicioBase.total} asistentes
                </div>
                <div className="text-xs text-gray-500">
                  H: {datosServicioBase.hermanos} | M:{" "}
                  {datosServicioBase.hermanas} | N: {datosServicioBase.ninos} |
                  A: {datosServicioBase.adolescentes} | S:{" "}
                  {datosServicioBase.simpatizantes}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
