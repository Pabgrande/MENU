# C) Modelo de Datos Implementable

## Diagrama Entidad-Relación

```
┌─────────────────┐       ┌─────────────────┐
│  FamilyMember   │       │   Restriction   │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │──────<│ id (PK)         │
│ name            │       │ memberId (FK)   │
│ type            │       │ type            │
│ birthDate       │       │ condition       │
│ isActive        │       │ description     │
└─────────────────┘       └─────────────────┘
        │
        │
        ▼
┌─────────────────┐       ┌─────────────────┐
│    MealSlot     │       │   ActualMeal    │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ date            │──────<│ mealSlotId (FK) │
│ mealType        │       │ date            │
│ origin          │       │ mealType        │
│ recipeId (FK)   │       │ recipeId (FK)   │
│ dishName        │       │ dishName        │
│ forMembers[]    │       │ forMembers[]    │
│ categories      │       │ notes           │
│ mainProtein     │       │ wasSkipped      │
└────────┬────────┘       └─────────────────┘
         │
         │
         ▼
┌─────────────────┐       ┌─────────────────┐
│     Recipe      │──────<│ RecipeIngredient│
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ name            │       │ recipeId (FK)   │
│ categories[]    │       │ ingredientId(FK)│
│ mainProtein     │       │ quantity        │
│ tags[]          │       │ unit            │
│ isPlateUnico    │       │ isOptional      │
│ prepTime        │       └─────────────────┘
│ difficulty      │               │
│ servings        │               │
│ instructions    │               ▼
│ isFavorite      │       ┌─────────────────┐
│ source          │       │   Ingredient    │
└─────────────────┘       ├─────────────────┤
                          │ id (PK)         │
                          │ name            │
                          │ category        │
                          │ defaultUnit     │
┌─────────────────┐       └─────────────────┘
│   SchoolMenu    │
├─────────────────┤
│ id (PK)         │       ┌─────────────────┐
│ childId (FK)    │       │  WeeklyPattern  │
│ month           │       ├─────────────────┤
│ year            │       │ id (PK)         │
│ schoolName      │       │ dayOfWeek       │
│ originalImage   │       │ mealType        │
│ entries[]       │       │ recipeId (FK)   │
│ confidence      │       │ dishName        │
│ isValidated     │       │ isActive        │
└─────────────────┘       └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│    DayNote      │       │  ShoppingList   │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ date            │       │ name            │
│ note            │       │ startDate       │
└─────────────────┘       │ endDate         │
                          │ items[]         │
                          │ status          │
                          │ createdAt       │
                          └─────────────────┘
```

---

## Esquema de Tipos TypeScript

### FamilyMember
```typescript
interface FamilyMember {
  id: number;                    // Auto-increment
  name: string;                  // "Pablo", "Lucía", etc.
  type: 'adult' | 'child' | 'baby';
  birthDate?: string;            // ISO date, para calcular edad
  isActive: boolean;             // Para "desactivar" sin borrar
  color?: string;                // Color para UI (chips)
  createdAt: string;
  updatedAt: string;
}
```

### Restriction
```typescript
interface Restriction {
  id: number;
  memberId: number;              // FK a FamilyMember
  type: RestrictionType;
  condition?: RestrictionCondition;  // Para restricciones condicionales
  description?: string;          // Nota libre
  isActive: boolean;
  createdAt: string;
}

type RestrictionType =
  | 'allergy'           // Alergia (nunca puede comer)
  | 'intolerance'       // Intolerancia (evitar)
  | 'preference'        // Preferencia (evitar si hay alternativa)
  | 'texture'           // Textura (piel de fruta, etc.)
  | 'age_related';      // Por edad (bebé, introducción alimentos)

interface RestrictionCondition {
  ingredient: string;            // "huevo", "fruta"
  allowedForms: string[];        // ["horneado", "trazas"]
  forbiddenForms: string[];      // ["directo", "frito"]
  requiresPreparation?: string;  // "pelar", "triturar"
}
```

