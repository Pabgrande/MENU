# F) Contratos de IA (Prompts + JSON Estrictos)

## Arquitectura de Abstracción

```typescript
// ai.types.ts

interface AIProvider {
  name: string;
  extractMenuFromImage(request: MenuOCRRequest): Promise<MenuOCRResponse>;
  parseRecipeText(request: RecipeParseRequest): Promise<RecipeParseResponse>;
  normalizeDish(request: DishNormalizeRequest): Promise<DishNormalizeResponse>;
}

// Permite cambiar de proveedor sin tocar la lógica de negocio
class AIService {
  private provider: AIProvider;

  constructor(providerName: 'openai' | 'claude' | 'gemini' | 'mock') {
    this.provider = this.createProvider(providerName);
  }

  setProvider(providerName: string) {
    this.provider = this.createProvider(providerName);
  }

  // Métodos públicos que usan los contratos
  async extractMenu(image: string, month: number, year: number) {
    return this.provider.extractMenuFromImage({ image, month, year });
  }

  async parseRecipe(text: string) {
    return this.provider.parseRecipeText({ text });
  }

  async normalizeDish(dishText: string) {
    return this.provider.normalizeDish({ dishText });
  }
}
```

---

## Contrato 1: MENU_OCR_EXTRACT

### Propósito
Extraer el menú escolar mensual desde una imagen o PDF, devolviendo datos estructurados por día.

### Request Schema

```typescript
interface MenuOCRRequest {
  /** Imagen en base64 o URL */
  image: string;
  /** Formato de imagen */
  imageFormat?: 'jpeg' | 'png' | 'pdf';
  /** Mes del menú (1-12) */
  month: number;
  /** Año del menú */
  year: number;
  /** Nombre del colegio (ayuda al contexto) */
  schoolName?: string;
  /** Idioma esperado */
  language?: 'es' | 'ca' | 'eu' | 'gl';
}
```

### Response Schema

```typescript
interface MenuOCRResponse {
  /** Indica si la extracción fue exitosa */
  success: boolean;
  /** Confianza global (0-1) */
  confidence: number;
  /** Mes extraído */
  month: number;
  /** Año extraído */
  year: number;
  /** Nombre del colegio detectado */
  schoolName?: string;
  /** Entradas del menú por día */
  entries: MenuOCREntry[];
  /** Lista de problemas detectados */
  issues: MenuOCRIssue[];
  /** Error si success=false */
  error?: string;
}

interface MenuOCREntry {
  /** Fecha en formato ISO (YYYY-MM-DD) */
  date: string;
  /** Es día lectivo */
  isSchoolDay: boolean;
  /** Motivo si no es lectivo */
  nonSchoolReason?: string;
  /** Primer plato */
  firstCourse?: MenuOCRDish;
  /** Segundo plato */
  secondCourse?: MenuOCRDish;
  /** Postre */
  dessert?: MenuOCRDish;
  /** Confianza de este día (0-1) */
  confidence: number;
  /** Requiere revisión humana */
  needsReview: boolean;
}

interface MenuOCRDish {
  /** Texto tal como se leyó */
  raw: string;
  /** Datos normalizados */
  normalized: {
    /** Nombre limpio */
    name: string;
    /** Categorías detectadas */
    categories: string[];
    /** Proteína principal */
    mainProtein: string | null;
    /** Tags especiales */
    tags: string[];
  };
  /** Confianza de este campo (0-1) */
  confidence: number;
}

interface MenuOCRIssue {
  /** Tipo de problema */
  type: 'low_confidence' | 'ambiguous' | 'missing' | 'format_error';
  /** Fecha afectada */
  date?: string;
  /** Campo afectado */
  field?: 'firstCourse' | 'secondCourse' | 'dessert' | 'date';
  /** Descripción del problema */
  message: string;
  /** Sugerencia para resolverlo */
  suggestion?: string;
}
```

### Prompt (Español)

