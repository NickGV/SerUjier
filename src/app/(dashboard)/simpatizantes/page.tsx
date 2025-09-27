"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchSimpatizantes,
  addSimpatizante,
  deleteSimpatizante,
} from "@/lib/utils";

export interface Simpatizante {
  id: string;
  nombre: string;
  telefono?: string;
  notas?: string;
  fechaRegistro: string;
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Plus, Trash2, MoreVertical, User, Phone, FileText, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SimpatizantesPage = () => {
  const router = useRouter();
  const [simpatizantes, setSimpatizantes] = useState<Simpatizante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [simpatizanteToDelete, setSimpatizanteToDelete] =
    useState<Simpatizante | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newSimpatizante, setNewSimpatizante] = useState({
    nombre: "",
    telefono: "",
    notas: "",
  });

  const filteredSimpatizantes = simpatizantes.filter((simpatizante) =>
    simpatizante.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addNewSimpatizante = async () => {
    if (newSimpatizante.nombre.trim()) {
      try {
        const nuevoSimpatizante = {
          ...newSimpatizante,
          fechaRegistro: new Date().toISOString(),
        };
        const result = await addSimpatizante(nuevoSimpatizante);
        setSimpatizantes([
          ...simpatizantes,
          { ...nuevoSimpatizante, id: result.id },
        ]);
        setNewSimpatizante({ nombre: "", telefono: "", notas: "" });
        setShowAddDialog(false);
      } catch (err) {
        console.error("Error adding simpatizante:", err);
        setError("Error al agregar simpatizante");
      }
    }
  };

  const handleDeleteClick = (simpatizante: Simpatizante) => {
    setSimpatizanteToDelete(simpatizante);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!simpatizanteToDelete) return;

    setIsDeleting(true);
    try {
      await deleteSimpatizante(simpatizanteToDelete.id);
      setSimpatizantes(
        simpatizantes.filter((s) => s.id !== simpatizanteToDelete.id)
      );
      setShowDeleteDialog(false);
      setSimpatizanteToDelete(null);
    } catch (err) {
      console.error("Error deleting simpatizante:", err);
      setError("Error al eliminar simpatizante");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setSimpatizanteToDelete(null);
  };

  useEffect(() => {
    const loadSimpatizantes = async () => {
      try {
        const data = await fetchSimpatizantes();
        setSimpatizantes(data);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Error cargando simpatizantes";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    loadSimpatizantes();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading simpatizantes: {error}</div>;

  return (
    <div className="p-3 md:p-6 space-y-6 md:space-y-8 min-h-screen max-w-full overflow-x-hidden">
      {/* Header */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="px-4 md:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              Simpatizantes
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="bg-slate-50 text-slate-700 border-slate-200 text-sm md:text-base px-3 py-1"
              >
                {filteredSimpatizantes.length} registrados
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-4 md:p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar simpatizante por nombre, teléfono o notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 rounded-xl h-12 md:h-14 text-base md:text-lg border-2 border-gray-200 focus:border-slate-400 transition-colors"
            />
          </div>
          {searchTerm && (
            <div className="mt-3 text-sm text-gray-600">
              Mostrando {filteredSimpatizantes.length} de {simpatizantes.length} simpatizantes
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Button */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogTrigger asChild>
          <Button className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl py-4 md:py-5 shadow-lg text-base md:text-lg font-semibold h-14 md:h-16">
            <Plus className="w-5 h-5 md:w-6 md:h-6 mr-3" />
            Agregar Nuevo Simpatizante
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col mx-2 sm:mx-0">
          <DialogHeader className="flex-shrink-0 pb-4">
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              Nuevo Simpatizante
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              Complete la información del simpatizante
            </p>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            <div>
              <label className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Nombre Completo *
              </label>
              <Input
                placeholder="Nombre completo del simpatizante"
                value={newSimpatizante.nombre}
                onChange={(e) =>
                  setNewSimpatizante({
                    ...newSimpatizante,
                    nombre: e.target.value,
                  })
                }
                className="h-12 text-base rounded-xl border-2 border-gray-200 focus:border-slate-400"
              />
            </div>
            <div>
              <label className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Teléfono
              </label>
              <Input
                placeholder="Número de teléfono (opcional)"
                value={newSimpatizante.telefono}
                onChange={(e) =>
                  setNewSimpatizante({
                    ...newSimpatizante,
                    telefono: e.target.value,
                  })
                }
                className="h-12 text-base rounded-xl border-2 border-gray-200 focus:border-slate-400"
              />
            </div>
            <div>
              <label className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notas
              </label>
              <Input
                placeholder="Notas adicionales (opcional)"
                value={newSimpatizante.notas}
                onChange={(e) =>
                  setNewSimpatizante({
                    ...newSimpatizante,
                    notas: e.target.value,
                  })
                }
                className="h-12 text-base rounded-xl border-2 border-gray-200 focus:border-slate-400"
              />
            </div>
          </div>
          <div className="flex-shrink-0 pt-4 border-t">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-transparent h-12 text-base font-semibold rounded-xl"
                onClick={() => setShowAddDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-slate-600 hover:bg-slate-700 h-12 text-base font-semibold rounded-xl"
                onClick={addNewSimpatizante}
                disabled={!newSimpatizante.nombre.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Simpatizantes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {filteredSimpatizantes.map((simpatizante) => (
          <Card
            key={simpatizante.id}
            className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => router.push(`/simpatizantes/${simpatizante.id}`)}
          >
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col h-full">
                {/* Header with Avatar and Actions */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {simpatizante.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-base md:text-lg truncate group-hover:text-slate-600 transition-colors">
                        {simpatizante.nombre}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {simpatizante.telefono || "Sin teléfono"}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/simpatizantes/${simpatizante.id}`);
                        }}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Ver Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(simpatizante);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Notes Section */}
                {simpatizante.notas && (
                  <div className="flex-1 mb-4">
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg line-clamp-3">
                      {simpatizante.notas}
                    </p>
                  </div>
                )}

                {/* Footer with Registration Info */}
                <div className="mt-auto">
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className="bg-slate-50 text-slate-700 border-slate-200 text-xs px-3 py-1"
                    >
                      <Calendar className="w-3 h-3 mr-1" />
                      Registrado: {new Date(simpatizante.fechaRegistro).toLocaleDateString("es-ES")}
                    </Badge>
                    {simpatizante.telefono && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`tel:${simpatizante.telefono}`, "_self");
                        }}
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Llamar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSimpatizantes.length === 0 && (
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-3">
              {searchTerm ? "No se encontraron simpatizantes" : "Aún no hay simpatizantes"}
            </h3>
            <p className="text-gray-500 text-base mb-6 max-w-md mx-auto">
              {searchTerm
                ? "Intenta con un término de búsqueda diferente o más específico"
                : "Comienza agregando el primer simpatizante usando el botón de arriba"}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm("")}
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 h-12 px-6 rounded-xl"
              >
                <Search className="w-4 h-4 mr-2" />
                Limpiar búsqueda
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-gray-800">
              ¿Eliminar simpatizante?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-600 mt-2">
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              información de <strong className="text-gray-800">{simpatizanteToDelete?.nombre}</strong> de
              la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-6">
            <AlertDialogCancel 
              onClick={handleDeleteCancel}
              className="w-full sm:w-auto h-12 text-base font-semibold rounded-xl"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 h-12 text-base font-semibold rounded-xl"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SimpatizantesPage;
