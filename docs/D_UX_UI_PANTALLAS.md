# D) UX/UI: Pantallas y Flujos Detallados

## Principios de Diseño

1. **Mobile-first**: Diseño pensado para usar con una mano
2. **Mínimos toques**: Cualquier acción principal en ≤3 toques
3. **Contexto visible**: Siempre saber "qué comieron en el cole" cuando planificas cena
4. **Feedback inmediato**: Colores, chips, iconos claros
5. **Offline siempre**: Nunca mostrar "sin conexión" bloqueante

---

## Mapa de Navegación

```
┌─────────────────────────────────────────────────────────────┐
│                      BOTTOM NAV BAR                         │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│    HOY      │  CALENDARIO │   RECETAS   │    AJUSTES       │
│    [icon]   │   [icon]    │   [icon]    │    [icon]        │
└─────┬───────┴──────┬──────┴──────┬──────┴────────┬─────────┘
      │              │             │               │
      ▼              ▼             ▼               ▼
┌─────────┐   ┌──────────┐   ┌─────────┐    ┌──────────┐
│  Today  │   │ Calendar │   │ Recipes │    │ Settings │
│  View   │   │  View    │   │  List   │    │  Menu    │
└────┬────┘   └────┬─────┘   └────┬────┘    └────┬─────┘
     │             │              │               │
     ▼             ▼              ▼               ▼
┌─────────┐   ┌──────────┐   ┌─────────┐    ┌──────────┐
│  Day    │   │   Day    │   │ Recipe  │    │ Family   │
│ Detail  │◄──┤  Detail  │   │ Detail  │    │ Members  │
└────┬────┘   └────┬─────┘   └─────────┘    └──────────┘
     │             │                              │
     ▼             ▼                              ▼
┌─────────┐   ┌──────────┐                 ┌──────────┐
│  Meal   │   │  Multi   │                 │ Import   │
│ Detail  │   │  Select  │                 │  Menu    │
│ /Edit   │   │  +Apply  │                 │ (School) │
└─────────┘   └──────────┘                 └────┬─────┘
                                                │
     ┌────────────────────┐                     ▼
     │   Shopping List    │◄───────────┌──────────────┐
     │    (from FAB)      │            │ OCR Review   │
     └────────────────────┘            │ & Validate   │
                                       └──────────────┘
```

---

## Pantallas Detalladas

### 1. HOY (Today View) - Pantalla Principal

**Propósito**: Ver de un vistazo qué toca hoy y acceder rápidamente a editar.

```
┌────────────────────────────────────────┐
│  ← MenúFamilia          [≡] [+receta]  │
├────────────────────────────────────────┤
│                                        │
│  Miércoles, 15 Enero                   │
│  ◄  ●  ►                [Ir a fecha]   │
│                                        │
├────────────────────────────────────────┤
│  🏫 COLE (niños)                       │
│  ┌──────────────────────────────────┐  │
│  │ 🥣 Crema de verduras             │  │
│  │ 🍖 Albóndigas con tomate  [CARNE]│  │
│  │ 🍎 Fruta de temporada            │  │
│  │    ⚠️ Pablo: pelar fruta         │  │
│  └──────────────────────────────────┘  │
│                                        │
├────────────────────────────────────────┤
│  🍽️ CENA PLANIFICADA                  │
│  ┌──────────────────────────────────┐  │
│  │ Tortilla de patatas     [HUEVO]  │  │
│  │ Para: Papá, Mamá, Pablo, María   │  │
│  │ ⚠️ María: alternativa sin huevo  │  │
│  │                                  │  │
│  │ [Ver receta]  [Cambiar] [✓ Hecho]│  │
│  └──────────────────────────────────┘  │
│                                        │
│  🍼 BEBÉ                               │
│  ┌──────────────────────────────────┐  │
│  │ Puré de calabacín con pollo      │  │
│  │ [Cambiar]              [✓ Hecho] │  │
│  └──────────────────────────────────┘  │
│                                        │
├────────────────────────────────────────┤
│  📝 Nota del día                       │
│  ┌──────────────────────────────────┐  │
│  │ Pablo tiene excursión mañana     │  │
│  │ [Editar nota]                    │  │
│  └──────────────────────────────────┘  │
│                                        │
├────────────────────────────────────────┤
│   [HOY]    [CALENDARIO]  [RECETAS] [⚙️]│
└────────────────────────────────────────┘
```