### Recipe
```typescript
interface Recipe {
  id: number;
  name: string;                  // "Macarrones con tomate"
  normalizedName?: string;       // "macarrones_tomate" (para búsquedas)
  categories: DishCategory[];    // ["pasta", "vegetariano"]
  mainProtein?: ProteinType;     // "none" si es vegetal
  tags: RecipeTag[];             // ["contiene_huevo_directo", "rapido"]
  isPlateUnico: boolean;         // true para platos completos
  prepTime?: number;             // minutos
  cookTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  servings?: number;
  instructions?: string;         // Texto libre o markdown
  imageUrl?: string;
  source?: RecipeSource;
  isFavorite: boolean;
  timesUsed: number;             // Contador de uso
  lastUsedDate?: string;
  isFixedRule: boolean;          // true para "Pizza jueves"
  createdAt: string;
  updatedAt: string;
}

type DishCategory =
  | 'pasta' | 'arroz' | 'legumbres' | 'verdura' | 'ensalada'
  | 'sopa' | 'guiso' | 'fritura' | 'plancha' | 'horno'
  | 'pure' | 'papilla' | 'blw';

type ProteinType =
  | 'pollo' | 'cerdo' | 'ternera' | 'cordero'
  | 'pescado_blanco' | 'pescado_azul' | 'marisco'
  | 'huevo' | 'legumbres' | 'tofu' | 'none';

type RecipeTag =
  | 'contiene_huevo_directo'    // Tortilla, huevo frito
  | 'contiene_huevo_horneado'   // Bizcocho, rebozado
  | 'puede_contener_trazas'     // Trazas de huevo/frutos secos
  | 'fruta_con_piel'            // Manzana entera, etc.
  | 'apto_bebe'                 // Textura/ingredientes aptos
  | 'sin_gluten'
  | 'sin_lactosa'
  | 'vegetariano'
  | 'vegano'
  | 'rapido'                    // < 30 min
  | 'batch_cooking'             // Se puede preparar con antelación
  | 'congelable';

interface RecipeSource {
  type: 'manual' | 'imported' | 'ai_parsed';
  url?: string;
  originalText?: string;
}
```

### Ingredient
```typescript
interface Ingredient {
  id: number;
  name: string;                  // "Tomate"
  normalizedName: string;        // "tomate" (lowercase, sin acentos)
  category: IngredientCategory;
  defaultUnit: string;           // "unidad", "g", "ml"
  aliases?: string[];            // ["tomates", "jitomate"]
  isCommon: boolean;             // Para sugerencias rápidas
}

type IngredientCategory =
  | 'verdura' | 'fruta' | 'carne' | 'pescado' | 'lacteo'
  | 'cereal' | 'legumbre' | 'condimento' | 'aceite'
  | 'conserva' | 'congelado' | 'otros';
```

### RecipeIngredient
```typescript
interface RecipeIngredient {
  id: number;
  recipeId: number;
  ingredientId: number;
  quantity?: number;             // null si "al gusto"
  unit?: string;                 // "g", "ml", "unidad", "cucharada"
  isOptional: boolean;
  preparation?: string;          // "picado", "en juliana"
}
```

### MealSlot (Lo planificado)
```typescript
interface MealSlot {
  id: number;
  date: string;                  // ISO date "2025-01-15"
  mealType: MealType;
  origin: MealOrigin;
  recipeId?: number;             // FK a Recipe (si es del catálogo)
  dishName: string;              // Nombre mostrado (puede ser libre)
  dishDetails?: DishDetails;     // Detalles normalizados
  forMembers: number[];          // IDs de miembros que comen esto
  notes?: string;
  isLocked: boolean;             // No modificar en regeneración
  createdAt: string;
  updatedAt: string;
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

type MealOrigin =
  | 'school'           // Importado del cole
  | 'fixed_rule'       // Regla fija (pizza jueves)
  | 'weekly_pattern'   // Patrón semanal
  | 'generated'        // Sugerido por motor
  | 'manual';          // Escrito a mano

interface DishDetails {
  categories: DishCategory[];
  mainProtein?: ProteinType;
  tags: RecipeTag[];
  confidence?: number;           // 0-1, si viene de OCR/IA
}
```

