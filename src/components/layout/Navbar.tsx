import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { LogoBadge } from '../ui/Logo'

const NAV_LINKS = [
  { label: 'Pokémon', to: '/catalog?game=pokemon' },
  { label: 'One Piece', to: '/catalog?game=one_piece' },
  { label: 'New Arrivals', to: '/new' },
]

export default function Navbar() {
  const { pathname, search } = useLocation()
  const { count } = useCart()
  const full = pathname + search

  return (
    <header style={{
      backgroundColor: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        gap: 32,
      }}>
        {/* Logo — extra padding so the -5.5° tilt doesn't clip against the nav edges */}
        <Link to="/" aria-label="1624 Cards home" style={{ display: 'flex', alignItems: 'center', padding: '6px 4px' }}>
          <LogoBadge width={72} />
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: 2, flex: 1 }}>
          {NAV_LINKS.map(link => {
            const basePath = link.to.split('?')[0]
            const isActive = full.includes(link.to) || (basePath !== '/' && full === basePath)
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  color: isActive ? 'var(--brand-blue)' : 'var(--color-text-muted)',
                  backgroundColor: isActive ? 'var(--brand-blue-lighter)' : 'transparent',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Search */}
          <Link
            to="/catalog"
            aria-label="Search cards"
            style={{
              width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
              transition: 'border-color 0.15s',
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="7" cy="7" r="4.5" />
              <line x1="11" y1="11" x2="15" y2="15" />
            </svg>
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--brand-blue)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.01em',
              transition: 'background 0.15s',
              position: 'relative',
            }}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5.5 1.5L2.5 5.5v8a1.5 1.5 0 001.5 1.5h7a1.5 1.5 0 001.5-1.5v-8l-3-4z"/>
              <line x1="2.5" y1="5.5" x2="12.5" y2="5.5"/>
              <path d="M10 7.5a2.5 2.5 0 01-5 0"/>
            </svg>
            Cart
            {count > 0 && (
              <span style={{
                minWidth: 18, height: 18,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--brand-gold)',
                color: 'var(--neutral-900)',
                fontSize: 11,
                fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 5px',
              }}>
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
