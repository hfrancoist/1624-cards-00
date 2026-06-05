import { Analytics } from '@vercel/analytics/react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { CartProvider, useCart } from './hooks/useCart'
import { FlyCartProvider } from './hooks/useFlyCart'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import CardDetailPage from './pages/CardDetailPage'
import CartPage from './pages/CartPage'
import NewArrivalsPage from './pages/NewArrivalsPage'
import GameSelectPage from './pages/GameSelectPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import NotFoundPage from './pages/NotFoundPage'
import ImpressumPage from './pages/ImpressumPage'
import PrivacyPage from './pages/PrivacyPage'
import AgbPage from './pages/AgbPage'
import ConditionsPage from './pages/ConditionsPage'
import ShippingPage from './pages/ShippingPage'

function CartNotifications() {
  const { notifications, dismissNotification } = useCart()
  if (notifications.length === 0) return null
  return (
    <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', pointerEvents: 'none' }}>
      {notifications.map(n => (
        <div key={n.id} style={{
          backgroundColor: 'var(--neutral-900)', color: '#fff',
          padding: '12px 18px', borderRadius: 'var(--radius-lg)',
          fontSize: 13, fontWeight: 500, lineHeight: 1.5,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'center', gap: 12,
          maxWidth: 380, pointerEvents: 'all',
          animation: 'slideUp 0.25s ease',
        }}>
          <span>⚠️ {n.message}</span>
          <button onClick={() => dismissNotification(n.id)} style={{ background: 'none', border: 'none', color: 'var(--neutral-400)', cursor: 'pointer', fontSize: 16, lineHeight: 1, flexShrink: 0 }}>×</button>
        </div>
      ))}
    </div>
  )
}

function AppShell() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      {/* homepage hero sits behind the fixed nav — no top padding needed */}
      <main style={{ flex: 1, paddingTop: isHome ? 0 : 74 }}>
        <Routes>
          <Route path="/"         element={<HomePage />} />
          <Route path="/select"   element={<GameSelectPage />} />
          <Route path="/catalog"  element={<CatalogPage />} />
          <Route path="/card/:id" element={<CardDetailPage />} />
          <Route path="/cart"     element={<CartPage />} />
          <Route path="/new"          element={<NewArrivalsPage />} />
          <Route path="/order/success" element={<OrderSuccessPage />} />
          <Route path="/impressum"    element={<ImpressumPage />} />
          <Route path="/privacy"      element={<PrivacyPage />} />
          <Route path="/agb"          element={<AgbPage />} />
          <Route path="/conditions"   element={<ConditionsPage />} />
          <Route path="/shipping"     element={<ShippingPage />} />
          <Route path="*"             element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <CartNotifications />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <FlyCartProvider>
          <AppShell />
        </FlyCartProvider>
      </CartProvider>
      <Analytics />
    </BrowserRouter>
  )
}