### ActualMeal (Lo realmente comido)
```typescript
interface ActualMeal {
  id: number;
  mealSlotId?: number;           // FK a MealSlot original (si existe)
  date: string;
  mealType: MealType;
  recipeId?: number;
  dishName: string;
  forMembers: number[];
  notes?: string;
  wasSkipped: boolean;           // true si no se comió nada
  wasSubstituted: boolean;       // true si se cambió del plan
  originalDishName?: string;     // Lo que estaba planificado
  createdAt: string;
}
```

### SchoolMenu
```typescript
interface SchoolMenu {
  id: number;
  childId: number;               // FK a FamilyMember (puede ser genérico)
  month: number;                 // 1-12
  year: number;
  schoolName?: string;
  originalImage?: string;        // Base64 o URL
  entries: SchoolMenuEntry[];
  ocrConfidence?: number;        // Confianza global 0-1
  ocrIssues?: string[];          // Lista de problemas detectados
  isValidated: boolean;          // Usuario ha revisado
  createdAt: string;
  updatedAt: string;
}

interface SchoolMenuEntry {
  date: string;                  // ISO date
  isSchoolDay: boolean;          // false = festivo/no lectivo
  firstCourse?: string;          // "Crema de verduras"
  secondCourse?: string;         // "Pollo asado con patatas"
  dessert?: string;              // "Fruta de temporada"
  normalized?: {
    firstCourse?: DishDetails;
    secondCourse?: DishDetails;
    dessert?: DishDetails;
  };
  confidence?: number;           // Confianza de este día específico
  needsReview?: boolean;
}
```

### WeeklyPattern
```typescript
interface WeeklyPattern {
  id: number;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;  // 0=domingo
  mealType: MealType;
  recipeId?: number;
  dishName: string;
  isActive: boolean;
  priority: number;              // Mayor = más preferente
  createdAt: string;
}
```

### DayNote
```typescript
interface DayNote {
  id: number;
  date: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}
```

### ShoppingList
```typescript
interface ShoppingList {
  id: number;
  name?: string;                 // "Semana 15-21 Enero"
  startDate: string;
  endDate: string;
  items: ShoppingItem[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

interface ShoppingItem {
  id: string;                    // UUID
  ingredientId?: number;
  name: string;                  // Nombre mostrado
  quantity?: number;
  unit?: string;
  category: IngredientCategory;
  isChecked: boolean;
  fromMeals: string[];           // Fechas de comidas que lo requieren
  notes?: string;
}
```

### AppSettings
```typescript
interface AppSettings {
  key: string;                   // 'main'
  familyName?: string;
  defaultMealTypes: MealType[];  // Tipos de comida a planificar
  weekStartsOn: 0 | 1;           // 0=domingo, 1=lunes
  showWeekends: boolean;
  defaultServings: number;
  aiProvider: 'openai' | 'claude' | 'gemini' | 'mock';
  aiApiKey?: string;             // Encriptado o en env
  theme: 'light' | 'dark' | 'system';
  language: 'es' | 'en';
  onboardingCompleted: boolean;
  lastBackup?: string;
}
```

---

## Índices y Relaciones en Dexie

```typescript
// db.ts
import Dexie, { Table } from 'dexie';

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
      // Índices: ++id = auto-increment, & = unique, * = multi-value, [a+b] = compound
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
      dayNotes: '++id, &date',  // unique date
      settings: 'key'
    });
  }
}

export const db = new MenuFamiliaDB();
```

---

## Ejemplos JSON

### Ejemplo 1: Un día completo (miércoles 15 enero 2025)

