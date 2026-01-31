import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearAll: () => void
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: Toast = { ...toast, id }

    set((state) => ({ toasts: [...state.toasts, newToast] }))

    // Auto-remove after duration (default 4s)
    const duration = toast.duration ?? 4000
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, duration)
    }

    return id
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },

  clearAll: () => set({ toasts: [] }),
}))

// Helper functions for easy usage
export const toast = {
  success: (message: string, action?: Toast['action']) =>
    useToastStore.getState().addToast({ type: 'success', message, action }),

  error: (message: string, action?: Toast['action']) =>
    useToastStore.getState().addToast({ type: 'error', message, action, duration: 6000 }),

  warning: (message: string, action?: Toast['action']) =>
    useToastStore.getState().addToast({ type: 'warning', message, action }),

  info: (message: string, action?: Toast['action']) =>
    useToastStore.getState().addToast({ type: 'info', message, action }),
}
