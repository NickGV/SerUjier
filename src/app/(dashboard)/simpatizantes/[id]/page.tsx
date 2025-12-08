"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import {
  ArrowLeft,
  User,
  Phone,
  FileText,
  Calendar,
  Edit3,
  Save,
  Trash2,
} from "lucide-react";
import {
  getSimpatizanteById,
  updateSimpatizante,
  deleteSimpatizante,
} from "@/shared/lib/utils";

interface Simpatizante {
  id: string;
  nombre: string;
  telefono?: string;
  notas?: string;
  fechaRegistro: string;
}

const SimpatizanteDetail = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [simpatizante, setSimpatizante] = useState<Simpatizante | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editedData, setEditedData] = useState({
    nombre: "",
    telefono: "",
    notas: "",
  });

  useEffect(() => {
    if (id) {
      const fetchSimpatizante = async () => {
        try {
          const data = await getSimpatizanteById(id);
          setSimpatizante(data);
          setEditedData({
            nombre: data.nombre || "",
            telefono: data.telefono || "",
            notas: data.notas || "",
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
          setLoading(false);
        }
      };

      fetchSimpatizante();
    }
  }, [id]);

  const handleSave = async () => {
    if (!simpatizante) return;

    try {
      await updateSimpatizante(simpatizante.id, editedData);
      setSimpatizante({ ...simpatizante, ...editedData });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    }
  };

  const handleCancel = () => {
    if (simpatizante) {
      setEditedData({
        nombre: simpatizante.nombre || "",
        telefono: simpatizante.telefono || "",
        notas: simpatizante.notas || "",
      });
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!simpatizante) return;

    setIsDeleting(true);
    try {
      await deleteSimpatizante(simpatizante.id);
      router.push("/simpatizantes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Cargando información del simpatizante...
          </p>
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

  if (!simpatizante) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Simpatizante no encontrado
            </h2>
            <p className="text-gray-600 mb-4">
              El simpatizante que buscas no existe o ha sido eliminado.
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
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 md:space-y-8 min-h-screen max-w-full overflow-x-hidden">
      {/* Header with Back Button */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <CardTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <span className="truncate">Detalle del Simpatizante</span>
            </CardTitle>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Card */}
      <Card className="bg-gradient-to-r from-slate-600 to-slate-700 text-white border-0 shadow-lg">
        <CardContent className="p-4 sm:p-6 md:p-8 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold">
              {(isEditing ? editedData.nombre : simpatizante.nombre)
                .charAt(0)
                .toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 px-2">
            {isEditing ? editedData.nombre : simpatizante.nombre}
          </h2>
          <p className="text-slate-200 text-sm sm:text-base md:text-lg px-2">
            {isEditing
              ? editedData.telefono
              : simpatizante.telefono || "Sin teléfono"}
          </p>
        </CardContent>
      </Card>

      {/* Simpatizante Information */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="truncate">Información Personal</span>
            </CardTitle>
            {!isEditing ? (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsEditing(true)}
                className="h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base w-full sm:w-auto"
              >
                <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Editar
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleCancel}
                  className="h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base order-2 sm:order-1"
                >
                  Cancelar
                </Button>
                <Button
                  size="lg"
                  onClick={handleSave}
                  className="bg-slate-600 hover:bg-slate-700 h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base order-1 sm:order-2"
                >
                  <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Guardar
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-4 md:px-6 lg:px-8 space-y-4 sm:space-y-6">
          {/* Name */}
          <div>
            <label className="text-sm sm:text-base font-semibold text-gray-700 flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              Nombre Completo
            </label>
            {isEditing ? (
              <Input
                value={editedData.nombre}
                onChange={(e) =>
                  setEditedData({ ...editedData, nombre: e.target.value })
                }
                className="h-10 sm:h-12 text-sm sm:text-base rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-slate-400"
              />
            ) : (
              <p className="text-gray-800 bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl text-sm sm:text-base">
                {simpatizante.nombre}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm sm:text-base font-semibold text-gray-700 flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              Teléfono
            </label>
            {isEditing ? (
              <Input
                value={editedData.telefono}
                onChange={(e) =>
                  setEditedData({ ...editedData, telefono: e.target.value })
                }
                className="h-10 sm:h-12 text-sm sm:text-base rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-slate-400"
              />
            ) : (
              <p className="text-gray-800 bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl text-sm sm:text-base">
                {simpatizante.telefono || "No registrado"}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm sm:text-base font-semibold text-gray-700 flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              Notas
            </label>
            {isEditing ? (
              <Textarea
                value={editedData.notas}
                onChange={(e) =>
                  setEditedData({ ...editedData, notas: e.target.value })
                }
                className="rounded-lg sm:rounded-xl min-h-[100px] sm:min-h-[120px] text-sm sm:text-base border-2 border-gray-200 focus:border-slate-400"
                placeholder="Agregar notas sobre el simpatizante..."
              />
            ) : (
              <p className="text-gray-800 bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl min-h-[100px] sm:min-h-[120px] text-sm sm:text-base">
                {simpatizante.notas || "Sin notas adicionales"}
              </p>
            )}
          </div>

          {/* Registration Date */}
          <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-semibold text-gray-700">
                Fecha de Registro
              </p>
              <p className="text-gray-600 text-sm sm:text-base">
                {new Date(simpatizante.fechaRegistro).toLocaleDateString(
                  "es-ES",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Info */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
          <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <span className="truncate">Información de Registro</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex flex-col gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
              <span className="text-sm sm:text-base font-semibold text-gray-700">
                Fecha de registro:
              </span>
              <Badge
                variant="outline"
                className="text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1 sm:py-2 w-fit"
              >
                {new Date(simpatizante.fechaRegistro).toLocaleDateString(
                  "es-ES",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </Badge>
            </div>
            <div className="flex flex-col gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
              <span className="text-sm sm:text-base font-semibold text-gray-700">
                Días desde registro:
              </span>
              <Badge
                variant="outline"
                className="bg-blue-100 text-blue-700 border-blue-300 text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1 sm:py-2 w-fit"
              >
                {Math.floor(
                  (new Date().getTime() -
                    new Date(simpatizante.fechaRegistro).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                días
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3 sm:space-y-4">
        {simpatizante.telefono && (
          <Button
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg sm:rounded-xl py-3 sm:py-4 md:py-5 shadow-lg text-sm sm:text-base md:text-lg font-semibold h-12 sm:h-14 md:h-16 transition-all duration-200"
            onClick={() => window.open(`tel:${simpatizante.telefono}`, "_self")}
          >
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 sm:mr-3" />
            Llamar
          </Button>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Button
            variant="outline"
            className="w-full rounded-lg sm:rounded-xl py-3 sm:py-4 md:py-5 bg-transparent h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg font-semibold order-2 sm:order-1"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Volver a la Lista</span>
            <span className="sm:hidden">Volver</span>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full rounded-lg sm:rounded-xl py-3 sm:py-4 md:py-5 h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg font-semibold order-1 sm:order-2"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-1 sm:mr-2" />
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-md w-[95vw] sm:w-full mx-auto">
              <AlertDialogHeader className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Trash2 className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                </div>
                <AlertDialogTitle className="text-lg sm:text-xl font-bold text-gray-800">
                  ¿Eliminar simpatizante?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm sm:text-base text-gray-600 mt-2">
                  Esta acción no se puede deshacer. Se eliminará permanentemente
                  la información de{" "}
                  <strong className="text-gray-800">
                    {simpatizante.nombre}
                  </strong>{" "}
                  de la base de datos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                <AlertDialogCancel className="w-full sm:w-auto h-10 sm:h-12 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl order-2 sm:order-1">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 h-10 sm:h-12 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl order-1 sm:order-2"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default SimpatizanteDetail;
