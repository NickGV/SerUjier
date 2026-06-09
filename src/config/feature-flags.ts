export const featureFlags = {
  // Ya no hay código legacy, siempre true
  amigosUnified: process.env.NEXT_PUBLIC_AMIGOS_UNIFIED !== 'false',
};
