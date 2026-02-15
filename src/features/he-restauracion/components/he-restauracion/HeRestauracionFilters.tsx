'use client';

import { Card, CardContent } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Search, X } from 'lucide-react';

interface HeRestauracionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  totalCount: number;
  filteredCount: number;
}

export function HeRestauracionFilters({
  searchTerm,
  onSearchChange,
  onClearSearch,
  totalCount,
  filteredCount,
}: HeRestauracionFiltersProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md sticky top-0 z-40">
      <CardContent className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar hermano en restauración..."
            aria-label="Buscar hermano en restauración"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 rounded-lg"
          />
          {searchTerm && (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              onClick={onClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="text-xs text-gray-600">
            {filteredCount} de {totalCount} hermanos encontrados
          </div>
        )}
      </CardContent>
    </Card>
  );
}
