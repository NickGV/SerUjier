'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import {
  Plus,
  Calendar,
  User,
  Clock,
  Trash2,
  X,
  RefreshCw,
} from 'lucide-react';
import { servicios } from '../constants';

interface ConteoHeaderProps {
  fecha: string;
  tipoServicio: string;
  selectedUjieres: string[];
  ujierSeleccionado: string;
  ujierPersonalizado: string;
  ujieres: string[];
  onFechaChange: (fecha: string) => void;
  onTipoServicioChange: (tipo: string) => void;
  onUjieresChange: (updates: {
    selectedUjieres?: string[];
    ujierSeleccionado?: string;
    ujierPersonalizado?: string;
  }) => void;
  onShowBulkCount: () => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

export function ConteoHeader({
  fecha,
  tipoServicio,
  selectedUjieres,
  ujierSeleccionado,
  ujierPersonalizado,
  ujieres,
  onFechaChange,
  onTipoServicioChange,
  onUjieresChange,
  onShowBulkCount,
  onRefreshData,
  isRefreshing = false,
}: ConteoHeaderProps) {
  const [showServicioInput, setShowServicioInput] = useState(false);
  const [servicioManual, setServicioManual] = useState('');

  const handleServicioChange = (value: string) => {
    if (value === 'manual') {
      setShowServicioInput(true);
    } else {
      onTipoServicioChange(value);
      setShowServicioInput(false);
    }
  };

  const handleGuardarServicioManual = () => {
    if (servicioManual.trim()) {
      onTipoServicioChange(servicioManual.trim());
      setShowServicioInput(false);
      setServicioManual('');
    }
  };

  const handleRemoveUjier = (ujier: string) => {
    const remaining = selectedUjieres.filter((u) => u !== ujier);
    const updates: {
      selectedUjieres?: string[];
      ujierSeleccionado?: string;
      ujierPersonalizado?: string;
    } = { selectedUjieres: remaining };

    if (remaining.length === 0) {
      updates.ujierSeleccionado = '';
      updates.ujierPersonalizado = '';
    } else if (remaining.length === 1 && ujieres.includes(remaining[0])) {
      updates.ujierSeleccionado = remaining[0];
      updates.ujierPersonalizado = '';
    } else {
      updates.ujierSeleccionado = 'otro';
      updates.ujierPersonalizado = remaining.join(', ');
    }

    onUjieresChange(updates);
  };

  const handleAddUjier = (value: string) => {
    if (value === 'otro') {
      // Open input to write custom name
      const nuevoUjier = prompt('Escriba el nombre del ujier:');
      if (nuevoUjier && nuevoUjier.trim()) {
        const ujierLimpio = nuevoUjier.trim();
        if (!selectedUjieres.includes(ujierLimpio)) {
          const nuevosUjieres = [...selectedUjieres, ujierLimpio];
          onUjieresChange({
            selectedUjieres: nuevosUjieres,
            ujierSeleccionado: 'otro',
            ujierPersonalizado: nuevosUjieres.join(', '),
          });
        }
      }
    } else if (value && !selectedUjieres.includes(value)) {
      const nuevosUjieres = [...selectedUjieres, value];
      const updates: {
        selectedUjieres?: string[];
        ujierSeleccionado?: string;
        ujierPersonalizado?: string;
      } = { selectedUjieres: nuevosUjieres };

      if (nuevosUjieres.length === 1) {
        updates.ujierSeleccionado = value;
        updates.ujierPersonalizado = '';
      } else {
        updates.ujierSeleccionado = 'otro';
        updates.ujierPersonalizado = nuevosUjieres.join(', ');
      }

      onUjieresChange(updates);
    }
  };

  const handleClearUjieres = () => {
    onUjieresChange({
      selectedUjieres: [],
      ujierSeleccionado: '',
      ujierPersonalizado: '',
    });
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3 px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-800">
            Conteo de Asistencia
          </CardTitle>
          <div className="flex gap-2">
            {onRefreshData && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRefreshData()}
                disabled={isRefreshing}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 hover:text-white hover:from-green-600 hover:to-green-700 text-xs sm:text-sm"
              >
                <RefreshCw
                  className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                {isRefreshing ? 'Actualizando...' : 'Actualizar Datos'}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onShowBulkCount}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700 text-xs sm:text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Conteo Múltiple
            </Button>
          </div>
        </div>

        {/* Editable fields */}
        <div className="space-y-3 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="fecha-input"
                className="text-sm md:text-base text-gray-600 mb-2 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                Fecha
              </label>
              <Input
                id="fecha-input"
                type="date"
                value={fecha}
                onChange={(e) => onFechaChange(e.target.value)}
                className="h-10 md:h-12 text-sm md:text-base"
                aria-describedby="fecha-help"
              />
              <div id="fecha-help" className="text-xs text-gray-500 mt-1">
                Seleccione la fecha del servicio
              </div>
            </div>
            <div>
              <label
                htmlFor="servicio-select"
                className="text-sm md:text-base text-gray-600 mb-2 flex items-center gap-2"
              >
                <Clock className="w-4 h-4 md:w-5 md:h-5" />
                Servicio
              </label>
              <Select value={tipoServicio} onValueChange={handleServicioChange}>
                <SelectTrigger
                  id="servicio-select"
                  className="h-10 md:h-12 text-sm md:text-base"
                  aria-describedby="servicio-help"
                >
                  <SelectValue>
                    {servicios.find((s) => s.value === tipoServicio)?.label ||
                      tipoServicio}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-64 md:max-h-80">
                  {servicios.map((servicio) => (
                    <SelectItem key={servicio.value} value={servicio.value}>
                      {servicio.label}
                    </SelectItem>
                  ))}
                  <SelectItem key="manual" value="manual">
                    Agregar servicio...
                  </SelectItem>
                </SelectContent>
              </Select>
              {showServicioInput && (
                <div className="mt-2 flex gap-2 items-center">
                  <Input
                    type="text"
                    placeholder="Nombre del servicio"
                    value={servicioManual}
                    onChange={(e) => setServicioManual(e.target.value)}
                    className="h-10 md:h-12 text-sm md:text-base"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 bg-blue-600 text-white rounded"
                    onClick={handleGuardarServicioManual}
                  >
                    Guardar
                  </button>
                </div>
              )}
              <div id="servicio-help" className="text-xs text-gray-500 mt-1">
                Tipo de servicio a registrar
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="ujier-select"
              className="text-sm md:text-base text-gray-600 mb-2 flex items-center gap-2"
            >
              <User className="w-4 h-4 md:w-5 md:h-5" />
              Ujier(es) -{' '}
              {selectedUjieres.length > 0
                ? `${selectedUjieres.length} seleccionados`
                : 'Ninguno seleccionado'}
            </label>

            {/* Selected ushers */}
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
                      onClick={() => handleRemoveUjier(ujier)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Usher selector */}
            <Select value="" onValueChange={handleAddUjier}>
              <SelectTrigger
                id="ujier-select"
                className="h-10 md:h-12 text-sm md:text-base"
                aria-describedby="ujier-help"
              >
                <SelectValue placeholder="+ Agregar ujier" />
              </SelectTrigger>
              <SelectContent className="max-h-64 md:max-h-80">
                {ujieres.length > 0 ? (
                  ujieres
                    .filter((ujier) => !selectedUjieres.includes(ujier))
                    .map((ujier) => (
                      <SelectItem key={ujier} value={ujier}>
                        {ujier}
                      </SelectItem>
                    ))
                ) : (
                  <SelectItem value="loading" disabled>
                    Cargando ujieres...
                  </SelectItem>
                )}
                <SelectItem value="otro">
                  + Escribir nombre personalizado
                </SelectItem>
              </SelectContent>
            </Select>
            <div id="ujier-help" className="text-xs text-gray-500 mt-1">
              Seleccione los ujieres que participaron en el servicio
            </div>

            {/* Button to clear selection */}
            {selectedUjieres.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 text-sm bg-transparent border-red-200 text-red-600 hover:bg-red-50 h-10"
                onClick={handleClearUjieres}
                aria-label="Limpiar selección de ujieres"
              >
                <Trash2 className="w-4 h-4 mr-2" />
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
            {servicios.find((s) => s.value === tipoServicio)?.label ||
              tipoServicio}
          </Badge>
          {ujierSeleccionado === 'otro' && ujierPersonalizado ? (
            ujierPersonalizado.split(',').map((name, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-slate-50 text-slate-700 border-slate-200"
              >
                {name.trim()}
              </Badge>
            ))
          ) : ujierSeleccionado && ujierSeleccionado !== 'otro' ? (
            <Badge
              variant="outline"
              className="bg-slate-50 text-slate-700 border-slate-200"
            >
              {ujierSeleccionado}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
    </Card>
  );
}
