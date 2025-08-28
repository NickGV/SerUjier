"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Edit3, UserPlus, Plus } from "lucide-react";

interface ConteoCountersProps {
  counters: Array<{
    key: string;
    label: string;
    value: number;
    setter: (value: number) => void;
    color: string;
    miembrosDelDia: any[];
    categoria?: string;
    baseValue: number;
    baseMiembros: any[];
  }>;
  editingCounter: string | null;
  tempValue: string;
  setTempValue: (value: string) => void;
  handleCounterEdit: (type: string, value: number) => void;
  saveCounterEdit: () => void;
  openMiembrosDialog: (categoria: string) => void;
  setShowAddDialog: (value: boolean) => void;
}

export function ConteoCounters({
  counters,
  editingCounter,
  tempValue,
  setTempValue,
  handleCounterEdit,
  saveCounterEdit,
  openMiembrosDialog,
  setShowAddDialog,
}: ConteoCountersProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {counters.map((counter) => (
        <Card
          key={counter.key}
          className="bg-white/90 backdrop-blur-sm border-0 shadow-md"
        >
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className={`w-2 h-2 sm:w-3 sm:h-3 ${counter.color} rounded-full`}
                ></div>
                <span className="font-medium text-gray-800 text-sm sm:text-base">
                  {counter.label}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                {counter.categoria && (
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-6 h-6 sm:w-8 sm:h-8 p-0 rounded-full bg-transparent border-gray-300"
                      onClick={() =>
                        counter.categoria === "simpatizantes"
                          ? setShowAddDialog(true)
                          : openMiembrosDialog(counter.categoria!)
                      }
                    >
                      <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    {counter.miembrosDelDia.length +
                      counter.baseMiembros.length >
                      0 && (
                      <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-1 bg-emerald-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium">
                        {counter.miembrosDelDia.length +
                          counter.baseMiembros.length}
                      </div>
                    )}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-6 h-6 sm:w-8 sm:h-8 p-0 rounded-full bg-transparent border-gray-300"
                  onClick={() => counter.setter(Math.max(0, counter.value - 1))}
                >
                  <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>

                {editingCounter === counter.key ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-12 sm:w-16 h-6 sm:h-8 text-center text-xs sm:text-sm"
                      type="number"
                    />
                    <Button
                      size="sm"
                      onClick={saveCounterEdit}
                      className="h-6 sm:h-8 bg-slate-600 hover:bg-slate-700 text-xs"
                    >
                      ✓
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-lg sm:text-xl font-semibold w-6 sm:w-8 text-center">
                      {counter.value +
                        counter.miembrosDelDia.length +
                        counter.baseValue +
                        counter.baseMiembros.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-4 h-4 sm:w-6 sm:h-6 p-0"
                      onClick={() =>
                        handleCounterEdit(counter.key, counter.value)
                      }
                    >
                      <Edit3 className="w-2 h-2 sm:w-3 sm:h-3" />
                    </Button>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-6 h-6 sm:w-8 sm:h-8 p-0 rounded-full bg-transparent border-gray-300"
                  onClick={() => counter.setter(counter.value + 1)}
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
