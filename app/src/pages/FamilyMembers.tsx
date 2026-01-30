import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../services/db'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import type { FamilyMember, Restriction } from '../types'

export default function FamilyMembers() {
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'adult' as 'adult' | 'child' | 'baby',
    birthDate: '',
    color: '#3B82F6',
  })

  const members = useLiveQuery(() => db.familyMembers.toArray())
  const restrictions = useLiveQuery(() => db.restrictions.toArray())

  const getMemberRestrictions = (memberId: number) =>
    restrictions?.filter(r => r.memberId === memberId && r.isActive) || []

  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      type: member.type,
      birthDate: member.birthDate || '',
      color: member.color || '#3B82F6',
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('El nombre es obligatorio')
      return
    }

    const now = new Date().toISOString()

    if (editingMember?.id) {
      await db.familyMembers.update(editingMember.id, {
        name: formData.name,
        type: formData.type,
        birthDate: formData.birthDate || undefined,
        color: formData.color,
        updatedAt: now,
      })
    } else {
      await db.familyMembers.add({
        name: formData.name,
        type: formData.type,
        birthDate: formData.birthDate || undefined,
        color: formData.color,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
    }

    setShowForm(false)
    setEditingMember(null)
    setFormData({ name: '', type: 'adult', birthDate: '', color: '#3B82F6' })
  }

  const handleDelete = async (member: FamilyMember) => {
    if (!member.id) return

    if (confirm(`¿Eliminar a ${member.name}?`)) {
      // Eliminar restricciones asociadas
      await db.restrictions.where('memberId').equals(member.id).delete()
      // Eliminar miembro
      await db.familyMembers.delete(member.id)
    }
  }

  const typeLabels = {
    adult: 'Adulto',
    child: 'Niño/a',
    baby: 'Bebé',
  }

  const typeColors = {
    adult: 'bg-blue-100 text-blue-800',
    child: 'bg-green-100 text-green-800',
    baby: 'bg-purple-100 text-purple-800',
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Miembros de la familia</h1>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingMember(null)
              setFormData({ name: '', type: 'adult', birthDate: '', color: '#3B82F6' })
              setShowForm(true)
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Añadir
          </Button>
        </div>
      </header>

      {/* Contenido */}
      <div className="page-content space-y-4">
        {members?.map(member => {
          const memberRestrictions = getMemberRestrictions(member.id!)

          return (
            <Card key={member.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: member.color || '#3B82F6' }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{member.name}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[member.type]}`}>
                      {typeLabels[member.type]}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(member)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(member)}
                    className="p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {memberRestrictions.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Restricciones
                  </p>
                  <div className="space-y-1">
                    {memberRestrictions.map(r => (
                      <p key={r.id} className="text-sm text-gray-500">
                        • {r.description || r.condition?.ingredient}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )
        })}

        {(!members || members.length === 0) && (
          <Card className="text-center py-8">
            <p className="text-gray-500">No hay miembros de la familia</p>
          </Card>
        )}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-4">
            <h3 className="font-semibold text-lg mb-4">
              {editingMember ? 'Editar miembro' : 'Nuevo miembro'}
            </h3>

            <div className="space-y-4">
              <Input
                label="Nombre"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="adult">Adulto</option>
                  <option value="child">Niño/a</option>
                  <option value="baby">Bebé</option>
                </select>
              </div>

              <Input
                label="Fecha de nacimiento (opcional)"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    setShowForm(false)
                    setEditingMember(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button variant="primary" fullWidth onClick={handleSave}>
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
