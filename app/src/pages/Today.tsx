import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, addDays, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, School, Utensils, Baby, StickyNote, Calendar } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../services/db'
import Card from '../components/ui/Card'
import MealCard from '../components/meal/MealCard'
import Button from '../components/ui/Button'
import type { MealSlot, FamilyMember, DayNote } from '../types'

export default function Today() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const dateStr = format(currentDate, 'yyyy-MM-dd')

  // Queries reactivas
  const meals = useLiveQuery(
    () => db.mealSlots.where('date').equals(dateStr).toArray(),
    [dateStr]
  )

  const members = useLiveQuery(() => db.familyMembers.toArray())

  const dayNote = useLiveQuery(
    () => db.dayNotes.where('date').equals(dateStr).first(),
    [dateStr]
  )

  const memberNames = members?.reduce((acc, m) => {
    if (m.id) acc[m.id] = m.name
    return acc
  }, {} as Record<number, string>) || {}

  const goToPrevDay = () => setCurrentDate(subDays(currentDate, 1))
  const goToNextDay = () => setCurrentDate(addDays(currentDate, 1))
  const goToToday = () => setCurrentDate(new Date())

  const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr

  // Separar comidas por tipo
  const schoolMeal = meals?.find(m => m.origin === 'school' && m.mealType === 'lunch')
  const dinnerPlan = meals?.find(m => m.mealType === 'dinner' && m.origin !== 'school')
  const babyMeals = meals?.filter(m => {
    const babyMember = members?.find(mem => mem.type === 'baby')
    return babyMember?.id && m.forMembers.includes(babyMember.id)
  })

  const handleEditMeal = (meal: MealSlot) => {
    navigate(`/day/${dateStr}`)
  }

  const handleMarkDone = async (meal: MealSlot) => {
    // TODO: Implementar lógica de marcar como comido
    console.log('Marcar como comido:', meal)
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Hoy</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/calendar')}
          >
            <Calendar className="w-5 h-5 mr-1" />
            Ir a fecha
          </Button>
        </div>

        {/* Navegación de fecha */}
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={goToPrevDay}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">
              {format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
            </p>
            {!isToday && (
              <button
                onClick={goToToday}
                className="text-sm text-blue-600 hover:underline"
              >
                Volver a hoy
              </button>
            )}
          </div>

          <button
            onClick={goToNextDay}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Contenido */}
      <div className="page-content space-y-4">
        {/* Menú del cole */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <School className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-700">Cole (niños)</h2>
          </div>
          {schoolMeal ? (
            <MealCard
              meal={schoolMeal}
              showOrigin={false}
              memberNames={memberNames}
              onEdit={() => handleEditMeal(schoolMeal)}
            />
          ) : (
            <Card className="text-center text-gray-500 py-6">
              <p>Sin datos del cole para este día</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => navigate('/import-menu')}
              >
                Importar menú escolar
              </Button>
            </Card>
          )}
        </section>

        {/* Cena planificada */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Utensils className="w-5 h-5 text-green-600" />
            <h2 className="font-semibold text-gray-700">Cena planificada</h2>
          </div>
          {dinnerPlan ? (
            <MealCard
              meal={dinnerPlan}
              memberNames={memberNames}
              onEdit={() => handleEditMeal(dinnerPlan)}
              onMarkDone={() => handleMarkDone(dinnerPlan)}
            />
          ) : (
            <Card className="text-center text-gray-500 py-6">
              <p>Sin cena planificada</p>
              <Button
                variant="primary"
                size="sm"
                className="mt-2"
                onClick={() => navigate(`/day/${dateStr}`)}
              >
                Planificar cena
              </Button>
            </Card>
          )}
        </section>

        {/* Menú bebé */}
        {babyMeals && babyMeals.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Baby className="w-5 h-5 text-purple-600" />
              <h2 className="font-semibold text-gray-700">Bebé</h2>
            </div>
            {babyMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                showOrigin={false}
                showMembers={false}
                onEdit={() => handleEditMeal(meal)}
                onMarkDone={() => handleMarkDone(meal)}
              />
            ))}
          </section>
        )}

        {/* Nota del día */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <StickyNote className="w-5 h-5 text-yellow-600" />
            <h2 className="font-semibold text-gray-700">Nota del día</h2>
          </div>
          <Card>
            {dayNote?.note ? (
              <p className="text-gray-700">{dayNote.note}</p>
            ) : (
              <p className="text-gray-400 italic">Sin notas para este día</p>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => navigate(`/day/${dateStr}`)}
            >
              {dayNote?.note ? 'Editar nota' : 'Añadir nota'}
            </Button>
          </Card>
        </section>
      </div>
    </div>
  )
}