**Interacciones**:
- **Swipe izq/der**: Cambiar día
- **Tap en [Cambiar]**: Abre selector de receta/plato
- **Tap en [✓ Hecho]**: Marca como comido (plan → actual)
- **Tap en card de comida**: Abre detalle con ingredientes
- **Long press en card**: Menú contextual (copiar, mover, eliminar)

**Chips de categoría**:
- `[CARNE]` = rojo suave
- `[PESCADO]` = azul
- `[HUEVO]` = amarillo
- `[PASTA]` = naranja
- `[LEGUMBRES]` = marrón
- `[VERDURA]` = verde

---

### 2. CALENDARIO (Calendar View)

**Propósito**: Vista mensual para planificar y revisar todo el mes.

```
┌────────────────────────────────────────┐
│  ← Enero 2025           [<] [>] [HOY]  │
├────────────────────────────────────────┤
│  L    M    X    J    V    S    D       │
├────────────────────────────────────────┤
│       │    │ 1  │ 2  │ 3  │ 4  │ 5    │
│       │    │🟢  │🟢  │🟠  │🔵  │🔵    │
├────────────────────────────────────────┤
│  6   │ 7  │ 8  │ 9  │10  │11  │12    │
│ 🔴   │🟢  │🟢  │🟢  │🟢  │🔵  │🔵    │
│ fest │    │    │    │    │    │       │
├────────────────────────────────────────┤
│ 13   │14  │15  │16  │17  │18  │19    │
│ 🟢   │🟢  │🟢  │🍕  │🟢  │🔵  │🔵    │
│      │    │HOY │jue │    │    │       │
├────────────────────────────────────────┤
│ 20   │21  │22  │23  │24  │25  │26    │
│ 🟢   │🟢  │🟢  │🍕  │🟢  │🔵  │🔵    │
├────────────────────────────────────────┤
│ 27   │28  │29  │30  │31  │    │       │
│ 🟢   │🟢  │🟢  │🍕  │🟢  │    │       │
└────────────────────────────────────────┘
│                                        │
│  LEYENDA:                              │
│  🟢 Planificado  🔵 Fin de semana      │
│  🟠 Parcial      🔴 Festivo/Sin cole   │
│  🍕 Regla fija   ⚠️ Alerta             │
│                                        │
├────────────────────────────────────────┤
│  ACCIONES RÁPIDAS:                     │
│  [📷 Importar menú cole]               │
│  [🔄 Generar mes]                      │
│  [✏️ Selección múltiple]               │
│  [🛒 Lista de compra]                  │
│                                        │
├────────────────────────────────────────┤
│   [HOY]    [CALENDARIO]  [RECETAS] [⚙️]│
└────────────────────────────────────────┘
```

**Interacciones**:
- **Tap en día**: Abre Day Detail
- **Long press en día**: Inicia selección múltiple
- **Swipe horizontal calendario**: Cambiar mes
- **[Selección múltiple]**: Activa modo selección

---

### 3. DETALLE DE DÍA (Day Detail)

**Propósito**: Ver y editar todas las comidas de un día específico.

