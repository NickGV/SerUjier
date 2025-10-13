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
import { MiembrosDialogProps } from "./types";
import { MiembroSimplificado } from "@/app/types";
import { getCategoriaColor, getMiembrosPorCategoria } from "./utils";

export function MiembrosDialog({
  isOpen,
  onClose,
  categoria,
  miembrosDisponibles,
  miembrosDelDia,
  baseMiembros,
  onAddMiembros,
  onRemoveMiembro,
  onClearAllMiembros,
}: MiembrosDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounce, setSearchDebounce] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

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
      setSelectedMembers([]);
    }
  }, [isOpen]);

  const categorizedMembers = getMiembrosPorCategoria(
    miembrosDisponibles,
    categoria
  );

  const filteredMembers = categorizedMembers.filter((miembro) => {
    const nombreMatch = miembro.nombre
      .toLowerCase()
      .includes(searchDebounce.toLowerCase());
    const noEstaEnActuales = !miembrosDelDia.find((m) => m.id === miembro.id);
    const noEstaEnBase = !baseMiembros.find((m) => m.id === miembro.id);
    return nombreMatch && noEstaEnActuales && noEstaEnBase;
  });

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const selectAllAvailableMembers = () => {
    const availableIds = filteredMembers.map((miembro) => miembro.id);
    setSelectedMembers(availableIds);
  };

  const clearMemberSelection = () => {
    setSelectedMembers([]);
  };

  const addSelectedMembers = () => {
    const membersToAdd = filteredMembers.filter((miembro) =>
      selectedMembers.includes(miembro.id)
    );
    onAddMiembros(membersToAdd);
    setSelectedMembers([]);
    toast.success(`${membersToAdd.length} miembros agregados exitosamente`);
  };

  const totalAgregados = miembrosDelDia.length + baseMiembros.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[95vh] overflow-hidden flex flex-col mx-2 sm:mx-0">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center justify-between text-base sm:text-lg">
            <span>Seleccionar {categoria}</span>
            <div className="flex gap-2">
              {miembrosDelDia.length > 0 && (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 text-xs sm:text-sm"
                >
                  +{miembrosDelDia.length} esta sesión
                </Badge>
              )}
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 text-xs sm:text-sm"
              >
                {totalAgregados} total
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Búsqueda y controles */}
          <div className="flex-shrink-0 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={`Buscar ${categoria}...`}
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
                {selectedMembers.length > 0 && (
                  <Badge className="bg-blue-100 text-blue-700">
                    {selectedMembers.length} seleccionados
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Lista de miembros disponibles */}
          <div className="flex-1 overflow-hidden">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Disponibles para agregar
              {filteredMembers.length > 0 && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 text-xs"
                >
                  {filteredMembers.length} encontrados
                </Badge>
              )}
            </h4>
            <div className="h-[500px] sm:h-[600px] overflow-y-auto space-y-2 pr-1 border rounded-lg p-3 bg-gray-50/50">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((miembro) => {
                  const isSelected = selectedMembers.includes(miembro.id);
                  return (
                    <Card
                      key={miembro.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "bg-blue-50 border-blue-300 shadow-sm"
                          : "bg-white border-gray-200 hover:shadow-md"
                      }`}
                      onClick={() => toggleMemberSelection(miembro.id)}
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
                            <div className={`w-10 h-10 ${getCategoriaColor(categoria)} rounded-full flex items-center justify-center flex-shrink-0`}>
                              <User className="w-5 h-5" />
                            </div>

                            {/* Información */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                                {miembro.nombre}
                              </h3>
                              <p className="text-xs text-gray-600">
                                {miembro.telefono || "Sin teléfono"}
                              </p>
                              {miembro.notas && (
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                  {miembro.notas}
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
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">
                    {searchDebounce
                      ? `No se encontraron miembros que coincidan con "${searchDebounce}"`
                      : "Todos los miembros ya están agregados"}
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

          {/* Ya agregados */}
          {miembrosDelDia.length > 0 && (
            <div className="flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-green-700 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Agregados en esta sesión ({miembrosDelDia.length})
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 text-xs h-6 px-2"
                  onClick={() => {
                    onClearAllMiembros();
                    toast.info("Miembros de esta sesión eliminados");
                  }}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Limpiar
                </Button>
              </div>
              <div className="max-h-56 h-56 overflow-y-auto space-y-1 pr-1">
                {miembrosDelDia.map((miembro: MiembroSimplificado) => (
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
                      onClick={() => onRemoveMiembro(miembro.id)}
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
                className="flex-1 bg-transparent text-sm"
                onClick={() => {
                  onClose();
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
                    onClose();
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar {selectedMembers.length} Miembros
                </Button>
              ) : (
                <Button
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-sm"
                  onClick={onClose}
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
  );
}
