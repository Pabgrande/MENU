import { ReactNode } from 'react'
import {
  Calendar,
  Utensils,
  BookOpen,
  ShoppingCart,
  Camera,
  Users,
  Search,
  FileText
} from 'lucide-react'
import Button from './Button'

type EmptyStateType =
  | 'no-meals'
  | 'no-school-menu'
  | 'no-recipes'
  | 'no-shopping-items'
  | 'no-family-members'
  | 'no-search-results'
  | 'no-notes'
  | 'generic'

interface EmptyStateProps {
  type?: EmptyStateType
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  icon?: ReactNode
}

const presets: Record<EmptyStateType, {
  icon: ReactNode
  title: string
  description: string
}> = {
  'no-meals': {
    icon: <Utensils className="w-12 h-12" />,
    title: 'Sin comidas planificadas',
    description: 'Empieza a planificar las comidas de tu familia para este día',
  },
  'no-school-menu': {
    icon: <Camera className="w-12 h-12" />,
    title: 'Sin menú del cole',
    description: 'Importa el menú escolar para evitar duplicados en las cenas',
  },
  'no-recipes': {
    icon: <BookOpen className="w-12 h-12" />,
    title: 'Sin recetas',
    description: 'Añade tus recetas favoritas para usarlas en la planificación',
  },
  'no-shopping-items': {
    icon: <ShoppingCart className="w-12 h-12" />,
    title: 'Lista vacía',
    description: 'Genera una lista de compra desde tu menú planificado',
  },
  'no-family-members': {
    icon: <Users className="w-12 h-12" />,
    title: 'Sin miembros',
    description: 'Añade los miembros de tu familia para personalizar las comidas',
  },
  'no-search-results': {
    icon: <Search className="w-12 h-12" />,
    title: 'Sin resultados',
    description: 'Prueba con otros términos de búsqueda',
  },
  'no-notes': {
    icon: <FileText className="w-12 h-12" />,
    title: 'Sin notas',
    description: 'Añade notas para recordar cosas importantes',
  },
  'generic': {
    icon: <Calendar className="w-12 h-12" />,
    title: 'Nada por aquí',
    description: 'No hay datos para mostrar',
  },
}

export default function EmptyState({
  type = 'generic',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon,
}: EmptyStateProps) {
  const preset = presets[type]

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
      {/* Illustration / Icon */}
      <div className="mb-4 p-4 rounded-full bg-gray-100 text-gray-400">
        {icon || preset.icon}
      </div>

      {/* Text */}
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {title || preset.title}
      </h3>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        {description || preset.description}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2">
        {actionLabel && onAction && (
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button variant="secondary" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

// Quick preset components for common cases
export function NoMealsState({ onPlanify }: { onPlanify?: () => void }) {
  return (
    <EmptyState
      type="no-meals"
      actionLabel="Planificar comida"
      onAction={onPlanify}
    />
  )
}

export function NoSchoolMenuState({ onImport }: { onImport?: () => void }) {
  return (
    <EmptyState
      type="no-school-menu"
      actionLabel="Importar menú"
      onAction={onImport}
    />
  )
}

export function NoRecipesState({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      type="no-recipes"
      actionLabel="Añadir receta"
      onAction={onCreate}
    />
  )
}

export function NoSearchResultsState({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      type="no-search-results"
      actionLabel="Limpiar búsqueda"
      onAction={onClear}
    />
  )
}
