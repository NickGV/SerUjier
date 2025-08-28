"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, X, Trash2, RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConteo } from "@/contexts/conteo-context";

interface ConteoHeaderProps {
  fecha: string;
  setFecha: (value: string) => void;
  tipoServicio: string;
  setTipoServicio: (value: string) => void;
  selectedUjieres: string[];
  setSelectedUjieres: (
    value: string[] | ((prev: string[]) => string[])
  ) => void;
  servicios: { value: string; label: string }[];
  ujieres: string[];
}

export function ConteoHeader({
  fecha,
  setFecha,
  tipoServicio,
  setTipoServicio,
  selectedUjieres,
  setSelectedUjieres,
  servicios,
  ujieres,
}: ConteoHeaderProps) {
  const { clearConteoData } = useConteo();

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3 px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-800">
            Conteo de Asistencia
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearConteoData}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 hover:from-red-600 hover:to-red-700 text-xs sm:text-sm"
            >
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Limpiar Todo
            </Button>
          </div>
        </div>

        {/* Campos editables */}
        <div className="space-y-3 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Fecha
              </label>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="h-8 sm:h-9 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Servicio
              </label>
              <Select value={tipoServicio} onValueChange={setTipoServicio}>
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {servicios.map((servicio) => (
                    <SelectItem key={servicio.value} value={servicio.value}>
                      {servicio.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-1 flex items-center gap-1">
              <User className="w-3 h-3" />
              Ujier(es) -{" "}
              {selectedUjieres.length > 0
                ? `${selectedUjieres.length} seleccionados`
                : "Ninguno seleccionado"}
            </label>

            {/* Ujieres seleccionados */}
            {selectedUjieres.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {selectedUjieres.map((ujier, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-slate-50 text-slate-700 border-slate-200 flex items-center gap-1"
                  >
                    {ujier}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-slate-200"
                      onClick={() => {
                        setSelectedUjieres((prev) =>
                          prev.filter((u) => u !== ujier)
                        );
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Selector de ujieres */}
            <Select
              value=""
              onValueChange={(value) => {
                if (value === "otro") {
                  const nuevoUjier = prompt("Escriba el nombre del ujier:");
                  if (nuevoUjier && nuevoUjier.trim()) {
                    const ujierLimpio = nuevoUjier.trim();
                    if (!selectedUjieres.includes(ujierLimpio)) {
                      setSelectedUjieres([...selectedUjieres, ujierLimpio]);
                    }
                  }
                } else if (value && !selectedUjieres.includes(value)) {
                  setSelectedUjieres([...selectedUjieres, value]);
                }
              }}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="+ Agregar ujier" />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                {ujieres
                  .filter((ujier) => !selectedUjieres.includes(ujier))
                  .map((ujier) => (
                    <SelectItem key={ujier} value={ujier}>
                      {ujier}
                    </SelectItem>
                  ))}
                <SelectItem value="otro">
                  + Escribir nombre personalizado
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Botón para limpiar selección */}
            {selectedUjieres.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 text-xs bg-transparent border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => setSelectedUjieres([])}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Limpiar selección
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <Badge
            variant="outline"
            className="bg-slate-50 text-slate-700 border-slate-200"
          >
            {servicios.find((s) => s.value === tipoServicio)?.label}
          </Badge>
          {selectedUjieres.map((ujier, index) => (
            <Badge
              key={index}
              variant="outline"
              className="bg-slate-50 text-slate-700 border-slate-200"
            >
              {ujier}
            </Badge>
          ))}
        </div>
      </CardHeader>
    </Card>
  );
}
