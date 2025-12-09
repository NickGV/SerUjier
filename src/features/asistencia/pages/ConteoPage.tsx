'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePersistentConteo } from '@/features/asistencia/hooks/use-persistent-conteo';
import { useConteoCounters } from '@/features/asistencia/hooks/use-conteo-counters';
import { useBulkCount } from '@/features/asistencia/hooks/use-bulk-count';
import { useConteoSave } from '@/features/asistencia/hooks/use-conteo-save';
import { useConteoEditMode } from '@/features/asistencia/hooks/use-conteo-edit-mode';
import {
  fetchSimpatizantes,
  fetchMiembros,
  addSimpatizante,
  fetchUjieres,
} from '@/shared/lib/utils';
import { getActiveUjieres } from '@/features/asistencia/utils/ujier-utils';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Plus, Save, Eye, Loader2, Calendar } from 'lucide-react';
import { type Miembro, type MiembroSimplificado } from '@/shared/types';

// Componentes modulares
import {
  CounterCard,
  SimpatizantesList,
  BulkCountDialog,
  SimpatizantesDialog,
  MiembrosDialog,
  AsistentesDialog,
  HermanosVisitasDialog,
  ConteoHeader,
  EditModeBanner,
  ConsecutiveModeBanner,
} from '@/features/asistencia/components';
import { getAllAsistentes } from '@/features/asistencia/utils/helpers';
import { calculateAllTotals } from '../lib/calculations';
import type {
  SimpatizanteLite,
  CategoriaPlural,
  ConteoStateWithIndex,
} from '@/features/asistencia/types';

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
  } = usePersistentConteo();

  // Get datosServicioBase from persistent state
  const datosServicioBase = conteoState.datosServicioBase;

  // Estados para datos de Firebase
  const [simpatizantes, setSimpatizantes] = useState<SimpatizanteLite[]>([]);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
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
      clearDayData,
      updateConteo,
      setDatosServicioBase,
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
  const [showSimpatizantesDialog, setShowSimpatizantesDialog] = useState(false);
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

      const [simpatizantesData, miembrosData, ujieresData] = await Promise.all([
        fetchSimpatizantes(),
        fetchMiembros(),
        fetchUjieres(),
      ]);
      setSimpatizantes(simpatizantesData);
      setMiembros(miembrosData);
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

  // ========== HANDLERS AGRUPADOS ==========

  // Handlers para simpatizantes
  const simpatizantesHandlers = {
    handleAdd: (newSimpatizantes: SimpatizanteLite[]) => {
      updateConteo({
        simpatizantesDelDia: [
          ...conteoState.simpatizantesDelDia,
          ...newSimpatizantes,
        ],
      });
    },

    handleAddNew: async (simpatizanteData: Omit<SimpatizanteLite, 'id'>) => {
      const withFecha = {
        fechaRegistro: new Date().toISOString().split('T')[0],
        ...simpatizanteData,
      } as Required<Pick<SimpatizanteLite, 'fechaRegistro'>> &
        Omit<SimpatizanteLite, 'id'>;
      const result = await addSimpatizante(withFecha);
      const creado: SimpatizanteLite = {
        id: (result as { id: string }).id,
        ...withFecha,
      };

      updateConteo({
        simpatizantesDelDia: [...conteoState.simpatizantesDelDia, creado],
      });
      setSimpatizantes((prev) => [...prev, creado]);
    },

    handleRemove: (simpatizanteId: string) => {
      updateConteo({
        simpatizantesDelDia: conteoState.simpatizantesDelDia.filter(
          (s) => s.id !== simpatizanteId
        ),
      });
    },

    handleClearAll: () => {
      updateConteo({
        simpatizantesDelDia: [],
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
        id: Date.now().toString(),
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
    openSimpatizantes: () => setShowSimpatizantesDialog(true),
    openMiembros: (categoria: CategoriaPlural) => {
      setCategoriaSeleccionada(categoria);
      setShowMiembrosDialog(true);
    },
    openHermanosVisitas: () => setShowHermanosVisitasDialog(true),
    openAsistentes: () => setShowAsistentesDialog(true),
  };

  const handleOpenDialog = (categoria: string) => {
    if (categoria === 'simpatizantes') {
      dialogHandlers.openSimpatizantes();
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
    conteoState.simpatizantesDelDia.length > 0 ||
    (conteoState.modoConsecutivo &&
      ((datosServicioBase?.simpatizantesAsistieron &&
        datosServicioBase.simpatizantesAsistieron.length > 0) ||
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
    conteoState.simpatizantesDelDia.length +
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
    (conteoState.modoConsecutivo && datosServicioBase?.simpatizantesAsistieron
      ? datosServicioBase.simpatizantesAsistieron.length
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
        onFechaChange={(fecha) => updateConteo({ fecha })}
        onTipoServicioChange={(tipoServicio) => updateConteo({ tipoServicio })}
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
      <Card className="bg-gradient-to-r from-slate-700 to-slate-800 text-white border-0 shadow-lg">
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
      <SimpatizantesDialog
        isOpen={showSimpatizantesDialog}
        onClose={() => setShowSimpatizantesDialog(false)}
        simpatizantes={simpatizantes}
        simpatizantesDelDia={conteoState.simpatizantesDelDia}
        onAddSimpatizantes={simpatizantesHandlers.handleAdd}
        onAddNewSimpatizante={simpatizantesHandlers.handleAddNew}
        onRemoveSimpatizante={simpatizantesHandlers.handleRemove}
        onClearAllSimpatizantes={simpatizantesHandlers.handleClearAll}
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
            [
              'hermanos',
              'hermanas',
              'ninos',
              'adolescentes',
              'hermanosApartados',
            ].includes(categoria)
          ) {
            miembrosHandlers.handleRemove(categoria as CategoriaPlural, id);
          } else if (categoria === 'hermanosVisitas') {
            hermanosVisitasHandlers.handleRemove(id);
          } else {
            simpatizantesHandlers.handleRemove(id);
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
            ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
            : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800'
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

      {/* Simpatizantes del día */}
      <SimpatizantesList
        simpatizantesDelDia={conteoState.simpatizantesDelDia}
        onRemoveSimpatizante={simpatizantesHandlers.handleRemove}
      />

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
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl py-3"
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
                  A: {datosServicioBase.adolescentes} | S:{' '}
                  {datosServicioBase.simpatizantes}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
