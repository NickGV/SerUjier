'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { type Simpatizante } from '@/features/simpatizantes/hooks/use-simpatizantes';

interface DeleteSimpatizanteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  simpatizante: Simpatizante | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteSimpatizanteDialog({
  isOpen,
  onClose,
  simpatizante,
  onConfirm,
  isDeleting,
}: DeleteSimpatizanteDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error al eliminar simpatizante:', error);
    }
  };

  if (!simpatizante) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar simpatizante?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente la
            información de <strong>{simpatizante.nombre}</strong> de la base de
            datos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
