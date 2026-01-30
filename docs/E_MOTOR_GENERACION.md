# E) Motor de Generación de Menús

## Objetivo

Generar automáticamente un plan de comidas mensual que:
1. Evite duplicar proteína/categoría con lo que los niños comieron en el cole
2. Respete reglas fijas (pizza jueves)
3. Aplique patrones semanales configurados
4. Considere restricciones alimentarias de cada miembro
5. Priorice platos únicos para fines de semana
6. Maximice variedad (no repetir mismo plato en 7 días)
7. Prefiera recetas favoritas/frecuentes del usuario

---

## Detección de Ingrediente/Categoría Principal

### Jerarquía de Clasificación

Un plato se clasifica por su **componente principal** en este orden de prioridad:

```
1. PROTEÍNA PRINCIPAL (más importante para evitar duplicados)
   - pollo, cerdo, ternera, cordero
   - pescado_blanco, pescado_azul, marisco
   - huevo (como protagonista: tortilla, huevo frito)
   - legumbres (lentejas, garbanzos como plato principal)

2. CATEGORÍA DE PLATO (secundaria)
   - pasta (macarrones, espaguetis, lasaña)
   - arroz (paella, arroz blanco, risotto)
   - verdura (crema, menestra, ensalada)
   - guiso, fritura, plancha, horno, sopa

3. TAGS ESPECIALES (para restricciones)
   - contiene_huevo_directo
   - contiene_huevo_horneado
   - fruta_con_piel
   - apto_bebe
```

### Algoritmo de Extracción

```typescript
interface DishClassification {
  mainProtein: ProteinType | null;
  categories: DishCategory[];
  tags: RecipeTag[];
  confidence: number;
}

function classifyDish(dishName: string): DishClassification {
  const normalized = normalizeDishName(dishName);

  // 1. Buscar proteína en nombre
  const proteinKeywords = {
    pollo: ['pollo', 'pechuga', 'muslo', 'alitas'],
    cerdo: ['cerdo', 'lomo', 'costillas', 'chorizo', 'jamón', 'bacon', 'salchichas'],
    ternera: ['ternera', 'vaca', 'filete', 'solomillo', 'carne picada'],
    cordero: ['cordero', 'lechal'],
    pescado_blanco: ['merluza', 'bacalao', 'lenguado', 'rape', 'lubina', 'dorada'],
    pescado_azul: ['salmón', 'atún', 'sardinas', 'caballa', 'boquerones'],
    huevo: ['huevo', 'tortilla', 'revuelto', 'huevos'],
    legumbres: ['lentejas', 'garbanzos', 'alubias', 'judiones', 'fabada']
  };

  let mainProtein: ProteinType | null = null;
  for (const [protein, keywords] of Object.entries(proteinKeywords)) {
    if (keywords.some(kw => normalized.includes(kw))) {
      mainProtein = protein as ProteinType;
      break;
    }
  }

  // 2. Buscar categoría
  const categoryKeywords = {
    pasta: ['macarrones', 'espagueti', 'pasta', 'lasaña', 'canelones', 'fideos'],
    arroz: ['arroz', 'paella', 'risotto'],
    sopa: ['sopa', 'crema', 'puré', 'caldo'],
    ensalada: ['ensalada', 'ensaladilla'],
    guiso: ['guiso', 'estofado', 'cocido', 'potaje'],
    fritura: ['frito', 'rebozado', 'empanado', 'croquetas'],
    plancha: ['plancha', 'a la plancha', 'grillado'],
    horno: ['asado', 'horno', 'gratinado']
  };

  const categories: DishCategory[] = [];
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => normalized.includes(kw))) {
      categories.push(category as DishCategory);
    }
  }

  // 3. Detectar tags especiales
  const tags: RecipeTag[] = [];

  // Huevo directo vs horneado
  if (normalized.match(/tortilla|huevo frito|huevos? revuelto|huevo cocido/)) {
    tags.push('contiene_huevo_directo');
  }
  if (normalized.match(/rebozado|empanado|croquetas|bizcocho|galletas/)) {
    tags.push('contiene_huevo_horneado');
  }

  // Fruta con piel
  if (normalized.match(/manzana|pera|melocotón|ciruela|fruta de temporada/)) {
    tags.push('fruta_con_piel');
  }

  return {
    mainProtein,
    categories,
    tags,
    confidence: calculateConfidence(mainProtein, categories)
  };
}

function normalizeDishName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}
```

---

