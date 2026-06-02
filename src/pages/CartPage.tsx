import { useState, useEffect } from 'react'
import { setPageMeta } from '../lib/pageMeta'
import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { redirectToCheckout } from '../lib/checkout'
import { useIsMobile } from '../hooks/useIsMobile'

export default function CartPage() {
  const { items, totalCHF, removeItem, setQuantity, refreshItems } = useCart()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refreshItems() }, [])
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [country, setCountry] = useState('CH')
  const [postalCode, setPostalCode] = useState('')
  useEffect(() => { setPageMeta('Your Cart') }, [])
  const isMobile = useIsMobile()

  const isZurich = country === 'CH' && /^80\d{2}$/.test(postalCode.trim())
  const shippingCHF = isZurich ? 0
    : country === 'CH' ? (totalCHF >= 75 ? 0 : 4.50)
    : 12.00
  const grandTotal = totalCHF + shippingCHF

  async function handleCheckout() {
    setCheckoutLoading(true)
    setCheckoutError(null)
    try {
      await redirectToCheckout(items, postalCode, country)
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Something went wrong')
      setCheckoutLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 640, margin: '80px auto', padding: '0 13px', textAlign: 'center' }}>
        <img src="/images/1624_empty-cards.webp" alt="" style={{ width: 200, height: 'auto', display: 'block', margin: '0 auto 16px' }} />
        <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>Your cart is empty</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 28 }}>Find a card you love and add it here.</p>
        <Link to="/select" style={{ padding: '11px 24px', backgroundColor: 'var(--brand-blue)', color: '#fff', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 500 }}>
          Browse cards
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '24px 9px' : '32px 13px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 500, marginBottom: 28 }}>Your cart</h1>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: 16, alignItems: 'start' }}>

        {/* Items */}
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {items.map((item, i) => (
            <div key={item.listing.id} style={{
              display: 'flex', gap: 16, padding: '16px',
              borderBottom: i < items.length - 1 ? '1px solid var(--color-border)' : 'none',
              alignItems: 'center',
            }}>
              {/* Scan thumbnail */}
              <div style={{
                width: 52, height: 72, borderRadius: 6,
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {item.listing.scan_front
                  ? <img src={item.listing.scan_front} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
                  : <span style={{ fontSize: 9, color: 'var(--color-text-faint)', textAlign: 'center' }}>{item.listing.card?.card_number}</span>
                }
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{item.listing.card?.name_en}</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-faint)' }}>{item.listing.card?.set_name} · {item.listing.condition}</p>
              </div>

              {/* Qty */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => setQuantity(item.listing.id, item.quantity - 1)} style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'transparent', cursor: 'pointer', fontSize: 16, color: 'var(--color-text-muted)' }}>−</button>
                <span style={{ fontSize: 14, fontWeight: 500, minWidth: 16, textAlign: 'center' }}>{item.quantity}</span>
                <button onClick={() => setQuantity(item.listing.id, item.quantity + 1)} disabled={item.quantity >= item.listing.quantity} style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'transparent', cursor: item.quantity >= item.listing.quantity ? 'not-allowed' : 'pointer', fontSize: 16, color: 'var(--color-text-muted)' }}>+</button>
              </div>

              {/* Price */}
              <span style={{ fontSize: 14, fontWeight: 500, minWidth: 80, textAlign: 'right' }}>
                CHF {(item.listing.price_chf * item.quantity).toFixed(2)}
              </span>

              {/* Remove */}
              <button onClick={() => removeItem(item.listing.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-faint)', padding: 4 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="2" y1="2" x2="12" y2="12"/><line x1="12" y1="2" x2="2" y2="12"/></svg>
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Order summary</p>

          {/* Country + postal code for shipping estimate */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: 'var(--color-text-faint)', display: 'block', marginBottom: 6 }}>
              Country
            </label>
            <select
              value={country}
              onChange={e => { setCountry(e.target.value); setPostalCode('') }}
              style={{
                width: '100%', padding: '8px 10px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 13, backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)', outline: 'none',
                boxSizing: 'border-box', marginBottom: 8,
                cursor: 'pointer',
              }}
            >
              <option value="CH">Switzerland</option>
              <option value="DE">Germany</option>
              <option value="IT">Italy</option>
            </select>
            <label style={{ fontSize: 12, color: 'var(--color-text-faint)', display: 'block', marginBottom: 6 }}>
              Postal code
            </label>
            <input
              value={postalCode}
              onChange={e => setPostalCode(e.target.value)}
              placeholder={country === 'CH' ? 'e.g. 8050' : 'e.g. 10115'}
              maxLength={country === 'CH' ? 4 : 5}
              style={{
                width: '100%', padding: '8px 10px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 13, backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {isZurich && (
              <p style={{ fontSize: 11, color: '#16A34A', marginTop: 4 }}>Free delivery in Zürich</p>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-muted)' }}>
              <span>Subtotal</span>
              <span>CHF {totalCHF.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-muted)' }}>
              <span>Shipping</span>
              <span style={{ color: shippingCHF === 0 ? '#16A34A' : 'inherit' }}>
                {shippingCHF === 0 ? 'Free' : `CHF ${shippingCHF.toFixed(2)}`}
              </span>
            </div>
            {shippingCHF > 0 && country === 'CH' && (
              <p style={{ fontSize: 11, color: 'var(--color-text-faint)' }}>
                Free for Zürich (80xx) and Swiss orders over CHF 75
              </p>
            )}
            {(country === 'DE' || country === 'IT') && (
              <p style={{ fontSize: 11, color: 'var(--color-text-faint)' }}>
                Tracked international shipping via Swiss Post
              </p>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14, marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>Total</span>
            <span style={{ fontSize: 18, fontWeight: 500 }}>CHF {grandTotal.toFixed(2)}</span>
          </div>

          <p style={{ fontSize: 11, color: 'var(--color-text-faint)', marginBottom: 16 }}>Incl. Swiss VAT (8.1%)</p>

          {checkoutError && (
            <p style={{ fontSize: 12, color: '#B91C1C', marginBottom: 10, textAlign: 'center' }}>
              {checkoutError}
            </p>
          )}
          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="btn-primary"
            style={{
              display: 'block', width: '100%', textAlign: 'center',
              padding: '12px', backgroundColor: 'var(--brand-blue)', color: '#fff',
              borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 500,
              marginBottom: 10, border: 'none',
              cursor: checkoutLoading ? 'wait' : 'pointer',
              opacity: checkoutLoading ? 0.7 : 1,
              transition: 'background-color 0.15s, opacity 0.15s',
            }}
          >
            {checkoutLoading ? 'Redirecting…' : 'Proceed to checkout'}
          </button>
          <Link to="/catalog" style={{ display: 'block', textAlign: 'center', fontSize: 13, color: 'var(--color-text-muted)' }}>
            Continue shopping
          </Link>

          {/* Accordion — shipping, packaging, returns */}
          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 16 }}>
            {([
              {
                key: 'shipping',
                label: 'Shipping',
                content: (
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                    <p style={{ marginBottom: 6 }}><strong>Switzerland</strong> — CHF 4.50 (Swiss Post A-Post Tracked). Free for orders over CHF 75 or within Zürich (80xx).</p>
                    <p><strong>Germany & Italy</strong> — CHF 12.00 (Swiss Post Priority International, tracked). Dispatched within 1–2 business days.</p>
                  </div>
                ),
              },
              {
                key: 'packaging',
                label: 'Packaging',
                content: (
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                    All cards are shipped in a protective sleeve inside a rigid top-loader or card saver, then secured in a padded envelope.
                  </p>
                ),
              },
              {
                key: 'returns',
                label: 'Returns',
                content: (
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                    Returns are not accepted for change of mind. As each listing features a photo of the exact card, we encourage you to review the scan carefully before purchasing.
                  </p>
                ),
              },
            ]).map(({ key, label, content }) => {
              const isOpen = openAccordion === key
              return (
                <div key={key} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <button
                    onClick={() => setOpenAccordion(isOpen ? null : key)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '13px 0', background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 13, fontWeight: 500, color: 'var(--color-text)', textAlign: 'left',
                    }}
                  >
                    {label}
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
                      style={{ flexShrink: 0, color: 'var(--color-text-faint)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  {isOpen && <div style={{ paddingBottom: 14 }}>{content}</div>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
