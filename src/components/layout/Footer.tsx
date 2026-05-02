import { Link } from 'react-router-dom'
import { LogoBadge } from '../ui/Logo'

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--neutral-900)',
      color: '#fff',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '56px 24px 32px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '200px repeat(3, 1fr)',
          gap: 48,
          marginBottom: 48,
        }}>
          {/* Brand */}
          <div>
            <LogoBadge width={88} />
            <p style={{ fontSize: 13, color: 'var(--neutral-500)', lineHeight: 1.7, marginTop: 16 }}>
              Swiss TCG singles.<br />
              Pokémon & One Piece.<br />
              Zürich, Switzerland.
            </p>
          </div>

          {[
            {
              heading: 'Shop',
              links: [
                { label: 'Pokémon TCG', to: '/catalog?game=pokemon' },
                { label: 'One Piece TCG', to: '/catalog?game=one_piece' },
                { label: 'New arrivals', to: '/new' },
                { label: 'All cards', to: '/catalog' },
              ],
            },
            {
              heading: 'Info',
              links: [
                { label: 'Condition guide', to: '/conditions' },
                { label: 'Shipping & returns', to: '/shipping' },
                { label: 'Wishlist alerts', to: '/wishlist' },
                { label: 'Contact', to: '/contact' },
              ],
            },
            {
              heading: 'Legal',
              links: [
                { label: 'Impressum', to: '/impressum' },
                { label: 'Privacy policy', to: '/privacy' },
                { label: 'Terms & conditions', to: '/terms' },
              ],
            },
          ].map(section => (
            <div key={section.heading}>
              <p style={{
                fontSize: 11, fontWeight: 600,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--neutral-600)',
                marginBottom: 14,
              }}>
                {section.heading}
              </p>
              {section.links.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  style={{
                    display: 'block',
                    fontSize: 14,
                    color: 'var(--neutral-400)',
                    marginBottom: 10,
                    transition: 'color 0.15s',
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--neutral-800)',
          paddingTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <p style={{ fontSize: 12, color: 'var(--neutral-600)' }}>
            © {new Date().getFullYear()} 1624 Cards · All prices include Swiss VAT (8.1%)
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            {['TWINT', 'Visa', 'Mastercard'].map(p => (
              <span key={p} style={{
                fontSize: 11, fontWeight: 500,
                padding: '3px 9px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--neutral-800)',
                color: 'var(--neutral-600)',
              }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
