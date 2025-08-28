"use client";

import { useConteoLogic } from "@/hooks/use-conteo-logic";
import { ConteoHeader } from "@/components/conteo/conteo-header";
import { ConteoCounters } from "@/components/conteo/conteo-counters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Eye, Save, Calendar, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Plus, X, CheckCircle } from "lucide-react";

export default function ConteoPage() {
  const {
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
    datosServicioBase,
    simpatizantesDelDia,
    hermanosDelDia,
    hermanasDelDia,
    ninosDelDia,
    adolescentesDelDia,

    // Estados locales
    editingCounter,
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
    showContinuarDialog,
    searchMiembros,
    setSearchMiembros,
    showBulkCountDialog,
    setShowBulkCountDialog,
    bulkCounts,
    setBulkCounts,

    // Estados de Firebase
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
    total,
    filteredSimpatizantes,
  } = useConteoLogic();

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

  // Preparar los contadores para el componente
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
      miembrosDelDia: simpatizantesDelDia,
    },
  ];

  return (
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 min-h-screen max-w-full overflow-x-hidden">
      {/* Header */}
      <ConteoHeader
        fecha={fecha}
        setFecha={setFecha}
        tipoServicio={tipoServicio}
        setTipoServicio={setTipoServicio}
        selectedUjieres={selectedUjieres}
        setSelectedUjieres={setSelectedUjieres}
        servicios={servicios}
        ujieres={ujieres}
      />

      {/* Modo Consecutivo Banner */}
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
      <ConteoCounters
        counters={counters}
        editingCounter={editingCounter}
        tempValue={tempValue}
        setTempValue={setTempValue}
        handleCounterEdit={handleCounterEdit}
        saveCounterEdit={saveCounterEdit}
        openMiembrosDialog={openMiembrosDialog}
        setShowAddDialog={setShowAddDialog}
      />

      {/* Ver Lista Asistentes Button */}
      {(hermanosDelDia.length > 0 ||
        hermanasDelDia.length > 0 ||
        ninosDelDia.length > 0 ||
        adolescentesDelDia.length > 0 ||
        simpatizantesDelDia.length > 0 ||
        (modoConsecutivo &&
          ((datosServicioBase?.simpatizantesAsistieron?.length ?? 0) > 0 ||
            (datosServicioBase?.miembrosAsistieron?.hermanos?.length ?? 0) >
              0 ||
            (datosServicioBase?.miembrosAsistieron?.hermanas?.length ?? 0) >
              0 ||
            (datosServicioBase?.miembrosAsistieron?.ninos?.length ?? 0) > 0 ||
            (datosServicioBase?.miembrosAsistieron?.adolescentes?.length ?? 0) >
              0))) && (
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
            (modoConsecutivo
              ? datosServicioBase?.miembrosAsistieron?.hermanos?.length || 0
              : 0) +
            (modoConsecutivo
              ? datosServicioBase?.miembrosAsistieron?.hermanas?.length || 0
              : 0) +
            (modoConsecutivo
              ? datosServicioBase?.miembrosAsistieron?.ninos?.length || 0
              : 0) +
            (modoConsecutivo
              ? datosServicioBase?.miembrosAsistieron?.adolescentes?.length || 0
              : 0) +
            (modoConsecutivo
              ? datosServicioBase?.simpatizantesAsistieron?.length || 0
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
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center justify-between">
              <span>Agregar Simpatizantes</span>
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700"
              >
                {simpatizantesDelDia.length} agregados
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Búsqueda */}
            <div className="flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar simpatizantes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Ya agregados */}
            {simpatizantesDelDia.length > 0 && (
              <div className="flex-shrink-0">
                <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Ya agregados ({simpatizantesDelDia.length})
                </h4>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {simpatizantesDelDia.map((simpatizante) => (
                    <div
                      key={simpatizante.id}
                      className="flex items-center justify-between p-2 bg-green-50 rounded text-sm border border-green-200"
                    >
                      <span className="text-green-800">
                        {simpatizante.nombre}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                        onClick={() =>
                          removeSimpatizanteDelDia(simpatizante.id)
                        }
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de simpatizantes disponibles */}
            <div className="flex-1 overflow-hidden">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Disponibles para agregar
              </h4>
              <div className="h-full overflow-y-auto space-y-2">
                {filteredSimpatizantes.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">
                      {searchTerm
                        ? "No se encontraron simpatizantes disponibles"
                        : "Todos los simpatizantes ya están agregados"}
                    </p>
                  </div>
                ) : (
                  filteredSimpatizantes.map((simpatizante) => (
                    <div
                      key={simpatizante.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => selectExistingSimpatizante(simpatizante)}
                    >
                      <div className="flex-1">
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Botón para agregar nuevo */}
            <div className="flex-shrink-0 pt-3 border-t">
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => setShowNewForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Nuevo Simpatizante
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para nuevo simpatizante */}
      <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Simpatizante</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
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

            <div className="flex gap-2 pt-3">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setShowNewForm(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={addNewSimpatizante}
                disabled={!newSimpatizante.nombre.trim()}
              >
                Agregar
              </Button>
            </div>
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
                        categoriaSeleccionada as keyof typeof datosServicioBase.miembrosAsistieron
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
                    categoriaSeleccionada as keyof typeof datosServicioBase.miembrosAsistieron
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
                      {baseList.map(
                        (miembro: { id: string; nombre: string }) => (
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
                        )
                      )}
                      {/* Miembros agregados en esta sesión */}
                      {currentList.map((miembro: any) => (
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
                        categoriaSeleccionada as keyof typeof datosServicioBase.miembrosAsistieron
                      ] || []
                    : [];

                  const filteredMiembros = miembrosDisponibles.filter(
                    (miembro) => {
                      const nombreMatch = miembro.nombre
                        .toLowerCase()
                        .includes(searchMiembros.toLowerCase());
                      const noEstaEnActuales = !currentList.find(
                        (m: any) => m.id === miembro.id
                      );
                      const noEstaEnBase = !baseList.find(
                        (m: any) => m.id === miembro.id
                      );
                      return nombreMatch && noEstaEnActuales && noEstaEnBase;
                    }
                  );

                  if (filteredMiembros.length === 0) {
                    return (
                      <div className="text-center text-gray-500 py-8">
                        <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">
                          {searchTerm
                            ? "No se encontraron miembros disponibles"
                            : "Todos los miembros ya están agregados"}
                        </p>
                      </div>
                    );
                  }

                  return filteredMiembros.map((miembro: any) => (
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
                {["hermanos", "hermanas", "ninos", "adolescentes"].map(
                  (catKey) => {
                    const members = (datosServicioBase.miembrosAsistieron?.[
                      catKey as keyof typeof datosServicioBase.miembrosAsistieron
                    ] ?? []) as { id: string; nombre: string }[];
                    if (members.length === 0) return null;
                    return (
                      <div key={`base-${catKey}`}>
                        <h4 className="font-semibold text-gray-700 mb-2 capitalize">
                          {catKey} ({members.length})
                        </h4>
                        {members.map(
                          (miembro: { id: string; nombre: string }) => (
                            <div
                              key={miembro.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded mb-1"
                            >
                              <span className="text-sm">{miembro.nombre}</span>
                            </div>
                          )
                        )}
                      </div>
                    );
                  }
                )}
                {(datosServicioBase.simpatizantesAsistieron?.length ?? 0) >
                  0 && (
                  <div>
                    <h4 className="font-semibold text-emerald-700 mb-2">
                      Simpatizantes (
                      {datosServicioBase.simpatizantesAsistieron?.length ?? 0})
                    </h4>
                    {datosServicioBase.simpatizantesAsistieron?.map(
                      (simpatizante: { id: string; nombre: string }) => (
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
