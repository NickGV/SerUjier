'use client';

import {
  DeleteAmigoDialog,
  AmigosFormDialog,
  AmigosFilters,
  AmigosHeader,
  AmigosList,
} from '@/features/amigos/components/amigos';
import { useAmigos } from '@/features/amigos/hooks/use-amigos';
import { useModulePermissions } from '@/shared/hooks/use-permisos';
import { useSearch } from '@/shared/hooks/use-search';
import { type Amigo } from '@/types/amigos';
import { Button } from '@/shared/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const AmigosListPage = () => {
  const {
    amigos,
    loading,
    error,
    isAdding,
    isUpdating,
    isDeleting,
    addAmigo,
    updateAmigo,
    deleteAmigo,
    refreshAmigos,
  } = useAmigos();

  // Permisos del módulo amigos
  const {
    canCreate,
    canEdit,
    canDelete,
    isLoading: permisosLoading,
  } = useModulePermissions('amigos');

  // Search functionality
  const {
    searchTerm,
    setSearchTerm,
    filteredItems: filteredAmigos,
    clearSearch,
  } = useSearch<Amigo>({
    items: amigos,
    searchFn: (item, term) =>
      item.nombre.toLowerCase().includes(term.toLowerCase()),
  });

  // Dialog states - unified approach
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingAmigo, setEditingAmigo] = useState<Amigo | null>(null);
  const [deletingAmigo, setDeletingAmigo] = useState<Amigo | null>(null);

  // Handlers
  const handleEdit = (amigo: Amigo) => {
    if (!canEdit) {
      toast.error('No tienes permiso para editar amigos');
      return;
    }
    setEditingAmigo(amigo);
    setShowFormDialog(true);
  };

  const handleDelete = (amigo: Amigo) => {
    if (!canDelete) {
      toast.error('No tienes permiso para eliminar amigos');
      return;
    }
    setDeletingAmigo(amigo);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingAmigo) {
      await deleteAmigo(deletingAmigo.id);
      setDeletingAmigo(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAmigos();
      toast.success('Datos actualizados exitosamente');
    } catch (_error) {
      toast.error('Error al actualizar los datos');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddClick = () => {
    if (!canCreate) {
      toast.error('No tienes permiso para crear amigos');
      return;
    }
    setEditingAmigo(null);
    setShowFormDialog(true);
  };

  const handleFormClose = () => {
    setShowFormDialog(false);
    setEditingAmigo(null);
  };

  const handleFormSave = async (
    data: Omit<Amigo, 'id' | 'fechaRegistro'> & { nombre: string }
  ) => {
    if (editingAmigo) {
      // Update existing amigo
      await updateAmigo(editingAmigo.id, data);
    } else {
      // Add new amigo
      await addAmigo(data);
    }
  };

  if (loading || permisosLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando amigos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 pb-24 md:pb-28 space-y-4 sm:space-y-6 min-h-screen max-w-full overflow-x-hidden">
      <AmigosHeader
        totalCount={amigos.length}
        filteredCount={filteredAmigos.length}
        amigos={amigos}
      />

      <AmigosFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearSearch={clearSearch}
        totalCount={amigos.length}
        filteredCount={filteredAmigos.length}
      />

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-full bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white hover:text-white rounded-xl py-3 shadow-lg"
        >
          <RefreshCw
            className={`w-5 h-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          {isRefreshing ? 'Actualizando...' : 'Actualizar Datos'}
        </Button>

        {canCreate && (
          <Button
            onClick={handleAddClick}
            className="w-full bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl py-3 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Agregar Nuevo Amigo
          </Button>
        )}
      </div>

      <AmigosList
        amigos={filteredAmigos}
        onEdit={canEdit ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        searchTerm={searchTerm}
      />

      {/* Unified Form Dialog */}
      {(canCreate || canEdit) && (
        <AmigosFormDialog
          isOpen={showFormDialog}
          onClose={handleFormClose}
          amigo={editingAmigo}
          onSave={handleFormSave}
          isSaving={isAdding || isUpdating}
        />
      )}

      {/* Delete Dialog */}
      {canDelete && (
        <DeleteAmigoDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setDeletingAmigo(null);
          }}
          amigo={deletingAmigo}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default AmigosListPage;
