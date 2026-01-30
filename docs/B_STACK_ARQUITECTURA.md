# B) Propuesta de Stack y Arquitectura

## Comparativa de Opciones

| Criterio | Opción A: PWA (React + Vite) | Opción B: App Híbrida (Ionic/Capacitor) |
|----------|------------------------------|----------------------------------------|
| **Offline-first** | ✅ Service Workers + IndexedDB | ✅ SQLite + Capacitor Storage |
| **Instalable** | ✅ PWA instalable | ✅ App stores + PWA |
| **Velocidad arranque** | ✅ < 1.5s con Vite | ⚠️ 2-3s típico |
| **Curva aprendizaje** | ✅ Solo React | ⚠️ React + Ionic + Capacitor |
| **Mantenimiento** | ✅ Un solo código | ⚠️ Builds nativos complejos |
| **Sin app stores** | ✅ Directo por URL | ❌ Requiere publicar |
| **Acceso cámara** | ✅ API Web nativa | ✅ Plugins nativos |
| **Tamaño bundle** | ✅ ~200KB gzip | ⚠️ ~500KB+ |
| **Actualizaciones** | ✅ Instantáneas | ⚠️ Review de stores |

## RECOMENDACIÓN: Opción A - PWA con React + Vite

**Justificación para usuario no programador avanzado**:
1. **Despliegue simple**: Subes a Netlify/Vercel gratis, compartes URL, listo
2. **Sin app stores**: No necesitas cuenta de desarrollador ($99/año Apple, $25 Google)
3. **Actualizaciones inmediatas**: Corriges algo, despliegas, usuarios lo tienen al refrescar
4. **Stack mainstream**: Muchísima documentación y ayuda disponible
5. **Offline real**: Service Workers + IndexedDB funcionan perfectamente
6. **Instalable**: El usuario puede "Añadir a pantalla de inicio" y parece app nativa

---

## Stack Técnico Detallado

### Frontend
```
React 18.3+          - UI declarativa, hooks, concurrent features
Vite 5+              - Build ultrarrápido, HMR, optimización automática
TypeScript 5+        - Tipado estricto, menos bugs
TailwindCSS 3+       - Estilos utilitarios, responsive fácil
Zustand              - Estado global simple (más ligero que Redux)
React Router 6       - Navegación SPA
date-fns             - Manejo de fechas (tree-shakeable, no moment.js)
```

### Almacenamiento Local
```
Dexie.js             - Wrapper amigable sobre IndexedDB
                     - Soporte para queries complejas
                     - Hooks de React incluidos (useLiveQuery)
                     - Migraciones de esquema automáticas
```

### PWA / Offline
```
Vite PWA Plugin      - Service Worker automático con Workbox
                     - Precaching de assets
                     - Estrategia "stale-while-revalidate"
```

### Servicios IA (Contratos intercambiables)
```
Capa de abstracción  - AIProvider interface
├── OpenAI GPT-4V    - OCR de menús (vision)
├── Claude 3         - Alternativa OCR
├── Gemini Pro       - Alternativa OCR
└── Mock Provider    - Para desarrollo/tests
```

### Testing
```
Vitest               - Tests unitarios (compatible Vite)
Playwright           - Tests E2E
MSW                  - Mock de APIs para tests
```

### Despliegue
```
Netlify / Vercel     - CI/CD automático desde GitHub
                     - HTTPS gratis
                     - CDN global
```

---

## Arquitectura de Módulos

