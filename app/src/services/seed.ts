import { db } from './db';
import type { Ingredient, Recipe, FamilyMember, Restriction, WeeklyPattern, AppSettings } from '../types';

const now = new Date().toISOString();

export async function seedInitialData(): Promise<void> {
  await Promise.all([
    seedIngredients(),
    seedRecipes(),
    seedFamilyMembers(),
    seedWeeklyPatterns(),
    seedSettings(),
  ]);
}

async function seedIngredients(): Promise<void> {
  const ingredients: Omit<Ingredient, 'id'>[] = [
    // Verduras
    { name: 'Patata', normalizedName: 'patata', category: 'verdura', defaultUnit: 'g', isCommon: true },
    { name: 'Cebolla', normalizedName: 'cebolla', category: 'verdura', defaultUnit: 'unidad', isCommon: true },
    { name: 'Tomate', normalizedName: 'tomate', category: 'verdura', defaultUnit: 'unidad', isCommon: true },
    { name: 'Zanahoria', normalizedName: 'zanahoria', category: 'verdura', defaultUnit: 'unidad', isCommon: true },
    { name: 'Calabacín', normalizedName: 'calabacin', category: 'verdura', defaultUnit: 'unidad', isCommon: true },
    { name: 'Pimiento', normalizedName: 'pimiento', category: 'verdura', defaultUnit: 'unidad', isCommon: true },
    { name: 'Ajo', normalizedName: 'ajo', category: 'verdura', defaultUnit: 'diente', isCommon: true },
    { name: 'Lechuga', normalizedName: 'lechuga', category: 'verdura', defaultUnit: 'unidad', isCommon: true },
    { name: 'Brócoli', normalizedName: 'brocoli', category: 'verdura', defaultUnit: 'unidad', isCommon: true },
    { name: 'Judías verdes', normalizedName: 'judias_verdes', category: 'verdura', defaultUnit: 'g', isCommon: true },

    // Carne
    { name: 'Pechuga de pollo', normalizedName: 'pechuga_pollo', category: 'carne', defaultUnit: 'g', isCommon: true },
    { name: 'Muslo de pollo', normalizedName: 'muslo_pollo', category: 'carne', defaultUnit: 'unidad', isCommon: true },
    { name: 'Carne picada', normalizedName: 'carne_picada', category: 'carne', defaultUnit: 'g', isCommon: true },
    { name: 'Lomo de cerdo', normalizedName: 'lomo_cerdo', category: 'carne', defaultUnit: 'g', isCommon: true },
    { name: 'Filete de ternera', normalizedName: 'filete_ternera', category: 'carne', defaultUnit: 'unidad', isCommon: true },
    { name: 'Chorizo', normalizedName: 'chorizo', category: 'carne', defaultUnit: 'unidad', isCommon: false },

    // Pescado
    { name: 'Merluza', normalizedName: 'merluza', category: 'pescado', defaultUnit: 'g', isCommon: true },
    { name: 'Salmón', normalizedName: 'salmon', category: 'pescado', defaultUnit: 'g', isCommon: true },
    { name: 'Bacalao', normalizedName: 'bacalao', category: 'pescado', defaultUnit: 'g', isCommon: false },
    { name: 'Atún', normalizedName: 'atun', category: 'pescado', defaultUnit: 'g', isCommon: true },

    // Lácteos
    { name: 'Huevo', normalizedName: 'huevo', category: 'lacteo', defaultUnit: 'unidad', isCommon: true },
    { name: 'Leche', normalizedName: 'leche', category: 'lacteo', defaultUnit: 'ml', isCommon: true },
    { name: 'Queso rallado', normalizedName: 'queso_rallado', category: 'lacteo', defaultUnit: 'g', isCommon: true },
    { name: 'Nata', normalizedName: 'nata', category: 'lacteo', defaultUnit: 'ml', isCommon: false },
    { name: 'Yogur', normalizedName: 'yogur', category: 'lacteo', defaultUnit: 'unidad', isCommon: true },

    // Cereales
    { name: 'Arroz', normalizedName: 'arroz', category: 'cereal', defaultUnit: 'g', isCommon: true },
    { name: 'Pasta', normalizedName: 'pasta', category: 'cereal', defaultUnit: 'g', isCommon: true },
    { name: 'Macarrones', normalizedName: 'macarrones', category: 'cereal', defaultUnit: 'g', isCommon: true },
    { name: 'Espaguetis', normalizedName: 'espaguetis', category: 'cereal', defaultUnit: 'g', isCommon: true },
    { name: 'Pan rallado', normalizedName: 'pan_rallado', category: 'cereal', defaultUnit: 'g', isCommon: true },

    // Legumbres
    { name: 'Lentejas', normalizedName: 'lentejas', category: 'legumbre', defaultUnit: 'g', isCommon: true },
    { name: 'Garbanzos', normalizedName: 'garbanzos', category: 'legumbre', defaultUnit: 'g', isCommon: true },
    { name: 'Alubias', normalizedName: 'alubias', category: 'legumbre', defaultUnit: 'g', isCommon: false },

    // Condimentos
    { name: 'Sal', normalizedName: 'sal', category: 'condimento', defaultUnit: 'g', isCommon: true },
    { name: 'Pimienta', normalizedName: 'pimienta', category: 'condimento', defaultUnit: 'g', isCommon: true },
    { name: 'Pimentón', normalizedName: 'pimenton', category: 'condimento', defaultUnit: 'g', isCommon: false },
    { name: 'Orégano', normalizedName: 'oregano', category: 'condimento', defaultUnit: 'g', isCommon: false },

    // Aceites
    { name: 'Aceite de oliva', normalizedName: 'aceite_oliva', category: 'aceite', defaultUnit: 'ml', isCommon: true },

    // Conservas
    { name: 'Tomate frito', normalizedName: 'tomate_frito', category: 'conserva', defaultUnit: 'g', isCommon: true },
    { name: 'Atún en lata', normalizedName: 'atun_lata', category: 'conserva', defaultUnit: 'lata', isCommon: true },

    // Congelados
    { name: 'Pizza congelada', normalizedName: 'pizza_congelada', category: 'congelado', defaultUnit: 'unidad', isCommon: false },
    { name: 'Croquetas congeladas', normalizedName: 'croquetas_congeladas', category: 'congelado', defaultUnit: 'unidad', isCommon: false },
  ];

  await db.ingredients.bulkAdd(ingredients);
}