```
┌────────────────────────────────────────┐
│  ← Miércoles 15 Enero    [✏️] [🗑️]    │
├────────────────────────────────────────┤
│                                        │
│  ────────── COLE (12:30) ──────────    │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 1º Crema de verduras             │  │
│  │    [VERDURA] [SOPA]              │  │
│  ├──────────────────────────────────┤  │
│  │ 2º Albóndigas con tomate         │  │
│  │    [CARNE] [CERDO]               │  │
│  │    ℹ️ Proteína: cerdo             │  │
│  ├──────────────────────────────────┤  │
│  │ 🍎 Fruta de temporada            │  │
│  │    ⚠️ Pablo: necesita pelar      │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ────────── CENA (20:00) ──────────    │
│                                        │
│  PLANIFICADO:                          │
│  ┌──────────────────────────────────┐  │
│  │ Tortilla de patatas              │  │
│  │ [HUEVO] [VEGETARIANO]            │  │
│  │                                  │  │
│  │ 👥 Papá, Mamá, Pablo, María      │  │
│  │ ⚠️ María: preparar alternativa   │  │
│  │                                  │  │
│  │ 📋 Ingredientes:                 │  │
│  │    • 500g patatas                │  │
│  │    • 6 huevos                    │  │
│  │    • Aceite de oliva             │  │
│  │    • Sal                         │  │
│  │                                  │  │
│  │ [Ver receta completa]            │  │
│  │                                  │  │
│  │ [🔄 Cambiar]  [✓ Marcar comido]  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  BEBÉ:                                 │
│  ┌──────────────────────────────────┐  │
│  │ Puré calabacín + pollo           │  │
│  │ [🔄 Cambiar]  [✓ Marcar comido]  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ────────── REAL ──────────            │
│  (sin registrar aún)                   │
│  [📝 Registrar lo que se comió]        │
│                                        │
│  ────────── NOTA ──────────            │
│  ┌──────────────────────────────────┐  │
│  │ Pablo tiene excursión mañana     │  │
│  │ [Editar]                         │  │
│  └──────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

---

### 4. CAMBIAR COMIDA (Meal Selector) - Modal/Bottom Sheet

**Propósito**: Cambiar una comida en máximo 3 toques.

```
┌────────────────────────────────────────┐
│  Cambiar cena - Mié 15               X │
├────────────────────────────────────────┤
│                                        │
│  🔍 Buscar receta...                   │
│                                        │
│  ─── SUGERENCIAS (evitan duplicado) ───│
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 🥗 Ensalada César con pollo      │  │
│  │    [POLLO] [ENSALADA]            │  │
│  │    ✓ No repite cerdo del cole    │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 🍝 Espaguetis carbonara          │  │
│  │    [PASTA] [CERDO]               │  │
│  │    ⚠️ Repite cerdo (albóndigas)  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 🐟 Salmón a la plancha           │  │
│  │    [PESCADO] [PLANCHA]           │  │
│  │    ✓ No repite proteína          │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ─── FAVORITOS ────────────────────    │
│  [Tortilla] [Pasta] [Pizza] [Pollo]   │
│                                        │
│  ─── CATEGORÍAS ───────────────────    │
│  [Todas] [Carne] [Pescado] [Vegetal]  │
│  [Pasta] [Arroz] [Legumbres] [Rápido] │
│                                        │
│  ─── O ESCRIBE PLATO LIBRE ────────    │
│  ┌──────────────────────────────────┐  │
│  │ Ej: "Croquetas con ensalada"     │  │
│  └──────────────────────────────────┘  │
│                                        │
│  [Cancelar]              [✓ Aplicar]  │
└────────────────────────────────────────┘
```

**Flujo 3 toques**:
1. Tap [Cambiar] en la card de comida
2. Tap en sugerencia o favorito
3. Tap [✓ Aplicar] (o se aplica automático)

---

### 5. SELECCIÓN MÚLTIPLE + APLICAR CAMBIO

**Propósito**: Cambiar varios días de golpe (ej: "todos los martes = brócoli").

```
┌────────────────────────────────────────┐
│  ← Selección múltiple    [Cancelar]    │
├────────────────────────────────────────┤
│  Seleccionados: 4 días                 │
│  [Lun 13] [Lun 20] [Lun 27] [Lun 3-Feb]│
│                                        │
├────────────────────────────────────────┤
│  L    M    X    J    V    S    D       │
├────────────────────────────────────────┤
│ [13] │14  │15  │16  │17  │18  │19     │
│  ✓   │    │    │    │    │    │       │
├────────────────────────────────────────┤
│ [20] │21  │22  │23  │24  │25  │26     │
│  ✓   │    │    │    │    │    │       │
├────────────────────────────────────────┤
│ [27] │28  │29  │30  │31  │    │       │
│  ✓   │    │    │    │    │    │       │
└────────────────────────────────────────┘
│                                        │
│  APLICAR A SELECCIÓN:                  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ [🔄] Cambiar cena por...         │  │
│  │     → Abre selector de comida    │  │
│  ├──────────────────────────────────┤  │
│  │ [📋] Crear patrón semanal        │  │
│  │     "Todos los lunes = X"        │  │
│  ├──────────────────────────────────┤  │
│  │ [🔒] Bloquear (no regenerar)     │  │
│  ├──────────────────────────────────┤  │
│  │ [🗑️] Limpiar planificación       │  │
│  └──────────────────────────────────┘  │
│                                        │
│  SELECCIÓN RÁPIDA:                     │
│  [Todos los L] [Todos los M] [...]     │
│  [Semana 13-19] [Mes completo]         │
│                                        │
└────────────────────────────────────────┘
```

**Interacciones**:
- **Tap en día**: Toggle selección
- **[Todos los L]**: Selecciona todos los lunes del mes
- **[Cambiar cena por...]**: Abre selector, aplica a todos los seleccionados

---

### 6. IMPORTAR MENÚ ESCOLAR

#### Paso 1: Captura

```
┌────────────────────────────────────────┐
│  ← Importar menú escolar               │
├────────────────────────────────────────┤
│                                        │
│  📷                                    │
│  ┌──────────────────────────────────┐  │
│  │                                  │  │
│  │      [Toca para hacer foto]      │  │
│  │                                  │  │
│  │              o                   │  │
│  │                                  │  │
│  │      [Seleccionar imagen]        │  │
│  │                                  │  │
│  │      [Pegar desde portapapeles]  │  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Mes: [Enero ▼]  Año: [2025 ▼]        │
│                                        │
│  Colegio: [CEIP San Juan        ]      │
│                                        │
│  Niños que comen en este cole:         │
│  [✓] Pablo  [✓] María  [ ] Bebé        │
│                                        │
│  ℹ️ Consejo: Haz la foto con buena luz │
│     y que se vea todo el mes           │
│                                        │
│                    [Siguiente →]       │
└────────────────────────────────────────┘
```

#### Paso 2: Procesando OCR

```
┌────────────────────────────────────────┐
│  Procesando menú...                    │
├────────────────────────────────────────┤
│                                        │
│         ┌─────────────────┐            │
│         │   [Imagen del   │            │
│         │     menú]       │            │
│         └─────────────────┘            │
│                                        │
│              ◌ ◌ ◌ ◌                   │
│         Analizando imagen...           │
│                                        │
│  ✓ Imagen recibida                     │
│  ✓ Detectando estructura              │
│  ◌ Extrayendo platos                   │
│  ○ Normalizando ingredientes           │
│  ○ Detectando proteínas                │
│                                        │
│  Esto puede tardar 10-30 segundos      │
│                                        │
└────────────────────────────────────────┘
```

#### Paso 3: Validación/Corrección

```
┌────────────────────────────────────────┐
│  ← Revisar menú detectado    [Guardar] │
├────────────────────────────────────────┤
│  Confianza global: 87% ██████████░░    │
│  ⚠️ 2 días requieren revisión          │
│                                        │
│  ─── Semana 1 (6-10 Enero) ───         │
│                                        │
│  📅 Lun 6 - FESTIVO (Reyes)            │
│  ┌──────────────────────────────────┐  │
│  │ [Sin cole]                 [✓]   │  │
│  └──────────────────────────────────┘  │
│                                        │
│  📅 Mar 7                               │
│  ┌──────────────────────────────────┐  │
│  │ 1º Crema de verduras       [✏️]  │  │
│  │ 2º Albóndigas tomate       [✏️]  │  │
│  │    → Proteína: [CERDO ▼]         │  │
│  │ 🍎 Fruta temporada         [✏️]  │  │
│  │                            95%   │  │
│  └──────────────────────────────────┘  │
│                                        │
│  📅 Mié 8                      ⚠️       │
│  ┌──────────────────────────────────┐  │
│  │ 1º Lentejas estofadas      [✏️]  │  │
│  │ 2º Merluza c/ ensalada     [✏️]  │  │
│  │    ⚠️ No claro si "c/" = con/sin │  │
│  │    → [Es "con ensalada"]         │  │
│  │    → [Es "sin ensalada"]         │  │
│  │ 🍎 Yogur                   [✏️]  │  │
│  │                            72%   │  │
│  └──────────────────────────────────┘  │
│                                        │
│  [Ver imagen original]                 │
│                                        │
│  [← Anterior semana] [Siguiente →]     │
│                                        │
│  [Cancelar]         [✓ Guardar todo]  │
└────────────────────────────────────────┘
```

**Interacciones**:
- **[✏️]**: Editar campo inline
- **[CERDO ▼]**: Dropdown para cambiar proteína detectada
- **Botones de clarificación**: Resuelven ambigüedades del OCR
- **[Ver imagen original]**: Modal con zoom para verificar

---

### 7. CATÁLOGO DE RECETAS

```
┌────────────────────────────────────────┐
│  Recetas               [+] [🔍] [≡]    │
├────────────────────────────────────────┤
│                                        │
│  🔍 Buscar por nombre o ingrediente... │
│                                        │
│  FILTROS:                              │
│  [Todas] [Favoritas] [Rápidas] [Bebé]  │
│  [Carne] [Pescado] [Vegetal] [Plato ú] │
│                                        │
│  ─── FAVORITAS ────────────────────    │
│                                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ 🍳      │ │ 🍝      │ │ 🥗      │  │
│  │Tortilla │ │Carbonara│ │Ensalada │  │
│  │ ★ x23   │ │ ★ x18   │ │ ★ x15   │  │
│  └─────────┘ └─────────┘ └─────────┘  │
│                                        │
│  ─── RECIENTES ────────────────────    │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 🍖 Pollo al horno con patatas    │  │
│  │    [POLLO] [HORNO] 45min  ★      │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ 🐟 Merluza en salsa verde        │  │
│  │    [PESCADO] [SALSA] 30min       │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ 🥘 Lentejas con chorizo          │  │
│  │    [LEGUMBRES] [PLATO ÚNICO] 1h  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ─── TODAS (A-Z) ──────────────────    │
│  [A] [B] [C] [D] [E] [F] [G] ...       │
│                                        │
├────────────────────────────────────────┤
│   [HOY]    [CALENDARIO]  [RECETAS] [⚙️]│
└────────────────────────────────────────┘
```

---

### 8. DETALLE/EDICIÓN DE RECETA

```
┌────────────────────────────────────────┐
│  ← Tortilla de patatas    [★] [✏️] [🗑]│
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐  │
│  │        [Foto de receta]          │  │
│  │         (tap para añadir)        │  │
│  └──────────────────────────────────┘  │
│                                        │
│  [HUEVO] [VEGETARIANO] [PLATO ÚNICO]   │
│  [RÁPIDO]                              │
│                                        │
│  ⏱️ 35 min  |  👥 4 pers  |  📊 Fácil  │
│                                        │
│  ─── INGREDIENTES ─────────────────    │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ ☐ 500g Patatas                   │  │
│  │ ☐ 6 Huevos                       │  │
│  │ ☐ 200ml Aceite de oliva          │  │
│  │ ☐ Sal (al gusto)                 │  │
│  │ ☐ 1 Cebolla (opcional)           │  │
│  │                      [+ Añadir]  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ─── RESTRICCIONES ────────────────    │
│                                        │
│  ⚠️ Contiene huevo directo             │
│     María no puede comerlo             │
│                                        │
│  ─── PREPARACIÓN ──────────────────    │
│                                        │
│  1. Pelar y cortar las patatas...      │
│  2. Freír las patatas...               │
│  3. Batir los huevos...                │
│  [Ver completo]                        │
│                                        │
│  ─── HISTORIAL ────────────────────    │
│  Última vez: 8 Ene 2025                │
│  Veces usada: 23                       │
│                                        │
│  [📅 Añadir al menú]  [📋 A la compra] │
│                                        │
└────────────────────────────────────────┘
```

---

### 9. CREAR RECETA (desde texto libre)

```
┌────────────────────────────────────────┐
│  ← Nueva receta            [Guardar]   │
├────────────────────────────────────────┤
│                                        │
│  Nombre: [                        ]    │
│                                        │
│  ─── IMPORTAR DESDE TEXTO ─────────    │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ Pega aquí la receta completa:    │  │
│  │                                  │  │
│  │ Ejemplo:                         │  │
│  │ "Necesitas 500g de patatas,      │  │
│  │ 6 huevos, aceite y sal.          │  │
│  │ Pela las patatas..."             │  │
│  │                                  │  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  [🤖 Extraer ingredientes automático]  │
│                                        │
│  ─── O AÑADIR MANUALMENTE ─────────    │
│                                        │
│  Ingredientes:                         │
│  ┌──────────────────────────────────┐  │
│  │ (vacío - añade ingredientes)     │  │
│  │                      [+ Añadir]  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Categorías:                           │
│  [ ] Carne  [ ] Pescado  [ ] Huevo    │
│  [ ] Pasta  [ ] Arroz    [ ] Legumbre │
│  [ ] Verdura [ ] Plato único          │
│                                        │
│  Tags especiales:                      │
│  [ ] Contiene huevo directo            │
│  [ ] Contiene huevo horneado           │
│  [ ] Fruta con piel                    │
│  [ ] Apto para bebé                    │
│                                        │
└────────────────────────────────────────┘
```

---

### 10. LISTA DE COMPRA

```
┌────────────────────────────────────────┐
│  ← Lista de compra      [📤] [🗑️]      │
├────────────────────────────────────────┤
│                                        │
│  Semana 13-19 Enero                    │
│  [< Semana ant.] [Esta semana] [Sig >] │
│                                        │
│  Progreso: 5/23 ████░░░░░░░░░ 22%     │
│                                        │
│  ─── VERDURAS (8) ─────────────────    │
│                                        │
│  ☐ 2kg Patatas                         │
│     → Mié cena, Vie cena               │
│  ☑ 4 Cebollas                          │
│  ☐ 1kg Zanahorias                      │
│  ☐ 4 Calabacines (puré bebé)           │
│  ☐ Lechuga                             │
│  ☐ Tomates                             │
│  ☐ Brócoli                             │
│  ☐ Judías verdes                       │
│                                        │
│  ─── CARNE (4) ────────────────────    │
│                                        │
│  ☐ 800g Pechuga de pollo               │
│     → Mar cena, Sáb comida             │
│  ☐ 500g Carne picada                   │
│  ☑ 400g Lomo de cerdo                  │
│  ☐ Chorizo (para lentejas)             │
│                                        │
│  ─── PESCADO (2) ──────────────────    │
│                                        │
│  ☐ 600g Merluza                        │
│  ☐ 400g Salmón                         │
│                                        │
│  ─── LÁCTEOS (3) ──────────────────    │
│                                        │
│  ☑ 18 Huevos                           │
│  ☐ 1L Leche                            │
│  ☐ Yogures                             │
│                                        │
│  ─── OTROS (6) ────────────────────    │
│                                        │
│  ☐ Pasta (500g)                        │
│  ☐ Arroz (1kg)                         │
│  ☐ Lentejas (500g)                     │
│  ☑ Pizza congelada (jueves)            │
│  ☐ Pan rallado                         │
│  ☐ Aceite de oliva                     │
│                                        │
│  ─────────────────────────────────     │
│  [+ Añadir item manual]                │
│                                        │
│  [📤 Compartir lista]  [🔄 Regenerar]  │
│                                        │
└────────────────────────────────────────┘
```

---

### 11. AJUSTES

```
┌────────────────────────────────────────┐
│  ← Ajustes                             │
├────────────────────────────────────────┤
│                                        │
│  ─── FAMILIA ──────────────────────    │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 👤 Miembros de la familia     >  │  │
│  │    5 miembros, 3 con restricción │  │
│  ├──────────────────────────────────┤  │
│  │ ⚠️ Restricciones alimentarias  > │  │
│  │    Huevo (María), Piel fruta...  │  │
│  ├──────────────────────────────────┤  │
│  │ 🏫 Colegios                    > │  │
│  │    CEIP San Juan                 │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ─── REGLAS Y PATRONES ────────────    │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 📅 Patrones semanales          > │  │
│  │    Jueves = Pizza                │  │
│  ├──────────────────────────────────┤  │
│  │ 🔒 Reglas fijas                > │  │
│  │    1 regla activa                │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ─── PREFERENCIAS ─────────────────    │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ Semana empieza: [Lunes ▼]        │  │
│  │ Raciones por defecto: [4 ▼]      │  │
│  │ Tema: [Sistema ▼]                │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ─── DATOS ────────────────────────    │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 💾 Exportar datos              > │  │
│  │ 📥 Importar datos              > │  │
│  │ 🗑️ Borrar todos los datos      > │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ─── SOBRE ────────────────────────    │
│                                        │
│  MenúFamilia v1.0.0                    │
│  Hecho con ❤️ para familias            │
│                                        │
├────────────────────────────────────────┤
│   [HOY]    [CALENDARIO]  [RECETAS] [⚙️]│
└────────────────────────────────────────┘
```

---

## Sistema Visual de Alertas y Estados

### Colores de Proteína/Categoría (Chips)
```css
/* Proteínas */
--chip-pollo: #FEF3C7;      /* Amarillo suave */
--chip-cerdo: #FECACA;      /* Rosa suave */
--chip-ternera: #FED7AA;    /* Naranja suave */
--chip-pescado: #BFDBFE;    /* Azul suave */
--chip-huevo: #FEF9C3;      /* Amarillo claro */
--chip-legumbres: #D9F99D;  /* Verde lima */

