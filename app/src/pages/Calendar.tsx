import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Camera, Wand2, CheckSquare, ShoppingCart } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../services/db'
import Button from '../components/ui/Button'
import { clsx } from 'clsx'

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export default function Calendar() {
  const navigate = useNavigate()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedDates, setSelectedDates] = useState<string[]>([])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Obtener comidas del mes
  const meals = useLiveQuery(
    () => {
      const startStr = format(monthStart, 'yyyy-MM-dd')
      const endStr = format(monthEnd, 'yyyy-MM-dd')
      return db.mealSlots
        .where('date')
        .between(startStr, endStr, true, true)
        .toArray()
    },
    [format(monthStart, 'yyyy-MM')]
  )

  // Agrupar comidas por fecha
  const mealsByDate = meals?.reduce((acc, meal) => {
    if (!acc[meal.date]) acc[meal.date] = []
    acc[meal.date].push(meal)
    return acc
  }, {} as Record<string, typeof meals>) || {}

  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const goToCurrentMonth = () => setCurrentMonth(new Date())

  const handleDayClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')

    if (selectionMode) {
      setSelectedDates(prev =>
        prev.includes(dateStr)
          ? prev.filter(d => d !== dateStr)
          : [...prev, dateStr]
      )
    } else {
      navigate(`/day/${dateStr}`)
    }
  }

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode)
    setSelectedDates([])
  }

  // Calcular días vacíos al inicio para alinear con lunes
  const firstDayOfMonth = getDay(monthStart)
  // Ajustar para que lunes sea 0
  const emptyDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const getDayStatus = (date: Date): 'planned' | 'partial' | 'empty' | 'weekend' => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayMeals = mealsByDate[dateStr] || []
    const dayOfWeek = getDay(date)
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    if (isWeekend) return 'weekend'
    if (dayMeals.length >= 2) return 'planned'
    if (dayMeals.length === 1) return 'partial'
    return 'empty'
  }

  const statusColors = {
    planned: 'bg-green-500',
    partial: 'bg-orange-400',
    empty: 'bg-gray-200',
    weekend: 'bg-blue-400',
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={goToPrevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 min-w-[180px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h1>
            <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={goToCurrentMonth}
            className="text-sm text-blue-600 hover:underline"
          >
            Hoy
          </button>
        </div>
      </header>

      {/* Calendario */}
      <div className="page-content">
        {/* Cabecera días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-1">
          {/* Días vacíos */}
          {Array.from({ length: emptyDays }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Días del mes */}
          {days.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd')
            const isToday = isSameDay(date, new Date())
            const status = getDayStatus(date)
            const isSelected = selectedDates.includes(dateStr)
            const dayOfWeek = getDay(date)
            const isThursday = dayOfWeek === 4
            const dayMeals = mealsByDate[dateStr] || []
            const hasPizza = dayMeals.some(m => m.origin === 'fixed_rule')

            return (
              <button
                key={dateStr}
                onClick={() => handleDayClick(date)}
                className={clsx(
                  'aspect-square rounded-lg flex flex-col items-center justify-center p-1 transition-all',
                  'hover:ring-2 hover:ring-blue-300',
                  isToday && 'ring-2 ring-blue-500',
                  isSelected && 'ring-2 ring-green-500 bg-green-50',
                  !isToday && !isSelected && 'hover:bg-gray-50'
                )}
              >
                <span
                  className={clsx(
                    'text-sm font-medium',
                    isToday ? 'text-blue-600' : 'text-gray-700'
                  )}
                >
                  {format(date, 'd')}
                </span>
                <div className="mt-1">
                  {hasPizza ? (
                    <span className="text-base">🍕</span>
                  ) : (
                    <div
                      className={clsx(
                        'w-2 h-2 rounded-full',
                        statusColors[status]
                      )}
                    />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Planificado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-400" />
            <span>Parcial</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Fin de semana</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm">🍕</span>
            <span>Regla fija</span>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="mt-6 space-y-3">
          <h3 className="font-medium text-gray-700">Acciones rápidas</h3>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate('/import-menu')}
              className="flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              <span>Importar menú</span>
            </Button>

            <Button
              variant="primary"
              onClick={() => {
                // TODO: Implementar generación
                alert('Generación de menú: próximamente')
              }}
              className="flex items-center justify-center gap-2"
            >
              <Wand2 className="w-5 h-5" />
              <span>Generar mes</span>
            </Button>

            <Button
              variant={selectionMode ? 'primary' : 'secondary'}
              onClick={toggleSelectionMode}
              className="flex items-center justify-center gap-2"
            >
              <CheckSquare className="w-5 h-5" />
              <span>{selectionMode ? `${selectedDates.length} días` : 'Selección múltiple'}</span>
            </Button>

            <Button
              variant="secondary"
              onClick={() => navigate('/shopping')}
              className="flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Lista compra</span>
            </Button>
          </div>
        </div>

        {/* Acciones de selección múltiple */}
        {selectionMode && selectedDates.length > 0 && (
          <div className="fixed bottom-20 left-4 right-4 bg-white rounded-xl shadow-lg border p-4 z-40">
            <p className="text-sm text-gray-600 mb-3">
              {selectedDates.length} días seleccionados
            </p>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => {
                  // TODO: Implementar cambio masivo
                  alert('Cambiar cena de días seleccionados')
                }}
              >
                Cambiar cena
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectionMode(false)
                  setSelectedDates([])
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
