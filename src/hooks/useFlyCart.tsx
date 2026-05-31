import { createContext, useContext, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface FlyItem {
  id: number
  fromX: number
  fromY: number
  toX: number
  toY: number
  imageSrc?: string
}

interface FlyCartContextValue {
  cartIconRef: React.MutableRefObject<HTMLElement | null>
  flyToCart: (fromRect: DOMRect, imageSrc?: string) => void
}

const FlyCartContext = createContext<FlyCartContextValue | null>(null)

let nextId = 0

export function FlyCartProvider({ children }: { children: React.ReactNode }) {
  const cartIconRef = useRef<HTMLElement | null>(null)
  const [flying, setFlying] = useState<FlyItem[]>([])

  const flyToCart = useCallback((fromRect: DOMRect, imageSrc?: string) => {
    const el = cartIconRef.current
    if (!el) return
    const toRect = el.getBoundingClientRect()
    const id = ++nextId
    setFlying(prev => [...prev, {
      id,
      fromX: fromRect.left + fromRect.width / 2,
      fromY: fromRect.top + fromRect.height / 2,
      toX: toRect.left + toRect.width / 2,
      toY: toRect.top + toRect.height / 2,
      imageSrc,
    }])
    setTimeout(() => setFlying(prev => prev.filter(i => i.id !== id)), 700)
  }, [])

  return (
    <FlyCartContext.Provider value={{ cartIconRef, flyToCart }}>
      {children}
      {createPortal(
        flying.map(item => <FlyingCard key={item.id} {...item} />),
        document.body
      )}
    </FlyCartContext.Provider>
  )
}

function FlyingCard({ fromX, fromY, toX, toY, imageSrc }: FlyItem) {
  const dx = toX - fromX
  const dy = toY - fromY
  const w = 44
  const h = 62

  return (
    <div
      className="fly-to-cart"
      style={{
        position: 'fixed',
        left: fromX - w / 2,
        top: fromY - h / 2,
        width: w,
        height: h,
        borderRadius: 6,
        overflow: 'hidden',
        backgroundColor: '#fff',
        border: '1px solid rgba(0,0,0,0.12)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        pointerEvents: 'none',
        zIndex: 9999,
        ...({ '--fly-dx': `${dx}px`, '--fly-dy': `${dy}px` } as React.CSSProperties),
      }}
    >
      {imageSrc
        ? <img src={imageSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--brand-blue-lightest)' }} />
      }
    </div>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFlyCart() {
  const ctx = useContext(FlyCartContext)
  if (!ctx) throw new Error('useFlyCart must be used inside FlyCartProvider')
  return ctx
}
