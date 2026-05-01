import { type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-[#2a2a2a] text-[#a0a0a0]',
        accent: 'bg-[rgba(200,168,75,0.15)] text-[#c8a84b]',
        success: 'bg-[rgba(74,222,128,0.15)] text-[#4ade80]',
        danger: 'bg-[rgba(248,113,113,0.15)] text-[#f87171]',
        beginner: 'bg-[rgba(74,222,128,0.15)] text-[#4ade80]',
        intermediate: 'bg-[rgba(251,191,36,0.15)] text-[#fbbf24]',
        advanced: 'bg-[rgba(248,113,113,0.15)] text-[#f87171]',
        premium: 'bg-[rgba(200,168,75,0.2)] text-[#c8a84b] border border-[rgba(200,168,75,0.3)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
