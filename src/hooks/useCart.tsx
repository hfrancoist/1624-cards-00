import { createContext, useContext, useEffect, useReducer } from 'react'
import type { CartItem, Listing } from '../types'

// ── State ──────────────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[]
}

type CartAction =
  | { type: 'ADD'; listing: Listing }
  | { type: 'REMOVE'; listingId: string }
  | { type: 'SET_QTY'; listingId: string; qty: number }
  | { type: 'CLEAR' }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find(i => i.listing.id === action.listing.id)
      if (existing) {
        const maxQty = action.listing.quantity
        return {
          items: state.items.map(i =>
            i.listing.id === action.listing.id
              ? { ...i, quantity: Math.min(i.quantity + 1, maxQty) }
              : i
          ),
        }
      }
      return { items: [...state.items, { listing: action.listing, quantity: 1 }] }
    }
    case 'REMOVE':
      return { items: state.items.filter(i => i.listing.id !== action.listingId) }
    case 'SET_QTY': {
      if (action.qty <= 0) {
        return { items: state.items.filter(i => i.listing.id !== action.listingId) }
      }
      return {
        items: state.items.map(i =>
          i.listing.id === action.listingId ? { ...i, quantity: action.qty } : i
        ),
      }
    }
    case 'CLEAR':
      return { items: [] }
    default:
      return state
  }
}

// ── Context ────────────────────────────────────────────────────────────────

interface CartContextValue {
  items: CartItem[]
  count: number
  totalCHF: number
  addItem: (listing: Listing) => void
  removeItem: (listingId: string) => void
  setQuantity: (listingId: string, qty: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = '1624_cart'

function loadFromStorage(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as CartState
  } catch {}
  return { items: [] }
}

// ── Provider ───────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadFromStorage)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const count = state.items.reduce((acc, i) => acc + i.quantity, 0)
  const totalCHF = state.items.reduce((acc, i) => acc + i.listing.price_chf * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items: state.items,
      count,
      totalCHF,
      addItem: (listing) => dispatch({ type: 'ADD', listing }),
      removeItem: (listingId) => dispatch({ type: 'REMOVE', listingId }),
      setQuantity: (listingId, qty) => dispatch({ type: 'SET_QTY', listingId, qty }),
      clearCart: () => dispatch({ type: 'CLEAR' }),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