```json
{
  "date": "2025-01-15",
  "dayOfWeek": 3,
  "dayName": "Miércoles",
  "note": {
    "id": 45,
    "date": "2025-01-15",
    "note": "Pablo tiene excursión, llevar bocadillo"
  },
  "slots": {
    "lunch": {
      "school": {
        "id": 234,
        "date": "2025-01-15",
        "mealType": "lunch",
        "origin": "school",
        "dishName": "Lentejas estofadas + Filete de merluza con ensalada + Fruta",
        "dishDetails": {
          "categories": ["legumbres", "pescado_blanco"],
          "mainProtein": "pescado_blanco",
          "tags": []
        },
        "forMembers": [3, 4, 5],
        "isLocked": true
      }
    },
    "dinner": {
      "planned": {
        "id": 567,
        "date": "2025-01-15",
        "mealType": "dinner",
        "origin": "generated",
        "recipeId": 12,
        "dishName": "Tortilla de patatas",
        "dishDetails": {
          "categories": ["huevo", "plancha"],
          "mainProtein": "huevo",
          "tags": ["contiene_huevo_directo"]
        },
        "forMembers": [1, 2, 3, 4],
        "notes": "María (niña 2.5) come alternativa",
        "isLocked": false
      },
      "babyPlanned": {
        "id": 568,
        "date": "2025-01-15",
        "mealType": "dinner",
        "origin": "manual",
        "dishName": "Puré de calabacín con pollo",
        "dishDetails": {
          "categories": ["pure"],
          "mainProtein": "pollo",
          "tags": ["apto_bebe"]
        },
        "forMembers": [5],
        "isLocked": false
      },
      "actual": {
        "id": 890,
        "mealSlotId": 567,
        "date": "2025-01-15",
        "mealType": "dinner",
        "recipeId": 12,
        "dishName": "Tortilla de patatas",
        "forMembers": [1, 2, 3, 4],
        "notes": "María comió huevo revuelto bien hecho (sin problema)",
        "wasSkipped": false,
        "wasSubstituted": false
      }
    }
  },
  "members": {
    "1": { "name": "Papá", "type": "adult" },
    "2": { "name": "Mamá", "type": "adult" },
    "3": { "name": "Pablo", "type": "child", "age": 4 },
    "4": { "name": "María", "type": "child", "age": 2.5 },
    "5": { "name": "Bebé", "type": "baby", "age": 0.75 }
  },
  "alerts": [
    {
      "type": "restriction_warning",
      "severity": "medium",
      "message": "Tortilla contiene huevo directo. María (2.5 años) tiene restricción.",
      "memberId": 4,
      "suggestion": "Preparar alternativa sin huevo directo o huevo muy hecho"
    }
  ]
}
```

### Ejemplo 2: Una receta completa

