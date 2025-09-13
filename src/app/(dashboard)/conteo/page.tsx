"use client";

import { useState, useEffect } from "react";

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
  // Estados principales
  const [hermanos, setHermanos] = useState(0);
  const [hermanas, setHermanas] = useState(0);
  const [ninos, setNinos] = useState(0);
  const [adolescentes, setAdolescentes] = useState(0);
  const [simpatizantesCount, setSimpatizantesCount] = useState(0);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [tipoServicio, setTipoServicio] = useState("dominical");
  const [ujierSeleccionado, setUjierSeleccionado] = useState("");
  const [ujierPersonalizado, setUjierPersonalizado] = useState("");
  const [modoConsecutivo, setModoConsecutivo] = useState(false);
  const [datosServicioBase, setDatosServicioBase] = useState<DatosServicioBase | null>(null);

  // Estados para listas del día
  const [simpatizantesDelDia, setSimpatizantesDelDia] = useState<Simpatizante[]>([]);
  const [hermanosDelDia, setHermanosDelDia] = useState<MiembroSimplificado[]>([]);
  const [hermanasDelDia, setHermanasDelDia] = useState<MiembroSimplificado[]>([]);
  const [ninosDelDia, setNinosDelDia] = useState<MiembroSimplificado[]>([]);
  const [adolescentesDelDia, setAdolescentesDelDia] = useState<MiembroSimplificado[]>([]);

  // Estados para edición de contadores
  const [editingCounter, setEditingCounter] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Estados para el diálogo de simpatizantes
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSimpatizante, setNewSimpatizante] = useState({
    nombre: "",
    telefono: "",
    notas: "",
  });

  // Estados para miembros del día por categoría
  const [showAsistentesDialog, setShowAsistentesDialog] = useState(false);
  const [showMiembrosDialog, setShowMiembrosDialog] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");

  const [showContinuarDialog, setShowContinuarDialog] = useState(false);

  const [searchMiembros, setSearchMiembros] = useState("");
  const [selectedUjieres, setSelectedUjieres] = useState<string[]>([]);

  // Estados para datos de Firebase
  const [simpatizantes, setSimpatizantes] = useState<Simpatizante[]>([]);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
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

  // Add multiple count entry functionality
  const [showBulkCountDialog, setShowBulkCountDialog] = useState(false);
  const [bulkCounts, setBulkCounts] = useState({
    hermanos: "",
    hermanas: "",
    ninos: "",
    adolescentes: "",
    simpatizantes: "",
  });

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
      setSimpatizantesDelDia(datosServicioBase.simpatizantesAsistieron || []);
      setHermanosDelDia(datosServicioBase.miembrosAsistieron?.hermanos || []);
      setHermanasDelDia(datosServicioBase.miembrosAsistieron?.hermanas || []);
      setNinosDelDia(datosServicioBase.miembrosAsistieron?.ninos || []);
      setAdolescentesDelDia(
        datosServicioBase.miembrosAsistieron?.adolescentes || []
      );
      setTipoServicio("dominical"); // Forzar a dominical
    }
  }, [modoConsecutivo, datosServicioBase]);

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

  const selectExistingSimpatizante = (simpatizante: Simpatizante) => {
    // Verificar si ya está en la lista del día
    if (simpatizantesDelDia.find((s) => s.id === simpatizante.id)) {
      toast.info("Este simpatizante ya fue agregado hoy");
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
        // Agregar a Firebase
        const nuevoSimpatizante = await addSimpatizante({
          ...newSimpatizante,
          fechaRegistro: new Date().toISOString().split("T")[0],
        });

        // Agregar a la lista del día
        setSimpatizantesDelDia((prev) => [...prev, nuevoSimpatizante as Simpatizante]);

        // Actualizar la lista de simpatizantes disponibles
        setSimpatizantes((prev) => [...prev, nuevoSimpatizante as Simpatizante]);

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

  const selectMiembro = (miembro: Miembro, categoria: string) => {
    const setterMap: { [key: string]: (value: (prev: MiembroSimplificado[]) => MiembroSimplificado[]) => void } = {
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
      }[categoria] as MiembroSimplificado[]) || [];

    if (currentList.find((m: MiembroSimplificado) => m.id === miembro.id)) {
      toast.info("Este miembro ya fue agregado hoy");
      return;
    }

    setterMap[categoria]?.((prev: MiembroSimplificado[]) => [...prev, { id: miembro.id, nombre: miembro.nombre }]);
    setShowMiembrosDialog(false);
  };

  const removeMiembroDelDia = (miembroId: string, categoria: string) => {
    const setterMap: { [key: string]: (value: (prev: MiembroSimplificado[]) => MiembroSimplificado[]) => void } = {
      hermanos: setHermanosDelDia,
      hermanas: setHermanasDelDia,
      ninos: setNinosDelDia,
      adolescentes: setAdolescentesDelDia,
    };

    setterMap[categoria]?.((prev: MiembroSimplificado[]) =>
      prev.filter((m: MiembroSimplificado) => m.id !== miembroId)
    );
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

  const handleSaveConteo = async () => {
    // Usar los ujieres seleccionados
    const ujieresFinal: string[] = selectedUjieres;

    if (ujieresFinal.length === 0) {
      toast.info("Por favor seleccione al menos un ujier");
      return;
    }

    // Calcular totales, sumando la base si estamos en modo consecutivo
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

    // Verificar si es domingo y evangelismo/misionero (y no estamos en modo consecutivo)
    const fechaObj = new Date(fecha + "T12:00:00"); // Add time to avoid timezone issues
    const esDomingo = fechaObj.getDay() === 0;
    const esServicioBase =
      tipoServicio === "evangelismo" || tipoServicio === "misionero";

    try {
      if (esDomingo && esServicioBase && !modoConsecutivo) {
        // Guardar datos del evangelismo/misionero y preguntar si continuar
        await saveConteo(conteoData);
        setDatosServicioBase(conteoData); // Guardar el conteo actual como base
        setShowContinuarDialog(true);
        return;
      }

      if (modoConsecutivo) {
        // Estamos guardando el dominical después del evangelismo/misionero
        await saveConteo(conteoData);
        resetConteoForm(); // Resetear todo el formulario
        toast.success("Conteo dominical guardado exitosamente");
      } else {
        // Guardado normal
        await saveConteo(conteoData);
        resetConteoForm(); // Resetear todo el formulario
        toast.success("Conteo guardado exitosamente");
      }
    } catch (error) {
      console.error("Error guardando conteo:", error);
      toast.error("Error al guardar el conteo. Intente nuevamente.");
    }
  };

  const continuarConDominical = () => {
    setModoConsecutivo(true);
    setTipoServicio("dominical");
    setShowContinuarDialog(false);
    // Los contadores y listas ya se habrán cargado desde datosServicioBase en el useEffect
    toast.success(
      "Continuando con el servicio dominical. Los asistentes del servicio base se mantienen."
    );
  };

  const noContinarConDominical = () => {
    setShowContinuarDialog(false);
    resetConteoForm(); // Resetear todo el formulario
    toast.success("Conteo guardado exitosamente");
  };

  // Resetear el formulario de conteo
  const resetConteoForm = () => {
    setHermanos(0);
    setHermanas(0);
    setNinos(0);
    setAdolescentes(0);
    setSimpatizantesCount(0);
    setSimpatizantesDelDia([]);
    setHermanosDelDia([]);
    setHermanasDelDia([]);
    setNinosDelDia([]);
    setAdolescentesDelDia([]);
    setFecha(new Date().toISOString().split("T")[0]);
    setTipoServicio("dominical");
    setSelectedUjieres([]); // Limpiar ujieres seleccionados
    setUjierSeleccionado("");
    setUjierPersonalizado("");
    setModoConsecutivo(false);
    setDatosServicioBase(null);
    setSearchMiembros(""); // Limpiar búsqueda
  };

  const filteredSimpatizantes = simpatizantes.filter(
    (s) =>
      s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !simpatizantesDelDia.find((sd) => sd.id === s.id)
  );

  // Calcular el total de asistentes incluyendo la base si estamos en modo consecutivo
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

  const counters = [
    {
      key: "hermanos",
      label: "Hermanos",
      value: hermanos,
      setter: setHermanos,
      color: "bg-slate-600",
      miembrosDelDia: hermanosDelDia,
      categoria: "hermanos",
      baseValue: modoConsecutivo ? datosServicioBase?.hermanos || 0 : 0,
      baseMiembros: modoConsecutivo
        ? datosServicioBase?.miembrosAsistieron?.hermanos || []
        : [],
    },
    {
      key: "hermanas",
      label: "Hermanas",
      value: hermanas,
      setter: setHermanas,
      color: "bg-rose-600",
      miembrosDelDia: hermanasDelDia,
      categoria: "hermanas",
      baseValue: modoConsecutivo ? datosServicioBase?.hermanas || 0 : 0,
      baseMiembros: modoConsecutivo
        ? datosServicioBase?.miembrosAsistieron?.hermanas || []
        : [],
    },
    {
      key: "ninos",
      label: "Niños",
      value: ninos,
      setter: setNinos,
      color: "bg-amber-600",
      miembrosDelDia: ninosDelDia,
      categoria: "ninos",
      baseValue: modoConsecutivo ? datosServicioBase?.ninos || 0 : 0,
      baseMiembros: modoConsecutivo
        ? datosServicioBase?.miembrosAsistieron?.ninos || []
        : [],
    },
    {
      key: "adolescentes",
      label: "Adolescentes",
      value: adolescentes,
      setter: setAdolescentes,
      color: "bg-purple-600",
      miembrosDelDia: adolescentesDelDia,
      categoria: "adolescentes",
      baseValue: modoConsecutivo ? datosServicioBase?.adolescentes || 0 : 0,
      baseMiembros: modoConsecutivo
        ? datosServicioBase?.miembrosAsistieron?.adolescentes || []
        : [],
    },
    {
      key: "simpatizantes",
      label: "Simpatizantes",
      value: simpatizantesCount,
      setter: setSimpatizantesCount,
      color: "bg-emerald-600",
      categoria: "simpatizantes",
      baseValue: modoConsecutivo ? datosServicioBase?.simpatizantes || 0 : 0,
      baseMiembros: modoConsecutivo
        ? datosServicioBase?.simpatizantesAsistieron || []
        : [],
      miembrosDelDia: simpatizantesDelDia, // Asegurarse de que esta propiedad exista
    },
  ];

  if (loading) {
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
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Servicio
                </label>
                <Select value={tipoServicio} onValueChange={setTipoServicio}>
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
                {selectedUjieres.length > 0
                  ? `${selectedUjieres.length} seleccionados`
                  : "Ninguno seleccionado"}
              </label>

              {/* Ujieres seleccionados */}
              {selectedUjieres.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {selectedUjieres.map((ujier, index) => (
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
                          setSelectedUjieres((prev) =>
                            prev.filter((u) => u !== ujier)
                          );
                          // Actualizar ujierSeleccionado y ujierPersonalizado
                          const remaining = selectedUjieres.filter(
                            (u) => u !== ujier
                          );
                          if (remaining.length === 0) {
                            setUjierSeleccionado("");
                            setUjierPersonalizado("");
                          } else if (
                            remaining.length === 1 &&
                            ujieres.includes(remaining[0])
                          ) {
                            setUjierSeleccionado(remaining[0]);
                            setUjierPersonalizado("");
                          } else {
                            setUjierSeleccionado("otro");
                            setUjierPersonalizado(remaining.join(", "));
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
                      if (!selectedUjieres.includes(ujierLimpio)) {
                        const nuevosUjieres = [...selectedUjieres, ujierLimpio];
                        setSelectedUjieres(nuevosUjieres);
                        setUjierSeleccionado("otro");
                        setUjierPersonalizado(nuevosUjieres.join(", "));
                      }
                    }
                  } else if (value && !selectedUjieres.includes(value)) {
                    const nuevosUjieres = [...selectedUjieres, value];
                    setSelectedUjieres(nuevosUjieres);
                    if (nuevosUjieres.length === 1) {
                      setUjierSeleccionado(value);
                      setUjierPersonalizado("");
                    } else {
                      setUjierSeleccionado("otro");
                      setUjierPersonalizado(nuevosUjieres.join(", "));
                    }
                  }
                }}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="+ Agregar ujier" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {ujieres
                    .filter((ujier) => !selectedUjieres.includes(ujier))
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
              {selectedUjieres.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 text-xs bg-transparent border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setSelectedUjieres([]);
                    setUjierSeleccionado("");
                    setUjierPersonalizado("");
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
              {servicios.find((s) => s.value === tipoServicio)?.label}
            </Badge>
            {ujierSeleccionado === "otro" && ujierPersonalizado ? (
              ujierPersonalizado.split(",").map((name, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-slate-50 text-slate-700 border-slate-200"
                >
                  {name.trim()}
                </Badge>
              ))
            ) : ujierSeleccionado && ujierSeleccionado !== "otro" ? (
              <Badge
                variant="outline"
                className="bg-slate-50 text-slate-700 border-slate-200"
              >
                {ujierSeleccionado}
              </Badge>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      {modoConsecutivo && datosServicioBase && (
        <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">
                Modo Consecutivo:{" "}
                {servicios.find((s) => s.value === tipoServicio)?.label}
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
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`w-2 h-2 sm:w-3 sm:h-3 ${counter.color} rounded-full`}
                  ></div>
                  <span className="font-medium text-gray-800 text-sm sm:text-base">
                    {counter.label}
                  </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  {counter.categoria && (
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-6 h-6 sm:w-8 sm:h-8 p-0 rounded-full bg-transparent border-gray-300"
                        onClick={() =>
                          counter.categoria === "simpatizantes"
                            ? setShowAddDialog(true)
                            : openMiembrosDialog(counter.categoria)
                        }
                      >
                        <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      {counter.miembrosDelDia.length +
                        counter.baseMiembros.length >
                        0 && (
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-1 bg-emerald-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium">
                          {counter.miembrosDelDia.length +
                            counter.baseMiembros.length}
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-6 h-6 sm:w-8 sm:h-8 p-0 rounded-full bg-transparent border-gray-300"
                    onClick={() =>
                      counter.setter(Math.max(0, counter.value - 1))
                    }
                  >
                    <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>

                  {editingCounter === counter.key ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="w-12 sm:w-16 h-6 sm:h-8 text-center text-xs sm:text-sm"
                        type="number"
                      />
                      <Button
                        size="sm"
                        onClick={saveCounterEdit}
                        className="h-6 sm:h-8 bg-slate-600 hover:bg-slate-700 text-xs"
                      >
                        ✓
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-lg sm:text-xl font-semibold w-6 sm:w-8 text-center">
                        {counter.value +
                          counter.miembrosDelDia.length +
                          counter.baseValue +
                          counter.baseMiembros.length}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-4 h-4 sm:w-6 sm:h-6 p-0"
                        onClick={() =>
                          handleCounterEdit(counter.key, counter.value)
                        }
                      >
                        <Edit3 className="w-2 h-2 sm:w-3 sm:h-3" />
                      </Button>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-6 h-6 sm:w-8 sm:h-8 p-0 rounded-full bg-transparent border-gray-300"
                    onClick={() => counter.setter(counter.value + 1)}
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ver Lista Asistentes Button */}
      {(hermanosDelDia.length > 0 ||
        hermanasDelDia.length > 0 ||
        ninosDelDia.length > 0 ||
        adolescentesDelDia.length > 0 ||
        simpatizantesDelDia.length > 0 ||
        (modoConsecutivo &&
          ((datosServicioBase?.simpatizantesAsistieron && datosServicioBase.simpatizantesAsistieron.length > 0) ||
            (datosServicioBase?.miembrosAsistieron?.hermanos && datosServicioBase.miembrosAsistieron.hermanos.length > 0) ||
            (datosServicioBase?.miembrosAsistieron?.hermanas && datosServicioBase.miembrosAsistieron.hermanas.length > 0) ||
            (datosServicioBase?.miembrosAsistieron?.ninos && datosServicioBase.miembrosAsistieron.ninos.length > 0) ||
            (datosServicioBase?.miembrosAsistieron?.adolescentes && datosServicioBase.miembrosAsistieron.adolescentes.length > 0)))) && (
        <Button
          variant="outline"
          className="w-full bg-transparent border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl py-3 shadow-lg text-lg font-semibold mb-4"
          onClick={() => setShowAsistentesDialog(true)}
        >
          <Eye className="w-5 h-5 mr-2" />
          Ver Lista de Asistentes (
          {hermanosDelDia.length +
            hermanasDelDia.length +
            ninosDelDia.length +
            adolescentesDelDia.length +
            simpatizantesDelDia.length +
            (modoConsecutivo && datosServicioBase?.miembrosAsistieron?.hermanos
              ? datosServicioBase.miembrosAsistieron.hermanos.length
              : 0) +
            (modoConsecutivo && datosServicioBase?.miembrosAsistieron?.hermanas
              ? datosServicioBase.miembrosAsistieron.hermanas.length
              : 0) +
            (modoConsecutivo && datosServicioBase?.miembrosAsistieron?.ninos
              ? datosServicioBase.miembrosAsistieron.ninos.length
              : 0) +
            (modoConsecutivo && datosServicioBase?.miembrosAsistieron?.adolescentes
              ? datosServicioBase.miembrosAsistieron.adolescentes.length
              : 0) +
            (modoConsecutivo && datosServicioBase?.simpatizantesAsistieron
              ? datosServicioBase.simpatizantesAsistieron.length
              : 0)}
          )
        </Button>
      )}

      {/* Simpatizantes del día (solo los añadidos en esta sesión) */}
      {simpatizantesDelDia.length > 0 && (
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Simpatizantes con Nombre (Añadidos hoy:{" "}
              {simpatizantesDelDia.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {simpatizantesDelDia.map((simpatizante) => (
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
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle>Agregar Simpatizante</DialogTitle>
              <Button variant="ghost" size="sm" onClick={closeDialog}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {!showNewForm ? (
              <>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar simpatizante existente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Lista de simpatizantes existentes */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredSimpatizantes.length > 0 ? (
                    filteredSimpatizantes.map((simpatizante) => (
                      <div
                        key={simpatizante.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => selectExistingSimpatizante(simpatizante)}
                      >
                        <div className="font-medium text-sm">
                          {simpatizante.nombre}
                        </div>
                        <div className="text-xs text-gray-500">
                          {simpatizante.telefono}
                        </div>
                        {simpatizante.notas && (
                          <div className="text-xs text-gray-400 mt-1">
                            {simpatizante.notas}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      {searchTerm
                        ? "No se encontraron simpatizantes disponibles"
                        : "No hay simpatizantes disponibles"}
                    </div>
                  )}
                </div>

                {/* Botón para agregar nuevo */}
                <div className="pt-3 border-t">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
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
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
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
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
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
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
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
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setShowNewForm(false)}
                  >
                    Volver
                  </Button>
                  <Button
                    className="flex-1 bg-slate-600 hover:bg-slate-700"
                    onClick={addNewSimpatizante}
                    disabled={!newSimpatizante.nombre.trim()}
                  >
                    Agregar
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para seleccionar miembros */}
      <Dialog open={showMiembrosDialog} onOpenChange={setShowMiembrosDialog}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center justify-between">
              <span>Seleccionar {categoriaSeleccionada}</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {(() => {
                  const currentList =
                    {
                      hermanos: hermanosDelDia,
                      hermanas: hermanasDelDia,
                      ninos: ninosDelDia,
                      adolescentes: adolescentesDelDia,
                    }[categoriaSeleccionada] || [];
                  const baseList = modoConsecutivo
                    ? datosServicioBase?.miembrosAsistieron?.[
                        categoriaSeleccionada
                      ] || []
                    : [];
                  return currentList.length + baseList.length;
                })()}{" "}
                agregados
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Búsqueda */}
            <div className="flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={`Buscar ${categoriaSeleccionada}...`}
                  value={searchMiembros}
                  onChange={(e) => setSearchMiembros(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Ya agregados */}
            {(() => {
              const currentList =
                {
                  hermanos: hermanosDelDia,
                  hermanas: hermanasDelDia,
                  ninos: ninosDelDia,
                  adolescentes: adolescentesDelDia,
                }[categoriaSeleccionada] || [];
              const baseList = modoConsecutivo
                ? datosServicioBase?.miembrosAsistieron?.[
                    categoriaSeleccionada
                  ] || []
                : [];
              const totalAgregados = currentList.length + baseList.length;

              if (totalAgregados > 0) {
                return (
                  <div className="flex-shrink-0">
                    <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Ya agregados ({totalAgregados})
                    </h4>
                    <div className="max-h-24 overflow-y-auto space-y-1">
                      {/* Miembros de la base (si aplica) */}
                      {baseList.map((miembro: MiembroSimplificado) => (
                        <div
                          key={`base-${miembro.id}`}
                          className="flex items-center justify-between p-2 bg-green-50 rounded text-sm border border-green-200"
                        >
                          <span className="text-green-800">
                            {miembro.nombre}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-100 text-green-700 border-green-300"
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
                          <span className="text-green-800">
                            {miembro.nombre}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
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

            {/* Lista de miembros disponibles */}
            <div className="flex-1 overflow-hidden">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Disponibles para agregar
              </h4>
              <div className="h-full overflow-y-auto space-y-2">
                {(() => {
                  const miembrosDisponibles = getMiembrosPorCategoria(
                    categoriaSeleccionada
                  );
                  const currentList =
                    {
                      hermanos: hermanosDelDia,
                      hermanas: hermanasDelDia,
                      ninos: ninosDelDia,
                      adolescentes: adolescentesDelDia,
                    }[categoriaSeleccionada] || [];
                  const baseList = modoConsecutivo
                    ? datosServicioBase?.miembrosAsistieron?.[
                        categoriaSeleccionada
                      ] || []
                    : [];

                  const filteredMiembros = miembrosDisponibles.filter(
                    (miembro) => {
                      const nombreMatch = miembro.nombre
                        .toLowerCase()
                        .includes(searchMiembros.toLowerCase());
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
                          {searchMiembros
                            ? "No se encontraron miembros disponibles"
                            : "Todos los miembros ya están agregados"}
                        </p>
                      </div>
                    );
                  }

                  return filteredMiembros.map((miembro) => (
                    <div
                      key={miembro.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() =>
                        selectMiembro(miembro, categoriaSeleccionada)
                      }
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {miembro.nombre}
                        </div>
                        <div className="text-xs text-gray-500">
                          {miembro.telefono}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex-shrink-0 pt-3 border-t">
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  setShowMiembrosDialog(false);
                  setSearchMiembros("");
                }}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para ver lista de asistentes */}
      <Dialog
        open={showAsistentesDialog}
        onOpenChange={setShowAsistentesDialog}
      >
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lista de Asistentes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Miembros base del servicio anterior (si aplica) */}
            {modoConsecutivo && datosServicioBase && (
              <>
                <h3 className="font-semibold text-gray-800">
                  Asistentes del Servicio Base ({datosServicioBase.servicio})
                </h3>
                {Object.keys(datosServicioBase.miembrosAsistieron).map(
                  (catKey) => {
                    const members =
                      datosServicioBase.miembrosAsistieron[catKey];
                    if (members.length === 0) return null;
                    return (
                      <div key={`base-${catKey}`}>
                        <h4 className="font-semibold text-gray-700 mb-2 capitalize">
                          {catKey} ({members.length})
                        </h4>
                        {members.map((miembro: MiembroSimplificado) => (
                          <div
                            key={miembro.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded mb-1"
                          >
                            <span className="text-sm">{miembro.nombre}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                )}
                {datosServicioBase.simpatizantesAsistieron.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-emerald-700 mb-2">
                      Simpatizantes (
                      {datosServicioBase.simpatizantesAsistieron.length})
                    </h4>
                    {datosServicioBase.simpatizantesAsistieron.map(
                      (simpatizante: MiembroSimplificado) => (
                        <div
                          key={simpatizante.id}
                          className="flex items-center justify-between p-2 bg-emerald-50 rounded mb-1"
                        >
                          <span className="text-sm">{simpatizante.nombre}</span>
                        </div>
                      )
                    )}
                  </div>
                )}
                <hr className="my-4 border-t border-gray-200" />
                <h3 className="font-semibold text-gray-800">
                  Asistentes Añadidos en esta Sesión
                </h3>
              </>
            )}

            {hermanosDelDia.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">
                  Hermanos ({hermanosDelDia.length})
                </h4>
                {hermanosDelDia.map((miembro) => (
                  <div
                    key={miembro.id}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded mb-1"
                  >
                    <span className="text-sm">{miembro.nombre}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
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

            {hermanasDelDia.length > 0 && (
              <div>
                <h4 className="font-semibold text-rose-700 mb-2">
                  Hermanas ({hermanasDelDia.length})
                </h4>
                {hermanasDelDia.map((miembro) => (
                  <div
                    key={miembro.id}
                    className="flex items-center justify-between p-2 bg-rose-50 rounded mb-1"
                  >
                    <span className="text-sm">{miembro.nombre}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
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

            {ninosDelDia.length > 0 && (
              <div>
                <h4 className="font-semibold text-amber-700 mb-2">
                  Niños ({ninosDelDia.length})
                </h4>
                {ninosDelDia.map((miembro) => (
                  <div
                    key={miembro.id}
                    className="flex items-center justify-between p-2 bg-amber-50 rounded mb-1"
                  >
                    <span className="text-sm">{miembro.nombre}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeMiembroDelDia(miembro.id, "ninos")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {adolescentesDelDia.length > 0 && (
              <div>
                <h4 className="font-semibold text-purple-700 mb-2">
                  Adolescentes ({adolescentesDelDia.length})
                </h4>
                {adolescentesDelDia.map((miembro) => (
                  <div
                    key={miembro.id}
                    className="flex items-center justify-between p-2 bg-purple-50 rounded mb-1"
                  >
                    <span className="text-sm">{miembro.nombre}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
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

            {simpatizantesDelDia.length > 0 && (
              <div>
                <h4 className="font-semibold text-emerald-700 mb-2">
                  Simpatizantes ({simpatizantesDelDia.length})
                </h4>
                {simpatizantesDelDia.map((simpatizante) => (
                  <div
                    key={simpatizante.id}
                    className="flex items-center justify-between p-2 bg-emerald-50 rounded mb-1"
                  >
                    <span className="text-sm">{simpatizante.nombre}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
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
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto mx-2">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Conteo Múltiple
            </DialogTitle>
            <p className="text-xs sm:text-sm text-gray-600">
              Ingrese las cantidades para agregar a cada categoría
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">
                  Hermanos
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={bulkCounts.hermanos}
                  onChange={(e) =>
                    setBulkCounts({ ...bulkCounts, hermanos: e.target.value })
                  }
                  className="h-8 sm:h-9 text-center text-xs sm:text-sm"
                  min="0"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-rose-700 mb-1 block">
                  Hermanas
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={bulkCounts.hermanas}
                  onChange={(e) =>
                    setBulkCounts({ ...bulkCounts, hermanas: e.target.value })
                  }
                  className="h-8 sm:h-9 text-center text-xs sm:text-sm"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-amber-700 mb-1 block">
                  Niños
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={bulkCounts.ninos}
                  onChange={(e) =>
                    setBulkCounts({ ...bulkCounts, ninos: e.target.value })
                  }
                  className="h-8 sm:h-9 text-center text-xs sm:text-sm"
                  min="0"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-purple-700 mb-1 block">
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
                  className="h-8 sm:h-9 text-center text-xs sm:text-sm"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-emerald-700 mb-1 block">
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
                className="h-8 sm:h-9 text-center text-xs sm:text-sm"
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
                <div className="text-xs text-blue-700">
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

            <div className="flex gap-2 pt-3">
              <Button
                variant="outline"
                className="flex-1 bg-transparent text-xs sm:text-sm"
                onClick={resetBulkCounts}
              >
                Limpiar
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-transparent text-xs sm:text-sm"
                onClick={() => setShowBulkCountDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
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
        className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl py-4 shadow-lg text-lg font-semibold mb-4"
      >
        <Save className="w-5 h-5 mr-2" />
        {modoConsecutivo
          ? "Guardar Conteo Dominical"
          : "Guardar Conteo de Asistencia"}
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
