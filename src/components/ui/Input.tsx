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
          <label htmlFor={inputId} className="text-sm font-medium text-[#A0A0A0]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-11 w-full rounded-lg border border-[#2A2A2A] bg-[#141414] px-4 text-[#F0F0F0] placeholder-[#6B6B6B] text-sm',
            'focus:outline-none focus:border-[#E2B340] focus:ring-1 focus:ring-[#E2B340]',
            'transition-colors duration-150',
            error && 'border-[#FB7185] focus:border-[#FB7185] focus:ring-[#FB7185]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#FB7185]">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
