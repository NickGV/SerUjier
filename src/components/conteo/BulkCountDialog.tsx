"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BulkCounts, ConteoDialogProps } from "./types";

interface BulkCountDialogProps extends ConteoDialogProps {
  bulkCounts: BulkCounts;
  onBulkCountsChange: (counts: BulkCounts) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function BulkCountDialog({
  isOpen,
  onClose,
  bulkCounts,
  onBulkCountsChange,
  onSubmit,
  onReset,
}: BulkCountDialogProps) {
  const handleInputChange = (field: keyof BulkCounts, value: string) => {
    onBulkCountsChange({
      ...bulkCounts,
      [field]: value,
    });
  };

  const totalToAdd = 
    (parseInt(bulkCounts.hermanos) || 0) +
    (parseInt(bulkCounts.hermanas) || 0) +
    (parseInt(bulkCounts.ninos) || 0) +
    (parseInt(bulkCounts.adolescentes) || 0) +
    (parseInt(bulkCounts.simpatizantes) || 0);

  const hasValues = Object.values(bulkCounts).some(value => value.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col mx-2 sm:mx-0">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="text-base sm:text-lg">
            Conteo Múltiple
          </DialogTitle>
          <p className="text-xs sm:text-sm text-gray-600">
            Ingrese las cantidades para agregar a cada categoría
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 mb-2 block">
                Hermanos
              </label>
              <Input
                type="number"
                placeholder="0"
                value={bulkCounts.hermanos}
                onChange={(e) => handleInputChange("hermanos", e.target.value)}
                className="h-10 text-center text-sm"
                min="0"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-rose-700 mb-2 block">
                Hermanas
              </label>
              <Input
                type="number"
                placeholder="0"
                value={bulkCounts.hermanas}
                onChange={(e) => handleInputChange("hermanas", e.target.value)}
                className="h-10 text-center text-sm"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-amber-700 mb-2 block">
                Niños
              </label>
              <Input
                type="number"
                placeholder="0"
                value={bulkCounts.ninos}
                onChange={(e) => handleInputChange("ninos", e.target.value)}
                className="h-10 text-center text-sm"
                min="0"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-purple-700 mb-2 block">
                Adolescentes
              </label>
              <Input
                type="number"
                placeholder="0"
                value={bulkCounts.adolescentes}
                onChange={(e) => handleInputChange("adolescentes", e.target.value)}
                className="h-10 text-center text-sm"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-emerald-700 mb-2 block">
              Simpatizantes
            </label>
            <Input
              type="number"
              placeholder="0"
              value={bulkCounts.simpatizantes}
              onChange={(e) => handleInputChange("simpatizantes", e.target.value)}
              className="h-10 text-center text-sm"
              min="0"
            />
          </div>

          {/* Preview */}
          {hasValues && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xs font-medium text-blue-800 mb-2">
                Vista previa:
              </div>
              <div className="text-sm text-blue-700">
                Total a agregar: {totalToAdd} personas
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 pt-3 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 bg-transparent h-10 text-sm"
              onClick={onReset}
            >
              Limpiar
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-transparent h-10 text-sm"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 h-10 text-sm"
              onClick={() => {
                onSubmit();
                onClose();
              }}
            >
              Agregar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
