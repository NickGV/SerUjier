'use client';

import { type Simpatizante } from '@/shared/types';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface AddSimpatizanteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    data: Omit<Simpatizante, 'id' | 'fechaRegistro'> & { nombre: string }
  ) => Promise<void>;
  isAdding: boolean;
}

export function AddSimpatizanteDialog({
  isOpen,
  onClose,
  onAdd,
  isAdding,
}: AddSimpatizanteDialogProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    notas: '',
  });

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) {
      return;
    }

    try {
      // Create clean data object - only include fields with actual values
      const cleanData: { nombre: string; telefono?: string; notas?: string } = {
        nombre: formData.nombre.trim(),
      };

      // Only add optional fields if they have actual content
      const telefonoTrimmed = formData.telefono.trim();
      if (telefonoTrimmed) {
        cleanData.telefono = telefonoTrimmed;
      }

      const notasTrimmed = formData.notas.trim();
      if (notasTrimmed) {
        cleanData.notas = notasTrimmed;
      }

      await onAdd(cleanData);
      setFormData({ nombre: '', telefono: '', notas: '' });
      onClose();
    } catch (error) {
      console.error('Error al agregar simpatizante:', error);
    }
  };

  const handleClose = () => {
    if (!isAdding) {
      setFormData({ nombre: '', telefono: '', notas: '' });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Simpatizante</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Nombre *
            </label>
            <Input
              placeholder="Nombre del simpatizante"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              disabled={isAdding}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Teléfono
            </label>
            <Input
              placeholder="Número de teléfono"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
              disabled={isAdding}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Notas
            </label>
            <Input
              placeholder="Notas adicionales"
              value={formData.notas}
              onChange={(e) =>
                setFormData({ ...formData, notas: e.target.value })
              }
              disabled={isAdding}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isAdding}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.nombre.trim() || isAdding}
              className="flex-1 bg-slate-600 hover:bg-slate-700"
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Agregando...
                </>
              ) : (
                'Agregar'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