## Algoritmo Principal de Generación

### Pseudocódigo

```typescript
interface GenerationContext {
  month: number;
  year: number;
  familyMembers: FamilyMember[];
  restrictions: Restriction[];
  schoolMenus: SchoolMenu[];
  recipes: Recipe[];
  weeklyPatterns: WeeklyPattern[];
  existingSlots: MealSlot[]; // slots ya guardados (bloqueados)
}

interface GenerationResult {
  slots: MealSlot[];
  warnings: GenerationWarning[];
  stats: GenerationStats;
}

function generateMonthlyMenu(ctx: GenerationContext): GenerationResult {
  const slots: MealSlot[] = [];
  const warnings: GenerationWarning[] = [];
  const usedRecipes: Map<string, Date> = new Map(); // recipeId -> lastUsedDate

  // 1. Obtener todos los días del mes
  const days = getDaysInMonth(ctx.month, ctx.year);

  for (const day of days) {
    // 2. Para cada día, generar slots necesarios
    const daySlots = generateDaySlots(day, ctx, usedRecipes, warnings);
    slots.push(...daySlots);

    // Actualizar registro de recetas usadas
    for (const slot of daySlots) {
      if (slot.recipeId) {
        usedRecipes.set(String(slot.recipeId), day);
      }
    }
  }

  return {
    slots,
    warnings,
    stats: calculateStats(slots, ctx)
  };
}

function generateDaySlots(
  date: Date,
  ctx: GenerationContext,
  usedRecipes: Map<string, Date>,
  warnings: GenerationWarning[]
): MealSlot[] {
  const slots: MealSlot[] = [];
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const dateStr = formatDate(date);

  // Obtener menú del cole para este día (si aplica)
  const schoolMeal = getSchoolMealForDate(ctx.schoolMenus, date);

  // === CENA (L-V y S-D) ===
  if (!isSlotLocked(ctx.existingSlots, dateStr, 'dinner')) {
    const dinnerSlot = generateDinnerSlot(
      date,
      schoolMeal,
      ctx,
      usedRecipes,
      warnings
    );
    if (dinnerSlot) slots.push(dinnerSlot);
  }

  // === COMIDA FIN DE SEMANA (solo adultos) ===
  if (isWeekend && !isSlotLocked(ctx.existingSlots, dateStr, 'lunch')) {
    const lunchSlot = generateWeekendLunchSlot(
      date,
      ctx,
      usedRecipes,
      warnings
    );
    if (lunchSlot) slots.push(lunchSlot);
  }

  return slots;
}
```

### Generación de Cena (función principal)