```
SISTEMA: Eres un asistente especializado en extraer menús escolares de imágenes. Tu trabajo es identificar cada día del mes y extraer los platos servidos (primer plato, segundo plato, postre).

INSTRUCCIONES:
1. Analiza la imagen del menú escolar
2. Identifica la estructura: normalmente hay una tabla con días de la semana y semanas del mes
3. Para cada día lectivo, extrae:
   - Primer plato (suele ser verdura, legumbre, pasta o arroz)
   - Segundo plato (suele ser proteína: carne, pescado, huevo)
   - Postre (fruta, lácteo, dulce)
4. Identifica días no lectivos (festivos, vacaciones)
5. Normaliza cada plato:
   - Categorías: pasta, arroz, legumbres, verdura, carne, pescado, huevo, fritura, guiso, etc.
   - Proteína principal: pollo, cerdo, ternera, pescado_blanco, pescado_azul, huevo, legumbres, none
   - Tags: contiene_huevo_directo, contiene_huevo_horneado, fruta_con_piel, apto_bebe
6. Asigna confianza (0-1) a cada extracción
7. Marca para revisión si confianza < 0.7

REGLAS DE NORMALIZACIÓN:
- "c/" o "con" = acompañamiento incluido
- "Fruta de temporada" → tag: fruta_con_piel
- "Rebozado", "empanado" → tag: contiene_huevo_horneado
- "Tortilla", "huevo frito" → tag: contiene_huevo_directo
- Albóndigas suelen ser de cerdo/ternera mezclado → proteína: cerdo
- Merluza, bacalao, lenguado → pescado_blanco
- Salmón, atún → pescado_azul

FORMATO DE RESPUESTA:
Devuelve ÚNICAMENTE un JSON válido con la estructura especificada. No incluyas texto explicativo fuera del JSON.

DATOS DEL MENÚ:
- Mes: {month}
- Año: {year}
- Colegio: {schoolName}

IMAGEN: [imagen adjunta]
```

### Ejemplo de Respuesta

```json
{
  "success": true,
  "confidence": 0.89,
  "month": 1,
  "year": 2025,
  "schoolName": "CEIP San Juan",
  "entries": [
    {
      "date": "2025-01-07",
      "isSchoolDay": false,
      "nonSchoolReason": "Festivo - Día de Reyes (observado)",
      "confidence": 0.99,
      "needsReview": false
    },
    {
      "date": "2025-01-08",
      "isSchoolDay": true,
      "firstCourse": {
        "raw": "Crema de verduras",
        "normalized": {
          "name": "Crema de verduras",
          "categories": ["verdura", "sopa"],
          "mainProtein": null,
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
          "mainProtein": null,
          "tags": ["fruta_con_piel"]
        },
        "confidence": 0.98
      },
      "confidence": 0.93,
      "needsReview": false
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
        "raw": "Merluza reb. c/ ensalada",
        "normalized": {
          "name": "Merluza rebozada con ensalada",
          "categories": ["pescado", "fritura"],
          "mainProtein": "pescado_blanco",
          "tags": ["contiene_huevo_horneado"]
        },
        "confidence": 0.78
      },
      "dessert": {
        "raw": "Yogur",
        "normalized": {
          "name": "Yogur",
          "categories": ["lacteo"],
          "mainProtein": null,
          "tags": []
        },
        "confidence": 0.99
      },
      "confidence": 0.85,
      "needsReview": true
    }
  ],
  "issues": [
    {
      "type": "low_confidence",
      "date": "2025-01-09",
      "field": "secondCourse",
      "message": "Abreviatura 'reb.' interpretada como 'rebozada'. Verificar.",
      "suggestion": "Confirmar si 'reb.' significa rebozada o es otra palabra"
    },
    {
      "type": "ambiguous",
      "date": "2025-01-09",
      "field": "secondCourse",
      "message": "No claro si 'c/' significa 'con' o 'sin'",
      "suggestion": "Verificar si la ensalada es acompañamiento incluido"
    }
  ]
}
```

---

## Contrato 2: RECIPE_TEXT_PARSE

### Propósito
Extraer ingredientes y pasos de una receta a partir de texto libre (copiado de web, libro, etc.).