```
src/
├── main.tsx                 # Entry point
├── App.tsx                  # Router principal
├── index.css                # Tailwind imports
│
├── components/              # Componentes UI reutilizables
│   ├── ui/                  # Botones, inputs, modals, chips
│   ├── calendar/            # Calendario mensual
│   ├── meal/                # Cards de comida, selectores
│   └── layout/              # Header, navbar, containers
│
├── pages/                   # Pantallas principales
│   ├── Today.tsx            # Vista Hoy
│   ├── Calendar.tsx         # Calendario mensual
│   ├── DayDetail.tsx        # Detalle de un día
│   ├── MealDetail.tsx       # Detalle de una comida
│   ├── Recipes.tsx          # Catálogo de recetas
│   ├── RecipeDetail.tsx     # Crear/editar receta
│   ├── ImportMenu.tsx       # Importar menú escolar
│   ├── ShoppingList.tsx     # Lista de compra
│   └── Settings.tsx         # Ajustes familia/miembros
│
├── features/                # Lógica de dominio por feature
│   ├── meals/
│   │   ├── meal.types.ts    # Tipos de MealSlot, ActualMeal
│   │   ├── meal.store.ts    # Zustand store
│   │   ├── meal.service.ts  # CRUD contra Dexie
│   │   └── meal.hooks.ts    # Custom hooks
│   │
│   ├── recipes/
│   │   ├── recipe.types.ts
│   │   ├── recipe.store.ts
│   │   ├── recipe.service.ts
│   │   └── recipe.hooks.ts
│   │
│   ├── family/
│   │   ├── family.types.ts  # FamilyMember, Restriction
│   │   ├── family.store.ts
│   │   └── family.service.ts
│   │
│   ├── shopping/
│   │   ├── shopping.types.ts
│   │   ├── shopping.service.ts
│   │   └── shopping.hooks.ts
│   │
│   ├── generation/          # Motor de generación de menús
│   │   ├── generator.ts     # Algoritmo principal
│   │   ├── rules.ts         # Reglas fijas, patrones
│   │   ├── duplicates.ts    # Detección de duplicados
│   │   └── restrictions.ts  # Validación de restricciones
│   │
│   └── import/              # Importación de menús
│       ├── ocr.service.ts   # Llamadas a IA
│       ├── parser.ts        # Procesamiento de respuesta
│       └── validator.ts     # Validación de datos
│
├── services/                # Servicios técnicos
│   ├── db.ts                # Configuración Dexie
│   ├── ai/                  # Capa de abstracción IA
│   │   ├── ai.types.ts      # Contratos JSON
│   │   ├── ai.provider.ts   # Interface
│   │   ├── openai.provider.ts
│   │   ├── claude.provider.ts
│   │   └── mock.provider.ts
│   └── storage.ts           # Helpers localStorage
│
├── hooks/                   # Hooks genéricos
│   ├── useLocalStorage.ts
│   ├── useDebounce.ts
│   └── useMediaQuery.ts
│
├── utils/                   # Utilidades puras
│   ├── dates.ts             # Helpers de fechas
│   ├── food.ts              # Normalización de alimentos
│   └── validation.ts        # Schemas de validación
│
└── types/                   # Tipos globales
    └── index.ts
```

---

## Modelo de Almacenamiento Local (IndexedDB via Dexie)

### Tablas Principales
```typescript
// db.ts
import Dexie, { Table } from 'dexie';

export class MenuFamiliaDB extends Dexie {
  familyMembers!: Table<FamilyMember>;
  restrictions!: Table<Restriction>;
  recipes!: Table<Recipe>;
  ingredients!: Table<Ingredient>;
  mealSlots!: Table<MealSlot>;
  actualMeals!: Table<ActualMeal>;
  schoolMenus!: Table<SchoolMenu>;
  weeklyPatterns!: Table<WeeklyPattern>;
  shoppingLists!: Table<ShoppingList>;
  dayNotes!: Table<DayNote>;
  settings!: Table<AppSettings>;

  constructor() {
    super('menufamilia');
    this.version(1).stores({
      familyMembers: '++id, name, type',
      restrictions: '++id, memberId, type',
      recipes: '++id, name, *categories, *tags, isFavorite',
      ingredients: '++id, name, category',
      mealSlots: '++id, date, mealType, [date+mealType]',
      actualMeals: '++id, date, mealType, [date+mealType]',
      schoolMenus: '++id, month, childId',
      weeklyPatterns: '++id, dayOfWeek, mealType',
      shoppingLists: '++id, createdAt, status',
      dayNotes: '++id, date',
      settings: 'key'
    });
  }
}

export const db = new MenuFamiliaDB();
```

### Índices Clave
- `[date+mealType]`: Búsqueda rápida de slot específico
- `*categories`: Multi-value index para filtrar recetas
- `month`: Búsqueda de menús escolares por mes

---

## Estrategia de Rendimiento

### Objetivo: Arranque < 2 segundos

