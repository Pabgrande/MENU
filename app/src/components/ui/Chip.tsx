import { clsx } from 'clsx'
import type { DishCategory, ProteinType } from '../../types'

interface ChipProps {
  label: string
  variant?: 'default' | 'protein' | 'category'
  type?: DishCategory | ProteinType
  size?: 'sm' | 'md'
}

const proteinColors: Record<string, string> = {
  pollo: 'bg-chip-pollo text-amber-800',
  cerdo: 'bg-chip-cerdo text-red-800',
  ternera: 'bg-chip-ternera text-orange-800',
  cordero: 'bg-chip-ternera text-orange-800',
  pescado_blanco: 'bg-chip-pescado text-blue-800',
  pescado_azul: 'bg-chip-pescado text-blue-800',
  marisco: 'bg-chip-pescado text-blue-800',
  huevo: 'bg-chip-huevo text-yellow-800',
  legumbres: 'bg-chip-legumbres text-lime-800',
  tofu: 'bg-chip-verdura text-green-800',
  none: 'bg-gray-100 text-gray-600',
}

const categoryColors: Record<string, string> = {
  pasta: 'bg-chip-pasta text-orange-800',
  arroz: 'bg-chip-arroz text-yellow-800',
  verdura: 'bg-chip-verdura text-green-800',
  ensalada: 'bg-chip-verdura text-green-800',
  fritura: 'bg-chip-fritura text-red-800',
  horno: 'bg-orange-100 text-orange-800',
  plancha: 'bg-gray-100 text-gray-700',
  guiso: 'bg-amber-100 text-amber-800',
  sopa: 'bg-yellow-100 text-yellow-800',
  legumbres: 'bg-chip-legumbres text-lime-800',
  huevo: 'bg-chip-huevo text-yellow-800',
  carne: 'bg-chip-cerdo text-red-800',
  pescado: 'bg-chip-pescado text-blue-800',
  pure: 'bg-green-100 text-green-800',
  papilla: 'bg-yellow-100 text-yellow-800',
  blw: 'bg-purple-100 text-purple-800',
}

export default function Chip({ label, variant = 'default', type, size = 'sm' }: ChipProps) {
  let colorClass = 'bg-gray-100 text-gray-700'

  if (variant === 'protein' && type) {
    colorClass = proteinColors[type] || colorClass
  } else if (variant === 'category' && type) {
    colorClass = categoryColors[type] || colorClass
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium',
        colorClass,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      {label}
    </span>
  )
}