async function seedRecipes(): Promise<void> {
  const recipes: Omit<Recipe, 'id'>[] = [
    {
      name: 'Pizza comprada',
      normalizedName: 'pizza_comprada',
      categories: ['otros' as any],
      mainProtein: 'none',
      tags: [],
      isPlateUnico: true,
      isFavorite: false,
      timesUsed: 0,
      isFixedRule: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'Tortilla de patatas',
      normalizedName: 'tortilla_patatas',
      categories: ['huevo'],
      mainProtein: 'huevo',
      tags: ['contiene_huevo_directo', 'vegetariano'],
      isPlateUnico: true,
      prepTime: 15,
      cookTime: 20,
      difficulty: 'easy',
      servings: 4,
      instructions: '1. Pelar y cortar las patatas en rodajas finas.\n2. Freír en aceite abundante.\n3. Batir los huevos con sal.\n4. Mezclar con las patatas y cuajar.',
      isFavorite: true,
      timesUsed: 0,
      isFixedRule: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'Pollo al horno con patatas',
      normalizedName: 'pollo_horno_patatas',
      categories: ['carne', 'horno'],
      mainProtein: 'pollo',
      tags: [],
      isPlateUnico: true,
      prepTime: 15,
      cookTime: 60,
      difficulty: 'easy',
      servings: 4,
      isFavorite: true,
      timesUsed: 0,
      isFixedRule: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'Macarrones con tomate',
      normalizedName: 'macarrones_tomate',
      categories: ['pasta'],
      mainProtein: 'none',
      tags: ['vegetariano', 'rapido'],
      isPlateUnico: false,
      prepTime: 5,
      cookTime: 15,
      difficulty: 'easy',
      servings: 4,
      isFavorite: true,
      timesUsed: 0,
      isFixedRule: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'Merluza a la plancha con ensalada',
      normalizedName: 'merluza_plancha_ensalada',
      categories: ['pescado', 'plancha', 'ensalada'],
      mainProtein: 'pescado_blanco',
      tags: [],
      isPlateUnico: true,
      prepTime: 10,
      cookTime: 10,
      difficulty: 'easy',
      servings: 4,
      isFavorite: false,
      timesUsed: 0,
      isFixedRule: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'Lentejas con chorizo',
      normalizedName: 'lentejas_chorizo',
      categories: ['legumbres', 'guiso'],
      mainProtein: 'legumbres',
      tags: ['batch_cooking'],
      isPlateUnico: true,
      prepTime: 15,
      cookTime: 45,
      difficulty: 'easy',
      servings: 6,
      isFavorite: true,
      timesUsed: 0,
      isFixedRule: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'Salmón al horno con verduras',
      normalizedName: 'salmon_horno_verduras',
      categories: ['pescado', 'horno', 'verdura'],
      mainProtein: 'pescado_azul',
      tags: [],
      isPlateUnico: true,
      prepTime: 10,
      cookTime: 25,
      difficulty: 'easy',
      servings: 4,
      isFavorite: false,
      timesUsed: 0,
      isFixedRule: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'Arroz con pollo',
      normalizedName: 'arroz_pollo',
      categories: ['arroz', 'carne'],
      mainProtein: 'pollo',
      tags: ['batch_cooking'],
      isPlateUnico: true,
      prepTime: 15,
      cookTime: 30,
      difficulty: 'medium',
      servings: 4,
      isFavorite: true,
      timesUsed: 0,
      isFixedRule: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'Ensalada César',
      normalizedName: 'ensalada_cesar',
      categories: ['ensalada', 'carne'],
      mainProtein: 'pollo',
      tags: ['rapido'],
      isPlateUnico: true,
      prepTime: 15,
      cookTime: 10,
      difficulty: 'easy',
      servings: 4,
      isFavorite: false,
      timesUsed: 0,
      isFixedRule: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'Puré de calabacín con pollo',
      normalizedName: 'pure_calabacin_pollo',
      categories: ['pure', 'verdura'],
      mainProtein: 'pollo',
      tags: ['apto_bebe'],
      isPlateUnico: true,
      prepTime: 10,
      cookTime: 20,
      difficulty: 'easy',
      servings: 2,
      isFavorite: false,
      timesUsed: 0,
      isFixedRule: false,
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.recipes.bulkAdd(recipes);
}

async function seedFamilyMembers(): Promise<void> {
  const members: Omit<FamilyMember, 'id'>[] = [
    {
      name: 'Papá',
      type: 'adult',
      isActive: true,
      color: '#3B82F6',
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'Mamá',
      type: 'adult',
      isActive: true,
      color: '#EC4899',
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'Pablo',
      type: 'child',
      birthDate: '2020-11-10',
      isActive: true,
      color: '#10B981',
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'María',
      type: 'child',
      birthDate: '2022-06-25',
      isActive: true,
      color: '#F59E0B',
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'Lucas',
      type: 'baby',
      birthDate: '2024-04-15',
      isActive: true,
      color: '#8B5CF6',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const memberIds = await db.familyMembers.bulkAdd(members, { allKeys: true });

  // Añadir restricciones
  const restrictions: Omit<Restriction, 'id'>[] = [
    {
      memberId: memberIds[2] as number, // Pablo
      type: 'texture',
      condition: {
        ingredient: 'fruta',
        forbiddenForms: ['con_piel'],
        allowedForms: ['pelada', 'compota', 'zumo'],
        requiresPreparation: 'pelar',
      },
      description: 'No puede comer piel de fruta',
      isActive: true,
      createdAt: now,
    },
    {
      memberId: memberIds[3] as number, // María
      type: 'allergy',
      condition: {
        ingredient: 'huevo',
        forbiddenForms: ['directo', 'frito', 'cocido', 'revuelto', 'tortilla'],
        allowedForms: ['horneado', 'rebozado', 'trazas'],
      },
      description: 'Alergia a huevo directo. Puede comer huevo horneado y rebozados.',
      isActive: true,
      createdAt: now,
    },
    {
      memberId: memberIds[4] as number, // Lucas (bebé)
      type: 'age_related',
      condition: {
        ingredient: '*',
        allowedForms: ['pure', 'papilla', 'vapor', 'blw_textura'],
        forbiddenForms: ['entero', 'duro', 'frito'],
      },
      description: 'Alimentación complementaria 9 meses. Purés, papillas y BLW.',
      isActive: true,
      createdAt: now,
    },
  ];

  await db.restrictions.bulkAdd(restrictions);
}

async function seedWeeklyPatterns(): Promise<void> {
  const patterns: Omit<WeeklyPattern, 'id'>[] = [
    {
      dayOfWeek: 4, // Jueves
      mealType: 'dinner',
      dishName: 'Pizza comprada',
      isActive: true,
      priority: 100,
      createdAt: now,
    },
  ];

  await db.weeklyPatterns.bulkAdd(patterns);
}

async function seedSettings(): Promise<void> {
  const settings: AppSettings = {
    key: 'main',
    familyName: 'Mi Familia',
    defaultMealTypes: ['lunch', 'dinner'],
    weekStartsOn: 1,
    showWeekends: true,
    defaultServings: 4,
    aiProvider: 'mock',
    theme: 'system',
    language: 'es',
    onboardingCompleted: false,
  };

  await db.settings.add(settings);
}
