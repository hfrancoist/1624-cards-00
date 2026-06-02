import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link, useLocation } from 'react-router-dom'
import { setPageMeta } from '../lib/pageMeta'
import type { Game, Condition, Listing as GlobalListing } from '../types'
import { CONDITION_LABELS, GAME_LABELS } from '../types'
import { supabase } from '../lib/supabase'
import { useCart } from '../hooks/useCart'
import { useFlyCart } from '../hooks/useFlyCart'
import { useIsMobile } from '../hooks/useIsMobile'

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
  condition_note: string
  is_new_arrival?: boolean
  card: {
    id: string
    game: Game
    set_code: string
    set_name: string
    card_number: string
    name_en: string
    rarity: string
    language: string
    edition?: string
  }
}

type SortBy = 'newest' | 'price-asc' | 'price-desc'

function CardTile({ listing, inCart, canAdd, justAdded, onAddToCart, isNew, isMobile }: {
  listing: Listing
  inCart: boolean
  canAdd: boolean
  justAdded: boolean
  onAddToCart: (e: React.MouseEvent) => void
  isNew?: boolean
  isMobile?: boolean
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
        transition: 'border-color 0.15s, box-shadow 0.15s',
        textDecoration: 'none',
      }}
    >
      <div style={{
        aspectRatio: '2.5/3.5',
        backgroundColor: '#fff',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Shimmer shown until image loads */}
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
                  position: 'absolute',
                  inset: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover',
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
        {isNew && (
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
          <p style={{ fontSize: isMobile ? 16 : 13, fontWeight: 500, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
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
        <p style={{ fontSize: isMobile ? 16 : 11, color: 'var(--color-text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 8 }}>
          {listing.card.set_name}
        </p>
        <p style={{ fontSize: isMobile ? 16 : 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
          CHF {listing.price_chf.toFixed(2)}
        </p>
        <button
          onClick={onAddToCart}
          disabled={!canAdd}
          className={canAdd ? 'btn-primary' : ''}
          style={{
            width: '100%', padding: isMobile ? '10px 0' : '7px 0',
            borderRadius: 'var(--radius-full)',
            border: 'none', cursor: canAdd ? 'pointer' : 'not-allowed',
            fontSize: isMobile ? 16 : 12, fontWeight: 600,
            backgroundColor: justAdded ? 'var(--brand-blue-dark)' : canAdd ? 'var(--brand-blue)' : 'var(--color-border)',
            color: canAdd ? '#fff' : 'var(--color-text-faint)',
            transition: 'background-color 0.15s',
          }}
        >
          {justAdded ? '✓ Added' : inCart ? 'In cart' : 'Add to cart'}
        </button>
      </div>
    </Link>
  )
}

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sheetVisible, setSheetVisible] = useState(false)
  const [sheetDragY, setSheetDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragStartY = useRef(0)
  const searchRef = useRef<HTMLInputElement>(null)
  const { addItem, items } = useCart()
  const { flyToCart } = useFlyCart()
  const isMobile = useIsMobile()
  const { state } = useLocation()

  useEffect(() => {
    if (isMobile || !state?.focusSearch) return
    const t = setTimeout(() => searchRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [isMobile, state?.focusSearch])

  useEffect(() => {
    function onScroll() { setShowScrollTop(window.scrollY > 400) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const activeGame = searchParams.get('game') as Game | null
  const activeSet = searchParams.get('set') ?? null
  const activeCategory = searchParams.get('category') ?? 'singles'
  const activeLanguage = searchParams.get('language') ?? null

  useEffect(() => {
    if (activeGame === 'pokemon') {
      setPageMeta('Pokémon TCG Singles', 'Browse Pokémon TCG singles — Base Set to Scarlet & Violet. Scan-verified, CHF pricing, ships from Zürich.')
    } else if (activeGame === 'one_piece') {
      setPageMeta('One Piece TCG Singles', 'Browse One Piece TCG singles — OP01 onwards. Scan-verified, CHF pricing, ships from Zürich.')
    } else {
      setPageMeta('All Cards', 'Browse all Pokémon & One Piece TCG singles at 1624 Cards. Scan-verified, CHF pricing, Swiss Post delivery.')
    }
  }, [activeGame])


  // Derive unique sets from loaded listings for the active game, sorted alphabetically
  const availableSets: [string, string][] = Array.from(
    new Map<string, string>(
      listings
        .filter(l => activeGame ? l.card.game === activeGame : true)
        .map(l => [l.card.set_code, l.card.set_name] as [string, string])
    ).entries()
  ).sort((a, b) => a[1].localeCompare(b[1]))

  useEffect(() => {
    async function fetchListings() {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('listings')
        .select('*, card:cards(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) {
        setError(error.message)
      } else {
        setListings((data ?? []).filter((l: { card: unknown }) => l.card !== null) as Listing[])
      }
      setLoading(false)
    }

    fetchListings()
  }, [])

  const filtered = listings
    .filter(l => {
      if (activeGame && l.card.game !== activeGame) return false
      if (search) {
        const q = search.toLowerCase()
        if (!l.card.name_en.toLowerCase().includes(q) && !l.card.set_name.toLowerCase().includes(q)) return false
      }
      if (activeSet && l.card.set_code !== activeSet) return false
      if (activeLanguage && l.card.language !== activeLanguage) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price_chf - b.price_chf
      if (sortBy === 'price-desc') return b.price_chf - a.price_chf
      return 0 // newest: already ordered by created_at desc from Supabase
    })

  function handleAddToCart(listing: Listing, e: React.MouseEvent) {
    e.preventDefault()
    addItem(listing as unknown as GlobalListing)
    setAddedIds(prev => new Set(prev).add(listing.id))
    setTimeout(() => setAddedIds(prev => { const s = new Set(prev); s.delete(listing.id); return s }), 1500)
    flyToCart(e.currentTarget.getBoundingClientRect(), listing.scan_front)
  }

  function openSheet() {
    document.body.style.overflow = 'hidden'
    setFiltersOpen(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setSheetVisible(true)))
  }

  function closeSheet() {
    document.body.style.overflow = ''
    setSheetVisible(false)
    setTimeout(() => setFiltersOpen(false), 320)
  }

  function setGame(game: Game | null) {
    const params: Record<string, string> = { category: activeCategory }
    if (game) params.game = game
    if (activeLanguage) params.language = activeLanguage
    setSearchParams(params)
    if (isMobile) closeSheet()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function setCategory(category: string) {
    const params: Record<string, string> = { category }
    if (activeGame) params.game = activeGame
    if (activeLanguage) params.language = activeLanguage
    setSearchParams(params)
    if (isMobile) closeSheet()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function setSet(set_code: string | null) {
    const params: Record<string, string> = { category: activeCategory }
    if (activeGame) params.game = activeGame
    if (set_code) params.set = set_code
    if (activeLanguage) params.language = activeLanguage
    setSearchParams(params)
    if (isMobile) closeSheet()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function setLanguage(language: string | null) {
    const params: Record<string, string> = { category: activeCategory }
    if (activeGame) params.game = activeGame
    if (activeSet) params.set = activeSet
    if (language) params.language = language
    setSearchParams(params)
    if (isMobile) closeSheet()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? '20px 9px' : '32px 13px' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 500, marginBottom: 4 }}>
          {activeGame ? `${GAME_LABELS[activeGame]} — ${activeCategory === 'sealed' ? 'Sealed Products' : 'Singles'}` : 'All cards'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
          {loading ? 'Loading…' : `${filtered.length} listing${filtered.length !== 1 ? 's' : ''} available`}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* Sidebar filters — desktop only */}
        <aside style={{ width: 200, flexShrink: 0, display: isMobile ? 'none' : 'block' }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 10 }}>Game</p>
            {([
              { label: 'All', value: null, img: null },
              { label: 'Pokémon', value: 'pokemon' as Game, img: '/images/pokemon_home_logo.webp' },
              { label: 'One Piece', value: 'one_piece' as Game, img: '/images/onepiece_home_logo2.webp' },
            ]).map(({ label, value, img }) => (
              <button key={label} onClick={() => setGame(value)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                width: '100%', textAlign: 'left',
                padding: '8px 10px', borderRadius: 'var(--radius-full)',
                fontSize: 13, border: 'none', cursor: 'pointer',
                backgroundColor: activeGame === value ? '#E8E8E8' : 'transparent',
                color: activeGame === value ? 'var(--brand-blue)' : 'var(--color-text-muted)',
                fontWeight: activeGame === value ? 500 : 400,
                marginBottom: 2,
              }}>
                {img
                  ? <img src={img} alt={label} style={{ height: 28, width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />
                  : label
                }
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 10 }}>Language</p>
            {([
              { label: 'All', value: null },
              { label: 'English', value: 'EN' },
              { label: 'Japanese', value: 'JP' },
            ]).map(({ label, value }) => (
              <button key={label} onClick={() => setLanguage(value)} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '7px 10px', borderRadius: 'var(--radius-full)',
                fontSize: 13, border: 'none', cursor: 'pointer',
                backgroundColor: activeLanguage === value ? '#E8E8E8' : 'transparent',
                color: activeLanguage === value ? 'var(--brand-blue)' : 'var(--color-text-muted)',
                fontWeight: activeLanguage === value ? 500 : 400,
                marginBottom: 2,
              }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 10 }}>Category</p>
            {([
              { label: 'Singles', value: 'singles' },
              { label: 'Sealed Products', value: 'sealed' },
            ]).map(({ label, value }) => (
              <button key={value} onClick={() => setCategory(value)} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '7px 10px', borderRadius: 'var(--radius-full)',
                fontSize: 13, border: 'none', cursor: 'pointer',
                backgroundColor: activeCategory === value ? '#E8E8E8' : 'transparent',
                color: activeCategory === value ? 'var(--brand-blue)' : 'var(--color-text-muted)',
                fontWeight: activeCategory === value ? 500 : 400,
                marginBottom: 2,
              }}>
                {label}
              </button>
            ))}
          </div>

          {/* Expansion filter — shown when a specific game is selected */}
          {activeGame && availableSets.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 10 }}>Expansion</p>
              <button
                onClick={() => setSet(null)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '7px 10px', borderRadius: 'var(--radius-full)',
                  fontSize: 13, border: 'none', cursor: 'pointer',
                  backgroundColor: activeSet === null ? '#E8E8E8' : 'transparent',
                  color: activeSet === null ? 'var(--brand-blue)' : 'var(--color-text-muted)',
                  fontWeight: activeSet === null ? 500 : 400,
                  marginBottom: 2,
                }}
              >
                All expansions
              </button>
              {availableSets.map(([code, name]) => (
                <button
                  key={code}
                  onClick={() => setSet(code)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '7px 10px', borderRadius: 'var(--radius-full)',
                    fontSize: 13, border: 'none', cursor: 'pointer',
                    backgroundColor: activeSet === code ? '#E8E8E8' : 'transparent',
                    color: activeSet === code ? 'var(--brand-blue)' : 'var(--color-text-muted)',
                    fontWeight: activeSet === code ? 500 : 400,
                    marginBottom: 2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          <div>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 10 }}>Condition</p>
            {(Object.keys(CONDITION_LABELS) as Condition[]).map(c => (
              <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 4px', fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 2 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: COND_COLOR[c], flexShrink: 0 }} />
                {CONDITION_LABELS[c]}
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Search + sort toolbar */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
            <div style={{ position: 'relative', ...(isMobile ? { flex: 1, minWidth: 0 } : { width: 640, flexShrink: 0 }) }}>
              <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)', pointerEvents: 'none' }} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="7" cy="7" r="4"/><line x1="11" y1="11" x2="15" y2="15"/></svg>
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search cards…"
                style={{
                  width: '100%', padding: `9px ${search ? '36px' : '12px'} 9px 36px`,
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 14, backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); searchRef.current?.focus() }}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    width: 20, height: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'none',
                    border: 'none', cursor: 'pointer', padding: 0,
                    color: 'var(--color-text-faint)',
                  }}
                  aria-label="Clear search"
                >
                  <svg width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="1" y1="1" x2="7" y2="7"/><line x1="7" y1="1" x2="1" y2="7"/>
                  </svg>
                </button>
              )}
            </div>
            {!loading && (
              <>
                {!isMobile && <div style={{ flex: 1 }} />}
                {!isMobile && (
                  <span style={{ fontSize: 13, color: 'var(--color-text-faint)', whiteSpace: 'nowrap' }}>
                    {filtered.length} listing{filtered.length !== 1 ? 's' : ''}
                  </span>
                )}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as SortBy)}
                    style={{
                      padding: '9px 34px 9px 14px',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 13, backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text)', cursor: 'pointer', outline: 'none',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                    } as React.CSSProperties}
                  >
                    <option value="newest">Newest</option>
                    <option value="price-asc">Price: Low → High</option>
                    <option value="price-desc">Price: High → Low</option>
                  </select>
                  <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-muted)' }} width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 12 12">
                    <polyline points="2 4 6 8 10 4"/>
                  </svg>
                </div>
              </>
            )}
          </div>

          {/* States */}
          {error && (
            <div style={{ padding: '16px', backgroundColor: '#FCEBEB', borderRadius: 'var(--radius-md)', marginBottom: 20, fontSize: 13, color: '#791F1F' }}>
              Failed to load listings — please try again.
            </div>
          )}

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(160px, 1fr))', gap: isMobile ? 10 : 12 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <div style={{ aspectRatio: '3/4', backgroundColor: 'var(--color-bg)' }} />
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ height: 13, backgroundColor: 'var(--color-bg)', borderRadius: 4, marginBottom: 6 }} />
                    <div style={{ height: 11, backgroundColor: 'var(--color-bg)', borderRadius: 4, width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : activeCategory === 'sealed' ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text)', marginBottom: 8 }}>Sealed products coming soon</p>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>We're working on it — check back later.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '45px 0' }}>
              <img
                src={activeGame === 'one_piece' ? '/images/1624_empty-op.webp' : '/images/1624_home_pokeball2.webp'}
                alt=""
                style={{ width: 180, height: 'auto', display: 'block', margin: '0 auto 18px' }}
              />
              <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text)', marginBottom: 6 }}>No cards found</p>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                {search ? `No results for "${search}" — try a different search.` : 'No listings available in this category yet.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: isMobile ? 10 : 14 }}>
              {filtered.map(listing => {
                const cartItem = items.find(i => i.listing.id === listing.id)
                const canAdd = !cartItem || cartItem.quantity < listing.quantity
                return (
                  <CardTile
                    key={listing.id}
                    listing={listing}
                    inCart={!!cartItem}
                    canAdd={canAdd}
                    justAdded={addedIds.has(listing.id)}
                    onAddToCart={e => handleAddToCart(listing, e)}
                    isNew={listing.is_new_arrival}
                    isMobile={isMobile}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Scroll to top — mobile only */}
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

      {/* Floating filter button — mobile only */}
      {isMobile && (
        <button
          onClick={openSheet}
          aria-label="Open filters"
          style={{
            position: 'fixed', bottom: 24, right: 20,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 20px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(255,255,255,0.40)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.30)',
            color: 'var(--color-text)',
            fontSize: 14, fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            zIndex: 40,
          }}
        >
          <svg aria-hidden="true" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          Filters
        </button>
      )}

      {/* Bottom sheet — mobile filters */}
      {isMobile && filtersOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeSheet}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              backgroundColor: 'rgba(0,0,0,0.45)',
              opacity: sheetVisible ? 1 : 0,
              transition: 'opacity 0.32s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
          {/* Sheet */}
          <div
            ref={sheetRef}
            onTouchStart={e => {
              if (sheetRef.current && sheetRef.current.scrollTop > 0) return
              dragStartY.current = e.touches[0].clientY
              setIsDragging(true)
            }}
            onTouchMove={e => {
              if (!isDragging) return
              const dy = e.touches[0].clientY - dragStartY.current
              if (dy > 0) setSheetDragY(dy)
            }}
            onTouchEnd={() => {
              if (sheetDragY > 80) {
                closeSheet()
              }
              setSheetDragY(0)
              setIsDragging(false)
            }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 51,
              backgroundColor: 'var(--color-surface)',
              borderRadius: '20px 20px 0 0',
              padding: '0 0 32px',
              maxHeight: '80vh',
              overflowY: isDragging ? 'hidden' : 'auto',
              transform: sheetVisible ? `translateY(${sheetDragY}px)` : 'translateY(100%)',
              transition: isDragging ? 'none' : 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            {/* Handle + header */}
            <div style={{ position: 'sticky', top: 0, backgroundColor: 'var(--color-surface)', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid var(--color-border)', zIndex: 1 }}>
              <div style={{ width: 36, height: 4, borderRadius: 999, backgroundColor: 'var(--color-border-dark)', margin: '0 auto 14px' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>Filters</p>
                <button
                  onClick={closeSheet}
                  style={{ width: 32, height: 32, borderRadius: 999, border: '1px solid var(--color-border)', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            <div style={{ padding: '20px 20px 0' }}>
              {/* Game */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 10 }}>Game</p>
                {([
                  { label: 'All', value: null as Game | null },
                  { label: 'Pokémon TCG', value: 'pokemon' as Game },
                  { label: 'One Piece TCG', value: 'one_piece' as Game },
                ]).map(({ label, value }) => (
                  <button key={label} onClick={() => setGame(value)} style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '11px 14px', borderRadius: 'var(--radius-full)',
                    fontSize: 15, border: 'none', cursor: 'pointer', marginBottom: 4,
                    backgroundColor: activeGame === value ? '#E8E8E8' : 'transparent',
                    color: activeGame === value ? 'var(--brand-blue)' : 'var(--color-text)',
                    fontWeight: activeGame === value ? 600 : 400,
                  }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Language */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 10 }}>Language</p>
                {([
                  { label: 'All', value: null as string | null },
                  { label: 'English', value: 'EN' },
                  { label: 'Japanese', value: 'JP' },
                ]).map(({ label, value }) => (
                  <button key={label} onClick={() => setLanguage(value)} style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '11px 14px', borderRadius: 'var(--radius-full)',
                    fontSize: 15, border: 'none', cursor: 'pointer', marginBottom: 4,
                    backgroundColor: activeLanguage === value ? '#E8E8E8' : 'transparent',
                    color: activeLanguage === value ? 'var(--brand-blue)' : 'var(--color-text)',
                    fontWeight: activeLanguage === value ? 600 : 400,
                  }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Category */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 10 }}>Category</p>
                {([{ label: 'Singles', value: 'singles' }, { label: 'Sealed Products', value: 'sealed' }]).map(({ label, value }) => (
                  <button key={value} onClick={() => setCategory(value)} style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '11px 14px', borderRadius: 'var(--radius-full)',
                    fontSize: 15, border: 'none', cursor: 'pointer', marginBottom: 4,
                    backgroundColor: activeCategory === value ? '#E8E8E8' : 'transparent',
                    color: activeCategory === value ? 'var(--brand-blue)' : 'var(--color-text)',
                    fontWeight: activeCategory === value ? 600 : 400,
                  }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Expansion */}
              {activeGame && availableSets.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 10 }}>Expansion</p>
                  <button onClick={() => setSet(null)} style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '11px 14px', borderRadius: 'var(--radius-full)',
                    fontSize: 15, border: 'none', cursor: 'pointer', marginBottom: 4,
                    backgroundColor: activeSet === null ? '#E8E8E8' : 'transparent',
                    color: activeSet === null ? 'var(--brand-blue)' : 'var(--color-text)',
                    fontWeight: activeSet === null ? 600 : 400,
                  }}>All expansions</button>
                  {availableSets.map(([code, name]) => (
                    <button key={code} onClick={() => setSet(code)} style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '11px 14px', borderRadius: 'var(--radius-full)',
                      fontSize: 15, border: 'none', cursor: 'pointer', marginBottom: 4,
                      backgroundColor: activeSet === code ? '#E8E8E8' : 'transparent',
                      color: activeSet === code ? 'var(--brand-blue)' : 'var(--color-text)',
                      fontWeight: activeSet === code ? 600 : 400,
                    }}>{name}</button>
                  ))}
                </div>
              )}

              {/* Condition legend */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 10 }}>Condition</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(Object.keys(CONDITION_LABELS) as Condition[]).map(c => (
                    <span key={c} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '5px 12px', borderRadius: 999,
                      fontSize: 13, fontWeight: 500,
                      backgroundColor: COND_BG[c], color: COND_COLOR[c],
                    }}>
                      {c} — {CONDITION_LABELS[c]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
