# Arc Pay Frontend - Quick Start Guide

## 5 Minutos Setup

### Paso 1: Extraer y Navegar

```bash
# Extraer el archivo
unzip arc-frontend.zip
cd arc-frontend

# o si clonaste del repositorio
cd arc-frontend
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

⏱️ Espera ~2-3 minutos mientras se descargan los paquetes.

### Paso 3: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar .env.local (usa tu editor favorito)
# nano .env.local
# o
# code .env.local
```

**Contenido de `.env.local`:**
```
VITE_API_URL=http://localhost:3001/api
VITE_CHAIN_ID=arc-testnet
VITE_RPC_URL=https://arc-testnet-rpc.example.com
VITE_ENABLE_DEMO_MODE=true
```

### Paso 4: Iniciar Servidor de Desarrollo

```bash
npm run dev
```

Output esperado:
```
  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

### Paso 5: Abrir en el Navegador

```
Abre: http://localhost:5173
```

¡Listo! Deberías ver la página de Sign In.

---

## Primeros Pasos

### Crear Cuenta Demo

1. Click en **Sign Up**
2. Llenar formulario:
   - Email: `demo@arcpay.com`
   - Password: `Demo@123` (al menos 8 chars, mayúsculas, números, símbolos)
   - Name: `Demo User`
3. Click en **Create Account**

### O Sign In con Credenciales Demo

1. Email: `demo@arcpay.com`
2. Password: `Demo@123`
3. Click **Sign In**

### Explorar Dashboard

Una vez dentro:
- **Feed**: Ve contenido AI-curado
- **History**: Ve transacciones previas
- **Agent**: Controla el agente IA
- **Preferences**: Configura settings

---

## Estructura de Carpetas Explicada

```
arc-frontend/
│
├── src/
│   ├── pages/              📄 Páginas principales
│   │   ├── Dashboard.tsx   - Feed de contenido
│   │   ├── History.tsx     - Historial de pagos
│   │   ├── Agent.tsx       - Control del agente
│   │   ├── Preferences.tsx - Configuración
│   │   ├── SignIn.tsx      - Login
│   │   └── SignUp.tsx      - Registro
│   │
│   ├── components/         🧩 Componentes reutilizables
│   │   ├── Layout.tsx      - Layout principal
│   │   ├── WalletCard.tsx  - Tarjeta de wallet
│   │   └── ContentCard.tsx - Tarjeta de contenido
│   │
│   ├── services/           🔗 APIs y Estado
│   │   ├── api.ts          - Cliente HTTP
│   │   └── store.ts        - Estado global (Zustand)
│   │
│   ├── types/              📋 Tipos TypeScript
│   │   └── index.ts        - Definiciones de tipos
│   │
│   ├── App.tsx             🚀 Componente principal
│   ├── main.tsx            ⚡ Entry point
│   └── index.css           🎨 Estilos globales
│
├── public/                 📦 Archivos estáticos
├── index.html             📄 HTML base
├── package.json           📦 Dependencias
├── tsconfig.json          ⚙️ Config TypeScript
├── vite.config.ts         ⚙️ Config Vite
├── tailwind.config.js     🎨 Config Tailwind
└── README.md              📖 Documentación
```

---

## Flujo de Desarrollo

### Trabajar en una Nueva Feature

1. **Crear rama**
```bash
git checkout -b feature/nueva-feature
```

2. **Hacer cambios**
   - Editar archivos en `src/`
   - El navegador se refresca automáticamente (HMR)

3. **Crear componente nuevo** (ejemplo)
```bash
# Crear archivo
echo "export const MiComponente: React.FC = () => <div>Hola</div>" > src/components/MiComponente.tsx

# Importar en otra página
import { MiComponente } from '@/components/MiComponente';
```

4. **Commit y Push**
```bash
git add .
git commit -m "feat: añade nueva feature"
git push origin feature/nueva-feature
```

---

## Comandos Útiles

### Desarrollo

```bash
# Iniciar servidor
npm run dev

# Build para producción
npm run build

# Previsualizar build
npm run preview

# Linting (verificar código)
npm run lint
```

### Debugging

```bash
# Ver si hay errores en consola
npm run dev

