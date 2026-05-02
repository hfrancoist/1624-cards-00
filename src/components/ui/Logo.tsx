import logoBadgeSrc from '../../assets/Logo_1624c_v01.svg'

interface LogoProps {
  variant?: 'badge' | 'wordmark'
  width?: number
  className?: string
}

/**
 * Full 1624 Cards logo badge — uses the exact SVG exported from Figma.
 * Requires: src/assets/Logo_1624c_v01.svg
 */
export function LogoBadge({ width = 140, className }: { width?: number; className?: string }) {
  // SVG natural dimensions: 561 × 372
  const height = Math.round(width * (372 / 561))
  return (
    <img
      src={logoBadgeSrc}
      alt="1624 Cards"
      width={width}
      height={height}
      className={className}
      style={{ display: 'block', flexShrink: 0 }}
    />
  )
}

/**
 * Compact text-only wordmark for the navbar and tight spaces.
 * Pure CSS — no image dependency.
 */
export function LogoWordmark({ height = 28 }: { height?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, height }}>
      <span style={{
        fontSize: height * 1.1,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        lineHeight: 1,
        color: '#0B42A7',
        fontFamily: "'Inter', sans-serif",
      }}>
        1624
      </span>
      <span style={{
        fontSize: height * 0.52,
        fontWeight: 700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase' as const,
        color: '#F5B11C',
        lineHeight: 1,
        fontFamily: "'Inter', sans-serif",
      }}>
        Cards
      </span>
    </div>
  )
}

export default function Logo({ variant = 'wordmark', width, className }: LogoProps) {
  if (variant === 'badge') return <LogoBadge width={width ?? 120} className={className} />
  return <LogoWordmark height={width ? Math.round(width * 0.24) : 28} />
}
