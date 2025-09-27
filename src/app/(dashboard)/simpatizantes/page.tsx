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
import { Users, Search, Plus, Trash2, MoreVertical } from "lucide-react";
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
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 min-h-screen max-w-full overflow-x-hidden">
      {/* Header */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            Simpatizantes
          </CardTitle>
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="bg-slate-50 text-slate-700 border-slate-200 text-xs"
            >
              {filteredSimpatizantes.length} registrados
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Search */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
        <CardContent className="p-3 sm:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
            <Input
              placeholder="Buscar simpatizante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 sm:pl-10 rounded-lg h-8 sm:h-9 text-xs sm:text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add New Button */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogTrigger asChild>
          <Button className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl py-2 sm:py-3 shadow-lg text-sm sm:text-base">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Agregar Nuevo Simpatizante
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Simpatizante</DialogTitle>
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setShowAddDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-slate-600 hover:bg-slate-700"
                onClick={addNewSimpatizante}
                disabled={!newSimpatizante.nombre.trim()}
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
            className="bg-white/80 backdrop-blur-sm border-0 shadow-md"
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base truncate">
                    {simpatizante.nombre}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">
                    {simpatizante.telefono}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {simpatizante.notas}
                  </p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      Registrado:{" "}
                      {new Date(simpatizante.fechaRegistro).toLocaleDateString(
                        "es-ES"
                      )}
                    </Badge>
                  </div>
                </div>
                <div className="ml-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                    onClick={() =>
                      router.push(`/simpatizantes/${simpatizante.id}`)
                    }
                  >
                    Ver Perfil
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs bg-transparent p-2"
                      >
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(simpatizante)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                ? "Intenta con un término de búsqueda diferente"
                : "Aún no hay simpatizantes registrados"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
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
