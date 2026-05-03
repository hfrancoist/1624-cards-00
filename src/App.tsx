import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { CartProvider } from './hooks/useCart'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import CardDetailPage from './pages/CardDetailPage'
import CartPage from './pages/CartPage'
import NewArrivalsPage from './pages/NewArrivalsPage'
import GameSelectPage from './pages/GameSelectPage'
import NotFoundPage from './pages/NotFoundPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ScrollToTop />
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/"           element={<HomePage />} />
              <Route path="/select"     element={<GameSelectPage />} />
              <Route path="/catalog"    element={<CatalogPage />} />
              <Route path="/card/:id"   element={<CardDetailPage />} />
              <Route path="/cart"       element={<CartPage />} />
              <Route path="/new"        element={<NewArrivalsPage />} />
              <Route path="*"           element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </BrowserRouter>
  )
}
