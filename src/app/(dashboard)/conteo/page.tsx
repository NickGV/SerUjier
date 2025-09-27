"use client";

import { useState, useEffect } from "react";
import { usePersistentConteo } from "@/hooks/use-persistent-conteo";
import type { Simpatizante } from "@/app/(dashboard)/simpatizantes/page"; // Importar la interfaz Simpatizante
// TODO: Crear opcion de poner hermanos apartados
// TODO: Arreglar modal para agregar simpatizante
// Interfaces para los tipos de datos

interface Miembro {
  id: string;
  nombre: string;
  telefono?: string;
  notas?: string;
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
  fetchUjieres,
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
  const { conteoState, updateConteo, clearDayData, isLoaded } =
    usePersistentConteo();

  // Estados locales que no necesitan persistencia
  const [datosServicioBase, setDatosServicioBase] =
    useState<DatosServicioBase | null>(null);
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

  // Estados para selección múltiple de miembros
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Estados para búsqueda de simpatizantes
  const [searchSimpatizantesDebounce, setSearchSimpatizantesDebounce] =
    useState("");

  // Estados para búsqueda de asistentes
  const [searchAsistentes, setSearchAsistentes] = useState("");
  const [searchAsistentesDebounce, setSearchAsistentesDebounce] = useState("");

  // Estados para búsqueda de miembros (mejorada)
  const [searchMiembrosLocal, setSearchMiembrosLocal] = useState("");
  const [searchMiembrosLocalDebounce, setSearchMiembrosLocalDebounce] =
    useState("");

