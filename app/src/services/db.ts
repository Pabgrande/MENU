import Dexie, { Table } from 'dexie';
import type {
  FamilyMember,
  Restriction,
  Recipe,
  Ingredient,
  RecipeIngredient,
  MealSlot,
  ActualMeal,
  SchoolMenu,
  WeeklyPattern,
  ShoppingList,
  DayNote,
  AppSettings,
} from '../types';
import { seedInitialData } from './seed';

export class MenuFamiliaDB extends Dexie {
  familyMembers!: Table<FamilyMember>;
  restrictions!: Table<Restriction>;
  recipes!: Table<Recipe>;
  ingredients!: Table<Ingredient>;
  recipeIngredients!: Table<RecipeIngredient>;
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
      familyMembers: '++id, name, type, isActive',
      restrictions: '++id, memberId, type, isActive',
      recipes: '++id, name, normalizedName, *categories, mainProtein, *tags, isFavorite, isFixedRule',
      ingredients: '++id, name, normalizedName, category, isCommon',
      recipeIngredients: '++id, recipeId, ingredientId',
      mealSlots: '++id, date, mealType, [date+mealType], origin, recipeId, isLocked',
      actualMeals: '++id, date, mealType, [date+mealType], mealSlotId',
      schoolMenus: '++id, [month+year], childId, isValidated',
      weeklyPatterns: '++id, dayOfWeek, mealType, isActive',
      shoppingLists: '++id, status, startDate, endDate, createdAt',
      dayNotes: '++id, &date',
      settings: 'key'
    });
  }
}

export const db = new MenuFamiliaDB();

// Inicializar base de datos con datos de ejemplo si está vacía
export async function initializeDatabase(): Promise<void> {
  try {
    const ingredientCount = await db.ingredients.count();

    if (ingredientCount === 0) {
      console.log('Base de datos vacía, cargando datos iniciales...');
      await seedInitialData();
      console.log('Datos iniciales cargados correctamente');
    }
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
}

// Helpers para queries comunes
export const dbHelpers = {
  // Obtener miembros activos de la familia
  async getActiveMembers(): Promise<FamilyMember[]> {
    return db.familyMembers.where('isActive').equals(1).toArray();
  },

  // Obtener restricciones de un miembro
  async getMemberRestrictions(memberId: number): Promise<Restriction[]> {
    return db.restrictions
      .where('memberId')
      .equals(memberId)
      .and(r => r.isActive)
      .toArray();
  },

  // Obtener comidas de un día
  async getMealsForDate(date: string): Promise<MealSlot[]> {
    return db.mealSlots.where('date').equals(date).toArray();
  },

  // Obtener recetas con ingredientes
  async getRecipeWithIngredients(recipeId: number): Promise<{
    recipe: Recipe | undefined;
    ingredients: (RecipeIngredient & { ingredient: Ingredient })[];
  }> {
    const recipe = await db.recipes.get(recipeId);
    const recipeIngredients = await db.recipeIngredients
      .where('recipeId')
      .equals(recipeId)
      .toArray();

    const ingredientsWithDetails = await Promise.all(
      recipeIngredients.map(async (ri) => {
        const ingredient = await db.ingredients.get(ri.ingredientId);
        return { ...ri, ingredient: ingredient! };
      })
    );

    return { recipe, ingredients: ingredientsWithDetails };
  },

  // Obtener menú escolar del mes
  async getSchoolMenuForMonth(month: number, year: number): Promise<SchoolMenu | undefined> {
    return db.schoolMenus
      .where('[month+year]')
      .equals([month, year])
      .first();
  },

  // Obtener patrones activos
  async getActivePatterns(): Promise<WeeklyPattern[]> {
    return db.weeklyPatterns.where('isActive').equals(1).toArray();
  },

  // Obtener nota de un día
  async getNoteForDate(date: string): Promise<DayNote | undefined> {
    return db.dayNotes.where('date').equals(date).first();
  },

  // Obtener configuración
  async getSettings(): Promise<AppSettings | undefined> {
    return db.settings.get('main');
  },

  // Guardar configuración
  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    const existing = await db.settings.get('main');
    if (existing) {
      await db.settings.update('main', settings);
    } else {
      await db.settings.put({ key: 'main', ...settings } as AppSettings);
    }
  }
};