### Request Schema

```typescript
interface RecipeParseRequest {
  /** Texto libre de la receta */
  text: string;
  /** Nombre de la receta (si se conoce) */
  recipeName?: string;
  /** Idioma del texto */
  language?: 'es' | 'en';
}
```

### Response Schema

```typescript
interface RecipeParseResponse {
  /** Indica si la extracción fue exitosa */
  success: boolean;
  /** Confianza global (0-1) */
  confidence: number;
  /** Nombre de la receta */
  name: string;
  /** Lista de ingredientes extraídos */
  ingredients: ParsedIngredient[];
  /** Pasos de preparación (opcional) */
  steps?: string[];
  /** Tiempo de preparación en minutos */
  prepTime?: number;
  /** Tiempo de cocción en minutos */
  cookTime?: number;
  /** Número de raciones */
  servings?: number;
  /** Categorías sugeridas */
  suggestedCategories: string[];
  /** Proteína principal detectada */
  mainProtein?: string;
  /** Tags sugeridos */
  suggestedTags: string[];
  /** Error si success=false */
  error?: string;
}

interface ParsedIngredient {
  /** Nombre del ingrediente */
  name: string;
  /** Nombre normalizado (lowercase, sin acentos) */
  normalizedName: string;
  /** Cantidad (número) */
  quantity?: number;
  /** Unidad de medida */
  unit?: string;
  /** Es opcional */
  isOptional: boolean;
  /** Preparación necesaria */
  preparation?: string;
  /** Texto original */
  raw: string;
  /** Confianza de esta extracción (0-1) */
  confidence: number;
}
```

### Prompt (Español)

```
SISTEMA: Eres un asistente especializado en parsear recetas de cocina. Tu trabajo es extraer ingredientes estructurados y pasos de preparación a partir de texto libre.

INSTRUCCIONES:
1. Analiza el texto de la receta
2. Extrae el nombre de la receta (si no se proporciona, infiere uno descriptivo)
3. Identifica y estructura cada ingrediente:
   - Nombre del ingrediente
   - Cantidad (número o fracción)
   - Unidad (g, kg, ml, L, unidad, cucharada, taza, pizca, etc.)
   - Si es opcional (indicado por "opcional", "al gusto", etc.)
   - Preparación previa ("picado", "en juliana", "pelado", etc.)
4. Extrae los pasos de preparación si están disponibles
5. Detecta información adicional: tiempo, raciones, dificultad
6. Sugiere categorías y tags basándote en los ingredientes

REGLAS DE NORMALIZACIÓN:
- "1/2" → 0.5
- "un par de" → 2
- "al gusto" → isOptional: true, quantity: null
- "una pizca" → unit: "pizca"
- "c/s" (cantidad suficiente) → isOptional: true
- Separar preparación del nombre: "2 cebollas picadas" → name: "cebolla", quantity: 2, preparation: "picadas"

CATEGORÍAS VÁLIDAS:
pasta, arroz, legumbres, verdura, carne, pescado, huevo, lacteo, fritura, horno, plancha, guiso, sopa, ensalada

PROTEÍNAS VÁLIDAS:
pollo, cerdo, ternera, cordero, pescado_blanco, pescado_azul, marisco, huevo, legumbres, tofu, none

TAGS VÁLIDOS:
contiene_huevo_directo, contiene_huevo_horneado, puede_contener_trazas, fruta_con_piel, apto_bebe, sin_gluten, sin_lactosa, vegetariano, vegano, rapido, batch_cooking, congelable

FORMATO DE RESPUESTA:
Devuelve ÚNICAMENTE un JSON válido con la estructura especificada.

TEXTO DE LA RECETA:
{text}
```

### Ejemplo de Input

