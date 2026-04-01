import { type InputHTMLAttributes, forwardRef } from 'react'

export type InputVariant = 'text' | 'search'

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  variant?: InputVariant
  inputSize?: 'sm' | 'md'
}

const baseInput =
  'w-full border border-border bg-surface-elevated text-foreground placeholder:text-subtle transition-colors ' +
  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

const sizeClass = {
  sm: 'h-8 px-2.5 text-sm rounded-md',
  md: 'h-10 px-3 text-sm rounded-md',
} as const

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = '', variant = 'text', inputSize = 'md', type, ...props },
  ref,
) {
  const resolvedType = variant === 'search' ? 'search' : type ?? 'text'
  const searchExtra = variant === 'search' ? 'pl-9' : ''

  return (
    <span className={variant === 'search' ? 'relative block w-full' : 'contents'}>
      {variant === 'search' && (
        <span
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 opacity-50"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3-3" strokeLinecap="round" />
          </svg>
        </span>
      )}
      <input
        ref={ref}
        type={resolvedType}
        className={[
          baseInput,
          sizeClass[inputSize],
          searchExtra,
          className,
        ].join(' ')}
        {...props}
      />
    </span>
  )
})
