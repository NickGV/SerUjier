type EnvVar = {
  key: string;
  required: boolean;
  isPublic: boolean;
};

const envVars: EnvVar[] = [
  { key: 'NEXT_PUBLIC_FIREBASE_API_KEY', required: true, isPublic: true },
  { key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', required: true, isPublic: true },
  { key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', required: true, isPublic: true },
  {
    key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    required: true,
    isPublic: true,
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    required: true,
    isPublic: true,
  },
  { key: 'NEXT_PUBLIC_FIREBASE_APP_ID', required: true, isPublic: true },
  { key: 'FIREBASE_ADMIN_PROJECT_ID', required: false, isPublic: false },
  { key: 'FIREBASE_ADMIN_CLIENT_EMAIL', required: false, isPublic: false },
  { key: 'FIREBASE_ADMIN_PRIVATE_KEY', required: false, isPublic: false },
];

export interface EnvValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const envVar of envVars) {
    const value = envVar.isPublic
      ? process.env[envVar.key]
      : process.env[envVar.key];

    if (!value || value.trim() === '') {
      if (envVar.required) {
        missing.push(envVar.key);
      } else {
        warnings.push(`Optional env var ${envVar.key} is not set`);
      }
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

export function assertEnv(): void {
  const result = validateEnv();

  if (!result.isValid) {
    const message = `Missing required environment variables:\n${result.missing.map((k) => `  - ${k}`).join('\n')}`;

    throw new Error(message);
  }

  if (result.warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('\x1b[33m%s\x1b[0m', 'Environment warnings:');
    result.warnings.forEach((w) => console.warn(`  - ${w}`));
  }
}

export const env = {
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  },
  firebaseAdmin: {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
} as const;
