import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#a0a0a0]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-11 w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 text-[#f0f0f0] placeholder-[#666] text-sm',
            'focus:outline-none focus:border-[#c8a84b] focus:ring-1 focus:ring-[#c8a84b]',
            'transition-colors duration-150',
            error && 'border-[#f87171] focus:border-[#f87171] focus:ring-[#f87171]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#f87171]">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
