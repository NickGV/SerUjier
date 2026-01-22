'use client';

import { useDebounce } from '@/shared/hooks';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import {
  CheckCircle,
  Plus,
  Search,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';

// Tipos genéricos para el componente
export interface SelectableItem {
  id: string;
  nombre: string;
  telefono?: string;
  notas?: string;
  [key: string]: unknown; // Permitir propiedades adicionales
}

export interface SelectableListDialogProps<T extends SelectableItem> {
  isOpen: boolean;
  onClose: () => void;

  // Datos
  items: T[];
  selectedItems: T[];
  baseItems: T[];

  // Configuración
  title: string;
  searchPlaceholder: string;
  _itemTypeName: string;
  itemTypeNamePlural: string;

  // Funciones
  onAddItems: (items: T[]) => void;
  onRemoveItem: (id: string) => void;
  onClearAllItems: () => void;
  onAddNewItem?: () => ReactNode; // Para el botón de agregar nuevo

  // Renderizado personalizado
  renderAvatar?: (item: T) => ReactNode;
  renderExtraInfo?: (item: T) => ReactNode;
  getItemColor?: (item: T) => string;

  // Opciones
  showAddNewButton?: boolean;
  maxSelectionHeight?: string;
}

export function SelectableListDialog<T extends SelectableItem>({
  isOpen,
  onClose,
  items,
  selectedItems,
  baseItems,
  title,
  searchPlaceholder,
  _itemTypeName,
  itemTypeNamePlural,
  onAddItems,
  onRemoveItem,
  onClearAllItems,
  onAddNewItem,
  renderAvatar,
  renderExtraInfo,
  getItemColor,
  showAddNewButton = true,
  maxSelectionHeight = 'h-[500px] sm:h-[600px]',
}: SelectableListDialogProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [internalSelected, setInternalSelected] = useState<string[]>([]);

  // Usar el hook de debounce
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setShowNewForm(false);
      setInternalSelected([]);
    }
  }, [isOpen]);

  // Filtrar elementos disponibles
  const filteredItems = items.filter((item) => {
    const searchMatch = item.nombre
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase());
    const notSelected = !selectedItems.find((s) => s.id === item.id);
    const notInBase = !baseItems.find((b) => b.id === item.id);
    return searchMatch && notSelected && notInBase;
  });

  // Toggle selección
  const toggleSelection = (itemId: string) => {
    setInternalSelected((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Seleccionar todos los disponibles
  const selectAllAvailable = () => {
    const availableIds = filteredItems.map((item) => item.id);
    setInternalSelected(availableIds);
  };

  // Limpiar selección
  const clearSelection = () => {
    setInternalSelected([]);
  };

  // Agregar elementos seleccionados
  const addSelectedItems = () => {
    const itemsToAdd = filteredItems.filter((item) =>
      internalSelected.includes(item.id)
    );
    onAddItems(itemsToAdd);
    setInternalSelected([]);
    toast.success(
      `${itemsToAdd.length} ${itemTypeNamePlural} agregados exitosamente`
    );
  };

  // Renderizado por defecto de avatar
  const defaultRenderAvatar = (item: T) => (
    <div
      className={`w-10 h-10 ${
        getItemColor?.(item) || 'bg-gray-100'
      } rounded-full flex items-center justify-center flex-shrink-0`}
    >
      <User className="w-5 h-5" />
    </div>
  );

  // Renderizado por defecto de info extra
  const defaultRenderExtraInfo = (item: T) => (
    <>
      <p className="text-xs text-gray-600">{item.telefono || 'Sin teléfono'}</p>
      {item.notas && (
        <p className="text-xs text-gray-500 mt-1 truncate">{item.notas}</p>
      )}
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[95vh] overflow-hidden flex flex-col mx-2 sm:mx-0">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="text-base sm:text-lg">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {!showNewForm ? (
            <>
              {/* Búsqueda */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 text-sm"
                  />
                </div>
                {searchTerm && (
                  <div className="mt-2 text-xs text-gray-500">
                    Buscando: &ldquo;{searchTerm}&rdquo;
                  </div>
                )}
              </div>

              {/* Controles de selección */}
              <div className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllAvailable}
                      className="text-xs h-8"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Seleccionar Todos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                      className="text-xs h-8"
                      disabled={internalSelected.length === 0}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Limpiar
                    </Button>
                    {searchTerm && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchTerm('')}
                        className="text-xs h-8 bg-blue-50 text-blue-700 border-blue-200"
                      >
                        <Search className="w-3 h-3 mr-1" />
                        Limpiar Búsqueda
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {internalSelected.length > 0 && (
                      <Badge className="bg-blue-100 text-blue-700">
                        {internalSelected.length} seleccionados
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Lista de elementos disponibles */}
              <div className="flex-1 overflow-hidden">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {itemTypeNamePlural.charAt(0).toUpperCase() +
                    itemTypeNamePlural.slice(1)}{' '}
                  Disponibles
                  {filteredItems.length > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 text-xs"
                    >
                      {filteredItems.length} encontrados
                    </Badge>
                  )}
                </h4>
                <div
                  className={`${maxSelectionHeight} overflow-y-auto space-y-2 pr-1 border rounded-lg p-3 bg-gray-50/50`}
                >
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                      const isSelected = internalSelected.includes(item.id);
                      return (
                        <Card
                          key={item.id}
                          className={`cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'bg-blue-50 border-blue-300 shadow-sm'
                              : 'bg-white border-gray-200 hover:shadow-md'
                          }`}
                          onClick={() => toggleSelection(item.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {/* Checkbox */}
                                <div
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                    isSelected
                                      ? 'bg-blue-600 border-blue-600'
                                      : 'border-gray-300'
                                  }`}
                                >
                                  {isSelected && (
                                    <CheckCircle className="w-3 h-3 text-white" />
                                  )}
                                </div>

                                {/* Avatar */}
                                {renderAvatar
                                  ? renderAvatar(item)
                                  : defaultRenderAvatar(item)}

                                {/* Información */}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                                    {item.nombre}
                                  </h3>
                                  {renderExtraInfo
                                    ? renderExtraInfo(item)
                                    : defaultRenderExtraInfo(item)}
                                </div>
                              </div>

                              {/* Botón de selección */}
                              <Button
                                variant="outline"
                                size="sm"
                                className={`h-8 w-8 p-0 ${
                                  isSelected
                                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSelection(item.id);
                                }}
                              >
                                {isSelected ? (
                                  <X className="w-4 h-4" />
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">
                        {debouncedSearch
                          ? `No se encontraron ${itemTypeNamePlural} que coincidan con "${debouncedSearch}"`
                          : `No hay ${itemTypeNamePlural} disponibles`}
                      </p>
                      {debouncedSearch && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 text-xs"
                          onClick={() => setSearchTerm('')}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Limpiar búsqueda
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Elementos base */}
              {baseItems.length > 0 && (
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-blue-700 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Base del servicio anterior ({baseItems.length})
                    </h4>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1 border rounded-lg p-3 bg-blue-50/50">
                    {baseItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm border border-blue-200"
                      >
                        <span className="text-blue-800 truncate flex-1 min-w-0">
                          {item.nombre}
                          {item.telefono && (
                            <span className="text-blue-600 ml-2">
                              📞 {item.telefono}
                            </span>
                          )}
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-blue-100 text-blue-700 text-xs"
                        >
                          Base
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Elementos ya agregados */}
              {selectedItems?.length > 0 && (
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-green-700 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Agregados en esta sesión ({selectedItems?.length})
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 text-xs h-6 px-2"
                      onClick={() => {
                        onClearAllItems();
                        toast.info(
                          `${itemTypeNamePlural.charAt(0).toUpperCase() + itemTypeNamePlural.slice(1)} eliminados`
                        );
                      }}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Limpiar
                    </Button>
                  </div>
                  <div className="max-h-56 h-56 overflow-y-auto space-y-1 pr-1 border rounded-lg p-3 bg-green-50/50">
                    {selectedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 bg-green-50 rounded text-sm border border-green-200"
                      >
                        <span className="text-green-800 truncate flex-1 min-w-0">
                          {item.nombre}
                          {item.telefono && (
                            <span className="text-green-600 ml-2">
                              📞 {item.telefono}
                            </span>
                          )}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 h-6 w-6 p-0 flex-shrink-0 ml-2"
                          onClick={() => onRemoveItem(item.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex-shrink-0 pt-3 border-t space-y-2">
                <div className="flex gap-2">
                  {showAddNewButton && onAddNewItem && (
                    <Button
                      variant="outline"
                      className="flex-1 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200 h-10 text-sm"
                      onClick={() => setShowNewForm(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Nuevo
                    </Button>
                  )}
                  {internalSelected.length > 0 && (
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 h-10 text-sm"
                      onClick={() => {
                        addSelectedItems();
                        onClose();
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar {internalSelected.length} {itemTypeNamePlural}
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            // Formulario para nuevo elemento (delegado al componente padre)
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto">
                {onAddNewItem && onAddNewItem()}
              </div>
              <div className="flex-shrink-0 pt-3 border-t">
                <Button
                  variant="outline"
                  className="w-full bg-transparent h-10 text-sm"
                  onClick={() => setShowNewForm(false)}
                >
                  <X className="w-4 h-4 mr-1" />
                  Volver
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
