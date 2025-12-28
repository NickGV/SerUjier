'use client';

import {
  AddSimpatizanteDialog,
  DeleteSimpatizanteDialog,
  EditSimpatizanteDialog,
  SimpatizantesFilters,
  SimpatizantesHeader,
  SimpatizantesList,
} from '@/features/simpatizantes/components/simpatizantes';
import {
  useSimpatizantes,
  type Simpatizante,
} from '@/features/simpatizantes/hooks/use-simpatizantes';
import { useSearch } from '@/shared/hooks/use-search';
import { Button } from '@/shared/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const SimpatizantesPage = () => {
  const {
    simpatizantes,
    loading,
    error,
    isAdding,
    isUpdating,
    isDeleting,
    addSimpatizante,
    updateSimpatizante,
    deleteSimpatizante,
    refreshSimpatizantes,
  } = useSimpatizantes();

  // Search functionality
  const {
    searchTerm,
    setSearchTerm,
    filteredItems: filteredSimpatizantes,
    clearSearch,
  } = useSearch<Simpatizante>({
    items: simpatizantes,
    searchFn: (item, term) =>
      item.nombre.toLowerCase().includes(term.toLowerCase()),
  });

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingSimpatizante, setEditingSimpatizante] =
    useState<Simpatizante | null>(null);
  const [deletingSimpatizante, setDeletingSimpatizante] =
    useState<Simpatizante | null>(null);

  // Handlers
  const handleEdit = (simpatizante: Simpatizante) => {
    setEditingSimpatizante(simpatizante);
    setShowEditDialog(true);
  };

  const handleDelete = (simpatizante: Simpatizante) => {
    setDeletingSimpatizante(simpatizante);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingSimpatizante) {
      await deleteSimpatizante(deletingSimpatizante.id);
      setDeletingSimpatizante(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSimpatizantes();
      toast.success('Datos actualizados exitosamente');
    } catch (_error) {
      toast.error('Error al actualizar los datos');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando simpatizantes...</p>
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
      <SimpatizantesHeader
        totalCount={simpatizantes.length}
        filteredCount={filteredSimpatizantes.length}
        simpatizantes={simpatizantes}
      />

      <SimpatizantesFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearSearch={clearSearch}
        totalCount={simpatizantes.length}
        filteredCount={filteredSimpatizantes.length}
      />

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:text-white rounded-xl py-3 shadow-lg"
        >
          <RefreshCw
            className={`w-5 h-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          {isRefreshing ? 'Actualizando...' : 'Actualizar Datos'}
        </Button>

        <Button
          onClick={() => setShowAddDialog(true)}
          className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl py-3 shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Agregar Nuevo Simpatizante
        </Button>
      </div>

      <SimpatizantesList
        simpatizantes={filteredSimpatizantes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchTerm={searchTerm}
      />

      {/* Dialogs */}
      <AddSimpatizanteDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={addSimpatizante}
        isAdding={isAdding}
      />

      <EditSimpatizanteDialog
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditingSimpatizante(null);
        }}
        simpatizante={editingSimpatizante}
        onUpdate={updateSimpatizante}
        isUpdating={isUpdating}
      />

      <DeleteSimpatizanteDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingSimpatizante(null);
        }}
        simpatizante={deletingSimpatizante}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default SimpatizantesPage;