```json
{
  "id": 12,
  "name": "Tortilla de patatas",
  "normalizedName": "tortilla_patatas",
  "categories": ["huevo", "plancha"],
  "mainProtein": "huevo",
  "tags": ["contiene_huevo_directo", "vegetariano", "rapido"],
  "isPlateUnico": true,
  "prepTime": 15,
  "cookTime": 20,
  "difficulty": "easy",
  "servings": 4,
  "instructions": "1. Pelar y cortar las patatas en rodajas finas.\n2. Freír las patatas en aceite abundante hasta que estén tiernas.\n3. Batir los huevos con sal.\n4. Mezclar las patatas escurridas con el huevo batido.\n5. Cuajar en sartén antiadherente a fuego medio.\n6. Dar la vuelta y terminar de cuajar.",
  "imageUrl": null,
  "source": {
    "type": "manual"
  },
  "isFavorite": true,
  "timesUsed": 23,
  "lastUsedDate": "2025-01-08",
  "isFixedRule": false,
  "ingredients": [
    {
      "id": 101,
      "recipeId": 12,
      "ingredientId": 5,
      "ingredient": {
        "id": 5,
        "name": "Patata",
        "category": "verdura",
        "defaultUnit": "g"
      },
      "quantity": 500,
      "unit": "g",
      "isOptional": false,
      "preparation": "peladas y en rodajas finas"
    },
    {
      "id": 102,
      "recipeId": 12,
      "ingredientId": 8,
      "ingredient": {
        "id": 8,
        "name": "Huevo",
        "category": "lacteo",
        "defaultUnit": "unidad"
      },
      "quantity": 6,
      "unit": "unidades",
      "isOptional": false
    },
    {
      "id": 103,
      "recipeId": 12,
      "ingredientId": 15,
      "ingredient": {
        "id": 15,
        "name": "Aceite de oliva",
        "category": "aceite",
        "defaultUnit": "ml"
      },
      "quantity": 200,
      "unit": "ml",
      "isOptional": false,
      "preparation": "para freír"
    },
    {
      "id": 104,
      "recipeId": 12,
      "ingredientId": 20,
      "ingredient": {
        "id": 20,
        "name": "Sal",
        "category": "condimento",
        "defaultUnit": "g"
      },
      "quantity": null,
      "unit": "al gusto",
      "isOptional": false
    },
    {
      "id": 105,
      "recipeId": 12,
      "ingredientId": 3,
      "ingredient": {
        "id": 3,
        "name": "Cebolla",
        "category": "verdura",
        "defaultUnit": "unidad"
      },
      "quantity": 1,
      "unit": "unidad",
      "isOptional": true,
      "preparation": "pochada"
    }
  ],
  "createdAt": "2024-06-15T10:30:00Z",
  "updatedAt": "2025-01-08T19:45:00Z"
}
```

### Ejemplo 3: Resultado OCR del menú escolar

```json
{
  "contract": "MENU_OCR_EXTRACT",
  "version": "1.0",
  "request": {
    "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "month": 1,
    "year": 2025,
    "schoolName": "CEIP San Juan"
  },
  "response": {
    "success": true,
    "confidence": 0.87,
    "month": 1,
    "year": 2025,
    "schoolName": "CEIP San Juan",
    "entries": [
      {
        "date": "2025-01-07",
        "isSchoolDay": false,
        "reason": "Festivo - Reyes"
      },
      {
        "date": "2025-01-08",
        "isSchoolDay": true,
        "firstCourse": {
          "raw": "Crema de verduras",
          "normalized": {
            "name": "Crema de verduras",
            "categories": ["verdura", "sopa"],
            "mainProtein": "none",
            "tags": ["vegetariano", "apto_bebe"]
          },
          "confidence": 0.95
        },
        "secondCourse": {
          "raw": "Albóndigas con tomate",
          "normalized": {
            "name": "Albóndigas en salsa de tomate",
            "categories": ["carne", "guiso"],
            "mainProtein": "cerdo",
            "tags": []
          },
          "confidence": 0.92
        },
        "dessert": {
          "raw": "Fruta de temporada",
          "normalized": {
            "name": "Fruta de temporada",
            "categories": ["fruta"],
            "mainProtein": "none",
            "tags": ["fruta_con_piel"]
          },
          "confidence": 0.98
        }
      },
      {
        "date": "2025-01-09",
        "isSchoolDay": true,
        "firstCourse": {
          "raw": "Macarrones boloñesa",
          "normalized": {
            "name": "Macarrones con carne",
            "categories": ["pasta"],
            "mainProtein": "ternera",
            "tags": []
          },
          "confidence": 0.91
        },
        "secondCourse": {
          "raw": "Merluza rebozada c/ ensalada",
          "normalized": {
            "name": "Merluza rebozada con ensalada",
            "categories": ["pescado_blanco", "fritura"],
            "mainProtein": "pescado_blanco",
            "tags": ["contiene_huevo_horneado"]
          },
          "confidence": 0.88
        },
        "dessert": {
          "raw": "Yogur",
          "normalized": {
            "name": "Yogur",
            "categories": ["lacteo"],
            "mainProtein": "none",
            "tags": []
          },
          "confidence": 0.99
        }
      },
      {
        "date": "2025-01-10",
        "isSchoolDay": true,
        "firstCourse": {
          "raw": "Judías verdes rehogadas",
          "normalized": {
            "name": "Judías verdes rehogadas",
            "categories": ["verdura"],
            "mainProtein": "none",
            "tags": ["vegetariano", "apto_bebe"]
          },
          "confidence": 0.94
        },
        "secondCourse": {
          "raw": "Pollo asado c/ patatas",
          "normalized": {
            "name": "Pollo asado con patatas",
            "categories": ["carne", "horno"],
            "mainProtein": "pollo",
            "tags": []
          },
          "confidence": 0.96
        },
        "dessert": {
          "raw": "Natillas",
          "normalized": {
            "name": "Natillas",
            "categories": ["lacteo"],
            "mainProtein": "none",
            "tags": ["contiene_huevo_horneado"]
          },
          "confidence": 0.97
        }
      }
    ],
    "issues": [
      {
        "type": "low_confidence",
        "date": "2025-01-09",
        "field": "secondCourse",
        "message": "No está claro si 'c/' significa 'con' o 'sin'",
        "suggestion": "Verificar si la ensalada es guarnición incluida"
      }
    ],
    "metadata": {
      "processingTime": 2340,
      "modelUsed": "gpt-4-vision-preview",
      "tokensUsed": 1250
    }
  }
}
```

