import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, ChevronLeft, ChevronRight, Share2, Check } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../services/db'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import type { ShoppingItem, IngredientCategory } from '../types'

export default function ShoppingList() {
  const navigate = useNavigate()
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  const startStr = format(currentWeekStart, 'yyyy-MM-dd')
  const endStr = format(weekEnd, 'yyyy-MM-dd')

  // Obtener comidas del rango
  const meals = useLiveQuery(
    () => db.mealSlots.where('date').between(startStr, endStr, true, true).toArray(),
    [startStr, endStr]
  )

  // Obtener recetas e ingredientes
  const recipes = useLiveQuery(() => db.recipes.toArray())
  const ingredients = useLiveQuery(() => db.ingredients.toArray())
  const recipeIngredients = useLiveQuery(() => db.recipeIngredients.toArray())

  // Generar lista de compra
  const shoppingItems = useMemo(() => {
    if (!meals || !recipes || !ingredients || !recipeIngredients) return []

    const itemsMap = new Map<number, ShoppingItem>()

    for (const meal of meals) {
      if (!meal.recipeId) continue

      const mealIngredients = recipeIngredients.filter(ri => ri.recipeId === meal.recipeId)

      for (const ri of mealIngredients) {
        const ingredient = ingredients.find(i => i.id === ri.ingredientId)
        if (!ingredient) continue

        const existing = itemsMap.get(ri.ingredientId)
        if (existing) {
          // Sumar cantidades
          if (existing.quantity && ri.quantity) {
            existing.quantity += ri.quantity
          }
          existing.fromMeals.push(`${meal.date}_${meal.mealType}`)
        } else {
          itemsMap.set(ri.ingredientId, {
            id: `${ri.ingredientId}`,
            ingredientId: ri.ingredientId,
            name: ingredient.name,
            quantity: ri.quantity,
            unit: ri.unit || ingredient.defaultUnit,
            category: ingredient.category,
            isChecked: false,
            fromMeals: [`${meal.date}_${meal.mealType}`],
          })
        }
      }
    }

    return Array.from(itemsMap.values()).sort((a, b) => {
      // Ordenar por categoría
      const catOrder: IngredientCategory[] = [
        'verdura', 'fruta', 'carne', 'pescado', 'lacteo',
        'cereal', 'legumbre', 'conserva', 'congelado', 'condimento', 'aceite', 'otros'
      ]
      return catOrder.indexOf(a.category) - catOrder.indexOf(b.category)
    })
  }, [meals, recipes, ingredients, recipeIngredients])

  // Agrupar por categoría
  const groupedItems = useMemo(() => {
    const groups: Record<string, ShoppingItem[]> = {}
    for (const item of shoppingItems) {
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category].push(item)
    }
    return groups
  }, [shoppingItems])

  const toggleItem = (itemId: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const goToPrevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7))
  const goToNextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7))
  const goToCurrentWeek = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))

  const checkedCount = checkedItems.size
  const totalCount = shoppingItems.length
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0

  const handleShare = async () => {
    const text = Object.entries(groupedItems)
      .map(([category, items]) => {
        const categoryName = category.toUpperCase()
        const itemsList = items
          .map(item => `${checkedItems.has(item.id) ? '✓' : '○'} ${item.quantity ? `${item.quantity} ${item.unit}` : ''} ${item.name}`)
          .join('\n')
        return `--- ${categoryName} ---\n${itemsList}`
      })
      .join('\n\n')

    const fullText = `Lista de compra - Semana ${format(currentWeekStart, 'd MMM', { locale: es })} a ${format(weekEnd, 'd MMM', { locale: es })}\n\n${text}`

    if (navigator.share) {
      await navigator.share({ text: fullText })
    } else {
      await navigator.clipboard.writeText(fullText)
      alert('Lista copiada al portapapeles')
    }
  }

  const categoryLabels: Record<string, string> = {
    verdura: 'Verduras',
    fruta: 'Frutas',
    carne: 'Carnes',
    pescado: 'Pescados',
    lacteo: 'Lácteos',
    cereal: 'Cereales',
    legumbre: 'Legumbres',
    conserva: 'Conservas',
    congelado: 'Congelados',
    condimento: 'Condimentos',
    aceite: 'Aceites',
    otros: 'Otros',
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Lista de compra</h1>
          </div>
          <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-lg">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de semana */}
        <div className="flex items-center justify-between mt-3">
          <button onClick={goToPrevWeek} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="font-medium">
              {format(currentWeekStart, 'd MMM', { locale: es })} - {format(weekEnd, 'd MMM', { locale: es })}
            </p>
            <button onClick={goToCurrentWeek} className="text-sm text-blue-600 hover:underline">
              Esta semana
            </button>
          </div>
          <button onClick={goToNextWeek} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Progreso */}
        <div className="mt-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progreso</span>
            <span>{checkedCount}/{totalCount}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Contenido */}
      <div className="page-content">
        {totalCount === 0 ? (
          <Card className="text-center py-8">
            <p className="text-gray-500 mb-4">
              No hay comidas planificadas para esta semana
            </p>
            <Button variant="primary" onClick={() => navigate('/calendar')}>
              Ir al calendario
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedItems).map(([category, items]) => (
              <section key={category}>
                <h2 className="font-semibold text-gray-700 mb-2">
                  {categoryLabels[category] || category} ({items.length})
                </h2>
                <Card className="p-0 divide-y divide-gray-100">
                  {items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className="w-full p-3 flex items-center gap-3 text-left hover:bg-gray-50"
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          checkedItems.has(item.id)
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {checkedItems.has(item.id) && <Check className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className={checkedItems.has(item.id) ? 'text-gray-400 line-through' : ''}>
                          {item.quantity && `${item.quantity} ${item.unit} `}
                          {item.name}
                        </p>
                      </div>
                    </button>
                  ))}
                </Card>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
