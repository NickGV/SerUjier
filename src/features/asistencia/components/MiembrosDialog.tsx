'use client';

import { SelectableListDialog, type SelectableItem } from '@/shared/components';
import { User } from 'lucide-react';
import { type MiembroExtended, type MiembrosDialogProps } from '../types';
import { getCategoriaColor } from '../utils/helpers';

export function MiembrosDialog({
  isOpen,
  onClose,
  categoria,
  miembrosDisponibles,
  miembrosDelDia,
  baseMiembros,
  onAddMiembros,
  onRemoveMiembro,
  onClearAllMiembros,
}: MiembrosDialogProps) {
  // Filtrar miembros por categoría
  const miembrosFiltrados = miembrosDisponibles.filter(
    (miembro) => miembro.categoria === categoria.slice(0, -1) // Remove 's' from plural
  );

  // Custom avatar for miembros
  const renderMiembroAvatar = (item: SelectableItem) => {
    const miembro = item as unknown as MiembroExtended;
    return (
      <div
        className={`w-10 h-10 ${getCategoriaColor(miembro.categoria)} rounded-full flex items-center justify-center flex-shrink-0`}
      >
        <User className="w-5 h-5" />
      </div>
    );
  };

  // Render extra info for miembros
  const renderMiembroExtraInfo = (item: SelectableItem) => {
    const miembro = item as unknown as MiembroExtended;
    return (
      <>
        <p className="text-xs text-gray-600">
          {miembro.telefono || 'Sin teléfono'}
        </p>
        {miembro.notas && (
          <p className="text-xs text-gray-500 mt-1 truncate">{miembro.notas}</p>
        )}
      </>
    );
  };

  // Get category color for items
  const getItemColor = (item: SelectableItem) => {
    const miembro = item as unknown as MiembroExtended;
    return getCategoriaColor(miembro.categoria);
  };

  // Category names in Spanish
  const categoryNames: Record<string, string> = {
    hermanos: 'Hermanos',
    hermanas: 'Hermanas',
    ninos: 'Niños',
    adolescentes: 'Adolescentes',
    heRestauracion: 'Hermanos en Restauración',
  };

  return (
    <SelectableListDialog<MiembroExtended>
      isOpen={isOpen}
      onClose={onClose}
      items={miembrosFiltrados}
      selectedItems={miembrosDelDia as MiembroExtended[]}
      baseItems={baseMiembros as MiembroExtended[]}
      title={`Agregar ${categoryNames[categoria]}`}
      searchPlaceholder={`Buscar ${categoria.slice(0, -1)} por nombre...`}
      _itemTypeName={categoria.slice(0, -1)}
      itemTypeNamePlural={categoria}
      onAddItems={onAddMiembros}
      onRemoveItem={onRemoveMiembro}
      onClearAllItems={onClearAllMiembros}
      renderAvatar={renderMiembroAvatar}
      renderExtraInfo={renderMiembroExtraInfo}
      getItemColor={getItemColor}
      showAddNewButton={false} // Miembros no se pueden agregar desde aquí
    />
  );
}
