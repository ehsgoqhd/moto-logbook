import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'orange' | 'green' | 'blue' | 'red' | 'gray'
  className?: string
}

const variants = {
  orange: 'bg-brand-500/20 text-brand-400',
  green: 'bg-green-500/20 text-green-400',
  blue: 'bg-blue-500/20 text-blue-400',
  red: 'bg-red-500/20 text-red-400',
  gray: 'bg-gray-700 text-gray-300',
}

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
