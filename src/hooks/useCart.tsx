import { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react'
import type { CartItem, Listing } from '../types'
import { supabase } from '../lib/supabase'

// ── State ──────────────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[]
}

type CartAction =
  | { type: 'ADD'; listing: Listing }
  | { type: 'REMOVE'; listingId: string }
  | { type: 'SET_QTY'; listingId: string; qty: number }
  | { type: 'REFRESH'; listings: Listing[] }
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
          i.listing.id === action.listingId
            ? { ...i, quantity: Math.min(action.qty, i.listing.quantity) }
            : i
        ),
      }
    }
    case 'REFRESH': {
      // Update price/quantity from fresh server data; drop items no longer active
      const updated = state.items.reduce<CartItem[]>((acc, item) => {
        const fresh = action.listings.find(l => l.id === item.listing.id)
        if (!fresh || !fresh.is_active || fresh.quantity === 0) return acc
        return [...acc, {
          listing: { ...item.listing, price_chf: fresh.price_chf, quantity: fresh.quantity },
          quantity: Math.min(item.quantity, fresh.quantity),
        }]
      }, [])
      return { items: updated }
    }
    case 'CLEAR':
      return { items: [] }
    default:
      return state
  }
}

// ── Context ────────────────────────────────────────────────────────────────

export interface CartNotification {
  id: number
  message: string
}

interface CartContextValue {
  items: CartItem[]
  count: number
  totalCHF: number
  notifications: CartNotification[]
  addItem: (listing: Listing) => void
  removeItem: (listingId: string) => void
  setQuantity: (listingId: string, qty: number) => void
  refreshItems: () => Promise<void>
  clearCart: () => void
  dismissNotification: (id: number) => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = '1624_cart'

function isValidCartState(data: unknown): data is CartState {
  if (!data || typeof data !== 'object') return false
  const { items } = data as Record<string, unknown>
  if (!Array.isArray(items)) return false
  return items.every(item => {
    if (!item || typeof item !== 'object') return false
    const { listing, quantity } = item as Record<string, unknown>
    if (typeof quantity !== 'number' || quantity < 1) return false
    if (!listing || typeof listing !== 'object') return false
    const l = listing as Record<string, unknown>
    return (
      typeof l.id === 'string' &&
      typeof l.price_chf === 'number' &&
      typeof l.scan_front === 'string' &&
      typeof l.quantity === 'number'
    )
  })
}

function loadFromStorage(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (isValidCartState(parsed)) return parsed
      // Invalid shape — clear corrupted data
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
  return { items: [] }
}

// ── Provider ───────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadFromStorage)
  const [notifications, setNotifications] = useState<CartNotification[]>([])
  const notifId = useRef(0)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  function addNotification(message: string) {
    const id = ++notifId.current
    setNotifications(prev => [...prev, { id, message }])
    setTimeout(() => dismissNotification(id), 6000)
  }

  function dismissNotification(id: number) {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // ── Realtime inventory sync ──────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('cart-inventory-sync')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'listings' },
        (payload) => {
          const updated = payload.new as { id: string; quantity: number; is_active: boolean }
          const cartItem = stateRef.current.items.find(i => i.listing.id === updated.id)
          if (!cartItem) return

          const name = cartItem.listing.card?.name_en ?? 'A card'

          if (!updated.is_active || updated.quantity === 0) {
            dispatch({ type: 'REMOVE', listingId: updated.id })
            addNotification(`"${name}" sold out and was removed from your cart.`)
          } else if (updated.quantity < cartItem.quantity) {
            dispatch({ type: 'SET_QTY', listingId: updated.id, qty: updated.quantity })
            addNotification(`Only ${updated.quantity} of "${name}" left — your cart has been updated.`)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'listings' },
        (payload) => {
          const deleted = payload.old as { id: string }
          const cartItem = stateRef.current.items.find(i => i.listing.id === deleted.id)
          if (!cartItem) return

          const name = cartItem.listing.card?.name_en ?? 'A card'
          dispatch({ type: 'REMOVE', listingId: deleted.id })
          addNotification(`"${name}" is no longer available and was removed from your cart.`)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function refreshItems() {
    const ids = stateRef.current.items.map(i => i.listing.id)
    if (!ids.length) return
    const { data } = await supabase
      .from('listings')
      .select('id, price_chf, quantity, is_active')
      .in('id', ids)
    if (!data) return
    const removed = stateRef.current.items.filter(
      item => !data.find((l: { id: string; is_active: boolean; quantity: number }) => l.id === item.listing.id && l.is_active && l.quantity > 0)
    )
    dispatch({ type: 'REFRESH', listings: data as Listing[] })
    removed.forEach(item => {
      addNotification(`"${item.listing.card?.name_en ?? 'A card'}" is no longer available and was removed from your cart.`)
    })
  }

  const count = state.items.reduce((acc, i) => acc + i.quantity, 0)
  const totalCHF = state.items.reduce((acc, i) => acc + i.listing.price_chf * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items: state.items,
      count,
      totalCHF,
      notifications,
      addItem: (listing) => dispatch({ type: 'ADD', listing }),
      removeItem: (listingId) => dispatch({ type: 'REMOVE', listingId }),
      setQuantity: (listingId, qty) => dispatch({ type: 'SET_QTY', listingId, qty }),
      refreshItems,
      clearCart: () => dispatch({ type: 'CLEAR' }),
      dismissNotification,
    }}>
      {children}
    </CartContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
