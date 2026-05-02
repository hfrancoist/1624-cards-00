import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Condition, Game } from '../types'
import { CONDITION_LABELS, GAME_LABELS } from '../types'
import { useCart } from '../hooks/useCart'
import { supabase } from '../lib/supabase'

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

const COND_BG: Record<Condition, string> = { NM: 'var(--brand-gold-lighter)', LP: 'rgba(245,177,28,0.12)', MP: '#FAECE7', HP: '#FCEBEB', DMG: '#F1EFE8' }
const COND_COLOR: Record<Condition, string> = { NM: 'var(--brand-blue-dark)', LP: 'var(--brand-gold-dark)', MP: '#712B13', HP: '#791F1F', DMG: '#444441' }

export default function CardDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { addItem, items } = useCart()
  const [scanSide, setScanSide] = useState<'preview' | 'front' | 'back'>('front')
  const [added, setAdded] = useState(false)
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showOffer, setShowOffer] = useState(false)
  const [offerValue, setOfferValue] = useState('')
  const [offerAdded, setOfferAdded] = useState(false)
  const [magnifier, setMagnifier] = useState({ active: false, x: 0, y: 0, bgX: 0, bgY: 0 })
  const imgRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [modalMagnifier, setModalMagnifier] = useState({ active: false, x: 0, y: 0, bgX: 0, bgY: 0 })
  const modalImgRef = useRef<HTMLDivElement>(null)

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

  // Always default to Preview tab when listing loads
  useEffect(() => {
    if (!listing) return
    setScanSide('preview')
  }, [listing?.id])

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 380px) 1fr', gap: 48 }}>
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
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 18, color: 'var(--color-text-muted)', marginBottom: 16 }}>Card not found.</p>
        <Link to="/catalog" style={{ color: 'var(--brand-blue)', fontSize: 14 }}>← Back to catalog</Link>
      </div>
    )
  }

  const inCart = items.find(i => i.listing.id === listing.id)
  const canAdd = !inCart || inCart.quantity < listing.quantity

  function handleAddToCart() {
    addItem(listing as any)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 28, fontSize: 13, color: 'var(--color-text-faint)' }}>
        <Link to="/catalog" style={{ color: 'var(--color-text-muted)' }}>Catalog</Link>
        <span>/</span>
        <Link to={`/catalog?game=${listing.card.game}`} style={{ color: 'var(--color-text-muted)' }}>{GAME_LABELS[listing.card.game]}</Link>
        <span>/</span>
        <span style={{ color: 'var(--color-text)' }}>{listing.card.name_en}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 380px) 1fr', gap: 48, alignItems: 'start' }}>

        {/* Scan viewer */}
        <div>
          <div style={{
            aspectRatio: '2.5/3.5',
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12, position: 'relative', overflow: 'hidden',
            cursor: (scanSide === 'front' || scanSide === 'back') ? 'pointer' : 'default',
          }}
            onClick={() => { if (scanSide === 'front' || scanSide === 'back') setExpanded(true) }}
          >
            {(() => {
              const src =
                scanSide === 'preview' ? listing.scan_preview :
                scanSide === 'front'   ? listing.scan_front :
                                         listing.scan_back
              return src ? (
                <>
                  <img
                    src={src}
                    alt={`${listing.card.name_en} ${scanSide}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Expand icon — front/back only */}
                  {(scanSide === 'front' || scanSide === 'back') && (
                    <div style={{
                      position: 'absolute', bottom: 10, left: 10,
                      width: 32, height: 32,
                      borderRadius: 8,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      pointerEvents: 'none',
                    }}>
                      <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                        <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                      </svg>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: 24 }}>
                  {scanSide === 'preview' ? (
                    <>
                      <svg width="32" height="32" fill="none" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 10, opacity: 0.5 }} viewBox="0 0 24 24">
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                        <circle cx="12" cy="13" r="3"/>
                      </svg>
                      <p style={{ fontSize: 13, color: 'var(--color-text-faint)' }}>No preview image yet</p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 4 }}>{listing.card.name_en}</p>
                      <p style={{ fontSize: 12, color: 'var(--color-text-faint)' }}>{listing.card.set_name} · #{listing.card.card_number}</p>
                    </>
                  )}
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
          </div>

          {/* 3-tab segmented control — Preview always visible, Front/Back only when scans exist */}
          <div style={{
            display: 'flex', gap: 6,
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 4,
          }}>
            {([
              { key: 'preview', label: 'Preview', show: true },
              { key: 'front',   label: 'Front',   show: true },
              { key: 'back',    label: 'Back',     show: true },
            ] as const).filter(t => t.show).map(tab => (
              <button
                key={tab.key}
                onClick={() => setScanSide(tab.key)}
                style={{
                  flex: 1, padding: '7px 4px',
                  borderRadius: 'calc(var(--radius-md) - 2px)',
                  fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  border: 'none',
                  backgroundColor: scanSide === tab.key ? 'var(--color-text)' : 'transparent',
                  color: scanSide === tab.key ? '#fff' : 'var(--color-text-muted)',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 500, padding: '3px 8px',
            borderRadius: 'var(--radius-full)', marginBottom: 12,
            backgroundColor: listing.card.game === 'pokemon' ? '#FFF7D6' : 'var(--color-text)',
            color: listing.card.game === 'pokemon' ? '#B8960A' : '#fff',
          }}>
            {GAME_LABELS[listing.card.game]}
          </span>

          <h1 style={{ fontSize: 32, fontWeight: 500, lineHeight: 1.1, marginBottom: 4 }}>
            {listing.card.name_en}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)', marginBottom: 24 }}>
            {listing.card.set_name} · #{listing.card.card_number}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px', marginBottom: 28, padding: '20px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-lg)' }}>
            {[
              { label: 'Condition', value: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 4, backgroundColor: COND_BG[listing.condition], color: COND_COLOR[listing.condition], fontSize: 13, fontWeight: 500 }}>{listing.condition} — {CONDITION_LABELS[listing.condition]}</span> },
              { label: 'Rarity', value: listing.card.rarity },
              { label: 'Language', value: listing.card.language },
              { label: 'Edition', value: listing.card.edition ?? 'Standard' },
              { label: 'In stock', value: `${listing.quantity} cop${listing.quantity !== 1 ? 'ies' : 'y'}` },
              { label: 'Set', value: listing.card.set_code },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ fontSize: 11, color: 'var(--color-text-faint)', marginBottom: 2 }}>{label}</p>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>{value}</div>
              </div>
            ))}
          </div>

          {listing.condition_note && (
            <div style={{ padding: '12px 14px', backgroundColor: 'rgba(245,177,28,0.12)', borderRadius: 'var(--radius-md)', marginBottom: 24, border: '1px solid #F5B11C' }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--brand-gold-dark)', marginBottom: 3 }}>Condition note</p>
              <p style={{ fontSize: 13, color: 'var(--brand-gold-dark)', lineHeight: 1.5 }}>{listing.condition_note}</p>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 40, letterSpacing: '0.02em' }}>
              CHF {listing.price_chf.toFixed(2)}
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-text-faint)' }}>incl. VAT</span>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 0 }}>
            <button
              onClick={handleAddToCart}
              disabled={!canAdd}
              style={{
                flex: 1, padding: '13px 24px',
                backgroundColor: added ? 'var(--brand-blue-dark)' : canAdd ? 'var(--brand-blue)' : 'var(--color-border)',
                color: '#fff',
                borderRadius: 'var(--radius-md)', border: 'none',
                fontSize: 14, fontWeight: 500, cursor: canAdd ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s',
              }}
            >
              {added ? '✓ Added to cart' : inCart ? 'Add another' : 'Add to cart'}
            </button>
            <button
              onClick={() => { setShowOffer(o => !o); setOfferValue(''); setOfferAdded(false) }}
              style={{
                padding: '13px 20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: 14, fontWeight: 500,
                color: showOffer ? 'var(--brand-blue)' : 'var(--color-text-muted)',
                backgroundColor: showOffer ? 'var(--brand-blue-lighter)' : 'var(--color-surface)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              Make an offer
            </button>
          </div>

          {/* Offer panel */}
          {showOffer && (() => {
            const minOffer = Math.ceil(listing.price_chf * 0.9 * 20) / 20  // 10% floor, internal only
            const offerNum = parseFloat(offerValue)
            const isValid = !isNaN(offerNum) && offerNum >= minOffer && offerNum > 0
            const isTooLow = !isNaN(offerNum) && offerValue !== '' && offerNum < minOffer

            function handleOfferAdd() {
              if (!isValid) return
              addItem({ ...listing!, price_chf: offerNum } as any)
              setOfferAdded(true)
              setTimeout(() => { setShowOffer(false); setOfferAdded(false) }, 1800)
            }

            return (
              <div style={{
                marginTop: 12,
                padding: '16px 18px',
                border: '1px solid var(--brand-blue-lighter)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--brand-blue-lighter)',
              }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-blue-dark)', marginBottom: 12 }}>
                  Name your price
                </p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{
                      position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                      fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)',
                      pointerEvents: 'none',
                    }}>CHF</span>
                    <input
                      type="number"
                      min={minOffer}
                      step="0.05"
                      value={offerValue}
                      onChange={e => { setOfferValue(e.target.value); setOfferAdded(false) }}
                      placeholder="0.00"
                      style={{
                        width: '100%', padding: '10px 12px 10px 44px',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${isTooLow ? '#d9534f' : isValid ? 'var(--brand-blue)' : 'var(--color-border)'}`,
                        fontSize: 14, fontWeight: 500,
                        backgroundColor: '#fff',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <button
                    onClick={handleOfferAdd}
                    disabled={!isValid}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      fontSize: 14, fontWeight: 500,
                      backgroundColor: offerAdded ? 'var(--brand-blue-dark)' : isValid ? 'var(--brand-blue)' : 'var(--color-border)',
                      color: '#fff',
                      cursor: isValid ? 'pointer' : 'not-allowed',
                      transition: 'background 0.2s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {offerAdded ? '✓ Added' : 'Add to cart'}
                  </button>
                </div>
                {isTooLow && (
                  <p style={{ fontSize: 12, color: '#d9534f', marginTop: 6 }}>
                    Your offer is too low, please try a higher amount.
                  </p>
                )}
              </div>
            )
          })()}

          <p style={{ fontSize: 12, color: 'var(--color-text-faint)', marginTop: 12 }}>
            The scan shown is the exact physical card you will receive.
          </p>
        </div>
      </div>

      {/* Expanded scan modal */}
      {expanded && (() => {
        const slides = [
          { key: 'front' as const, label: 'Front',  src: listing.scan_front },
          { key: 'back'  as const, label: 'Back',   src: listing.scan_back  },
        ]
        const currentIdx = slides.findIndex(s => s.key === scanSide) ?? 0
        const activeSrc = slides[currentIdx]?.src

        function prev() {
          const idx = (currentIdx - 1 + slides.length) % slides.length
          setScanSide(slides[idx].key)
          setModalMagnifier(m => ({ ...m, active: false }))
        }
        function next() {
          const idx = (currentIdx + 1) % slides.length
          setScanSide(slides[idx].key)
          setModalMagnifier(m => ({ ...m, active: false }))
        }

        return (
          <div
            onClick={() => { setExpanded(false); setModalMagnifier(m => ({ ...m, active: false })) }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              backgroundColor: 'rgba(0,0,0,0.75)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                position: 'relative',
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: '28px 28px 24px',
                boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
              }}
            >
              {/* Close */}
              <button
                onClick={() => { setExpanded(false); setModalMagnifier(m => ({ ...m, active: false })) }}
                style={{
                  position: 'absolute', top: 14, right: 14,
                  width: 32, height: 32, borderRadius: '50%',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 10,
                }}
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/>
                </svg>
              </button>

              {/* Slide label + dots */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {slides.map((s, i) => (
                  <button key={s.key} onClick={() => { setScanSide(s.key); setModalMagnifier(m => ({ ...m, active: false })) }} style={{
                    padding: '4px 12px', borderRadius: 'var(--radius-full)',
                    border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                    backgroundColor: i === currentIdx ? 'var(--color-text)' : 'var(--color-bg)',
                    color: i === currentIdx ? '#fff' : 'var(--color-text-muted)',
                    transition: 'all 0.15s',
                  }}>
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Image + carousel arrows */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Prev */}
                <button onClick={prev} style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  border: '1px solid var(--color-border)', backgroundColor: '#fff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>

                {/* Card image with magnifier */}
                <div
                  ref={modalImgRef}
                  style={{
                    position: 'relative',
                    height: 'min(72vh, 812px)',
                    aspectRatio: '2.5/3.5',
                    overflow: 'hidden',
                    borderRadius: 14,
                    cursor: activeSrc ? 'crosshair' : 'default',
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    flexShrink: 0,
                  }}
                  onMouseMove={e => {
                    if (!activeSrc) return
                    const rect = modalImgRef.current!.getBoundingClientRect()
                    const zoom = 2.55
                    const lensSize = 160
                    const half = lensSize / 2
                    const cursorX = e.clientX - rect.left
                    const cursorY = e.clientY - rect.top
                    const bgX = -(cursorX * zoom - half)
                    const bgY = -(cursorY * zoom - half)
                    setModalMagnifier({ active: true, x: cursorX, y: cursorY, bgX, bgY })
                  }}
                  onMouseLeave={() => setModalMagnifier(m => ({ ...m, active: false }))}
                >
                  {activeSrc ? (
                    <>
                      <img src={activeSrc} alt={`${listing.card.name_en} ${slides[currentIdx].label}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {modalMagnifier.active && (
                        <div style={{
                          position: 'absolute',
                          width: 160, height: 160,
                          borderRadius: '50%',
                          border: '2.5px solid rgba(255,255,255,0.9)',
                          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                          pointerEvents: 'none',
                          left: modalMagnifier.x - 80,
                          top: modalMagnifier.y - 80,
                          zIndex: 10,
                          backgroundImage: `url(${activeSrc})`,
                          backgroundSize: `${modalImgRef.current ? modalImgRef.current.offsetWidth * 2.55 : 900}px ${modalImgRef.current ? modalImgRef.current.offsetHeight * 2.55 : 1260}px`,
                          backgroundPosition: `${modalMagnifier.bgX}px ${modalMagnifier.bgY}px`,
                          backgroundRepeat: 'no-repeat',
                        }} />
                      )}
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 8 }}>
                      <svg width="28" height="28" fill="none" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ opacity: 0.4 }}>
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                        <circle cx="12" cy="13" r="3"/>
                      </svg>
                      <p style={{ fontSize: 13, color: 'var(--color-text-faint)' }}>No scan uploaded yet</p>
                    </div>
                  )}
                </div>

                {/* Next */}
                <button onClick={next} style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  border: '1px solid var(--color-border)', backgroundColor: '#fff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>

              {/* Hint */}
              <p style={{ fontSize: 11, color: 'var(--color-text-faint)' }}>Hover to magnify · click outside to close</p>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
