'use client';

import { type Amigo } from '@/types/amigos';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Users } from 'lucide-react';

interface AmigosHeaderProps {
  totalCount: number;
  filteredCount: number;
  amigos: Amigo[];
}

export function AmigosHeader({
  totalCount,
  filteredCount,
  amigos,
}: AmigosHeaderProps) {
  const withPhoneCount = amigos.filter(
    (a) => a.telefono && a.telefono.trim()
  ).length;

  return (
    <>
      {/* Header */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            Amigos de la Iglesia
          </CardTitle>
          <div className="flex items-center justify-between mt-2">
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"
            >
              {filteredCount} amigos
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-0 shadow-lg">
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-1 sm:gap-2 text-center">
            <div>
              <p className="text-xs text-emerald-200">Total</p>
              <p className="text-lg sm:text-xl font-bold">{totalCount}</p>
            </div>
            <div>
              <p className="text-xs text-emerald-200">Con Teléfono</p>
              <p className="text-lg sm:text-xl font-bold">{withPhoneCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
