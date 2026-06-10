'use client';

import { useBulkCount } from '@/features/asistencia/hooks/use-bulk-count';
import { useConteoCounters } from '@/features/asistencia/hooks/use-conteo-counters';
import { useConteoEditMode } from '@/features/asistencia/hooks/use-conteo-edit-mode';
import { useConteoSave } from '@/features/asistencia/hooks/use-conteo-save';
import { usePersistentConteo } from '@/features/asistencia/hooks/use-persistent-conteo';
import { getServicioPorFecha } from '@/features/asistencia/lib/servicio-por-fecha';
import { getActiveUjieres } from '@/features/asistencia/utils/ujier-utils';
import { addAmigo, fetchAmigos } from '@/firebase/amigos';
import {
  addHeRestauracion,
  fetchMiembros,
  fetchUjieres,
  fetchHeRestauracion,
} from '@/shared/firebase';
import {
  type Miembro,
  type MiembroSimplificado,
  type HeRestauracion,
} from '@/shared/types';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Calendar, Eye, Loader2, Plus, Save } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Componentes modulares
import {
  AsistentesDialog,
  BulkCountDialog,
  ConsecutiveModeBanner,
  ConteoHeader,
  CounterCard,
  EditModeBanner,
  HeRestauracionDialog,
  HermanosVisitasDialog,
  MiembrosDialog,
  AmigosDialog,
} from '@/features/asistencia/components';
import type {
  AmigoLite,
  CategoriaPlural,
  ConteoStateWithIndex,
} from '@/features/asistencia/types';
import { getAllAsistentes } from '@/features/asistencia/utils/helpers';
import { calculateAllTotals } from '../lib/calculations';

