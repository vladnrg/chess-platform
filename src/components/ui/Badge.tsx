import { type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide',
  {
    variants: {
      variant: {
        default: 'bg-bg-elevated text-text-secondary',
        accent: 'bg-accent-dim text-accent',
        success: 'bg-[rgba(74,222,128,0.15)] text-success',
        danger: 'bg-[rgba(251,113,133,0.15)] text-danger',
        beginner: 'bg-[rgba(74,222,128,0.15)] text-success',
        intermediate: 'bg-[rgba(251,191,36,0.15)] text-warning',
        advanced: 'bg-[rgba(251,113,133,0.15)] text-danger',
        premium: 'bg-accent-dim text-accent border border-[rgba(226,179,64,0.3)]',
        /* Stări de progres — codate pe funcție */
        'in-progress': 'bg-active-dim text-active',
        completed: 'bg-[rgba(74,222,128,0.15)] text-success',
        challenge: 'bg-special-dim text-special',
        alert: 'bg-[rgba(251,113,133,0.15)] text-danger',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
