'use client';

import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Calendar, Edit3, X } from 'lucide-react';
import { type DatosServicioBase } from '@/shared/types';
import { servicios } from '../constants';

interface EditModeBannerProps {
  onCancel: () => void;
}

export function EditModeBanner({ onCancel }: EditModeBannerProps) {
  return (
    <Card className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-base sm:text-lg">
                Modo Edición
              </div>
              <div className="text-orange-100 text-xs sm:text-sm">
                Está editando un registro existente del historial
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ConsecutiveModeBannerProps {
  datosServicioBase: DatosServicioBase;
  tipoServicio: string;
}

export function ConsecutiveModeBanner({
  datosServicioBase,
  tipoServicio,
}: ConsecutiveModeBannerProps) {
  return (
    <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5" />
          <span className="font-semibold">
            Modo Consecutivo:{' '}
            {servicios.find((s) => s.value === tipoServicio)?.label ||
              tipoServicio}
          </span>
        </div>
        <div className="text-emerald-100 text-sm">
          Base del {datosServicioBase.servicio}: {datosServicioBase.total}{' '}
          asistentes
        </div>
        <div className="text-emerald-200 text-xs mt-1">
          Los contadores actuales se sumarán a la base del servicio anterior.
        </div>
      </CardContent>
    </Card>
  );
}
