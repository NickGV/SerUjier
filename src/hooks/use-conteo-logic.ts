import { useState, useEffect } from "react";
import {
  fetchSimpatizantes,
  fetchMiembros,
  addSimpatizante,
  saveConteo,
} from "@/lib/utils";
import type { MiembroData, SimpatizanteData, ConteoData } from "@/app/types";
import { useConteo } from "@/contexts/conteo-context";

export function useConteoLogic() {
  const {
    hermanos,
    setHermanos,
    hermanas,
    setHermanas,
    ninos,
    setNinos,
    adolescentes,
    setAdolescentes,
    simpatizantesCount,
    setSimpatizantesCount,
    fecha,
    setFecha,
    tipoServicio,
    setTipoServicio,
    selectedUjieres,
    setSelectedUjieres,
    modoConsecutivo,
    setModoConsecutivo,
    datosServicioBase,
    setDatosServicioBase,
    simpatizantesDelDia,
    setSimpatizantesDelDia,
    hermanosDelDia,
    setHermanosDelDia,
    hermanasDelDia,
    setHermanasDelDia,
    ninosDelDia,
    setNinosDelDia,
    adolescentesDelDia,
    setAdolescentesDelDia,
    resetConteoForm,
  } = useConteo();

  // Estados locales para la lógica
  const [editingCounter, setEditingCounter] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSimpatizante, setNewSimpatizante] = useState({
    nombre: "",
    telefono: "",
    notas: "",
  });
  const [showAsistentesDialog, setShowAsistentesDialog] = useState(false);
  const [showMiembrosDialog, setShowMiembrosDialog] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [showContinuarDialog, setShowContinuarDialog] = useState(false);
  const [searchMiembros, setSearchMiembros] = useState("");
  const [showBulkCountDialog, setShowBulkCountDialog] = useState(false);
  const [bulkCounts, setBulkCounts] = useState({
    hermanos: "",
    hermanas: "",
    ninos: "",
    adolescentes: "",
    simpatizantes: "",
  });

  // Estados para datos de Firebase
  const [simpatizantes, setSimpatizantes] = useState<SimpatizanteData[]>([]);
  const [miembros, setMiembros] = useState<MiembroData[]>([]);
  const [loading, setLoading] = useState(true);

  const servicios = [
    { value: "dominical", label: "Dominical" },
    { value: "oracion", label: "Oración y Enseñanza" },
    { value: "dorcas", label: "Hermanas Dorcas" },
    { value: "evangelismo", label: "Evangelismo" },
    { value: "misionero", label: "Misionero" },
    { value: "jovenes", label: "Jóvenes" },
  ];

  const ujieres = [
    "Wilmar Rojas",
    "Juan Caldera",
    "Joaquin Velez",
    "Yarissa Rojas",
    "Cristian Gomez",
    "Hector Gaviria",
    "Ivan Caro",
    "Jhon echavarria",
    "Karen Cadavid",
    "Carolina Monsalve",
    "Marta Verona",
    "Nicolas Gömez",
    "Oraliz Fernåndez",
    "Santiago Graciano",
    "Suri Vélez",
    "Wilmar Vélez",
    "Diana Suarez",
    "José perdomo",
    "Carolina Caro",
  ];

  // Efecto para cargar datos desde Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [simpatizantesData, miembrosData] = await Promise.all([
          fetchSimpatizantes(),
          fetchMiembros(),
        ]);
        setSimpatizantes(simpatizantesData);
        setMiembros(miembrosData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Efecto para cargar los datos base cuando se entra en modo consecutivo
  useEffect(() => {
    if (modoConsecutivo && datosServicioBase) {
      setHermanos(datosServicioBase.hermanos || 0);
      setHermanas(datosServicioBase.hermanas || 0);
      setNinos(datosServicioBase.ninos || 0);
      setAdolescentes(datosServicioBase.adolescentes || 0);
      setSimpatizantesCount(datosServicioBase.simpatizantes || 0);
      setSimpatizantesDelDia(
        datosServicioBase.simpatizantesAsistieron?.map((s) => ({
          id: s.id,
          nombre: s.nombre,
          fechaRegistro: "",
        })) || []
      );
      setHermanosDelDia(datosServicioBase.miembrosAsistieron?.hermanos || []);
      setHermanasDelDia(datosServicioBase.miembrosAsistieron?.hermanas || []);
      setNinosDelDia(datosServicioBase.miembrosAsistieron?.ninos || []);
      setAdolescentesDelDia(
        datosServicioBase.miembrosAsistieron?.adolescentes || []
      );
      setTipoServicio("dominical"); // Forzar a dominical
    }
  }, [modoConsecutivo, datosServicioBase]);

  // Funciones de manejo de contadores
  const handleCounterEdit = (type: string, value: number) => {
    setEditingCounter(type);
    setTempValue(value.toString());
  };

  const saveCounterEdit = () => {
    const newValue = Number.parseInt(tempValue) || 0;
    switch (editingCounter) {
      case "hermanos":
        setHermanos(newValue);
        break;
      case "hermanas":
        setHermanas(newValue);
        break;
      case "ninos":
        setNinos(newValue);
        break;
      case "adolescentes":
        setAdolescentes(newValue);
        break;
      case "simpatizantes":
        setSimpatizantesCount(newValue);
        break;
    }
    setEditingCounter(null);
    setTempValue("");
  };

  // Funciones de manejo de simpatizantes
  const selectExistingSimpatizante = (simpatizante: SimpatizanteData) => {
    if (simpatizantesDelDia.find((s) => s.id === simpatizante.id)) {
      alert("Este simpatizante ya fue agregado hoy");
      return;
    }

    setSimpatizantesDelDia((prev) => [...prev, simpatizante]);
    setShowAddDialog(false);
    setSearchTerm("");
    setShowNewForm(false);
  };

  const addNewSimpatizante = async () => {
    if (newSimpatizante.nombre.trim()) {
      try {
        const result = await addSimpatizante({
          ...newSimpatizante,
          fechaRegistro: new Date().toISOString().split("T")[0],
        });

        const nuevoSimpatizante: SimpatizanteData = {
          id: result.id,
          nombre: newSimpatizante.nombre,
          fechaRegistro: new Date().toISOString().split("T")[0],
          telefono: newSimpatizante.telefono ?? "",
          notas: newSimpatizante.notas ?? "",
        };

        setSimpatizantesDelDia((prev) => [...prev, nuevoSimpatizante]);
        setSimpatizantes((prev) => [...prev, nuevoSimpatizante]);
        setNewSimpatizante({ nombre: "", telefono: "", notas: "" });
        setShowAddDialog(false);
        setSearchTerm("");
        setShowNewForm(false);
      } catch (error) {
        console.error("Error agregando simpatizante:", error);
        alert("Error al agregar simpatizante. Intente nuevamente.");
      }
    }
  };

  const removeSimpatizanteDelDia = (simpatizanteId: string) => {
    setSimpatizantesDelDia((prev) =>
      prev.filter((s) => s.id !== simpatizanteId)
    );
  };

  const closeDialog = () => {
    setShowAddDialog(false);
    setSearchTerm("");
    setShowNewForm(false);
    setNewSimpatizante({ nombre: "", telefono: "", notas: "" });
  };

  // Funciones de manejo de miembros
  const selectMiembro = (miembro: any, categoria: string) => {
    const setterMap: { [key: string]: (value: any[]) => void } = {
      hermanos: setHermanosDelDia,
      hermanas: setHermanasDelDia,
      ninos: setNinosDelDia,
      adolescentes: setAdolescentesDelDia,
    };

    const currentList =
      ({
        hermanos: hermanosDelDia,
        hermanas: hermanasDelDia,
        ninos: ninosDelDia,
        adolescentes: adolescentesDelDia,
      }[categoria] as any[]) || [];

    if (currentList.find((m: any) => m.id === miembro.id)) {
      alert("Este miembro ya fue agregado hoy");
      return;
    }

    setterMap[categoria]?.([...currentList, miembro]);
    setShowMiembrosDialog(false);
  };

  const removeMiembroDelDia = (miembroId: string, categoria: string) => {
    const setterMap: { [key: string]: (value: any[]) => void } = {
      hermanos: setHermanosDelDia,
      hermanas: setHermanasDelDia,
      ninos: setNinosDelDia,
      adolescentes: setAdolescentesDelDia,
    };

    const currentList =
      ({
        hermanos: hermanosDelDia,
        hermanas: hermanasDelDia,
        ninos: ninosDelDia,
        adolescentes: adolescentesDelDia,
      }[categoria] as any[]) || [];
    setterMap[categoria]?.(currentList.filter((m: any) => m.id !== miembroId));
  };

  const openMiembrosDialog = (categoria: string) => {
    setCategoriaSeleccionada(categoria);
    setShowMiembrosDialog(true);
  };

  const getMiembrosPorCategoria = (categoria: string) => {
    return miembros.filter((m) => {
      if (categoria === "ninos") return m.categoria === "nino";
      if (categoria === "adolescentes") return m.categoria === "adolescente";
      return m.categoria === categoria.slice(0, -1);
    });
  };

  // Funciones de conteo múltiple
  const handleBulkCountSubmit = () => {
    const counts = {
      hermanos: Number.parseInt(bulkCounts.hermanos) || 0,
      hermanas: Number.parseInt(bulkCounts.hermanas) || 0,
      ninos: Number.parseInt(bulkCounts.ninos) || 0,
      adolescentes: Number.parseInt(bulkCounts.adolescentes) || 0,
      simpatizantes: Number.parseInt(bulkCounts.simpatizantes) || 0,
    };

    setHermanos((prev) => prev + counts.hermanos);
    setHermanas((prev) => prev + counts.hermanas);
    setNinos((prev) => prev + counts.ninos);
    setAdolescentes((prev) => prev + counts.adolescentes);
    setSimpatizantesCount((prev) => prev + counts.simpatizantes);

    setBulkCounts({
      hermanos: "",
      hermanas: "",
      ninos: "",
      adolescentes: "",
      simpatizantes: "",
    });
    setShowBulkCountDialog(false);
  };

  const resetBulkCounts = () => {
    setBulkCounts({
      hermanos: "",
      hermanas: "",
      ninos: "",
      adolescentes: "",
      simpatizantes: "",
    });
  };

  // Función principal de guardado
  const handleSaveConteo = async () => {
    const ujieresFinal: string[] = selectedUjieres;

    if (ujieresFinal.length === 0) {
      alert("Por favor seleccione al menos un ujier");
      return;
    }

    const baseHermanos = modoConsecutivo ? datosServicioBase?.hermanos || 0 : 0;
    const baseHermanas = modoConsecutivo ? datosServicioBase?.hermanas || 0 : 0;
    const baseNinos = modoConsecutivo ? datosServicioBase?.ninos || 0 : 0;
    const baseAdolescentes = modoConsecutivo
      ? datosServicioBase?.adolescentes || 0
      : 0;
    const baseSimpatizantes = modoConsecutivo
      ? datosServicioBase?.simpatizantes || 0
      : 0;

    const totalSimpatizantes =
      simpatizantesCount + simpatizantesDelDia.length + baseSimpatizantes;
    const totalHermanos = hermanos + hermanosDelDia.length + baseHermanos;
    const totalHermanas = hermanas + hermanasDelDia.length + baseHermanas;
    const totalNinos = ninos + ninosDelDia.length + baseNinos;
    const totalAdolescentes =
      adolescentes + adolescentesDelDia.length + baseAdolescentes;

    const conteoData = {
      fecha,
      servicio:
        servicios.find((s) => s.value === tipoServicio)?.label || tipoServicio,
      ujier: ujieresFinal,
      hermanos: totalHermanos,
      hermanas: totalHermanas,
      ninos: totalNinos,
      adolescentes: totalAdolescentes,
      simpatizantes: totalSimpatizantes,
      total:
        totalHermanos +
        totalHermanas +
        totalNinos +
        totalAdolescentes +
        totalSimpatizantes,
      simpatizantesAsistieron: [
        ...(modoConsecutivo
          ? datosServicioBase?.simpatizantesAsistieron || []
          : []),
        ...simpatizantesDelDia.map((s) => ({ id: s.id, nombre: s.nombre })),
      ],
      miembrosAsistieron: {
        hermanos: [
          ...(modoConsecutivo
            ? datosServicioBase?.miembrosAsistieron?.hermanos || []
            : []),
          ...hermanosDelDia.map((m) => ({ id: m.id, nombre: m.nombre })),
        ],
        hermanas: [
          ...(modoConsecutivo
            ? datosServicioBase?.miembrosAsistieron?.hermanas || []
            : []),
          ...hermanasDelDia.map((m) => ({ id: m.id, nombre: m.nombre })),
        ],
        ninos: [
          ...(modoConsecutivo
            ? datosServicioBase?.miembrosAsistieron?.ninos || []
            : []),
          ...ninosDelDia.map((m) => ({ id: m.id, nombre: m.nombre })),
        ],
        adolescentes: [
          ...(modoConsecutivo
            ? datosServicioBase?.miembrosAsistieron?.adolescentes || []
            : []),
          ...adolescentesDelDia.map((m) => ({ id: m.id, nombre: m.nombre })),
        ],
      },
    };

    const fechaObj = new Date(fecha + "T12:00:00");
    const esDomingo = fechaObj.getDay() === 0;
    const esServicioBase =
      tipoServicio === "evangelismo" || tipoServicio === "misionero";

    try {
      if (esDomingo && esServicioBase && !modoConsecutivo) {
        await saveConteo(conteoData);
        setDatosServicioBase(conteoData);
        setShowContinuarDialog(true);
        return;
      }

      if (modoConsecutivo) {
        await saveConteo(conteoData);
        resetConteoForm();
        alert("Conteo dominical guardado exitosamente");
      } else {
        await saveConteo(conteoData);
        resetConteoForm();
        alert("Conteo guardado exitosamente");
      }
    } catch (error) {
      console.error("Error guardando conteo:", error);
      alert("Error al guardar el conteo. Intente nuevamente.");
    }
  };

  const continuarConDominical = () => {
    setModoConsecutivo(true);
    setTipoServicio("dominical");
    setShowContinuarDialog(false);
    alert(
      "Continuando con el servicio dominical. Los asistentes del servicio base se mantienen."
    );
  };

  const noContinarConDominical = () => {
    setShowContinuarDialog(false);
    resetConteoForm();
    alert("Conteo guardado exitosamente");
  };

  // Cálculos
  const totalSimpatizantesActual =
    simpatizantesCount + simpatizantesDelDia.length;
  const totalHermanosActual = hermanos + hermanosDelDia.length;
  const totalHermanasActual = hermanas + hermanasDelDia.length;
  const totalNinosActual = ninos + ninosDelDia.length;
  const totalAdolescentesActual = adolescentes + adolescentesDelDia.length;

  const total =
    totalHermanosActual +
    totalHermanasActual +
    totalNinosActual +
    totalAdolescentesActual +
    totalSimpatizantesActual;

  const filteredSimpatizantes = simpatizantes.filter(
    (s) =>
      s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !simpatizantesDelDia.find((sd) => sd.id === s.id)
  );

  return {
    // Estados del contexto
    hermanos,
    setHermanos,
    hermanas,
    setHermanas,
    ninos,
    setNinos,
    adolescentes,
    setAdolescentes,
    simpatizantesCount,
    setSimpatizantesCount,
    fecha,
    setFecha,
    tipoServicio,
    setTipoServicio,
    selectedUjieres,
    setSelectedUjieres,
    modoConsecutivo,
    setModoConsecutivo,
    datosServicioBase,
    setDatosServicioBase,
    simpatizantesDelDia,
    setSimpatizantesDelDia,
    hermanosDelDia,
    setHermanosDelDia,
    hermanasDelDia,
    setHermanasDelDia,
    ninosDelDia,
    setNinosDelDia,
    adolescentesDelDia,
    setAdolescentesDelDia,

    // Estados locales
    editingCounter,
    setEditingCounter,
    tempValue,
    setTempValue,
    showAddDialog,
    setShowAddDialog,
    searchTerm,
    setSearchTerm,
    showNewForm,
    setShowNewForm,
    newSimpatizante,
    setNewSimpatizante,
    showAsistentesDialog,
    setShowAsistentesDialog,
    showMiembrosDialog,
    setShowMiembrosDialog,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    showContinuarDialog,
    setShowContinuarDialog,
    searchMiembros,
    setSearchMiembros,
    showBulkCountDialog,
    setShowBulkCountDialog,
    bulkCounts,
    setBulkCounts,

    // Estados de Firebase
    simpatizantes,
    miembros,
    loading,

    // Constantes
    servicios,
    ujieres,

    // Funciones
    handleCounterEdit,
    saveCounterEdit,
    selectExistingSimpatizante,
    addNewSimpatizante,
    removeSimpatizanteDelDia,
    closeDialog,
    selectMiembro,
    removeMiembroDelDia,
    openMiembrosDialog,
    getMiembrosPorCategoria,
    handleBulkCountSubmit,
    resetBulkCounts,
    handleSaveConteo,
    continuarConDominical,
    noContinarConDominical,

    // Cálculos
    totalSimpatizantesActual,
    totalHermanosActual,
    totalHermanasActual,
    totalNinosActual,
    totalAdolescentesActual,
    total,
    filteredSimpatizantes,
  };
}