  // Estados para selección múltiple de simpatizantes
  const [selectedSimpatizantes, setSelectedSimpatizantes] = useState<string[]>(
    []
  );

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
        adolescentesDelDia:
          datosServicioBase.miembrosAsistieron?.adolescentes || [],
        tipoServicio: "dominical", // Forzar a dominical
      });
    }
  }, [conteoState.modoConsecutivo, datosServicioBase, updateConteo]);

  // Efecto para debounce de búsqueda de simpatizantes
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchSimpatizantesDebounce(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Efecto para debounce de búsqueda de asistentes
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchAsistentesDebounce(searchAsistentes);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchAsistentes]);

  // Efecto para debounce de búsqueda local de miembros
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchMiembrosLocalDebounce(searchMiembrosLocal);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchMiembrosLocal]);

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

  const addNewSimpatizante = async () => {
    if (newSimpatizante.nombre.trim()) {
      try {
        // Agregar a Firebase (devuelve { id })
        const result = await addSimpatizante({
          ...newSimpatizante,
          fechaRegistro: new Date().toISOString().split("T")[0],
        });

        // Construir el objeto completo del simpatizante usando el id devuelto
        const creado: Simpatizante = {
          id: (result as { id: string }).id,
          nombre: newSimpatizante.nombre,
          telefono: newSimpatizante.telefono,
          notas: newSimpatizante.notas,
          fechaRegistro: new Date().toISOString().split("T")[0],
        };

        // Agregar a la lista del día
        updateConteo({
          simpatizantesDelDia: [...conteoState.simpatizantesDelDia, creado],
        });

        // Actualizar la lista de simpatizantes disponibles
        setSimpatizantes((prev) => [...prev, creado]);

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
      simpatizantesDelDia: conteoState.simpatizantesDelDia.filter(
        (s) => s.id !== simpatizanteId
      ),
    });
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
        updates.hermanosDelDia = currentList.filter(
          (m: MiembroSimplificado) => m.id !== miembroId
        );
        break;
      case "hermanas":
        updates.hermanasDelDia = currentList.filter(
          (m: MiembroSimplificado) => m.id !== miembroId
        );
        break;
      case "ninos":
        updates.ninosDelDia = currentList.filter(
          (m: MiembroSimplificado) => m.id !== miembroId
        );
        break;
      case "adolescentes":
        updates.adolescentesDelDia = currentList.filter(
          (m: MiembroSimplificado) => m.id !== miembroId
        );
        break;
    }

    updateConteo(updates);
  };

  const openMiembrosDialog = (categoria: string) => {
    setCategoriaSeleccionada(categoria);
    setShowMiembrosDialog(true);
    setSelectedMembers([]); // Limpiar selección al abrir
    setSearchMiembrosLocal(""); // Limpiar búsqueda local al abrir
  };

  // Funciones para selección múltiple
  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const selectAllAvailableMembers = () => {
    const miembrosDisponibles = getMiembrosPorCategoria(categoriaSeleccionada);
    const currentList =
      (conteoState[
        `${categoriaSeleccionada}DelDia` as keyof typeof conteoState
      ] as MiembroSimplificado[]) || [];
    const baseList = conteoState.modoConsecutivo
      ? datosServicioBase?.miembrosAsistieron?.[categoriaSeleccionada] || []
      : [];

    const availableIds = miembrosDisponibles
      .filter((miembro) => {
        const noEstaEnActuales = !currentList.find((m) => m.id === miembro.id);
        const noEstaEnBase = !baseList.find((m) => m.id === miembro.id);
        return noEstaEnActuales && noEstaEnBase;
      })
      .map((miembro) => miembro.id);

    setSelectedMembers(availableIds);
  };

  const clearMemberSelection = () => {
    setSelectedMembers([]);
  };

  const addSelectedMembers = () => {
    const miembrosDisponibles = getMiembrosPorCategoria(categoriaSeleccionada);
    const membersToAdd = miembrosDisponibles.filter((miembro) =>
      selectedMembers.includes(miembro.id)
    );

    const updates: Partial<typeof conteoState> = {};
    const currentList =
      (conteoState[
        `${categoriaSeleccionada}DelDia` as keyof typeof conteoState
      ] as MiembroSimplificado[]) || [];

    const newMembers = membersToAdd.map((miembro) => ({
      id: miembro.id,
      nombre: miembro.nombre,
    }));

    switch (categoriaSeleccionada) {
      case "hermanos":
        updates.hermanosDelDia = [...currentList, ...newMembers];
        break;
      case "hermanas":
        updates.hermanasDelDia = [...currentList, ...newMembers];
        break;
      case "ninos":
        updates.ninosDelDia = [...currentList, ...newMembers];
        break;
      case "adolescentes":
        updates.adolescentesDelDia = [...currentList, ...newMembers];
        break;
    }

    updateConteo(updates);
    setSelectedMembers([]);
    toast.success(`${membersToAdd.length} miembros agregados exitosamente`);
  };

  // Funciones para selección múltiple de simpatizantes
  const toggleSimpatizanteSelection = (simpatizanteId: string) => {
    setSelectedSimpatizantes((prev) =>
      prev.includes(simpatizanteId)
        ? prev.filter((id) => id !== simpatizanteId)
        : [...prev, simpatizanteId]
    );
  };

  const selectAllAvailableSimpatizantes = () => {
    const availableIds = filteredSimpatizantes.map(
      (simpatizante) => simpatizante.id
    );
    setSelectedSimpatizantes(availableIds);
  };

  const clearSimpatizanteSelection = () => {
    setSelectedSimpatizantes([]);
  };

  const addSelectedSimpatizantes = () => {
    const simpatizantesToAdd = filteredSimpatizantes.filter((simpatizante) =>
      selectedSimpatizantes.includes(simpatizante.id)
    );

    updateConteo({
      simpatizantesDelDia: [
        ...conteoState.simpatizantesDelDia,
        ...simpatizantesToAdd,
      ],
    });

    setSelectedSimpatizantes([]);
    toast.success(
      `${simpatizantesToAdd.length} simpatizantes agregados exitosamente`
    );
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
      },
    };

    // Verificar si es domingo y evangelismo/misionero (y no estamos en modo consecutivo)
    const fechaObj = new Date(conteoState.fecha + "T12:00:00"); // Add time to avoid timezone issues
    const esDomingo = fechaObj.getDay() === 0;
    const esServicioBase =
      conteoState.tipoServicio === "evangelismo" ||
      conteoState.tipoServicio === "misionero";

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
      tipoServicio: "dominical",
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
      s.nombre
        .toLowerCase()
        .includes(searchSimpatizantesDebounce.toLowerCase()) &&
      !conteoState.simpatizantesDelDia.find((sd) => sd.id === s.id)
  );

  // Función para obtener todos los asistentes y filtrarlos
  const getAllAsistentes = () => {
    const asistentes: Array<{
      id: string;
      nombre: string;
      categoria: string;
      tipo: "miembro" | "simpatizante";
      esBase?: boolean;
    }> = [];

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
    conteoState.hermanosDelDia.forEach((miembro) => {
      asistentes.push({
        id: miembro.id,
        nombre: miembro.nombre,
        categoria: "hermanos",
        tipo: "miembro",
        esBase: false,
      });
    });

    conteoState.hermanasDelDia.forEach((miembro) => {
      asistentes.push({
        id: miembro.id,
        nombre: miembro.nombre,
        categoria: "hermanas",
        tipo: "miembro",
        esBase: false,
      });
    });

    conteoState.ninosDelDia.forEach((miembro) => {
      asistentes.push({
        id: miembro.id,
        nombre: miembro.nombre,
        categoria: "ninos",
        tipo: "miembro",
        esBase: false,
      });
    });

    conteoState.adolescentesDelDia.forEach((miembro) => {
      asistentes.push({
        id: miembro.id,
        nombre: miembro.nombre,
        categoria: "adolescentes",
        tipo: "miembro",
        esBase: false,
      });
    });

    // Agregar simpatizantes de esta sesión
    conteoState.simpatizantesDelDia.forEach((simpatizante) => {
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

  // Filtrar asistentes por búsqueda
  const filteredAsistentes = getAllAsistentes().filter((asistente) =>
    asistente.nombre
      .toLowerCase()
      .includes(searchAsistentesDebounce.toLowerCase())
  );

  // Calcular el total de asistentes incluyendo la base si estamos en modo consecutivo
  const totalSimpatizantesActual =
    conteoState.simpatizantesCount + conteoState.simpatizantesDelDia.length;
  const totalHermanosActual =
    conteoState.hermanos + conteoState.hermanosDelDia.length;
  const totalHermanasActual =
    conteoState.hermanas + conteoState.hermanasDelDia.length;
  const totalNinosActual = conteoState.ninos + conteoState.ninosDelDia.length;
  const totalAdolescentesActual =
    conteoState.adolescentes + conteoState.adolescentesDelDia.length;

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
      color: "bg-rose-600",
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
      color: "bg-amber-600",
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
      color: "bg-purple-600",
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
      key: "simpatizantes",
      label: "Simpatizantes",
      value: conteoState.simpatizantesCount,
      setter: (value: number) => updateConteo({ simpatizantesCount: value }),
      color: "bg-emerald-600",
      categoria: "simpatizantes",
      baseValue: conteoState.modoConsecutivo
        ? datosServicioBase?.simpatizantes || 0
        : 0,
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="fecha-input"
                  className="text-sm md:text-base text-gray-600 mb-2 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
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
                  <Clock className="w-4 h-4" />
                  Servicio
                </label>
                <Select
                  value={conteoState.tipoServicio}
                  onValueChange={(value) =>
                    updateConteo({ tipoServicio: value })
                  }
                >
                  <SelectTrigger
                    id="servicio-select"
                    className="h-10 md:h-12 text-sm md:text-base"
                    aria-describedby="servicio-help"
                  >
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
                <User className="w-4 h-4" />
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
                <SelectContent className="max-h-48">
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
                        className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-full bg-transparent border-gray-300 hover:bg-gray-50 active:bg-gray-100"
                        onClick={() =>
                          counter.categoria === "simpatizantes"
                            ? setShowAddDialog(true)
                            : openMiembrosDialog(counter.categoria)
                        }
                        aria-label={`Agregar ${counter.label}`}
                      >
                        <UserPlus className="w-5 h-5 md:w-6 md:h-6" />
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
                    className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-full bg-transparent border-gray-300 hover:bg-gray-50 active:bg-gray-100"
                    onClick={() =>
                      counter.setter(Math.max(0, counter.value - 1))
                    }
                    aria-label={`Decrementar ${counter.label}`}
                  >
                    <Minus className="w-5 h-5 md:w-6 md:h-6" />
                  </Button>

                  {editingCounter === counter.key ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="w-20 md:w-24 h-10 md:h-12 text-center text-sm md:text-base"
                        type="number"
                        autoFocus
                        aria-label={`Editar ${counter.label}`}
                      />
                      <Button
                        size="sm"
                        onClick={saveCounterEdit}
                        className="h-10 md:h-12 bg-slate-600 hover:bg-slate-700 text-sm px-3"
                        aria-label="Guardar cambios"
                      >
                        ✓
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xl md:text-2xl font-bold w-10 md:w-12 text-center min-w-0">
                        {counter.value +
                          counter.miembrosDelDia.length +
                          counter.baseValue +
                          counter.baseMiembros.length}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 md:w-10 md:h-10 p-0 hover:bg-gray-100 active:bg-gray-200"
                        onClick={() =>
                          handleCounterEdit(counter.key, counter.value)
                        }
                        aria-label={`Editar ${counter.label}`}
                      >
                        <Edit3 className="w-4 h-4 md:w-5 md:h-5" />
                      </Button>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-full bg-transparent border-gray-300 hover:bg-gray-50 active:bg-gray-100"
                    onClick={() => counter.setter(counter.value + 1)}
                    aria-label={`Incrementar ${counter.label}`}
                  >
                    <Plus className="w-5 h-5 md:w-6 md:h-6" />
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

      {/* Add Simpatizante Dialog - VERSIÓN MEJORADA */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col mx-2 sm:mx-0">
          <DialogHeader className="flex-shrink-0 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base sm:text-lg">
                Agregar Simpatizante
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {!showNewForm ? (
              <>
                {/* Búsqueda mejorada */}
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
                  {searchTerm && (
                    <div className="mt-2 text-xs text-gray-500">
                      Buscando: &ldquo;{searchTerm}&rdquo;
                    </div>
                  )}
                </div>

                {/* Controles de selección múltiple para simpatizantes */}
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllAvailableSimpatizantes}
                        className="text-xs h-8"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Seleccionar Todos
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSimpatizanteSelection}
                        className="text-xs h-8"
                        disabled={selectedSimpatizantes.length === 0}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Limpiar
                      </Button>
                      {searchTerm && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchTerm("")}
                          className="text-xs h-8 bg-blue-50 text-blue-700 border-blue-200"
                        >
                          <Search className="w-3 h-3 mr-1" />
                          Limpiar Búsqueda
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedSimpatizantes.length > 0 && (
                        <Badge className="bg-blue-100 text-blue-700">
                          {selectedSimpatizantes.length} seleccionados
                        </Badge>
                      )}
                      {searchTerm && (
                        <Badge
                          variant="outline"
                          className="bg-gray-50 text-gray-700 text-xs"
                        >
                          Buscando
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Simpatizantes ya agregados */}
                {conteoState.simpatizantesDelDia.length > 0 && (
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-green-700 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Ya agregados ({conteoState.simpatizantesDelDia.length})
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 text-xs h-6 px-2"
                        onClick={() => {
                          updateConteo({ simpatizantesDelDia: [] });
                          toast.info("Simpatizantes eliminados");
                        }}
                        aria-label="Eliminar todos los simpatizantes agregados"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Limpiar
                      </Button>
                    </div>
                    <div className="max-h-24 overflow-y-auto space-y-1 pr-1 border rounded-lg p-2 bg-green-50/50">
                      {conteoState.simpatizantesDelDia.map((simpatizante) => (
                        <div
                          key={simpatizante.id}
                          className="flex items-center justify-between p-2 bg-green-50 rounded text-sm border border-green-200"
                        >
                          <span className="text-green-800 truncate flex-1 min-w-0">
                            {simpatizante.nombre}
                            {simpatizante.telefono && (
                              <span className="text-green-600 ml-2">
                                📞 {simpatizante.telefono}
                              </span>
                            )}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 h-6 w-6 p-0 flex-shrink-0 ml-2"
                            onClick={() =>
                              removeSimpatizanteDelDia(simpatizante.id)
                            }
                            aria-label={`Eliminar ${simpatizante.nombre}`}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lista de simpatizantes existentes con scroll mejorado */}
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Simpatizantes Disponibles
                    {filteredSimpatizantes.length > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 text-xs"
                      >
                        {filteredSimpatizantes.length} encontrados
                      </Badge>
                    )}
                  </h4>
                  <div className="h-80 overflow-y-auto space-y-2 pr-1 border rounded-lg p-2 bg-gray-50/50">
                    {filteredSimpatizantes.length > 0 ? (
                      filteredSimpatizantes.map((simpatizante) => {
                        const isSelected = selectedSimpatizantes.includes(
                          simpatizante.id
                        );
                        return (
                          <div
                            key={simpatizante.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 bg-white hover:shadow-sm ${
                              isSelected
                                ? "bg-blue-50 border-blue-300 shadow-sm"
                                : "hover:bg-gray-50 active:bg-gray-100"
                            }`}
                            onClick={() =>
                              toggleSimpatizanteSelection(simpatizante.id)
                            }
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div
                                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                    isSelected
                                      ? "bg-blue-600 border-blue-600"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {isSelected && (
                                    <CheckCircle className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm text-gray-800">
                                    {simpatizante.nombre}
                                  </div>
                                  {simpatizante.telefono && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      📞 {simpatizante.telefono}
                                    </div>
                                  )}
                                  {simpatizante.notas && (
                                    <div className="text-xs text-gray-400 mt-1 bg-gray-50 p-2 rounded">
                                      💬 {simpatizante.notas}
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-400 mt-1">
                                    Registrado:{" "}
                                    {simpatizante.fechaRegistro || "N/A"}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className={`flex-shrink-0 ml-2 transition-transform ${
                                  isSelected
                                    ? "bg-blue-100 border-blue-300 text-blue-700"
                                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-200"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSimpatizanteSelection(simpatizante.id);
                                }}
                              >
                                {isSelected ? (
                                  <X className="w-4 h-4" />
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">
                          {searchSimpatizantesDebounce
                            ? `No se encontraron simpatizantes que coincidan con "${searchSimpatizantesDebounce}"`
                            : "No hay simpatizantes disponibles"}
                        </p>
                        {searchSimpatizantesDebounce && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 text-xs"
                            onClick={() => setSearchTerm("")}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Limpiar búsqueda
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex-shrink-0 pt-3 border-t space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200 h-10 text-sm"
                      onClick={() => setShowNewForm(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Nuevo
                    </Button>
                    {selectedSimpatizantes.length > 0 && (
                      <Button
                        className="flex-1 bg-blue-600 hover:bg-blue-700 h-10 text-sm"
                        onClick={() => {
                          addSelectedSimpatizantes();
                          setShowAddDialog(false);
                          setSearchTerm("");
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Agregar {selectedSimpatizantes.length} Simpatizantes
                      </Button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Formulario para nuevo simpatizante */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-800 text-sm font-medium">
                      <Plus className="w-4 h-4" />
                      Nuevo Simpatizante
                    </div>
                    <p className="text-blue-600 text-xs mt-1">
                      Complete la información del simpatizante
                    </p>
                  </div>

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
                      <X className="w-4 h-4 mr-1" />
                      Volver
                    </Button>
                    <Button
                      className="flex-1 bg-slate-600 hover:bg-slate-700 h-10 text-sm"
                      onClick={() => {
                        addNewSimpatizante();
                        setSelectedSimpatizantes([]); // Limpiar selección al agregar nuevo
                      }}
                      disabled={!newSimpatizante.nombre.trim()}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para seleccionar miembros - VERSIÓN MEJORADA */}
      <Dialog open={showMiembrosDialog} onOpenChange={setShowMiembrosDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-hidden flex flex-col mx-2 sm:mx-0">
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
            {/* Búsqueda y controles mejorados */}
            <div className="flex-shrink-0 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={`Buscar ${categoriaSeleccionada}...`}
                  value={searchMiembrosLocal}
                  onChange={(e) => setSearchMiembrosLocal(e.target.value)}
                  className="pl-10 h-10 text-sm"
                />
              </div>
              {searchMiembrosLocal && (
                <div className="mt-2 text-xs text-gray-500">
                  Buscando: &ldquo;{searchMiembrosLocal}&rdquo;
                </div>
              )}

              {/* Controles de selección múltiple */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllAvailableMembers}
                    className="text-xs h-8"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Seleccionar Todos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearMemberSelection}
                    className="text-xs h-8"
                    disabled={selectedMembers.length === 0}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Limpiar
                  </Button>
                  {searchMiembrosLocal && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchMiembrosLocal("")}
                      className="text-xs h-8 bg-blue-50 text-blue-700 border-blue-200"
                    >
                      <Search className="w-3 h-3 mr-1" />
                      Limpiar Búsqueda
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedMembers.length > 0 && (
                    <Badge className="bg-blue-100 text-blue-700">
                      {selectedMembers.length} seleccionados
                    </Badge>
                  )}
                  {searchMiembrosLocal && (
                    <Badge
                      variant="outline"
                      className="bg-gray-50 text-gray-700 text-xs"
                    >
                      Buscando
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Lista de miembros disponibles con scroll mejorado */}
            <div className="flex-1 overflow-hidden">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Disponibles para agregar
                {(() => {
                  const miembrosDisponibles = getMiembrosPorCategoria(
                    categoriaSeleccionada
                  );
                  const currentList =
                    (conteoState[
                      `${categoriaSeleccionada}DelDia` as keyof typeof conteoState
                    ] as MiembroSimplificado[]) || [];
                  const baseList = conteoState.modoConsecutivo
                    ? datosServicioBase?.miembrosAsistieron?.[
                        categoriaSeleccionada
                      ] || []
                    : [];

                  const filteredCount = miembrosDisponibles.filter(
                    (miembro) => {
                      const nombreMatch = miembro.nombre
                        .toLowerCase()
                        .includes(searchMiembrosLocalDebounce.toLowerCase());
                      const noEstaEnActuales = !currentList.find(
                        (m) => m.id === miembro.id
                      );
                      const noEstaEnBase = !baseList.find(
                        (m) => m.id === miembro.id
                      );
                      return nombreMatch && noEstaEnActuales && noEstaEnBase;
                    }
                  ).length;

                  return (
                    filteredCount > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 text-xs"
                      >
                        {filteredCount} encontrados
                      </Badge>
                    )
                  );
                })()}
              </h4>
              <div className="h-96 overflow-y-auto space-y-2 pr-1 border rounded-lg p-2 bg-gray-50/50">
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
                        .includes(searchMiembrosLocalDebounce.toLowerCase());
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
                          {searchMiembrosLocalDebounce
                            ? `No se encontraron miembros que coincidan con "${searchMiembrosLocalDebounce}"`
                            : "Todos los miembros ya están agregados"}
                        </p>
                        {searchMiembrosLocalDebounce && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 text-xs"
                            onClick={() => setSearchMiembrosLocal("")}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Limpiar búsqueda
                          </Button>
                        )}
                      </div>
                    );
                  }

                  return filteredMiembros.map((miembro) => {
                    const isSelected = selectedMembers.includes(miembro.id);
                    return (
                      <div
                        key={miembro.id}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${
                          isSelected
                            ? "bg-blue-50 border-blue-300 shadow-sm"
                            : "hover:bg-gray-50 active:bg-gray-100"
                        }`}
                        onClick={() => toggleMemberSelection(miembro.id)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              isSelected
                                ? "bg-blue-600 border-blue-600"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {miembro.nombre}
                            </div>
                            {miembro.telefono && (
                              <div className="text-xs text-gray-500 truncate">
                                {miembro.telefono}
                              </div>
                            )}
                            {miembro.notas && (
                              <div className="text-xs text-gray-400 mt-1 bg-gray-50 p-2 rounded">
                                💬 {miembro.notas}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`flex-shrink-0 ml-2 transition-transform ${
                            isSelected
                              ? "bg-blue-100 border-blue-300 text-blue-700"
                              : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-200"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMemberSelection(miembro.id);
                          }}
                        >
                          {isSelected ? (
                            <X className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Ya agregados - Sección compacta */}
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
                    <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
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

            {/* Botones de acción mejorados */}
            <div className="flex-shrink-0 pt-3 border-t space-y-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent text-sm"
                  onClick={() => {
                    setShowMiembrosDialog(false);
                    setSearchMiembrosLocal("");
                    setSelectedMembers([]);
                  }}
                >
                  Cancelar
                </Button>
                {selectedMembers.length > 0 ? (
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm"
                    onClick={() => {
                      addSelectedMembers();
                      setShowMiembrosDialog(false);
                      setSearchMiembrosLocal("");
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar {selectedMembers.length} Miembros
                  </Button>
                ) : (
                  <Button
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-sm"
                    onClick={() => {
                      setShowMiembrosDialog(false);
                      setSearchMiembrosLocal("");
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Finalizar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para ver lista de asistentes - VERSIÓN MEJORADA */}
      <Dialog
        open={showAsistentesDialog}
        onOpenChange={setShowAsistentesDialog}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col mx-2 sm:mx-0">
          <DialogHeader className="flex-shrink-0 pb-4">
            <DialogTitle className="text-base sm:text-lg flex items-center justify-between">
              <span>Lista de Asistentes</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {filteredAsistentes.length} encontrados
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Búsqueda de asistentes */}
            <div className="flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar asistentes por nombre..."
                  value={searchAsistentes}
                  onChange={(e) => setSearchAsistentes(e.target.value)}
                  className="pl-10 h-10 text-sm"
                />
              </div>
              {searchAsistentes && (
                <div className="mt-2 text-xs text-gray-500">
                  Buscando: &ldquo;{searchAsistentes}&rdquo;
                </div>
              )}
            </div>

            {/* Lista de asistentes con scroll mejorado */}
            <div className="flex-1 overflow-hidden">
              <div className="h-96 overflow-y-auto space-y-2 pr-1 border rounded-lg p-2 bg-gray-50/50">
                {filteredAsistentes.length > 0 ? (
                  filteredAsistentes.map((asistente) => {
                    const getCategoriaColor = (categoria: string) => {
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

                    const getCategoriaLabel = (categoria: string) => {
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

                    return (
                      <div
                        key={asistente.id}
                        className={`p-3 border rounded-lg bg-white hover:shadow-sm transition-all duration-200 ${
                          asistente.esBase ? "border-dashed" : "border-solid"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm text-gray-800 truncate">
                                {asistente.nombre}
                              </span>
                              {asistente.esBase && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 text-xs"
                                >
                                  Base
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`text-xs ${getCategoriaColor(
                                  asistente.categoria
                                )}`}
                              >
                                {getCategoriaLabel(asistente.categoria)}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  asistente.tipo === "miembro"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-green-50 text-green-700 border-green-200"
                                }`}
                              >
                                {asistente.tipo === "miembro"
                                  ? "Miembro"
                                  : "Simpatizante"}
                              </Badge>
                            </div>
                          </div>
                          {!asistente.esBase && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 flex-shrink-0 ml-2 h-8 w-8 p-0"
                              onClick={() => {
                                if (asistente.tipo === "miembro") {
                                  removeMiembroDelDia(
                                    asistente.id,
                                    asistente.categoria
                                  );
                                } else {
                                  removeSimpatizanteDelDia(asistente.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">
                      {searchAsistentesDebounce
                        ? `No se encontraron asistentes que coincidan con "${searchAsistentesDebounce}"`
                        : "No hay asistentes registrados"}
                    </p>
                    {searchAsistentesDebounce && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 text-xs"
                        onClick={() => setSearchAsistentes("")}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Limpiar búsqueda
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex-shrink-0 pt-3 border-t">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent text-sm"
                  onClick={() => {
                    setShowAsistentesDialog(false);
                    setSearchAsistentes("");
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cerrar
                </Button>
                {searchAsistentes && (
                  <Button
                    variant="outline"
                    className="flex-1 bg-blue-50 text-blue-700 border-blue-200 text-sm"
                    onClick={() => setSearchAsistentes("")}
                  >
                    <Search className="w-4 h-4 mr-1" />
                    Limpiar Búsqueda
                  </Button>
                )}
              </div>
            </div>
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
        className="w-full h-12 md:h-14 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 active:from-slate-800 active:to-slate-900 text-white rounded-xl py-4 md:py-5 shadow-lg text-base md:text-lg font-semibold mb-4"
        aria-label="Guardar conteo de asistencia"
      >
        <Save className="w-5 h-5 md:w-6 md:h-6 mr-2" />
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
