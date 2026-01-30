// ============================================
// TIPOS PRINCIPALES DE MENÚFAMILIA
// ============================================

// --- Familia ---
export interface FamilyMember {
  id?: number;
  name: string;
  type: 'adult' | 'child' | 'baby';
  birthDate?: string;
  isActive: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Restriction {
  id?: number;
  memberId: number;
  type: RestrictionType;
  condition?: RestrictionCondition;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export type RestrictionType =
  | 'allergy'
  | 'intolerance'
  | 'preference'
  | 'texture'
  | 'age_related';

export interface RestrictionCondition {
  ingredient: string;
  allowedForms: string[];
  forbiddenForms: string[];
  requiresPreparation?: string;
}

// --- Recetas ---
export interface Recipe {
  id?: number;
  name: string;
  normalizedName?: string;
  categories: DishCategory[];
  mainProtein?: ProteinType;
  tags: RecipeTag[];
  isPlateUnico: boolean;
  prepTime?: number;
  cookTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  servings?: number;
  instructions?: string;
  imageUrl?: string;
  source?: RecipeSource;
  isFavorite: boolean;
  timesUsed: number;
  lastUsedDate?: string;
  isFixedRule: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DishCategory =
  | 'pasta' | 'arroz' | 'legumbres' | 'verdura' | 'ensalada'
  | 'sopa' | 'guiso' | 'fritura' | 'plancha' | 'horno'
  | 'pure' | 'papilla' | 'blw' | 'huevo' | 'carne' | 'pescado';

export type ProteinType =
  | 'pollo' | 'cerdo' | 'ternera' | 'cordero'
  | 'pescado_blanco' | 'pescado_azul' | 'marisco'
  | 'huevo' | 'legumbres' | 'tofu' | 'none';

export type RecipeTag =
  | 'contiene_huevo_directo'
  | 'contiene_huevo_horneado'
  | 'puede_contener_trazas'
  | 'fruta_con_piel'
  | 'apto_bebe'
  | 'sin_gluten'
  | 'sin_lactosa'
  | 'vegetariano'
  | 'vegano'
  | 'rapido'
  | 'batch_cooking'
  | 'congelable';

export interface RecipeSource {
  type: 'manual' | 'imported' | 'ai_parsed';
  url?: string;
  originalText?: string;
}

// --- Ingredientes ---
export interface Ingredient {
  id?: number;
  name: string;
  normalizedName: string;
  category: IngredientCategory;
  defaultUnit: string;
  aliases?: string[];
  isCommon: boolean;
}

export type IngredientCategory =
  | 'verdura' | 'fruta' | 'carne' | 'pescado' | 'lacteo'
  | 'cereal' | 'legumbre' | 'condimento' | 'aceite'
  | 'conserva' | 'congelado' | 'otros';

export interface RecipeIngredient {
  id?: number;
  recipeId: number;
  ingredientId: number;
  ingredient?: Ingredient;
  quantity?: number;
  unit?: string;
  isOptional: boolean;
  preparation?: string;
}

// --- Comidas ---
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type MealOrigin =
  | 'school'
  | 'fixed_rule'
  | 'weekly_pattern'
  | 'generated'
  | 'manual';

export interface DishDetails {
  categories: DishCategory[];
  mainProtein?: ProteinType;
  tags: RecipeTag[];
  confidence?: number;
}

export interface MealSlot {
  id?: number;
  date: string;
  mealType: MealType;
  origin: MealOrigin;
  recipeId?: number;
  dishName: string;
  dishDetails?: DishDetails;
  forMembers: number[];
  notes?: string;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActualMeal {
  id?: number;
  mealSlotId?: number;
  date: string;
  mealType: MealType;
  recipeId?: number;
  dishName: string;
  forMembers: number[];
  notes?: string;
  wasSkipped: boolean;
  wasSubstituted: boolean;
  originalDishName?: string;
  createdAt: string;
}

// --- Menú Escolar ---
export interface SchoolMenu {
  id?: number;
  childId: number;
  month: number;
  year: number;
  schoolName?: string;
  originalImage?: string;
  entries: SchoolMenuEntry[];
  ocrConfidence?: number;
  ocrIssues?: string[];
  isValidated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolMenuEntry {
  date: string;
  isSchoolDay: boolean;
  nonSchoolReason?: string;
  firstCourse?: SchoolMenuDish;
  secondCourse?: SchoolMenuDish;
  dessert?: SchoolMenuDish;
  confidence?: number;
  needsReview?: boolean;
}

export interface SchoolMenuDish {
  raw: string;
  normalized?: DishDetails & { name: string };
  confidence: number;
}

// --- Patrones ---
export interface WeeklyPattern {
  id?: number;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  mealType: MealType;
  recipeId?: number;
  dishName: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
}

// --- Notas ---
export interface DayNote {
  id?: number;
  date: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

// --- Lista de Compra ---
export interface ShoppingList {
  id?: number;
  name?: string;
  startDate: string;
  endDate: string;
  items: ShoppingItem[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingItem {
  id: string;
  ingredientId?: number;
  name: string;
  quantity?: number;
  unit?: string;
  category: IngredientCategory;
  isChecked: boolean;
  fromMeals: string[];
  notes?: string;
}

// --- Configuración ---
export interface AppSettings {
  key: string;
  familyName?: string;
  defaultMealTypes: MealType[];
  weekStartsOn: 0 | 1;
  showWeekends: boolean;
  defaultServings: number;
  aiProvider: 'openai' | 'claude' | 'gemini' | 'mock';
  aiApiKey?: string;
  theme: 'light' | 'dark' | 'system';
  language: 'es' | 'en';
  onboardingCompleted: boolean;
  lastBackup?: string;
}

// --- Utilidades ---
export interface DayData {
  date: string;
  dayOfWeek: number;
  dayName: string;
  isToday: boolean;
  isWeekend: boolean;
  note?: DayNote;
  schoolMeal?: MealSlot;
  dinnerPlanned?: MealSlot;
  babyPlanned?: MealSlot;
  dinnerActual?: ActualMeal;
  alerts: Alert[];
}

export interface Alert {
  type: 'restriction_warning' | 'duplicate' | 'missing';
  severity: 'info' | 'warning' | 'error';
  message: string;
  memberId?: number;
  suggestion?: string;
}
