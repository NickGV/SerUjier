'use client';

import { RoleGuard } from '@/shared/components/role-guard';
import { useUser } from '@/shared/contexts/user-context';
import { sortByNombre } from '@/shared/lib/sort-utils';
import {
  addUjier,
  deleteUjier,
  fetchUjieres,
  updateUjier,
} from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import {
  AlertTriangle,
  Crown,
  Edit3,
  Eye,
  EyeOff,
  Plus,
  Save,
  Search,
  Shield,
  Trash2,
  User,
  UserCog,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Ujier {
  id: string;
  nombre: string;
  password: string;
  rol: 'admin' | 'directiva' | 'ujier';
  activo: boolean;
  fechaCreacion: string;
}

export default function UjieresPage() {
  return (
    <RoleGuard route="ujieres" allowedRoles={['admin', 'directiva']}>
      <UjieresContent />
    </RoleGuard>
  );
}

function UjieresContent() {
  const { user } = useUser();
  const [ujieres, setUjieres] = useState<Ujier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('todos');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUsuario, setNewUsuario] = useState<{
    nombre: string;
    password: string;
    rol: 'admin' | 'directiva' | 'ujier';
  }>({
    nombre: '',
    password: '',
    rol: 'ujier',
  });

  // Estados para edición y eliminación
  const [editingUsuario, setEditingUsuario] = useState<Ujier | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = user?.rol === 'admin';
  const isDirectiva = user?.rol === 'directiva';

  useEffect(() => {
    const loadUjieres = async () => {
      try {
        const data = await fetchUjieres();
        setUjieres(data);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Error cargando usuarios';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    loadUjieres();
  }, []);

  const filteredUsuarios = ujieres.filter((usuario) => {
    const matchesSearch = usuario.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'todos' || usuario.rol === filterRole;
    return matchesSearch && matchesRole;
  });

  // Ordenar usuarios alfabéticamente
  const sortedUsuarios = sortByNombre(filteredUsuarios);

  const roleStats = {
    admin: ujieres.filter((u) => u.rol === 'admin').length,
    directiva: ujieres.filter((u) => u.rol === 'directiva').length,
    ujier: ujieres.filter((u) => u.rol === 'ujier').length,
    activos: ujieres.filter((u) => u.activo).length,
    inactivos: ujieres.filter((u) => !u.activo).length,
  };

  const handleAddUsuario = async () => {
    if (!newUsuario.nombre || !newUsuario.password) return;

    try {
      const nuevoUsuario = {
        ...newUsuario,
        activo: true,
        fechaCreacion: new Date().toISOString(),
      };
      const result = await addUjier(nuevoUsuario);
      setUjieres([...ujieres, { ...nuevoUsuario, id: result.id }]);
      setNewUsuario({ nombre: '', password: '', rol: 'ujier' });
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error('Error adding usuario:', err);
      setError('Error al agregar usuario');
    }
  };

  const toggleUsuarioStatus = async (usuario: Ujier) => {
    if (!isAdmin && !isDirectiva) return;
    if (isDirectiva && usuario.rol === 'admin') return;
    if (usuario.rol === 'admin' || usuario.rol === 'directiva') return;

    try {
      const updatedData = { activo: !usuario.activo };
      await updateUjier(usuario.id, updatedData);
      setUjieres(
        ujieres.map((u) => (u.id === usuario.id ? { ...u, ...updatedData } : u))
      );
    } catch (err) {
      console.error('Error updating usuario:', err);
      setError('Error al actualizar usuario');
    }
  };

  // Función para eliminar usuario (solo admin)
  const handleDeleteUsuario = async (usuarioId: string) => {
    if (!usuarioId || !isAdmin) return;

    setIsDeleting(true);
    try {
      await deleteUjier(usuarioId);
      // Recargar los datos
      const updatedData = await fetchUjieres();
      setUjieres(updatedData);
      setShowDeleteConfirm(null);
      toast.success('Usuario eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      toast.error('Error al eliminar el usuario. Intente nuevamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Función para iniciar edición
  const handleEditUsuario = (usuario: Ujier) => {
    setEditingUsuario({ ...usuario });
  };

  // Función para guardar cambios
  const handleSaveUsuario = async () => {
    if (!editingUsuario) return;

    setIsSaving(true);
    try {
      const { id, ...updateData } = editingUsuario;
      // Excluir fechaCreacion del update ya que no debe cambiar
      await updateUjier(id, updateData);

      // Recargar los datos
      const updatedData = await fetchUjieres();
      setUjieres(updatedData);
      setEditingUsuario(null);
      toast.success('Usuario actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      toast.error('Error al actualizar el usuario. Intente nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Función para cancelar edición
  const handleCancelEdit = () => {
    setEditingUsuario(null);
  };

  const getRoleDisplayName = (rol: string) => {
    switch (rol) {
      case 'admin':
        return 'Administrador';
      case 'directiva':
        return 'Directiva';
      default:
        return 'Ujier';
    }
  };

  const getRoleColor = (rol: string) => {
    switch (rol) {
      case 'admin':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'directiva':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  const getRoleIcon = (rol: string) => {
    switch (rol) {
      case 'admin':
        return <Crown className="w-4 h-4 text-red-600" />;
      case 'directiva':
        return <UserCog className="w-4 h-4 text-blue-600" />;
      default:
        return <User className="w-4 h-4 text-green-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando usuarios...</p>
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
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            Gestión de Usuarios
          </CardTitle>
          <p className="text-sm text-gray-600">
            Administre los usuarios del sistema y sus permisos
          </p>
          {isDirectiva && !isAdmin && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full">
              <Shield className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">
                Permisos limitados
              </span>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Statistics */}
      <Card className="bg-gradient-to-r from-slate-600 to-slate-700 text-white border-0 shadow-lg">
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-base sm:text-lg font-bold">
                {roleStats.admin}
              </div>
              <div className="text-slate-200 text-xs">Admins</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold">
                {roleStats.ujier}
              </div>
              <div className="text-slate-200 text-xs">Ujieres</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold">
                {roleStats.activos}
              </div>
              <div className="text-slate-200 text-xs">Activos</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold">
                {roleStats.inactivos}
              </div>
              <div className="text-slate-200 text-xs">Inactivos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Buscar y Filtrar Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar usuarios por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-lg"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              Filtrar por Rol
            </label>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los roles</SelectItem>
                <SelectItem value="admin">Solo Administradores</SelectItem>
                <SelectItem value="directiva">Solo Directiva</SelectItem>
                <SelectItem value="ujier">Solo Ujieres</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Add Button */}
      {isAdmin && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl py-3 shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Agregar Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <p className="text-sm text-gray-600">
                Complete la información para crear una nueva cuenta de usuario
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Nombre Completo *
                </label>
                <Input
                  placeholder="Ej: Ana María González"
                  value={newUsuario.nombre}
                  onChange={(e) =>
                    setNewUsuario({ ...newUsuario, nombre: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Contraseña Inicial *
                </label>
                <Input
                  type="password"
                  placeholder="Contraseña segura"
                  value={newUsuario.password}
                  onChange={(e) =>
                    setNewUsuario({ ...newUsuario, password: e.target.value })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  El usuario podrá cambiar su contraseña después del primer
                  acceso
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Rol del Usuario *
                </label>
                <Select
                  value={newUsuario.rol}
                  onValueChange={(value: 'admin' | 'directiva' | 'ujier') =>
                    setNewUsuario({ ...newUsuario, rol: value })
                  }
                >
                  <SelectTrigger>
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
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-slate-600 hover:bg-slate-700"
                  onClick={handleAddUsuario}
                  disabled={!newUsuario.nombre || !newUsuario.password}
                >
                  Crear Usuario
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Users List */}
      <div className="space-y-3">
        {sortedUsuarios.map((usuario) => (
          <Card
            key={usuario.id}
            className="bg-white/80 backdrop-blur-sm border-0 shadow-md"
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getRoleIcon(usuario.rol)}
                    <h3 className="font-semibold text-gray-800">
                      {usuario.nombre}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getRoleColor(usuario.rol)}`}
                    >
                      {getRoleDisplayName(usuario.rol)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        usuario.activo
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    Creado:{' '}
                    {new Date(usuario.fechaCreacion).toLocaleDateString(
                      'es-ES',
                      {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }
                    )}
                  </div>
                </div>
                {/* Action buttons */}
                <div className="ml-4 flex gap-2">
                  {/* Botón de activar/desactivar para admin y directiva */}
                  {(isAdmin || isDirectiva) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleUsuarioStatus(usuario);
                      }}
                      disabled={
                        (isDirectiva && usuario.rol === 'admin') ||
                        usuario.rol === 'admin' ||
                        usuario.rol === 'directiva'
                      }
                      className={
                        usuario.activo
                          ? 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200'
                          : 'text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200'
                      }
                    >
                      {usuario.activo ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-1" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          Activar
                        </>
                      )}
                    </Button>
                  )}

                  {/* Botones de editar y eliminar solo para admin */}
                  {isAdmin && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-blue-200 text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEditUsuario(usuario)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => setShowDeleteConfirm(usuario.id)}
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

      {filteredUsuarios.length === 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
          <CardContent className="p-8 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No se encontraron usuarios
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterRole !== 'todos'
                ? 'Intente ajustar los filtros de búsqueda'
                : 'No hay usuarios registrados en el sistema'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Permissions Info */}
      {isDirectiva && !isAdmin && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-orange-900 mb-1">
                  Limitaciones de su rol
                </h3>
                <div className="text-sm text-orange-800 space-y-1">
                  <p>• No puede crear nuevos usuarios (solo administradores)</p>
                  <p>• No puede modificar administradores o directiva</p>
                  <p>
                    • Solo puede activar/desactivar usuarios regulares (ujieres)
                  </p>
                </div>
              </div>
            </div>
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
                ¿Estás seguro de que deseas eliminar este usuario? Esta acción
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
                  onClick={() => handleDeleteUsuario(showDeleteConfirm)}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de edición */}
      {editingUsuario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="w-full max-w-md bg-white max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Editar Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Nombre Completo *
                </label>
                <Input
                  placeholder="Nombre del usuario"
                  value={editingUsuario.nombre}
                  onChange={(e) =>
                    setEditingUsuario({
                      ...editingUsuario,
                      nombre: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Contraseña *
                </label>
                <Input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={editingUsuario.password}
                  onChange={(e) =>
                    setEditingUsuario({
                      ...editingUsuario,
                      password: e.target.value,
                    })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deja en blanco para mantener la contraseña actual
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Rol del Usuario *
                </label>
                <Select
                  value={editingUsuario.rol}
                  onValueChange={(value: 'admin' | 'directiva' | 'ujier') =>
                    setEditingUsuario({ ...editingUsuario, rol: value })
                  }
                >
                  <SelectTrigger>
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

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Estado
                </label>
                <Select
                  value={editingUsuario.activo ? 'activo' : 'inactivo'}
                  onValueChange={(value) =>
                    setEditingUsuario({
                      ...editingUsuario,
                      activo: value === 'activo',
                    })
                  }
                >
                  <SelectTrigger>
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
                  onClick={handleSaveUsuario}
                  disabled={
                    isSaving ||
                    !editingUsuario.nombre.trim() ||
                    !editingUsuario.password.trim()
                  }
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
