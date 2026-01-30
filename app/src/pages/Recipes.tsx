import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Star, Clock, ChefHat, X } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../services/db'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Chip from '../components/ui/Chip'
import { SkeletonCard } from '../components/ui/Skeleton'
import EmptyState, { NoRecipesState, NoSearchResultsState } from '../components/ui/EmptyState'
import { useDebounce } from '../hooks/useDebounce'
import { toast } from '../stores/toast.store'
import type { Recipe, DishCategory } from '../types'

const CATEGORY_FILTERS: { label: string; value: DishCategory | 'all' | 'favorites' | 'quick' }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Favoritas', value: 'favorites' },
  { label: 'Rápidas', value: 'quick' },
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

  // Debounce search for performance
  const debouncedSearch = useDebounce(searchQuery, 300)

  const recipes = useLiveQuery(() => db.recipes.toArray())
  const isLoading = recipes === undefined

  // Memoized filtered recipes
  const filteredRecipes = useMemo(() => {
    if (!recipes) return []

    return recipes.filter((recipe) => {
      // Filter by search (debounced)
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase()
        const nameMatch = recipe.name.toLowerCase().includes(query)
        const categoryMatch = recipe.categories.some(c => c.toLowerCase().includes(query))
        if (!nameMatch && !categoryMatch) return false
      }

      // Filter by category
      switch (activeFilter) {
        case 'all':
          return true
        case 'favorites':
          return recipe.isFavorite
        case 'quick':
          const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)
          return totalTime > 0 && totalTime <= 30
        default:
          return recipe.categories.includes(activeFilter as DishCategory)
      }
    })
  }, [recipes, debouncedSearch, activeFilter])

  // Separate favorites
  const favoriteRecipes = useMemo(() =>
    filteredRecipes.filter(r => r.isFavorite),
    [filteredRecipes]
  )

  const otherRecipes = useMemo(() =>
    filteredRecipes.filter(r => !r.isFavorite),
    [filteredRecipes]
  )

  const handleRecipeClick = useCallback((recipe: Recipe) => {
    navigate(`/recipes/${recipe.id}`)
  }, [navigate])

  const toggleFavorite = useCallback(async (e: React.MouseEvent, recipe: Recipe) => {
    e.stopPropagation()
    if (recipe.id) {
      const newFavorite = !recipe.isFavorite
      await db.recipes.update(recipe.id, {
        isFavorite: newFavorite,
        updatedAt: new Date().toISOString(),
      })
      toast.success(newFavorite ? 'Añadida a favoritas' : 'Eliminada de favoritas')
    }
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

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
            className="touch-feedback"
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
            placeholder="Buscar receta o ingrediente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {CATEGORY_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all touch-feedback ${
                activeFilter === filter.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
              {filter.value === 'favorites' && favoriteRecipes.length > 0 && (
                <span className="ml-1 opacity-75">({favoriteRecipes.length})</span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Contenido */}
      <div className="page-content">
        {/* Loading state */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* Favoritas (solo si no estamos filtrando por favoritas) */}
            {activeFilter !== 'favorites' && favoriteRecipes.length > 0 && !debouncedSearch && (
              <section className="mb-6 animate-fade-in">
                <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Favoritas
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {favoriteRecipes.slice(0, 6).map((recipe, index) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onClick={() => handleRecipeClick(recipe)}
                      onToggleFavorite={(e) => toggleFavorite(e, recipe)}
                      compact
                      style={{ animationDelay: `${index * 50}ms` }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Lista de recetas */}
            <section>
              <h2 className="font-semibold text-gray-700 mb-3 flex items-center justify-between">
                <span>
                  {activeFilter === 'favorites' ? 'Favoritas' :
                   activeFilter === 'quick' ? 'Rápidas (≤30 min)' :
                   activeFilter === 'all' ? 'Todas las recetas' :
                   activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
                </span>
                <span className="text-sm font-normal text-gray-400">
                  {filteredRecipes.length} receta{filteredRecipes.length !== 1 ? 's' : ''}
                </span>
              </h2>

              {filteredRecipes.length === 0 ? (
                debouncedSearch ? (
                  <NoSearchResultsState onClear={clearSearch} />
                ) : activeFilter === 'favorites' ? (
                  <EmptyState
                    type="no-recipes"
                    title="Sin favoritas"
                    description="Marca recetas como favoritas para acceder rápidamente"
                  />
                ) : (
                  <NoRecipesState onCreate={() => navigate('/recipes/new')} />
                )
              ) : (
                <div className="space-y-3">
                  {(activeFilter === 'favorites' ? favoriteRecipes : otherRecipes).map((recipe, index) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onClick={() => handleRecipeClick(recipe)}
                      onToggleFavorite={(e) => toggleFavorite(e, recipe)}
                      style={{ animationDelay: `${index * 30}ms` }}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
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
  style?: React.CSSProperties
}

function RecipeCard({ recipe, onClick, onToggleFavorite, compact, style }: RecipeCardProps) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)

  if (compact) {
    return (
      <Card
        onClick={onClick}
        className="p-3 text-center relative touch-feedback animate-slide-up"
        style={style}
      >
        <button
          onClick={onToggleFavorite}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
        >
          <Star
            className={`w-4 h-4 transition-colors ${
              recipe.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
            }`}
          />
        </button>
        <p className="font-medium text-sm text-gray-900 truncate pr-4">
          {recipe.name}
        </p>
        {totalTime > 0 && (
          <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            {totalTime} min
          </p>
        )}
      </Card>
    )
  }

  return (
    <Card
      onClick={onClick}
      className="touch-feedback animate-slide-up hover:shadow-md transition-shadow"
      style={style}
    >
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
            {recipe.tags.includes('rapido') && (
              <Chip label="Rápido" />
            )}
          </div>

          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            {totalTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {totalTime} min
              </span>
            )}
            {recipe.timesUsed > 0 && (
              <span className="text-gray-400">Usado {recipe.timesUsed}x</span>
            )}
          </div>
        </div>

        <button
          onClick={onToggleFavorite}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              recipe.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 hover:text-gray-400'
            }`}
          />
        </button>
      </div>
    </Card>
  )
}
