import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 text-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-40 cursor-pointer',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-[#0A0A0A] hover:bg-accent-hover hover:shadow-glow-gold active:scale-[0.98]',
        active: 'bg-active text-[#0A0A0A] hover:brightness-110 hover:shadow-glow-teal active:scale-[0.98]',
        secondary: 'bg-bg-elevated text-text-primary border border-border hover:bg-bg-hover hover:border-border-strong',
        ghost: 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
        danger: 'bg-danger text-[#0A0A0A] hover:brightness-110',
        outline: 'border border-accent text-accent hover:bg-accent-dim',
      },
      // `min-h`, nu `h`: cu înălţime fixă, o etichetă care se rupe pe două
      // rânduri ieşea din casetă pe telefon („Fă prima mutare"). Am încercat
      // întâi `whitespace-nowrap`, dar aia mută problema în depăşire pe
      // orizontală — pagina se derulează lateral, ceea ce e mai rău. Aşa,
      // butonul creşte în înălţime şi nimic nu iese din ecran.
      //
      // Sub 640px mărimile mici urcă la cel puţin 40px: un deget nu nimereşte
      // o ţintă de 32px. Pe ecran lat rămâne exact designul de dinainte.
      size: {
        sm: 'min-h-8 max-sm:min-h-10 px-3 max-sm:px-4 py-1 text-sm rounded-lg',
        md: 'min-h-10 px-4 py-1.5 text-sm rounded-xl',
        lg: 'min-h-12 px-6 py-2 text-base rounded-full',
        xl: 'min-h-14 px-8 py-2.5 text-lg rounded-full',
        icon: 'h-9 w-9 max-sm:h-11 max-sm:w-11 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  )
)

Button.displayName = 'Button'
