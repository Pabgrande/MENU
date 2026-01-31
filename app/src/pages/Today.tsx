import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, addDays, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, School, Utensils, Baby, StickyNote, Calendar } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../services/db'
import Card from '../components/ui/Card'
import MealCard from '../components/meal/MealCard'
import Button from '../components/ui/Button'
import { SkeletonMealCard } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import { useDateSwipe } from '../hooks/useSwipeGesture'
import { toast } from '../stores/toast.store'
import type { MealSlot } from '../types'

export default function Today() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const dateStr = format(currentDate, 'yyyy-MM-dd')

  // Swipe navigation
  const swipeRef = useDateSwipe(
    () => setCurrentDate(prev => subDays(prev, 1)),
    () => setCurrentDate(prev => addDays(prev, 1))
  )

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

  // Memoized derived data
  const memberNames = useMemo(() =>
    members?.reduce((acc, m) => {
      if (m.id) acc[m.id] = m.name
      return acc
    }, {} as Record<number, string>) || {},
    [members]
  )

  const babyMember = useMemo(() =>
    members?.find(mem => mem.type === 'baby'),
    [members]
  )

  // Separar comidas por tipo (memoized)
  const { schoolMeal, dinnerPlan, babyMeals } = useMemo(() => ({
    schoolMeal: meals?.find(m => m.origin === 'school' && m.mealType === 'lunch'),
    dinnerPlan: meals?.find(m => m.mealType === 'dinner' && m.origin !== 'school'),
    babyMeals: meals?.filter(m => babyMember?.id && m.forMembers.includes(babyMember.id))
  }), [meals, babyMember])

  // Callbacks memoized
  const goToPrevDay = useCallback(() => setCurrentDate(prev => subDays(prev, 1)), [])
  const goToNextDay = useCallback(() => setCurrentDate(prev => addDays(prev, 1)), [])
  const goToToday = useCallback(() => setCurrentDate(new Date()), [])

  const handleEditMeal = useCallback((_meal: MealSlot) => {
    navigate(`/day/${dateStr}`)
  }, [navigate, dateStr])

  const handleMarkDone = useCallback(async (meal: MealSlot) => {
    try {
      // Create ActualMeal from MealSlot
      await db.actualMeals.add({
        mealSlotId: meal.id,
        date: meal.date,
        mealType: meal.mealType,
        recipeId: meal.recipeId,
        dishName: meal.dishName,
        forMembers: meal.forMembers,
        wasSkipped: false,
        wasSubstituted: false,
        createdAt: new Date().toISOString(),
      })
      toast.success(`"${meal.dishName}" marcado como comido`)
    } catch (error) {
      toast.error('Error al marcar como comido')
    }
  }, [])

  const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr
  const isLoading = meals === undefined

  return (
    <div className="page-container" ref={swipeRef as React.RefObject<HTMLDivElement>}>
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Hoy</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/calendar')}
            className="touch-feedback"
          >
            <Calendar className="w-5 h-5 mr-1" />
            Ir a fecha
          </Button>
        </div>

        {/* Navegación de fecha */}
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={goToPrevDay}
            className="p-2 hover:bg-gray-100 rounded-lg touch-feedback"
            aria-label="Día anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 capitalize">
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
            className="p-2 hover:bg-gray-100 rounded-lg touch-feedback"
            aria-label="Día siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Swipe hint */}
        <p className="text-xs text-gray-400 text-center mt-1">
          Desliza para cambiar de día
        </p>
      </header>

      {/* Contenido */}
      <div className="page-content space-y-4">
        {/* Menú del cole */}
        <section className="animate-slide-up" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <School className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-700">Cole (niños)</h2>
          </div>
          {isLoading ? (
            <SkeletonMealCard />
          ) : schoolMeal ? (
            <MealCard
              meal={schoolMeal}
              showOrigin={false}
              memberNames={memberNames}
              onEdit={() => handleEditMeal(schoolMeal)}
            />
          ) : (
            <Card className="text-center py-6">
              <EmptyState
                type="no-school-menu"
                actionLabel="Importar menú escolar"
                onAction={() => navigate('/import-menu')}
              />
            </Card>
          )}
        </section>

        {/* Cena planificada */}
        <section className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <Utensils className="w-5 h-5 text-green-600" />
            <h2 className="font-semibold text-gray-700">Cena planificada</h2>
          </div>
          {isLoading ? (
            <SkeletonMealCard />
          ) : dinnerPlan ? (
            <MealCard
              meal={dinnerPlan}
              memberNames={memberNames}
              onEdit={() => handleEditMeal(dinnerPlan)}
              onMarkDone={() => handleMarkDone(dinnerPlan)}
            />
          ) : (
            <Card className="text-center py-6">
              <EmptyState
                type="no-meals"
                title="Sin cena planificada"
                description="Planifica la cena para tu familia"
                actionLabel="Planificar cena"
                onAction={() => navigate(`/day/${dateStr}`)}
              />
            </Card>
          )}
        </section>

        {/* Menú bebé */}
        {babyMember && (
          <section className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2 mb-2">
              <Baby className="w-5 h-5 text-purple-600" />
              <h2 className="font-semibold text-gray-700">
                Bebé ({babyMember.name})
              </h2>
            </div>
            {isLoading ? (
              <SkeletonMealCard />
            ) : babyMeals && babyMeals.length > 0 ? (
              <div className="space-y-2">
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
              </div>
            ) : (
              <Card className="text-center py-4">
                <p className="text-gray-500 text-sm">Sin comida planificada para el bebé</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => navigate(`/day/${dateStr}`)}
                >
                  Planificar
                </Button>
              </Card>
            )}
          </section>
        )}

        {/* Nota del día */}
        <section className="animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <StickyNote className="w-5 h-5 text-yellow-600" />
            <h2 className="font-semibold text-gray-700">Nota del día</h2>
          </div>
          <Card className="transition-all hover:shadow-md">
            {dayNote?.note ? (
              <p className="text-gray-700 whitespace-pre-wrap">{dayNote.note}</p>
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

        {/* Quick stats */}
        {meals && meals.length > 0 && (
          <section className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-0">
              <div className="flex items-center justify-around text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {meals.filter(m => m.origin === 'school').length}
                  </p>
                  <p className="text-xs text-gray-500">En cole</p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {meals.filter(m => m.origin !== 'school').length}
                  </p>
                  <p className="text-xs text-gray-500">En casa</p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div>
                  <p className="text-2xl font-bold text-gray-600">
                    {members?.filter(m => m.isActive).length || 0}
                  </p>
                  <p className="text-xs text-gray-500">Miembros</p>
                </div>
              </div>
            </Card>
          </section>
        )}
      </div>
    </div>
  )
}