```typescript
function generateDinnerSlot(
  date: Date,
  schoolMeal: SchoolMenuEntry | null,
  ctx: GenerationContext,
  usedRecipes: Map<string, Date>,
  warnings: GenerationWarning[]
): MealSlot | null {
  const dateStr = formatDate(date);
  const dayOfWeek = date.getDay();

  // PASO 1: ¿Hay regla fija para este día?
  const fixedRule = ctx.weeklyPatterns.find(
    p => p.dayOfWeek === dayOfWeek &&
         p.mealType === 'dinner' &&
         p.isActive
  );

  if (fixedRule) {
    return {
      id: generateId(),
      date: dateStr,
      mealType: 'dinner',
      origin: 'fixed_rule',
      recipeId: fixedRule.recipeId,
      dishName: fixedRule.dishName,
      forMembers: getAllMemberIds(ctx.familyMembers),
      isLocked: false
    };
  }

  // PASO 2: Obtener proteínas/categorías a evitar (del cole)
  const toAvoid = getProteinAndCategoriesToAvoid(schoolMeal);

  // PASO 3: Filtrar recetas candidatas
  let candidates = ctx.recipes.filter(recipe => {
    // No usar recetas de regla fija fuera de su día
    if (recipe.isFixedRule) return false;

    // Evitar duplicado con cole
    if (toAvoid.proteins.includes(recipe.mainProtein)) return false;
    if (toAvoid.categories.some(c => recipe.categories.includes(c))) return false;

    // Verificar restricciones de miembros
    const restrictionIssues = checkRestrictions(recipe, ctx.restrictions);
    if (restrictionIssues.some(i => i.severity === 'blocking')) return false;

    // Evitar repetir misma receta en últimos 7 días
    const lastUsed = usedRecipes.get(String(recipe.id));
    if (lastUsed && daysDiff(lastUsed, date) < 7) return false;

    return true;
  });

  // PASO 4: Si no hay candidatos, relajar criterios
  if (candidates.length === 0) {
    warnings.push({
      type: 'no_candidates',
      date: dateStr,
      message: 'No hay recetas que eviten duplicado. Seleccionando la menos problemática.',
      suggestion: 'Añade más recetas al catálogo o acepta algún duplicado'
    });

    // Relajar: permitir duplicado de categoría (no de proteína)
    candidates = ctx.recipes.filter(recipe => {
      if (recipe.isFixedRule) return false;
      if (toAvoid.proteins.includes(recipe.mainProtein)) return false;
      const restrictionIssues = checkRestrictions(recipe, ctx.restrictions);
      return !restrictionIssues.some(i => i.severity === 'blocking');
    });
  }

  // PASO 5: Ordenar candidatos por preferencia
  candidates = rankCandidates(candidates, {
    favoriteBonus: 10,
    usageFrequencyBonus: 5,
    varietyBonus: 3,
    lastUsedPenalty: -2
  });

  // PASO 6: Seleccionar mejor candidato
  const selected = candidates[0];

  if (!selected) {
    warnings.push({
      type: 'no_recipe',
      date: dateStr,
      message: 'No se pudo asignar receta para este día',
      severity: 'error'
    });
    return null;
  }

  // PASO 7: Verificar restricciones y añadir avisos
  const restrictionWarnings = checkRestrictions(selected, ctx.restrictions);
  for (const w of restrictionWarnings) {
    if (w.severity === 'warning') {
      warnings.push({
        type: 'restriction_warning',
        date: dateStr,
        memberId: w.memberId,
        message: w.message,
        suggestion: w.suggestion
      });
    }
  }

  // PASO 8: Crear slot
  return {
    id: generateId(),
    date: dateStr,
    mealType: 'dinner',
    origin: 'generated',
    recipeId: selected.id,
    dishName: selected.name,
    dishDetails: {
      categories: selected.categories,
      mainProtein: selected.mainProtein,
      tags: selected.tags
    },
    forMembers: getMembersForRecipe(selected, ctx),
    notes: restrictionWarnings.length > 0
      ? `Avisos: ${restrictionWarnings.map(w => w.message).join('; ')}`
      : undefined,
    isLocked: false
  };
}
```

### Detección de duplicados

```typescript
interface AvoidanceList {
  proteins: ProteinType[];
  categories: DishCategory[];
}

function getProteinAndCategoriesToAvoid(
  schoolMeal: SchoolMenuEntry | null
): AvoidanceList {
  if (!schoolMeal || !schoolMeal.isSchoolDay) {
    return { proteins: [], categories: [] };
  }

  const proteins: ProteinType[] = [];
  const categories: DishCategory[] = [];

  // El segundo plato del cole es el que más importa (proteína principal)
  if (schoolMeal.secondCourse?.normalized) {
    const sc = schoolMeal.secondCourse.normalized;
    if (sc.mainProtein) {
      proteins.push(sc.mainProtein);
    }
    categories.push(...sc.categories);
  }

  // El primer plato también puede tener categoría relevante (pasta, arroz)
  if (schoolMeal.firstCourse?.normalized) {
    const fc = schoolMeal.firstCourse.normalized;
    // Solo categorías tipo carbohidrato principal
    const relevantCategories: DishCategory[] = ['pasta', 'arroz', 'legumbres'];
    for (const cat of fc.categories) {
      if (relevantCategories.includes(cat)) {
        categories.push(cat);
      }
    }
  }

  return { proteins, categories };
}

function isDuplicate(
  dinnerRecipe: Recipe,
  schoolMeal: SchoolMenuEntry
): { isDuplicate: boolean; reason?: string } {
  const toAvoid = getProteinAndCategoriesToAvoid(schoolMeal);

  // Duplicado de proteína (más grave)
  if (dinnerRecipe.mainProtein &&
      toAvoid.proteins.includes(dinnerRecipe.mainProtein)) {
    return {
      isDuplicate: true,
      reason: `Repite proteína: ${dinnerRecipe.mainProtein}`
    };
  }

  // Duplicado de categoría principal
  const mainCategoryDupe = dinnerRecipe.categories.find(c =>
    toAvoid.categories.includes(c)
  );
  if (mainCategoryDupe) {
    return {
      isDuplicate: true,
      reason: `Repite categoría: ${mainCategoryDupe}`
    };
  }

  return { isDuplicate: false };
}
```

