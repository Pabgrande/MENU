# G) Plan de Implementación

## Visión General de Fases

```
┌─────────────────────────────────────────────────────────────────┐
│                         MVP (Fase 1)                             │
│  "App funcional para una familia, un dispositivo"               │
│  ─────────────────────────────────────────────────────────────  │
│  • Navegación básica (Hoy, Calendario, Recetas, Ajustes)        │
│  • CRUD completo de recetas e ingredientes                       │
│  • Gestión de MealSlots (plan) y ActualMeals (real)             │
│  • Importación de menú escolar con OCR                          │
│  • Motor de generación de menús                                  │
│  • Lista de compra por rango                                     │
│  • Reglas fijas y patrones semanales                            │
│  • Gestión de familia y restricciones                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Fase 2                                   │
│  "Mejoras de UX y funcionalidades avanzadas"                    │
│  ─────────────────────────────────────────────────────────────  │
│  • Sincronización multi-dispositivo (Supabase)                  │
│  • Compartir familia (invitaciones)                             │
│  • Notificaciones push                                          │
│  • Widgets para móvil                                           │
│  • Historial y estadísticas                                     │
│  • Sugerencias mejoradas con ML                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Fase 3                                   │
│  "Ecosistema completo"                                          │
│  ─────────────────────────────────────────────────────────────  │
│  • Integración con supermercados (Mercadona, Carrefour)         │
│  • Escaneo de tickets de compra                                 │
│  • Comunidad de recetas                                         │
│  • Planificación nutricional                                    │
│  • Asistente de voz                                             │
│  • App nativa opcional                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Backlog MVP - Historias de Usuario Priorizadas

### Épica 1: Fundamentos (Prioridad: CRÍTICA)

#### HU-001: Configuración del proyecto
**Como** desarrollador
**Quiero** tener el proyecto configurado con el stack elegido
**Para** poder empezar a desarrollar funcionalidades

**Criterios de Aceptación:**
- [ ] Proyecto React + Vite + TypeScript inicializado
- [ ] TailwindCSS configurado
- [ ] Dexie.js configurado con esquema inicial
- [ ] React Router configurado con rutas básicas
- [ ] PWA plugin configurado
- [ ] ESLint + Prettier configurados
- [ ] Estructura de carpetas según arquitectura
- [ ] Build funciona sin errores
- [ ] App abre en < 2 segundos en dev

**Dependencias:** Ninguna

---

#### HU-002: Navegación principal
**Como** usuario
**Quiero** navegar entre las secciones principales de la app
**Para** acceder rápidamente a cada funcionalidad

**Criterios de Aceptación:**
- [ ] Bottom navigation con 4 tabs: Hoy, Calendario, Recetas, Ajustes
- [ ] Iconos claros y texto descriptivo
- [ ] Tab activo visualmente destacado
- [ ] Navegación fluida sin recarga de página
- [ ] Funciona en móvil y desktop

**Dependencias:** HU-001

---

#### HU-003: Pantalla Hoy (vista básica)
**Como** usuario
**Quiero** ver qué comidas hay planificadas para hoy
**Para** saber qué preparar/comprar

**Criterios de Aceptación:**
- [ ] Muestra fecha actual con día de la semana
- [ ] Muestra sección "Cole" con los platos del colegio (si los hay)
- [ ] Muestra sección "Cena planificada"
- [ ] Muestra sección "Bebé" separada
- [ ] Botones para navegar a día anterior/siguiente
- [ ] Skeleton loading mientras carga datos

**Dependencias:** HU-002, HU-006

---

### Épica 2: Gestión de Datos Base (Prioridad: ALTA)

#### HU-004: CRUD de miembros de familia
**Como** usuario
**Quiero** gestionar los miembros de mi familia
**Para** personalizar la planificación para cada uno

**Criterios de Aceptación:**
- [ ] Lista de miembros con nombre, tipo y color
- [ ] Añadir nuevo miembro (nombre, tipo: adulto/niño/bebé, fecha nacimiento)
- [ ] Editar miembro existente
- [ ] Desactivar miembro (soft delete)
- [ ] Datos persisten en IndexedDB

**Dependencias:** HU-001

---

#### HU-005: Gestión de restricciones alimentarias
**Como** usuario
**Quiero** definir restricciones alimentarias por miembro
**Para** que la app las tenga en cuenta al generar menús

**Criterios de Aceptación:**
- [ ] Ver restricciones de un miembro
- [ ] Añadir restricción con tipo (alergia, intolerancia, textura, edad)
- [ ] Definir condiciones (ingrediente, formas permitidas/prohibidas)
- [ ] Editar/eliminar restricción
- [ ] Restricción de huevo condicional funciona correctamente
- [ ] Restricción de piel de fruta funciona correctamente

**Dependencias:** HU-004

---

#### HU-006: CRUD de recetas
**Como** usuario
**Quiero** gestionar mi catálogo de recetas
**Para** usarlas en la planificación de menús

**Criterios de Aceptación:**
- [ ] Lista de recetas con búsqueda y filtros
- [ ] Crear receta: nombre, categorías, proteína, tags, ingredientes
- [ ] Editar receta existente
- [ ] Eliminar receta (con confirmación)
- [ ] Marcar/desmarcar favorita
- [ ] Ver detalle de receta con ingredientes
- [ ] Recetas persisten en IndexedDB

**Dependencias:** HU-001, HU-007

---

#### HU-007: Gestión de ingredientes
**Como** usuario
**Quiero** tener un catálogo de ingredientes
**Para** usarlos en recetas y listas de compra

**Criterios de Aceptación:**
- [ ] Lista de ingredientes con categorías
- [ ] Añadir ingrediente (nombre, categoría, unidad por defecto)
- [ ] Editar ingrediente
- [ ] Búsqueda rápida de ingredientes
- [ ] Ingredientes seed cargados al inicializar
- [ ] Autocompletado al añadir a receta

**Dependencias:** HU-001

---

#### HU-008: Añadir ingredientes a receta
**Como** usuario
**Quiero** añadir ingredientes a una receta con cantidades
**Para** poder generar listas de compra

**Criterios de Aceptación:**
- [ ] Buscador de ingredientes en modal
- [ ] Crear ingrediente nuevo si no existe
- [ ] Especificar cantidad y unidad
- [ ] Marcar como opcional
- [ ] Añadir preparación (picado, etc.)
- [ ] Reordenar ingredientes
- [ ] Eliminar ingrediente de receta

**Dependencias:** HU-006, HU-007

---

### Épica 3: Planificación de Comidas (Prioridad: ALTA)

#### HU-009: Calendario mensual básico
**Como** usuario
**Quiero** ver un calendario mensual con las comidas planificadas
**Para** tener visión global del mes

**Criterios de Aceptación:**
- [ ] Vista de calendario mensual
- [ ] Navegar entre meses
- [ ] Cada día muestra indicador de estado (planificado, parcial, vacío)
- [ ] Tap en día abre detalle del día
- [ ] Días no lectivos marcados visualmente
- [ ] Hoy destacado visualmente

**Dependencias:** HU-002, HU-010

---

#### HU-010: CRUD de MealSlots (planificación)
**Como** usuario
**Quiero** crear y editar comidas planificadas
**Para** organizar el menú de la familia

**Criterios de Aceptación:**
- [ ] Crear MealSlot: fecha, tipo (comida/cena), receta o texto libre
- [ ] Asignar miembros que comen esa comida
- [ ] Editar MealSlot existente
- [ ] Eliminar MealSlot
- [ ] Ver origen del slot (cole, regla, generado, manual)
- [ ] Bloquear/desbloquear slot para regeneración

**Dependencias:** HU-006, HU-004

---

#### HU-011: Detalle del día
**Como** usuario
**Quiero** ver y editar todas las comidas de un día
**Para** gestionar la planificación diaria

**Criterios de Aceptación:**
- [ ] Ver comida del cole (si aplica)
- [ ] Ver cena planificada con ingredientes
- [ ] Ver comida del bebé separada
- [ ] Botón para cambiar cada comida (< 3 toques)
- [ ] Ver alertas de restricciones
- [ ] Campo de nota del día
- [ ] Navegar a día anterior/siguiente

**Dependencias:** HU-009, HU-010

---

#### HU-012: Cambiar comida rápido
**Como** usuario
**Quiero** cambiar una comida en 3 toques o menos
**Para** ajustar el menú ágilmente

**Criterios de Aceptación:**
- [ ] Bottom sheet con selector de comida
- [ ] Sugerencias que evitan duplicado con cole
- [ ] Favoritos accesibles rápidamente
- [ ] Filtro por categoría
- [ ] Campo para texto libre
- [ ] Indicador de duplicado (⚠️) y no-duplicado (✓)
- [ ] Aplicar cambio en 1 tap

**Dependencias:** HU-010, HU-006

---

#### HU-013: Registro de comida real (ActualMeal)
**Como** usuario
**Quiero** registrar lo que realmente se comió
**Para** tener historial real separado del plan

**Criterios de Aceptación:**
- [ ] Botón "Marcar como comido" en cada MealSlot
- [ ] Al marcar, crea ActualMeal igual al plan
- [ ] Opción de editar antes de guardar (cambiar lo que se comió)
- [ ] Marcar como "no se comió" (saltado)
- [ ] Ver historial de ActualMeals por día

**Dependencias:** HU-010

---

### Épica 4: Importación de Menú Escolar (Prioridad: ALTA)

#### HU-014: Captura de imagen de menú
**Como** usuario
**Quiero** tomar foto o seleccionar imagen del menú escolar
**Para** importarlo automáticamente

**Criterios de Aceptación:**
- [ ] Botón para abrir cámara
- [ ] Botón para seleccionar de galería
- [ ] Botón para pegar desde portapapeles
- [ ] Preview de imagen seleccionada
- [ ] Seleccionar mes/año del menú
- [ ] Seleccionar colegio
- [ ] Seleccionar niños que comen en ese cole

**Dependencias:** HU-002

---

#### HU-015: Procesamiento OCR del menú
**Como** usuario
**Quiero** que la app extraiga el menú de la imagen
**Para** no tener que escribirlo manualmente

**Criterios de Aceptación:**
- [ ] Enviar imagen a proveedor de IA
- [ ] Mostrar progreso de procesamiento
- [ ] Recibir y parsear respuesta JSON
- [ ] Manejar errores de red/API
- [ ] Funciona con proveedor mock en desarrollo
- [ ] Timeout de 60 segundos

**Dependencias:** HU-014, Contratos IA

---

#### HU-016: Validación y corrección de OCR
**Como** usuario
**Quiero** revisar y corregir el menú detectado
**Para** asegurar que los datos son correctos

**Criterios de Aceptación:**
- [ ] Vista de revisión día por día
- [ ] Indicador de confianza por campo
- [ ] Campos con baja confianza resaltados
- [ ] Editar cualquier campo inline
- [ ] Selector de proteína para segundo plato
- [ ] Marcar días como no lectivos
- [ ] Ver imagen original para comparar
- [ ] Guardar menú validado

**Dependencias:** HU-015

---

#### HU-017: Almacenar menú escolar
**Como** usuario
**Quiero** que el menú escolar quede guardado
**Para** usarlo en la generación de cenas

**Criterios de Aceptación:**
- [ ] Guardar SchoolMenu en IndexedDB
- [ ] Crear MealSlots de tipo "school" para cada día
- [ ] Asignar a los niños correspondientes
- [ ] Ver menú del cole en vista Hoy y Calendario
- [ ] Poder reimportar/actualizar mes existente

**Dependencias:** HU-016

---

### Épica 5: Generación Automática de Menús (Prioridad: ALTA)

#### HU-018: Configurar reglas fijas
**Como** usuario
**Quiero** definir reglas fijas (pizza jueves)
**Para** que se apliquen automáticamente

**Criterios de Aceptación:**
- [ ] Lista de reglas fijas activas
- [ ] Crear regla: día de semana, tipo comida, receta/plato
- [ ] Editar regla existente
- [ ] Activar/desactivar regla
- [ ] Eliminar regla
- [ ] Regla de pizza jueves por defecto

**Dependencias:** HU-006

---

#### HU-019: Configurar patrones semanales
**Como** usuario
**Quiero** definir patrones repetitivos
**Para** simplificar la planificación

**Criterios de Aceptación:**
- [ ] Lista de patrones activos
- [ ] Crear patrón: "todos los X = receta Y"
- [ ] Prioridad de patrón (si hay conflicto)
- [ ] Editar/eliminar patrón
- [ ] Patrones no sobrescriben reglas fijas

**Dependencias:** HU-006

---

#### HU-020: Motor de generación de menú
**Como** usuario
**Quiero** generar el menú del mes automáticamente
**Para** ahorrar tiempo de planificación

**Criterios de Aceptación:**
- [ ] Botón "Generar mes" en calendario
- [ ] Aplica reglas fijas primero
- [ ] Aplica patrones semanales
- [ ] Evita duplicar proteína/categoría con cole
- [ ] Respeta restricciones de miembros
- [ ] Prioriza favoritos y variedad
- [ ] No sobrescribe slots bloqueados
- [ ] Muestra resumen de generación

**Dependencias:** HU-010, HU-017, HU-018, HU-019, HU-005

---

#### HU-021: Revisión post-generación
**Como** usuario
**Quiero** revisar los avisos de la generación
**Para** ajustar casos problemáticos

**Criterios de Aceptación:**
- [ ] Modal con resultado de generación
- [ ] Lista de warnings (duplicados inevitables, restricciones)
- [ ] Tap en warning lleva al día afectado
- [ ] Estadísticas: slots generados, recetas usadas
- [ ] Botón para aceptar todo
- [ ] Botón para regenerar

**Dependencias:** HU-020

---

### Épica 6: Selección Múltiple (Prioridad: MEDIA)

#### HU-022: Modo selección múltiple
**Como** usuario
**Quiero** seleccionar varios días a la vez
**Para** aplicar cambios masivos

**Criterios de Aceptación:**
- [ ] Activar modo con botón o long press
- [ ] Tap en día toggle selección
- [ ] Chips de selección rápida: "Todos los lunes", "Semana X"
- [ ] Contador de días seleccionados
- [ ] Botón cancelar para salir del modo

**Dependencias:** HU-009

---

#### HU-023: Aplicar cambio a múltiples días
**Como** usuario
**Quiero** cambiar la cena de varios días de golpe
**Para** ahorrar tiempo

**Criterios de Aceptación:**
- [ ] Botón "Cambiar cena" aplica a todos los seleccionados
- [ ] Botón "Crear patrón" genera WeeklyPattern
- [ ] Botón "Bloquear" marca todos como locked
- [ ] Botón "Limpiar" elimina planificación
- [ ] Confirmación antes de aplicar

**Dependencias:** HU-022, HU-012

---

### Épica 7: Lista de Compra (Prioridad: MEDIA)

#### HU-024: Generar lista de compra
**Como** usuario
**Quiero** generar lista de compra desde el menú
**Para** saber qué comprar

**Criterios de Aceptación:**
- [ ] Seleccionar rango de fechas
- [ ] Agregar ingredientes de todas las recetas del rango
- [ ] Sumar cantidades del mismo ingrediente
- [ ] Agrupar por categoría
- [ ] Excluir ingredientes marcados como "siempre en casa"

**Dependencias:** HU-010, HU-008

---

#### HU-025: Gestionar lista de compra
**Como** usuario
**Quiero** marcar items comprados y añadir notas
**Para** gestionar la compra

**Criterios de Aceptación:**
- [ ] Lista con checkboxes
- [ ] Marcar/desmarcar comprado
- [ ] Ver de qué comidas viene cada item
- [ ] Añadir item manual
- [ ] Añadir nota a item
- [ ] Progreso visual (X de Y comprados)

**Dependencias:** HU-024

---

#### HU-026: Compartir lista de compra
**Como** usuario
**Quiero** compartir la lista
**Para** enviársela a quien va a comprar

**Criterios de Aceptación:**
- [ ] Botón compartir con Web Share API
- [ ] Formato texto legible
- [ ] Alternativa: copiar al portapapeles
- [ ] Incluye agrupación por categoría

**Dependencias:** HU-025

---

### Épica 8: Importación de Recetas (Prioridad: BAJA)

#### HU-027: Importar receta desde texto
**Como** usuario
**Quiero** pegar texto de una receta y que extraiga ingredientes
**Para** no escribirlos manualmente

**Criterios de Aceptación:**
- [ ] Campo de texto grande para pegar receta
- [ ] Botón "Extraer ingredientes"
- [ ] Llamada a IA para parsear
- [ ] Previsualizar ingredientes extraídos
- [ ] Editar/corregir antes de guardar
- [ ] Guardar receta con ingredientes

**Dependencias:** HU-006, Contratos IA

---

### Épica 9: PWA y Offline (Prioridad: ALTA)

#### HU-028: Instalación como PWA
**Como** usuario
**Quiero** instalar la app en mi móvil
**Para** tenerla como app nativa

**Criterios de Aceptación:**
- [ ] Manifest.json configurado
- [ ] Iconos en todos los tamaños necesarios
- [ ] Service Worker registrado
- [ ] Prompt de instalación funciona
- [ ] App se abre desde home screen
- [ ] Splash screen personalizado

**Dependencias:** HU-001

---

#### HU-029: Funcionamiento offline
**Como** usuario
**Quiero** usar la app sin conexión
**Para** consultarla en cualquier momento

**Criterios de Aceptación:**
- [ ] Todos los datos en IndexedDB
- [ ] Assets cacheados por Service Worker
- [ ] Indicador de estado de conexión
- [ ] Funciones de IA muestran mensaje si sin conexión
- [ ] Datos no se pierden al cerrar app

**Dependencias:** HU-028

---

## Iteraciones (Sprints)

### Sprint 1: Fundamentos
**Historias:** HU-001, HU-002, HU-028
**Objetivo:** Proyecto configurado, navegación funcionando, PWA instalable

### Sprint 2: Datos Base
**Historias:** HU-004, HU-005, HU-007
**Objetivo:** Gestión de familia, restricciones e ingredientes

### Sprint 3: Recetas
**Historias:** HU-006, HU-008
**Objetivo:** CRUD completo de recetas con ingredientes

### Sprint 4: Planificación Básica
**Historias:** HU-009, HU-010, HU-011, HU-003
**Objetivo:** Calendario, MealSlots, detalle de día, vista Hoy

### Sprint 5: Cambios Rápidos
**Historias:** HU-012, HU-013
**Objetivo:** Cambiar comida en 3 toques, registro de comida real

### Sprint 6: Importación Menú
**Historias:** HU-014, HU-015, HU-016, HU-017
**Objetivo:** Importar menú escolar con OCR completo

### Sprint 7: Generación
**Historias:** HU-018, HU-019, HU-020, HU-021
**Objetivo:** Motor de generación funcionando

### Sprint 8: Lista de Compra
**Historias:** HU-024, HU-025, HU-026
**Objetivo:** Lista de compra funcional

### Sprint 9: Selección Múltiple
**Historias:** HU-022, HU-023
**Objetivo:** Edición de múltiples días

### Sprint 10: Pulido
**Historias:** HU-027, HU-029, bugs, UX improvements
**Objetivo:** MVP completo y pulido

---

## Plan de Pruebas

### Tests Unitarios

| Módulo | Casos de prueba |
|--------|-----------------|
| **Normalización de platos** | Detecta proteína correcta, detecta categorías, maneja abreviaturas |
| **Detección de duplicados** | Identifica duplicado de proteína, duplicado de categoría, no falso positivo |
| **Validación restricciones** | Huevo directo bloqueante para María, huevo horneado permitido, piel de fruta warning para Pablo |
| **Generación de menú** | Aplica regla fija jueves, respeta patrones, evita duplicados, no sobrescribe bloqueados |
| **Lista de compra** | Suma cantidades correctamente, agrupa por categoría, excluye opcionales |
| **Manejo de fechas** | Primer/último día del mes, cambio de mes, días no lectivos |

### Tests de Integración

| Flujo | Pasos | Resultado esperado |
|-------|-------|-------------------|
| **Importar y generar** | Importar menú cole → Generar mes | Cenas no repiten proteína del cole |
| **Edición múltiple** | Seleccionar 4 lunes → Cambiar a "Pasta" | 4 MealSlots actualizados |
| **Plan a Real** | Planificar cena → Marcar como comido → Editar real | ActualMeal diferente de MealSlot |
| **Lista de compra** | Generar semana → Marcar comprados | Progreso se actualiza, persiste |

### Casos Borde

| Caso | Descripción | Prueba |
|------|-------------|--------|
| **OCR fallido** | Imagen ilegible | Mostrar error amigable, permitir entrada manual |
| **Día no lectivo** | Festivo no detectado | Usuario puede marcar como no lectivo |
| **Mes sin menú cole** | Vacaciones | Generación funciona sin datos de cole |
| **Sin recetas** | Catálogo vacío | Mensaje de ayuda, no crash |
| **Restricción conflictiva** | Toda la familia tiene restricción diferente | Avisos claros, sugerencias por miembro |
| **Cambio de mes** | 31 enero → 1 febrero | Navegación fluida, datos correctos |
| **Receta sin ingredientes** | Receta solo con nombre | Se puede usar, lista compra no incluye |
| **Duplicado inevitable** | Todas las recetas repiten proteína | Warning visible, asignar la menos repetida |

### Tests E2E (Playwright)

```typescript
// tests/e2e/full-flow.spec.ts
test('flujo completo: importar menú y generar', async ({ page }) => {
  // 1. Login/onboarding (si aplica)
  await page.goto('/');

  // 2. Ir a importar menú
  await page.click('[data-testid="nav-calendar"]');
  await page.click('[data-testid="btn-import-menu"]');

  // 3. Seleccionar imagen mock
  await page.setInputFiles('input[type="file"]', 'tests/fixtures/menu-enero.jpg');
  await page.click('[data-testid="btn-next"]');

  // 4. Esperar OCR (mock)
  await page.waitForSelector('[data-testid="ocr-review"]');

  // 5. Validar y guardar
  await page.click('[data-testid="btn-save-menu"]');

  // 6. Generar mes
  await page.click('[data-testid="btn-generate-month"]');
  await page.waitForSelector('[data-testid="generation-result"]');
  await page.click('[data-testid="btn-accept-generation"]');

  // 7. Verificar calendario tiene datos
  const plannedDays = await page.locator('[data-testid="day-planned"]').count();
  expect(plannedDays).toBeGreaterThan(15);

  // 8. Ir a vista Hoy
  await page.click('[data-testid="nav-today"]');

  // 9. Verificar que muestra comidas
  await expect(page.locator('[data-testid="school-meal"]')).toBeVisible();
  await expect(page.locator('[data-testid="dinner-planned"]')).toBeVisible();
});
```

---

## Métricas de Calidad MVP

| Métrica | Objetivo | Cómo medir |
|---------|----------|------------|
| **Tiempo de carga** | < 2s en 3G | Lighthouse, Web Vitals |
| **Cobertura tests** | > 70% | Vitest coverage |
| **Bugs críticos** | 0 | Tracking manual |
| **Accesibilidad** | Score > 90 | Lighthouse |
| **PWA Score** | 100 | Lighthouse |
| **Bundle size** | < 300KB gzip | Vite build stats |

---

## Checklist de Lanzamiento MVP

- [ ] Todos los tests pasan
- [ ] Lighthouse scores > 90 en todas las categorías
- [ ] Probado en Chrome, Safari, Firefox móvil
- [ ] Probado en iOS y Android
- [ ] PWA instalable y funciona offline
- [ ] Datos de ejemplo cargados
- [ ] Onboarding básico implementado
- [ ] Términos de uso y privacidad
- [ ] Dominio configurado con HTTPS
- [ ] CI/CD funcionando (deploy automático)
- [ ] Monitoreo de errores (Sentry)
- [ ] Analytics básico (Plausible/Simple Analytics)
