import { useState, useEffect, useRef } from 'react'
import { setPageMeta } from '../lib/pageMeta'
import { Link } from 'react-router-dom'
import { useIsMobile } from '../hooks/useIsMobile'
import { supabase } from '../lib/supabase'
import type { Condition } from '../types'

type Listing = {
  id: string
  price_chf: number
  condition: Condition
  quantity: number
  scan_front: string
  scan_back?: string
  condition_note: string
  is_new_arrival?: boolean
  card: {
    id: string
    name_en: string
    set_name: string
    set_code: string
    card_number: string
    rarity: string
  }
}

const COND_BG: Record<Condition, string> = {
  NM: '#E8F5E9', LP: '#F3E5F5', MP: '#FFF8E1', HP: '#FBE9E7', DMG: '#FFEBEE',
}
const COND_COLOR: Record<Condition, string> = {
  NM: '#2E7D32', LP: '#6A1B9A', MP: '#F57F17', HP: '#BF360C', DMG: '#B71C1C',
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function HomeCardTile({ listing }: { listing: Listing }) {
  const defaultSrc = listing.scan_front
  const altSrc = listing.scan_back ?? null
  const [showBack, setShowBack] = useState(false)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (hoverTimer.current) clearTimeout(hoverTimer.current) }, [])

  function handleMouseEnter() {
    if (!altSrc) return
    hoverTimer.current = setTimeout(() => setShowBack(true), 300)
  }
  function handleMouseLeave() {
    if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null }
    setShowBack(false)
  }

  return (
    <Link
      to={`/card/${listing.id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'block',
        textDecoration: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      <div style={{ aspectRatio: '2.5/3.5', backgroundColor: '#fff', overflow: 'hidden', position: 'relative' }}>
        {defaultSrc ? (
          <>
            <img src={defaultSrc} alt={listing.card.name_en} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            {altSrc && (
              <img
                src={altSrc}
                alt={listing.card.name_en}
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%', objectFit: 'cover',
                  opacity: showBack ? 1 : 0,
                  transition: 'opacity 0.38s cubic-bezier(0.4,0,0.2,1)',
                }}
              />
            )}
          </>
        ) : (
          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--color-text-faint)' }}>
            {listing.card.set_code} · #{listing.card.card_number}
          </span>
        )}
        {listing.is_new_arrival && (
          <span style={{
            position: 'absolute', top: 8, left: 8,
            fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
            padding: '3px 7px', borderRadius: 999,
            backgroundColor: 'var(--brand-gold)', color: 'var(--brand-gold-deeper)',
          }}>
            NEW
          </span>
        )}
      </div>
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 2 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {listing.card.name_en}
          </p>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 6px',
            borderRadius: 4, flexShrink: 0,
            backgroundColor: COND_BG[listing.condition],
            color: COND_COLOR[listing.condition],
          }}>
            {listing.condition}
          </span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--color-text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6 }}>
          {listing.card.set_name}
        </p>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>
          CHF {listing.price_chf.toFixed(2)}
        </p>
      </div>
    </Link>
  )
}

const imgPokeball = "/images/pokemon_home_logo.webp"
const imgOnePieceFlag = "/images/onepiece_home_logo2.webp"

// Inline SVG icons (no external dependency)
const IconScan = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
    <line x1="7" y1="12" x2="17" y2="12"/>
  </svg>
)
const IconCHF = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
)
const IconPackage = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/>
  </svg>
)

const QUOTE_WORDS = "1624 Cards is built to make buying singles simpler and more transparent. Every card is duplex-scanned front and back, so you know exactly what you're".split(' ')
const TOTAL_WORDS = QUOTE_WORDS.length + 1 // +1 for "buying."

function wordColor(idx: number, progress: number): string {
  const start = (idx / TOTAL_WORDS) * 0.9
  const wp = Math.max(0, Math.min(1, (progress - start) / (1 / TOTAL_WORDS + 0.08)))
  // Interpolate from muted grey (#aaa) to full dark (#2a2a2a)
  const r = Math.round(170 - wp * (170 - 42))
  const g = Math.round(170 - wp * (170 - 42))
  const b = Math.round(170 - wp * (170 - 42))
  return `rgb(${r}, ${g}, ${b})`
}

export default function HomePage() {
  const isMobile = useIsMobile()
  const isTabletOrSmaller = useIsMobile(1280)
  useEffect(() => { setPageMeta() }, [])
  const [hoveredGame, setHoveredGame] = useState<'pokemon' | 'one_piece' | null>(null)
  const [hoveredCta, setHoveredCta] = useState(false)
  const [hoveredBrowse, setHoveredBrowse] = useState(false)
  const [quoteProgress, setQuoteProgress] = useState(0)
  const [btnShake, setBtnShake] = useState(false)
  const [newArrivals, setNewArrivals] = useState<Listing[]>([])
  const [hoveredViewMore, setHoveredViewMore] = useState(false)
  const heroRef = useRef<HTMLElement>(null)
  const quoteRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | undefined>(undefined)
  const shookRef = useRef(false)

  useEffect(() => {
    supabase
      .from('listings')
      .select('*, card:cards(*)')
      .eq('is_active', true)
      .eq('is_new_arrival', true)
      .limit(200)
      .then(({ data }) => {
        if (!data) return
        const valid = data.filter((l: { card: unknown }) => l.card !== null) as Listing[]
        setNewArrivals(shuffle(valid).slice(0, 6))
      })
  }, [])

  useEffect(() => {
    function onScroll() {
      if (!heroRef.current) return
      const offset = window.scrollY * 0.35
      heroRef.current.style.backgroundPositionY = `calc(50% + ${offset}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function onScroll() {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = undefined
        if (!quoteRef.current) return
        const rect = quoteRef.current.getBoundingClientRect()
        const vh = window.innerHeight
        const p = Math.max(0, Math.min(1, (vh * 1.3 - rect.top) / (vh * 0.9)))
        setQuoteProgress(p)
        if (p >= 0.95 && !shookRef.current) {
          shookRef.current = true
          setBtnShake(true)
          setTimeout(() => setBtnShake(false), 500)
        }
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div>
      {/* Hero */}
      <section ref={heroRef} style={{
        backgroundImage: 'url(/images/1624_home_header13.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 50%',
        height: isMobile ? '100vh' : '80vh',
        minHeight: 560,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        position: 'relative',
      }}>
        {/* Bottom gradient for text readability */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: isMobile
            ? 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 50%, transparent 80%)'
            : 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.4) 45%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? '0 11px 90px' : '0 13px 48px', position: 'relative', width: '100%', boxSizing: 'border-box' }}>

          {isMobile ? (
            /* Mobile: headline only at the bottom of hero */
            <div>
              <h1 style={{ fontSize: 48, fontWeight: 500, lineHeight: 1.0, letterSpacing: '-0.02em', color: '#fff' }}>
                A better way to shop TCG singles.
              </h1>
            </div>
          ) : (
            /* Desktop: headline left, pillars right — icons top-aligned */
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.65fr 0.65fr 0.65fr', gap: 32, alignItems: 'stretch' }}>
              {/* Headline — top-aligned to match pillar icons */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                <h1 style={{ fontSize: 48, fontWeight: 500, lineHeight: 1.0, letterSpacing: '-0.02em', color: '#fff', marginBottom: 0 }}>
                  A better way to shop<br />TCG singles.
                </h1>
              </div>

              {/* Pillar items — stretched to same height, content flows from top so icons align */}
              {[
                { label: 'Scan-verified', sub: 'Duplex scanned front and back. The exact card you see is the one that ships.', icon: <IconScan /> },
                { label: 'CHF pricing', sub: 'Local CHF pricing with transparent checkout and fast domestic shipping.', icon: <IconCHF /> },
                { label: 'Swiss Post', sub: 'A-Post tracked shipping. Free on Swiss orders over CHF\u00a075.', icon: <IconPackage /> },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                  <div style={{ marginBottom: 14, filter: 'brightness(0) invert(1)' }}>{item.icon}</div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 5 }}>{item.label}</p>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.55 }}>{item.sub}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quote text section */}
      <section style={{ width: '100%', padding: isMobile ? '32px 20px' : '56px 13px' }}>
        <div ref={quoteRef} style={{ maxWidth: 1400, margin: '0 auto' }}>
          <p style={{
            fontSize: 32,
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: '-0.04em',
            marginBottom: isMobile ? 32 : 0,
          }}>
            {QUOTE_WORDS.map((word, i) => (
              <span
                key={i}
                style={{
                  color: wordColor(i, quoteProgress),
                  transition: 'color 0.15s ease',
                  display: 'inline',
                }}
              >
                {word}{' '}
              </span>
            ))}
            <Link
              to="/catalog"
              style={{
                color: (() => {
                const wp = Math.max(0, Math.min(1, (quoteProgress - (QUOTE_WORDS.length / TOTAL_WORDS) * 0.9) / 0.1))
                const r = Math.round(170 - wp * (170 - 11))
                const g = Math.round(170 - wp * (170 - 66))
                const b = Math.round(170 - wp * (170 - 167))
                return `rgb(${r}, ${g}, ${b})`
              })(),
                fontWeight: 900,
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
            >
              buying.
            </Link>
            {!isMobile && (
              <Link
                to="/catalog"
                className={btnShake ? 'btn-shake' : undefined}
                onMouseEnter={() => setHoveredBrowse(true)}
                onMouseLeave={() => setHoveredBrowse(false)}
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  height: 45,
                  padding: '0 24px',
                  backgroundColor: hoveredBrowse ? 'var(--brand-blue)' : 'transparent',
                  color: hoveredBrowse ? '#fff' : 'var(--brand-blue)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 18, fontWeight: 600,
                  textDecoration: hoveredBrowse ? 'none' : 'underline',
                  textUnderlineOffset: '4px',
                  verticalAlign: 'middle',
                  marginLeft: 16,
                  letterSpacing: '-0.01em',
                  opacity: Math.max(0, Math.min(1, (quoteProgress - 0.7) / 0.3)),
                  transition: 'opacity 0.2s ease, background-color 0.2s ease, color 0.2s ease, text-decoration 0.1s',
                }}
              >
                Browse all cards
                <svg
                  width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  style={{
                    maxWidth: hoveredBrowse ? 14 : 0,
                    marginLeft: hoveredBrowse ? 8 : 0,
                    opacity: hoveredBrowse ? 1 : 0,
                    overflow: 'hidden',
                    flexShrink: 0,
                    transition: 'max-width 0.22s ease, margin-left 0.22s ease, opacity 0.22s ease',
                  }}
                >
                  <path d="M3 7h8M7 3l4 4-4 4"/>
                </svg>
              </Link>
            )}
          </p>
          {isMobile && (
            <Link
              to="/catalog"
              style={{
                display: 'inline-flex', alignItems: 'center',
                color: 'var(--brand-blue)',
                fontSize: 15, fontWeight: 600,
                textDecoration: 'underline',
                textUnderlineOffset: '4px',
              }}
            >
              Browse all cards
            </Link>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? '0 9px 56px' : '0 13px 96px' }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: isMobile ? 16 : 24 }}>
            New arrivals
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isTabletOrSmaller ? 'repeat(4, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: isMobile ? 8 : 14,
          }}>
            {newArrivals.map(listing => (
              <HomeCardTile key={listing.id} listing={listing} />
            ))}
          </div>

          {/* View more button */}
          <div style={{ textAlign: 'center', marginTop: isMobile ? 24 : 32 }}>
            <Link
              to="/new"
              onMouseEnter={() => { if (!isMobile) setHoveredViewMore(true) }}
              onMouseLeave={() => setHoveredViewMore(false)}
              className="btn-dark"
              style={{
                display: 'inline-flex', alignItems: 'center',
                backgroundColor: hoveredViewMore ? 'var(--neutral-700)' : 'var(--neutral-900)',
                color: '#fff',
                padding: '14px 28px',
                borderRadius: 999,
                fontSize: 15, fontWeight: 600,
                textDecoration: 'none',
                transform: hoveredViewMore ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hoveredViewMore ? '0 16px 40px rgba(0,0,0,0.18)' : 'none',
                transition: 'background-color 0.15s, transform 0.3s cubic-bezier(0.34,1.1,0.64,1), box-shadow 0.3s ease',
              }}
            >
              View more
              <svg
                width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                style={{
                  maxWidth: hoveredViewMore ? 14 : 0,
                  marginLeft: hoveredViewMore ? 8 : 0,
                  opacity: hoveredViewMore ? 1 : 0,
                  overflow: 'hidden',
                  flexShrink: 0,
                  transition: 'max-width 0.22s ease, margin-left 0.22s ease, opacity 0.22s ease',
                }}
              >
                <path d="M3 7h8M7 3l4 4-4 4"/>
              </svg>
            </Link>
          </div>
        </section>
      )}

      {/* Pillars — mobile only (desktop shows in hero) */}
      {isMobile && <section style={{ maxWidth: 1400, margin: '0 auto', padding: '0 9px 56px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Scan-verified', sub: 'Duplex scanned front and back. The exact card you see is the one that ships.', icon: <IconScan /> },
            { label: 'CHF pricing', sub: 'Local CHF pricing with transparent checkout and fast domestic shipping.', icon: <IconCHF /> },
            { label: 'Swiss Post', sub: 'A-Post tracked shipping. Free on Swiss orders over CHF\u00a075.', icon: <IconPackage /> },
          ].map(item => (
            <div key={item.label} style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 8 }}>
                {item.icon}
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>{item.label}</p>
                <p style={{ fontSize: 14.5, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>}

      {/* Game selector */}
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? '0 9px 56px' : '0 13px 96px' }}>
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
            to="/catalog?game=pokemon"
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
              boxShadow: hoveredGame === 'pokemon' ? '0 24px 64px rgba(0,0,0,0.12)' : 'none',
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
                  mixBlendMode: 'multiply',
                  transform: hoveredGame === 'pokemon' ? 'translateY(-12px) scale(1.07)' : 'translateY(0) scale(1)',
                  transition: 'transform 0.48s cubic-bezier(0.34,1.2,0.64,1)',
                }}
              />
            </div>

            <p style={{ fontSize: 16, color: 'var(--color-text-muted)', marginBottom: 22, lineHeight: 1.55, textAlign: isMobile ? 'center' : 'left' }}>
              Singles from Base Set to Scarlet &amp; Violet. Every card photographed.
            </p>

            <div className="btn-dark" style={{
              display: 'inline-flex', alignItems: 'center',
              backgroundColor: 'var(--neutral-900)', color: '#fff',
              padding: '12px 22px', borderRadius: 999,
              fontSize: 14, fontWeight: 600, alignSelf: isMobile ? 'center' : 'flex-start',
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
            to="/catalog?game=one_piece"
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
              boxShadow: hoveredGame === 'one_piece' ? '0 24px 64px rgba(0,0,0,0.12)' : 'none',
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
                  mixBlendMode: 'multiply',
                  transform: hoveredGame === 'one_piece' ? 'translateY(-12px) scale(1.07)' : 'translateY(0) scale(1)',
                  transition: 'transform 0.48s cubic-bezier(0.34,1.2,0.64,1)',
                }}
              />
            </div>

            <p style={{ fontSize: 16, color: 'var(--color-text-muted)', marginBottom: 22, lineHeight: 1.55, textAlign: isMobile ? 'center' : 'left' }}>
              Leaders, characters, events from OP01 onwards. Fast-growing meta.
            </p>

            <div className="btn-dark" style={{
              display: 'inline-flex', alignItems: 'center',
              backgroundColor: 'var(--neutral-900)', color: '#fff',
              padding: '12px 22px', borderRadius: 999,
              fontSize: 14, fontWeight: 600, alignSelf: isMobile ? 'center' : 'flex-start',
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

      </section>

      {/* Full-width quote banner */}
      <section style={{ position: 'relative', width: '100%', height: isMobile ? '75vh' : '80vh', minHeight: isMobile ? 400 : 560, overflow: 'hidden', marginBottom: isMobile ? 56 : 96 }}>
        <img
          src="/images/1624_home_quote01.webp"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.32)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: isMobile ? '0 24px' : '0 80px',
        }}>
          <p style={{
            fontSize: isMobile ? 32 : 36,
            fontWeight: 600,
            color: '#fff',
            textAlign: 'center',
            lineHeight: 1.45,
            letterSpacing: '-0.02em',
            maxWidth: 760,
          }}>
            "From Tokyo to Zurich to New York, collectors are building the same story together."
          </p>
        </div>
      </section>

      {/* Editorial grid */}
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? '0 9px 56px' : '0 13px 96px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
          gridTemplateRows: isMobile ? 'auto' : '1fr',
          gap: 10,
          alignItems: 'stretch',
        }}>

          {/* 1 — Quote card */}
          <div style={{
            backgroundColor: '#E8E8E8',
            borderRadius: 'var(--radius-lg)',
            padding: isMobile ? '32px 24px' : '40px 36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: isMobile ? 240 : 380,
          }}>
            <p style={{
              fontSize: isMobile ? 22 : 26,
              fontWeight: 500,
              lineHeight: 1.4,
              letterSpacing: '-0.02em',
              color: 'var(--neutral-900)',
              flex: 1,
            }}>
              The buying experience should be built around the actual card, not a stock image.
            </p>
            <p style={{ fontSize: 16, color: 'var(--neutral-500)', marginTop: 32, fontWeight: 500 }}>
              Our motto
            </p>
          </div>

          {/* 2 — Image */}
          <div style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            minHeight: isMobile ? 260 : 380,
          }}>
            <img
              src="/images/1624_home_header09.jpeg"
              alt="Explore cards"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>

          {/* 3 — Facts + CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{
              backgroundColor: '#E8E8E8',
              borderRadius: 'var(--radius-lg)',
              padding: '28px 28px 24px',
              flex: 1,
            }}>
              <p style={{ fontSize: isMobile ? 40 : 48, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--neutral-900)', lineHeight: 1, marginBottom: 10 }}>
                13.1B+
              </p>
              <p style={{ fontSize: 16, color: 'var(--neutral-500)', lineHeight: 1.55 }}>
                Pokémon cards printed since 1996 — the hunt for rare singles never ends
              </p>
            </div>

            <div style={{
              backgroundColor: '#E8E8E8',
              borderRadius: 'var(--radius-lg)',
              padding: '28px 28px 24px',
              flex: 1,
            }}>
              <p style={{ fontSize: isMobile ? 40 : 48, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--neutral-900)', lineHeight: 1, marginBottom: 10 }}>
                #1
              </p>
              <p style={{ fontSize: 16, color: 'var(--neutral-500)', lineHeight: 1.55 }}>
                Pokémon is the highest-grossing media franchise of all time — and collectors keep it alive
              </p>
            </div>

            <Link
              to="/catalog"
              onMouseEnter={() => setHoveredCta(true)}
              onMouseLeave={() => setHoveredCta(false)}
              style={{
                backgroundColor: hoveredCta ? 'var(--brand-blue-dark)' : 'var(--brand-blue)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px 28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                flexShrink: 0,
                transform: hoveredCta ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hoveredCta ? '0 16px 40px rgba(11,66,167,0.25)' : 'none',
                transition: 'background-color 0.2s, transform 0.3s cubic-bezier(0.34,1.1,0.64,1), box-shadow 0.3s ease',
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>Explore our cards</span>
              <svg
                width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"
                style={{
                  transform: hoveredCta ? 'translateX(4px)' : 'translateX(0)',
                  transition: 'transform 0.3s cubic-bezier(0.34,1.1,0.64,1)',
                }}
              >
                <path d="M3 9h12M10 4l5 5-5 5"/>
              </svg>
            </Link>
          </div>

        </div>
      </section>

    </div>
  )
}
