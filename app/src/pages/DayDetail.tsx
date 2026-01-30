import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, School, Utensils, Baby, StickyNote, Plus, RefreshCw } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../services/db'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import MealCard from '../components/meal/MealCard'
import type { MealSlot, MealType } from '../types'

export default function DayDetail() {
  const navigate = useNavigate()
  const { date } = useParams()
  const dateStr = date || format(new Date(), 'yyyy-MM-dd')
  const dateObj = parseISO(dateStr)

  const [noteText, setNoteText] = useState('')
  const [showMealSelector, setShowMealSelector] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState<MealType>('dinner')

  // Queries
  const meals = useLiveQuery(
    () => db.mealSlots.where('date').equals(dateStr).toArray(),
    [dateStr]
  )

  const members = useLiveQuery(() => db.familyMembers.toArray())
  const recipes = useLiveQuery(() => db.recipes.where('isFixedRule').equals(0).toArray())

  const dayNote = useLiveQuery(
    () => db.dayNotes.where('date').equals(dateStr).first(),
    [dateStr]
  )

  const memberNames = members?.reduce((acc, m) => {
    if (m.id) acc[m.id] = m.name
    return acc
  }, {} as Record<number, string>) || {}

  // Separar comidas
  const schoolMeal = meals?.find(m => m.origin === 'school')
  const dinnerMeal = meals?.find(m => m.mealType === 'dinner' && m.origin !== 'school')
  const babyMeals = meals?.filter(m => {
    const baby = members?.find(mem => mem.type === 'baby')
    return baby?.id && m.forMembers.includes(baby.id)
  })

  const handleAddMeal = (mealType: MealType) => {
    setSelectedMealType(mealType)
    setShowMealSelector(true)
  }

  const handleSelectRecipe = async (recipeId: number, recipeName: string) => {
    const now = new Date().toISOString()
    const allMemberIds = members?.filter(m => m.type !== 'baby').map(m => m.id!).filter(Boolean) || []

    const newMealSlot: MealSlot = {
      date: dateStr,
      mealType: selectedMealType,
      origin: 'manual',
      recipeId,
      dishName: recipeName,
      forMembers: allMemberIds,
      isLocked: false,
      createdAt: now,
      updatedAt: now,
    }

    await db.mealSlots.add(newMealSlot)
    setShowMealSelector(false)
  }

  const handleSaveNote = async () => {
    const now = new Date().toISOString()

    if (dayNote?.id) {
      await db.dayNotes.update(dayNote.id, {
        note: noteText,
        updatedAt: now,
      })
    } else {
      await db.dayNotes.add({
        date: dateStr,
        note: noteText,
        createdAt: now,
        updatedAt: now,
      })
    }
  }

  const handleDeleteMeal = async (mealId: number) => {
    if (confirm('¿Eliminar esta comida?')) {
      await db.mealSlots.delete(mealId)
    }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {format(dateObj, "EEEE d 'de' MMMM", { locale: es })}
            </h1>
            <p className="text-sm text-gray-500">{format(dateObj, 'yyyy')}</p>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <div className="page-content space-y-6">
        {/* Cole */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <School className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-700">Cole (12:30)</h2>
            </div>
          </div>
          {schoolMeal ? (
            <MealCard
              meal={schoolMeal}
              showOrigin={false}
              memberNames={memberNames}
              onEdit={() => handleDeleteMeal(schoolMeal.id!)}
            />
          ) : (
            <Card className="text-center py-4 text-gray-500">
              Sin datos del cole
            </Card>
          )}
        </section>

        {/* Cena */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-green-600" />
              <h2 className="font-semibold text-gray-700">Cena (20:00)</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddMeal('dinner')}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Cambiar
            </Button>
          </div>
          {dinnerMeal ? (
            <MealCard
              meal={dinnerMeal}
              memberNames={memberNames}
              onEdit={() => handleDeleteMeal(dinnerMeal.id!)}
            />
          ) : (
            <Card className="text-center py-4">
              <p className="text-gray-500 mb-2">Sin cena planificada</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAddMeal('dinner')}
              >
                <Plus className="w-4 h-4 mr-1" />
                Añadir cena
              </Button>
            </Card>
          )}
        </section>

        {/* Bebé */}
        {members?.some(m => m.type === 'baby') && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Baby className="w-5 h-5 text-purple-600" />
                <h2 className="font-semibold text-gray-700">Bebé</h2>
              </div>
            </div>
            {babyMeals && babyMeals.length > 0 ? (
              babyMeals.map(meal => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  showOrigin={false}
                  showMembers={false}
                />
              ))
            ) : (
              <Card className="text-center py-4 text-gray-500">
                Sin comida del bebé planificada
              </Card>
            )}
          </section>
        )}

        {/* Nota del día */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <StickyNote className="w-5 h-5 text-yellow-600" />
            <h2 className="font-semibold text-gray-700">Nota del día</h2>
          </div>
          <Card>
            <textarea
              value={noteText || dayNote?.note || ''}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Añadir una nota para este día..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {noteText !== (dayNote?.note || '') && (
              <Button
                variant="primary"
                size="sm"
                className="mt-2"
                onClick={handleSaveNote}
              >
                Guardar nota
              </Button>
            )}
          </Card>
        </section>
      </div>

      {/* Modal selector de comida */}
      {showMealSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="font-semibold">Seleccionar comida</h3>
              <button
                onClick={() => setShowMealSelector(false)}
                className="text-gray-500"
              >
                Cancelar
              </button>
            </div>

            <div className="p-4 space-y-2">
              {recipes?.map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => handleSelectRecipe(recipe.id!, recipe.name)}
                  className="w-full p-3 text-left border rounded-lg hover:bg-gray-50"
                >
                  <p className="font-medium">{recipe.name}</p>
                  <p className="text-sm text-gray-500">
                    {recipe.categories.join(', ')}
                  </p>
                </button>
              ))}

              {(!recipes || recipes.length === 0) && (
                <p className="text-center text-gray-500 py-8">
                  No hay recetas. Crea algunas primero.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
