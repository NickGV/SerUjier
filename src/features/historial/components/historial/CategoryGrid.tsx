import { type HistorialRecord } from '@/shared/firebase';
import { CATEGORIES, getCategoryValue } from './utils';

interface CategoryGridProps {
  record: HistorialRecord;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export function CategoryGrid({
  record,
  size = 'md',
  showLabels = true,
}: CategoryGridProps) {
  const sizeClasses = {
    sm: 'text-sm font-semibold',
    md: 'text-lg font-bold',
    lg: 'text-xl font-bold',
  };

  const containerClasses = {
    sm: 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1 p-2',
    md: 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 p-3',
    lg: 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 p-4',
  };

  return (
    <div className={`grid ${containerClasses[size]}`}>
      {CATEGORIES.map((category) => (
        <div
          key={category.key}
          className={`text-center ${category.bgColor} rounded-lg`}
        >
          <div className={`${sizeClasses[size]} ${category.textColor}`}>
            {getCategoryValue(record, category.key)}
          </div>
          {showLabels && (
            <div className="text-xs text-gray-500">
              {size === 'sm' ? category.shortLabel : category.label}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
