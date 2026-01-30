import { clsx } from 'clsx'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200'

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
    none: '',
  }

  const style: React.CSSProperties = {
    width: width,
    height: variant === 'text' && !height ? '1em' : height,
  }

  return (
    <div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
      role="status"
      aria-label="Cargando..."
    />
  )
}

// Skeleton presets for common UI patterns
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton width="70%" height={20} variant="rounded" />
          <div className="flex gap-2">
            <Skeleton width={60} height={24} variant="rounded" />
            <Skeleton width={60} height={24} variant="rounded" />
          </div>
        </div>
        <Skeleton width={40} height={40} variant="circular" />
      </div>
      <Skeleton width="50%" height={16} variant="rounded" />
    </div>
  )
}

export function SkeletonMealCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton width="80%" height={20} variant="rounded" />
          <div className="flex gap-1.5">
            <Skeleton width={70} height={22} variant="rounded" />
            <Skeleton width={50} height={22} variant="rounded" />
          </div>
          <Skeleton width="60%" height={14} variant="rounded" />
        </div>
        <Skeleton width={36} height={36} variant="circular" />
      </div>
    </div>
  )
}

export function SkeletonCalendarDay() {
  return (
    <div className="aspect-square rounded-lg bg-gray-100 animate-pulse flex flex-col items-center justify-center p-1">
      <Skeleton width={20} height={16} variant="rounded" animation="none" />
      <div className="mt-1">
        <Skeleton width={8} height={8} variant="circular" animation="none" />
      </div>
    </div>
  )
}

export function SkeletonRecipeList() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonTodayView() {
  return (
    <div className="space-y-6 p-4">
      {/* Header skeleton */}
      <div className="space-y-3">
        <Skeleton width={100} height={24} variant="rounded" />
        <div className="flex items-center justify-between">
          <Skeleton width={40} height={40} variant="circular" />
          <Skeleton width="60%" height={24} variant="rounded" />
          <Skeleton width={40} height={40} variant="circular" />
        </div>
      </div>

      {/* Section skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton width={20} height={20} variant="circular" />
            <Skeleton width={100} height={18} variant="rounded" />
          </div>
          <SkeletonMealCard />
        </div>
      ))}
    </div>
  )
}
