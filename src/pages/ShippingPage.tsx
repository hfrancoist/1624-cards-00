import { useEffect } from 'react'
import { setPageMeta } from '../lib/pageMeta'
import { useIsMobile } from '../hooks/useIsMobile'

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500, color: highlight ? '#16A34A' : 'var(--color-text)' }}>{value}</span>
    </div>
  )
}

export default function ShippingPage() {
  useEffect(() => { setPageMeta('Shipping Info', 'Swiss Post A-Post tracked shipping. Free for orders over CHF 100 or within Zürich (80xx postal codes).') }, [])

  const isMobile = useIsMobile()

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '32px 9px' : '48px 13px' }}>
      <h1 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 600, marginBottom: 8 }}>Shipping & returns</h1>
      <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 40, lineHeight: 1.7 }}>
        We ship exclusively within Switzerland via Swiss Post. Every order is carefully packaged to protect your cards.
      </p>

      {/* Shipping costs */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Shipping costs</h2>
        <div style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '0 20px',
        }}>
          <Row label="Standard (Swiss Post A-Post Tracked)" value="CHF 4.50" />
          <Row label="Orders over CHF 100" value="Free" highlight />
          <Row label="Zürich delivery (postal codes 80xx)" value="Free" highlight />
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-faint)', marginTop: 12, lineHeight: 1.7 }}>
          Zürich free delivery applies to all postal codes starting with 80 (8000–8099). Enter your postal code at checkout to apply it automatically.
        </p>
      </section>

      {/* Delivery times */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Delivery times</h2>
        <div style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '0 20px',
        }}>
          <Row label="Processing time" value="1–2 business days" />
          <Row label="Swiss Post A-Post" value="1–2 business days after dispatch" />
          <Row label="Estimated total" value="2–4 business days" />
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-faint)', marginTop: 12, lineHeight: 1.7 }}>
          Orders placed before 12:00 noon on a business day are typically dispatched the same day. Weekends and Swiss public holidays are not counted as business days.
        </p>
      </section>

      {/* Packaging */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Packaging</h2>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
          All cards are shipped in a protective sleeve inside a rigid top-loader or card saver, then secured in a padded envelope. We take pride in making sure every card arrives in the same condition you ordered it.
        </p>
      </section>

      {/* Returns */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Returns</h2>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.8, marginBottom: 12 }}>
          We want you to be happy with your purchase. If a card arrives in a condition significantly different from what was described or shown in the scan, contact us within 7 days of delivery and we'll make it right.
        </p>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
          Returns are not accepted for change of mind. As each listing features a photo of the exact card, we encourage you to review the scan carefully before purchasing.
        </p>
      </section>

      {/* Contact */}
      <section>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Questions?</h2>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
          Reach out at{' '}
          <a href="mailto:1624tcg@gmail.com" style={{ color: 'var(--brand-blue)' }}>1624tcg@gmail.com</a>
          {' '}and we'll get back to you as soon as possible.
        </p>
      </section>
    </div>
  )
}
