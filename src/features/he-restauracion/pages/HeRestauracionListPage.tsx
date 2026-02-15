'use client';

import {
  DeleteHeRestauracionDialog,
  HeRestauracionFormDialog,
  HeRestauracionFilters,
  HeRestauracionHeader,
  HeRestauracionList,
} from '@/features/he-restauracion/components/he-restauracion';
import { useHeRestauracion } from '@/features/he-restauracion/hooks/use-he-restauracion';
import { useSearch } from '@/shared/hooks/use-search';
import { useModulePermissions } from '@/shared/hooks/use-permisos';
import { type HeRestauracion } from '@/shared/types';
import { Button } from '@/shared/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const HeRestauracionPage = () => {
  const {
    heRestauracion,
    loading,
    error,
    isAdding,
    isUpdating,
    isDeleting,
    addHeRestauracion,
    updateHeRestauracion,
    deleteHeRestauracion,
    refreshHeRestauracion,
  } = useHeRestauracion();

  // Permisos del módulo heRestauracion
  const {
    canCreate,
    canEdit,
    canDelete,
    isLoading: permisosLoading,
  } = useModulePermissions('heRestauracion');

  // Search functionality
  const {
    searchTerm,
    setSearchTerm,
    filteredItems: filteredHeRestauracion,
    clearSearch,
  } = useSearch<HeRestauracion>({
    items: heRestauracion,
    searchFn: (item, term) =>
      item.nombre.toLowerCase().includes(term.toLowerCase()),
  });

  // Dialog states - unified approach
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingHeRestauracion, setEditingHeRestauracion] =
    useState<HeRestauracion | null>(null);
  const [deletingHeRestauracion, setDeletingHeRestauracion] =
    useState<HeRestauracion | null>(null);

  // Handlers
  const handleEdit = (item: HeRestauracion) => {
    if (!canEdit) {
      toast.error('No tienes permiso para editar hermanos en restauración');
      return;
    }
    setEditingHeRestauracion(item);
    setShowFormDialog(true);
  };

  const handleDelete = (item: HeRestauracion) => {
    if (!canDelete) {
      toast.error('No tienes permiso para eliminar hermanos en restauración');
      return;
    }
    setDeletingHeRestauracion(item);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingHeRestauracion) {
      await deleteHeRestauracion(deletingHeRestauracion.id);
      setDeletingHeRestauracion(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshHeRestauracion();
      toast.success('Datos actualizados exitosamente');
    } catch (_error) {
      toast.error('Error al actualizar los datos');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddClick = () => {
    if (!canCreate) {
      toast.error('No tienes permiso para crear hermanos en restauración');
      return;
    }
    setEditingHeRestauracion(null);
    setShowFormDialog(true);
  };

  const handleFormClose = () => {
    setShowFormDialog(false);
    setEditingHeRestauracion(null);
  };

  const handleFormSave = async (
    data: Omit<HeRestauracion, 'id' | 'fechaRegistro'> & { nombre: string }
  ) => {
    if (editingHeRestauracion) {
      // Update existing
      await updateHeRestauracion(editingHeRestauracion.id, data);
    } else {
      // Add new
      await addHeRestauracion(data);
    }
  };

  if (loading || permisosLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando hermanos en restauración...</p>
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
      <HeRestauracionHeader
        totalCount={heRestauracion.length}
        filteredCount={filteredHeRestauracion.length}
        heRestauracion={heRestauracion}
      />

      <HeRestauracionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearSearch={clearSearch}
        totalCount={heRestauracion.length}
        filteredCount={filteredHeRestauracion.length}
      />

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white hover:text-white rounded-xl py-3 shadow-lg"
        >
          <RefreshCw
            className={`w-5 h-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          {isRefreshing ? 'Actualizando...' : 'Actualizar Datos'}
        </Button>

        {canCreate && (
          <Button
            onClick={handleAddClick}
            className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl py-3 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Agregar Nuevo Hermano en Restauración
          </Button>
        )}
      </div>

      <HeRestauracionList
        heRestauracion={filteredHeRestauracion}
        onEdit={canEdit ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        searchTerm={searchTerm}
      />

      {/* Unified Form Dialog */}
      {(canCreate || canEdit) && (
        <HeRestauracionFormDialog
          isOpen={showFormDialog}
          onClose={handleFormClose}
          heRestauracion={editingHeRestauracion}
          onSave={handleFormSave}
          isSaving={isAdding || isUpdating}
        />
      )}

      {/* Delete Dialog */}
      {canDelete && (
        <DeleteHeRestauracionDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setDeletingHeRestauracion(null);
          }}
          heRestauracion={deletingHeRestauracion}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default HeRestauracionPage;
