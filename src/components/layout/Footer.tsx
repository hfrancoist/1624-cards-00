import { Link } from 'react-router-dom'
import { LogoBadge } from '../ui/Logo'
import { useIsMobile } from '../../hooks/useIsMobile'

export default function Footer() {
  const isMobile = useIsMobile()

  return (
    <footer style={{
      backgroundColor: 'var(--neutral-900)',
      color: '#fff',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: isMobile ? '40px 9px 24px' : '56px 13px 32px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : '200px repeat(3, 1fr)',
          gap: isMobile ? 24 : 48,
          marginBottom: isMobile ? 32 : 48,
        }}>
          {/* Brand — full width on mobile */}
          <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
            <div style={{ width: '100%', maxWidth: 79 }}>
              <LogoBadge width={79} />
            </div>
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
                { label: 'Contact', to: 'mailto:1624tcg@gmail.com' },
              ],
            },
            {
              heading: 'Legal',
              links: [
                { label: 'Impressum', to: '/impressum' },
                { label: 'Privacy policy', to: '/privacy' },
                { label: 'Terms & Conditions', to: '/agb' },
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
                l.to.startsWith('mailto:')
                  ? <a
                      key={l.to}
                      href={l.to}
                      style={{
                        display: 'block',
                        fontSize: 14,
                        color: 'var(--neutral-400)',
                        marginBottom: 10,
                        transition: 'color 0.15s',
                      }}
                    >
                      {l.label}
                    </a>
                  : <Link
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
            © {new Date().getFullYear()} 1624 Cards
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Social links */}
            <a href="https://www.instagram.com/1624cards" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a href="https://x.com/1624cards" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" style={{ color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <div style={{ width: 1, height: 14, backgroundColor: 'var(--neutral-800)' }} />
            {/* Payment badges */}
            {['Visa', 'Mastercard'].map(p => (
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
