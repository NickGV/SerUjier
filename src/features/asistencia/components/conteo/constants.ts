export const servicios = [
  { value: 'dominical', label: 'Dominical' },
  { value: 'oracion', label: 'Oración y Enseñanza' },
  { value: 'dorcas', label: 'Hermanas Dorcas' },
  { value: 'evangelismo', label: 'Evangelismo' },
  { value: 'misionero', label: 'Misionero' },
  { value: 'jovenes', label: 'Jóvenes' },
  { value: 'intercesion', label: 'Intercesión' },
];

export const CATEGORIA_COLORS = {
  hermanos: 'bg-slate-600',
  hermanas: 'bg-rose-600',
  ninos: 'bg-amber-600',
  adolescentes: 'bg-purple-600',
  simpatizantes: 'bg-emerald-600',
  hermanosApartados: 'bg-orange-600',
  hermanosVisitas: 'bg-indigo-600',
} as const;

export const CATEGORIA_LABELS = {
  hermanos: 'Hermanos',
  hermanas: 'Hermanas',
  ninos: 'Niños',
  adolescentes: 'Adolescentes',
  simpatizantes: 'Simpatizantes',
  hermanosApartados: 'Hermanos Apartados',
  hermanosVisitas: 'Hermanos Visitas',
} as const;