```
Tortilla de patatas casera

Para 4 personas necesitas:
- 500g de patatas
- 6 huevos grandes
- 1 cebolla mediana (opcional)
- Aceite de oliva virgen extra para freír
- Sal al gusto

Preparación:
Pela las patatas y córtalas en rodajas finas. Si usas cebolla, pícala en juliana. Fríe las patatas (y cebolla) en aceite abundante a fuego medio hasta que estén tiernas, unos 20 minutos. Escurre bien. Bate los huevos con sal y mezcla con las patatas. En una sartén antiadherente con un poco de aceite, vierte la mezcla y cuaja a fuego medio-bajo unos 5 minutos. Dale la vuelta con ayuda de un plato y termina de cuajar otros 3-4 minutos.

Tiempo total: 35 minutos
```

### Ejemplo de Respuesta

```json
{
  "success": true,
  "confidence": 0.94,
  "name": "Tortilla de patatas casera",
  "ingredients": [
    {
      "name": "Patatas",
      "normalizedName": "patata",
      "quantity": 500,
      "unit": "g",
      "isOptional": false,
      "preparation": "peladas y en rodajas finas",
      "raw": "500g de patatas",
      "confidence": 0.98
    },
    {
      "name": "Huevos",
      "normalizedName": "huevo",
      "quantity": 6,
      "unit": "unidad",
      "isOptional": false,
      "preparation": null,
      "raw": "6 huevos grandes",
      "confidence": 0.99
    },
    {
      "name": "Cebolla",
      "normalizedName": "cebolla",
      "quantity": 1,
      "unit": "unidad",
      "isOptional": true,
      "preparation": "picada en juliana",
      "raw": "1 cebolla mediana (opcional)",
      "confidence": 0.97
    },
    {
      "name": "Aceite de oliva virgen extra",
      "normalizedName": "aceite_oliva",
      "quantity": null,
      "unit": "para freír",
      "isOptional": false,
      "preparation": null,
      "raw": "Aceite de oliva virgen extra para freír",
      "confidence": 0.95
    },
    {
      "name": "Sal",
      "normalizedName": "sal",
      "quantity": null,
      "unit": "al gusto",
      "isOptional": true,
      "preparation": null,
      "raw": "Sal al gusto",
      "confidence": 0.99
    }
  ],
  "steps": [
    "Pela las patatas y córtalas en rodajas finas.",
    "Si usas cebolla, pícala en juliana.",
    "Fríe las patatas (y cebolla) en aceite abundante a fuego medio hasta que estén tiernas, unos 20 minutos.",
    "Escurre bien el aceite.",
    "Bate los huevos con sal y mezcla con las patatas.",
    "En una sartén antiadherente con un poco de aceite, vierte la mezcla y cuaja a fuego medio-bajo unos 5 minutos.",
    "Dale la vuelta con ayuda de un plato y termina de cuajar otros 3-4 minutos."
  ],
  "prepTime": 10,
  "cookTime": 25,
  "servings": 4,
  "suggestedCategories": ["huevo", "fritura"],
  "mainProtein": "huevo",
  "suggestedTags": ["contiene_huevo_directo", "vegetariano"]
}
```

---

## Contrato 3: DISH_NORMALIZE

### Propósito
Normalizar un nombre de plato libre a categorías, proteína y tags estandarizados.

### Request Schema

```typescript
interface DishNormalizeRequest {
  /** Texto del plato a normalizar */
  dishText: string;
  /** Contexto adicional */
  context?: {
    /** Es plato de colegio */
    isSchoolMeal?: boolean;
    /** Curso (primero, segundo, postre) */
    courseType?: 'first' | 'second' | 'dessert';
  };
}
```

### Response Schema

```typescript
interface DishNormalizeResponse {
  /** Indica si la normalización fue exitosa */
  success: boolean;
  /** Confianza (0-1) */
  confidence: number;
  /** Nombre original */
  originalText: string;
  /** Nombre normalizado/limpio */
  normalizedName: string;
  /** Categorías del plato */
  categories: string[];
  /** Proteína principal */
  mainProtein: string | null;
  /** Tags especiales */
  tags: NormalizationTag[];
  /** Es plato único completo */
  isPlateUnico: boolean;
  /** Ingredientes principales detectados */
  mainIngredients: string[];
  /** Alternativas de interpretación si hay ambigüedad */
  alternatives?: {
    interpretation: string;
    confidence: number;
  }[];
}

interface NormalizationTag {
  /** Nombre del tag */
  tag: string;
  /** Confianza de este tag (0-1) */
  confidence: number;
  /** Razón de asignación */
  reason: string;
}
```

