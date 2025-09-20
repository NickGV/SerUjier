"use client";

import { useState, useEffect } from "react";
import { usePersistentConteo } from "@/hooks/use-persistent-conteo";

// Interfaces para los tipos de datos
interface Simpatizante {
  id: string;
  nombre: string;
  telefono?: string;
  notas?: string;
  fechaRegistro?: string;
}

interface Miembro {
  id: string;
  nombre: string;
  telefono?: string;
  categoria: "hermano" | "hermana" | "nino" | "adolescente";
}

interface MiembroSimplificado {
  id: string;
  nombre: string;
}

interface MiembrosAsistieron {
  [key: string]: Array<MiembroSimplificado>;
  hermanos: Array<MiembroSimplificado>;
  hermanas: Array<MiembroSimplificado>;
  ninos: Array<MiembroSimplificado>;
  adolescentes: Array<MiembroSimplificado>;
}

interface DatosServicioBase {
  hermanos: number;
  hermanas: number;
  ninos: number;
  adolescentes: number;
  simpatizantes: number;
  total: number;
  servicio: string;
  simpatizantesAsistieron: Array<MiembroSimplificado>;
  miembrosAsistieron: MiembrosAsistieron;
}

// Interfaces removidas porque no se usan actualmente
// Se pueden volver a agregar cuando sean necesarias
import {
  fetchSimpatizantes,
  fetchMiembros,
  addSimpatizante,
  saveConteo,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Minus,
  Edit3,
  UserPlus,
  Calendar,
  User,
  Clock,
  Search,
  X,
  Save,
  Users,
  Eye,
  CheckCircle,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function ConteoPage() {
  // Hook persistente para el conteo
  const { conteoState, updateConteo, clearDayData, isLoaded } = usePersistentConteo();

  // Estados locales que no necesitan persistencia
  const [datosServicioBase, setDatosServicioBase] = useState<DatosServicioBase | null>(null);
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

  // Estados para datos de Firebase
  const [simpatizantes, setSimpatizantes] = useState<Simpatizante[]>([]);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [loading, setLoading] = useState(true);

  // Add multiple count entry functionality
  const [showBulkCountDialog, setShowBulkCountDialog] = useState(false);
  const [bulkCounts, setBulkCounts] = useState({
    hermanos: "",
    hermanas: "",
    ninos: "",
    adolescentes: "",
    simpatizantes: "",
  });

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
    if (conteoState.modoConsecutivo && datosServicioBase) {
      updateConteo({
        hermanos: datosServicioBase.hermanos || 0,
        hermanas: datosServicioBase.hermanas || 0,
        ninos: datosServicioBase.ninos || 0,
        adolescentes: datosServicioBase.adolescentes || 0,
        simpatizantesCount: datosServicioBase.simpatizantes || 0,
        simpatizantesDelDia: datosServicioBase.simpatizantesAsistieron || [],
        hermanosDelDia: datosServicioBase.miembrosAsistieron?.hermanos || [],
        hermanasDelDia: datosServicioBase.miembrosAsistieron?.hermanas || [],
        ninosDelDia: datosServicioBase.miembrosAsistieron?.ninos || [],
        adolescentesDelDia: datosServicioBase.miembrosAsistieron?.adolescentes || [],
        tipoServicio: "dominical", // Forzar a dominical
      });
    }
  }, [conteoState.modoConsecutivo, datosServicioBase, updateConteo]);

  const handleCounterEdit = (type: string, value: number) => {
    setEditingCounter(type);
    setTempValue(value.toString());
  };

  const saveCounterEdit = () => {
    const newValue = Number.parseInt(tempValue) || 0;
    const updates: Partial<typeof conteoState> = {};
    
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
    }
    
    updateConteo(updates);
    setEditingCounter(null);
    setTempValue("");
  };

  const selectExistingSimpatizante = (simpatizante: Simpatizante) => {
    // Verificar si ya está en la lista del día
    if (conteoState.simpatizantesDelDia.find((s) => s.id === simpatizante.id)) {
      toast.info("Este simpatizante ya fue agregado hoy");
      return;
    }

    updateConteo({
      simpatizantesDelDia: [...conteoState.simpatizantesDelDia, simpatizante]
    });
    setShowAddDialog(false);
    setSearchTerm("");
    setShowNewForm(false);
  };

  const addNewSimpatizante = async () => {
    if (newSimpatizante.nombre.trim()) {
      try {
        // Agregar a Firebase
        const nuevoSimpatizante = await addSimpatizante({
          ...newSimpatizante,
          fechaRegistro: new Date().toISOString().split("T")[0],
        });

        // Agregar a la lista del día
        updateConteo({
          simpatizantesDelDia: [...conteoState.simpatizantesDelDia, nuevoSimpatizante as Simpatizante]
        });

        // Actualizar la lista de simpatizantes disponibles
        setSimpatizantes((prev) => [
          ...prev,
          nuevoSimpatizante as Simpatizante,
        ]);

        // Limpiar formulario
        setNewSimpatizante({ nombre: "", telefono: "", notas: "" });
        setShowAddDialog(false);
        setSearchTerm("");
        setShowNewForm(false);
      } catch (error) {
        console.error("Error agregando simpatizante:", error);
        toast.error("Error al agregar simpatizante. Intente nuevamente.");
      }
    }
  };

  const removeSimpatizanteDelDia = (simpatizanteId: string) => {
    updateConteo({
      simpatizantesDelDia: conteoState.simpatizantesDelDia.filter((s) => s.id !== simpatizanteId)
    });
  };

  const closeDialog = () => {
    setShowAddDialog(false);
    setSearchTerm("");
    setShowNewForm(false);
    setNewSimpatizante({ nombre: "", telefono: "", notas: "" });
  };

  const selectMiembro = (miembro: Miembro, categoria: string) => {
    let currentList: MiembroSimplificado[] = [];
    
    switch (categoria) {
      case "hermanos":
        currentList = conteoState.hermanosDelDia;
        break;
      case "hermanas":
        currentList = conteoState.hermanasDelDia;
        break;
      case "ninos":
        currentList = conteoState.ninosDelDia;
        break;
      case "adolescentes":
        currentList = conteoState.adolescentesDelDia;
        break;
    }

    if (currentList.find((m: MiembroSimplificado) => m.id === miembro.id)) {
      toast.info("Este miembro ya fue agregado hoy");
      return;
    }

    const updates: Partial<typeof conteoState> = {};
    switch (categoria) {
      case "hermanos":
        updates.hermanosDelDia = [...currentList, { id: miembro.id, nombre: miembro.nombre }];
        break;
      case "hermanas":
        updates.hermanasDelDia = [...currentList, { id: miembro.id, nombre: miembro.nombre }];
        break;
      case "ninos":
        updates.ninosDelDia = [...currentList, { id: miembro.id, nombre: miembro.nombre }];
        break;
      case "adolescentes":
        updates.adolescentesDelDia = [...currentList, { id: miembro.id, nombre: miembro.nombre }];
        break;
    }

    updateConteo(updates);

    // Mostrar toast de confirmación en lugar de cerrar el diálogo
    toast.success(`${miembro.nombre} agregado a ${categoria}`);
  };

  const removeMiembroDelDia = (miembroId: string, categoria: string) => {
    let currentList: MiembroSimplificado[] = [];
    
    switch (categoria) {
      case "hermanos":
        currentList = conteoState.hermanosDelDia;
        break;
      case "hermanas":
        currentList = conteoState.hermanasDelDia;
        break;
      case "ninos":
        currentList = conteoState.ninosDelDia;
        break;
      case "adolescentes":
        currentList = conteoState.adolescentesDelDia;
        break;
    }
    
    const updates: Partial<typeof conteoState> = {};
    switch (categoria) {
      case "hermanos":
        updates.hermanosDelDia = currentList.filter((m: MiembroSimplificado) => m.id !== miembroId);
        break;
      case "hermanas":
        updates.hermanasDelDia = currentList.filter((m: MiembroSimplificado) => m.id !== miembroId);
        break;
      case "ninos":
        updates.ninosDelDia = currentList.filter((m: MiembroSimplificado) => m.id !== miembroId);
        break;
      case "adolescentes":
        updates.adolescentesDelDia = currentList.filter((m: MiembroSimplificado) => m.id !== miembroId);
        break;
    }

    updateConteo(updates);
  };

  const openMiembrosDialog = (categoria: string) => {
    setCategoriaSeleccionada(categoria);
    setShowMiembrosDialog(true);
  };

  const getMiembrosPorCategoria = (categoria: string) => {
    return miembros.filter((m) => {
      if (categoria === "ninos") return m.categoria === "nino";
      if (categoria === "adolescentes") return m.categoria === "adolescente";
      return m.categoria === categoria.slice(0, -1); // remove 's' from end
    });
  };

  const handleBulkCountSubmit = () => {
    const counts = {
      hermanos: Number.parseInt(bulkCounts.hermanos) || 0,
      hermanas: Number.parseInt(bulkCounts.hermanas) || 0,
      ninos: Number.parseInt(bulkCounts.ninos) || 0,
      adolescentes: Number.parseInt(bulkCounts.adolescentes) || 0,
      simpatizantes: Number.parseInt(bulkCounts.simpatizantes) || 0,
    };

    updateConteo({
      hermanos: conteoState.hermanos + counts.hermanos,
      hermanas: conteoState.hermanas + counts.hermanas,
      ninos: conteoState.ninos + counts.ninos,
      adolescentes: conteoState.adolescentes + counts.adolescentes,
      simpatizantesCount: conteoState.simpatizantesCount + counts.simpatizantes,
    });

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

  const handleSaveConteo = async () => {
    // Usar los ujieres seleccionados
    const ujieresFinal: string[] = conteoState.selectedUjieres;

    if (ujieresFinal.length === 0) {
      toast.info("Por favor seleccione al menos un ujier");
      return;
    }

    // Calcular totales, sumando la base si estamos en modo consecutivo
    const baseHermanos = conteoState.modoConsecutivo ? datosServicioBase?.hermanos || 0 : 0;
    const baseHermanas = conteoState.modoConsecutivo ? datosServicioBase?.hermanas || 0 : 0;
    const baseNinos = conteoState.modoConsecutivo ? datosServicioBase?.ninos || 0 : 0;
    const baseAdolescentes = conteoState.modoConsecutivo
      ? datosServicioBase?.adolescentes || 0
      : 0;
    const baseSimpatizantes = conteoState.modoConsecutivo
      ? datosServicioBase?.simpatizantes || 0
      : 0;

    const totalSimpatizantes =
      conteoState.simpatizantesCount + conteoState.simpatizantesDelDia.length + baseSimpatizantes;
    const totalHermanos = conteoState.hermanos + conteoState.hermanosDelDia.length + baseHermanos;
    const totalHermanas = conteoState.hermanas + conteoState.hermanasDelDia.length + baseHermanas;
    const totalNinos = conteoState.ninos + conteoState.ninosDelDia.length + baseNinos;
    const totalAdolescentes =
      conteoState.adolescentes + conteoState.adolescentesDelDia.length + baseAdolescentes;

    const conteoData = {
      fecha: conteoState.fecha,
      servicio:
        servicios.find((s) => s.value === conteoState.tipoServicio)?.label || conteoState.tipoServicio,
      ujier: ujieresFinal, // Ahora es un array
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
        ...(conteoState.modoConsecutivo
          ? datosServicioBase?.simpatizantesAsistieron || []
          : []),
        ...conteoState.simpatizantesDelDia.map((s) => ({ id: s.id, nombre: s.nombre })),
      ],
      miembrosAsistieron: {
        hermanos: [
          ...(conteoState.modoConsecutivo
            ? datosServicioBase?.miembrosAsistieron?.hermanos || []
            : []),
          ...conteoState.hermanosDelDia.map((m) => ({ id: m.id, nombre: m.nombre })),
        ],
        hermanas: [
          ...(conteoState.modoConsecutivo
            ? datosServicioBase?.miembrosAsistieron?.hermanas || []
            : []),
          ...conteoState.hermanasDelDia.map((m) => ({ id: m.id, nombre: m.nombre })),
        ],
        ninos: [
          ...(conteoState.modoConsecutivo
            ? datosServicioBase?.miembrosAsistieron?.ninos || []
            : []),
          ...conteoState.ninosDelDia.map((m) => ({ id: m.id, nombre: m.nombre })),
        ],
        adolescentes: [
          ...(conteoState.modoConsecutivo
            ? datosServicioBase?.miembrosAsistieron?.adolescentes || []
            : []),
          ...conteoState.adolescentesDelDia.map((m) => ({ id: m.id, nombre: m.nombre })),
        ],
      },
    };

    // Verificar si es domingo y evangelismo/misionero (y no estamos en modo consecutivo)
    const fechaObj = new Date(conteoState.fecha + "T12:00:00"); // Add time to avoid timezone issues
    const esDomingo = fechaObj.getDay() === 0;
    const esServicioBase =
      conteoState.tipoServicio === "evangelismo" || conteoState.tipoServicio === "misionero";

    try {
      if (esDomingo && esServicioBase && !conteoState.modoConsecutivo) {
        // Guardar datos del evangelismo/misionero y preguntar si continuar
        await saveConteo(conteoData);
        setDatosServicioBase(conteoData); // Guardar el conteo actual como base
        setShowContinuarDialog(true);
        return;
      }

      if (conteoState.modoConsecutivo) {
        // Estamos guardando el dominical después del evangelismo/misionero
        await saveConteo(conteoData);
        clearDayData(); // Limpiar solo los datos del día
        toast.success("Conteo dominical guardado exitosamente");
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
    updateConteo({
      modoConsecutivo: true,
      tipoServicio: "dominical"
    });
    setShowContinuarDialog(false);
    // Los contadores y listas ya se habrán cargado desde datosServicioBase en el useEffect
    toast.success(
      "Continuando con el servicio dominical. Los asistentes del servicio base se mantienen."
    );
  };

  const noContinarConDominical = () => {
    setShowContinuarDialog(false);
    clearDayData(); // Limpiar solo los datos del día
    toast.success("Conteo guardado exitosamente");
  };


  const filteredSimpatizantes = simpatizantes.filter(
    (s) =>
      s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !conteoState.simpatizantesDelDia.find((sd) => sd.id === s.id)
  );

  // Calcular el total de asistentes incluyendo la base si estamos en modo consecutivo
  const totalSimpatizantesActual =
    conteoState.simpatizantesCount + conteoState.simpatizantesDelDia.length;
  const totalHermanosActual = conteoState.hermanos + conteoState.hermanosDelDia.length;
  const totalHermanasActual = conteoState.hermanas + conteoState.hermanasDelDia.length;
  const totalNinosActual = conteoState.ninos + conteoState.ninosDelDia.length;
  const totalAdolescentesActual = conteoState.adolescentes + conteoState.adolescentesDelDia.length;

  const total =
    totalHermanosActual +
    totalHermanasActual +
    totalNinosActual +
    totalAdolescentesActual +
    totalSimpatizantesActual;

  const counters = [
    {
      key: "hermanos",
      label: "Hermanos",
      value: conteoState.hermanos,
      setter: (value: number) => updateConteo({ hermanos: value }),
      color: "bg-slate-600",
      miembrosDelDia: conteoState.hermanosDelDia,
      categoria: "hermanos",
      baseValue: conteoState.modoConsecutivo ? datosServicioBase?.hermanos || 0 : 0,
      baseMiembros: conteoState.modoConsecutivo
        ? datosServicioBase?.miembrosAsistieron?.hermanos || []
        : [],
    },
    {
      key: "hermanas",
      label: "Hermanas",
      value: conteoState.hermanas,
      setter: (value: number) => updateConteo({ hermanas: value }),
      color: "bg-rose-600",
      miembrosDelDia: conteoState.hermanasDelDia,
      categoria: "hermanas",
      baseValue: conteoState.modoConsecutivo ? datosServicioBase?.hermanas || 0 : 0,
      baseMiembros: conteoState.modoConsecutivo
        ? datosServicioBase?.miembrosAsistieron?.hermanas || []
        : [],
    },
    {
      key: "ninos",
      label: "Niños",
      value: conteoState.ninos,
      setter: (value: number) => updateConteo({ ninos: value }),
      color: "bg-amber-600",
      miembrosDelDia: conteoState.ninosDelDia,
      categoria: "ninos",
      baseValue: conteoState.modoConsecutivo ? datosServicioBase?.ninos || 0 : 0,
      baseMiembros: conteoState.modoConsecutivo
        ? datosServicioBase?.miembrosAsistieron?.ninos || []
        : [],
    },
    {
      key: "adolescentes",
      label: "Adolescentes",
      value: conteoState.adolescentes,
      setter: (value: number) => updateConteo({ adolescentes: value }),
      color: "bg-purple-600",
      miembrosDelDia: conteoState.adolescentesDelDia,
      categoria: "adolescentes",
      baseValue: conteoState.modoConsecutivo ? datosServicioBase?.adolescentes || 0 : 0,
      baseMiembros: conteoState.modoConsecutivo
        ? datosServicioBase?.miembrosAsistieron?.adolescentes || []
        : [],
    },
    {
      key: "simpatizantes",
      label: "Simpatizantes",
      value: conteoState.simpatizantesCount,
      setter: (value: number) => updateConteo({ simpatizantesCount: value }),
      color: "bg-emerald-600",
      categoria: "simpatizantes",
      baseValue: conteoState.modoConsecutivo ? datosServicioBase?.simpatizantes || 0 : 0,
      baseMiembros: conteoState.modoConsecutivo
        ? datosServicioBase?.simpatizantesAsistieron || []
        : [],
      miembrosDelDia: conteoState.simpatizantesDelDia, // Asegurarse de que esta propiedad exista
    },
  ];

  if (loading || !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 min-h-screen max-w-full overflow-x-hidden">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Fecha
                </label>
                <Input
                  type="date"
                  value={conteoState.fecha}
                  onChange={(e) => updateConteo({ fecha: e.target.value })}
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Servicio
                </label>
                <Select value={conteoState.tipoServicio} onValueChange={(value) => updateConteo({ tipoServicio: value })}>
                  <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {servicios.map((servicio) => (
                      <SelectItem key={servicio.value} value={servicio.value}>
                        {servicio.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                <User className="w-3 h-3" />
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
                              ujierPersonalizado: ""
                            });
                          } else if (
                            remaining.length === 1 &&
                            ujieres.includes(remaining[0])
                          ) {
                            updateConteo({
                              ujierSeleccionado: remaining[0],
                              ujierPersonalizado: ""
                            });
                          } else {
                            updateConteo({
                              ujierSeleccionado: "otro",
                              ujierPersonalizado: remaining.join(", ")
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
                        const nuevosUjieres = [...conteoState.selectedUjieres, ujierLimpio];
                        updateConteo({
                          selectedUjieres: nuevosUjieres,
                          ujierSeleccionado: "otro",
                          ujierPersonalizado: nuevosUjieres.join(", ")
                        });
                      }
                    }
                  } else if (value && !conteoState.selectedUjieres.includes(value)) {
                    const nuevosUjieres = [...conteoState.selectedUjieres, value];
                    updateConteo({ selectedUjieres: nuevosUjieres });
                    if (nuevosUjieres.length === 1) {
                      updateConteo({
                        ujierSeleccionado: value,
                        ujierPersonalizado: ""
                      });
                    } else {
                      updateConteo({
                        ujierSeleccionado: "otro",
                        ujierPersonalizado: nuevosUjieres.join(", ")
                      });
                    }
                  }
                }}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="+ Agregar ujier" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {ujieres
                    .filter((ujier) => !conteoState.selectedUjieres.includes(ujier))
                    .map((ujier) => (
                      <SelectItem key={ujier} value={ujier}>
                        {ujier}
                      </SelectItem>
                    ))}
                  <SelectItem value="otro">
                    + Escribir nombre personalizado
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Botón para limpiar selección */}
              {conteoState.selectedUjieres.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 text-xs bg-transparent border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    updateConteo({
                      selectedUjieres: [],
                      ujierSeleccionado: "",
                      ujierPersonalizado: ""
                    });
                  }}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
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
              {servicios.find((s) => s.value === conteoState.tipoServicio)?.label}
            </Badge>
            {conteoState.ujierSeleccionado === "otro" && conteoState.ujierPersonalizado ? (
              conteoState.ujierPersonalizado.split(",").map((name, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-slate-50 text-slate-700 border-slate-200"
                >
                  {name.trim()}
                </Badge>
              ))
            ) : conteoState.ujierSeleccionado && conteoState.ujierSeleccionado !== "otro" ? (
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
                {servicios.find((s) => s.value === conteoState.tipoServicio)?.label}
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
          <Card
            key={counter.key}
            className="bg-white/90 backdrop-blur-sm border-0 shadow-md"
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 ${counter.color} rounded-full flex-shrink-0`}
                  ></div>
                  <span className="font-medium text-gray-800 text-base sm:text-lg">
                    {counter.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  {counter.categoria && (
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-full bg-transparent border-gray-300 hover:bg-gray-50 active:bg-gray-100"
                        onClick={() =>
                          counter.categoria === "simpatizantes"
                            ? setShowAddDialog(true)
                            : openMiembrosDialog(counter.categoria)
                        }
                      >
                        <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                      {counter.miembrosDelDia.length +
                        counter.baseMiembros.length >
                        0 && (
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-emerald-600 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-medium">
                          {counter.miembrosDelDia.length +
                            counter.baseMiembros.length}
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-full bg-transparent border-gray-300 hover:bg-gray-50 active:bg-gray-100"
                    onClick={() =>
                      counter.setter(Math.max(0, counter.value - 1))
                    }
                  >
                    <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>

                  {editingCounter === counter.key ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="w-16 sm:w-20 h-8 sm:h-10 text-center text-sm sm:text-base"
                        type="number"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={saveCounterEdit}
                        className="h-8 sm:h-10 bg-slate-600 hover:bg-slate-700 text-sm px-3"
                      >
                        ✓
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xl sm:text-2xl font-bold w-8 sm:w-10 text-center min-w-0">
                        {counter.value +
                          counter.miembrosDelDia.length +
                          counter.baseValue +
                          counter.baseMiembros.length}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 sm:w-8 sm:h-8 p-0 hover:bg-gray-100 active:bg-gray-200"
                        onClick={() =>
                          handleCounterEdit(counter.key, counter.value)
                        }
                      >
                        <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-full bg-transparent border-gray-300 hover:bg-gray-50 active:bg-gray-100"
                    onClick={() => counter.setter(counter.value + 1)}
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
          className="w-full h-12 bg-transparent border-blue-200 text-blue-700 hover:bg-blue-50 active:bg-blue-100 rounded-xl py-4 shadow-lg text-base sm:text-lg font-semibold mb-4"
          onClick={() => setShowAsistentesDialog(true)}
        >
          <Eye className="w-5 h-5 mr-2" />
          <span className="flex-1 text-center">Ver Lista de Asistentes</span>
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-700 border-blue-300 ml-2"
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
              (conteoState.modoConsecutivo && datosServicioBase?.miembrosAsistieron?.ninos
                ? datosServicioBase.miembrosAsistieron.ninos.length
                : 0) +
              (conteoState.modoConsecutivo &&
              datosServicioBase?.miembrosAsistieron?.adolescentes
                ? datosServicioBase.miembrosAsistieron.adolescentes.length
                : 0) +
              (conteoState.modoConsecutivo && datosServicioBase?.simpatizantesAsistieron
                ? datosServicioBase.simpatizantesAsistieron.length
                : 0)}
          </Badge>
        </Button>
      )}

      {/* Simpatizantes del día (solo los añadidos en esta sesión) */}
      {conteoState.simpatizantesDelDia.length > 0 && (
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Simpatizantes con Nombre (Añadidos hoy:{" "}
              {conteoState.simpatizantesDelDia.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {conteoState.simpatizantesDelDia.map((simpatizante) => (
              <div
                key={simpatizante.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-sm">
                    {simpatizante.nombre}
                  </div>
                  {simpatizante.telefono && (
                    <div className="text-xs text-gray-500">
                      {simpatizante.telefono}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeSimpatizanteDelDia(simpatizante.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Add Simpatizante Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md max-h-[85vh]    flex flex-col mx-2 sm:mx-0">
          <DialogHeader className="flex-shrink-0 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base sm:text-lg">
                Agregar Simpatizante
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeDialog}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {!showNewForm ? (
              <>
                {/* Search */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar simpatizante existente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 text-sm"
                    />
                  </div>
                </div>

                {/* Lista de simpatizantes existentes */}
                <div className="flex-1 overflow-hidden">
                  <div className="h-full overflow-y-auto space-y-2 pr-1">
                    {filteredSimpatizantes.length > 0 ? (
                      filteredSimpatizantes.map((simpatizante) => (
                        <div
                          key={simpatizante.id}
                          className="p-3 border rounded-lg hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() =>
                            selectExistingSimpatizante(simpatizante)
                          }
                        >
                          <div className="font-medium text-sm">
                            {simpatizante.nombre}
                          </div>
                          {simpatizante.telefono && (
                            <div className="text-xs text-gray-500">
                              {simpatizante.telefono}
                            </div>
                          )}
                          {simpatizante.notas && (
                            <div className="text-xs text-gray-400 mt-1">
                              {simpatizante.notas}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">
                          {searchTerm
                            ? "No se encontraron simpatizantes disponibles"
                            : "No hay simpatizantes disponibles"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón para agregar nuevo */}
                <div className="flex-shrink-0 pt-3 border-t">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent h-10 text-sm"
                    onClick={() => setShowNewForm(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Nuevo Simpatizante
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Formulario para nuevo simpatizante */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Nombre Completo *
                    </label>
                    <Input
                      placeholder="Nombre del simpatizante"
                      value={newSimpatizante.nombre}
                      onChange={(e) =>
                        setNewSimpatizante({
                          ...newSimpatizante,
                          nombre: e.target.value,
                        })
                      }
                      className="h-10 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Teléfono
                    </label>
                    <Input
                      placeholder="Número de teléfono"
                      value={newSimpatizante.telefono}
                      onChange={(e) =>
                        setNewSimpatizante({
                          ...newSimpatizante,
                          telefono: e.target.value,
                        })
                      }
                      className="h-10 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Notas
                    </label>
                    <Input
                      placeholder="Notas adicionales"
                      value={newSimpatizante.notas}
                      onChange={(e) =>
                        setNewSimpatizante({
                          ...newSimpatizante,
                          notas: e.target.value,
                        })
                      }
                      className="h-10 text-sm"
                    />
                  </div>
                </div>

                <div className="flex-shrink-0 pt-3 border-t">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent h-10 text-sm"
                      onClick={() => setShowNewForm(false)}
                    >
                      Volver
                    </Button>
                    <Button
                      className="flex-1 bg-slate-600 hover:bg-slate-700 h-10 text-sm"
                      onClick={addNewSimpatizante}
                      disabled={!newSimpatizante.nombre.trim()}
                    >
                      Agregar
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para seleccionar miembros */}
      <Dialog open={showMiembrosDialog} onOpenChange={setShowMiembrosDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col mx-2 sm:mx-0">
          <DialogHeader className="flex-shrink-0 pb-4">
            <DialogTitle className="flex items-center justify-between text-base sm:text-lg">
              <span>Seleccionar {categoriaSeleccionada}</span>
              <div className="flex gap-2">
                {(() => {
                  const currentList =
                    {
                      hermanos: conteoState.hermanosDelDia,
                      hermanas: conteoState.hermanasDelDia,
                      ninos: conteoState.ninosDelDia,
                      adolescentes: conteoState.adolescentesDelDia,
                    }[categoriaSeleccionada] || [];
                  const baseList = conteoState.modoConsecutivo
                    ? datosServicioBase?.miembrosAsistieron?.[
                        categoriaSeleccionada
                      ] || []
                    : [];

                  return (
                    <>
                      {currentList.length > 0 && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 text-xs sm:text-sm"
                        >
                          +{currentList.length} esta sesión
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 text-xs sm:text-sm"
                      >
                        {currentList.length + baseList.length} total
                      </Badge>
                    </>
                  );
                })()}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Búsqueda */}
            <div className="flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={`Buscar ${categoriaSeleccionada}...`}
                  value={conteoState.searchMiembros}
                  onChange={(e) => updateConteo({ searchMiembros: e.target.value })}
                  className="pl-10 h-10 text-sm"
                />
              </div>
            </div>

            {/* Lista de miembros disponibles */}
            <div className="flex-1 overflow-hidden">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Disponibles para agregar
              </h4>
              <div className="h-full overflow-y-auto space-y-2 pr-1">
                {(() => {
                  const miembrosDisponibles = getMiembrosPorCategoria(
                    categoriaSeleccionada
                  );
                  const currentList =
                    {
                      hermanos: conteoState.hermanosDelDia,
                      hermanas: conteoState.hermanasDelDia,
                      ninos: conteoState.ninosDelDia,
                      adolescentes: conteoState.adolescentesDelDia,
                    }[categoriaSeleccionada] || [];
                  const baseList = conteoState.modoConsecutivo
                    ? datosServicioBase?.miembrosAsistieron?.[
                        categoriaSeleccionada
                      ] || []
                    : [];

                  const filteredMiembros = miembrosDisponibles.filter(
                    (miembro) => {
                      const nombreMatch = miembro.nombre
                        .toLowerCase()
                        .includes(conteoState.searchMiembros.toLowerCase());
                      const noEstaEnActuales = !currentList.find(
                        (m: MiembroSimplificado) => m.id === miembro.id
                      );
                      const noEstaEnBase = !baseList.find(
                        (m: MiembroSimplificado) => m.id === miembro.id
                      );
                      return nombreMatch && noEstaEnActuales && noEstaEnBase;
                    }
                  );

                  if (filteredMiembros.length === 0) {
                    return (
                      <div className="text-center text-gray-500 py-8">
                        <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">
                          {conteoState.searchMiembros
                            ? "No se encontraron miembros disponibles"
                            : "Todos los miembros ya están agregados"}
                        </p>
                      </div>
                    );
                  }

                  return filteredMiembros.map((miembro) => (
                    <div
                      key={miembro.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-sm active:bg-gray-100"
                      onClick={() =>
                        selectMiembro(miembro, categoriaSeleccionada)
                      }
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {miembro.nombre}
                        </div>
                        {miembro.telefono && (
                          <div className="text-xs text-gray-500 truncate">
                            {miembro.telefono}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:scale-105 active:scale-95 flex-shrink-0 ml-2 transition-transform"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Ya agregados - Movido al final */}
            {(() => {
              const currentList =
                {
                  hermanos: conteoState.hermanosDelDia,
                  hermanas: conteoState.hermanasDelDia,
                  ninos: conteoState.ninosDelDia,
                  adolescentes: conteoState.adolescentesDelDia,
                }[categoriaSeleccionada] || [];
              const baseList = conteoState.modoConsecutivo
                ? datosServicioBase?.miembrosAsistieron?.[
                    categoriaSeleccionada
                  ] || []
                : [];
              const totalAgregados = currentList.length + baseList.length;

              if (totalAgregados > 0) {
                return (
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-green-700 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Agregados en esta sesión ({currentList.length})
                      </h4>
                      {currentList.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 text-xs h-6 px-2"
                          onClick={() => {
                            // Limpiar solo los agregados en esta sesión
                            const updates: Partial<typeof conteoState> = {};
                            switch (categoriaSeleccionada) {
                              case "hermanos":
                                updates.hermanosDelDia = [];
                                break;
                              case "hermanas":
                                updates.hermanasDelDia = [];
                                break;
                              case "ninos":
                                updates.ninosDelDia = [];
                                break;
                              case "adolescentes":
                                updates.adolescentesDelDia = [];
                                break;
                            }
                            updateConteo(updates);
                            toast.info("Miembros de esta sesión eliminados");
                          }}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Limpiar
                        </Button>
                      )}
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                      {/* Miembros de la base (si aplica) */}
                      {baseList.map((miembro: MiembroSimplificado) => (
                        <div
                          key={`base-${miembro.id}`}
                          className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm border border-blue-200"
                        >
                          <span className="text-blue-800 truncate flex-1 min-w-0">
                            {miembro.nombre}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs bg-blue-100 text-blue-700 border-blue-300 flex-shrink-0 ml-2"
                          >
                            Base
                          </Badge>
                        </div>
                      ))}
                      {/* Miembros agregados en esta sesión */}
                      {currentList.map((miembro: MiembroSimplificado) => (
                        <div
                          key={miembro.id}
                          className="flex items-center justify-between p-2 bg-green-50 rounded text-sm border border-green-200"
                        >
                          <span className="text-green-800 truncate flex-1 min-w-0">
                            {miembro.nombre}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 h-6 w-6 p-0 flex-shrink-0 ml-2"
                            onClick={() =>
                              removeMiembroDelDia(
                                miembro.id,
                                categoriaSeleccionada
                              )
                            }
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Botones de acción */}
            <div className="flex-shrink-0 pt-3 border-t space-y-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent text-sm"
                  onClick={() => {
                    setShowMiembrosDialog(false);
                    updateConteo({ searchMiembros: "" });
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-sm"
                  onClick={() => {
                    setShowMiembrosDialog(false);
                    updateConteo({ searchMiembros: "" });
                    toast.success("Miembros agregados exitosamente");
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Finalizar
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para ver lista de asistentes */}
      <Dialog
        open={showAsistentesDialog}
        onOpenChange={setShowAsistentesDialog}
      >
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col mx-2 sm:mx-0">
          <DialogHeader className="flex-shrink-0 pb-4">
            <DialogTitle className="text-base sm:text-lg">
              Lista de Asistentes
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Miembros base del servicio anterior (si aplica) */}
            {conteoState.modoConsecutivo && datosServicioBase && (
              <>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                  Asistentes del Servicio Base ({datosServicioBase.servicio})
                </h3>
                {Object.keys(datosServicioBase.miembrosAsistieron).map(
                  (catKey) => {
                    const members =
                      datosServicioBase.miembrosAsistieron[catKey];
                    if (members.length === 0) return null;
                    return (
                      <div key={`base-${catKey}`}>
                        <h4 className="font-semibold text-gray-700 mb-2 capitalize text-sm">
                          {catKey} ({members.length})
                        </h4>
                        {members.map((miembro: MiembroSimplificado) => (
                          <div
                            key={miembro.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded mb-1"
                          >
                            <span className="text-sm truncate flex-1 min-w-0">
                              {miembro.nombre}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                )}
                {datosServicioBase.simpatizantesAsistieron.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-emerald-700 mb-2 text-sm">
                      Simpatizantes (
                      {datosServicioBase.simpatizantesAsistieron.length})
                    </h4>
                    {datosServicioBase.simpatizantesAsistieron.map(
                      (simpatizante: MiembroSimplificado) => (
                        <div
                          key={simpatizante.id}
                          className="flex items-center justify-between p-2 bg-emerald-50 rounded mb-1"
                        >
                          <span className="text-sm truncate flex-1 min-w-0">
                            {simpatizante.nombre}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}
                <hr className="my-4 border-t border-gray-200" />
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                  Asistentes Añadidos en esta Sesión
                </h3>
              </>
            )}

            {conteoState.hermanosDelDia.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-700 mb-2 text-sm">
                  Hermanos ({conteoState.hermanosDelDia.length})
                </h4>
                {conteoState.hermanosDelDia.map((miembro) => (
                  <div
                    key={miembro.id}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded mb-1"
                  >
                    <span className="text-sm truncate flex-1 min-w-0">
                      {miembro.nombre}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 flex-shrink-0 ml-2 h-8 w-8 p-0"
                      onClick={() =>
                        removeMiembroDelDia(miembro.id, "hermanos")
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {conteoState.hermanasDelDia.length > 0 && (
              <div>
                <h4 className="font-semibold text-rose-700 mb-2 text-sm">
                  Hermanas ({conteoState.hermanasDelDia.length})
                </h4>
                {conteoState.hermanasDelDia.map((miembro) => (
                  <div
                    key={miembro.id}
                    className="flex items-center justify-between p-2 bg-rose-50 rounded mb-1"
                  >
                    <span className="text-sm truncate flex-1 min-w-0">
                      {miembro.nombre}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 flex-shrink-0 ml-2 h-8 w-8 p-0"
                      onClick={() =>
                        removeMiembroDelDia(miembro.id, "hermanas")
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {conteoState.ninosDelDia.length > 0 && (
              <div>
                <h4 className="font-semibold text-amber-700 mb-2 text-sm">
                  Niños ({conteoState.ninosDelDia.length})
                </h4>
                {conteoState.ninosDelDia.map((miembro) => (
                  <div
                    key={miembro.id}
                    className="flex items-center justify-between p-2 bg-amber-50 rounded mb-1"
                  >
                    <span className="text-sm truncate flex-1 min-w-0">
                      {miembro.nombre}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 flex-shrink-0 ml-2 h-8 w-8 p-0"
                      onClick={() => removeMiembroDelDia(miembro.id, "ninos")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {conteoState.adolescentesDelDia.length > 0 && (
              <div>
                <h4 className="font-semibold text-purple-700 mb-2 text-sm">
                  Adolescentes ({conteoState.adolescentesDelDia.length})
                </h4>
                {conteoState.adolescentesDelDia.map((miembro) => (
                  <div
                    key={miembro.id}
                    className="flex items-center justify-between p-2 bg-purple-50 rounded mb-1"
                  >
                    <span className="text-sm truncate flex-1 min-w-0">
                      {miembro.nombre}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 flex-shrink-0 ml-2 h-8 w-8 p-0"
                      onClick={() =>
                        removeMiembroDelDia(miembro.id, "adolescentes")
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {conteoState.simpatizantesDelDia.length > 0 && (
              <div>
                <h4 className="font-semibold text-emerald-700 mb-2 text-sm">
                  Simpatizantes ({conteoState.simpatizantesDelDia.length})
                </h4>
                {conteoState.simpatizantesDelDia.map((simpatizante) => (
                  <div
                    key={simpatizante.id}
                    className="flex items-center justify-between p-2 bg-emerald-50 rounded mb-1"
                  >
                    <span className="text-sm truncate flex-1 min-w-0">
                      {simpatizante.nombre}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 flex-shrink-0 ml-2 h-8 w-8 p-0"
                      onClick={() => removeSimpatizanteDelDia(simpatizante.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Count Dialog */}
      <Dialog open={showBulkCountDialog} onOpenChange={setShowBulkCountDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col mx-2 sm:mx-0">
          <DialogHeader className="flex-shrink-0 pb-4">
            <DialogTitle className="text-base sm:text-lg">
              Conteo Múltiple
            </DialogTitle>
            <p className="text-xs sm:text-sm text-gray-600">
              Ingrese las cantidades para agregar a cada categoría
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 mb-2 block">
                  Hermanos
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={bulkCounts.hermanos}
                  onChange={(e) =>
                    setBulkCounts({ ...bulkCounts, hermanos: e.target.value })
                  }
                  className="h-10 text-center text-sm"
                  min="0"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-rose-700 mb-2 block">
                  Hermanas
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={bulkCounts.hermanas}
                  onChange={(e) =>
                    setBulkCounts({ ...bulkCounts, hermanas: e.target.value })
                  }
                  className="h-10 text-center text-sm"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-amber-700 mb-2 block">
                  Niños
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={bulkCounts.ninos}
                  onChange={(e) =>
                    setBulkCounts({ ...bulkCounts, ninos: e.target.value })
                  }
                  className="h-10 text-center text-sm"
                  min="0"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-purple-700 mb-2 block">
                  Adolescentes
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={bulkCounts.adolescentes}
                  onChange={(e) =>
                    setBulkCounts({
                      ...bulkCounts,
                      adolescentes: e.target.value,
                    })
                  }
                  className="h-10 text-center text-sm"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-emerald-700 mb-2 block">
                Simpatizantes
              </label>
              <Input
                type="number"
                placeholder="0"
                value={bulkCounts.simpatizantes}
                onChange={(e) =>
                  setBulkCounts({
                    ...bulkCounts,
                    simpatizantes: e.target.value,
                  })
                }
                className="h-10 text-center text-sm"
                min="0"
              />
            </div>

            {/* Preview */}
            {(bulkCounts.hermanos ||
              bulkCounts.hermanas ||
              bulkCounts.ninos ||
              bulkCounts.adolescentes ||
              bulkCounts.simpatizantes) && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs font-medium text-blue-800 mb-2">
                  Vista previa:
                </div>
                <div className="text-sm text-blue-700">
                  Total a agregar:{" "}
                  {(Number.parseInt(bulkCounts.hermanos) || 0) +
                    (Number.parseInt(bulkCounts.hermanas) || 0) +
                    (Number.parseInt(bulkCounts.ninos) || 0) +
                    (Number.parseInt(bulkCounts.adolescentes) || 0) +
                    (Number.parseInt(bulkCounts.simpatizantes) || 0)}{" "}
                  personas
                </div>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 pt-3 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent h-10 text-sm"
                onClick={resetBulkCounts}
              >
                Limpiar
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-transparent h-10 text-sm"
                onClick={() => setShowBulkCountDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 h-10 text-sm"
                onClick={handleBulkCountSubmit}
              >
                Agregar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Button */}
      <Button
        onClick={handleSaveConteo}
        className="w-full h-12 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 active:from-slate-800 active:to-slate-900 text-white rounded-xl py-4 sm:py-5 shadow-lg text-base sm:text-lg font-semibold mb-4"
      >
        <Save className="w-5 h-5 mr-2" />
        <span className="flex-1 text-center">
          {conteoState.modoConsecutivo
            ? "Guardar Conteo Dominical"
            : "Guardar Conteo de Asistencia"}
        </span>
      </Button>

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
