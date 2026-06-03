import { useState, useEffect, useRef } from 'react'
import { setPageMeta } from '../lib/pageMeta'
import { Link } from 'react-router-dom'
import type { Condition, Game, Listing as GlobalListing } from '../types'
import { useCart } from '../hooks/useCart'
import { useFlyCart } from '../hooks/useFlyCart'
import { useIsMobile } from '../hooks/useIsMobile'
import { supabase } from '../lib/supabase'

const COND_BG: Record<Condition, string> = {
  NM: '#E8F5E9', LP: '#F3E5F5', MP: '#FFF8E1', HP: '#FBE9E7', DMG: '#FFEBEE'
}
const COND_COLOR: Record<Condition, string> = {
  NM: '#2E7D32', LP: '#6A1B9A', MP: '#F57F17', HP: '#BF360C', DMG: '#B71C1C'
}

type Listing = {
  id: string
  price_chf: number
  condition: Condition
  quantity: number
  scan_front: string
  scan_back?: string
  new_arrival_at: string
  card: {
    id: string
    game: Game
    set_code: string
    set_name: string
    card_number: string
    name_en: string
  }
}

function CardTile({ listing, canAdd, justAdded, onAddToCart }: {
  listing: Listing
  canAdd: boolean
  justAdded: boolean
  onAddToCart: (e: React.MouseEvent) => void
}) {
  const defaultSrc = listing.scan_front
  const altSrc = listing.scan_back ?? null
  const [imgLoaded, setImgLoaded] = useState(false)
  const [showBack, setShowBack] = useState(false)
  const [backSrc, setBackSrc] = useState<string | null>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (hoverTimer.current) clearTimeout(hoverTimer.current) }, [])

  function handleMouseEnter() {
    if (!altSrc) return
    if (!backSrc) setBackSrc(altSrc)
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
      <div style={{ aspectRatio: '2.5/3.5', position: 'relative', overflow: 'hidden', backgroundColor: '#fff' }}>
        {!imgLoaded && (
          <div className="img-shimmer" style={{ position: 'absolute', inset: 0 }} />
        )}
        {defaultSrc ? (
          <>
            <img
              src={defaultSrc}
              alt={listing.card.name_en}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
            />
            {backSrc && (
              <img
                src={backSrc}
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
        <span style={{
          position: 'absolute', top: 8, left: 8,
          fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
          padding: '3px 7px', borderRadius: 999,
          backgroundColor: 'var(--brand-gold)', color: 'var(--brand-gold-deeper)',
        }}>
          NEW
        </span>
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
        <p style={{ fontSize: 11, color: 'var(--color-text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 8 }}>
          {listing.card.set_name}
        </p>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
          CHF {listing.price_chf.toFixed(2)}
        </p>
        <button
          onClick={onAddToCart}
          disabled={!canAdd}
          className={canAdd ? 'btn-primary' : ''}
          style={{
            width: '100%', padding: '7px 0',
            borderRadius: 'var(--radius-full)',
            border: 'none', cursor: canAdd ? 'pointer' : 'not-allowed',
            fontSize: 12, fontWeight: 600,
            backgroundColor: justAdded ? 'var(--brand-blue-dark)' : canAdd ? 'var(--brand-blue)' : 'var(--color-border)',
            color: canAdd ? '#fff' : 'var(--color-text-faint)',
            transition: 'background-color 0.15s',
          }}
        >
          {justAdded ? '✓ Added' : 'Add to cart'}
        </button>
      </div>
    </Link>
  )
}

export default function NewArrivalsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [showScrollTop, setShowScrollTop] = useState(false)
  const { addItem, items } = useCart()
  const { flyToCart } = useFlyCart()
  useEffect(() => { setPageMeta('New Arrivals', 'Neu eingetroffene Pokémon & One Piece TCG Einzelkarten. Scan-verified, frisch verfügbar, Swiss Post aus Zürich.') }, [])
  const isMobile = useIsMobile()

  useEffect(() => {
    function onScroll() { setShowScrollTop(window.scrollY > 400) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    async function fetchNewArrivals() {
      const { data, error } = await supabase
        .from('listings')
        .select('*, card:cards(*)')
        .eq('is_active', true)
        .eq('is_new_arrival', true)
        .order('new_arrival_at', { ascending: false })
        .limit(500)
      if (error) {
        setError('Failed to load new arrivals — please try again.')
      } else {
        setListings((data ?? []).filter((l: { card: unknown }) => l.card !== null) as Listing[])
      }
      setLoading(false)
    }
    fetchNewArrivals()
  }, [])

  function handleAddToCart(listing: Listing, e: React.MouseEvent) {
    e.preventDefault()
    addItem(listing as unknown as GlobalListing)
    setAddedIds(prev => new Set(prev).add(listing.id))
    setTimeout(() => setAddedIds(prev => { const s = new Set(prev); s.delete(listing.id); return s }), 1500)
    flyToCart(e.currentTarget.getBoundingClientRect(), listing.scan_front)
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: isMobile ? 10 : 14,
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? '20px 9px' : '32px 13px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 500, marginBottom: 4 }}>New arrivals</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
          {loading
            ? 'Loading…'
            : listings.length > 0
              ? `${listings.length} card${listings.length !== 1 ? 's' : ''} freshly added`
              : 'Check back soon'}
        </p>
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: '#FCEBEB', borderRadius: 'var(--radius-md)', marginBottom: 20, fontSize: 13, color: '#791F1F' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={gridStyle}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ aspectRatio: '2.5/3.5', backgroundColor: 'var(--color-bg)' }} />
              <div style={{ padding: '10px 12px' }}>
                <div style={{ height: 13, backgroundColor: 'var(--color-bg)', borderRadius: 4, marginBottom: 6 }} />
                <div style={{ height: 11, backgroundColor: 'var(--color-bg)', borderRadius: 4, width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '45px 0' }}>
          <img
            src="/images/1624_arrivals_empty.webp"
            alt=""
            style={{ width: 180, height: 'auto', display: 'block', margin: '0 auto 18px' }}
          />
          <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text)', marginBottom: 6 }}>No new arrivals right now</p>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 24 }}>
            New cards are added regularly — come back soon.
          </p>
          <Link to="/catalog" style={{ fontSize: 14, color: 'var(--brand-blue)', fontWeight: 500 }}>
            Browse all cards →
          </Link>
        </div>
      ) : (
        <div style={gridStyle}>
          {listings.map(listing => {
            const cartItem = items.find(i => i.listing.id === listing.id)
            const canAdd = !cartItem || cartItem.quantity < listing.quantity
            const justAdded = addedIds.has(listing.id)
            return (
              <CardTile
                key={listing.id}
                listing={listing}
                canAdd={canAdd}
                justAdded={justAdded}
                onAddToCart={e => handleAddToCart(listing, e)}
              />
            )
          })}
        </div>
      )}
      {isMobile && showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          style={{
            position: 'fixed', bottom: 24, left: 20,
            width: 48, height: 48,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(255,255,255,0.40)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.30)',
            color: 'var(--color-text)',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            zIndex: 40,
          }}
        >
          <svg aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>
      )}
    </div>
  )
}
