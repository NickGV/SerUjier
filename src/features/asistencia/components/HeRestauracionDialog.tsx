'use client';

import { SelectableListDialog, type SelectableItem } from '@/shared/components';
import { Button, Input } from '@/shared/ui';
import { HeartHandshake, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { type HeRestauracion } from '@/shared/types';

export interface HeRestauracionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  heRestauracion: HeRestauracion[];
  heRestauracionDelDia: Array<{ id: string; nombre: string }>;
  baseHeRestauracion: Array<{ id: string; nombre: string }>;
  onAddHeRestauracion: (items: HeRestauracion[]) => void;
  onAddNewHeRestauracion: (
    data: Omit<HeRestauracion, 'id'> & { nombre: string }
  ) => Promise<void>;
  onRemoveHeRestauracion: (id: string) => void;
  onClearAllHeRestauracion: () => void;
}

export function HeRestauracionDialog({
  isOpen,
  onClose,
  heRestauracion,
  heRestauracionDelDia,
  baseHeRestauracion,
  onAddHeRestauracion,
  onAddNewHeRestauracion,
  onRemoveHeRestauracion,
  onClearAllHeRestauracion,
}: HeRestauracionDialogProps) {
  const [newHeRestauracion, setNewHeRestauracion] = useState({
    nombre: '',
    telefono: '',
    notas: '',
  });

  // Reset form when dialog closes
  const handleClose = () => {
    setNewHeRestauracion({ nombre: '', telefono: '', notas: '' });
    onClose();
  };

  // Handle adding new heRestauracion
  const handleAddNewHeRestauracion = async () => {
    if (!newHeRestauracion.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      await onAddNewHeRestauracion(newHeRestauracion);
      setNewHeRestauracion({ nombre: '', telefono: '', notas: '' });
      toast.success('Hermano en restauración agregado exitosamente');
    } catch (error) {
      console.error('Error adding heRestauracion:', error);
      toast.error('Error al agregar hermano en restauración');
    }
  };

  // Render form for new heRestauracion
  const renderNewHeRestauracionForm = () => (
    <div className="space-y-4">
      <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
        <div className="flex items-center gap-2 text-orange-800 text-sm font-medium">
          <Plus className="w-4 h-4" />
          Nuevo Hermano en Restauración
        </div>
        <p className="text-orange-600 text-xs mt-1">
          Complete la información del hermano
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Nombre Completo *
        </label>
        <Input
          placeholder="Nombre del hermano"
          value={newHeRestauracion.nombre}
          onChange={(e) =>
            setNewHeRestauracion({
              ...newHeRestauracion,
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
          value={newHeRestauracion.telefono}
          onChange={(e) =>
            setNewHeRestauracion({
              ...newHeRestauracion,
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
          value={newHeRestauracion.notas}
          onChange={(e) =>
            setNewHeRestauracion({
              ...newHeRestauracion,
              notas: e.target.value,
            })
          }
          className="h-10 text-sm"
        />
      </div>

      <div className="flex gap-2 pt-3 border-t">
        <Button
          className="flex-1 bg-orange-600 hover:bg-orange-700 h-10 text-sm"
          onClick={handleAddNewHeRestauracion}
          disabled={!newHeRestauracion.nombre.trim()}
        >
          <Plus className="w-4 h-4 mr-1" />
          Agregar
        </Button>
      </div>
    </div>
  );

  // Custom avatar for heRestauracion
  const renderHeRestauracionAvatar = (_item: SelectableItem) => (
    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
      <HeartHandshake className="w-5 h-5 text-orange-600" />
    </div>
  );

  return (
    <SelectableListDialog<HeRestauracion>
      isOpen={isOpen}
      onClose={handleClose}
      items={heRestauracion}
      selectedItems={heRestauracionDelDia}
      baseItems={baseHeRestauracion}
      title="Agregar Hermanos en Restauración"
      searchPlaceholder="Buscar hermano por nombre..."
      _itemTypeName="hermano en restauración"
      itemTypeNamePlural="hermanos en restauración"
      onAddItems={onAddHeRestauracion}
      onRemoveItem={onRemoveHeRestauracion}
      onClearAllItems={onClearAllHeRestauracion}
      onAddNewItem={renderNewHeRestauracionForm}
      renderAvatar={renderHeRestauracionAvatar}
      getItemColor={() => 'bg-orange-100'}
      showAddNewButton={true}
    />
  );
}
