import { type HTMLAttributes } from 'react'

export type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={[
        'rounded-xl border border-border bg-surface p-5 shadow-sm',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['mb-3 space-y-1', className].join(' ')} {...props} />
  )
}

export function CardTitle({
  className = '',
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={['font-display text-lg font-semibold text-foreground', className].join(
        ' ',
      )}
      {...props}
    />
  )
}

export function CardDescription({
  className = '',
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={['text-sm text-muted', className].join(' ')} {...props} />
  )
}
