import { clsx } from 'clsx'
import type { ReactNode, CSSProperties } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  style?: CSSProperties
}

export default function Card({ children, className, onClick, style }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl shadow-sm border border-gray-100 p-4',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  )
}
