import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import type { Condition, Game, Listing as GlobalListing } from '../types'
import { CONDITION_LABELS, GAME_LABELS } from '../types'
import { useCart } from '../hooks/useCart'
import { useFlyCart } from '../hooks/useFlyCart'
import { useIsMobile } from '../hooks/useIsMobile'
import { supabase } from '../lib/supabase'
import { setPageMeta, setJsonLd, removeJsonLd } from '../lib/pageMeta'

type Listing = {
  id: string
  price_chf: number
  condition: Condition
  quantity: number
  scan_front: string
  scan_back?: string
  scan_preview?: string
  condition_note?: string
  is_active: boolean
  created_at: string
  card_id: string
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

const COND_BG: Record<Condition, string> = {
  NM: '#E8F5E9', LP: '#F3E5F5', MP: '#FFF8E1', HP: '#FBE9E7', DMG: '#FFEBEE'
}
const COND_COLOR: Record<Condition, string> = {
  NM: '#2E7D32', LP: '#6A1B9A', MP: '#F57F17', HP: '#BF360C', DMG: '#B71C1C'
}

export default function CardDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { addItem, items } = useCart()
  const { flyToCart } = useFlyCart()
  const addToCartBtnRef = useRef<HTMLButtonElement>(null)
  const [scanSide, setScanSide] = useState<'front' | 'back'>('front')
  const [added, setAdded] = useState(false)
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [modalMagnifier, setModalMagnifier] = useState({ active: false, x: 0, y: 0, bgX: 0, bgY: 0 })
  const [stickyHidden, setStickyHidden] = useState(false)
  const [swipeHintVisible, setSwipeHintVisible] = useState(true)
  const [seriesListings, setSeriesListings] = useState<Array<{
    id: string; scan_front: string | null; card_number: string; name_en: string
  }>>([])
  const [seriesVisible, setSeriesVisible] = useState(true)
  const [hoveredSeries, setHoveredSeries] = useState<'prev' | 'next' | null>(null)
  const [scanFade, setScanFade] = useState(1)
  const [viewerHovered, setViewerHovered] = useState(false)
  const userInteractedAt = useRef(0)
  const carouselFadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const thumbnailStripRef = useRef<HTMLDivElement>(null)
  const modalImgRef = useRef<HTMLDivElement>(null)
  const isNavigatingSeries = useRef(false)
  const touchStartX = useRef(0)
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  const stickyObserver = useRef<IntersectionObserver | null>(null)

  // Callback ref: creates/destroys IntersectionObserver whenever the inline
  // Add-to-cart button mounts or isMobile changes — no stale-dep race condition.
  const offerRef = useCallback((el: HTMLDivElement | null) => {
    if (stickyObserver.current) { stickyObserver.current.disconnect(); stickyObserver.current = null }
    if (!el || !isMobile) return
    stickyObserver.current = new IntersectionObserver(
      ([entry]) => setStickyHidden(entry.isIntersecting),
      { threshold: 0 }
    )
    stickyObserver.current.observe(el)
  }, [isMobile])

  useEffect(() => {
    if (!id) return

    async function fetchListing() {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('listings')
        .select('*, card:cards(*)')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) {
        setError(error.message)
      } else {
        setListing(data as Listing)
      }
      setLoading(false)
    }

    fetchListing()
  }, [id])

  // Update page meta when listing loads
  useEffect(() => {
    if (!listing) return
    const title = `${listing.card.name_en} ${listing.condition} — ${listing.card.set_name}`
    const desc = `${listing.card.name_en} in ${listing.condition} condition from ${listing.card.set_name}. CHF ${Number(listing.price_chf).toFixed(2)}. Scan-verified TCG single — ships from Zürich, Switzerland.`
    setPageMeta(title, desc)
    setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: listing.card.name_en,
      description: `${listing.card.set_name} — ${listing.condition}`,
      image: listing.scan_front,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'CHF',
        price: Number(listing.price_chf).toFixed(2),
        availability: listing.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: '1624 Cards' },
      },
    })
    return () => removeJsonLd()
  }, [listing])

  // Always default to Preview tab when listing loads
  useEffect(() => {
    if (!listing) return
    setScanSide('front')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing?.id])

  // Fetch other listings from the same set for the thumbnail strip
  useEffect(() => {
    if (!listing) return
    async function fetchSeries() {
      const { data: cardRows, error: cardsError } = await supabase
        .from('cards')
        .select('id')
        .eq('set_code', listing!.card.set_code)
      if (cardsError || !cardRows) return
      const cardIds = cardRows.map((r: { id: string }) => r.id)
      if (!cardIds.length) return
      const { data, error: listingsError } = await supabase
        .from('listings')
        .select('id, scan_front, card:cards(card_number, name_en)')
        .in('card_id', cardIds)
        .eq('is_active', true)
        .limit(60)
      if (listingsError || !data) return
      setSeriesListings(
        (data as Array<{ id: string; scan_front: string | null; card: Array<{ card_number: string; name_en: string }> }>)
          .map(d => ({
            id: d.id,
            scan_front: d.scan_front,
            card_number: d.card[0]?.card_number ?? '',
            name_en: d.card[0]?.name_en ?? '',
          })).sort((a, b) => a.card_number.localeCompare(b.card_number, undefined, { numeric: true }))
      )
    }
    fetchSeries()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing?.card.set_code])

  // Auto-hide swipe hint after 2.5s
  useEffect(() => {
    if (!isMobile || !seriesListings.length) return
    setSwipeHintVisible(true)
    const t = setTimeout(() => setSwipeHintVisible(false), 2500)
    return () => clearTimeout(t)
  }, [listing?.id, isMobile, seriesListings.length])

  // Auto-play carousel on the main viewer (pauses on hover or after user interaction)
  useEffect(() => {
    if (!listing || expanded) return
    const available = (
      [
        { key: 'front' as const, src: listing.scan_front },
        { key: 'back'  as const, src: listing.scan_back  },
      ] as const
    ).filter(s => s.src).map(s => s.key)
    if (available.length < 2) return
    const timer = setInterval(() => {
      if (viewerHovered || Date.now() - userInteractedAt.current < 4000) return
      setScanFade(0)
      carouselFadeTimer.current = setTimeout(() => {
        setScanSide(current => {
          const idx = available.indexOf(current)
          return available[(idx + 1) % available.length]
        })
        setScanFade(1)
      }, 250)
    }, 3500)
    return () => {
      clearInterval(timer)
      if (carouselFadeTimer.current) clearTimeout(carouselFadeTimer.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing?.id, expanded, viewerHovered])

  // Keyboard navigation — slides when modal open, series when closed
  useEffect(() => {
    if (!listing) return
    const slideKeys = ['front', 'back'] as const
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      if (expanded) {
        if (e.key === 'Escape') { setExpanded(false); setModalMagnifier(m => ({ ...m, active: false })); e.preventDefault() }
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          const idx = slideKeys.indexOf(scanSide)
          const prev = slideKeys[idx - 1]
          if (prev) { setScanSide(prev); setModalMagnifier(m => ({ ...m, active: false })) }
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          const idx = slideKeys.indexOf(scanSide)
          const next = slideKeys[idx + 1]
          if (next) { setScanSide(next); setModalMagnifier(m => ({ ...m, active: false })) }
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault()
          if (!seriesListings.length) return
          const sIdx = seriesListings.findIndex(l => l.id === listing!.id)
          if (e.key === 'ArrowUp') { const p = seriesListings[sIdx - 1]; if (p) navigateToSeries(p.id) }
          else { const n = seriesListings[sIdx + 1]; if (n) navigateToSeries(n.id) }
        }
      } else {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          const prev = modalSlides[modalIdx - 1]
          if (prev) goToSide(prev.key)
          return
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          const next = modalSlides[modalIdx + 1]
          if (next) goToSide(next.key)
          return
        }
        if (!seriesListings.length) return
        if (!['ArrowUp','ArrowDown'].includes(e.key)) return
        e.preventDefault()
        const idx = seriesListings.findIndex(l => l.id === listing.id)
        if (e.key === 'ArrowDown') { const n = seriesListings[idx + 1]; if (n) navigateToSeries(n.id) }
        else { const p = seriesListings[idx - 1]; if (p) navigateToSeries(p.id) }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesListings, listing?.id, expanded, scanSide])

  // Scroll active thumbnail into view when series or listing changes
  useEffect(() => {
    if (!isMobile || !thumbnailStripRef.current) return
    const active = thumbnailStripRef.current.querySelector('[data-active="true"]') as HTMLElement | null
    active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [listing?.id, isMobile, seriesListings.length])

  if (loading) {
    return (
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 13px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(300px, 475px) 1fr', gap: 48 }}>
          <div style={{ aspectRatio: '2.5/3.5', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }} />
          <div style={{ paddingTop: 8 }}>
            <div style={{ height: 16, width: 80, backgroundColor: 'var(--color-bg)', borderRadius: 4, marginBottom: 16 }} />
            <div style={{ height: 32, width: '60%', backgroundColor: 'var(--color-bg)', borderRadius: 4, marginBottom: 12 }} />
            <div style={{ height: 16, width: '40%', backgroundColor: 'var(--color-bg)', borderRadius: 4 }} />
          </div>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '80px 13px', textAlign: 'center' }}>
        <p style={{ fontSize: 18, color: 'var(--color-text-muted)', marginBottom: 16 }}>Card not found.</p>
        <Link to="/catalog" style={{ color: 'var(--brand-blue)', fontSize: 14 }}>← Back to catalog</Link>
      </div>
    )
  }

  const inCart = items.find(i => i.listing.id === listing.id)
  const canAdd = !inCart || inCart.quantity < listing.quantity

  const modalSlides = [
    { key: 'front' as const, label: 'Front', src: listing.scan_front },
    { key: 'back'  as const, label: 'Back',  src: listing.scan_back  },
  ]
  const modalIdx = modalSlides.findIndex(s => s.key === scanSide)
  const activeSrc = modalSlides[modalIdx]?.src

  function prevSlide() {
    const prev = modalSlides[modalIdx - 1]
    if (prev) { setScanSide(prev.key); setModalMagnifier(m => ({ ...m, active: false })) }
  }
  function nextSlide() {
    const next = modalSlides[modalIdx + 1]
    if (next) { setScanSide(next.key); setModalMagnifier(m => ({ ...m, active: false })) }
  }

  const seriesIdx = seriesListings.findIndex(l => l.id === listing.id)


  async function navigateToSeries(targetId: string) {
    if (!targetId || targetId === listing?.id || isNavigatingSeries.current) return
    isNavigatingSeries.current = true
    setSeriesVisible(false)
    try {
      // Fetch and fade-out run in parallel — no wasted time waiting for network
      const [, { data, error }] = await Promise.all([
        new Promise(r => setTimeout(r, 325)),
        supabase.from('listings').select('*, card:cards(*)').eq('id', targetId).eq('is_active', true).single(),
      ])
      if (data && !error) {
        setListing(data as Listing)
        setScanSide('front')
        setAdded(false)
        navigate(`/card/${targetId}`, { replace: true })
      }
    } finally {
      // Always restore visibility and release the lock, even on network failure
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setSeriesVisible(true)
        isNavigatingSeries.current = false
      }))
    }
  }

  function goToSide(side: 'front' | 'back') {
    if (side === scanSide) return
    userInteractedAt.current = Date.now()
    setScanFade(0)
    setTimeout(() => {
      setScanSide(side)
      setScanFade(1)
    }, 250)
  }

  function handleAddToCart() {
    addItem(listing as unknown as GlobalListing)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
    if (addToCartBtnRef.current && listing) {
      flyToCart(addToCartBtnRef.current.getBoundingClientRect(), listing.scan_front)
    }
  }

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: isMobile ? '16px 9px 100px' : '32px 13px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: isMobile ? 16 : 28, fontSize: 13, color: 'var(--color-text-faint)' }}>
        <Link to="/catalog" style={{ color: 'var(--color-text-muted)' }}>Catalog</Link>
        <span>/</span>
        <Link to={`/catalog?game=${listing.card.game}`} style={{ color: 'var(--color-text-muted)' }}>{GAME_LABELS[listing.card.game]}</Link>
        <span>/</span>
        <span style={{ color: 'var(--color-text)' }}>{listing.card.name_en}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(300px, 475px) minmax(300px, 500px)', gap: isMobile ? 24 : 48, alignItems: 'start', opacity: seriesVisible ? 1 : 0, transform: seriesVisible ? 'none' : 'translateY(8px)', transition: 'opacity 0.33s cubic-bezier(0.4,0,0.2,1), transform 0.33s cubic-bezier(0.4,0,0.2,1)' }}>

        {/* Scan viewer */}
        <div style={{ minWidth: 0 }}>
          {/* Thumbnail strip — all devices */}
          {seriesListings.length > 1 && (
            <div
              ref={thumbnailStripRef}
              style={{
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                marginBottom: 12,
                paddingBottom: 4,
                paddingLeft: 2,
                paddingRight: 2,
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch',
                scrollSnapType: 'x mandatory',
                width: '100%',
              } as React.CSSProperties}
            >
              {seriesListings.map(s => (
                <Link
                  key={s.id}
                  to={`/card/${s.id}`}
                  data-active={s.id === listing.id ? 'true' : 'false'}
                  onClick={e => { e.preventDefault(); navigateToSeries(s.id) }}
                  style={{
                    flexShrink: 0,
                    scrollSnapAlign: 'start',
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                    overflow: 'hidden',
                    border: s.id === listing.id
                      ? '2px solid var(--brand-blue)'
                      : '2px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'border-color 0.15s',
                  }}
                >
                  {s.scan_front ? (
                    <img src={s.scan_front} alt={s.name_en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 9, color: 'var(--color-text-faint)', textAlign: 'center', padding: 2 }}>
                      #{s.card_number}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}

          <div
            onMouseEnter={() => setViewerHovered(true)}
            onMouseLeave={() => setViewerHovered(false)}
            onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
            onTouchEnd={e => {
              const delta = touchStartX.current - e.changedTouches[0].clientX
              if (Math.abs(delta) < 40) return
              e.preventDefault()
              if (delta > 0 && modalIdx < modalSlides.length - 1) goToSide(modalSlides[modalIdx + 1].key)
              else if (delta < 0 && modalIdx > 0) goToSide(modalSlides[modalIdx - 1].key)
            }}
            style={{
            aspectRatio: '2.5/3.5',
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12, position: 'relative', overflow: 'hidden',
            cursor: 'pointer',
          }}
            onClick={() => setExpanded(true)}
          >
            {/* Left/right slide arrows */}
            {modalIdx > 0 && (
              <button
                onClick={e => { e.stopPropagation(); goToSide(modalSlides[modalIdx - 1].key) }}
                style={{
                  position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                  zIndex: 2, width: 36, height: 36, borderRadius: '50%',
                  backgroundColor: '#fff', border: 'none',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', opacity: 1,
                  transition: 'opacity 0.2s ease',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-800)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
            )}
            {modalIdx < modalSlides.length - 1 && (
              <button
                onClick={e => { e.stopPropagation(); goToSide(modalSlides[modalIdx + 1].key) }}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  zIndex: 2, width: 36, height: 36, borderRadius: '50%',
                  backgroundColor: '#fff', border: 'none',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', opacity: 1,
                  transition: 'opacity 0.2s ease',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-800)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            )}
            {/* Dot indicators */}
            <div style={{
              position: 'absolute', bottom: 44, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 5, zIndex: 2, pointerEvents: 'none',
            }}>
              {modalSlides.map((s, i) => (
                <div key={s.key} style={{
                  height: 4,
                  width: i === modalIdx ? 16 : 4,
                  borderRadius: 999,
                  backgroundColor: i === modalIdx ? '#fff' : 'rgba(255,255,255,0.45)',
                  transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1), background 0.2s ease',
                }} />
              ))}
            </div>
            {(() => {
              const src =
                scanSide === 'front' ? listing.scan_front :
                                       listing.scan_back
              return src ? (
                <>
                  <img
                    src={src}
                    alt={`${listing.card.name_en} ${scanSide}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: scanFade, transition: 'opacity 0.22s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                  {/* Expand icon — always shown */}
                  <button
                    onClick={e => { e.stopPropagation(); setExpanded(true) }}
                    style={{
                      position: 'absolute', top: 10, right: 10,
                      width: 32, height: 32,
                      borderRadius: 8,
                      backgroundColor: '#fff',
                      border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                    }}
                  >
                    <svg width="14" height="14" fill="none" stroke="var(--neutral-800)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                      <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                    </svg>
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: 24 }}>
                  <>
                      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 4 }}>{listing.card.name_en}</p>
                      <p style={{ fontSize: 12, color: 'var(--color-text-faint)' }}>{listing.card.set_name} · #{listing.card.card_number}</p>
                    </>
                </div>
              )
            })()}
            <span style={{
              position: 'absolute', bottom: 10, right: 10,
              fontSize: 10, padding: '3px 7px', borderRadius: 4,
              backgroundColor: 'rgba(0,0,0,0.45)', color: '#fff',
              textTransform: 'capitalize',
            }}>
              {scanSide}
            </span>

            {/* Swipe hint — mobile only, fades out */}
            {isMobile && seriesListings.length > 1 && (
              <div style={{
                position: 'absolute',
                bottom: 48,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(6px)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                opacity: swipeHintVisible ? 1 : 0,
                transition: 'opacity 0.6s ease',
              }}>
                <svg width="12" height="16" viewBox="0 0 12 20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="2 6 6 2 10 6"/>
                  <polyline points="2 14 6 18 10 14"/>
                </svg>
                Swipe to browse
              </div>
            )}
          </div>

        </div>

        {/* Details */}
        <div>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 500, padding: '3px 8px',
            borderRadius: 'var(--radius-full)', marginBottom: 12,
            backgroundColor: 'var(--color-text)',
            color: '#fff',
          }}>
            {GAME_LABELS[listing.card.game]}
          </span>

          <h1 style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1, marginBottom: 4 }}>
            {listing.card.name_en}
          </h1>
          <p style={{ fontSize: 19, color: 'var(--color-text-muted)', marginBottom: 24 }}>
            {listing.card.set_name} · #{listing.card.card_number}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px', marginBottom: 28, padding: '20px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-lg)' }}>
            {[
              { label: 'Condition', value: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 4, backgroundColor: COND_BG[listing.condition], color: COND_COLOR[listing.condition], fontSize: 16, fontWeight: 500 }}>{listing.condition} — {CONDITION_LABELS[listing.condition]}</span> },
              { label: 'Rarity', value: listing.card.rarity },
              { label: 'Language', value: listing.card.language },

              { label: 'In stock', value: `${listing.quantity} cop${listing.quantity !== 1 ? 'ies' : 'y'}` },
              { label: 'Set', value: listing.card.set_code },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ fontSize: 14, color: 'var(--color-text-faint)', marginBottom: 2 }}>{label}</p>
                <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text)' }}>{value}</div>
              </div>
            ))}
          </div>

          {listing.condition_note && (
            <div style={{ padding: '12px 14px', backgroundColor: 'rgba(245,177,28,0.12)', borderRadius: 'var(--radius-md)', marginBottom: 24, border: '1px solid #F5B11C' }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--brand-gold-dark)', marginBottom: 3 }}>Condition note</p>
              <p style={{ fontSize: 16, color: 'var(--brand-gold-dark)', lineHeight: 1.5 }}>{listing.condition_note}</p>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 40, letterSpacing: '0.02em' }}>
              CHF {listing.price_chf.toFixed(2)}
            </span>
          </div>
          <div ref={offerRef}>
            <button
              ref={addToCartBtnRef}
              onClick={handleAddToCart}
              disabled={!canAdd}
              className={canAdd ? 'btn-primary' : ''}
              style={{
                padding: '13px 48px',
                backgroundColor: added ? 'var(--brand-blue-dark)' : canAdd ? 'var(--brand-blue)' : 'var(--color-border)',
                color: '#fff',
                borderRadius: 'var(--radius-full)', border: 'none',
                fontSize: 14, fontWeight: 600, cursor: canAdd ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.15s',
              }}
            >
              {added ? '✓ Added to cart' : inCart ? 'In cart' : 'Add to cart'}
            </button>
          </div>

          <p style={{ fontSize: 12, color: 'var(--color-text-faint)', marginTop: 12 }}>
            The scan shown is the exact physical card you will receive. All cards are scanned on a scanner glass at 400 DPI.
          </p>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      {isMobile && listing && (
        <div style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          zIndex: 100,
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          padding: '12px 16px calc(20px + env(safe-area-inset-bottom, 0px))',
          transform: stickyHidden ? 'translateY(100%)' : 'translateY(0)',
          transition: 'transform 0.25s ease',
          willChange: 'transform',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--color-text)' }}>
              CHF {listing.price_chf.toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!canAdd}
            className={canAdd ? 'btn-primary' : ''}
            style={{
              width: '100%', padding: '13px 0',
              backgroundColor: added ? 'var(--brand-blue-dark)' : canAdd ? 'var(--brand-blue)' : 'var(--color-border)',
              color: '#fff',
              borderRadius: 'var(--radius-md)', border: 'none',
              fontSize: 14, fontWeight: 600, cursor: canAdd ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.15s',
            }}
          >
            {added ? '✓ Added' : inCart ? 'In cart' : 'Add to cart'}
          </button>
        </div>
      )}

      {/* Expanded scan modal */}
      {expanded && (
        <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
              {/* Top bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 64px 12px 16px', flexShrink: 0, borderBottom: '1px solid var(--color-border)' }}>
                {modalSlides.map((s, i) => (
                  <button key={s.key} onClick={() => { setScanSide(s.key); setModalMagnifier(m => ({ ...m, active: false })) }} style={{
                    padding: '7px 18px', borderRadius: 'var(--radius-full)',
                    border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                    backgroundColor: i === modalIdx ? 'var(--color-text)' : 'var(--color-bg)',
                    color: i === modalIdx ? '#fff' : 'var(--color-text-muted)',
                    transition: 'all 0.15s',
                  }}>
                    {s.label}
                  </button>
                ))}
                {/* Close */}
                <button
                  onClick={() => { setExpanded(false); setModalMagnifier(m => ({ ...m, active: false })) }}
                  style={{
                    position: 'absolute', top: 12, right: 12,
                    width: 44, height: 44, borderRadius: '50%',
                    backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <svg width="14" height="14" fill="none" stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round">
                    <line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/>
                  </svg>
                </button>
              </div>

              {/* Image area */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: isMobile ? '8px 64px' : '16px 80px', opacity: seriesVisible ? 1 : 0, transform: seriesVisible ? 'none' : 'translateY(6px)', transition: 'opacity 0.33s cubic-bezier(0.4,0,0.2,1), transform 0.33s cubic-bezier(0.4,0,0.2,1)' }}>
                {/* Series Up thumbnail — prev card */}
                {seriesIdx > 0 && (() => {
                  const prev = seriesListings[seriesIdx - 1]
                  const hov = hoveredSeries === 'prev'
                  return (
                    <button
                      onClick={() => navigateToSeries(prev.id)}
                      onMouseEnter={() => setHoveredSeries('prev')}
                      onMouseLeave={() => setHoveredSeries(null)}
                      style={{
                        position: 'absolute', top: 14, left: '50%',
                        transform: `translateX(-50%) translateY(${hov ? '-5px' : '0'}) scale(${hov ? 1.07 : 1})`,
                        zIndex: 3,
                        width: 50, aspectRatio: '2.5/3.5',
                        borderRadius: 8,
                        overflow: 'hidden',
                        border: '2px solid rgba(255,255,255,0.95)',
                        boxShadow: hov
                          ? '0 10px 30px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.14)'
                          : '0 4px 16px rgba(0,0,0,0.2), 0 1px 4px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        padding: 0, backgroundColor: 'var(--color-bg)',
                        outline: 'none',
                        transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease',
                      }}
                    >
                      {prev.scan_front
                        ? <img src={prev.scan_front} alt={prev.name_en} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'var(--color-text-faint)', textAlign: 'center' }}>#{prev.card_number}</div>
                      }
                    </button>
                  )
                })()}

                {/* Series Down thumbnail — next card */}
                {seriesIdx >= 0 && seriesIdx < seriesListings.length - 1 && (() => {
                  const next = seriesListings[seriesIdx + 1]
                  const hov = hoveredSeries === 'next'
                  return (
                    <button
                      onClick={() => navigateToSeries(next.id)}
                      onMouseEnter={() => setHoveredSeries('next')}
                      onMouseLeave={() => setHoveredSeries(null)}
                      style={{
                        position: 'absolute', bottom: 14, left: '50%',
                        transform: `translateX(-50%) translateY(${hov ? '5px' : '0'}) scale(${hov ? 1.07 : 1})`,
                        zIndex: 3,
                        width: 50, aspectRatio: '2.5/3.5',
                        borderRadius: 8,
                        overflow: 'hidden',
                        border: '2px solid rgba(255,255,255,0.95)',
                        boxShadow: hov
                          ? '0 10px 30px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.14)'
                          : '0 4px 16px rgba(0,0,0,0.2), 0 1px 4px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        padding: 0, backgroundColor: 'var(--color-bg)',
                        outline: 'none',
                        transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease',
                      }}
                    >
                      {next.scan_front
                        ? <img src={next.scan_front} alt={next.name_en} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'var(--color-text-faint)', textAlign: 'center' }}>#{next.card_number}</div>
                      }
                    </button>
                  )
                })()}

                {/* Prev arrow */}
                <button onClick={prevSlide} disabled={modalIdx === 0} style={{
                  position: 'absolute', left: isMobile ? 12 : 'calc(50% - 422px)', top: '50%', transform: 'translateY(-50%)', zIndex: 2,
                  width: 48, height: 48, borderRadius: '50%',
                  backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)',
                  cursor: modalIdx === 0 ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: modalIdx === 0 ? 0.3 : 1,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>

                {/* Card image — fixed aspect ratio, magnifier only on front/back */}
                <div
                  ref={modalImgRef}
                  style={{
                    position: 'relative',
                    height: 'min(calc(100vh - 160px), 1006px)',
                    aspectRatio: '2.5/3.5',
                    borderRadius: 12,
                    overflow: 'hidden',
                    flexShrink: 0,
                    cursor: activeSrc && !isMobile ? 'crosshair' : 'default',
                  }}
                  onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
                  onTouchEnd={e => {
                    const delta = touchStartX.current - e.changedTouches[0].clientX
                    if (Math.abs(delta) < 40) return
                    e.preventDefault()
                    if (delta > 0 && modalIdx < modalSlides.length - 1) { setScanSide(modalSlides[modalIdx + 1].key); setModalMagnifier(m => ({ ...m, active: false })) }
                    else if (delta < 0 && modalIdx > 0) { setScanSide(modalSlides[modalIdx - 1].key); setModalMagnifier(m => ({ ...m, active: false })) }
                  }}
                  onMouseMove={e => {
                    if (!activeSrc || isMobile) return
                    const rect = modalImgRef.current!.getBoundingClientRect()
                    const zoom = 2.55, lensSize = 160, half = lensSize / 2
                    const cursorX = e.clientX - rect.left
                    const cursorY = e.clientY - rect.top
                    const imgW = rect.width * zoom
                    const imgH = rect.height * zoom
                    const bgX = Math.min(0, Math.max(lensSize - imgW, -(cursorX * zoom - half)))
                    const bgY = Math.min(0, Math.max(lensSize - imgH, -(cursorY * zoom - half)))
                    setModalMagnifier({ active: true, x: cursorX, y: cursorY, bgX, bgY })
                  }}
                  onMouseLeave={() => setModalMagnifier(m => ({ ...m, active: false }))}
                >
                  {activeSrc ? (
                    <>
                      <img src={activeSrc} alt={`${listing.card.name_en} ${modalSlides[modalIdx]?.label}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {modalMagnifier.active && (
                        <div style={{
                          position: 'absolute',
                          width: 160, height: 160, borderRadius: '50%',
                          border: '2.5px solid rgba(255,255,255,0.9)',
                          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                          pointerEvents: 'none',
                          left: modalMagnifier.x - 80, top: modalMagnifier.y - 80, zIndex: 10,
                          backgroundImage: `url(${activeSrc})`,
                          backgroundSize: `${modalImgRef.current ? modalImgRef.current.offsetWidth * 2.55 : 900}px ${modalImgRef.current ? modalImgRef.current.offsetHeight * 2.55 : 1260}px`,
                          backgroundPosition: `${modalMagnifier.bgX}px ${modalMagnifier.bgY}px`,
                          backgroundRepeat: 'no-repeat',
                        }} />
                      )}
                    </>
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
                      <p style={{ color: 'var(--color-text-faint)', fontSize: 14 }}>No scan available</p>
                    </div>
                  )}
                </div>

                {/* Next arrow */}
                <button onClick={nextSlide} disabled={modalIdx === modalSlides.length - 1} style={{
                  position: 'absolute', right: isMobile ? 12 : 'calc(50% - 422px)', top: '50%', transform: 'translateY(-50%)', zIndex: 2,
                  width: 48, height: 48, borderRadius: '50%',
                  backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)',
                  cursor: modalIdx === modalSlides.length - 1 ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: modalIdx === modalSlides.length - 1 ? 0.3 : 1,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>

              {/* Bottom sheet — price + add to cart */}
              <div style={{ borderTop: '1px solid var(--color-border)', padding: '12px 16px 16px', flexShrink: 0, opacity: seriesVisible ? 1 : 0, transition: 'opacity 0.33s cubic-bezier(0.4,0,0.2,1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, color: 'var(--color-text-faint)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {listing.card.name_en} · {listing.card.set_name}
                    </p>
                    <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--color-text)' }}>
                      CHF {listing.price_chf.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => { handleAddToCart(); setExpanded(false); navigate('/catalog') }}
                    disabled={!canAdd}
                    className={canAdd ? 'btn-primary' : ''}
                    style={{
                      padding: '11px 22px',
                      backgroundColor: canAdd ? 'var(--brand-blue)' : 'var(--color-border)',
                      color: '#fff',
                      borderRadius: 'var(--radius-md)', border: 'none',
                      fontSize: 14, fontWeight: 600, cursor: canAdd ? 'pointer' : 'not-allowed',
                      transition: 'background-color 0.15s', whiteSpace: 'nowrap', flexShrink: 0,
                    }}
                  >
                    {inCart ? 'In cart' : 'Add to cart'}
                  </button>
                </div>
                <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-text-faint)' }}>
                  {modalIdx + 1} / {modalSlides.length} · ← → switch scan{seriesListings.length > 1 ? ' · ↑ ↓ browse series' : ''}{!isMobile ? ' · hover to magnify' : ''}
                </p>
              </div>
        </div>
      )}
    </div>
  )
}
