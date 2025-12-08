"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useUser } from "@/shared/contexts/user-context";
import { toast } from "sonner";
import { getMiembroById, updateMiembro, deleteMiembro } from "@/shared/lib/utils";
import {
  ArrowLeft,
  UserCheck,
  Phone,
  FileText,
  Calendar,
  User,
  Users,
  Baby,
  Zap,
  Edit3,
  Trash2,
  Save,
  X,
  AlertTriangle,
} from "lucide-react";

interface Miembro {
  id: string;
  nombre: string;
  telefono?: string;
  categoria: "hermano" | "hermana" | "nino" | "adolescente";
  notas?: string;
  fechaRegistro: string;
}

const MiembroDetail = () => {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [miembro, setMiembro] = useState<Miembro | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para edición y eliminación
  const [editingMiembro, setEditingMiembro] = useState<Miembro | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchMiembro = async () => {
        try {
          const data = await getMiembroById(id);
          setMiembro(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
          setLoading(false);
        }
      };

      fetchMiembro();
    }
  }, [id]);

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case "hermano":
        return <User className="w-6 h-6 text-slate-600" />;
      case "hermana":
        return <Users className="w-6 h-6 text-rose-600" />;
      case "nino":
        return <Baby className="w-6 h-6 text-amber-600" />;
      case "adolescente":
        return <Zap className="w-6 h-6 text-purple-600" />;
      default:
        return <User className="w-6 h-6 text-gray-600" />;
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

  // Función para eliminar miembro
  const handleDeleteMiembro = async () => {
    if (!miembro) return;

    setIsDeleting(true);
    try {
      await deleteMiembro(miembro.id);
      toast.success("Miembro eliminado exitosamente");
      router.push("/miembros");
    } catch (error) {
      console.error("Error al eliminar miembro:", error);
      toast.error("Error al eliminar el miembro. Intente nuevamente.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Función para iniciar edición
  const handleEditMiembro = () => {
    if (miembro) {
      setEditingMiembro({ ...miembro });
    }
  };

  // Función para guardar cambios
  const handleSaveMiembro = async () => {
    if (!editingMiembro) return;

    setIsSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: miembroId, fechaRegistro, ...updateData } = editingMiembro;
      // Excluir fechaRegistro del update ya que no debe cambiar
      await updateMiembro(miembroId, updateData);

      // Actualizar el estado local
      setMiembro(editingMiembro);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del miembro...</p>
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
            <Button onClick={() => router.back()} variant="outline">
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!miembro) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Miembro no encontrado
            </h2>
            <p className="text-gray-600 mb-4">
              El miembro que buscas no existe o ha sido eliminado.
            </p>
            <Button onClick={() => router.back()} variant="outline">
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 min-h-screen max-w-full overflow-x-hidden">
      {/* Header with Back Button */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="px-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              Detalle del Miembro
            </CardTitle>
          </div>
        </CardHeader>
      </Card>

      {/* Miembro Information */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="px-3 sm:px-6">
          <div className="flex items-center gap-3">
            {getCategoriaIcon(miembro.categoria)}
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">
                {miembro.nombre}
              </CardTitle>
              <Badge
                variant="outline"
                className={`w-fit mt-1 ${getCategoriaColor(miembro.categoria)}`}
              >
                {getCategoriaLabel(miembro.categoria)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 space-y-4">
          {/* Phone */}
          {miembro.telefono && (
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Teléfono</p>
                <p className="text-gray-600">{miembro.telefono}</p>
              </div>
            </div>
          )}

          {/* Registration Date */}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                Fecha de Registro
              </p>
              <p className="text-gray-600">
                {new Date(miembro.fechaRegistro).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Notes */}
          {miembro.notas && (
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-500 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-1">Notas</p>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {miembro.notas}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <Card className="bg-gradient-to-r from-slate-600 to-slate-700 text-white border-0 shadow-lg">
        <CardContent className="p-3 sm:p-4">
          <h3 className="text-sm font-medium text-slate-200 mb-3">
            Información de Membresía
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold">
                {Math.floor(
                  (new Date().getTime() -
                    new Date(miembro.fechaRegistro).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}
              </div>
              <div className="text-slate-200 text-xs">Días como miembro</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">Activo</div>
              <div className="text-slate-200 text-xs">Estado</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-3 sm:p-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              Volver a la Lista
            </Button>
            {user?.rol === "admin" && (
              <>
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={handleEditMiembro}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

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
                ¿Estás seguro de que deseas eliminar a <strong>{miembro?.nombre}</strong>? Esta acción
                no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleDeleteMiembro}
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
};

export default MiembroDetail;
