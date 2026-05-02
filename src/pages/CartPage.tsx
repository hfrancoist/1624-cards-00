import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'

export default function CartPage() {
  const { items, totalCHF, removeItem, setQuantity } = useCart()

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 640, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🃏</p>
        <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>Your cart is empty</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 28 }}>Find a card you love and add it here.</p>
        <Link to="/catalog" style={{ padding: '11px 24px', backgroundColor: 'var(--brand-blue)', color: '#fff', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 500 }}>
          Browse cards
        </Link>
      </div>
    )
  }

  const shippingCHF = totalCHF >= 100 ? 0 : 4.50
  const grandTotal = totalCHF + shippingCHF

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 500, marginBottom: 28 }}>Your cart</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

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
                {(item.listing.scan_preview || item.listing.scan_front)
                  ? <img src={item.listing.scan_preview ?? item.listing.scan_front} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-muted)' }}>
              <span>Subtotal</span>
              <span>CHF {totalCHF.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-muted)' }}>
              <span>Shipping</span>
              <span style={{ color: shippingCHF === 0 ? '#27500A' : 'inherit' }}>
                {shippingCHF === 0 ? 'Free' : `CHF ${shippingCHF.toFixed(2)}`}
              </span>
            </div>
            {shippingCHF > 0 && (
              <p style={{ fontSize: 11, color: 'var(--color-text-faint)' }}>Free shipping on orders over CHF 100</p>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14, marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>Total</span>
            <span style={{ fontSize: 18, fontWeight: 500 }}>CHF {grandTotal.toFixed(2)}</span>
          </div>

          <p style={{ fontSize: 11, color: 'var(--color-text-faint)', marginBottom: 16 }}>Incl. Swiss VAT (8.1%)</p>

          <Link to="/checkout" style={{
            display: 'block', textAlign: 'center',
            padding: '12px', backgroundColor: 'var(--brand-blue)', color: '#fff',
            borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 500,
            marginBottom: 10,
          }}>
            Proceed to checkout
          </Link>
          <Link to="/catalog" style={{ display: 'block', textAlign: 'center', fontSize: 13, color: 'var(--color-text-muted)' }}>
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
