import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Star, Clock, ChefHat } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../services/db'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Chip from '../components/ui/Chip'
import Input from '../components/ui/Input'
import type { Recipe, DishCategory } from '../types'

const CATEGORY_FILTERS: { label: string; value: DishCategory | 'all' | 'favorites' }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Favoritas', value: 'favorites' },
  { label: 'Carne', value: 'carne' },
  { label: 'Pescado', value: 'pescado' },
  { label: 'Pasta', value: 'pasta' },
  { label: 'Arroz', value: 'arroz' },
  { label: 'Legumbres', value: 'legumbres' },
  { label: 'Verdura', value: 'verdura' },
]

export default function Recipes() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const recipes = useLiveQuery(() => db.recipes.toArray())

  const filteredRecipes = recipes?.filter((recipe) => {
    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!recipe.name.toLowerCase().includes(query)) {
        return false
      }
    }

    // Filtrar por categoría
    if (activeFilter === 'all') return true
    if (activeFilter === 'favorites') return recipe.isFavorite
    return recipe.categories.includes(activeFilter as DishCategory)
  }) || []

  // Separar favoritas
  const favoriteRecipes = filteredRecipes.filter(r => r.isFavorite)
  const otherRecipes = filteredRecipes.filter(r => !r.isFavorite)

  const handleRecipeClick = (recipe: Recipe) => {
    navigate(`/recipes/${recipe.id}`)
  }

  const toggleFavorite = async (e: React.MouseEvent, recipe: Recipe) => {
    e.stopPropagation()
    if (recipe.id) {
      await db.recipes.update(recipe.id, {
        isFavorite: !recipe.isFavorite,
        updatedAt: new Date().toISOString(),
      })
    }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Recetas</h1>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/recipes/new')}
          >
            <Plus className="w-4 h-4 mr-1" />
            Nueva
          </Button>
        </div>

        {/* Búsqueda */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar receta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filtros */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {CATEGORY_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </header>

      {/* Contenido */}
      <div className="page-content">
        {/* Favoritas */}
        {activeFilter !== 'favorites' && favoriteRecipes.length > 0 && (
          <section className="mb-6">
            <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Favoritas
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {favoriteRecipes.slice(0, 6).map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => handleRecipeClick(recipe)}
                  onToggleFavorite={(e) => toggleFavorite(e, recipe)}
                  compact
                />
              ))}
            </div>
          </section>
        )}

        {/* Lista de recetas */}
        <section>
          {activeFilter === 'favorites' ? (
            <h2 className="font-semibold text-gray-700 mb-3">
              Favoritas ({favoriteRecipes.length})
            </h2>
          ) : (
            <h2 className="font-semibold text-gray-700 mb-3">
              {activeFilter === 'all' ? 'Todas' : activeFilter} ({filteredRecipes.length})
            </h2>
          )}

          {filteredRecipes.length === 0 ? (
            <Card className="text-center py-8">
              <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay recetas</p>
              <Button
                variant="primary"
                size="sm"
                className="mt-3"
                onClick={() => navigate('/recipes/new')}
              >
                Crear primera receta
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {(activeFilter === 'favorites' ? favoriteRecipes : otherRecipes).map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => handleRecipeClick(recipe)}
                  onToggleFavorite={(e) => toggleFavorite(e, recipe)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

// Componente de tarjeta de receta
interface RecipeCardProps {
  recipe: Recipe
  onClick: () => void
  onToggleFavorite: (e: React.MouseEvent) => void
  compact?: boolean
}

function RecipeCard({ recipe, onClick, onToggleFavorite, compact }: RecipeCardProps) {
  if (compact) {
    return (
      <Card onClick={onClick} className="p-3 text-center relative">
        <button
          onClick={onToggleFavorite}
          className="absolute top-2 right-2"
        >
          <Star
            className={`w-4 h-4 ${
              recipe.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
            }`}
          />
        </button>
        <p className="font-medium text-sm text-gray-900 truncate pr-4">
          {recipe.name}
        </p>
        {recipe.prepTime && (
          <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
          </p>
        )}
      </Card>
    )
  }

  return (
    <Card onClick={onClick}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900">{recipe.name}</h3>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {recipe.mainProtein && recipe.mainProtein !== 'none' && (
              <Chip
                label={recipe.mainProtein.replace('_', ' ')}
                variant="protein"
                type={recipe.mainProtein}
              />
            )}
            {recipe.categories.slice(0, 2).map((cat) => (
              <Chip key={cat} label={cat} variant="category" type={cat} />
            ))}
            {recipe.isPlateUnico && (
              <Chip label="Plato único" />
            )}
          </div>

          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            {recipe.prepTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
              </span>
            )}
            {recipe.timesUsed > 0 && (
              <span>Usado {recipe.timesUsed}x</span>
            )}
          </div>
        </div>

        <button onClick={onToggleFavorite} className="p-1">
          <Star
            className={`w-5 h-5 ${
              recipe.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
            }`}
          />
        </button>
      </div>
    </Card>
  )
}
