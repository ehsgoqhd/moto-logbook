import { forwardRef, SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && <label className="text-sm text-gray-400">{label}</label>}
        <select
          ref={ref}
          className={`
            w-full bg-gray-800 border rounded-xl px-3 py-2.5 text-sm text-gray-100
            outline-none transition-colors appearance-none
            ${error ? 'border-red-500' : 'border-gray-700 focus:border-brand-500'}
            ${className}
          `}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
