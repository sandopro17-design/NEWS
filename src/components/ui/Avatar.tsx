import { type ImgHTMLAttributes } from 'react'

export type AvatarSize = 'sm' | 'md' | 'lg'

export type AvatarProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'width' | 'height'> & {
  /** Nome o etichetta per iniziali di fallback */
  label: string
  size?: AvatarSize
}

const sizePixels: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
}

function initialsFromLabel(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Avatar({
  label,
  size = 'md',
  src,
  alt,
  className = '',
  ...imgProps
}: AvatarProps) {
  const px = sizePixels[size]
  const textSize =
    size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'

  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? label}
        width={px}
        height={px}
        className={[
          'inline-block shrink-0 rounded-full object-cover ring-2 ring-border',
          className,
        ].join(' ')}
        {...imgProps}
      />
    )
  }

  return (
    <span
      role="img"
      aria-label={alt ?? label}
      style={{ width: px, height: px }}
      className={[
        'inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold',
        'bg-primary/25 text-primary ring-2 ring-border',
        textSize,
        className,
      ].join(' ')}
    >
      {initialsFromLabel(label)}
    </span>
  )
}
