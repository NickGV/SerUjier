'use client';

import { type HeRestauracion } from '@/shared/types';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeRestauracionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  heRestauracion?: HeRestauracion | null;
  onSave: (
    data: Omit<HeRestauracion, 'id' | 'fechaRegistro'> & { nombre: string }
  ) => Promise<void>;
  isSaving: boolean;
}

export function HeRestauracionFormDialog({
  isOpen,
  onClose,
  heRestauracion,
  onSave,
  isSaving,
}: HeRestauracionFormDialogProps) {
  const isEditMode = !!heRestauracion;

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    notas: '',
  });

  // Update form data when heRestauracion changes or dialog opens
  useEffect(() => {
    if (heRestauracion) {
      setFormData({
        nombre: heRestauracion.nombre || '',
        telefono: heRestauracion.telefono || '',
        notas: heRestauracion.notas || '',
      });
    } else {
      setFormData({
        nombre: '',
        telefono: '',
        notas: '',
      });
    }
  }, [heRestauracion, isOpen]);

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

      await onSave(cleanData);
      setFormData({ nombre: '', telefono: '', notas: '' });
      onClose();
    } catch (error) {
      console.error('Error al guardar hermano en restauración:', error);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setFormData({ nombre: '', telefono: '', notas: '' });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? 'Editar Hermano en Restauración'
              : 'Nuevo Hermano en Restauración'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Nombre *
            </label>
            <Input
              placeholder="Nombre del hermano"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              disabled={isSaving}
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
              disabled={isSaving}
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
              disabled={isSaving}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.nombre.trim() || isSaving}
              className="flex-1 bg-slate-600 hover:bg-slate-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditMode ? 'Guardando...' : 'Agregando...'}
                </>
              ) : isEditMode ? (
                'Guardar'
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
