import { useRef, useEffect, useCallback } from 'react'

interface SwipeConfig {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  preventScroll?: boolean
}

interface TouchState {
  startX: number
  startY: number
  startTime: number
}

export function useSwipeGesture<T extends HTMLElement = HTMLElement>(
  config: SwipeConfig
) {
  const elementRef = useRef<T>(null)
  const touchState = useRef<TouchState | null>(null)

  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventScroll = false,
  } = config

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (preventScroll && touchState.current) {
        const touch = e.touches[0]
        const deltaX = Math.abs(touch.clientX - touchState.current.startX)
        const deltaY = Math.abs(touch.clientY - touchState.current.startY)

        // If horizontal swipe is dominant, prevent vertical scroll
        if (deltaX > deltaY && deltaX > 10) {
          e.preventDefault()
        }
      }
    },
    [preventScroll]
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!touchState.current) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchState.current.startX
      const deltaY = touch.clientY - touchState.current.startY
      const deltaTime = Date.now() - touchState.current.startTime

      // Must be quick gesture (< 300ms) for swipe
      const isQuickGesture = deltaTime < 300
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      // Determine if it's a horizontal or vertical swipe
      if (absX > absY && absX > threshold) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      } else if (absY > absX && absY > threshold && isQuickGesture) {
        // Vertical swipe (only for quick gestures to avoid conflict with scroll)
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown()
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp()
        }
      }

      touchState.current = null
    },
    [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]
  )

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventScroll])

  return elementRef
}

// Hook for swipe navigation between dates
export function useDateSwipe(
  onPrev: () => void,
  onNext: () => void,
  threshold = 50
) {
  return useSwipeGesture({
    onSwipeLeft: onNext,
    onSwipeRight: onPrev,
    threshold,
    preventScroll: true,
  })
}
