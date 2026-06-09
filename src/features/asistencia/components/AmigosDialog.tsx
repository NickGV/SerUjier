'use client';

import { SelectableListDialog, type SelectableItem } from '@/shared/components';
import { Button, Input } from '@/shared/ui';
import { Plus, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { type AmigoLite, type AmigosDialogProps } from '../types';

export function AmigosDialog({
  isOpen,
  onClose,
  amigos,
  amigosDelDia,
  baseAmigos,
  onAddAmigos,
  onAddNewAmigo,
  onRemoveAmigo,
  onClearAllAmigos,
}: AmigosDialogProps) {
  const [newAmigo, setNewAmigo] = useState({
    nombre: '',
    telefono: '',
    notas: '',
  });

  const handleClose = () => {
    setNewAmigo({ nombre: '', telefono: '', notas: '' });
    onClose();
  };

  const handleAddNewAmigo = async () => {
    if (!newAmigo.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      await onAddNewAmigo(newAmigo);
      setNewAmigo({ nombre: '', telefono: '', notas: '' });
      toast.success('Amigo agregado exitosamente');
    } catch (error) {
      console.error('Error adding amigo:', error);
      toast.error('Error al agregar amigo');
    }
  };

  const renderNewAmigoForm = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 text-blue-800 text-sm font-medium">
          <Plus className="w-4 h-4" />
          Nuevo Amigo
        </div>
        <p className="text-blue-600 text-xs mt-1">
          Complete la información del amigo
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Nombre Completo *
        </label>
        <Input
          placeholder="Nombre del amigo"
          value={newAmigo.nombre}
          onChange={(e) =>
            setNewAmigo({
              ...newAmigo,
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
          value={newAmigo.telefono}
          onChange={(e) =>
            setNewAmigo({
              ...newAmigo,
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
          value={newAmigo.notas}
          onChange={(e) =>
            setNewAmigo({
              ...newAmigo,
              notas: e.target.value,
            })
          }
          className="h-10 text-sm"
        />
      </div>

      <div className="flex gap-2 pt-3 border-t">
        <Button
          className="flex-1 bg-slate-600 hover:bg-slate-700 h-10 text-sm"
          onClick={handleAddNewAmigo}
          disabled={!newAmigo.nombre.trim()}
        >
          <Plus className="w-4 h-4 mr-1" />
          Agregar
        </Button>
      </div>
    </div>
  );

  const renderAmigoAvatar = (_item: SelectableItem) => (
    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
      <User className="w-5 h-5 text-pink-600" />
    </div>
  );

  return (
    <SelectableListDialog<AmigoLite>
      isOpen={isOpen}
      onClose={handleClose}
      items={amigos}
      selectedItems={amigosDelDia}
      baseItems={baseAmigos}
      title="Agregar Amigos"
      searchPlaceholder="Buscar amigo por nombre..."
      _itemTypeName="amigo"
      itemTypeNamePlural="amigos"
      onAddItems={onAddAmigos}
      onRemoveItem={onRemoveAmigo}
      onClearAllItems={onClearAllAmigos}
      onAddNewItem={renderNewAmigoForm}
      renderAvatar={renderAmigoAvatar}
      getItemColor={() => 'bg-pink-100'}
      showAddNewButton={true}
    />
  );
}
