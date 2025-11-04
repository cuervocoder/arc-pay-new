# Arc Pay Frontend - Advanced Features & Customization Guide

## Advanced Features

### 1. Real-time Notifications

Implementar notificaciones en tiempo real:

```typescript
// src/hooks/useNotification.ts
import { useState, useCallback } from 'react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
    message: string,
    type: NotificationType = 'info',
    duration = 3000
  ) => {
    const id = Date.now().toString();
    const notification: Notification = { id, type, message, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    if (duration) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notifications, addNotification, removeNotification };
};
```

### 2. WebSocket Integration (Optional)

Para actualizaciones en tiempo real del agente:

```typescript
// src/services/websocket.ts
class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectInterval = 3000;
  private shouldReconnect = true;

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          resolve();
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
        
        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        };
        
        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          if (this.shouldReconnect) {
            setTimeout(() => this.connect(), this.reconnectInterval);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(data: any) {
    // Handle different message types
    switch (data.type) {
      case 'agent_update':
        window.dispatchEvent(new CustomEvent('agent_update', { detail: data }));
        break;
      case 'payment_completed':
        window.dispatchEvent(new CustomEvent('payment_completed', { detail: data }));
        break;
      case 'balance_updated':
        window.dispatchEvent(new CustomEvent('balance_updated', { detail: data }));
        break;
    }
  }

  send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.ws?.close();
  }
}

export const wsService = new WebSocketService(
  `${import.meta.env.VITE_API_URL.replace('http', 'ws')}/ws`
);
```

### 3. Advanced Charts & Analytics

Agregar gráficos con Recharts:

```typescript
// src/components/PaymentChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PaymentChartProps {
  data: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
}

export const PaymentChart: React.FC<PaymentChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="amount" stroke="#3b82f6" />
        <Line yAxisId="right" type="monotone" dataKey="count" stroke="#06b6d4" />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

### 4. Advanced Filtering & Search

Sistema de filtros avanzados:

```typescript
// src/hooks/useAdvancedFilter.ts
interface FilterOptions {
  dateRange?: { from: Date; to: Date };
  amountRange?: { min: number; max: number };
  status?: string[];
  creator?: string;
  tags?: string[];
}

