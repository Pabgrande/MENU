import { useState } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { Toast as ToastType, useToastStore } from '../../stores/toast.store'
import { clsx } from 'clsx'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const styles = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-500',
    text: 'text-green-800',
    action: 'text-green-700 hover:text-green-900',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-500',
    text: 'text-red-800',
    action: 'text-red-700 hover:text-red-900',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-500',
    text: 'text-amber-800',
    action: 'text-amber-700 hover:text-amber-900',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-500',
    text: 'text-blue-800',
    action: 'text-blue-700 hover:text-blue-900',
  },
}

function ToastItem({ toast }: { toast: ToastType }) {
  const [isExiting, setIsExiting] = useState(false)
  const removeToast = useToastStore((state) => state.removeToast)

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => removeToast(toast.id), 200)
  }

  const Icon = icons[toast.type]
  const style = styles[toast.type]

  return (
    <div
      className={clsx(
        'flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg',
        'transform transition-all duration-200 ease-out',
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100',
        style.bg,
        style.border
      )}
      role="alert"
    >
      <Icon className={clsx('w-5 h-5 flex-shrink-0 mt-0.5', style.icon)} />

      <div className="flex-1 min-w-0">
        <p className={clsx('text-sm font-medium', style.text)}>
          {toast.message}
        </p>

        {toast.action && (
          <button
            onClick={() => {
              toast.action!.onClick()
              handleClose()
            }}
            className={clsx(
              'mt-1 text-sm font-medium underline',
              style.action
            )}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={handleClose}
        className={clsx(
          'flex-shrink-0 p-1 rounded-lg transition-colors',
          'hover:bg-black/5'
        )}
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts)

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-20 right-4 left-4 sm:left-auto sm:w-96 z-50 flex flex-col gap-2"
      aria-live="polite"
      aria-label="Notificaciones"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
