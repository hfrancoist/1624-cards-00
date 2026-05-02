import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{ maxWidth: 480, margin: '100px auto', padding: '0 24px', textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 96, color: 'var(--color-border)', lineHeight: 1 }}>404</p>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>Page not found</h1>
      <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 28 }}>This page doesn't exist or has been moved.</p>
      <Link to="/" style={{ padding: '10px 24px', backgroundColor: 'var(--color-brand)', color: '#fff', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 500 }}>
        Go home
      </Link>
    </div>
  )
}
