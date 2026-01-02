'use client';

import { SelectableListDialog, type SelectableItem } from '@/shared/components';
import { Button, Input } from '@/shared/ui';
import { Plus, User, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { type SimpatizanteLite } from '../types';

export interface SimpatizantesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  simpatizantes: SimpatizanteLite[];
  simpatizantesDelDia: SimpatizanteLite[];
  baseSimpatizantes: SimpatizanteLite[];
  onAddSimpatizantes: (items: SimpatizanteLite[]) => void;
  onAddNewSimpatizante: (
    data: Omit<SimpatizanteLite, 'id'> & { nombre: string }
  ) => Promise<void>;
  onRemoveSimpatizante: (id: string) => void;
  onClearAllSimpatizantes: () => void;
}

export function SimpatizantesDialog({
  isOpen,
  onClose,
  simpatizantes,
  simpatizantesDelDia,
  baseSimpatizantes,
  onAddSimpatizantes,
  onAddNewSimpatizante,
  onRemoveSimpatizante,
  onClearAllSimpatizantes,
}: SimpatizantesDialogProps) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSimpatizante, setNewSimpatizante] = useState({
    nombre: '',
    telefono: '',
    notas: '',
  });
  const [isAdding, setIsAdding] = useState(false);

  // Reset form when dialog closes
  const handleClose = () => {
    setShowNewForm(false);
    setNewSimpatizante({ nombre: '', telefono: '', notas: '' });
    onClose();
  };

  // Handle adding new simpatizante
  const handleAddNewSimpatizante = async () => {
    if (!newSimpatizante.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    setIsAdding(true);
    try {
      await onAddNewSimpatizante(newSimpatizante);
      setNewSimpatizante({ nombre: '', telefono: '', notas: '' });
      setShowNewForm(false);
      toast.success('Simpatizante agregado exitosamente');
    } catch (error) {
      console.error('Error adding simpatizante:', error);
      toast.error('Error al agregar simpatizante');
    } finally {
      setIsAdding(false);
    }
  };

  // Render form for new simpatizante
  const renderNewSimpatizanteForm = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 text-blue-800 text-sm font-medium">
          <Plus className="w-4 h-4" />
          Nuevo Simpatizante
        </div>
        <p className="text-blue-600 text-xs mt-1">
          Complete la información del simpatizante
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
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
          className="h-10 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
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
          className="h-10 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
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
          className="h-10 text-sm"
        />
      </div>

      <div className="flex gap-2 pt-3 border-t">
        <Button
          variant="outline"
          className="flex-1 bg-transparent h-10 text-sm"
          onClick={() => setShowNewForm(false)}
        >
          <X className="w-4 h-4 mr-1" />
          Volver
        </Button>
        <Button
          className="flex-1 bg-slate-600 hover:bg-slate-700 h-10 text-sm"
          onClick={handleAddNewSimpatizante}
          disabled={!newSimpatizante.nombre.trim() || isAdding}
        >
          <Plus className="w-4 h-4 mr-1" />
          {isAdding ? 'Agregando...' : 'Agregar'}
        </Button>
      </div>
    </div>
  );

  // Custom avatar for simpatizantes
  const renderSimpatizanteAvatar = (_item: SelectableItem) => (
    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
      <User className="w-5 h-5 text-pink-600" />
    </div>
  );

  return (
    <SelectableListDialog<SimpatizanteLite>
      isOpen={isOpen}
      onClose={handleClose}
      items={simpatizantes}
      selectedItems={simpatizantesDelDia}
      baseItems={baseSimpatizantes}
      title="Agregar Simpatizantes"
      searchPlaceholder="Buscar simpatizante por nombre..."
      _itemTypeName="simpatizante"
      itemTypeNamePlural="simpatizantes"
      onAddItems={onAddSimpatizantes}
      onRemoveItem={onRemoveSimpatizante}
      onClearAllItems={onClearAllSimpatizantes}
      onAddNewItem={showNewForm ? renderNewSimpatizanteForm : undefined}
      renderAvatar={renderSimpatizanteAvatar}
      getItemColor={() => 'bg-pink-100'}
      showAddNewButton={true}
    />
  );
}
