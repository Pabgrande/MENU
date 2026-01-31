import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, Image, Clipboard, Upload, Loader2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'

export default function ImportMenu() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'capture' | 'processing' | 'review'>('capture')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [schoolName, setSchoolName] = useState('')
  const [, setProcessing] = useState(false)

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePaste = async () => {
    try {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
          const blob = await item.getType(item.types.find(t => t.startsWith('image/'))!)
          const reader = new FileReader()
          reader.onload = (event) => {
            setSelectedImage(event.target?.result as string)
          }
          reader.readAsDataURL(blob)
          return
        }
      }
      alert('No hay imagen en el portapapeles')
    } catch (error) {
      console.error('Error al pegar:', error)
      alert('No se pudo acceder al portapapeles')
    }
  }

  const handleProcess = async () => {
    if (!selectedImage) return

    setProcessing(true)
    setStep('processing')

    // Simular procesamiento OCR
    setTimeout(() => {
      setProcessing(false)
      setStep('review')
    }, 3000)
  }

  const handleSave = () => {
    // TODO: Guardar menú procesado
    alert('Menú importado correctamente (simulado)')
    navigate('/calendar')
  }

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Importar menú escolar</h1>
        </div>
      </header>

      {/* Contenido */}
      <div className="page-content">
        {step === 'capture' && (
          <div className="space-y-6">
            {/* Captura de imagen */}
            <Card>
              <h2 className="font-semibold text-gray-700 mb-4">1. Captura del menú</h2>

              {selectedImage ? (
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Menú capturado"
                    className="w-full rounded-lg border"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer">
                    <Camera className="w-6 h-6 text-gray-400" />
                    <span className="text-gray-600">Hacer foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageCapture}
                      className="hidden"
                    />
                  </label>

                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer">
                    <Image className="w-6 h-6 text-gray-400" />
                    <span className="text-gray-600">Seleccionar imagen</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageCapture}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={handlePaste}
                    className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500"
                  >
                    <Clipboard className="w-6 h-6 text-gray-400" />
                    <span className="text-gray-600">Pegar desde portapapeles</span>
                  </button>
                </div>
              )}
            </Card>

            {/* Datos del menú */}
            <Card>
              <h2 className="font-semibold text-gray-700 mb-4">2. Datos del menú</h2>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {months.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                  </select>
                </div>
              </div>

              <Input
                label="Nombre del colegio (opcional)"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="CEIP San Juan"
              />
            </Card>

            {/* Botón procesar */}
            <Button
              variant="primary"
              fullWidth
              disabled={!selectedImage}
              onClick={handleProcess}
            >
              <Upload className="w-5 h-5 mr-2" />
              Procesar menú
            </Button>

            <p className="text-sm text-gray-500 text-center">
              La imagen se enviará a nuestro servicio de IA para extraer el menú.
              Este proceso puede tardar 10-30 segundos.
            </p>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Procesando menú...</h2>
            <p className="text-gray-500">Esto puede tardar 10-30 segundos</p>

            <div className="mt-8 text-left max-w-xs mx-auto space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <span>✓</span>
                <span>Imagen recibida</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <span>✓</span>
                <span>Detectando estructura</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extrayendo platos...</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span>○</span>
                <span>Normalizando ingredientes</span>
              </div>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-700">Menú detectado</h2>
                <span className="text-sm text-green-600 font-medium">87% confianza</span>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Revisa los datos extraídos y corrige si es necesario.
                Esta es una versión de demostración.
              </p>

              {/* Ejemplo de días detectados */}
              {[8, 9, 10].map(day => (
                <div key={day} className="border rounded-lg p-3 mb-3">
                  <p className="font-medium text-gray-700 mb-2">
                    {day} de {months[month - 1]}
                  </p>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">1º:</span> Crema de verduras</p>
                    <p><span className="text-gray-500">2º:</span> Pollo asado con patatas</p>
                    <p><span className="text-gray-500">Postre:</span> Fruta de temporada</p>
                  </div>
                </div>
              ))}
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => setStep('capture')}>
                Volver a capturar
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Guardar menú
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
