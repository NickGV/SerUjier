# Arquitectura del Proyecto SerUjier

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Patrones de Arquitectura](#patrones-de-arquitectura)
4. [Flujo de Datos](#flujo-de-datos)
5. [Módulos Principales](#módulos-principales)
6. [Convenciones de Código](#convenciones-de-código)

---

## 🎯 Visión General

SerUjier es una aplicación Next.js para la gestión de asistencia en servicios religiosos. Utiliza una arquitectura basada en features (feature-based architecture) con separación clara de responsabilidades.

### Stack Tecnológico

- **Framework**: Next.js 14+ (App Router)
- **UI**: React 18+ con TypeScript
- **Base de Datos**: Firebase Firestore
- **Estilos**: Tailwind CSS
- **Componentes UI**: shadcn/ui
- **Estado**: React Hooks + Context API

---

## 📁 Estructura de Carpetas

```
SerUjier/
├── src/
│   ├── app/                    # Next.js App Router
│   │   └── (dashboard)/        # Layout de dashboard
│   │       ├── conteo/         # Página de conteo
│   │       ├── historial/      # Páginas de historial
│   │       ├── miembros/       # Gestión de miembros
│   │       ├── simpatizantes/  # Gestión de simpatizantes
│   │       └── ujieres/        # Gestión de ujieres
│   │
│   ├── features/               # Módulos por funcionalidad
│   │   ├── asistencia/         # Feature de conteo de asistencia
│   │   │   ├── components/     # Componentes específicos
│   │   │   ├── hooks/          # Hooks personalizados
│   │   │   ├── pages/          # Páginas completas
│   │   │   ├── types/          # Definiciones de tipos
│   │   │   └── utils/          # Utilidades del módulo
│   │   │
│   │   └── historial/          # Feature de historial
│   │       ├── components/
│   │       └── utils/
│   │
│   └── shared/                 # Código compartido
│       ├── components/         # Componentes reutilizables
│       ├── contexts/           # Contextos de React
│       ├── lib/                # Librerías y configuraciones
│       ├── types/              # Tipos compartidos
│       └── ui/                 # Componentes UI base
│
├── docs/                       # Documentación
└── public/                     # Archivos estáticos
```

---

## 🏗️ Patrones de Arquitectura

### 1. Feature-Based Architecture

Cada feature (asistencia, historial, etc.) es un módulo independiente con su propia estructura:

```
feature/
├── components/     # Componentes UI del feature
├── hooks/          # Lógica de negocio reutilizable
├── pages/          # Páginas completas exportables
├── types/          # Tipos TypeScript específicos
└── utils/          # Funciones auxiliares puras
```

**Ventajas**:
- Alta cohesión, bajo acoplamiento
- Fácil de mantener y escalar
- Testing simplificado
- Código más organizado

### 2. Separación de Responsabilidades

#### Componentes (`components/`)
- **Responsabilidad**: Presentación y UI
- **Reglas**: 
  - Reciben props y eventos
  - No contienen lógica de negocio compleja
  - Son reutilizables y componibles

#### Hooks (`hooks/`)
- **Responsabilidad**: Lógica de negocio y estado
- **Reglas**:
  - Encapsulan lógica compleja
  - Manejan side effects
  - Son reutilizables
  - Pueden usar otros hooks

#### Utilidades (`utils/`)
- **Responsabilidad**: Funciones puras y helpers
- **Reglas**:
  - Sin side effects
  - Fácilmente testables
  - No dependen de React
  - Funciones puras cuando es posible

#### Páginas (`pages/`)
- **Responsabilidad**: Orquestación de componentes y hooks
- **Reglas**:
  - Conectan componentes con hooks
  - Manejan routing y navegación
  - Exportan componentes completos

### 3. Estado y Persistencia

#### Context API
```typescript
// Contextos globales en shared/contexts/
- UserContext: Autenticación y usuario actual
```

#### LocalStorage + Hooks
```typescript
// Ejemplo: use-persistent-conteo
- Persiste estado en localStorage
- Sincroniza con React state
- Carga automática al montar
```

#### Firebase Firestore
```typescript
// Colecciones principales:
- historial: Registros de asistencia
- miembros: Base de datos de miembros
- simpatizantes: Base de datos de simpatizantes
- usuarios: Ujieres y administradores
```

---

## 🔄 Flujo de Datos

### Flujo de Conteo de Asistencia

```
1. Usuario accede a /conteo
   ↓
2. ConteoPage carga datos iniciales
   - use-persistent-conteo: Estado persistente
   - Firebase: Simpatizantes, miembros, ujieres
   ↓
3. Usuario modifica contadores
   - use-conteo-counters: Maneja incrementos/decrementos
   - use-persistent-conteo: Persiste cambios
   ↓
4. Usuario selecciona asistentes
   - Diálogos: Selección de personas
   - Estado: Actualiza listas de asistentes
   ↓
5. Usuario guarda conteo
   - use-conteo-save: Valida y guarda
   - Firebase: Crea registro en historial
   - localStorage: Limpia estado (opcional)
```

### Flujo de Edición

```
1. Usuario selecciona "Editar" en historial
   ↓
2. Navega a /conteo?editId={id}
   ↓
3. use-conteo-edit-mode detecta editId
   - Carga datos del historial
   - Calcula contadores manuales
   - Activa modo edición
   ↓
4. Estado persiste en localStorage
   - isEditMode: true
   - editingRecordId: {id}
   ↓
5. Usuario puede navegar sin perder contexto
   ↓
6. Al guardar, actualiza registro existente
```

---

## 🧩 Módulos Principales

### Feature: Asistencia

#### Hooks Principales

**`use-persistent-conteo.ts`**
- Gestiona estado persistente del conteo
- Sincroniza con localStorage
- Carga datos de historial para edición

**`use-conteo-edit-mode.ts`**
- Detecta modo edición desde URL
- Carga datos del registro a editar
- Mantiene contexto de edición

**`use-conteo-counters.ts`**
- Maneja incrementos/decrementos
- Edición directa de valores
- Cálculo de totales

**`use-conteo-save.ts`**
- Valida datos antes de guardar
- Crea/actualiza registros en Firebase
- Maneja modo consecutivo

#### Utilidades

**`conteo-calculations.ts`**
```typescript
// Cálculo de contadores manuales
calculateManualCounters(historialData) => ManualCounters

// Cálculo de asistencia total
calculateTotalAttendance(counters, namedAttendees) => number

// Validaciones
validateCounters(counters) => boolean
```

**`ujier-utils.ts`**
```typescript
// Normalización de ujieres
normalizeUjieres(ujier) => string[]

// Formateo para display
formatUjieres(ujier) => string

// Filtrado de ujieres activos
getActiveUjieres(ujieres) => string[]
```

### Feature: Historial

#### Componentes

- `HistorialPage`: Página principal con tabla
- Utilidades de formato y exportación (CSV, Excel)

#### Utilidades

**`historial/utils.ts`**
- Formatos de fecha
- Cálculos estadísticos
- Generación de reportes

---

## 📐 Convenciones de Código

### Nomenclatura

```typescript
// Componentes: PascalCase
export function ConteoPage() {}

// Hooks: camelCase con prefijo "use"
export function usePersistentConteo() {}

// Utilidades: camelCase
export function calculateManualCounters() {}

// Tipos: PascalCase
export interface ConteoState {}

// Constantes: UPPER_SNAKE_CASE
const STORAGE_KEY = "conteo-persistente";
```

### Organización de Imports

```typescript
// 1. Dependencias externas
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 2. Hooks personalizados
import { usePersistentConteo } from "@/features/asistencia/hooks";

// 3. Utilidades
import { calculateManualCounters } from "@/features/asistencia/utils";

// 4. Componentes
import { Button } from "@/shared/ui/button";

// 5. Tipos
import type { ConteoState } from "@/features/asistencia/types";
```

### Estructura de Componentes

```typescript
// 1. Imports
import ...

// 2. Tipos/Interfaces (si son locales)
interface ComponentProps {}

// 3. Componente principal
export default function Component() {
  // 3.1. Hooks de Next.js/React
  const router = useRouter();
  const [state, setState] = useState();
  
  // 3.2. Hooks personalizados
  const { data } = useCustomHook();
  
  // 3.3. Estados locales
  const [loading, setLoading] = useState(false);
  
  // 3.4. Effects
  useEffect(() => {}, []);
  
  // 3.5. Handlers
  const handleClick = () => {};
  
  // 3.6. Render
  return <div>...</div>;
}
```

### Documentación

```typescript
/**
 * Descripción breve de la función
 * 
 * @param param1 - Descripción del parámetro
 * @param param2 - Descripción del parámetro
 * @returns Descripción del retorno
 * 
 * @example
 * ```typescript
 * const result = myFunction(value1, value2);
 * ```
 */
export function myFunction(param1: string, param2: number) {}
```

---

## 🔐 Seguridad y Permisos

### Niveles de Acceso

```typescript
type UserRole = "admin" | "directiva" | "ujier";

// Permisos por rol:
// - admin: Acceso total
// - directiva: Visualización y reportes
// - ujier: Solo conteo de asistencia
```

### Protección de Rutas

```typescript
// Componente RoleGuard
<RoleGuard route="historial" allowedRoles={["admin", "directiva"]}>
  <HistorialContent />
</RoleGuard>
```

---

## 🧪 Testing (Futuro)

### Estructura Sugerida

```
feature/
├── __tests__/
│   ├── components/
│   ├── hooks/
│   └── utils/
```

### Prioridades de Testing

1. **Utilidades**: 100% coverage (funciones puras)
2. **Hooks**: Lógica de negocio crítica
3. **Componentes**: Casos de uso principales

---

## 🚀 Mejores Prácticas

### 1. Mantener Componentes Pequeños
- Un componente, una responsabilidad
- Extraer lógica a hooks cuando se vuelva compleja
- Reutilizar componentes base de `shared/ui`

### 2. Usar TypeScript Correctamente
- Definir tipos explícitos
- Evitar `any`
- Usar tipos compartidos cuando sea posible

### 3. Optimización
- Usar `useCallback` para funciones pasadas como props
- Usar `useMemo` para cálculos costosos
- Lazy loading de componentes pesados

### 4. Manejo de Errores
- Try-catch en operaciones async
- Mostrar mensajes de error al usuario (toast)
- Log de errores en consola para debugging

### 5. Persistencia
- LocalStorage para estado temporal
- Firebase para datos permanentes
- Validar datos antes de persistir

---

## 📚 Recursos Adicionales

- [Next.js Documentation](https://nextjs.org/docs)
- [React Hooks](https://react.dev/reference/react)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Última actualización**: 2025-01
**Versión**: 1.0