### Prompt (Español)

```
SISTEMA: Eres un asistente especializado en clasificar platos de comida española. Tu trabajo es normalizar nombres de platos y extraer metadatos estructurados.

INSTRUCCIONES:
1. Analiza el nombre del plato
2. Limpia y normaliza el nombre (expandir abreviaturas, corregir errores)
3. Identifica categorías (puede tener varias)
4. Identifica la proteína principal (si la hay)
5. Asigna tags especiales relevantes
6. Determina si es plato único (completo nutricionalmente)
7. Lista ingredientes principales detectados

ABREVIATURAS COMUNES (menús escolares):
- "c/" = "con"
- "s/" = "sin"
- "reb." = "rebozado"
- "temp." = "temporada"
- "verd." = "verduras"
- "pat." = "patatas"

CATEGORÍAS VÁLIDAS:
- pasta: macarrones, espaguetis, lasaña, canelones, fideos
- arroz: paella, arroz blanco, risotto, arroz con...
- legumbres: lentejas, garbanzos, alubias, fabada
- verdura: menestra, crema, puré, ensalada, verduras salteadas
- carne: filetes, asados, guisos de carne
- pescado: cualquier pescado o marisco
- huevo: tortilla, huevos fritos, revueltos
- fritura: rebozados, empanados, fritos
- guiso: estofados, cocidos, potajes
- sopa: caldos, consomés, sopas
- horno: asados, gratinados
- plancha: a la plancha, grillados

PROTEÍNAS (en orden de especificidad):
- pollo: pollo, pechuga, muslo, alitas
- cerdo: cerdo, lomo, costilla, chorizo, jamón, bacon, salchichas, albóndigas (por defecto)
- ternera: ternera, vaca, filete de ternera, solomillo, entrecot
- cordero: cordero, lechal, chuletas de cordero
- pescado_blanco: merluza, bacalao, lenguado, rape, lubina, dorada, pescadilla
- pescado_azul: salmón, atún, sardinas, caballa, boquerones, trucha
- marisco: gambas, langostinos, mejillones, calamares, sepia, pulpo
- huevo: cuando el huevo es protagonista (tortilla, huevo frito)
- legumbres: cuando las legumbres son el plato principal
- tofu: tofu, tempeh, seitán

TAGS ESPECIALES:
- contiene_huevo_directo: tortilla, huevo frito, huevo cocido, huevo revuelto
- contiene_huevo_horneado: rebozados, empanados, croquetas, bizcochos, natillas
- puede_contener_trazas: productos procesados que pueden contener trazas
- fruta_con_piel: manzana, pera, melocotón, ciruela, "fruta de temporada"
- apto_bebe: purés suaves, verduras vapor, sin sal añadida
- sin_gluten: naturalmente sin gluten o indicado
- sin_lactosa: sin lácteos
- vegetariano: sin carne ni pescado
- vegano: sin productos animales
- rapido: preparación < 30 min
- plato_unico: nutricionalmente completo (proteína + carbohidrato + verdura)

FORMATO DE RESPUESTA:
Devuelve ÚNICAMENTE un JSON válido con la estructura especificada.

PLATO A NORMALIZAR:
"{dishText}"

CONTEXTO:
- Es menú escolar: {isSchoolMeal}
- Tipo de curso: {courseType}
```

### Ejemplos de Normalización

#### Ejemplo 1: Plato simple
**Input**: `"Merluza reb. c/ ensalada"`

