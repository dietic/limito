import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'accent' | 'ghost'
}

export default function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = variant === 'primary' ? 'btn-primary' : variant === 'accent' ? 'btn-accent' : 'px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100'
  return (
    <button className={`${base} ${className}`} {...props}>
      {children}
    </button>
  )
}