# Abrir DevTools (Chrome/Firefox)
F12 o Cmd+Option+I (Mac)
```

---

## Conexión con Backend

### Verificar que el Backend está Corriendo

```bash
# En otra terminal
curl http://localhost:3001/api/health
```

Deberías ver:
```json
{ "status": "ok" }
```

### Si la API no Conecta

1. **Verificar URL**
   - Abre `.env.local`
   - Asegúrate que `VITE_API_URL` sea correcto

2. **Verificar CORS**
   - Abre DevTools (F12)
   - Ve a Network tab
   - Si ves error CORS, configura backend

3. **Reiniciar**
   ```bash
   # Mata el servidor (Ctrl+C)
   # Inicia nuevamente
   npm run dev
   ```

---

## Features Principales

### 1. Dashboard/Feed
- ✅ Ver contenido AI-curado
- ✅ Filtrar por calidad y relevancia
- ✅ Pagar por contenido
- ✅ Ver balance de wallet

### 2. Historial de Pagos
- ✅ Ver todas las transacciones
- ✅ Filtrar por estado
- ✅ Buscar transacciones
- ✅ Exportar a CSV

### 3. Agent IA
- ✅ Activar/desactivar agente
- ✅ Ver estado en tiempo real
- ✅ Ver acciones recientes
- ✅ Ver métricas de procesamiento

### 4. Preferencias
- ✅ Configurar presupuesto diario
- ✅ Establecer umbral de calidad
- ✅ Agregar intereses
- ✅ Habilitar/deshabilitar Auto-Pay

---

## Solucionar Problemas Comunes

### Error: "Cannot find module"
```bash
# Solución: Reinstalar paquetes
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Error: "Port 5173 already in use"
```bash
# Opción 1: Matar proceso en el puerto
lsof -i :5173
kill -9 <PID>

# Opción 2: Usar otro puerto
npm run dev -- --port 3000
```

### Error: "VITE_API_URL is not defined"
```bash
# Solución: Crear .env.local
cp .env.example .env.local
# Editar .env.local con tus valores
npm run dev
```

### Componentes no se actualizan
```bash
# Solución: Hard refresh
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)

# O limpiar cache de Next/Vite
rm -rf .vite
npm run dev
```

### TypeScript errors
```bash
# Verificar tipos
npx tsc --noEmit

# Reinstalar dependencias
npm install
```

---

## Guía de Estilo de Código

### Naming Conventions

```typescript
// ✅ Archivos
Components.tsx
services.ts
types.ts
hooks.ts

// ✅ Variables
const userData = {};
let isLoading = false;
const API_KEY = 'secret';

// ✅ Funciones
const fetchUserData = async () => {};
const handleClick = () => {};
const formatDate = (date) => {};

// ✅ Interfaces
interface User {}
interface ComponentProps {}
```

### Componentes

```typescript
// ✅ Buenos componentes
export const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  return <div>{prop1}</div>;
};

// ❌ Evitar
const MyComponent = ({ prop1, prop2 }) => <div>{prop1}</div>;
```

### Imports

```typescript
// ✅ Agrupar imports
import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/services/store';
import { MyComponent } from '@/components/MyComponent';

// ❌ Evitar
import React from 'react';
import { MyComponent } from '@/components/MyComponent';
import { useStore } from '@/services/store';
import { Link } from 'react-router-dom';
```

---

## Recursos Útiles

### Documentación
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)

### Herramientas
- [VS Code](https://code.visualstudio.com/)
- [ES7 React/Redux Snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)
- [TypeScript Vue Plugin](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

### Comunidades
- [React Spectrum](https://react-spectrum.adobe.com/)
- [Tailwind UI](https://tailwindui.com/)
- [Heroicons](https://heroicons.com/)

---

## Siguientes Pasos

1. ✅ Setup completado
2. 📝 Explorar código fuente
3. 🔨 Hacer cambios locales
4. 🧪 Testear en navegador
5. 📚 Leer documentación completa
6. 🚀 Deployar a producción

---

## Ayuda Rápida

### Cómo editar un componente

```typescript
// src/components/WalletCard.tsx
import React from 'react';

export const WalletCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-6">
      <h2>Mi Balance</h2>
      <p>$125.50</p>
    </div>
  );
};
```

### Cómo agregar un nuevo hook

```typescript
// src/hooks/useFetch.ts
import { useState, useEffect } from 'react';

export const useFetch = (url: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        setData(await response.json());
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [url]);

  return { data, loading, error };
};
```

### Cómo usar el store

```typescript
import { useWalletStore } from '@/services/store';

export const MyComponent = () => {
  const { wallet, fetchWallet } = useWalletStore();

  useEffect(() => {
    fetchWallet();
  }, []);

  return <div>{wallet?.balanceUSD}</div>;
};
```

---

## Tips Pro 🚀

1. **Usa snippets**: `rfce` = React Functional Component con Export
2. **Keyboard shortcuts**:
   - `Ctrl+Shift+P` = Command Palette
   - `Ctrl+/` = Toggle Comment
   - `Alt+Up/Down` = Move Line

3. **DevTools Features**:
   - Pausar en errores
   - Inspeccionar elementos
   - Monitorear performance

4. **Performance**:
   - Lazy load componentes
   - Memoizar componentes grandes
   - Optimizar imágenes

---

## Checklista de Producción

- [ ] Variables de entorno correctas
- [ ] Build sin warnings
- [ ] Tests pasando
- [ ] Mobile responsive verificado
- [ ] Performance OK (< 3s)
- [ ] HTTPS habilitado
- [ ] Analytics configurado
- [ ] Error tracking (Sentry, etc.)
- [ ] Backup de código
- [ ] CI/CD configurado

¡Listo para comenzar! 🎉