### Manejo de casos inevitables

```typescript
function handleInevitableDuplicate(
  date: Date,
  schoolMeal: SchoolMenuEntry,
  recipes: Recipe[],
  warnings: GenerationWarning[]
): Recipe | null {
  // Si no hay forma de evitar duplicado, priorizar:
  // 1. Diferente proteína aunque misma categoría
  // 2. Recetas que el usuario ha marcado como "aceptables para repetir"
  // 3. Recetas que no se han usado recientemente

  const toAvoid = getProteinAndCategoriesToAvoid(schoolMeal);

  // Intentar encontrar algo con proteína diferente
  const differentProtein = recipes.find(r =>
    !toAvoid.proteins.includes(r.mainProtein)
  );

  if (differentProtein) {
    warnings.push({
      type: 'duplicate_category',
      date: formatDate(date),
      message: `Se repite categoría pero no proteína`,
      severity: 'info'
    });
    return differentProtein;
  }

  // Último recurso: cualquier cosa
  warnings.push({
    type: 'duplicate_unavoidable',
    date: formatDate(date),
    message: `No es posible evitar duplicado. Considera añadir más recetas.`,
    severity: 'warning'
  });

  return recipes[0] || null;
}
```

---

## Aplicación de Reglas Específicas

### Regla fija: Pizza del jueves

```typescript
const PIZZA_RULE: WeeklyPattern = {
  id: 1,
  dayOfWeek: 4, // Jueves
  mealType: 'dinner',
  recipeId: PIZZA_RECIPE_ID, // ID de receta especial "Pizza comprada"
  dishName: 'Pizza comprada',
  isActive: true,
  priority: 100 // Máxima prioridad
};

function applyFixedRules(
  slot: MealSlot,
  patterns: WeeklyPattern[]
): MealSlot {
  const dayOfWeek = new Date(slot.date).getDay();

  const matchingPattern = patterns.find(p =>
    p.dayOfWeek === dayOfWeek &&
    p.mealType === slot.mealType &&
    p.isActive
  );

  if (matchingPattern && matchingPattern.priority >= 100) {
    return {
      ...slot,
      origin: 'fixed_rule',
      recipeId: matchingPattern.recipeId,
      dishName: matchingPattern.dishName
    };
  }

  return slot;
}
```

### Patrones semanales

```typescript
function applyWeeklyPatterns(
  date: Date,
  mealType: MealType,
  patterns: WeeklyPattern[]
): { pattern: WeeklyPattern | null; reason: string } {
  const dayOfWeek = date.getDay();

  const matching = patterns
    .filter(p =>
      p.dayOfWeek === dayOfWeek &&
      p.mealType === mealType &&
      p.isActive
    )
    .sort((a, b) => b.priority - a.priority);

  if (matching.length > 0) {
    return {
      pattern: matching[0],
      reason: `Patrón semanal: ${matching[0].dishName} los ${getDayName(dayOfWeek)}`
    };
  }

  return { pattern: null, reason: '' };
}
```

### Plato único fines de semana (adultos)

```typescript
function generateWeekendLunchSlot(
  date: Date,
  ctx: GenerationContext,
  usedRecipes: Map<string, Date>,
  warnings: GenerationWarning[]
): MealSlot | null {
  const dateStr = formatDate(date);
  const adultIds = ctx.familyMembers
    .filter(m => m.type === 'adult')
    .map(m => m.id);

  // Filtrar recetas de plato único
  let candidates = ctx.recipes.filter(recipe => {
    // Debe ser plato único
    if (!recipe.isPlateUnico) return false;

    // No repetir en últimos 7 días
    const lastUsed = usedRecipes.get(String(recipe.id));
    if (lastUsed && daysDiff(lastUsed, date) < 7) return false;

    return true;
  });

  // Priorizar por tipo
  candidates = candidates.sort((a, b) => {
    // Legumbres con proteína primero
    const aIsLegume = a.categories.includes('legumbres') && a.mainProtein;
    const bIsLegume = b.categories.includes('legumbres') && b.mainProtein;
    if (aIsLegume && !bIsLegume) return -1;
    if (bIsLegume && !aIsLegume) return 1;

    // Guisos completos segundo
    const aIsStew = a.categories.includes('guiso');
    const bIsStew = b.categories.includes('guiso');
    if (aIsStew && !bIsStew) return -1;
    if (bIsStew && !aIsStew) return 1;

    // Por favoritos
    if (a.isFavorite && !b.isFavorite) return -1;
    if (b.isFavorite && !a.isFavorite) return 1;

    return 0;
  });

  const selected = candidates[0];

  if (!selected) {
    warnings.push({
      type: 'no_plato_unico',
      date: dateStr,
      message: 'No hay platos únicos disponibles para fin de semana',
      suggestion: 'Añade recetas de legumbres, guisos o arroces completos'
    });
    return null;
  }

  return {
    id: generateId(),
    date: dateStr,
    mealType: 'lunch',
    origin: 'generated',
    recipeId: selected.id,
    dishName: selected.name,
    dishDetails: {
      categories: selected.categories,
      mainProtein: selected.mainProtein,
      tags: selected.tags
    },
    forMembers: adultIds,
    notes: 'Comida adultos fin de semana',
    isLocked: false
  };
}
```