export const useAdvancedFilter = (items: any[], options: FilterOptions) => {
  return items.filter(item => {
    // Date range filtering
    if (options.dateRange) {
      const itemDate = new Date(item.createdAt);
      if (itemDate < options.dateRange.from || itemDate > options.dateRange.to) {
        return false;
      }
    }

    // Amount range filtering
    if (options.amountRange) {
      if (item.amount < options.amountRange.min || item.amount > options.amountRange.max) {
        return false;
      }
    }

    // Status filtering
    if (options.status?.length) {
      if (!options.status.includes(item.status)) {
        return false;
      }
    }

    // Creator filtering
    if (options.creator) {
      if (!item.creatorName?.toLowerCase().includes(options.creator.toLowerCase())) {
        return false;
      }
    }

    // Tags filtering
    if (options.tags?.length) {
      if (!options.tags.some(tag => item.tags?.includes(tag))) {
        return false;
      }
    }

    return true;
  });
};
```

### 5. Dark Mode Support

Agregar soporte para modo oscuro:

```typescript
// src/hooks/useDarkMode.ts
import { useEffect, useState } from 'react';

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) return JSON.parse(saved);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDark));
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return { isDark, setIsDark };
};
```

### 6. Offline Support

Implementar capacidades offline:

```typescript
// src/services/offline.ts
class OfflineService {
  private db: IDBDatabase | null = null;
  private dbName = 'arc-pay-offline';
  private storeName = 'pending-actions';

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async savePendingAction(action: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.add({ ...action, timestamp: Date.now() });
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getPendingActions(): Promise<any[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.storeName], 'readonly');
      const store = tx.objectStore(this.storeName);
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async clearPendingActions(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.clear();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const offlineService = new OfflineService();
```

### 7. Performance Monitoring

Monitorear rendimiento:

```typescript
// src/utils/performance.ts
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  measure(name: string, fn: () => void): void {
    const start = performance.now();
    fn();
    const end = performance.now();
    const duration = end - start;
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);
    
    if (duration > 1000) {
      console.warn(`Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    }
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    const duration = end - start;
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);
    
    if (duration > 1000) {
      console.warn(`Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }

  getMetrics(name: string) {
    const times = this.metrics.get(name) || [];
    return {
      count: times.length,
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
    };
  }

  logMetrics(): void {
    console.table(
      Array.from(this.metrics.entries()).map(([name, times]) => ({
        name,
        count: times.length,
        average: (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2) + 'ms',
        min: Math.min(...times).toFixed(2) + 'ms',
        max: Math.max(...times).toFixed(2) + 'ms',
      }))
    );
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

## Customization Guide

### 1. Cambiar Colores de Marca

Modificar `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#3b82f6',      // Blue
      secondary: '#06b6d4',    // Cyan
      accent: '#8b5cf6',       // Purple
    },
  },
}
```

### 2. Agregar Nuevas Páginas

```typescript
// 1. Crear página en src/pages/MyPage.tsx
export const MyPage: React.FC = () => {
  return <div>My Page</div>;
};

// 2. Agregar ruta en src/App.tsx
<Route
  path="/my-page"
  element={
    <PrivateRoute>
      <Layout>
        <MyPage />
      </Layout>
    </PrivateRoute>
  }
/>

// 3. Agregar link en src/components/Layout.tsx
{ path: '/my-page', label: 'My Page', icon: MyIcon }
```

### 3. Crear Nuevos Componentes

```typescript
// src/components/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  children: React.ReactNode;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, children }) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200">
      <h2 className="text-xl font-bold text-slate-900 mb-4">{title}</h2>
      {children}
    </div>
  );
};
```

### 4. Agregar Nuevos Endpoints API

```typescript
// src/services/api.ts
async myNewEndpoint(data: any): Promise<ApiResponse<any>> {
  return this.api.post('/my-endpoint', data).then(r => r.data);
}

// Usar en componente
const { data } = await apiService.myNewEndpoint({ /* data */ });
```

## Testing

### Unit Tests

```typescript
// src/__tests__/services/api.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { apiService } from '@/services/api';

describe('API Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should set token correctly', () => {
    const token = 'test-token';
    apiService.setToken(token);
    expect(apiService.getToken()).toBe(token);
  });

  it('should be authenticated when token exists', () => {
    apiService.setToken('test-token');
    expect(apiService.isAuthenticated()).toBe(true);
  });

  it('should clear authentication on logout', async () => {
    apiService.setToken('test-token');
    await apiService.logout();
    expect(apiService.isAuthenticated()).toBe(false);
  });
});
```

## Deployment Checklist

- [ ] Variables de entorno configuradas
- [ ] Build exitoso (`npm run build`)
- [ ] No hay console errors
- [ ] Tests pasando
- [ ] Responsive design verificado
- [ ] Performance optimizado
- [ ] HTTPS habilitado
- [ ] CORS configurado
- [ ] Analytics configurado (opcional)
- [ ] Error tracking configurado (Sentry, etc.)

## Browser DevTools Tips

1. **Redux DevTools**: Inspeccionar estado de Zustand
2. **Network Tab**: Monitorear llamadas API
3. **Performance Tab**: Analizar performance
4. **Console**: Debug logs y errores
5. **Application Tab**: Ver LocalStorage y IndexedDB

## Optimization Tips

1. **Code Splitting**: Lazy load pages con React.lazy()
2. **Image Optimization**: Usar WebP con fallback
3. **CSS Purging**: Tailwind automáticamente purga CSS no usado
4. **API Caching**: Implementar SWR o React Query
5. **Bundle Analysis**: Usar `npm run build -- --analyze`

## Security Best Practices

1. **No exponer secrets** en el frontend
2. **Validar input** del usuario
3. **Sanitizar output** para prevenir XSS
4. **HTTPS siempre** en producción
5. **Rate limiting** en el backend
6. **CSRF protection** si es necesario
7. **Content Security Policy** headers

## Monitoreo en Producción

```typescript
// Sentry Integration (opcional)
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

¡El frontend está listo para producción!
