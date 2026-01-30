import { ChevronRight, Check, AlertTriangle } from 'lucide-react'
import Card from '../ui/Card'
import Chip from '../ui/Chip'
import type { MealSlot, DishCategory, ProteinType } from '../../types'

interface MealCardProps {
  meal: MealSlot
  showOrigin?: boolean
  showMembers?: boolean
  memberNames?: Record<number, string>
  alerts?: { message: string; severity: 'warning' | 'info' }[]
  onEdit?: () => void
  onMarkDone?: () => void
}

const originLabels: Record<string, string> = {
  school: 'Cole',
  fixed_rule: 'Regla fija',
  weekly_pattern: 'Patrón',
  generated: 'Sugerido',
  manual: 'Manual',
}

export default function MealCard({
  meal,
  showOrigin = true,
  showMembers = true,
  memberNames = {},
  alerts = [],
  onEdit,
  onMarkDone,
}: MealCardProps) {
  const categories = meal.dishDetails?.categories || []
  const mainProtein = meal.dishDetails?.mainProtein

  return (
    <Card className="relative" onClick={onEdit}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">
            {meal.dishName}
          </h3>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {mainProtein && mainProtein !== 'none' && (
              <Chip
                label={mainProtein.replace('_', ' ').toUpperCase()}
                variant="protein"
                type={mainProtein as ProteinType}
              />
            )}
            {categories.slice(0, 2).map((cat) => (
              <Chip
                key={cat}
                label={cat.toUpperCase()}
                variant="category"
                type={cat as DishCategory}
              />
            ))}
          </div>

          {showMembers && meal.forMembers.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Para: {meal.forMembers.map(id => memberNames[id] || `#${id}`).join(', ')}
            </p>
          )}

          {alerts.length > 0 && (
            <div className="mt-2 space-y-1">
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 text-sm ${
                    alert.severity === 'warning' ? 'text-amber-600' : 'text-blue-600'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{alert.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onMarkDone && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMarkDone()
              }}
              className="p-2 rounded-full hover:bg-green-100 text-green-600 transition-colors"
              title="Marcar como comido"
            >
              <Check className="w-5 h-5" />
            </button>
          )}
          {onEdit && (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {showOrigin && (
        <div className="absolute top-2 right-2">
          <span className="text-xs text-gray-400">
            {originLabels[meal.origin] || meal.origin}
          </span>
        </div>
      )}
    </Card>
  )
}
