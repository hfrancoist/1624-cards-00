import { useState, useEffect } from 'react'
import { setPageMeta } from '../lib/pageMeta'
import { Link } from 'react-router-dom'
import { useIsMobile } from '../hooks/useIsMobile'

const imgPokeball = "/images/pokemon_home_logo.webp"
const imgOnePieceFlag = "/images/onepiece_home_logo2.webp"

export default function GameSelectPage() {
  useEffect(() => { setPageMeta('Shop by Game', 'Browse Pokémon and One Piece TCG singles at 1624 Cards. Scan-verified, CHF pricing, ships from Zürich.') }, [])

  const [hoveredGame, setHoveredGame] = useState<'pokemon' | 'one_piece' | null>(null)
  const isMobile = useIsMobile()

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? '28px 9px 36px' : '48px 13px 56px' }}>

      <p style={{
        fontSize: 12, fontWeight: 600,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--color-text-faint)',
        marginBottom: isMobile ? 16 : 20,
      }}>
        Shop by game
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 20 }}>

        {/* Pokémon */}
        <Link
          to="/catalog?game=pokemon&category=singles"
          onMouseEnter={() => { if (!isMobile) setHoveredGame('pokemon') }}
          onMouseLeave={() => setHoveredGame(null)}
          style={{
            display: 'flex', flexDirection: 'column',
            backgroundColor: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.65)',
            borderRadius: 'var(--radius-2xl)',
            padding: isMobile ? '32px 28px 28px' : '44px 40px 36px',
            overflow: 'hidden', textDecoration: 'none',
            minHeight: isMobile ? 300 : 400,
            transform: hoveredGame === 'pokemon' ? 'translateY(-8px)' : 'translateY(0)',
            boxShadow: hoveredGame === 'pokemon'
              ? '0 24px 64px rgba(0,0,0,0.12)'
              : '0 2px 16px rgba(0,0,0,0.06)',
            transition: 'transform 0.42s cubic-bezier(0.34,1.1,0.64,1), box-shadow 0.42s ease',
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 0 }}>
            The world of
          </p>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0' }}>
            <img
              src={imgPokeball}
              alt="Pokémon TCG"
              style={{
                width: isMobile ? 200 : 262, height: 'auto',
                filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.12))',
                transform: hoveredGame === 'pokemon' ? 'translateY(-12px) scale(1.07)' : 'translateY(0) scale(1)',
                transition: 'transform 0.48s cubic-bezier(0.34,1.2,0.64,1)',
              }}
            />
          </div>

          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 22, lineHeight: 1.55 }}>
            Singles from Base Set to Scarlet &amp; Violet. Every card photographed.
          </p>

          <div className="btn-dark" style={{
            display: 'inline-flex', alignItems: 'center',
            backgroundColor: 'var(--neutral-900)', color: '#fff',
            padding: '12px 22px', borderRadius: 999,
            fontSize: 14, fontWeight: 600, alignSelf: 'flex-start',
            transition: 'background-color 0.15s',
          }}>
            Browse Pokémon
            <svg
              width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              style={{
                maxWidth: hoveredGame === 'pokemon' ? 14 : 0,
                marginLeft: hoveredGame === 'pokemon' ? 8 : 0,
                opacity: hoveredGame === 'pokemon' ? 1 : 0,
                overflow: 'hidden',
                flexShrink: 0,
                transition: 'max-width 0.22s ease, margin-left 0.22s ease, opacity 0.22s ease',
              }}
            >
              <path d="M3 7h8M7 3l4 4-4 4"/>
            </svg>
          </div>
        </Link>

        {/* One Piece */}
        <Link
          to="/catalog?game=one_piece&category=singles"
          onMouseEnter={() => { if (!isMobile) setHoveredGame('one_piece') }}
          onMouseLeave={() => setHoveredGame(null)}
          style={{
            display: 'flex', flexDirection: 'column',
            backgroundColor: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.65)',
            borderRadius: 'var(--radius-2xl)',
            padding: isMobile ? '32px 28px 28px' : '44px 40px 36px',
            overflow: 'hidden', textDecoration: 'none',
            minHeight: isMobile ? 300 : 400,
            transform: hoveredGame === 'one_piece' ? 'translateY(-8px)' : 'translateY(0)',
            boxShadow: hoveredGame === 'one_piece'
              ? '0 24px 64px rgba(0,0,0,0.12)'
              : '0 2px 16px rgba(0,0,0,0.06)',
            transition: 'transform 0.42s cubic-bezier(0.34,1.1,0.64,1), box-shadow 0.42s ease',
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 0 }}>
            The world of
          </p>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0' }}>
            <img
              src={imgOnePieceFlag}
              alt="One Piece TCG"
              style={{
                width: isMobile ? 200 : 262, height: 'auto',
                filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.12))',
                transform: hoveredGame === 'one_piece' ? 'translateY(-12px) scale(1.07)' : 'translateY(0) scale(1)',
                transition: 'transform 0.48s cubic-bezier(0.34,1.2,0.64,1)',
              }}
            />
          </div>

          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 22, lineHeight: 1.55 }}>
            Leaders, characters, events from OP01 onwards. Fast-growing meta.
          </p>

          <div className="btn-dark" style={{
            display: 'inline-flex', alignItems: 'center',
            backgroundColor: 'var(--neutral-900)', color: '#fff',
            padding: '12px 22px', borderRadius: 999,
            fontSize: 14, fontWeight: 600, alignSelf: 'flex-start',
            transition: 'background-color 0.15s',
          }}>
            Browse One Piece
            <svg
              width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              style={{
                maxWidth: hoveredGame === 'one_piece' ? 14 : 0,
                marginLeft: hoveredGame === 'one_piece' ? 8 : 0,
                opacity: hoveredGame === 'one_piece' ? 1 : 0,
                overflow: 'hidden',
                flexShrink: 0,
                transition: 'max-width 0.22s ease, margin-left 0.22s ease, opacity 0.22s ease',
              }}
            >
              <path d="M3 7h8M7 3l4 4-4 4"/>
            </svg>
          </div>
        </Link>

      </div>

      <div style={{ textAlign: 'center' }}>
        <Link
          to="/catalog"
          style={{
            fontSize: 14, fontWeight: 500,
            color: 'var(--brand-blue)',
            textDecoration: 'none',
          }}
        >
          Browse all cards
        </Link>
      </div>
    </div>
  )
}
