import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm text-gray-400">{label}</label>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-gray-800 border rounded-xl px-3 py-2.5 text-sm text-gray-100
            placeholder:text-gray-600 outline-none transition-colors
            ${error ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-brand-500'}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