/* Categorías */
--chip-pasta: #FDBA74;      /* Naranja */
--chip-arroz: #FDE68A;      /* Amarillo */
--chip-verdura: #86EFAC;    /* Verde */
--chip-fritura: #FCA5A5;    /* Rojo suave */

/* Estados */
--state-planned: #3B82F6;   /* Azul - planificado */
--state-actual: #10B981;    /* Verde - comido */
--state-alert: #F59E0B;     /* Naranja - alerta */
--state-error: #EF4444;     /* Rojo - problema */
```

### Iconos de Estado
```
✓  = Completado/Comido
⚠️ = Alerta (restricción, duplicado)
🔒 = Bloqueado (no regenerar)
📅 = Regla fija / Patrón
🏫 = Menú del cole
🍼 = Menú bebé
★  = Favorito
```

### Indicadores de Duplicado
```
En el calendario:
- Día con duplicado: borde naranja punteado
- Hover/tap: tooltip "Cena repite pollo del cole"

En selector de comida:
- Receta que duplica: fila con fondo naranja claro
- Icono ⚠️ + texto "Repite cerdo"
- Receta que NO duplica: icono ✓ + "No repite proteína"
```

---

## Resumen de Interacciones Críticas

| Acción | Toques | Flujo |
|--------|--------|-------|
| Ver qué toca hoy | 1 | Abrir app (landing = Hoy) |
| Cambiar cena de hoy | 3 | Tap Hoy → Tap [Cambiar] → Tap receta |
| Ver ingredientes de cena | 2 | Tap Hoy → Tap card de cena |
| Marcar como comido | 2 | Tap Hoy → Tap [✓ Hecho] |
| Generar menú del mes | 3 | Tap Calendario → Tap [Generar] → Tap [Confirmar] |
| Importar menú escolar | 4 | Calendario → [Importar] → Foto → [Guardar] |
| Ver lista de compra | 2 | Tap FAB 🛒 → Seleccionar rango |
| Añadir receta | 3 | Recetas → [+] → Rellenar → [Guardar] |
| Cambiar varios días | 4 | Calendario → [Múltiple] → Seleccionar → [Aplicar] |
