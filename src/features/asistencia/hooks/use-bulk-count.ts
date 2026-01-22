'use client';

import { useState } from 'react';
import { type BulkCounts, type ConteoState } from '../types';

interface UseBulkCountProps {
  conteoState: ConteoState;
  updateConteo: (updates: Partial<ConteoState>) => void;
}

const initialBulkCounts: BulkCounts = {
  hermanos: '',
  hermanas: '',
  ninos: '',
  adolescentes: '',
  simpatizantes: '',
  visitas: '',
  hermanosApartados: '',
  hermanosVisitas: '',
};

export function useBulkCount({ conteoState, updateConteo }: UseBulkCountProps) {
  const [showBulkCountDialog, setShowBulkCountDialog] = useState(false);
  const [bulkCounts, setBulkCounts] = useState<BulkCounts>(initialBulkCounts);

  const handleBulkCountSubmit = () => {
    const counts = {
      hermanos: parseInt(bulkCounts.hermanos) || 0,
      hermanas: parseInt(bulkCounts.hermanas) || 0,
      ninos: parseInt(bulkCounts.ninos) || 0,
      adolescentes: parseInt(bulkCounts.adolescentes) || 0,
      simpatizantes: parseInt(bulkCounts.simpatizantes) || 0,
      visitas: parseInt(bulkCounts.visitas) || 0,
      hermanosApartados: parseInt(bulkCounts.hermanosApartados) || 0,
      hermanosVisitas: parseInt(bulkCounts.hermanosVisitas) || 0,
    };

    updateConteo({
      hermanos: conteoState.hermanos + counts.hermanos,
      hermanas: conteoState.hermanas + counts.hermanas,
      ninos: conteoState.ninos + counts.ninos,
      adolescentes: conteoState.adolescentes + counts.adolescentes,
      simpatizantesCount: conteoState.simpatizantesCount + counts.simpatizantes,
      visitasCount: (conteoState.visitasCount || 0) + counts.visitas,
      hermanosApartados:
        conteoState.hermanosApartados + counts.hermanosApartados,
      hermanosVisitasCount:
        conteoState.hermanosVisitasCount + counts.hermanosVisitas,
    });

    resetBulkCounts();
  };

  const resetBulkCounts = () => {
    setBulkCounts(initialBulkCounts);
  };

  return {
    showBulkCountDialog,
    setShowBulkCountDialog,
    bulkCounts,
    setBulkCounts,
    handleBulkCountSubmit,
    resetBulkCounts,
  };
}
