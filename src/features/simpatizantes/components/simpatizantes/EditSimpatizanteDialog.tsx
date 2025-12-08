"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Loader2 } from "lucide-react";
import { Simpatizante } from "@/features/simpatizantes/hooks/use-simpatizantes";

interface EditSimpatizanteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  simpatizante: Simpatizante | null;
  onUpdate: (
    id: string,
    data: Partial<Omit<Simpatizante, "id" | "fechaRegistro">>
  ) => Promise<void>;
  isUpdating: boolean;
}

export function EditSimpatizanteDialog({
  isOpen,
  onClose,
  simpatizante,
  onUpdate,
  isUpdating,
}: EditSimpatizanteDialogProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    notas: "",
  });

  // Update form data when simpatizante changes
  useEffect(() => {
    if (simpatizante) {
      setFormData({
        nombre: simpatizante.nombre || "",
        telefono: simpatizante.telefono || "",
        notas: simpatizante.notas || "",
      });
    }
  }, [simpatizante]);

  const handleSubmit = async () => {
    if (!simpatizante || !formData.nombre.trim()) {
      return;
    }

    try {
      // Create clean data object - only include fields with actual values
      const cleanData: { nombre?: string; telefono?: string; notas?: string } = {};
      
      // Always include nombre since it's required
      cleanData.nombre = formData.nombre.trim();
      
      // Only add optional fields if they have actual content
      const telefonoTrimmed = formData.telefono.trim();
      if (telefonoTrimmed) {
        cleanData.telefono = telefonoTrimmed;
      }
      
      const notasTrimmed = formData.notas.trim();
      if (notasTrimmed) {
        cleanData.notas = notasTrimmed;
      }
      
      await onUpdate(simpatizante.id, cleanData);
      onClose();
    } catch (error) {
      console.error("Error al actualizar simpatizante:", error);
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      onClose();
    }
  };

  if (!simpatizante) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Simpatizante</DialogTitle>
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
              disabled={isUpdating}
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
              disabled={isUpdating}
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
              disabled={isUpdating}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUpdating}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.nombre.trim() || isUpdating}
              className="flex-1 bg-slate-600 hover:bg-slate-700"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