```json
{
  "success": true,
  "confidence": 0.91,
  "originalText": "Merluza reb. c/ ensalada",
  "normalizedName": "Merluza rebozada con ensalada",
  "categories": ["pescado", "fritura", "ensalada"],
  "mainProtein": "pescado_blanco",
  "tags": [
    {
      "tag": "contiene_huevo_horneado",
      "confidence": 0.95,
      "reason": "El rebozado típicamente contiene huevo"
    }
  ],
  "isPlateUnico": true,
  "mainIngredients": ["merluza", "ensalada", "rebozado"]
}
```

#### Ejemplo 2: Plato con ambigüedad
**Input**: `"Carne con patatas"`

```json
{
  "success": true,
  "confidence": 0.75,
  "originalText": "Carne con patatas",
  "normalizedName": "Carne con patatas",
  "categories": ["carne", "guarnicion"],
  "mainProtein": "ternera",
  "tags": [],
  "isPlateUnico": true,
  "mainIngredients": ["carne", "patatas"],
  "alternatives": [
    {
      "interpretation": "Ternera (filete) con patatas",
      "confidence": 0.75
    },
    {
      "interpretation": "Cerdo (lomo) con patatas",
      "confidence": 0.60
    },
    {
      "interpretation": "Carne picada con patatas",
      "confidence": 0.50
    }
  ]
}
```

#### Ejemplo 3: Plato con restricción relevante
**Input**: `"Tortilla francesa con ensalada"`

```json
{
  "success": true,
  "confidence": 0.98,
  "originalText": "Tortilla francesa con ensalada",
  "normalizedName": "Tortilla francesa con ensalada",
  "categories": ["huevo", "ensalada"],
  "mainProtein": "huevo",
  "tags": [
    {
      "tag": "contiene_huevo_directo",
      "confidence": 0.99,
      "reason": "La tortilla francesa es huevo como ingrediente principal, poco cuajado"
    },
    {
      "tag": "vegetariano",
      "confidence": 0.95,
      "reason": "No contiene carne ni pescado"
    }
  ],
  "isPlateUnico": false,
  "mainIngredients": ["huevo", "ensalada"]
}
```

#### Ejemplo 4: Postre con fruta
**Input**: `"Fruta de temporada"`

```json
{
  "success": true,
  "confidence": 0.97,
  "originalText": "Fruta de temporada",
  "normalizedName": "Fruta de temporada",
  "categories": ["fruta", "postre"],
  "mainProtein": null,
  "tags": [
    {
      "tag": "fruta_con_piel",
      "confidence": 0.90,
      "reason": "Fruta de temporada generalmente se sirve entera con piel (manzana, pera, etc.)"
    },
    {
      "tag": "vegetariano",
      "confidence": 1.0,
      "reason": "Es fruta"
    },
    {
      "tag": "vegano",
      "confidence": 1.0,
      "reason": "Es fruta"
    },
    {
      "tag": "apto_bebe",
      "confidence": 0.70,
      "reason": "Apto si se prepara adecuadamente (triturado o pelado)"
    }
  ],
  "isPlateUnico": false,
  "mainIngredients": ["fruta"]
}
```

---

## Implementación del Provider (OpenAI)

```typescript
// openai.provider.ts
import OpenAI from 'openai';
import { AIProvider, MenuOCRRequest, MenuOCRResponse, /* ... */ } from './ai.types';

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async extractMenuFromImage(request: MenuOCRRequest): Promise<MenuOCRResponse> {
    const prompt = this.buildMenuOCRPrompt(request);

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: request.image.startsWith('data:')
                    ? request.image
                    : `data:image/jpeg;base64,${request.image}`
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content');
      }

      const parsed = JSON.parse(content) as MenuOCRResponse;
      return this.validateMenuOCRResponse(parsed);

    } catch (error) {
      return {
        success: false,
        confidence: 0,
        month: request.month,
        year: request.year,
        entries: [],
        issues: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async parseRecipeText(request: RecipeParseRequest): Promise<RecipeParseResponse> {
    const prompt = this.buildRecipeParsePrompt(request);

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: RECIPE_PARSE_SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2048,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content');
      }

      return JSON.parse(content) as RecipeParseResponse;

    } catch (error) {
      return {
        success: false,
        confidence: 0,
        name: '',
        ingredients: [],
        suggestedCategories: [],
        suggestedTags: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async normalizeDish(request: DishNormalizeRequest): Promise<DishNormalizeResponse> {
    const prompt = this.buildDishNormalizePrompt(request);

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: DISH_NORMALIZE_SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1024,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content');
      }

      return JSON.parse(content) as DishNormalizeResponse;

    } catch (error) {
      // Fallback a normalización local básica
      return this.fallbackNormalize(request.dishText);
    }
  }

  private fallbackNormalize(dishText: string): DishNormalizeResponse {
    // Normalización básica sin IA como fallback
    const normalized = dishText.toLowerCase().trim();
    return {
      success: true,
      confidence: 0.5,
      originalText: dishText,
      normalizedName: dishText,
      categories: [],
      mainProtein: null,
      tags: [],
      isPlateUnico: false,
      mainIngredients: []
    };
  }

  // ... métodos auxiliares para construir prompts
}
```

