'use client';

import { type Visita } from '@/shared/types';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { UserPlus } from 'lucide-react';

interface VisitasHeaderProps {
  totalCount: number;
  filteredCount: number;
  visitas: Visita[];
}

export function VisitasHeader({
  totalCount,
  filteredCount,
  visitas,
}: VisitasHeaderProps) {
  const withPhoneCount = visitas.filter(
    (v) => v.telefono && v.telefono.trim()
  ).length;

  return (
    <>
      {/* Header */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            Visitas de la Iglesia
          </CardTitle>
          <div className="flex items-center justify-between mt-2">
            <Badge
              variant="outline"
              className="bg-slate-50 text-slate-700 border-slate-200 text-xs"
            >
              {filteredCount} visitas
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <Card className="bg-linear-to-r from-slate-600 to-slate-700 text-white border-0 shadow-lg">
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-1 sm:gap-2 text-center">
            <div>
              <p className="text-xs text-slate-200">Total</p>
              <p className="text-lg sm:text-xl font-bold">{totalCount}</p>
            </div>
            <div>
              <p className="text-xs text-slate-200">Con Teléfono</p>
              <p className="text-lg sm:text-xl font-bold">{withPhoneCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
