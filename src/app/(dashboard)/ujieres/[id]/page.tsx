"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { getUjierById, updateUjier } from "@/lib/utils";
import { RoleGuard } from "@/components/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Crown,
  UserCog,
  User,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";

interface Ujier {
  id: string;
  nombre: string;
  password: string;
  rol: "admin" | "directiva" | "ujier";
  activo: boolean;
  fechaCreacion: string;
}

export default function UjierDetailPage() {
  return (
    <RoleGuard route="ujieres" allowedRoles={["admin", "directiva"]}>
      <UjierDetailContent />
    </RoleGuard>
  );
}

function UjierDetailContent() {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [ujier, setUjier] = useState<Ujier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editedUsuario, setEditedUsuario] = useState<{
    nombre: string;
    password: string;
    rol: "admin" | "directiva" | "ujier";
    activo: boolean;
  }>({
    nombre: "",
    password: "",
    rol: "ujier",
    activo: true,
  });

  const isAdmin = user?.rol === "admin";
  const isDirectiva = user?.rol === "directiva";

  // Determinar qué campos puede editar cada rol
  const canEditFullProfile = isAdmin;
  const canToggleStatus =
    (isAdmin || isDirectiva) &&
    ujier &&
    !(ujier.rol === "admin" || ujier.rol === "directiva");

  useEffect(() => {
    if (id) {
      const fetchUjier = async () => {
        try {
          const data = await getUjierById(id);
          if (data) {
            setUjier(data);
            setEditedUsuario({
              nombre: data.nombre,
              password: data.password,
              rol: data.rol,
              activo: data.activo,
            });
          } else {
            setError("Usuario no encontrado");
          }
        } catch (err) {
          const msg =
            err instanceof Error
              ? err.message
              : "Error cargando detalles del usuario";
          setError(msg);
        } finally {
          setLoading(false);
        }
      };

      fetchUjier();
    }
  }, [id]);

  // Verificar permisos - Solo admin y directiva pueden ver detalles de ujieres
  if (user && user.rol === "ujier") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Shield className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 mb-4">
              No tienes permisos para ver detalles de usuarios. Solo usuarios
              con rol de Directiva o Administrador pueden acceder.
            </p>
            <Button onClick={() => router.back()} variant="outline">
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    if (!ujier) return;

    try {
      const dataToUpdate: Partial<Ujier> = {};

      if (canEditFullProfile) {
        // Admin puede cambiar todo
        dataToUpdate.nombre = editedUsuario.nombre;
        dataToUpdate.password = editedUsuario.password;
        dataToUpdate.rol = editedUsuario.rol;
        dataToUpdate.activo = editedUsuario.activo;
      } else if (canToggleStatus) {
        // Directiva solo puede cambiar el estado activo
        dataToUpdate.activo = editedUsuario.activo;
      }

      await updateUjier(ujier.id, dataToUpdate);
      router.back();
    } catch (err) {
      console.error("Error updating usuario:", err);
      setError("Error al actualizar usuario");
    }
  };

  const getRoleIcon = (rol: string) => {
    switch (rol) {
      case "admin":
        return <Crown className="w-6 h-6 text-red-600" />;
      case "directiva":
        return <UserCog className="w-6 h-6 text-blue-600" />;
      default:
        return <User className="w-6 h-6 text-green-600" />;
    }
  };

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case "admin":
        return "bg-red-50 text-red-700 border-red-200";
      case "directiva":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-green-50 text-green-700 border-green-200";
    }
  };

  const getRoleDisplayName = (rol: string) => {
    switch (rol) {
      case "admin":
        return "Administrador";
      case "directiva":
        return "Directiva";
      default:
        return "Ujier";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles del usuario...</p>
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
              <Shield className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Intentar de nuevo
              </Button>
              <Button onClick={() => router.back()}>Volver</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!ujier) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Usuario no encontrado
            </h2>
            <p className="text-gray-600 mb-4">
              El usuario que buscas no existe o ha sido eliminado.
            </p>
            <Button onClick={() => router.back()}>Volver a la lista</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 min-h-screen max-w-4xl mx-auto">
      {/* Header */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="px-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div className="flex items-center gap-3">
              {getRoleIcon(ujier.rol)}
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                  {ujier.nombre}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className={`text-xs ${getRoleBadgeColor(ujier.rol)}`}
                  >
                    {getRoleDisplayName(ujier.rol)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      ujier.activo
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {ujier.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Permission Notice */}
      {!canEditFullProfile && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-700">
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">
                {isDirectiva
                  ? "Permisos limitados: Solo puedes activar/desactivar usuarios regulares"
                  : "Sin permisos de edición"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Details Form */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Información del Usuario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nombre */}
          <div>
            <Label htmlFor="nombre" className="text-sm font-medium">
              Nombre Completo
            </Label>
            <Input
              id="nombre"
              value={editedUsuario.nombre}
              onChange={(e) =>
                setEditedUsuario({ ...editedUsuario, nombre: e.target.value })
              }
              disabled={!canEditFullProfile}
              className={!canEditFullProfile ? "bg-gray-50" : ""}
            />
          </div>

          {/* Contraseña */}
          <div>
            <Label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              value={editedUsuario.password}
              onChange={(e) =>
                setEditedUsuario({ ...editedUsuario, password: e.target.value })
              }
              disabled={!canEditFullProfile}
              className={!canEditFullProfile ? "bg-gray-50" : ""}
            />
            {canEditFullProfile && (
              <p className="text-xs text-gray-500 mt-1">
                Deja en blanco para mantener la contraseña actual
              </p>
            )}
          </div>

          {/* Rol */}
          <div>
            <Label htmlFor="rol" className="text-sm font-medium">
              Rol
            </Label>
            <Select
              value={editedUsuario.rol}
              onValueChange={(value: "admin" | "directiva" | "ujier") =>
                setEditedUsuario({ ...editedUsuario, rol: value })
              }
              disabled={!canEditFullProfile}
            >
              <SelectTrigger
                className={!canEditFullProfile ? "bg-gray-50" : ""}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ujier">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="font-medium">Ujier</div>
                      <div className="text-xs text-gray-500">
                        Acceso básico: conteo y simpatizantes
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="directiva">
                  <div className="flex items-center gap-2">
                    <UserCog className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-medium">Directiva</div>
                      <div className="text-xs text-gray-500">
                        Acceso a reportes y gestión limitada
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-red-600" />
                    <div>
                      <div className="font-medium">Administrador</div>
                      <div className="text-xs text-gray-500">
                        Acceso completo al sistema
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estado Activo */}
          <div>
            <Label htmlFor="activo" className="text-sm font-medium">
              Estado
            </Label>
            <Select
              value={editedUsuario.activo ? "activo" : "inactivo"}
              onValueChange={(value) =>
                setEditedUsuario({
                  ...editedUsuario,
                  activo: value === "activo",
                })
              }
              disabled={!canToggleStatus}
            >
              <SelectTrigger className={!canToggleStatus ? "bg-gray-50" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-green-600" />
                    Activo
                  </div>
                </SelectItem>
                <SelectItem value="inactivo">
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-red-600" />
                    Inactivo
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {!canToggleStatus && (
              <p className="text-xs text-gray-500 mt-1">
                {ujier.rol === "admin" || ujier.rol === "directiva"
                  ? "Los administradores y directiva no pueden ser desactivados"
                  : "Sin permisos para cambiar el estado"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Information */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Información Adicional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">ID de Usuario:</span>
            <span className="text-sm font-mono">{ujier.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Fecha de Creación:</span>
            <span className="text-sm">
              {new Date(ujier.fechaCreacion).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="text-sm text-gray-600">Permisos:</span>
            <div className="text-sm max-w-xs">
              {ujier.rol === "admin" && "Acceso completo al sistema"}
              {ujier.rol === "directiva" &&
                "Dashboard, conteo, simpatizantes, historial, usuarios (limitado)"}
              {ujier.rol === "ujier" && "Solo conteo y simpatizantes"}
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Contraseña:</span>
            <span className="text-sm font-mono">{ujier.password}</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleSave}
          className="flex-1 bg-slate-600 hover:bg-slate-700"
          disabled={!canEditFullProfile && !canToggleStatus}
        >
          <Save className="w-4 h-4 mr-2" />
          Guardar Cambios
        </Button>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex-1 bg-transparent"
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
