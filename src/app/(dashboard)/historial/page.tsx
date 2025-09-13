"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/contexts/user-context";
import {
  fetchHistorial,
  deleteHistorialRecord,
  updateHistorialRecord,
} from "@/lib/utils";
import { RoleGuard } from "@/components/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Filter,
  Eye,
  Users,
  Download,
  FileText,
  BarChart3,
  CalendarDays,
  Search,
  Edit3,
  Trash2,
  Save,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface HistorialRecord {
  id: string;
  fecha: string;
  servicio: string;
  ujier: string | string[];
  hermanos: number;
  hermanas: number;
  ninos: number;
  adolescentes: number;
  simpatizantes: number;
  total: number;
  simpatizantesAsistieron?: Array<{ id: string; nombre: string }>;
  miembrosAsistieron?: {
    hermanos?: Array<{ id: string; nombre: string }>;
    hermanas?: Array<{ id: string; nombre: string }>;
    ninos?: Array<{ id: string; nombre: string }>;
    adolescentes?: Array<{ id: string; nombre: string }>;
  };
}

export default function HistorialPage() {
  return (
    <RoleGuard route="historial" allowedRoles={["admin", "directiva"]}>
      <HistorialContent />
    </RoleGuard>
  );
}

function HistorialContent() {
  const { user } = useUser();
  const [historial, setHistorial] = useState<HistorialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroServicio, setFiltroServicio] = useState("todos");
  const [filtroUjier, setFiltroUjier] = useState("todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<HistorialRecord | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para edición y eliminación
  const [editingRecord, setEditingRecord] = useState<HistorialRecord | null>(
    null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadHistorial = async () => {
      try {
        const data = await fetchHistorial();
        setHistorial(data);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Error cargando historial";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    loadHistorial();
  }, []);

  // Verificar permisos después de cargar los datos
  if (user && user.rol !== "directiva" && user.rol !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Calendar className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 mb-4">
              No tienes permisos para ver el historial. Solo usuarios con rol de
              Directiva o Administrador pueden acceder.
            </p>
            <Button onClick={() => window.history.back()} variant="outline">
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredData = historial.filter((record) => {
    const servicioMatch =
      filtroServicio === "todos" ||
      record.servicio.toLowerCase().includes(filtroServicio.toLowerCase());

    const ujierArray = Array.isArray(record.ujier)
      ? record.ujier
      : [record.ujier];
    const ujierMatch =
      filtroUjier === "todos" ||
      ujierArray.some((ujier) => ujier.includes(filtroUjier));

    const searchTermMatch =
      searchTerm === "" ||
      record.servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ujierArray.some((ujier: string) =>
        ujier.toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Filtro por rango de fechas
    let fechaMatch = true;
    if (fechaInicio || fechaFin) {
      const recordDate = new Date(record.fecha + "T12:00:00");
      if (fechaInicio) {
        const startDate = new Date(fechaInicio);
        fechaMatch = fechaMatch && recordDate >= startDate;
      }
      if (fechaFin) {
        const endDate = new Date(fechaFin);
        fechaMatch = fechaMatch && recordDate <= endDate;
      }
    }

    return servicioMatch && ujierMatch && fechaMatch && searchTermMatch;
  });

  // Estadísticas para el informe
  const totalRegistros = filteredData.length;
  const promedioAsistencia =
    filteredData.length > 0
      ? Math.round(
          filteredData.reduce((sum, record) => sum + record.total, 0) /
            filteredData.length
        )
      : 0;
  const mayorAsistencia =
    filteredData.length > 0 ? Math.max(...filteredData.map((r) => r.total)) : 0;
  const menorAsistencia =
    filteredData.length > 0 ? Math.min(...filteredData.map((r) => r.total)) : 0;

  // Estadísticas adicionales por categoría
  const totalHermanos = filteredData.reduce(
    (sum, record) => sum + record.hermanos,
    0
  );
  const totalHermanas = filteredData.reduce(
    (sum, record) => sum + record.hermanas,
    0
  );
  const totalNinos = filteredData.reduce(
    (sum, record) => sum + record.ninos,
    0
  );
  const totalAdolescentes = filteredData.reduce(
    (sum, record) => sum + record.adolescentes,
    0
  );
  const totalSimpatizantes = filteredData.reduce(
    (sum, record) => sum + record.simpatizantes,
    0
  );
  const granTotal =
    totalHermanos +
    totalHermanas +
    totalNinos +
    totalAdolescentes +
    totalSimpatizantes;

  const clearDateFilters = () => {
    setFechaInicio("");
    setFechaFin("");
  };

  const setQuickDateFilter = (days: number) => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);

    setFechaInicio(startDate.toISOString().split("T")[0]);
    setFechaFin(today.toISOString().split("T")[0]);
  };

  const clearAllFilters = () => {
    setFiltroServicio("todos");
    setFiltroUjier("todos");
    setFechaInicio("");
    setFechaFin("");
    setSearchTerm("");
  };

  const downloadCSV = () => {
    const headers = [
      "Fecha",
      "Servicio",
      "Ujier(es)",
      "Hermanos",
      "Hermanas",
      "Niños",
      "Adolescentes",
      "Simpatizantes",
      "Total",
      "Simpatizantes Asistieron",
      "Hermanos Asistieron",
      "Hermanas Asistieron",
      "Niños Asistieron",
      "Adolescentes Asistieron",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredData.map((record) =>
        [
          record.fecha,
          `"${record.servicio}"`,
          `"${
            Array.isArray(record.ujier) ? record.ujier.join("; ") : record.ujier
          }"`,
          record.hermanos,
          record.hermanas,
          record.ninos,
          record.adolescentes,
          record.simpatizantes,
          record.total,
          `"${
            record.simpatizantesAsistieron?.map((s) => s.nombre).join("; ") ||
            ""
          }"`,
          `"${
            record.miembrosAsistieron?.hermanos
              ?.map((m) => m.nombre)
              .join("; ") || ""
          }"`,
          `"${
            record.miembrosAsistieron?.hermanas
              ?.map((m) => m.nombre)
              .join("; ") || ""
          }"`,
          `"${
            record.miembrosAsistieron?.ninos?.map((m) => m.nombre).join("; ") ||
            ""
          }"`,
          `"${
            record.miembrosAsistieron?.adolescentes
              ?.map((m) => m.nombre)
              .join("; ") || ""
          }"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `informe_asistencia_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExcel = async () => {
    try {
      // Importar xlsx dinámicamente
      const XLSX = await import("xlsx");

      // Preparar datos para Excel
      const excelData = filteredData.map((record) => ({
        Fecha: new Date(record.fecha + "T12:00:00").toLocaleDateString("es-ES"),
        "Día de la Semana": new Date(record.fecha + "T12:00:00").toLocaleDateString("es-ES", {
          weekday: "long",
        }),
        Servicio: record.servicio,
        "Ujier(es)": Array.isArray(record.ujier)
          ? record.ujier.join(", ")
          : record.ujier,
        Hermanos: record.hermanos,
        Hermanas: record.hermanas,
        Niños: record.ninos,
        Adolescentes: record.adolescentes,
        Simpatizantes: record.simpatizantes,
        "Total Asistentes": record.total,
        "Simpatizantes que Asistieron":
          record.simpatizantesAsistieron?.map((s) => s.nombre).join(", ") || "",
        "Hermanos que Asistieron":
          record.miembrosAsistieron?.hermanos
            ?.map((m) => m.nombre)
            .join(", ") || "",
        "Hermanas que Asistieron":
          record.miembrosAsistieron?.hermanas
            ?.map((m) => m.nombre)
            .join(", ") || "",
        "Niños que Asistieron":
          record.miembrosAsistieron?.ninos?.map((m) => m.nombre).join(", ") ||
          "",
        "Adolescentes que Asistieron":
          record.miembrosAsistieron?.adolescentes
            ?.map((m) => m.nombre)
            .join(", ") || "",
      }));

      // Estadísticas resumidas para segunda hoja
      const estadisticas = [
        { Concepto: "Total de Registros", Valor: totalRegistros },
        { Concepto: "Promedio de Asistencia", Valor: promedioAsistencia },
        { Concepto: "Mayor Asistencia", Valor: mayorAsistencia },
        { Concepto: "Menor Asistencia", Valor: menorAsistencia },
        { Concepto: "", Valor: "" }, // Separador
        { Concepto: "TOTALES POR CATEGORÍA", Valor: "" },
        { Concepto: "Total Hermanos", Valor: totalHermanos },
        { Concepto: "Total Hermanas", Valor: totalHermanas },
        { Concepto: "Total Niños", Valor: totalNinos },
        { Concepto: "Total Adolescentes", Valor: totalAdolescentes },
        { Concepto: "Total Simpatizantes", Valor: totalSimpatizantes },
        { Concepto: "GRAN TOTAL", Valor: granTotal },
      ];

      // Crear libro de trabajo con múltiples hojas
      const workbook = XLSX.utils.book_new();

      // Hoja 1: Datos detallados
      const worksheet1 = XLSX.utils.json_to_sheet(excelData);

      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 12 }, // Fecha
        { wch: 15 }, // Día de la Semana
        { wch: 20 }, // Servicio
        { wch: 25 }, // Ujier(es)
        { wch: 10 }, // Hermanos
        { wch: 10 }, // Hermanas
        { wch: 10 }, // Niños
        { wch: 12 }, // Adolescentes
        { wch: 12 }, // Simpatizantes
        { wch: 12 }, // Total Asistentes
        { wch: 40 }, // Simpatizantes que Asistieron
        { wch: 40 }, // Hermanos que Asistieron
        { wch: 40 }, // Hermanas que Asistieron
        { wch: 40 }, // Niños que Asistieron
        { wch: 40 }, // Adolescentes que Asistieron
      ];
      worksheet1["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet1,
        "Registros Detallados"
      );

      // Hoja 2: Estadísticas
      const worksheet2 = XLSX.utils.json_to_sheet(estadisticas);
      worksheet2["!cols"] = [{ wch: 25 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, worksheet2, "Estadísticas");

      // Generar archivo Excel
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Descargar archivo
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `informe_asistencia_completo_${
          new Date().toISOString().split("T")[0]
        }.xlsx`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      toast.error(
        "Error al generar el archivo Excel. Por favor, intente nuevamente."
      );
    }
  };

  const downloadDetailedReport = () => {
    const reportContent = `
INFORME DETALLADO DE ASISTENCIA
===============================

FILTROS APLICADOS:
- Servicio: ${filtroServicio === "todos" ? "Todos" : filtroServicio}
- Ujier: ${filtroUjier === "todos" ? "Todos" : filtroUjier}
- Fecha inicio: ${fechaInicio || "Sin filtro"}
- Fecha fin: ${fechaFin || "Sin filtro"}
- Búsqueda: ${searchTerm || "Sin filtro"}
- Fecha de generación: ${new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}

RESUMEN EJECUTIVO:
==================
- Total de registros analizados: ${totalRegistros}
- Período analizado: ${
      fechaInicio && fechaFin
        ? `${fechaInicio} a ${fechaFin}`
        : "Todos los registros"
    }
- Gran total de asistentes: ${granTotal} personas
- Promedio de asistencia por servicio: ${promedioAsistencia} personas
- Mayor asistencia registrada: ${mayorAsistencia} personas
- Menor asistencia registrada: ${menorAsistencia} personas

ESTADÍSTICAS POR CATEGORÍA:
===========================
- Hermanos: ${totalHermanos} (${((totalHermanos / granTotal) * 100).toFixed(
      1
    )}%)
- Hermanas: ${totalHermanas} (${((totalHermanas / granTotal) * 100).toFixed(
      1
    )}%)
- Niños: ${totalNinos} (${((totalNinos / granTotal) * 100).toFixed(1)}%)
- Adolescentes: ${totalAdolescentes} (${(
      (totalAdolescentes / granTotal) *
      100
    ).toFixed(1)}%)
- Simpatizantes: ${totalSimpatizantes} (${(
      (totalSimpatizantes / granTotal) *
      100
    ).toFixed(1)}%)

DETALLE DE REGISTROS:
=====================
${filteredData
  .sort((a, b) => new Date(b.fecha + "T12:00:00").getTime() - new Date(a.fecha + "T12:00:00").getTime())
  .map(
    (record, index) => `
${index + 1}. REGISTRO DEL ${new Date(record.fecha + "T12:00:00")
      .toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      .toUpperCase()}
   Servicio: ${record.servicio}
   Ujier(es): ${
     Array.isArray(record.ujier) ? record.ujier.join(", ") : record.ujier
   }
   
   CONTEO POR CATEGORÍAS:
   - Hermanos: ${record.hermanos}
   - Hermanas: ${record.hermanas}
   - Niños: ${record.ninos}
   - Adolescentes: ${record.adolescentes}
   - Simpatizantes: ${record.simpatizantes}
   - TOTAL: ${record.total}
   
   ASISTENTES CON NOMBRE:
   ${
     record.simpatizantesAsistieron && record.simpatizantesAsistieron.length > 0
       ? `Simpatizantes (${
           record.simpatizantesAsistieron.length
         }): ${record.simpatizantesAsistieron.map((s) => s.nombre).join(", ")}`
       : "Simpatizantes: Ninguno registrado"
   }
       ${
         record.miembrosAsistieron?.hermanos &&
         record.miembrosAsistieron.hermanos.length > 0
           ? `Hermanos (${
               record.miembrosAsistieron.hermanos.length
             }): ${record.miembrosAsistieron.hermanos
               .map((m) => m.nombre)
               .join(", ")}`
           : "Hermanos: Ninguno registrado"
       }
    ${
      record.miembrosAsistieron?.hermanas &&
      record.miembrosAsistieron.hermanas.length > 0
        ? `Hermanas (${
            record.miembrosAsistieron.hermanas.length
          }): ${record.miembrosAsistieron.hermanas
            .map((m) => m.nombre)
            .join(", ")}`
        : "Hermanas: Ninguno registrado"
    }
    ${
      record.miembrosAsistieron?.ninos &&
      record.miembrosAsistieron.ninos.length > 0
        ? `Niños (${
            record.miembrosAsistieron.ninos.length
          }): ${record.miembrosAsistieron.ninos
            .map((m) => m.nombre)
            .join(", ")}`
        : "Niños: Ninguno registrado"
    }
    ${
      record.miembrosAsistieron?.adolescentes &&
      record.miembrosAsistieron.adolescentes.length > 0
        ? `Adolescentes (${
            record.miembrosAsistieron.adolescentes.length
          }): ${record.miembrosAsistieron.adolescentes
            .map((m) => m.nombre)
            .join(", ")}`
        : "Adolescentes: Ninguno registrado"
    }

${"=".repeat(80)}
`
  )
  .join("")}

NOTAS FINALES:
==============
- Este informe fue generado automáticamente por el Sistema de Conteo de Asistencia
- Los datos reflejan únicamente los registros que cumplen con los filtros aplicados
- Para consultas adicionales, contacte al administrador del sistema
    `.trim();

    const blob = new Blob([reportContent], {
      type: "text/plain;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `informe_detallado_${new Date().toISOString().split("T")[0]}.txt`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para eliminar registro
  const handleDeleteRecord = async (recordId: string) => {
    if (!recordId) return;

    setIsDeleting(true);
    try {
      await deleteHistorialRecord(recordId);
      // Recargar los datos
      const updatedData = await fetchHistorial();
      setHistorial(updatedData);
      setShowDeleteConfirm(null);
      toast.success("Registro eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar registro:", error);
      toast.error("Error al eliminar el registro. Intente nuevamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Función para iniciar edición
  const handleEditRecord = (record: HistorialRecord) => {
    setEditingRecord({ ...record });
  };

  // Función para guardar cambios
  const handleSaveRecord = async () => {
    if (!editingRecord) return;

    setIsSaving(true);
    try {
      const { id, ...updateData } = editingRecord;
      // Asegurar que ujier sea un array
      const dataToUpdate = {
        ...updateData,
        ujier: Array.isArray(updateData.ujier)
          ? updateData.ujier
          : [updateData.ujier],
      };
      await updateHistorialRecord(id, dataToUpdate);

      // Recargar los datos
      const updatedData = await fetchHistorial();
      setHistorial(updatedData);
      setEditingRecord(null);
      toast.success("Registro actualizado exitosamente");
    } catch (error) {
      console.error("Error al actualizar registro:", error);
      toast.error("Error al actualizar el registro. Intente nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // Función para cancelar edición
  const handleCancelEdit = () => {
    setEditingRecord(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <FileText className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 min-h-screen max-w-full overflow-x-hidden">
      {/* Header */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            Historial de Asistencia
          </CardTitle>
          <div className="flex items-center justify-between mt-2">
            <Badge
              variant="outline"
              className="bg-slate-50 text-slate-700 border-slate-200 text-xs"
            >
              {filteredData.length} registros encontrados
            </Badge>
            {(filtroServicio !== "todos" ||
              filtroUjier !== "todos" ||
              fechaInicio ||
              fechaFin ||
              searchTerm) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs bg-transparent border-red-200 text-red-600 hover:bg-red-50"
              >
                Limpiar Filtros
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
        <CardContent className="p-3 sm:p-4 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filtros</span>
          </div>

          {/* Búsqueda general */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
            <Input
              placeholder="Buscar por servicio o ujier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 sm:pl-10 rounded-lg h-8 sm:h-9 text-xs sm:text-sm"
            />
          </div>

          {/* Filtros básicos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">
                Servicio
              </label>
              <Select value={filtroServicio} onValueChange={setFiltroServicio}>
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="dominical">Dominical</SelectItem>
                  <SelectItem value="oración y enseñanza">
                    Oración y Enseñanza
                  </SelectItem>
                  <SelectItem value="hermanas dorcas">
                    Hermanas Dorcas
                  </SelectItem>
                  <SelectItem value="evangelismo">Evangelismo</SelectItem>
                  <SelectItem value="misionero">Misionero</SelectItem>
                  <SelectItem value="jóvenes">Jóvenes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">Ujier</label>
              <Select value={filtroUjier} onValueChange={setFiltroUjier}>
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {Array.from(
                    new Set(
                      historial.flatMap((record) =>
                        Array.isArray(record.ujier)
                          ? record.ujier
                          : [record.ujier]
                      )
                    )
                  ).map((ujier) => (
                    <SelectItem key={ujier} value={ujier}>
                      {ujier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtros de fecha */}
          <div className="border-t pt-3">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Filtro por Fechas
              </span>
            </div>

            {/* Botones de filtro rápido */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickDateFilter(7)}
                className="text-xs bg-transparent"
              >
                7 días
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickDateFilter(30)}
                className="text-xs bg-transparent"
              >
                30 días
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickDateFilter(90)}
                className="text-xs bg-transparent"
              >
                90 días
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearDateFilters}
                className="text-xs bg-transparent"
              >
                Limpiar
              </Button>
            </div>

            {/* Campos de fecha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">
                  Fecha Inicio
                </label>
                <Input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">
                  Fecha Fin
                </label>
                <Input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Indicador de filtros activos */}
            {(fechaInicio || fechaFin) && (
              <div className="mt-2 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                >
                  {fechaInicio && fechaFin
                    ? `${fechaInicio} a ${fechaFin}`
                    : fechaInicio
                    ? `Desde ${fechaInicio}`
                    : `Hasta ${fechaFin}`}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Summary */}
      {filteredData.length > 0 && (
        <Card className="bg-gradient-to-r from-slate-600 to-slate-700 text-white border-0 shadow-lg">
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold">
                  {promedioAsistencia}
                </div>
                <div className="text-slate-200 text-xs sm:text-sm">
                  Promedio
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold">
                  {totalRegistros}
                </div>
                <div className="text-slate-200 text-xs sm:text-sm">
                  Registros
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-500">
              <div className="text-center">
                <div className="text-base sm:text-lg font-semibold">
                  {mayorAsistencia}
                </div>
                <div className="text-slate-200 text-xs">Máximo</div>
              </div>
              <div className="text-center">
                <div className="text-base sm:text-lg font-semibold">
                  {menorAsistencia}
                </div>
                <div className="text-slate-200 text-xs">Mínimo</div>
              </div>
            </div>

            {/* Totales por categoría */}
            <div className="mt-3 pt-3 border-t border-slate-500">
              <div className="text-xs text-slate-200 mb-2 text-center">
                Total General: {granTotal} asistentes
              </div>
              <div className="grid grid-cols-5 gap-1 text-center">
                <div>
                  <div className="text-sm font-semibold">{totalHermanos}</div>
                  <div className="text-xs text-slate-300">H</div>
                </div>
                <div>
                  <div className="text-sm font-semibold">{totalHermanas}</div>
                  <div className="text-xs text-slate-300">M</div>
                </div>
                <div>
                  <div className="text-sm font-semibold">{totalNinos}</div>
                  <div className="text-xs text-slate-300">N</div>
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    {totalAdolescentes}
                  </div>
                  <div className="text-xs text-slate-300">A</div>
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    {totalSimpatizantes}
                  </div>
                  <div className="text-xs text-slate-300">S</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Download Reports */}
      {filteredData.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Download className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Descargar Informes
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadCSV}
                className="bg-transparent border-green-200 text-green-700 hover:bg-green-50 text-xs"
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadExcel}
                className="bg-transparent border-blue-200 text-blue-700 hover:bg-blue-50 text-xs"
              >
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadDetailedReport}
                className="bg-transparent border-purple-200 text-purple-700 hover:bg-purple-50 text-xs"
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Detallado
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Records List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">
            Registros Detallados
          </h3>
          {filteredData.length === 0 && (
            <Badge variant="outline" className="text-xs text-gray-500">
              Sin resultados
            </Badge>
          )}
        </div>

        {filteredData.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No se encontraron registros
              </h3>
              <p className="text-gray-500">
                Intenta ajustar los filtros para ver más resultados
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredData.map((record) => (
            <Card
              key={record.id}
              className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold text-gray-800">
                      {new Date(record.fecha + "T12:00:00").toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-sm text-gray-600">
                      {Array.isArray(record.ujier)
                        ? record.ujier.join(", ")
                        : record.ujier}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-700">
                      {record.total}
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs bg-slate-50 text-slate-600 border-slate-200"
                    >
                      {record.servicio}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                  <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <div className="text-sm font-semibold text-slate-600">
                      {record.hermanos}
                    </div>
                    <div className="text-xs text-gray-500">Hermanos</div>
                  </div>
                  <div className="text-center p-2 bg-rose-50 rounded-lg">
                    <div className="text-sm font-semibold text-rose-600">
                      {record.hermanas}
                    </div>
                    <div className="text-xs text-gray-500">Hermanas</div>
                  </div>
                  <div className="text-center p-2 bg-amber-50 rounded-lg">
                    <div className="text-sm font-semibold text-amber-600">
                      {record.ninos}
                    </div>
                    <div className="text-xs text-gray-500">Niños</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded-lg">
                    <div className="text-sm font-semibold text-purple-600">
                      {record.adolescentes}
                    </div>
                    <div className="text-xs text-gray-500">Adolesc.</div>
                  </div>
                  <div className="text-center p-2 bg-emerald-50 rounded-lg">
                    <div className="text-sm font-semibold text-emerald-600">
                      {record.simpatizantes}
                    </div>
                    <div className="text-xs text-gray-500">Simpat.</div>
                  </div>
                </div>

                {/* Lista de simpatizantes que asistieron */}
                {record.simpatizantesAsistieron &&
                  record.simpatizantesAsistieron.length > 0 && (
                    <div className="mb-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <div className="text-xs text-emerald-700 mb-1 flex items-center gap-1 font-medium">
                        <Users className="w-3 h-3" />
                        Simpatizantes que asistieron (
                        {record.simpatizantesAsistieron.length}):
                      </div>
                      <div className="text-xs text-emerald-800">
                        {record.simpatizantesAsistieron.map((s) => (
                          <span
                            key={s.id}
                            className="inline-block bg-emerald-100 px-2 py-1 rounded mr-1 mb-1"
                          >
                            {s.nombre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent hover:bg-slate-50"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalles
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => handleEditRecord(record)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() => setShowDeleteConfirm(record.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white max-h-[85vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Detalle del Registro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Fecha:</span>
                  <div className="font-semibold">
                    {new Date(selectedRecord.fecha + "T12:00:00").toLocaleDateString("es-ES")}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Servicio:</span>
                  <div className="font-semibold">{selectedRecord.servicio}</div>
                </div>
                <div>
                  <span className="text-gray-600">Ujier(es):</span>
                  <div className="font-semibold">
                    {Array.isArray(selectedRecord.ujier)
                      ? selectedRecord.ujier.join(", ")
                      : selectedRecord.ujier}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Total:</span>
                  <div className="font-semibold text-xl text-slate-700">
                    {selectedRecord.total}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-3 border-t">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-lg font-bold text-slate-600">
                    {selectedRecord.hermanos}
                  </div>
                  <div className="text-xs text-gray-500">Hermanos</div>
                </div>
                <div className="text-center p-3 bg-rose-50 rounded-lg">
                  <div className="text-lg font-bold text-rose-600">
                    {selectedRecord.hermanas}
                  </div>
                  <div className="text-xs text-gray-500">Hermanas</div>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <div className="text-lg font-bold text-amber-600">
                    {selectedRecord.ninos}
                  </div>
                  <div className="text-xs text-gray-500">Niños</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {selectedRecord.adolescentes}
                  </div>
                  <div className="text-xs text-gray-500">Adolesc.</div>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <div className="text-lg font-bold text-emerald-600">
                    {selectedRecord.simpatizantes}
                  </div>
                  <div className="text-xs text-gray-500">Simpat.</div>
                </div>
              </div>

              {/* Detalle de simpatizantes */}
              {selectedRecord.simpatizantesAsistieron &&
                selectedRecord.simpatizantesAsistieron.length > 0 && (
                  <div className="pt-3 border-t">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Simpatizantes que Asistieron (
                      {selectedRecord.simpatizantesAsistieron.length})
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedRecord.simpatizantesAsistieron.map(
                        (simpatizante) => (
                          <div
                            key={simpatizante.id}
                            className="text-sm text-gray-700 bg-emerald-50 p-2 rounded border border-emerald-100"
                          >
                            {simpatizante.nombre}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              <Button
                className="w-full mt-4 bg-slate-600 hover:bg-slate-700"
                onClick={() => setSelectedRecord(null)}
              >
                Cerrar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Confirmar Eliminación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                ¿Estás seguro de que deseas eliminar este registro del
                historial? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={isDeleting}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={() => handleDeleteRecord(showDeleteConfirm)}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de edición */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="w-full max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Editar Registro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Fecha
                  </label>
                  <Input
                    type="date"
                    value={editingRecord.fecha}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        fecha: e.target.value,
                      })
                    }
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Servicio
                  </label>
                  <Select
                    value={editingRecord.servicio}
                    onValueChange={(value) =>
                      setEditingRecord({ ...editingRecord, servicio: value })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dominical">Dominical</SelectItem>
                      <SelectItem value="oración y enseñanza">
                        Oración y Enseñanza
                      </SelectItem>
                      <SelectItem value="hermanas dorcas">
                        Hermanas Dorcas
                      </SelectItem>
                      <SelectItem value="evangelismo">Evangelismo</SelectItem>
                      <SelectItem value="misionero">Misionero</SelectItem>
                      <SelectItem value="jóvenes">Jóvenes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Hermanos
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={editingRecord.hermanos}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        hermanos: parseInt(e.target.value) || 0,
                        total:
                          (parseInt(e.target.value) || 0) +
                          editingRecord.hermanas +
                          editingRecord.ninos +
                          editingRecord.adolescentes +
                          editingRecord.simpatizantes,
                      })
                    }
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Hermanas
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={editingRecord.hermanas}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        hermanas: parseInt(e.target.value) || 0,
                        total:
                          editingRecord.hermanos +
                          (parseInt(e.target.value) || 0) +
                          editingRecord.ninos +
                          editingRecord.adolescentes +
                          editingRecord.simpatizantes,
                      })
                    }
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Niños
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={editingRecord.ninos}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        ninos: parseInt(e.target.value) || 0,
                        total:
                          editingRecord.hermanos +
                          editingRecord.hermanas +
                          (parseInt(e.target.value) || 0) +
                          editingRecord.adolescentes +
                          editingRecord.simpatizantes,
                      })
                    }
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Adolescentes
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={editingRecord.adolescentes}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        adolescentes: parseInt(e.target.value) || 0,
                        total:
                          editingRecord.hermanos +
                          editingRecord.hermanas +
                          editingRecord.ninos +
                          (parseInt(e.target.value) || 0) +
                          editingRecord.simpatizantes,
                      })
                    }
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Simpatizantes
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={editingRecord.simpatizantes}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        simpatizantes: parseInt(e.target.value) || 0,
                        total:
                          editingRecord.hermanos +
                          editingRecord.hermanas +
                          editingRecord.ninos +
                          editingRecord.adolescentes +
                          (parseInt(e.target.value) || 0),
                      })
                    }
                    className="h-9"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">
                  Total Calculado:
                </div>
                <div className="text-2xl font-bold text-slate-700">
                  {editingRecord.total}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleSaveRecord}
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
