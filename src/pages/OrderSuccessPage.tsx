import { useEffect } from 'react'
import { setPageMeta } from '../lib/pageMeta'
import { Link, useSearchParams } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useIsMobile } from '../hooks/useIsMobile'

export default function OrderSuccessPage() {
  const { clearCart } = useCart()
  useEffect(() => { setPageMeta('Order Confirmed') }, [])
  const isMobile = useIsMobile()
  const [searchParams] = useSearchParams()

  const sessionId = searchParams.get('session_id')
  const isValid = typeof sessionId === 'string' && sessionId.startsWith('cs_')

  useEffect(() => {
    if (isValid) clearCart()
  }, [isValid, clearCart])

  if (!isValid) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: isMobile ? '40px 9px' : '64px 13px', textAlign: 'center' }}>
        <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 600, marginBottom: 8 }}>Invalid page access</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 28, lineHeight: 1.6 }}>
          This page is only accessible after completing a checkout.
        </p>
        <Link to="/catalog" style={{ fontSize: 14, color: 'var(--brand-blue)', fontWeight: 500 }}>
          ← Back to catalog
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: isMobile ? '40px 9px' : '64px 13px', textAlign: 'center' }}>

      {/* Check icon */}
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        backgroundColor: '#DCFCE7',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <svg width="28" height="28" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 600, marginBottom: 8 }}>Payment confirmed</h1>
      <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
        Your order has been received. You'll get a confirmation email with your receipt and shipping details.
      </p>

      <Link to="/catalog" className="btn-primary" style={{
        display: 'inline-block',
        padding: '12px 28px',
        backgroundColor: 'var(--brand-blue)',
        color: '#fff',
        borderRadius: 'var(--radius-md)',
        fontSize: 14, fontWeight: 500,
        transition: 'background-color 0.15s',
      }}>
        Continue shopping
      </Link>
    </div>
  )
}
