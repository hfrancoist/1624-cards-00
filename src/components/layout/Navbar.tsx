import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { useFlyCart } from '../../hooks/useFlyCart'
import { useIsMobile } from '../../hooks/useIsMobile'
import { LogoBadge } from '../ui/Logo'

const NAV_LINKS = [
  { label: 'Explore', to: '/catalog' },
  { label: 'Pokémon', to: '/catalog?game=pokemon' },
  { label: 'One Piece', to: '/catalog?game=one_piece' },
  { label: 'New Arrivals', to: '/new' },
]

const islandStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.40)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.30)',
}

export default function Navbar() {
  const { pathname, search } = useLocation()
  const { count } = useCart()
  const { cartIconRef } = useFlyCart()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [navHidden, setNavHidden] = useState(false)
  const [bouncing, setBouncing] = useState(false)
  const lastScrollY = useRef(0)
  const prevCount = useRef(count)


  useEffect(() => {
    if (count > prevCount.current) {
      requestAnimationFrame(() => {
        setBouncing(false)
        requestAnimationFrame(() => {
          setBouncing(true)
          setTimeout(() => setBouncing(false), 500)
        })
      })
    }
    prevCount.current = count
  }, [count])

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY
      if (current <= 60) {
        setNavHidden(false)
      } else if (current > lastScrollY.current + 6) {
        setNavHidden(true)
      } else if (current < lastScrollY.current - 6) {
        setNavHidden(false)
      }
      lastScrollY.current = current
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function openDrawer() {
    setMenuOpen(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setDrawerVisible(true)))
  }

  function closeDrawer() {
    setDrawerVisible(false)
    setTimeout(() => setMenuOpen(false), 300)
  }

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        paddingTop: 12,
        paddingLeft: isMobile ? 12 : 16,
        paddingRight: isMobile ? 12 : 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: (!isMobile && navHidden) ? 'translateY(-130%)' : 'translateY(0)',
        transition: 'transform 0.38s cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: (!isMobile && navHidden) ? 'none' : 'auto',
      }}>
        {/* Main island pill — full width */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          height: 50,
          borderRadius: 999,
          padding: '0 8px 0 14px',
          gap: 8,
          width: '100%',
          maxWidth: 750,
          margin: '0 auto',
          boxSizing: 'border-box',
          ...islandStyle,
        }}>
          {/* Logo */}
          <Link to="/" aria-label="1624 Cards home" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <LogoBadge width={60} />
          </Link>

          {/* Divider */}
          {!isMobile && (
            <div style={{ width: 1, height: 18, backgroundColor: 'rgba(0,0,0,0.1)', flexShrink: 0 }} />
          )}

          {/* Desktop nav links — flex: 1 to fill available space */}
          {!isMobile && (
            <nav style={{ display: 'flex', gap: 2, flex: 1 }}>
              {NAV_LINKS.map(link => {
                const linkUrl = new URL(link.to, 'http://x')
                const isActive =
                  linkUrl.pathname === pathname &&
                  linkUrl.searchParams.get('game') === new URLSearchParams(search).get('game')
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    style={{
                      fontSize: 13.5, fontWeight: 500,
                      padding: '6px 14px',
                      borderRadius: 999,
                      color: isActive ? 'var(--brand-blue)' : 'var(--color-text)',
                      backgroundColor: isActive ? '#E8E8E8' : 'transparent',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          )}

          {/* Spacer on mobile */}
          {isMobile && <div style={{ flex: 1 }} />}

          {/* Divider */}
          {!isMobile && (
            <div style={{ width: 1, height: 18, backgroundColor: 'rgba(0,0,0,0.1)', flexShrink: 0 }} />
          )}

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <button
              onClick={() => { navigate('/catalog', { state: { focusSearch: true } }); if (menuOpen) closeDrawer() }}
              aria-label="Search cards"
              style={{
                width: 34, height: 34,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 999,
                color: 'var(--color-text)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.15s',
              }}
            >
              <svg width={isMobile ? 18 : 15} height={isMobile ? 18 : 15} viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="6.5" cy="6.5" r="4" />
                <line x1="10" y1="10" x2="14" y2="14" />
              </svg>
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              ref={el => { cartIconRef.current = el }}
              className={bouncing ? 'cart-bounce' : ''}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                ...(isMobile
                  ? { width: 34, height: 34, justifyContent: 'center', position: 'relative' }
                  : { padding: '7px 18px' }),
                borderRadius: 999,
                backgroundColor: '#FFCB05',
                color: 'var(--neutral-900)',
                fontSize: 13.5, fontWeight: 500,
                transition: 'background 0.15s',
                flexShrink: 0,
              }}
              aria-label={`Cart${count > 0 ? `, ${count} item${count !== 1 ? 's' : ''}` : ''}`}
            >
              <svg width={isMobile ? 18 : 14} height={isMobile ? 18 : 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {!isMobile && 'Cart'}
              {count > 0 && (
                <span style={{
                  ...(isMobile
                    ? { position: 'absolute', top: -4, right: -4 }
                    : {}),
                  minWidth: 17, height: 17,
                  borderRadius: 999,
                  backgroundColor: 'var(--brand-gold)',
                  color: 'var(--neutral-900)',
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px',
                }}>
                  {count}
                </span>
              )}
            </Link>

            {/* Hamburger — mobile only */}
            {isMobile && (
              <button
                onClick={openDrawer}
                aria-label="Open menu"
                style={{
                  width: 34, height: 34,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 999,
                  border: '1px solid rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  color: 'var(--color-text)',
                }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="1" y1="3.5" x2="13" y2="3.5"/>
                  <line x1="1" y1="7.5" x2="13" y2="7.5"/>
                  <line x1="1" y1="11.5" x2="13" y2="11.5"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Full-screen mobile drawer */}
      {menuOpen && (
        <div
          onClick={closeDrawer}
          style={{
            position: 'fixed', inset: 0,
            zIndex: 200,
            backgroundColor: 'rgba(8,8,8,0.97)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            opacity: drawerVisible ? 1 : 0,
            transition: 'opacity 0.28s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* Top bar */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 20px',
              height: 68,
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              flexShrink: 0,
            }}
          >
            <LogoBadge width={58} />
            <button
              onClick={closeDrawer}
              style={{
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.14)',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                color: '#fff',
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="1" y1="1" x2="13" y2="13"/>
                <line x1="13" y1="1" x2="1" y2="13"/>
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <nav
            onClick={e => e.stopPropagation()}
            style={{ flex: 1, padding: '32px 24px 24px', display: 'flex', flexDirection: 'column' }}
          >
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeDrawer}
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#fff',
                  padding: '14px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  transition: 'color 0.15s',
                  opacity: drawerVisible ? 1 : 0,
                  transform: drawerVisible ? 'none' : 'translateY(12px)',
                  transitionDelay: `${i * 40}ms`,
                  transitionProperty: 'opacity, transform',
                  transitionDuration: '0.3s',
                  transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
