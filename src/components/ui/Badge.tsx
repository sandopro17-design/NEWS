import { type HTMLAttributes } from 'react'

export type BadgeTone = 'default' | 'accent' | 'verified' | 'warning' | 'error'

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone
}

const toneClass: Record<BadgeTone, string> = {
  default: 'bg-surface-elevated text-muted border-border',
  accent: 'bg-accent/20 text-accent-fg border-accent/40',
  verified: 'bg-success/15 text-verified border-success/35',
  warning: 'bg-warning/20 text-foreground border-warning/40',
  error: 'bg-error/15 text-error border-error/35',
}

export function Badge({
  className = '',
  tone = 'default',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex max-w-full items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        toneClass[tone],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </span>
  )
}
