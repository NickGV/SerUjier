'use client';

import {
  DeleteVisitaDialog,
  VisitaFormDialog,
  VisitasFilters,
  VisitasHeader,
  VisitasList,
} from '@/features/visitas/components/visitas';
import { useVisitas } from '@/features/visitas/hooks/use-visitas';
import { useSearch } from '@/shared/hooks/use-search';
import { useModulePermissions } from '@/shared/hooks/use-permisos';
import { type Visita } from '@/shared/types';
import { Button } from '@/shared/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const VisitasPage = () => {
  const {
    visitas,
    loading,
    error,
    isAdding,
    isUpdating,
    isDeleting,
    addVisita,
    updateVisita,
    deleteVisita,
    refreshVisitas,
  } = useVisitas();

  // Permisos del módulo visitas
  const {
    canCreate,
    canEdit,
    canDelete,
    isLoading: permisosLoading,
  } = useModulePermissions('visitas');

  // Search functionality
  const {
    searchTerm,
    setSearchTerm,
    filteredItems: filteredVisitas,
    clearSearch,
  } = useSearch<Visita>({
    items: visitas,
    searchFn: (item, term) =>
      item.nombre.toLowerCase().includes(term.toLowerCase()),
  });

  // Dialog states - unified approach
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingVisita, setEditingVisita] = useState<Visita | null>(null);
  const [deletingVisita, setDeletingVisita] = useState<Visita | null>(null);

  // Handlers
  const handleEdit = (visita: Visita) => {
    if (!canEdit) {
      toast.error('No tienes permiso para editar visitas');
      return;
    }
    setEditingVisita(visita);
    setShowFormDialog(true);
  };

  const handleDelete = (visita: Visita) => {
    if (!canDelete) {
      toast.error('No tienes permiso para eliminar visitas');
      return;
    }
    setDeletingVisita(visita);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingVisita) {
      await deleteVisita(deletingVisita.id);
      setDeletingVisita(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshVisitas();
      toast.success('Datos actualizados exitosamente');
    } catch (_error) {
      toast.error('Error al actualizar los datos');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddClick = () => {
    if (!canCreate) {
      toast.error('No tienes permiso para crear visitas');
      return;
    }
    setEditingVisita(null);
    setShowFormDialog(true);
  };

  const handleFormClose = () => {
    setShowFormDialog(false);
    setEditingVisita(null);
  };

  const handleFormSave = async (
    data: Omit<Visita, 'id' | 'fechaRegistro'> & { nombre: string }
  ) => {
    if (editingVisita) {
      // Update existing visita
      await updateVisita(editingVisita.id, data);
    } else {
      // Add new visita
      await addVisita(data);
    }
  };

  if (loading || permisosLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando visitas...</p>
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
      <VisitasHeader
        totalCount={visitas.length}
        filteredCount={filteredVisitas.length}
        visitas={visitas}
      />

      <VisitasFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearSearch={clearSearch}
        totalCount={visitas.length}
        filteredCount={filteredVisitas.length}
      />

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-full bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:text-white rounded-xl py-3 shadow-lg"
        >
          <RefreshCw
            className={`w-5 h-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          {isRefreshing ? 'Actualizando...' : 'Actualizar Datos'}
        </Button>

        {canCreate && (
          <Button
            onClick={handleAddClick}
            className="w-full bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl py-3 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Agregar Nueva Visita
          </Button>
        )}
      </div>

      <VisitasList
        visitas={filteredVisitas}
        onEdit={canEdit ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        searchTerm={searchTerm}
      />

      {/* Unified Form Dialog */}
      {(canCreate || canEdit) && (
        <VisitaFormDialog
          isOpen={showFormDialog}
          onClose={handleFormClose}
          visita={editingVisita}
          onSave={handleFormSave}
          isSaving={isAdding || isUpdating}
        />
      )}

      {/* Delete Dialog */}
      {canDelete && (
        <DeleteVisitaDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setDeletingVisita(null);
          }}
          visita={deletingVisita}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default VisitasPage;
