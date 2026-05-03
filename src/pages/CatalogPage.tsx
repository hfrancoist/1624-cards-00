import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import type { Game, Condition } from '../types'
import { CONDITION_LABELS, GAME_LABELS } from '../types'
import { supabase } from '../lib/supabase'

const COND_BG: Record<Condition, string> = {
  NM: '#E8F5E9', LP: '#E3F2FD', MP: '#FFF8E1', HP: '#FBE9E7', DMG: '#EFEBE9'
}
const COND_COLOR: Record<Condition, string> = {
  NM: '#2E7D32', LP: '#1565C0', MP: '#F57F17', HP: '#BF360C', DMG: '#4E342E'
}

type Listing = {
  id: string
  price_chf: number
  condition: Condition
  quantity: number
  scan_front: string
  scan_preview?: string
  condition_note: string
  card: {
    id: string
    game: Game
    set_code: string
    set_name: string
    card_number: string
    name_en: string
    rarity: string
    language: string
    edition?: string
  }
}

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const activeGame = searchParams.get('game') as Game | null
  const activeSet = searchParams.get('set') ?? null
  const activeCategory = searchParams.get('category') ?? 'singles'

  // Derive unique sets from loaded listings for the active game, sorted alphabetically
  const availableSets: [string, string][] = Array.from(
    new Map<string, string>(
      listings
        .filter(l => activeGame ? l.card.game === activeGame : true)
        .map(l => [l.card.set_code, l.card.set_name] as [string, string])
    ).entries()
  ).sort((a, b) => a[1].localeCompare(b[1]))

  useEffect(() => {
    async function fetchListings() {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('listings')
        .select('*, card:cards(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setListings((data ?? []).filter((l: any) => l.card !== null) as Listing[])
      }
      setLoading(false)
    }

    fetchListings()
  }, [])

  const filtered = listings.filter(l => {
    if (activeGame && l.card.game !== activeGame) return false
    if (search && !l.card.name_en.toLowerCase().includes(search.toLowerCase())) return false
    if (activeSet && l.card.set_code !== activeSet) return false
    return true
  })

  function setCategory(category: string) {
    const params: Record<string, string> = { category }
    if (activeGame) params.game = activeGame
    setSearchParams(params)
  }

  function setGame(game: Game | null) {
    const params: Record<string, string> = { category: activeCategory }
    if (game) params.game = game
    setSearchParams(params)
  }

  function setSet(set_code: string | null) {
    const params: Record<string, string> = { category: activeCategory }
    if (activeGame) params.game = activeGame
    if (set_code) params.set = set_code
    setSearchParams(params)
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 500, marginBottom: 4 }}>
          {activeGame ? `${GAME_LABELS[activeGame]} — ${activeCategory === 'sealed' ? 'Sealed Products' : 'Singles'}` : 'All cards'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
          {loading ? 'Loading…' : activeGame ? `${filtered.length} listing${filtered.length !== 1 ? 's' : ''} available` : 'Select a game to browse'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* Sidebar filters */}
        <aside style={{ width: 200, flexShrink: 0 }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 10 }}>Category</p>
            {([
              { label: 'Singles', value: 'singles' },
              { label: 'Sealed Products', value: 'sealed' },
            ]).map(({ label, value }) => (
              <button key={value} onClick={() => setCategory(value)} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '7px 10px', borderRadius: 'var(--radius-md)',
                fontSize: 13, border: 'none', cursor: 'pointer',
                backgroundColor: activeCategory === value ? 'var(--brand-blue-lighter)' : 'transparent',
                color: activeCategory === value ? 'var(--brand-blue)' : 'var(--color-text-muted)',
                fontWeight: activeCategory === value ? 500 : 400,
                marginBottom: 2,
              }}>
                {label}
              </button>
            ))}
          </div>

          {/* Expansion filter — shown when a specific game is selected */}
          {activeGame && availableSets.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 10 }}>Expansion</p>
              <button
                onClick={() => setSet(null)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '7px 10px', borderRadius: 'var(--radius-md)',
                  fontSize: 13, border: 'none', cursor: 'pointer',
                  backgroundColor: activeSet === null ? 'var(--brand-blue-lighter)' : 'transparent',
                  color: activeSet === null ? 'var(--brand-blue)' : 'var(--color-text-muted)',
                  fontWeight: activeSet === null ? 500 : 400,
                  marginBottom: 2,
                }}
              >
                All expansions
              </button>
              {availableSets.map(([code, name]) => (
                <button
                  key={code}
                  onClick={() => setSet(code)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '7px 10px', borderRadius: 'var(--radius-md)',
                    fontSize: 13, border: 'none', cursor: 'pointer',
                    backgroundColor: activeSet === code ? 'var(--brand-blue-lighter)' : 'transparent',
                    color: activeSet === code ? 'var(--brand-blue)' : 'var(--color-text-muted)',
                    fontWeight: activeSet === code ? 500 : 400,
                    marginBottom: 2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          <div>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 10 }}>Condition</p>
            {(Object.keys(CONDITION_LABELS) as Condition[]).map(c => (
              <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 4px', fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 2 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: COND_COLOR[c], flexShrink: 0 }} />
                {CONDITION_LABELS[c]}
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)' }} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="7" cy="7" r="4"/><line x1="11" y1="11" x2="15" y2="15"/></svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search cards…"
              style={{
                width: '100%', padding: '9px 12px 9px 36px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 14, backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)', outline: 'none',
              }}
            />
          </div>

          {/* States */}
          {error && (
            <div style={{ padding: '16px', backgroundColor: '#FCEBEB', borderRadius: 'var(--radius-md)', marginBottom: 20, fontSize: 13, color: '#791F1F' }}>
              Failed to load listings: {error}
            </div>
          )}

          {!activeGame ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text)', marginBottom: 8 }}>Select a game to browse</p>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 24 }}>Choose Pokémon TCG or One Piece TCG from the navigation to get started.</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <a href="/catalog?game=pokemon&category=singles" style={{ padding: '10px 20px', backgroundColor: 'var(--brand-blue)', color: '#fff', borderRadius: 'var(--radius-full)', fontSize: 14, fontWeight: 500 }}>Pokémon TCG</a>
                <a href="/catalog?game=one_piece&category=singles" style={{ padding: '10px 20px', border: '1px solid var(--color-border)', color: 'var(--color-text)', borderRadius: 'var(--radius-full)', fontSize: 14, fontWeight: 500 }}>One Piece TCG</a>
              </div>
            </div>
          ) : loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <div style={{ aspectRatio: '3/4', backgroundColor: 'var(--color-bg)' }} />
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ height: 13, backgroundColor: 'var(--color-bg)', borderRadius: 4, marginBottom: 6 }} />
                    <div style={{ height: 11, backgroundColor: 'var(--color-bg)', borderRadius: 4, width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
              <p style={{ fontSize: 15 }}>No cards found.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {filtered.map(listing => (
                <Link key={listing.id} to={`/card/${listing.id}`} style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  display: 'block',
                  transition: 'border-color 0.15s, transform 0.15s',
                }}>
                  <div style={{
                    aspectRatio: '3/4',
                    backgroundColor: 'var(--color-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                    padding: '8px 8px 0 8px',
                  }}>
                    {(listing.scan_preview || listing.scan_front)
                      ? <img src={listing.scan_preview ?? listing.scan_front} alt={listing.card.name_en} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 6 }} />
                      : <span style={{ fontSize: 12, color: 'var(--color-text-faint)' }}>{listing.card.set_code} · #{listing.card.card_number}</span>
                    }
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {listing.card.name_en}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--color-text-faint)', marginBottom: 8 }}>
                      {listing.card.set_name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>
                        CHF {listing.price_chf.toFixed(2)}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 500, padding: '2px 6px',
                        borderRadius: 4,
                        backgroundColor: COND_BG[listing.condition],
                        color: COND_COLOR[listing.condition],
                      }}>
                        {listing.condition}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