---

## Validación de Restricciones

```typescript
interface RestrictionCheck {
  memberId: number;
  memberName: string;
  severity: 'blocking' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

function checkRestrictions(
  recipe: Recipe,
  restrictions: Restriction[]
): RestrictionCheck[] {
  const issues: RestrictionCheck[] = [];

  for (const restriction of restrictions) {
    if (!restriction.isActive) continue;

    switch (restriction.type) {
      case 'allergy':
        const allergyIssue = checkAllergy(recipe, restriction);
        if (allergyIssue) issues.push(allergyIssue);
        break;

      case 'texture':
        const textureIssue = checkTexture(recipe, restriction);
        if (textureIssue) issues.push(textureIssue);
        break;

      case 'age_related':
        const ageIssue = checkAgeRelated(recipe, restriction);
        if (ageIssue) issues.push(ageIssue);
        break;
    }
  }

  return issues;
}

// Huevo condicional (María 2,5 años)
function checkAllergy(
  recipe: Recipe,
  restriction: Restriction
): RestrictionCheck | null {
  if (!restriction.condition) return null;

  const { ingredient, forbiddenForms, allowedForms } = restriction.condition;

  if (ingredient === 'huevo') {
    // Huevo directo = BLOQUEANTE
    if (recipe.tags.includes('contiene_huevo_directo')) {
      // Verificar si alguna forma permitida aplica
      if (recipe.tags.includes('contiene_huevo_horneado') &&
          allowedForms.includes('horneado')) {
        // Rebozado tiene huevo pero está permitido
        return null;
      }

      return {
        memberId: restriction.memberId,
        memberName: getMemberName(restriction.memberId),
        severity: 'blocking',
        message: `Contiene huevo directo - ${getMemberName(restriction.memberId)} no puede comerlo`,
        suggestion: 'Preparar alternativa sin huevo o elegir otra receta'
      };
    }

    // Huevo horneado = OK pero avisar
    if (recipe.tags.includes('contiene_huevo_horneado')) {
      return {
        memberId: restriction.memberId,
        memberName: getMemberName(restriction.memberId),
        severity: 'info',
        message: `Contiene huevo horneado - ${getMemberName(restriction.memberId)} puede comerlo`
      };
    }
  }

  return null;
}

// Piel de fruta (Pablo 4 años)
function checkTexture(
  recipe: Recipe,
  restriction: Restriction
): RestrictionCheck | null {
  if (!restriction.condition) return null;

  const { ingredient, requiresPreparation } = restriction.condition;

  if (ingredient === 'fruta' && recipe.tags.includes('fruta_con_piel')) {
    return {
      memberId: restriction.memberId,
      memberName: getMemberName(restriction.memberId),
      severity: 'warning',
      message: `Fruta con piel - ${getMemberName(restriction.memberId)} necesita que se la pelen`,
      suggestion: requiresPreparation || 'Pelar la fruta antes de servir'
    };
  }

  return null;
}

// Bebé (alimentación complementaria)
function checkAgeRelated(
  recipe: Recipe,
  restriction: Restriction
): RestrictionCheck | null {
  if (!restriction.condition) return null;

  const { allowedForms } = restriction.condition;

  // El bebé tiene su propio "carril" de menú
  // Esta función solo advierte si se intenta asignar receta no apta
  if (!recipe.tags.includes('apto_bebe')) {
    return {
      memberId: restriction.memberId,
      memberName: getMemberName(restriction.memberId),
      severity: 'warning',
      message: `Esta receta no está marcada como apta para bebé`,
      suggestion: 'Preparar versión adaptada (puré, vapor) o elegir receta específica'
    };
  }

  return null;
}
```

