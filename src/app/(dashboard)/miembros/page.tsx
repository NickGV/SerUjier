"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/shared/contexts/user-context";
import {
  fetchMiembros,
  addMiembro,
  updateMiembro,
  deleteMiembro,
} from "@/shared/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import {
  UserCheck,
  Search,
  Plus,
  Users,
  User,
  Baby,
  Zap,
  Edit3,
  Trash2,
  Save,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { toast } from "sonner";
import { Miembro } from "@/shared/types";

export default function MiembrosPage() {
  const { user } = useUser();
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMiembro, setNewMiembro] = useState<{
    nombre: string;
    telefono: string;
    categoria: "hermano" | "hermana" | "nino" | "adolescente";
    notas: string;
  }>({
    nombre: "",
    telefono: "",
    categoria: "hermano",
    notas: "",
  });

  // Estados para edición y eliminación
  const [editingMiembro, setEditingMiembro] = useState<Miembro | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadMiembros = async () => {
      try {
        const data = await fetchMiembros();
        setMiembros(data);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Error cargando miembros";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    loadMiembros();
  }, []);

  // Verificar permisos - Solo admin y directiva pueden gestionar miembros
  if (user && user.rol !== "admin" && user.rol !== "directiva") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <UserCheck className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 mb-4">
              No tienes permisos para gestionar miembros. Solo usuarios con rol
              de Administrador o Directiva pueden acceder.
            </p>
            <Button onClick={() => window.history.back()} variant="outline">
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredMiembros = miembros.filter((miembro) => {
    const nombreMatch = miembro.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const categoriaMatch =
      filtroCategoria === "todos" || miembro.categoria === filtroCategoria;
    return nombreMatch && categoriaMatch;
  });

  const addNewMiembro = async () => {
    if (newMiembro.nombre.trim()) {
      try {
        const nuevoMiembro = {
          ...newMiembro,
          fechaRegistro: new Date().toISOString(),
        };
        const result = await addMiembro(nuevoMiembro);
        setMiembros([...miembros, { ...nuevoMiembro, id: result.id }]);
        setNewMiembro({
          nombre: "",
          telefono: "",
          categoria: "hermano",
          notas: "",
        });
        setShowAddDialog(false);
      } catch (err) {
        console.error("Error adding miembro:", err);
        setError("Error al agregar miembro");
      }
    }
  };

  // Función para eliminar miembro
  const handleDeleteMiembro = async (miembroId: string) => {
    if (!miembroId) return;

    setIsDeleting(true);
    try {
      await deleteMiembro(miembroId);
      // Recargar los datos
      const updatedData = await fetchMiembros();
      setMiembros(updatedData);
      setShowDeleteConfirm(null);
      toast.success("Miembro eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar miembro:", error);
      toast.error("Error al eliminar el miembro. Intente nuevamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Función para iniciar edición
  const handleEditMiembro = (miembro: Miembro) => {
    setEditingMiembro({ ...miembro });
  };

  // Función para guardar cambios
  const handleSaveMiembro = async () => {
    if (!editingMiembro) return;

    setIsSaving(true);
    try {
      const { id, ...updateData } = editingMiembro; // fechaRegistro se excluye implícitamente
      // Excluir fechaRegistro del update ya que no debe cambiar usando destructuring
      await updateMiembro(id, updateData);

      // Recargar los datos
      const updatedData = await fetchMiembros();
      setMiembros(updatedData);
      setEditingMiembro(null);
      toast.success("Miembro actualizado exitosamente");
    } catch (error) {
      console.error("Error al actualizar miembro:", error);
      toast.error("Error al actualizar el miembro. Intente nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // Función para cancelar edición
  const handleCancelEdit = () => {
    setEditingMiembro(null);
  };

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case "hermano":
        return <User className="w-4 h-4 text-slate-600" />;
      case "hermana":
        return <Users className="w-4 h-4 text-rose-600" />;
      case "nino":
        return <Baby className="w-4 h-4 text-amber-600" />;
      case "adolescente":
        return <Zap className="w-4 h-4 text-purple-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "hermano":
        return "bg-slate-50 text-slate-700 border-slate-200";
      case "hermana":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "nino":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "adolescente":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    switch (categoria) {
      case "hermano":
        return "Hermano";
      case "hermana":
        return "Hermana";
      case "nino":
        return "Niño";
      case "adolescente":
        return "Adolescente";
      default:
        return categoria;
    }
  };

  const contarPorCategoria = (categoria: string) => {
    return miembros.filter((m) => m.categoria === categoria).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando miembros...</p>
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
              <UserCheck className="w-12 h-12 mx-auto" />
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
            <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            Miembros de la Iglesia
          </CardTitle>
          <div className="flex items-center justify-between mt-2">
            <Badge
              variant="outline"
              className="bg-slate-50 text-slate-700 border-slate-200 text-xs"
            >
              {filteredMiembros.length} miembros
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <Card className="bg-gradient-to-r from-slate-600 to-slate-700 text-white border-0 shadow-lg">
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center">
            <div>
              <div className="text-base sm:text-lg font-bold">
                {contarPorCategoria("hermano")}
              </div>
              <div className="text-slate-200 text-xs">Hermanos</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold">
                {contarPorCategoria("hermana")}
              </div>
              <div className="text-slate-200 text-xs">Hermanas</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold">
                {contarPorCategoria("nino")}
              </div>
              <div className="text-slate-200 text-xs">Niños</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold">
                {contarPorCategoria("adolescente")}
              </div>
              <div className="text-slate-200 text-xs">Adolesc.</div>
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
              placeholder="Buscar miembro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              Categoría
            </label>
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="hermano">Hermanos</SelectItem>
                <SelectItem value="hermana">Hermanas</SelectItem>
                <SelectItem value="nino">Niños</SelectItem>
                <SelectItem value="adolescente">Adolescentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Add New Button */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogTrigger asChild>
          <Button className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl py-3 shadow-lg">
            <Plus className="w-5 h-5 mr-2" />
            Agregar Nuevo Miembro
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Miembro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Nombre Completo *
              </label>
              <Input
                placeholder="Nombre del miembro"
                value={newMiembro.nombre}
                onChange={(e) =>
                  setNewMiembro({ ...newMiembro, nombre: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Categoría *
              </label>
              <Select
                value={newMiembro.categoria}
                onValueChange={(
                  value: "hermano" | "hermana" | "nino" | "adolescente"
                ) => setNewMiembro({ ...newMiembro, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hermano">Hermano</SelectItem>
                  <SelectItem value="hermana">Hermana</SelectItem>
                  <SelectItem value="nino">Niño</SelectItem>
                  <SelectItem value="adolescente">Adolescente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Teléfono
              </label>
              <Input
                placeholder="Número de teléfono"
                value={newMiembro.telefono}
                onChange={(e) =>
                  setNewMiembro({ ...newMiembro, telefono: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Notas
              </label>
              <Input
                placeholder="Notas adicionales"
                value={newMiembro.notas}
                onChange={(e) =>
                  setNewMiembro({ ...newMiembro, notas: e.target.value })
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
                onClick={addNewMiembro}
                disabled={!newMiembro.nombre.trim()}
              >
                Agregar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Members List */}
      <div className="space-y-3">
        {filteredMiembros.map((miembro) => (
          <Card
            key={miembro.id}
            className="bg-white/80 backdrop-blur-sm border-0 shadow-md"
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getCategoriaIcon(miembro.categoria)}
                    <h3 className="font-semibold text-gray-800">
                      {miembro.nombre}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {miembro.telefono}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                    {miembro.notas}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getCategoriaColor(
                        miembro.categoria
                      )}`}
                    >
                      {getCategoriaLabel(miembro.categoria)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Desde:{" "}
                      {new Date(miembro.fechaRegistro).toLocaleDateString(
                        "es-ES"
                      )}
                    </Badge>
                  </div>
                </div>
                <div className="ml-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent hover:bg-slate-50"
                    onClick={() =>
                      (window.location.href = `/miembros/${miembro.id}`)
                    }
                  >
                    Ver Perfil
                  </Button>
                  {user?.rol === "admin" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-blue-200 text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEditMiembro(miembro)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => setShowDeleteConfirm(miembro.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMiembros.length === 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
          <CardContent className="p-8 text-center">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No se encontraron miembros
            </h3>
            <p className="text-gray-500">
              {searchTerm || filtroCategoria !== "todos"
                ? "Intenta con un término de búsqueda diferente"
                : "Aún no hay miembros registrados"}
            </p>
          </CardContent>
        </Card>
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
                ¿Estás seguro de que deseas eliminar este miembro? Esta acción
                no se puede deshacer.
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
                  onClick={() => handleDeleteMiembro(showDeleteConfirm)}
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
      {editingMiembro && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="w-full max-w-md bg-white max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Editar Miembro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Nombre Completo *
                </label>
                <Input
                  placeholder="Nombre del miembro"
                  value={editingMiembro.nombre}
                  onChange={(e) =>
                    setEditingMiembro({
                      ...editingMiembro,
                      nombre: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Categoría *
                </label>
                <Select
                  value={editingMiembro.categoria}
                  onValueChange={(
                    value: "hermano" | "hermana" | "nino" | "adolescente"
                  ) =>
                    setEditingMiembro({ ...editingMiembro, categoria: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hermano">Hermano</SelectItem>
                    <SelectItem value="hermana">Hermana</SelectItem>
                    <SelectItem value="nino">Niño</SelectItem>
                    <SelectItem value="adolescente">Adolescente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Teléfono
                </label>
                <Input
                  placeholder="Número de teléfono"
                  value={editingMiembro.telefono || ""}
                  onChange={(e) =>
                    setEditingMiembro({
                      ...editingMiembro,
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
                  value={editingMiembro.notas || ""}
                  onChange={(e) =>
                    setEditingMiembro({
                      ...editingMiembro,
                      notas: e.target.value,
                    })
                  }
                />
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
                  onClick={handleSaveMiembro}
                  disabled={isSaving || !editingMiembro.nombre.trim()}
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
