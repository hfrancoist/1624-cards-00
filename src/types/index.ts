// Game enum
export type Game = 'pokemon' | 'one_piece'

// Card condition
export type Condition = 'NM' | 'LP' | 'MP' | 'HP' | 'DMG'

// Card rarity
export type Rarity =
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Holo Rare'
  | 'Ultra Rare'
  | 'Secret Rare'
  | 'Special Illustration Rare'
  | 'Leader Rare'
  | 'Super Rare'
  | 'Special Card'

// Card — abstract identity (one record per unique card)
export interface Card {
  id: string
  game: Game
  set_code: string
  set_name: string
  card_number: string
  name_en: string
  rarity: Rarity
  language: string
  edition?: string          // e.g. "1st Edition", "Unlimited", "Shadowless"
  image_url?: string        // reference/official art, optional
  created_at: string
}

// Listing — your physical copy of a card
export interface Listing {
  id: string
  card_id: string
  card?: Card               // joined
  condition: Condition
  price_chf: number
  quantity: number
  scan_front: string        // Supabase Storage URL
  scan_back?: string        // optional
  scan_preview?: string     // product/mockup preview image (3rd view)
  condition_note?: string   // human-written note, e.g. "minor edge wear"
  is_active: boolean
  created_at: string
}

// Order
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  id: string
  order_id: string
  listing_id: string
  listing?: Listing
  quantity: number
  price_chf: number         // snapshot at time of purchase
}

export interface Order {
  id: string
  stripe_id: string
  buyer_email: string
  buyer_name: string
  total_chf: number
  status: OrderStatus
  shipping_address: ShippingAddress
  items?: OrderItem[]
  created_at: string
}

export interface ShippingAddress {
  name: string
  line1: string
  line2?: string
  postal_code: string
  city: string
  country: string           // default "CH"
}

// Wishlist
export interface WishlistEntry {
  id: string
  card_id: string
  card?: Card
  buyer_email: string
  condition_min: Condition
  max_price_chf?: number
  notified_at?: string
  created_at: string
}

// Cart (client-side only, no DB)
export interface CartItem {
  listing: Listing
  quantity: number
}

// Filter state for catalog
export interface CatalogFilters {
  game?: Game
  set_code?: string
  rarity?: Rarity
  condition?: Condition
  min_price?: number
  max_price?: number
  search?: string
  sort: 'price_asc' | 'price_desc' | 'newest' | 'name_asc'
}

// Condition display helpers
export const CONDITION_LABELS: Record<Condition, string> = {
  NM:  'Near Mint',
  LP:  'Lightly Played',
  MP:  'Moderately Played',
  HP:  'Heavily Played',
  DMG: 'Damaged',
}

export const CONDITION_COLORS: Record<Condition, string> = {
  NM:  '#27500A',   // green
  LP:  '#633806',   // amber
  MP:  '#7C3A1A',   // orange
  HP:  '#791F1F',   // red
  DMG: '#444441',   // gray
}

export const GAME_LABELS: Record<Game, string> = {
  pokemon:   'Pokémon TCG',
  one_piece: 'One Piece TCG',
}