---

## Ranking de Candidatos

```typescript
interface RankingConfig {
  favoriteBonus: number;      // +10 si es favorita
  usageFrequencyBonus: number; // +5 por frecuencia de uso
  varietyBonus: number;        // +3 si es categoría diferente a ayer
  lastUsedPenalty: number;     // -2 por cada día reciente de uso
  seasonalBonus: number;       // +2 si es de temporada
}

function rankCandidates(
  recipes: Recipe[],
  config: RankingConfig,
  context?: {
    yesterdayCategories?: DishCategory[];
    season?: 'spring' | 'summer' | 'fall' | 'winter';
  }
): Recipe[] {
  return recipes
    .map(recipe => ({
      recipe,
      score: calculateScore(recipe, config, context)
    }))
    .sort((a, b) => b.score - a.score)
    .map(item => item.recipe);
}

function calculateScore(
  recipe: Recipe,
  config: RankingConfig,
  context?: any
): number {
  let score = 0;

  // Favoritas
  if (recipe.isFavorite) {
    score += config.favoriteBonus;
  }

  // Frecuencia de uso (las usadas a menudo son preferidas)
  if (recipe.timesUsed > 10) score += config.usageFrequencyBonus;
  else if (recipe.timesUsed > 5) score += config.usageFrequencyBonus / 2;

  // Variedad (diferente a ayer)
  if (context?.yesterdayCategories) {
    const isDifferent = !recipe.categories.some(c =>
      context.yesterdayCategories.includes(c)
    );
    if (isDifferent) score += config.varietyBonus;
  }

  // Penalización por uso reciente
  if (recipe.lastUsedDate) {
    const daysSinceUse = daysDiff(new Date(recipe.lastUsedDate), new Date());
    if (daysSinceUse < 3) score += config.lastUsedPenalty * 3;
    else if (daysSinceUse < 7) score += config.lastUsedPenalty;
  }

  // Bonus estacional (futuro)
  // if (isSeasonalRecipe(recipe, context?.season)) {
  //   score += config.seasonalBonus;
  // }

  return score;
}
```

---

## Estadísticas de Generación

```typescript
interface GenerationStats {
  totalDays: number;
  slotsGenerated: number;
  slotsFromFixedRules: number;
  slotsFromPatterns: number;
  duplicatesAvoided: number;
  duplicatesUnavoidable: number;
  restrictionWarnings: number;
  uniqueRecipesUsed: number;
  coveragePercent: number;
}

function calculateStats(
  slots: MealSlot[],
  ctx: GenerationContext
): GenerationStats {
  const uniqueRecipes = new Set(slots.map(s => s.recipeId).filter(Boolean));
  const totalPossibleSlots = calculateTotalPossibleSlots(ctx);

  return {
    totalDays: getDaysInMonth(ctx.month, ctx.year).length,
    slotsGenerated: slots.length,
    slotsFromFixedRules: slots.filter(s => s.origin === 'fixed_rule').length,
    slotsFromPatterns: slots.filter(s => s.origin === 'weekly_pattern').length,
    duplicatesAvoided: ctx.schoolMenus.length, // aproximado
    duplicatesUnavoidable: 0, // se cuenta durante generación
    restrictionWarnings: 0, // se cuenta durante generación
    uniqueRecipesUsed: uniqueRecipes.size,
    coveragePercent: (slots.length / totalPossibleSlots) * 100
  };
}
```

---

## Flujo Completo de Uso

```
1. Usuario importa menú escolar (OCR)
   └── Sistema guarda SchoolMenu con entries normalizados

2. Usuario clickea "Generar mes"
   └── generateMonthlyMenu() se ejecuta
       ├── Para cada día L-V:
       │   ├── Consulta menú cole del día
       │   ├── Extrae proteína/categoría a evitar
       │   ├── Filtra recetas válidas
       │   ├── Aplica reglas fijas (pizza jueves)
       │   ├── Rankea y selecciona mejor opción
       │   └── Crea MealSlot con origen y detalles
       │
       └── Para cada día S-D:
           ├── Genera comida adultos (plato único)
           └── Genera cena familia (variado)

3. Sistema muestra resultado con warnings
   └── Usuario puede:
       ├── Aceptar todo
       ├── Editar días específicos
       ├── Bloquear días para no regenerar
       └── Regenerar parcialmente

4. Al guardar, MealSlots van a IndexedDB
   └── Vista calendario muestra plan completo
```
