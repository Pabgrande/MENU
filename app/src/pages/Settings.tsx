import { useNavigate } from 'react-router-dom'
import { Users, AlertTriangle, Calendar, Settings as SettingsIcon, Database, Info, ChevronRight } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../services/db'
import Card from '../components/ui/Card'

export default function Settings() {
  const navigate = useNavigate()

  const members = useLiveQuery(() => db.familyMembers.toArray())
  const restrictions = useLiveQuery(() => db.restrictions.toArray())
  const patterns = useLiveQuery(() => db.weeklyPatterns.where('isActive').equals(1).toArray())
  const settings = useLiveQuery(() => db.settings.get('main'))

  const activeRestrictions = restrictions?.filter(r => r.isActive) || []
  const activePatterns = patterns || []

  const menuItems = [
    {
      title: 'Familia',
      items: [
        {
          icon: Users,
          label: 'Miembros de la familia',
          sublabel: `${members?.length || 0} miembros`,
          onClick: () => navigate('/settings/family'),
        },
        {
          icon: AlertTriangle,
          label: 'Restricciones alimentarias',
          sublabel: `${activeRestrictions.length} activas`,
          onClick: () => navigate('/settings/family'),
        },
      ],
    },
    {
      title: 'Reglas y patrones',
      items: [
        {
          icon: Calendar,
          label: 'Patrones semanales',
          sublabel: activePatterns.length > 0
            ? `${activePatterns.map(p => p.dishName).join(', ')}`
            : 'Sin patrones',
          onClick: () => alert('Patrones semanales: próximamente'),
        },
        {
          icon: SettingsIcon,
          label: 'Reglas fijas',
          sublabel: 'Pizza jueves',
          onClick: () => alert('Reglas fijas: próximamente'),
        },
      ],
    },
    {
      title: 'Preferencias',
      items: [
        {
          icon: SettingsIcon,
          label: 'Semana empieza en',
          sublabel: settings?.weekStartsOn === 0 ? 'Domingo' : 'Lunes',
          onClick: async () => {
            const newValue = settings?.weekStartsOn === 0 ? 1 : 0
            await db.settings.update('main', { weekStartsOn: newValue })
          },
        },
        {
          icon: Users,
          label: 'Raciones por defecto',
          sublabel: `${settings?.defaultServings || 4} personas`,
          onClick: () => alert('Configurar raciones: próximamente'),
        },
      ],
    },
    {
      title: 'Datos',
      items: [
        {
          icon: Database,
          label: 'Exportar datos',
          sublabel: 'Hacer copia de seguridad',
          onClick: async () => {
            // Exportar todos los datos
            const data = {
              familyMembers: await db.familyMembers.toArray(),
              restrictions: await db.restrictions.toArray(),
              recipes: await db.recipes.toArray(),
              ingredients: await db.ingredients.toArray(),
              mealSlots: await db.mealSlots.toArray(),
              weeklyPatterns: await db.weeklyPatterns.toArray(),
              settings: await db.settings.toArray(),
            }

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `menufamilia-backup-${new Date().toISOString().split('T')[0]}.json`
            a.click()
            URL.revokeObjectURL(url)
          },
        },
        {
          icon: Database,
          label: 'Borrar todos los datos',
          sublabel: 'Esta acción no se puede deshacer',
          danger: true,
          onClick: async () => {
            if (confirm('¿Estás seguro? Se borrarán TODOS los datos.')) {
              if (confirm('¿Realmente quieres borrar todo? Esta acción es irreversible.')) {
                await db.delete()
                window.location.reload()
              }
            }
          },
        },
      ],
    },
    {
      title: 'Sobre',
      items: [
        {
          icon: Info,
          label: 'MenúFamilia',
          sublabel: 'v1.0.0 - Hecho con cariño para familias',
          onClick: () => {},
        },
      ],
    },
  ]

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <h1 className="text-xl font-bold text-gray-900">Ajustes</h1>
      </header>

      {/* Contenido */}
      <div className="page-content space-y-6">
        {menuItems.map((section) => (
          <section key={section.title}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {section.title}
            </h2>
            <Card className="divide-y divide-gray-100 p-0 overflow-hidden">
              {section.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className={`w-full p-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors ${
                    (item as any).danger ? 'text-red-600' : ''
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${(item as any).danger ? 'text-red-500' : 'text-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.label}</p>
                    <p className={`text-sm ${(item as any).danger ? 'text-red-500' : 'text-gray-500'} truncate`}>
                      {item.sublabel}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </button>
              ))}
            </Card>
          </section>
        ))}
      </div>
    </div>
  )
}