export default function ConteoPage() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('editId');

  // Hook persistente para el conteo
  const {
    conteoState,
    updateConteo,
    clearDayData,
    loadHistorialData,
    isLoaded,
    setDatosServicioBase,
    resetConteo,
  } = usePersistentConteo();

  // Get datosServicioBase from persistent state
  const datosServicioBase = conteoState.datosServicioBase;

  // Estados para datos de Firebase
  const [amigos, setAmigos] = useState<AmigoLite[]>([]);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [heRestauracion, setHeRestauracion] = useState<HeRestauracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [ujieres, setUjieres] = useState<string[]>([]);

  // Hook para modo edición
  const { isEditMode, editingRecordId, loadingEdit, handleCancelEdit } =
    useConteoEditMode({
      editId,
      isLoaded,
      loading,
      loadHistorialData,
      setDatosServicioBase,
      resetConteo,
      conteoState,
    });

  // Hook para los contadores
  const {
    counters,
    editingCounter,
    tempValue,
    handleCounterEdit,
    saveCounterEdit,
    setTempValue,
  } = useConteoCounters({ conteoState, updateConteo, datosServicioBase });

  // Hook para bulk count
  const {
    showBulkCountDialog,
    setShowBulkCountDialog,
    bulkCounts,
    setBulkCounts,
    handleBulkCountSubmit,
    resetBulkCounts,
  } = useBulkCount({ conteoState, updateConteo });

  // Hook para guardado
  const {
    isSaving,
    showContinuarDialog,
    handleSaveConteo,
    continuarConDominical,
    noContinarConDominical,
  } = useConteoSave({
    conteoState,
    datosServicioBase,
    setDatosServicioBase,
    clearDayData,
    updateConteo,
    isEditMode,
    editingRecordId,
  });

  // Estados para los diálogos
  const [showAmigosDialog, setShowAmigosDialog] = useState(false);
  const [showHeRestauracionDialog, setShowHeRestauracionDialog] =
    useState(false);
  const [showAsistentesDialog, setShowAsistentesDialog] = useState(false);
  const [showMiembrosDialog, setShowMiembrosDialog] = useState(false);
  const [showHermanosVisitasDialog, setShowHermanosVisitasDialog] =
    useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<
    CategoriaPlural | ''
  >('');

  // Función para cargar datos desde Firebase
  const loadFirebaseData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      const [amigosData, miembrosData, ujieresData, heRestauracionData] =
        await Promise.all([
          fetchAmigos(),
          fetchMiembros(),
          fetchUjieres(),
          fetchHeRestauracion(),
        ]);
      setAmigos(amigosData as AmigoLite[]);
      setMiembros(miembrosData);
      setHeRestauracion(heRestauracionData);
      // Extraer solo los nombres de los ujieres activos usando la utilidad
      const nombresUjieres = getActiveUjieres(ujieresData);
      setUjieres(nombresUjieres);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Efecto para cargar datos desde Firebase al montar
  useEffect(() => {
    loadFirebaseData();
  }, []);

  // Limpiar selección de ujieres al desmontar el componente (al salir de la página)
  useEffect(() => {
    return () => {
      // Cleanup: limpiar selección de ujieres al salir
      updateConteo({
        selectedUjieres: [],
        ujierSeleccionado: '',
        ujierPersonalizado: '',
      });
    };
  }, [updateConteo]);

  // ========== HANDLERS AGRUPADOS ==========

  // Handlers para amigos
  const amigosHandlers = {
    handleAdd: (newAmigos: AmigoLite[]) => {
      updateConteo({
        amigosDelDia: [...conteoState.amigosDelDia, ...newAmigos],
      });
    },

    handleAddNew: async (amigoData: {
      nombre: string;
      telefono?: string;
      notas?: string;
    }) => {
      const amigoInput = {
        nombre: amigoData.nombre,
        telefono: amigoData.telefono ?? '',
        notas: amigoData.notas ?? '',
        fechaRegistro: new Date().toISOString().split('T')[0],
        migratedFrom: null,
      };
      const result = await addAmigo(amigoInput);
      const creado: AmigoLite = {
        ...amigoInput,
        id: (result as { id: string }).id,
      };

      updateConteo({
        amigosDelDia: [...conteoState.amigosDelDia, creado],
      });
      setAmigos((prev) => [...prev, creado]);
    },

    handleRemove: (amigoId: string) => {
      updateConteo({
        amigosDelDia: conteoState.amigosDelDia.filter((a) => a.id !== amigoId),
      });
    },

    handleClearAll: () => {
      updateConteo({
        amigosDelDia: [],
      });
    },
  };

  // Handlers para heRestauracion
  const heRestauracionHandlers = {
    handleAdd: (newHeRestauracion: HeRestauracion[]) => {
      const simplified = newHeRestauracion.map((h) => ({
        id: h.id,
        nombre: h.nombre,
      }));
      updateConteo({
        heRestauracionDelDia: [
          ...conteoState.heRestauracionDelDia,
          ...simplified,
        ],
      });
    },

    handleAddNew: async (
      heRestauracionData: Omit<HeRestauracion, 'id'> & { nombre: string }
    ) => {
      const withFecha = {
        fechaRegistro: new Date().toISOString().split('T')[0],
        ...heRestauracionData,
      };
      const result = await addHeRestauracion(withFecha);
      const creado: HeRestauracion = {
        id: (result as { id: string }).id,
        ...withFecha,
      };

      const simplified = {
        id: creado.id,
        nombre: creado.nombre,
      };

      updateConteo({
        heRestauracionDelDia: [...conteoState.heRestauracionDelDia, simplified],
      });
      setHeRestauracion((prev) => [...prev, creado]);
    },

    handleRemove: (heRestauracionId: string) => {
      updateConteo({
        heRestauracionDelDia: conteoState.heRestauracionDelDia.filter(
          (h) => h.id !== heRestauracionId
        ),
      });
    },

    handleClearAll: () => {
      updateConteo({
        heRestauracionDelDia: [],
      });
    },
  };

  // Handlers para miembros
  const categoriaKey = (c: CategoriaPlural) => `${c}DelDia` as const;

  const miembrosHandlers = {
    handleAdd: (
      categoria: CategoriaPlural,
      newMiembros: MiembroSimplificado[]
    ) => {
      const key = categoriaKey(categoria);
      const currentList = conteoState[key] as MiembroSimplificado[];
      const updates: Partial<ConteoStateWithIndex> = {};
      const newMembers = newMiembros.map((miembro) => ({
        id: miembro.id,
        nombre: miembro.nombre,
      }));

      (updates as ConteoStateWithIndex)[key] = [...currentList, ...newMembers];
      updateConteo(updates);
    },

    handleRemove: (categoria: CategoriaPlural, miembroId: string) => {
      const key = categoriaKey(categoria);
      const currentList: MiembroSimplificado[] = conteoState[
        key
      ] as MiembroSimplificado[];
      const updates: Partial<ConteoStateWithIndex> = {};
      (updates as ConteoStateWithIndex)[key] = currentList.filter(
        (m) => m.id !== miembroId
      );
      updateConteo(updates);
    },

    handleClearAll: (categoria: CategoriaPlural) => {
      const key = categoriaKey(categoria);
      const updates: Partial<ConteoStateWithIndex> = {};
      (updates as ConteoStateWithIndex)[key] = [];
      updateConteo(updates);
    },
  };

  // Handlers para hermanos visitas
  const hermanosVisitasHandlers = {
    handleAdd: (nuevoHermano: { nombre: string; iglesia?: string }) => {
      const hermanoVisita = {
        id: `hv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nombre: nuevoHermano.nombre,
        iglesia: nuevoHermano.iglesia,
      };

      updateConteo({
        hermanosVisitasDelDia: [
          ...conteoState.hermanosVisitasDelDia,
          hermanoVisita,
        ],
      });
    },

    handleRemove: (hermanoId: string) => {
      updateConteo({
        hermanosVisitasDelDia: conteoState.hermanosVisitasDelDia.filter(
          (h) => h.id !== hermanoId
        ),
      });
    },
  };

  // Handlers para los diálogos
  const dialogHandlers = {
    openAmigos: () => setShowAmigosDialog(true),
    openHeRestauracion: () => setShowHeRestauracionDialog(true),
    openMiembros: (categoria: CategoriaPlural) => {
      setCategoriaSeleccionada(categoria);
      setShowMiembrosDialog(true);
    },
    openHermanosVisitas: () => setShowHermanosVisitasDialog(true),
    openAsistentes: () => setShowAsistentesDialog(true),
  };

  const handleOpenDialog = (categoria: string) => {
    if (categoria === 'amigos') {
      dialogHandlers.openAmigos();
    } else if (categoria === 'heRestauracion') {
      dialogHandlers.openHeRestauracion();
    } else if (categoria === 'hermanosVisitas') {
      dialogHandlers.openHermanosVisitas();
    } else {
      dialogHandlers.openMiembros(categoria as CategoriaPlural);
    }
  };

  // Handlers para los contadores
  const handleCounterIncrement = (counter: {
    value: number;
    setter: (v: number) => void;
  }) => {
    counter.setter(counter.value + 1);
  };

  const handleCounterDecrement = (counter: {
    value: number;
    setter: (v: number) => void;
  }) => {
    counter.setter(Math.max(0, counter.value - 1));
  };

  // Calcular totales usando la función centralizada
  const totals = calculateAllTotals(conteoState, datosServicioBase);

  // Obtener lista de asistentes para el diálogo
  const asistentes = getAllAsistentes(
    conteoState as ConteoStateWithIndex,
    datosServicioBase
  );

  // Condición para mostrar el botón de ver asistentes
  const hasAsistentes =
    conteoState.hermanosDelDia.length > 0 ||
    conteoState.hermanasDelDia.length > 0 ||
    conteoState.ninosDelDia.length > 0 ||
    conteoState.adolescentesDelDia.length > 0 ||
    conteoState.amigosDelDia.length > 0 ||
    (conteoState.modoConsecutivo &&
      ((datosServicioBase?.amigosAsistieron &&
        datosServicioBase.amigosAsistieron.length > 0) ||
        (datosServicioBase?.miembrosAsistieron?.hermanos &&
          datosServicioBase.miembrosAsistieron.hermanos.length > 0) ||
        (datosServicioBase?.miembrosAsistieron?.hermanas &&
          datosServicioBase.miembrosAsistieron.hermanas.length > 0) ||
        (datosServicioBase?.miembrosAsistieron?.ninos &&
          datosServicioBase.miembrosAsistieron.ninos.length > 0) ||
        (datosServicioBase?.miembrosAsistieron?.adolescentes &&
          datosServicioBase.miembrosAsistieron.adolescentes.length > 0)));

  // Calcular total de asistentes para el badge
  const totalAsistentesIndividuales =
    conteoState.hermanosDelDia.length +
    conteoState.hermanasDelDia.length +
    conteoState.ninosDelDia.length +
    conteoState.adolescentesDelDia.length +
    conteoState.amigosDelDia.length +
    (conteoState.modoConsecutivo &&
    datosServicioBase?.miembrosAsistieron?.hermanos
      ? datosServicioBase.miembrosAsistieron.hermanos.length
      : 0) +
    (conteoState.modoConsecutivo &&
    datosServicioBase?.miembrosAsistieron?.hermanas
      ? datosServicioBase.miembrosAsistieron.hermanas.length
      : 0) +
    (conteoState.modoConsecutivo && datosServicioBase?.miembrosAsistieron?.ninos
      ? datosServicioBase.miembrosAsistieron.ninos.length
      : 0) +
    (conteoState.modoConsecutivo &&
    datosServicioBase?.miembrosAsistieron?.adolescentes
      ? datosServicioBase.miembrosAsistieron.adolescentes.length
      : 0) +
    (conteoState.modoConsecutivo && datosServicioBase?.amigosAsistieron
      ? datosServicioBase.amigosAsistieron.length
      : 0);

  if (loading || !isLoaded || loadingEdit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4" />
          <p className="text-slate-600">
            {loadingEdit
              ? 'Cargando datos para edición...'
              : 'Cargando datos...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 min-h-screen max-w-full overflow-x-hidden">
      {/* Banner de modo edición */}
      {isEditMode && <EditModeBanner onCancel={handleCancelEdit} />}

      {/* Header */}
      <ConteoHeader
        fecha={conteoState.fecha}
        tipoServicio={conteoState.tipoServicio}
        selectedUjieres={conteoState.selectedUjieres}
        ujierSeleccionado={conteoState.ujierSeleccionado}
        ujierPersonalizado={conteoState.ujierPersonalizado}
        ujieres={ujieres}
        onFechaChange={(fecha) => {
          if (conteoState.servicioElegidoManualmente) {
            updateConteo({ fecha });
            return;
          }

          updateConteo({
            fecha,
            tipoServicio: getServicioPorFecha(fecha),
            servicioElegidoManualmente: false,
          });
        }}
        onTipoServicioChange={(tipoServicio) =>
          updateConteo({ tipoServicio, servicioElegidoManualmente: true })
        }
        onUjieresChange={(updates) => updateConteo(updates)}
        onShowBulkCount={() => setShowBulkCountDialog(true)}
        onRefreshData={() => loadFirebaseData(true)}
        isRefreshing={isRefreshing}
      />

      {/* Banner de modo consecutivo */}
      {conteoState.modoConsecutivo && datosServicioBase && (
        <ConsecutiveModeBanner
          datosServicioBase={datosServicioBase}
          tipoServicio={conteoState.tipoServicio}
        />
      )}

      {/* Total Counter */}
      <Card className="bg-linear-to-r from-slate-700 to-slate-800 text-white border-0 shadow-lg">
        <CardContent className="p-4 sm:p-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">{totals.total}</h2>
          <p className="text-slate-200 text-sm sm:text-base">
            Total de Asistentes
          </p>
        </CardContent>
      </Card>

      {/* Counters */}
      <div className="space-y-3 sm:space-y-4">
        {counters.map((counter) => (
          <CounterCard
            key={counter.key}
            counter={counter}
            editingCounter={editingCounter}
            tempValue={tempValue}
            onEdit={handleCounterEdit}
            onSaveEdit={saveCounterEdit}
            onTempValueChange={setTempValue}
            onOpenDialog={handleOpenDialog}
            onIncrement={() => handleCounterIncrement(counter)}
            onDecrement={() => handleCounterDecrement(counter)}
          />
        ))}
      </div>

      {/* Ver Lista Asistentes Button */}
      {hasAsistentes && (
        <Button
          variant="outline"
          className="w-full h-12 md:h-14 bg-transparent border-blue-200 text-blue-700 hover:bg-blue-50 active:bg-blue-100 rounded-xl py-4 md:py-5 shadow-lg text-base md:text-lg font-semibold mb-4"
          onClick={dialogHandlers.openAsistentes}
          aria-label="Ver lista completa de asistentes"
        >
          <Eye className="w-5 h-5 md:w-6 md:h-6 mr-2" />
          <span className="flex-1 text-center">Ver Lista de Asistentes</span>
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-700 border-blue-300 ml-2 text-sm"
          >
            {totalAsistentesIndividuales}
          </Badge>
        </Button>
      )}

      {/* Diálogos modulares */}
      <AmigosDialog
        isOpen={showAmigosDialog}
        onClose={() => setShowAmigosDialog(false)}
        amigos={amigos}
        amigosDelDia={conteoState.amigosDelDia}
        baseAmigos={
          conteoState.modoConsecutivo
            ? (datosServicioBase?.amigosAsistieron as AmigoLite[]) || []
            : []
        }
        onAddAmigos={amigosHandlers.handleAdd}
        onAddNewAmigo={amigosHandlers.handleAddNew}
        onRemoveAmigo={amigosHandlers.handleRemove}
        onClearAllAmigos={amigosHandlers.handleClearAll}
      />

      <HeRestauracionDialog
        isOpen={showHeRestauracionDialog}
        onClose={() => setShowHeRestauracionDialog(false)}
        heRestauracion={heRestauracion}
        heRestauracionDelDia={conteoState.heRestauracionDelDia}
        baseHeRestauracion={
          conteoState.modoConsecutivo
            ? datosServicioBase?.miembrosAsistieron?.heRestauracion || []
            : []
        }
        onAddHeRestauracion={heRestauracionHandlers.handleAdd}
        onAddNewHeRestauracion={heRestauracionHandlers.handleAddNew}
        onRemoveHeRestauracion={heRestauracionHandlers.handleRemove}
        onClearAllHeRestauracion={heRestauracionHandlers.handleClearAll}
      />

      {categoriaSeleccionada && (
        <MiembrosDialog
          isOpen={showMiembrosDialog}
          onClose={() => setShowMiembrosDialog(false)}
          categoria={categoriaSeleccionada as CategoriaPlural}
          miembrosDisponibles={miembros}
          miembrosDelDia={
            conteoState[categoriaKey(categoriaSeleccionada as CategoriaPlural)]
          }
          baseMiembros={
            conteoState.modoConsecutivo
              ? (datosServicioBase?.miembrosAsistieron?.[
                  categoriaSeleccionada as keyof typeof datosServicioBase.miembrosAsistieron
                ] as MiembroSimplificado[] | undefined) || []
              : []
          }
          onAddMiembros={(newMiembros) =>
            miembrosHandlers.handleAdd(
              categoriaSeleccionada as CategoriaPlural,
              newMiembros
            )
          }
          onRemoveMiembro={(miembroId) =>
            miembrosHandlers.handleRemove(
              categoriaSeleccionada as CategoriaPlural,
              miembroId
            )
          }
          onClearAllMiembros={() =>
            miembrosHandlers.handleClearAll(
              categoriaSeleccionada as CategoriaPlural
            )
          }
        />
      )}

      <AsistentesDialog
        isOpen={showAsistentesDialog}
        onClose={() => setShowAsistentesDialog(false)}
        asistentes={asistentes}
        onRemoveAsistente={(id, categoria, tipo) => {
          if (
            tipo === 'miembro' &&
            ['hermanos', 'hermanas', 'ninos', 'adolescentes'].includes(
              categoria
            )
          ) {
            miembrosHandlers.handleRemove(categoria as CategoriaPlural, id);
          } else if (categoria === 'heRestauracion') {
            heRestauracionHandlers.handleRemove(id);
          } else if (categoria === 'amigos') {
            amigosHandlers.handleRemove(id);
          } else if (categoria === 'hermanosVisitas') {
            hermanosVisitasHandlers.handleRemove(id);
          }
        }}
      />

      <BulkCountDialog
        isOpen={showBulkCountDialog}
        onClose={() => setShowBulkCountDialog(false)}
        bulkCounts={bulkCounts}
        onBulkCountsChange={setBulkCounts}
        onSubmit={handleBulkCountSubmit}
        onReset={resetBulkCounts}
      />

      <HermanosVisitasDialog
        isOpen={showHermanosVisitasDialog}
        onClose={() => setShowHermanosVisitasDialog(false)}
        hermanosVisitasDelDia={conteoState.hermanosVisitasDelDia}
        onAddHermanoVisita={hermanosVisitasHandlers.handleAdd}
        onRemoveHermanoVisita={hermanosVisitasHandlers.handleRemove}
      />

      {/* Save Button */}
      <Button
        onClick={handleSaveConteo}
        disabled={isSaving}
        className={`w-full h-12 md:h-14 ${
          isEditMode
            ? 'bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
            : 'bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800'
        } active:from-slate-800 active:to-slate-900 text-white rounded-xl py-4 md:py-5 shadow-lg text-base md:text-lg font-semibold mb-4`}
        aria-label={
          isEditMode ? 'Actualizar registro' : 'Guardar conteo de asistencia'
        }
      >
        {isSaving ? (
          <Loader2 className="w-5 h-5 md:w-6 md:h-6 mr-2 animate-spin" />
        ) : (
          <Save className="w-5 h-5 md:w-6 md:h-6 mr-2" />
        )}
        <span className="flex-1 text-center">
          {isSaving
            ? isEditMode
              ? 'Actualizando...'
              : 'Guardando...'
            : isEditMode
              ? 'Actualizar Registro'
              : conteoState.modoConsecutivo
                ? 'Guardar Conteo de Asistencia'
                : 'Guardar Conteo de Asistencia'}
        </span>
      </Button>

      {/* Dialog para continuar con dominical */}
      {showContinuarDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Servicio Consecutivo
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                El conteo del servicio de {datosServicioBase?.servicio} ha sido
                guardado. ¿Desea continuar con el conteo del servicio dominical
                manteniendo los asistentes actuales como base?
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={continuarConDominical}
                className="w-full bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl py-3"
              >
                <Plus className="w-5 h-5 mr-2" />
                Sí, Continuar con Dominical
              </Button>
              <Button
                variant="outline"
                onClick={noContinarConDominical}
                className="w-full bg-transparent rounded-xl py-3"
              >
                No, Solo {datosServicioBase?.servicio}
              </Button>
            </div>

            {datosServicioBase && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">
                  Resumen {datosServicioBase.servicio}:
                </div>
                <div className="text-sm font-medium text-gray-800">
                  Total: {datosServicioBase.total} asistentes
                </div>
                <div className="text-xs text-gray-500">
                  H: {datosServicioBase.hermanos} | M:{' '}
                  {datosServicioBase.hermanas} | N: {datosServicioBase.ninos} |
                  A: {datosServicioBase.adolescentes} | Am:{' '}
                  {datosServicioBase.amigos}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
