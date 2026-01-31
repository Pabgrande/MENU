import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Star, Trash2, Clock, Users } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../services/db'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import type { Recipe, DishCategory, ProteinType, RecipeTag } from '../types'

const CATEGORIES: DishCategory[] = [
  'pasta', 'arroz', 'legumbres', 'verdura', 'ensalada',
  'sopa', 'guiso', 'fritura', 'plancha', 'horno',
  'huevo', 'carne', 'pescado'
]

const PROTEINS: ProteinType[] = [
  'pollo', 'cerdo', 'ternera', 'cordero',
  'pescado_blanco', 'pescado_azul', 'marisco',
  'huevo', 'legumbres', 'tofu', 'none'
]

const TAGS: RecipeTag[] = [
  'contiene_huevo_directo', 'contiene_huevo_horneado', 'fruta_con_piel',
  'apto_bebe', 'sin_gluten', 'sin_lactosa', 'vegetariano', 'vegano',
  'rapido', 'batch_cooking', 'congelable'
]

export default function RecipeDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isNew = id === 'new' || !id

  const existingRecipe = useLiveQuery(
    () => (id && id !== 'new' ? db.recipes.get(Number(id)) : undefined),
    [id]
  )

  const [form, setForm] = useState<Partial<Recipe>>({
    name: '',
    categories: [],
    mainProtein: 'none',
    tags: [],
    isPlateUnico: false,
    prepTime: undefined,
    cookTime: undefined,
    servings: 4,
    instructions: '',
    isFavorite: false,
    timesUsed: 0,
    isFixedRule: false,
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (existingRecipe) {
      setForm(existingRecipe)
    }
  }, [existingRecipe])

  const handleChange = (field: keyof Recipe, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const toggleCategory = (cat: DishCategory) => {
    const current = form.categories || []
    const updated = current.includes(cat)
      ? current.filter(c => c !== cat)
      : [...current, cat]
    handleChange('categories', updated)
  }

  const toggleTag = (tag: RecipeTag) => {
    const current = form.tags || []
    const updated = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag]
    handleChange('tags', updated)
  }

  const handleSave = async () => {
    if (!form.name?.trim()) {
      alert('El nombre es obligatorio')
      return
    }

    setLoading(true)
    try {
      const now = new Date().toISOString()
      const recipeData: Recipe = {
        ...form,
        name: form.name!,
        normalizedName: form.name!.toLowerCase().replace(/\s+/g, '_'),
        categories: form.categories || [],
        mainProtein: form.mainProtein || 'none',
        tags: form.tags || [],
        isPlateUnico: form.isPlateUnico || false,
        isFavorite: form.isFavorite || false,
        timesUsed: form.timesUsed || 0,
        isFixedRule: form.isFixedRule || false,
        createdAt: isNew ? now : existingRecipe?.createdAt || now,
        updatedAt: now,
      }

      if (isNew) {
        await db.recipes.add(recipeData)
      } else if (id) {
        await db.recipes.put({ ...recipeData, id: Number(id) })
      }

      navigate('/recipes')
    } catch (error) {
      console.error('Error al guardar receta:', error)
      alert('Error al guardar la receta')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!id || isNew) return

    if (confirm('¿Eliminar esta receta?')) {
      await db.recipes.delete(Number(id))
      navigate('/recipes')
    }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/recipes')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {isNew ? 'Nueva receta' : 'Editar receta'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {!isNew && (
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => handleChange('isFavorite', !form.isFavorite)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Star
                className={`w-5 h-5 ${
                  form.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Formulario */}
      <div className="page-content space-y-6">
        {/* Nombre */}
        <Input
          label="Nombre de la receta"
          value={form.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Ej: Tortilla de patatas"
        />

        {/* Categorías */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categorías
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  form.categories?.includes(cat)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Proteína principal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proteína principal
          </label>
          <select
            value={form.mainProtein || 'none'}
            onChange={(e) => handleChange('mainProtein', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PROTEINS.map((protein) => (
              <option key={protein} value={protein}>
                {protein === 'none' ? 'Sin proteína' : protein.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Tiempos */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="w-4 h-4 inline mr-1" />
              Prep (min)
            </label>
            <input
              type="number"
              value={form.prepTime || ''}
              onChange={(e) => handleChange('prepTime', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="15"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cocción
            </label>
            <input
              type="number"
              value={form.cookTime || ''}
              onChange={(e) => handleChange('cookTime', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Users className="w-4 h-4 inline mr-1" />
              Raciones
            </label>
            <input
              type="number"
              value={form.servings || ''}
              onChange={(e) => handleChange('servings', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="4"
            />
          </div>
        </div>

        {/* Plato único */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isPlateUnico || false}
            onChange={(e) => handleChange('isPlateUnico', e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-700">Es plato único (completo)</span>
        </label>

        {/* Tags especiales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags especiales (restricciones)
          </label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  form.tags?.includes(tag)
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Instrucciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instrucciones (opcional)
          </label>
          <textarea
            value={form.instructions || ''}
            onChange={(e) => handleChange('instructions', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1. Pelar las patatas...&#10;2. Batir los huevos..."
          />
        </div>

        {/* Botón guardar */}
        <div className="pt-4 pb-8">
          <Button
            variant="primary"
            fullWidth
            onClick={handleSave}
            loading={loading}
          >
            {isNew ? 'Crear receta' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  )
}