### Ejemplo 4: Familia con restricciones

```json
{
  "family": [
    {
      "id": 1,
      "name": "Papá",
      "type": "adult",
      "birthDate": "1985-03-20",
      "isActive": true,
      "color": "#3B82F6",
      "restrictions": []
    },
    {
      "id": 2,
      "name": "Mamá",
      "type": "adult",
      "birthDate": "1987-07-15",
      "isActive": true,
      "color": "#EC4899",
      "restrictions": []
    },
    {
      "id": 3,
      "name": "Pablo",
      "type": "child",
      "birthDate": "2020-11-10",
      "isActive": true,
      "color": "#10B981",
      "restrictions": [
        {
          "id": 1,
          "memberId": 3,
          "type": "texture",
          "condition": {
            "ingredient": "fruta",
            "forbiddenForms": ["con_piel"],
            "allowedForms": ["pelada", "compota", "zumo"],
            "requiresPreparation": "pelar"
          },
          "description": "No puede comer piel de fruta",
          "isActive": true
        }
      ]
    },
    {
      "id": 4,
      "name": "María",
      "type": "child",
      "birthDate": "2022-06-25",
      "isActive": true,
      "color": "#F59E0B",
      "restrictions": [
        {
          "id": 2,
          "memberId": 4,
          "type": "allergy",
          "condition": {
            "ingredient": "huevo",
            "forbiddenForms": ["directo", "frito", "cocido", "revuelto", "tortilla"],
            "allowedForms": ["horneado", "rebozado", "trazas"]
          },
          "description": "Alergia a huevo directo. Puede comer huevo horneado y rebozados.",
          "isActive": true
        }
      ]
    },
    {
      "id": 5,
      "name": "Bebé Lucas",
      "type": "baby",
      "birthDate": "2024-04-15",
      "isActive": true,
      "color": "#8B5CF6",
      "restrictions": [
        {
          "id": 3,
          "memberId": 5,
          "type": "age_related",
          "condition": {
            "ingredient": "*",
            "allowedForms": ["pure", "papilla", "vapor", "blw_textura"],
            "forbiddenForms": ["entero", "duro", "frito"]
          },
          "description": "Alimentación complementaria 9 meses. Purés, papillas y BLW.",
          "isActive": true
        }
      ]
    }
  ]
}
```

### Ejemplo 5: Lista de compra generada

