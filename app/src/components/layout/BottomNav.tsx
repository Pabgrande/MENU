import { NavLink } from 'react-router-dom'
import { CalendarDays, ChefHat, Settings, Sun } from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { to: '/today', label: 'Hoy', icon: Sun },
  { to: '/calendar', label: 'Calendario', icon: CalendarDays },
  { to: '/recipes', label: 'Recetas', icon: ChefHat },
  { to: '/settings', label: 'Ajustes', icon: Settings },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center w-full h-full px-2 transition-colors',
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              )
            }
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs mt-1">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
