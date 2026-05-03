import { Link } from 'react-router-dom'

const imgPokeball = "/images/pokemon_home_logo.webp"
const imgOnePieceFlag = "/images/onepiece_home_logo.webp"

export default function GameSelectPage() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>

      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: 'var(--neutral-900)' }}>
          Choose a game
        </h1>
        <p style={{ fontSize: 15, color: 'var(--color-text-muted)' }}>
          Select a game to browse available singles.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

        {/* Pokémon */}
        <Link to="/catalog?game=pokemon&category=singles" style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          backgroundColor: '#ffffff',
          border: '1px solid var(--neutral-200)',
          borderRadius: 'var(--radius-2xl)',
          padding: '40px 36px',
          overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--neutral-400)', marginBottom: 10 }}>The world of</p>
            <h3 style={{ fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 800, color: 'var(--neutral-900)', lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 14 }}>
              Pokémon<br />TCG
            </h3>
            <p style={{ fontSize: 14, color: 'var(--neutral-500)', marginBottom: 28, lineHeight: 1.5 }}>
              Singles from Base Set to Scarlet &amp; Violet. Every card photographed.
            </p>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', gap: 6 }}>
              Browse Pokémon
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 3l6 4-6 4"/></svg>
            </span>
          </div>
          <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={imgPokeball} alt="Pokéball" style={{ width: 'min(220px, 40vw)', height: 'min(220px, 40vw)', objectFit: 'contain', display: 'block' }} />
          </div>
        </Link>

        {/* One Piece */}
        <Link to="/catalog?game=one_piece&category=singles" style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          backgroundColor: '#ffffff',
          border: '1px solid var(--neutral-200)',
          borderRadius: 'var(--radius-2xl)',
          padding: '40px 36px',
          overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--neutral-400)', marginBottom: 10 }}>The world of</p>
            <h3 style={{ fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 800, color: 'var(--neutral-900)', lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 14 }}>
              One Piece<br />TCG
            </h3>
            <p style={{ fontSize: 14, color: 'var(--neutral-500)', marginBottom: 28, lineHeight: 1.5 }}>
              Leaders, characters, events from OP01 onwards. Fast-growing meta.
            </p>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', gap: 6 }}>
              Browse One Piece
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 3l6 4-6 4"/></svg>
            </span>
          </div>
          <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={imgOnePieceFlag} alt="One Piece jolly roger flag" style={{ width: 'min(220px, 40vw)', height: 'min(220px, 40vw)', objectFit: 'contain', display: 'block' }} />
          </div>
        </Link>

      </div>
    </div>
  )
}
