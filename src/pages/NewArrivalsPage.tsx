import { Link } from 'react-router-dom'

export default function NewArrivalsPage() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 500, marginBottom: 6 }}>New arrivals</h1>
      <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 32 }}>The latest cards added to the store.</p>
      <Link to="/catalog" style={{ fontSize: 14, color: 'var(--color-brand)' }}>← Browse all cards</Link>
    </div>
  )
}
