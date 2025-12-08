# Guía de Linting y Formateo de Código

Esta guía explica cómo usar ESLint y Prettier en el proyecto SerUjier para mantener un código limpio y consistente.

## 📋 Tabla de Contenidos

- [Herramientas Instaladas](#herramientas-instaladas)
- [Scripts Disponibles](#scripts-disponibles)
- [Configuración de ESLint](#configuración-de-eslint)
- [Configuración de Prettier](#configuración-de-prettier)
- [Uso en VSCode](#uso-en-vscode)
- [Reglas Principales](#reglas-principales)
- [Solución de Problemas](#solución-de-problemas)

## 🛠️ Herramientas Instaladas

### ESLint

Herramienta de análisis estático para identificar y reportar patrones problemáticos en el código JavaScript/TypeScript.

**Paquetes instalados:**

- `eslint` - Motor principal de ESLint
- `eslint-config-next` - Configuración específica de Next.js
- `@typescript-eslint/parser` - Parser para TypeScript
- `@typescript-eslint/eslint-plugin` - Reglas específicas de TypeScript

### Prettier

Formateador de código que asegura un estilo consistente en todo el proyecto.

**Paquetes instalados:**

- `prettier` - Motor principal de Prettier
- `eslint-config-prettier` - Desactiva reglas de ESLint que entran en conflicto con Prettier
- `eslint-plugin-prettier` - Ejecuta Prettier como regla de ESLint

## 📜 Scripts Disponibles

### Verificar problemas de código

```bash
npm run lint
```

Ejecuta ESLint para identificar problemas de código sin modificar archivos.

### Corregir problemas automáticamente

```bash
npm run lint:fix
```

Ejecuta ESLint y corrige automáticamente los problemas que puede resolver.

### Formatear código

```bash
npm run format
```

Formatea todos los archivos del proyecto usando Prettier.

### Verificar formato

```bash
npm run format:check
```

Verifica si los archivos están formateados correctamente sin modificarlos.

### Verificar tipos de TypeScript

```bash
npm run type-check
```

Ejecuta el compilador de TypeScript para verificar errores de tipos sin generar archivos.

### Verificación completa

```bash
npm run check
```

Ejecuta todas las verificaciones: formato, linting y tipos. **Recomendado antes de hacer commit.**

## ⚙️ Configuración de ESLint

La configuración de ESLint está en `eslint.config.mjs` (formato plano de ESLint 9).

### Características principales:

- ✅ Soporte completo para Next.js 15
- ✅ Soporte para TypeScript
- ✅ Reglas de React y React Hooks
- ✅ Integración con Prettier
- ✅ Importaciones de tipos consistentes

### Archivos ignorados:

- `.next/` - Build de Next.js
- `node_modules/` - Dependencias
- `out/`, `dist/`, `build/` - Carpetas de distribución
- Archivos de configuración (`.config.js`, `.config.ts`)

## 🎨 Configuración de Prettier

La configuración de Prettier está en `.prettierrc`.

### Configuración actual:

```json
{
  "semi": true, // Usar punto y coma
  "trailingComma": "es5", // Comas finales en objetos/arrays
  "singleQuote": true, // Usar comillas simples
  "printWidth": 80, // Ancho máximo de línea
  "tabWidth": 2, // Tamaño de indentación
  "useTabs": false, // Usar espacios en lugar de tabs
  "arrowParens": "always", // Siempre usar paréntesis en arrow functions
  "endOfLine": "lf", // Usar LF para finales de línea
  "bracketSpacing": true, // Espacios en llaves de objetos
  "jsxSingleQuote": false, // Usar comillas dobles en JSX
  "bracketSameLine": false // Bracket de cierre en nueva línea
}
```

### Archivos ignorados:

Ver `.prettierignore` para la lista completa de archivos/carpetas ignorados.

## 💻 Uso en VSCode

### Extensiones Recomendadas

El proyecto incluye recomendaciones de extensiones en `.vscode/extensions.json`:

1. **ESLint** (`dbaeumer.vscode-eslint`) - Integración de ESLint
2. **Prettier** (`esbenp.prettier-vscode`) - Integración de Prettier
3. **Tailwind CSS IntelliSense** - Autocompletado para Tailwind
4. **Error Lens** - Muestra errores inline
5. **Path Intellisense** - Autocompletado de rutas

### Configuración Automática

La configuración en `.vscode/settings.json` habilita:

- ✅ **Format on Save**: Formatea automáticamente al guardar
- ✅ **Format on Paste**: Formatea al pegar código
- ✅ **ESLint Auto-fix**: Corrige problemas de ESLint automáticamente
- ✅ **Organize Imports**: Organiza las importaciones automáticamente

### Cómo instalar las extensiones:

1. Abre VSCode
2. Presiona `Ctrl+Shift+P` (o `Cmd+Shift+P` en Mac)
3. Escribe "Extensions: Show Recommended Extensions"
4. Instala todas las extensiones recomendadas

## 📏 Reglas Principales

### TypeScript

```javascript
// ❌ Evitar
const data: any = getData();
let x = 5;
x = 10; // Debería ser const

// ✅ Correcto
const data: UserData = getData();
const x = 5;
```

### Variables no utilizadas

```javascript
// ❌ Evitar
function ejemplo(parametro, _otroParametro) {
  return parametro;
}

// ✅ Correcto (prefijo _ para variables ignoradas)
function ejemplo(parametro, _otroParametro) {
  return parametro;
}
```

### Importaciones de tipos

```javascript
// ❌ Evitar
import { User } from '@/types';

// ✅ Correcto
import type { User } from '@/types';
```

### React

```javascript
// ❌ Evitar
<div className="container"></div>
const Component = () => <div className={"static"}></div>

// ✅ Correcto
<div className="container" />
const Component = () => <div className="static" />
```

### Console statements

```javascript
// ❌ Evitar
console.log('Debug info');

// ✅ Permitido
console.warn('Warning message');
console.error('Error message');
```

### Comparaciones

```javascript
// ❌ Evitar
if (value == null) {
}

// ✅ Correcto
if (value === null) {
}
```

### Bloques de código

```javascript
// ❌ Evitar
if (condition) doSomething();

// ✅ Correcto
if (condition) {
  doSomething();
}
```

## 🔧 Solución de Problemas

### Error: "Parsing error"

Si ves errores de parsing, asegúrate de que:

1. Todas las dependencias estén instaladas: `npm install`
2. Tu archivo TypeScript tenga la extensión correcta (`.ts` o `.tsx`)
3. El archivo `tsconfig.json` esté configurado correctamente

### Prettier y ESLint en conflicto

Si ESLint y Prettier muestran reglas conflictivas:

1. Asegúrate de tener instalado `eslint-config-prettier`
2. Verifica que `plugin:prettier/recommended` esté al final del array de extends
3. Reinicia el servidor de ESLint en VSCode

### Los archivos no se formatean al guardar

1. Verifica que tengas la extensión de Prettier instalada
2. Revisa la configuración de VSCode (`.vscode/settings.json`)
3. Asegúrate de que el archivo no esté en `.prettierignore`
4. Reinicia VSCode

### Importaciones duplicadas

```javascript
// ❌ Evitar
import { ComponentA } from 'library';
import { ComponentB } from 'library';

// ✅ Correcto
import { ComponentA, ComponentB } from 'library';
```

### Demasiados warnings en console.log

Cambia los `console.log` por:

- `console.warn()` para advertencias
- `console.error()` para errores
- O elimina los console statements en producción

## 📚 Recursos Adicionales

- [Documentación de ESLint](https://eslint.org/docs/latest/)
- [Documentación de Prettier](https://prettier.io/docs/en/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [Next.js ESLint](https://nextjs.org/docs/app/api-reference/config/eslint)

## 🚀 Workflow Recomendado

### Antes de hacer commit:

1. Ejecuta `npm run format` para formatear el código
2. Ejecuta `npm run lint:fix` para corregir problemas automáticos
3. Ejecuta `npm run check` para verificación completa
4. Corrige manualmente los errores que no se puedan auto-corregir
5. Haz commit de los cambios

### Durante el desarrollo:

- Mantén habilitado "Format on Save" en VSCode
- Revisa los problemas en el panel de "Problems" de VSCode
- Usa `npm run lint` periódicamente para verificar tu código

## 🎯 Buenas Prácticas

1. **Nunca desactives las reglas de ESLint sin razón justificada**
2. **Usa nombres descriptivos para variables y funciones**
3. **Mantén funciones pequeñas y enfocadas**
4. **Escribe código auto-documentado**
5. **Comenta solo cuando sea necesario explicar el "por qué", no el "qué"**
6. **Usa TypeScript correctamente: evita `any`, usa tipos e interfaces**
7. **Mantén consistencia en el estilo de código**

---

¿Preguntas o problemas? Consulta con el equipo o abre un issue en el repositorio.
