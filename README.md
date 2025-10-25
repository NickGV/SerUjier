# Ujier App

Ujier App es una plataforma web construida con Next.js para gestionar ujieres, simpatizantes y miembros. El objetivo es simplificar el conteo de asistencia de los servicios, centralizar la administración de usuarios y generar reportes accionables para la directiva de la iglesia.

## Características destacadas

- **Autenticación y sesiones seguras** con Firebase Authentication, cookies de sesión y soporte de roles (`ujier`, `directiva`, `admin`).
- **Dashboard operativo** con módulos específicos para conteo en vivo, historial, simpatizantes, ujieres y miembros.
- **Herramientas de conteo** que permiten registrar asistentes por categoría, agrupar registros masivos y llevar control de simpatizantes, visitas y apartados.
- **Historial enriquecido** con filtros por fecha, servicio y ujier, además de exportaciones en CSV, Excel y reportes de texto detallados.
- **Gestión de ujieres y simpatizantes** con activación/desactivación, edición de perfiles y control de estados.
- **Experiencia PWA y mobile-first** gracias a Tailwind CSS, componentes de Radix UI y service worker para instalación y uso offline básico.

## Stack tecnológico

- **Framework**: Next.js 15, React 19 y TypeScript.
- **UI**: Tailwind CSS, shadcn/ui (Radix UI) y iconografía Lucide.
- **Datos y autenticación**: Firebase (cliente y Admin SDK) y Cloud Firestore.
- **Visualización**: Recharts para gráficas y XLSX para exportes avanzados.
- **Calidad**: ESLint con configuración Next.js y soporte para componentes accesibles.

## Estructura del proyecto

```
src/
├─ app/                 # Rutas de Next.js para páginas y APIs
│  ├─ (auth)/           # Flujos de autenticación
│  ├─ (dashboard)/      # Módulos del panel principal
│  └─ api/              # Endpoints serverless (auth, ujieres, users, health)
├─ components/          # Componentes UI reutilizables y específicos por módulo
├─ contexts/            # Contextos globales (por ejemplo, usuario)
├─ hooks/               # Hooks personalizados para conteo, toasts y estados
├─ lib/                 # Integraciones con Firebase, utilidades y helpers
├─ styles/              # Estilos globales
└─ types/               # Tipos compartidos y extensiones
public/
├─ manifest.json        # Configuración PWA
├─ sw.js                # Service worker personalizado
└─ robots.txt           # Reglas para crawlers
scripts/
├─ create-admin-user.ts # Utilidad para crear usuarios administradores
└─ seed-usuarios.ts     # Script de carga inicial de datos
```

## Requisitos previos

- Node.js 18.18 o superior (recomendado 20 LTS).
- npm 9+, pnpm 9+ o yarn 4 (elige tu gestor preferido).
- Cuenta y proyecto en Firebase con Authentication y Firestore habilitados.

## Variables de entorno

Configura un archivo `.env.local` en la raíz del proyecto con los valores reales de tu proyecto Firebase.

```
# Firebase cliente (expuestos en el frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (solo servidor)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=          # Usa \n para saltos de línea
FIREBASE_SERVICE_ACCOUNT_BASE64= # Alternativa base64 al bloque anterior
```

> Solo necesitas definir uno de los mecanismos de credenciales para el Admin SDK: o bien `FIREBASE_PRIVATE_KEY` + `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PROJECT_ID`, o el JSON completo codificado en `FIREBASE_SERVICE_ACCOUNT_BASE64`.

## Instalación y uso

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd ser-ujier
   ```
2. **Instalar dependencias**
   ```bash
   npm install
   # o pnpm install / yarn install
   ```
3. **Configurar variables** en `.env.local` con los valores de Firebase.
4. **Arrancar el entorno de desarrollo**
   ```bash
   npm run dev
   ```
5. **Abrir la aplicación** en `http://localhost:3000`.

Para generar una build de producción ejecuta `npm run build` y luego `npm start`.

## Scripts disponibles

- `npm run dev`: levanta el servidor de desarrollo de Next.js.
- `npm run build`: crea la compilación optimizada.
- `npm run start`: ejecuta la build previa en modo producción.
- `npm run lint`: ejecuta ESLint sobre el proyecto.
- `scripts/create-admin-user.ts`: crea un usuario con rol de administrador (ejecuta con `npx tsx scripts/create-admin-user.ts`).
- `scripts/seed-usuarios.ts`: carga datos iniciales de usuarios (ejecuta con `npx tsx scripts/seed-usuarios.ts`).

> Si prefieres otra herramienta para ejecutar TypeScript (por ejemplo `ts-node`), ajústala en los comandos anteriores.

## Flujos clave

- **Autenticación y roles**: el middleware valida cookies de sesión y restringe acceso según el rol. Las rutas API bajo `src/app/api/auth` manejan login, verificación de sesión y cierre.
- **Conteo de asistencia**: el módulo de conteo permite registrar asistentes por categoría, efectuar cargas masivas y sincronizar con Firestore en tiempo real.
- **Historial y reportes**: ofrece filtros avanzados, estadísticas agregadas y exportaciones (CSV, Excel, texto) generadas en el cliente.
- **Gestión de ujieres y simpatizantes**: interfaces para listar, editar y cambiar estado de servicio de cada ujier o simpatizante.
- **Notificaciones**: se apoya en `sonner` para toasts y feedback inmediato en cada operación.

## Consejos para despliegue

- Configura tus variables de entorno en la plataforma de hosting (Vercel, Cloud Run, etc.).
- Asegúrate de que el dominio de producción esté agregado a Firebase Authentication.
- Habilita Firestore y revisa las reglas en `firestore.rules` antes de desplegar.
- Vercel soporta automáticamente las rutas de API de Next.js; en otros entornos asegúrate de tener Node 18+ y soporte para funciones serverless o servidor Node dedicado.

## Contribuciones

¡Toda mejora es bienvenida! Abre un issue o envía un pull request con contexto claro, pasos de prueba y capturas si aplican.

## Licencia

Este proyecto está licenciado bajo MIT. Consulta el archivo `LICENSE` para más información.
