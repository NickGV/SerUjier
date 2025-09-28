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
import { Users, Search, Plus, User, Trash2, Edit3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 min-h-screen max-w-full overflow-x-hidden">
      {/* Header */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            Simpatizantes de la Iglesia
          </CardTitle>
          <div className="flex items-center justify-between mt-2">
            <Badge
              variant="outline"
              className="bg-slate-50 text-slate-700 border-slate-200 text-xs"
            >
              {filteredSimpatizantes.length} simpatizantes
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <Card className="bg-gradient-to-r from-slate-600 to-slate-700 text-white border-0 shadow-lg">
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-1 sm:gap-2 text-center">
            <div>
              <p className="text-xs text-slate-200">Total</p>
              <p className="text-lg sm:text-xl font-bold">
                {simpatizantes.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-200">Con Teléfono</p>
              <p className="text-lg sm:text-xl font-bold">
                {
                  simpatizantes.filter((s) => s.telefono && s.telefono.trim())
                    .length
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar simpatizante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-lg"
            />
          </div>
          {searchTerm && (
            <div className="text-xs text-gray-600">
              {filteredSimpatizantes.length} de {simpatizantes.length}{" "}
              simpatizantes encontrados
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Button */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogTrigger asChild>
          <Button className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl py-3 shadow-lg">
            <Plus className="w-5 h-5 mr-2" />
            Agregar Nuevo Simpatizante
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Simpatizante</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Nombre *
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
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={addNewSimpatizante}
                disabled={!newSimpatizante.nombre.trim()}
                className="flex-1 bg-slate-600 hover:bg-slate-700"
              >
                Agregar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Simpatizantes List */}
      <div className="space-y-3">
        {filteredSimpatizantes.map((simpatizante) => (
          <Card
            key={simpatizante.id}
            className="bg-white/80 backdrop-blur-sm border-0 shadow-md cursor-pointer"
            onClick={() => router.push(`/simpatizantes/${simpatizante.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between">
                <div className="flex flex-col gap-4">
                  {/* Avatar con ícono de persona */}
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-black" />
                    <h3 className="font-semibold text-gray-900 text-base mb-1">
                      {simpatizante.nombre}
                    </h3>
                  </div>

                  {/* Información del simpatizante */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600">
                      {simpatizante.notas || "Sin notas"}
                    </p>

                    {/* Badge y fecha en la misma línea */}
                    <div className="flex items-center gap-3 mt-2">
                      <Badge
                        variant="secondary"
                        className="bg-pink-50 text-pink-700 border-pink-200 text-xs px-2 py-1"
                      >
                        Simpatizante
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Desde:{" "}
                        {new Date(
                          simpatizante.fechaRegistro
                        ).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3   hover:bg-blue-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/simpatizantes/${simpatizante.id}`);
                    }}
                  >
                    Ver Perfil
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(simpatizante);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSimpatizantes.length === 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No se encontraron simpatizantes
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Intenta con un término de búsqueda diferente o más específico"
                : "Comienza agregando el primer simpatizante usando el botón de arriba"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar simpatizante?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              información de <strong>{simpatizanteToDelete?.nombre}</strong> de
              la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
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
