// Exportar todo desde shared (solo cliente)
// NOTA: auth.ts y firebase-admin.ts son server-only, importar directamente:
// import { ... } from '@/shared/lib/auth';
// import { ... } from '@/shared/lib/firebase-admin';
export * from './components';
export * from './contexts';
export * from './firebase';
export * from './hooks';
export * from './lib/firebase';
export * from './lib/sort-utils';
export { cn, hashPassword } from './lib/utils';
export * from './types';
export * from './ui';
