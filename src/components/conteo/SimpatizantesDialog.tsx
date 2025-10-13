"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  X,
  Plus,
  CheckCircle,
  Trash2,
  Users,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { SimpatizantesDialogProps } from "./types";
import { getCategoriaColor } from "./utils";

export function SimpatizantesDialog({
  isOpen,
  onClose,
  simpatizantes,
  simpatizantesDelDia,
  onAddSimpatizantes,
  onAddNewSimpatizante,
  onRemoveSimpatizante,
  onClearAllSimpatizantes,
}: SimpatizantesDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounce, setSearchDebounce] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedSimpatizantes, setSelectedSimpatizantes] = useState<string[]>(
    []
  );
  const [newSimpatizante, setNewSimpatizante] = useState({
    nombre: "",
    telefono: "",
    notas: "",
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setShowNewForm(false);
      setSelectedSimpatizantes([]);
      setNewSimpatizante({ nombre: "", telefono: "", notas: "" });
    }
  }, [isOpen]);

  const filteredSimpatizantes = simpatizantes.filter(
    (s) =>
      s.nombre.toLowerCase().includes(searchDebounce.toLowerCase()) &&
      !simpatizantesDelDia.find((sd) => sd.id === s.id)
  );

  const toggleSimpatizanteSelection = (simpatizanteId: string) => {
    setSelectedSimpatizantes((prev) =>
      prev.includes(simpatizanteId)
        ? prev.filter((id) => id !== simpatizanteId)
        : [...prev, simpatizanteId]
    );
  };

  const selectAllAvailableSimpatizantes = () => {
    const availableIds = filteredSimpatizantes.map((s) => s.id);
    setSelectedSimpatizantes(availableIds);
  };

  const clearSimpatizanteSelection = () => {
    setSelectedSimpatizantes([]);
  };

  const addSelectedSimpatizantes = () => {
    const simpatizantesToAdd = filteredSimpatizantes.filter((s) =>
      selectedSimpatizantes.includes(s.id)
    );
    onAddSimpatizantes(simpatizantesToAdd);
    setSelectedSimpatizantes([]);
    toast.success(
      `${simpatizantesToAdd.length} simpatizantes agregados exitosamente`
    );
  };

  const handleAddNewSimpatizante = async () => {
    if (!newSimpatizante.nombre.trim()) return;

    try {
      await onAddNewSimpatizante({
        ...newSimpatizante,
        fechaRegistro: new Date().toISOString().split("T")[0],
      });
      setNewSimpatizante({ nombre: "", telefono: "", notas: "" });
      setShowNewForm(false);
      setSelectedSimpatizantes([]);
    } catch (error) {
      console.error("Error agregando simpatizante:", error);
      toast.error("Error al agregar simpatizante. Intente nuevamente.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[95vh] overflow-hidden flex flex-col mx-2 sm:mx-0">
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
              {/* Búsqueda */}
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

              {/* Controles de selección */}
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
                  </div>
                </div>
              </div>

             

              {/* Lista de simpatizantes disponibles */}
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
                <div className="h-[500px] sm:h-[600px] overflow-y-auto space-y-2 pr-1 border rounded-lg p-3 bg-gray-50/50">
                  {filteredSimpatizantes.length > 0 ? (
                    filteredSimpatizantes.map((simpatizante) => {
                      const isSelected = selectedSimpatizantes.includes(
                        simpatizante.id
                      );
                      return (
                        <Card
                          key={simpatizante.id}
                          className={`cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "bg-blue-50 border-blue-300 shadow-sm"
                              : "bg-white border-gray-200 hover:shadow-md"
                          }`}
                          onClick={() =>
                            toggleSimpatizanteSelection(simpatizante.id)
                          }
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {/* Checkbox */}
                                <div
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                    isSelected
                                      ? "bg-blue-600 border-blue-600"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {isSelected && (
                                    <CheckCircle className="w-3 h-3 text-white" />
                                  )}
                                </div>

                                {/* Avatar */}
                                <div className={`w-10 h-10 ${getCategoriaColor("simpatizantes")} rounded-full flex items-center justify-center flex-shrink-0`}>
                                  <User className="w-5 h-5" />
                                </div>

                                {/* Información */}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                                    {simpatizante.nombre}
                                  </h3>
                                  <p className="text-xs text-gray-600">
                                    {simpatizante.telefono || "Sin teléfono"}
                                  </p>
                                  {simpatizante.notas && (
                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                      {simpatizante.notas}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Botón de selección */}
                              <Button
                                variant="outline"
                                size="sm"
                                className={`h-8 w-8 p-0 ${
                                  isSelected
                                    ? "bg-blue-100 border-blue-300 text-blue-700"
                                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50"
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
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">
                        {searchDebounce
                          ? `No se encontraron simpatizantes que coincidan con "${searchDebounce}"`
                          : "No hay simpatizantes disponibles"}
                      </p>
                      {searchDebounce && (
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
               {/* Simpatizantes ya agregados */}
               {simpatizantesDelDia.length > 0 && (
                <div className="flex-shrink-0 ">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-green-700 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Ya agregados ({simpatizantesDelDia.length})
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 text-xs h-6 px-2"
                      onClick={() => {
                        onClearAllSimpatizantes();
                        toast.info("Simpatizantes eliminados");
                      }}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Limpiar
                    </Button>
                  </div>
                  <div className="max-h-56 h-56 overflow-y-auto space-y-1 pr-1 border rounded-lg p-3 bg-green-50/50">
                    {simpatizantesDelDia.map((simpatizante) => (
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
                          onClick={() => onRemoveSimpatizante(simpatizante.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                        onClose();
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
                    onClick={handleAddNewSimpatizante}
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
  );
}