1. **Precaching de shell**
   - Service Worker precarga HTML, CSS, JS en instalación
   - Arranque posterior es instantáneo (desde cache)

2. **Lazy loading de rutas**
   ```typescript
   const Calendar = lazy(() => import('./pages/Calendar'));
   const Recipes = lazy(() => import('./pages/Recipes'));
   ```

3. **Skeleton screens**
   - Mientras carga datos, mostrar estructura visual
   - Evita "flash" de contenido vacío

4. **Datos críticos primero**
   - Vista Hoy: solo cargar día actual
   - Calendario: cargar mes actual, prefetch mes siguiente

5. **Bundle splitting**
   - Vite automáticamente divide chunks
   - IA providers solo se cargan si se usan

### Medición
```typescript
// Reportar Web Vitals
import { onLCP, onFID, onCLS } from 'web-vitals';
onLCP(console.log);  // Largest Contentful Paint < 2.5s
onFID(console.log);  // First Input Delay < 100ms
onCLS(console.log);  // Cumulative Layout Shift < 0.1
```

---

## Sincronización (Fase 2 - Futura)

### Estrategia: "Local-first con sync opcional"

```
MVP (Fase 1):
├── Todo en IndexedDB local
├── Sin backend
└── Sin cuentas de usuario

Fase 2:
├── Backend simple (Supabase / Firebase)
├── Auth opcional
├── Sync bidireccional con CRDT
│   ├── Automerge / Yjs para resolución de conflictos
│   └── Offline changes se mergean al reconectar
└── Compartir familia (invitar por link)
```

### Por qué no ahora:
- Añade complejidad significativa
- Requiere backend + auth + manejo de conflictos
- MVP funciona perfecto sin sync (una familia, un dispositivo principal)

---

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        DISPOSITIVO USUARIO                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    PWA (React + Vite)                    │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │    │
│  │  │  Hoy    │ │Calendar │ │ Recipes │ │Shopping │  ...   │    │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │    │
│  │       │           │           │           │             │    │
│  │  ┌────┴───────────┴───────────┴───────────┴────┐       │    │
│  │  │              Zustand Store                   │       │    │
│  │  │   (meals, recipes, family, shopping)         │       │    │
│  │  └────────────────────┬────────────────────────┘       │    │
│  │                       │                                 │    │
│  │  ┌────────────────────┴────────────────────────┐       │    │
│  │  │              Services Layer                  │       │    │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐   │       │    │
│  │  │  │ Dexie.js │  │Generation│  │ AI Layer │   │       │    │
│  │  │  │ (CRUD)   │  │ Engine   │  │(contracts)│   │       │    │
│  │  │  └────┬─────┘  └──────────┘  └─────┬────┘   │       │    │
│  │  └───────┼────────────────────────────┼────────┘       │    │
│  └──────────┼────────────────────────────┼────────────────┘    │
│             │                            │                      │
│  ┌──────────┴──────────┐    ┌───────────┴───────────┐         │
│  │     IndexedDB       │    │    Service Worker     │         │
│  │  (datos offline)    │    │   (cache + offline)   │         │
│  └─────────────────────┘    └───────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS (solo para IA)
                                    ▼
                    ┌───────────────────────────────┐
                    │      Proveedor IA (API)       │
                    │  OpenAI / Claude / Gemini     │
                    │    (intercambiable)           │
                    └───────────────────────────────┘
```

---

## Resumen de Decisiones Técnicas

| Decisión | Elección | Alternativa descartada | Razón |
|----------|----------|------------------------|-------|
| Framework UI | React | Vue, Svelte | Ecosistema más grande, más documentación |
| Bundler | Vite | Webpack, Parcel | Más rápido, mejor DX, tree-shaking |
| Estado global | Zustand | Redux, MobX | Más simple, menos boilerplate |
| DB local | Dexie (IndexedDB) | SQLite (Capacitor) | No requiere plugins nativos |
| Estilos | TailwindCSS | CSS Modules, Styled | Más rápido de desarrollar, responsive fácil |
| PWA | Vite PWA Plugin | Manual SW | Configuración automática, menos errores |
| Fechas | date-fns | moment, dayjs | Tree-shakeable, no mutable |
| Testing | Vitest | Jest | Integración nativa con Vite |
