'use client';

import { SelectableListDialog, type SelectableItem } from '@/shared/components';
import { Button, Input } from '@/shared/ui';
import { Plus, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { type VisitaLite } from '../types';

export interface VisitasDialogProps {
  isOpen: boolean;
  onClose: () => void;
  visitas: VisitaLite[];
  visitasDelDia: VisitaLite[];
  baseVisitas: VisitaLite[];
  onAddVisitas: (items: VisitaLite[]) => void;
  onAddNewVisita: (
    data: Omit<VisitaLite, 'id'> & { nombre: string }
  ) => Promise<void>;
  onRemoveVisita: (id: string) => void;
  onClearAllVisitas: () => void;
}

export function VisitasDialog({
  isOpen,
  onClose,
  visitas,
  visitasDelDia,
  baseVisitas,
  onAddVisitas,
  onAddNewVisita,
  onRemoveVisita,
  onClearAllVisitas,
}: VisitasDialogProps) {
  const [newVisita, setNewVisita] = useState({
    nombre: '',
    telefono: '',
    notas: '',
  });

  // Reset form when dialog closes
  const handleClose = () => {
    setNewVisita({ nombre: '', telefono: '', notas: '' });
    onClose();
  };

  // Handle adding new visita
  const handleAddNewVisita = async () => {
    if (!newVisita.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      await onAddNewVisita(newVisita);
      setNewVisita({ nombre: '', telefono: '', notas: '' });
      toast.success('Visita agregada exitosamente');
    } catch (error) {
      console.error('Error adding visita:', error);
      toast.error('Error al agregar visita');
    }
  };

  // Render form for new visita
  const renderNewVisitaForm = () => (
    <div className="space-y-4">
      <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
        <div className="flex items-center gap-2 text-emerald-800 text-sm font-medium">
          <Plus className="w-4 h-4" />
          Nueva Visita
        </div>
        <p className="text-emerald-600 text-xs mt-1">
          Complete la información de la visita
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Nombre Completo *
        </label>
        <Input
          placeholder="Nombre de la visita"
          value={newVisita.nombre}
          onChange={(e) =>
            setNewVisita({
              ...newVisita,
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
          value={newVisita.telefono}
          onChange={(e) =>
            setNewVisita({
              ...newVisita,
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
          value={newVisita.notas}
          onChange={(e) =>
            setNewVisita({
              ...newVisita,
              notas: e.target.value,
            })
          }
          className="h-10 text-sm"
        />
      </div>

      <div className="flex gap-2 pt-3 border-t">
        <Button
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-10 text-sm"
          onClick={handleAddNewVisita}
          disabled={!newVisita.nombre.trim()}
        >
          <Plus className="w-4 h-4 mr-1" />
          Agregar
        </Button>
      </div>
    </div>
  );

  // Custom avatar for visitas
  const renderVisitaAvatar = (_item: SelectableItem) => (
    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
      <User className="w-5 h-5 text-emerald-600" />
    </div>
  );

  return (
    <SelectableListDialog<VisitaLite>
      isOpen={isOpen}
      onClose={handleClose}
      items={visitas}
      selectedItems={visitasDelDia}
      baseItems={baseVisitas}
      title="Agregar Visitas"
      searchPlaceholder="Buscar visita por nombre..."
      _itemTypeName="visita"
      itemTypeNamePlural="visitas"
      onAddItems={onAddVisitas}
      onRemoveItem={onRemoveVisita}
      onClearAllItems={onClearAllVisitas}
      onAddNewItem={renderNewVisitaForm}
      renderAvatar={renderVisitaAvatar}
      getItemColor={() => 'bg-emerald-100'}
      showAddNewButton={true}
    />
  );
}
