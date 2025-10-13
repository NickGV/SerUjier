import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORIES, type CategoryStats } from './utils';

interface StatsSummaryProps {
  stats: CategoryStats;
  totalRegistros: number;
  promedioAsistencia: number;
  mayorAsistencia: number;
  menorAsistencia: number;
}

export function StatsSummary({ 
  stats, 
  totalRegistros, 
  promedioAsistencia, 
  mayorAsistencia, 
  menorAsistencia 
}: StatsSummaryProps) {
  return (
    <Card className="bg-gradient-to-r from-slate-600 to-slate-700 text-white border-0 shadow-lg">
      <CardContent className="p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold">
              {promedioAsistencia}
            </div>
            <div className="text-slate-200 text-xs sm:text-sm">
              Promedio
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold">
              {totalRegistros}
            </div>
            <div className="text-slate-200 text-xs sm:text-sm">
              Registros
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-500">
          <div className="text-center">
            <div className="text-base sm:text-lg font-semibold">
              {mayorAsistencia}
            </div>
            <div className="text-slate-200 text-xs">Máximo</div>
          </div>
          <div className="text-center">
            <div className="text-base sm:text-lg font-semibold">
              {menorAsistencia}
            </div>
            <div className="text-slate-200 text-xs">Mínimo</div>
          </div>
        </div>

        {/* Totales por categoría */}
        <div className="mt-3 pt-3 border-t border-slate-500">
          <div className="text-xs text-slate-200 mb-2 text-center">
            Total General: {stats.granTotal} asistentes
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {CATEGORIES.map((category) => {
              const value = stats[`total${category.key.charAt(0).toUpperCase() + category.key.slice(1)}` as keyof CategoryStats] as number;
              return (
                <div key={category.key}>
                  <div className="text-sm font-semibold">{value}</div>
                  <div className="text-xs text-slate-300">{category.shortLabel}</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
