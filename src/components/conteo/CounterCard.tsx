"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, Edit3, UserPlus } from "lucide-react";
import { CounterData } from "./types";

interface CounterCardProps {
  counter: CounterData;
  editingCounter: string | null;
  tempValue: string;
  onEdit: (key: string, value: number) => void;
  onSaveEdit: () => void;
  onTempValueChange: (value: string) => void;
  onOpenDialog: (categoria: string) => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function CounterCard({
  counter,
  editingCounter,
  tempValue,
  onEdit,
  onSaveEdit,
  onTempValueChange,
  onOpenDialog,
  onIncrement,
  onDecrement,
}: CounterCardProps) {
  const totalValue =
    counter.value +
    counter.miembrosDelDia.length +
    counter.baseValue +
    counter.baseMiembros.length;
  const totalAddedMembers =
    counter.miembrosDelDia.length + counter.baseMiembros.length;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 ${counter.color} rounded-full flex-shrink-0`}
            />
            <span className="font-medium text-gray-800 text-base sm:text-lg">
              {counter.label}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {counter.categoria && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-full bg-transparent border-gray-300 hover:bg-gray-50 active:bg-gray-100"
                  onClick={() =>
                    counter.categoria === "simpatizantes"
                      ? onOpenDialog("simpatizantes")
                      : onOpenDialog(counter.categoria)
                  }
                  aria-label={`Agregar ${counter.label}`}
                >
                  <UserPlus className="w-5 h-5 md:w-6 md:h-6" />
                </Button>
                {totalAddedMembers > 0 && (
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-emerald-600 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-medium">
                    {totalAddedMembers}
                  </div>
                )}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 md:w-12 md:h-12 p-0 rounded-full bg-transparent border-gray-300 hover:bg-gray-50 active:bg-gray-100"
              onClick={onDecrement}
              aria-label={`Decrementar ${counter.label}`}
            >
              <Minus className="w-4 h-4 md:w-6 md:h-6" />
            </Button>

            {editingCounter === counter.key ? (
              <div className="flex items-center gap-2">
                <Input
                  value={tempValue}
                  onChange={(e) => onTempValueChange(e.target.value)}
                  className="w-20 md:w-24 h-10 md:h-12 text-center text-sm md:text-base"
                  type="number"
                  autoFocus
                  aria-label={`Editar ${counter.label}`}
                />
                <Button
                  size="sm"
                  onClick={onSaveEdit}
                  className="h-10 md:h-12 bg-slate-600 hover:bg-slate-700 text-sm px-3"
                  aria-label="Guardar cambios"
                >
                  ✓
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-bold w-10 md:w-12 text-center min-w-0">
                  {totalValue}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 md:w-10 md:h-10 p-0 hover:bg-gray-100 active:bg-gray-200"
                  onClick={() => onEdit(counter.key, counter.value)}
                  aria-label={`Editar ${counter.label}`}
                >
                  <Edit3 className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 md:w-12 md:h-12 p-0 rounded-full bg-transparent border-gray-300 hover:bg-gray-50 active:bg-gray-100"
              onClick={onIncrement}
              aria-label={`Incrementar ${counter.label}`}
            >
              <Plus className="w-4 h-4 md:w-6 md:h-6" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