---

## Mock Provider para Tests

```typescript
// mock.provider.ts
export class MockAIProvider implements AIProvider {
  name = 'mock';

  async extractMenuFromImage(request: MenuOCRRequest): Promise<MenuOCRResponse> {
    // Simula respuesta con datos de ejemplo
    return {
      success: true,
      confidence: 0.95,
      month: request.month,
      year: request.year,
      entries: this.generateMockEntries(request.month, request.year),
      issues: []
    };
  }

  async parseRecipeText(request: RecipeParseRequest): Promise<RecipeParseResponse> {
    // Parseo básico sin IA
    const lines = request.text.split('\n');
    const ingredients = lines
      .filter(line => line.match(/^\s*[-•*]\s*/) || line.match(/^\d/))
      .map(line => ({
        name: line.replace(/^\s*[-•*\d.]\s*/, '').trim(),
        normalizedName: line.toLowerCase().replace(/[^a-z]/g, ''),
        isOptional: line.includes('opcional'),
        raw: line,
        confidence: 0.7
      }));

    return {
      success: true,
      confidence: 0.7,
      name: request.recipeName || 'Receta sin nombre',
      ingredients,
      suggestedCategories: [],
      suggestedTags: []
    };
  }

  async normalizeDish(request: DishNormalizeRequest): Promise<DishNormalizeResponse> {
    // Usa diccionario local
    return localDishNormalizer(request.dishText);
  }

  private generateMockEntries(month: number, year: number): MenuOCREntry[] {
    // Genera entradas de ejemplo para el mes
    const entries: MenuOCREntry[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();

      // Saltar fines de semana
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      entries.push({
        date: date.toISOString().split('T')[0],
        isSchoolDay: true,
        firstCourse: {
          raw: MOCK_FIRST_COURSES[day % MOCK_FIRST_COURSES.length],
          normalized: { name: '', categories: [], mainProtein: null, tags: [] },
          confidence: 0.9
        },
        secondCourse: {
          raw: MOCK_SECOND_COURSES[day % MOCK_SECOND_COURSES.length],
          normalized: { name: '', categories: [], mainProtein: null, tags: [] },
          confidence: 0.9
        },
        dessert: {
          raw: MOCK_DESSERTS[day % MOCK_DESSERTS.length],
          normalized: { name: '', categories: [], mainProtein: null, tags: [] },
          confidence: 0.95
        },
        confidence: 0.9,
        needsReview: false
      });
    }

    return entries;
  }
}

const MOCK_FIRST_COURSES = [
  'Crema de verduras',
  'Macarrones boloñesa',
  'Lentejas estofadas',
  'Arroz con tomate',
  'Sopa de fideos'
];

const MOCK_SECOND_COURSES = [
  'Pollo asado con patatas',
  'Merluza rebozada con ensalada',
  'Albóndigas con tomate',
  'Tortilla francesa con ensalada',
  'Lomo a la plancha con verduras'
];

const MOCK_DESSERTS = [
  'Fruta de temporada',
  'Yogur',
  'Natillas',
  'Fruta de temporada',
  'Yogur'
];
```
