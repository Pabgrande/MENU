# MenúFamilia

Aplicación PWA offline-first para planificar menús familiares, evitar duplicados con el menú escolar, y gestionar restricciones alimentarias.

## Características Principales

- **Vista Hoy**: Ver de un vistazo qué toca comer hoy
- **Calendario mensual**: Planificación visual del mes completo
- **Catálogo de recetas**: CRUD completo con ingredientes
- **Importación OCR**: Importar menú escolar desde foto
- **Generación automática**: Motor que evita duplicar con el cole
- **Lista de compra**: Generada automáticamente desde el menú
- **Restricciones**: Gestión de alergias e intolerancias por miembro
- **Offline-first**: Funciona sin conexión, todo en IndexedDB

## Stack Técnico

- **React 18** + **TypeScript**
- **Vite** (bundler ultrarrápido)
- **TailwindCSS** (estilos utilitarios)
- **Dexie.js** (IndexedDB wrapper)
- **Zustand** (estado global)
- **React Router 6** (navegación)
- **PWA** con Workbox (offline)

## Instalación y Ejecución

### Requisitos previos

- Node.js 18+
- npm 9+ o pnpm

### Pasos

```bash
# 1. Ir a la carpeta de la app
cd app

# 2. Instalar dependencias
npm install

# 3. Ejecutar en modo desarrollo
npm run dev

# 4. Abrir en navegador
# http://localhost:5173
```

### Build de producción

```bash
# Generar build optimizado
npm run build

# Previsualizar build
npm run preview
```

## Estructura del Proyecto

```
app/
├── src/
│   ├── components/        # Componentes UI reutilizables
│   │   ├── layout/        # Layout, BottomNav
│   │   ├── ui/            # Button, Card, Chip, Input
│   │   └── meal/          # MealCard
│   ├── pages/             # Pantallas principales
│   │   ├── Today.tsx      # Vista "Hoy"
│   │   ├── Calendar.tsx   # Calendario mensual
│   │   ├── DayDetail.tsx  # Detalle de un día
│   │   ├── Recipes.tsx    # Lista de recetas
│   │   ├── RecipeDetail.tsx # Crear/editar receta
│   │   ├── ShoppingList.tsx # Lista de compra
│   │   ├── Settings.tsx   # Ajustes
│   │   ├── FamilyMembers.tsx # Gestión familia
│   │   └── ImportMenu.tsx # Importar menú escolar
│   ├── services/          # Servicios
│   │   ├── db.ts          # Configuración Dexie (IndexedDB)
│   │   └── seed.ts        # Datos iniciales
│   ├── types/             # Tipos TypeScript
│   │   └── index.ts       # Todos los tipos del dominio
│   ├── App.tsx            # Router principal
│   ├── main.tsx           # Entry point
│   └── index.css          # Estilos globales + Tailwind
├── public/                # Assets estáticos
├── index.html             # HTML principal
├── package.json           # Dependencias
├── vite.config.ts         # Configuración Vite + PWA
├── tailwind.config.js     # Configuración Tailwind
└── tsconfig.json          # Configuración TypeScript
```

## Documentación

Ver carpeta `/docs` para documentación detallada:

- `A_RESUMEN_INTERPRETACION.md` - Alcance y decisiones
- `B_STACK_ARQUITECTURA.md` - Stack técnico y arquitectura
- `C_MODELO_DATOS.md` - Esquema de datos con ejemplos
- `D_UX_UI_PANTALLAS.md` - Diseño de pantallas y flujos
- `E_MOTOR_GENERACION.md` - Algoritmo de generación de menús
- `F_CONTRATOS_IA.md` - Contratos JSON para servicios IA
- `G_PLAN_IMPLEMENTACION.md` - Backlog y plan de fases

## Familia de Ejemplo

La app viene preconfigurada con una familia de ejemplo:

- **Papá** y **Mamá** (adultos)
- **Pablo** (4 años) - Restricción: piel de fruta
- **María** (2.5 años) - Restricción: huevo directo (horneado OK)
- **Lucas** (bebé 9 meses) - Alimentación complementaria

## Funcionalidades MVP

| Funcionalidad | Estado |
|---------------|--------|
| Navegación básica | ✅ Implementado |
| Vista Hoy | ✅ Implementado |
| Calendario mensual | ✅ Implementado |
| CRUD Recetas | ✅ Implementado |
| Gestión familia | ✅ Implementado |
| Detalle de día | ✅ Implementado |
| Lista de compra | ✅ Implementado |
| Importación menú (UI) | ✅ Implementado |
| OCR real | ⏳ Pendiente (requiere API key) |
| Motor generación | ⏳ Pendiente |
| Patrones semanales | ⏳ Pendiente |
| PWA instalable | ✅ Configurado |

## Próximos Pasos

1. Integrar proveedor de IA real (OpenAI/Claude)
2. Implementar motor de generación completo
3. Añadir gestión de patrones semanales
4. Implementar selección múltiple de días
5. Tests unitarios y E2E
6. Sync multi-dispositivo (Fase 2)

## Licencia

MIT - Hecho con ❤️ para familias