```json
{
  "id": 15,
  "name": "Semana 13-19 Enero",
  "startDate": "2025-01-13",
  "endDate": "2025-01-19",
  "status": "active",
  "items": [
    {
      "id": "a1b2c3",
      "ingredientId": 5,
      "name": "Patatas",
      "quantity": 2,
      "unit": "kg",
      "category": "verdura",
      "isChecked": false,
      "fromMeals": ["2025-01-13_dinner", "2025-01-16_dinner"],
      "notes": null
    },
    {
      "id": "d4e5f6",
      "ingredientId": 8,
      "name": "Huevos",
      "quantity": 18,
      "unit": "unidades",
      "category": "lacteo",
      "isChecked": true,
      "fromMeals": ["2025-01-13_dinner", "2025-01-15_dinner", "2025-01-17_dinner"],
      "notes": "Comprar ecológicos"
    },
    {
      "id": "g7h8i9",
      "ingredientId": 25,
      "name": "Pechuga de pollo",
      "quantity": 800,
      "unit": "g",
      "category": "carne",
      "isChecked": false,
      "fromMeals": ["2025-01-14_dinner", "2025-01-18_lunch"],
      "notes": null
    },
    {
      "id": "j0k1l2",
      "ingredientId": null,
      "name": "Pizza congelada familiar",
      "quantity": 1,
      "unit": "unidad",
      "category": "congelado",
      "isChecked": false,
      "fromMeals": ["2025-01-16_dinner"],
      "notes": "Jueves = pizza"
    },
    {
      "id": "m3n4o5",
      "ingredientId": 12,
      "name": "Calabacín",
      "quantity": 4,
      "unit": "unidades",
      "category": "verdura",
      "isChecked": false,
      "fromMeals": ["2025-01-15_dinner", "2025-01-19_lunch"],
      "notes": "Para puré del bebé"
    }
  ],
  "summary": {
    "totalItems": 23,
    "checkedItems": 5,
    "categories": {
      "verdura": 8,
      "carne": 4,
      "pescado": 2,
      "lacteo": 3,
      "otros": 6
    }
  },
  "createdAt": "2025-01-12T10:00:00Z",
  "updatedAt": "2025-01-12T14:30:00Z"
}
```

---

## Datos Semilla para MVP

Al inicializar la app, se cargan datos de ejemplo:

```typescript
// seed.ts
export const seedData = {
  ingredients: [
    { name: 'Patata', category: 'verdura', defaultUnit: 'g', isCommon: true },
    { name: 'Cebolla', category: 'verdura', defaultUnit: 'unidad', isCommon: true },
    { name: 'Tomate', category: 'verdura', defaultUnit: 'unidad', isCommon: true },
    { name: 'Zanahoria', category: 'verdura', defaultUnit: 'unidad', isCommon: true },
    { name: 'Huevo', category: 'lacteo', defaultUnit: 'unidad', isCommon: true },
    { name: 'Leche', category: 'lacteo', defaultUnit: 'ml', isCommon: true },
    { name: 'Pechuga de pollo', category: 'carne', defaultUnit: 'g', isCommon: true },
    { name: 'Carne picada', category: 'carne', defaultUnit: 'g', isCommon: true },
    { name: 'Merluza', category: 'pescado', defaultUnit: 'g', isCommon: true },
    { name: 'Arroz', category: 'cereal', defaultUnit: 'g', isCommon: true },
    { name: 'Pasta', category: 'cereal', defaultUnit: 'g', isCommon: true },
    { name: 'Lentejas', category: 'legumbre', defaultUnit: 'g', isCommon: true },
    { name: 'Garbanzos', category: 'legumbre', defaultUnit: 'g', isCommon: true },
    { name: 'Aceite de oliva', category: 'aceite', defaultUnit: 'ml', isCommon: true },
    // ... más ingredientes comunes
  ],

  recipes: [
    {
      name: 'Pizza comprada',
      categories: ['otros'],
      mainProtein: 'none',
      tags: [],
      isPlateUnico: true,
      isFixedRule: true,
      ingredients: []
    },
    // ... recetas básicas de ejemplo
  ],

  weeklyPatterns: [
    {
      dayOfWeek: 4, // Jueves
      mealType: 'dinner',
      dishName: 'Pizza comprada',
      isActive: true,
      priority: 100
    }
  ]
};
```
