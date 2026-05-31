import { useEffect } from 'react'
import { setPageMeta } from '../lib/pageMeta'
import { useIsMobile } from '../hooks/useIsMobile'
import type { Condition } from '../types'

const CONDITIONS: {
  grade: Condition
  label: string
  short: string
  description: string
  details: string[]
  bg: string
  color: string
}[] = [
  {
    grade: 'NM',
    label: 'Near Mint',
    short: 'NM',
    description: 'The card is in essentially perfect condition. No visible wear, scratches, or marks.',
    details: [
      'No visible edge wear or whitening',
      'Surface is clean, no scratches or scuffs',
      'Corners are sharp and intact',
      'No creases, bends, or folds',
      'Print quality is crisp and undamaged',
    ],
    bg: '#E8F5E9',
    color: '#2E7D32',
  },
  {
    grade: 'LP',
    label: 'Lightly Played',
    short: 'LP',
    description: 'Card shows very minor signs of use. Nearly indistinguishable from Near Mint without close inspection.',
    details: [
      'Barely perceptible edge wear on one or two corners',
      'Surface is clean with no visible scratches',
      'No creases or bends',
      'Corners still sharp to the eye',
    ],
    bg: '#F3E5F5',
    color: '#6A1B9A',
  },
  {
    grade: 'MP',
    label: 'Moderately Played',
    short: 'MP',
    description: 'Card shows light play. Noticeable on close inspection but still presents well in a sleeve.',
    details: [
      'Light edge wear or whitening on multiple corners',
      'Possible light surface scuffs visible under direct light',
      'No creases or structural damage',
      'Tournament-legal in a sleeve',
    ],
    bg: '#FFF8E1',
    color: '#F57F17',
  },
  {
    grade: 'HP',
    label: 'Heavily Played',
    short: 'HP',
    description: 'Card has significant signs of play. Clearly worn but structurally intact.',
    details: [
      'Noticeable edge wear or whitening on most corners',
      'Visible surface scuffs or scratches',
      'Possible minor creases that do not affect legibility',
      'Playable in a sleeve',
    ],
    bg: '#FBE9E7',
    color: '#BF360C',
  },
  {
    grade: 'DMG',
    label: 'Damaged',
    short: 'DMG',
    description: 'The card has structural damage. Sold as-is for collection purposes only.',
    details: [
      'Tears, holes, or missing pieces',
      'Heavy creases or folds affecting the card face',
      'Water damage or staining',
      'Heavily bent or warped',
    ],
    bg: '#EFEBE9',
    color: '#4E342E',
  },
]

export default function ConditionsPage() {
  useEffect(() => { setPageMeta('Terms & Conditions') }, [])

  const isMobile = useIsMobile()

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: isMobile ? '32px 9px' : '48px 13px' }}>
      <h1 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 600, marginBottom: 8 }}>Card condition guide</h1>
      <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 40, lineHeight: 1.7 }}>
        Every card listed on 1624 Cards is graded by hand and photographed — the scan you see is the exact card that ships.
        Use this guide to understand each condition grade.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {CONDITIONS.map(c => (
          <div
            key={c.grade}
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: isMobile ? '18px 16px' : '24px',
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '160px 1fr',
              gap: isMobile ? 12 : 24,
              alignItems: 'start',
            }}
          >
            <div>
              <span style={{
                display: 'inline-block',
                fontSize: 12, fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 999,
                backgroundColor: c.bg,
                color: c.color,
                marginBottom: 8,
                letterSpacing: '0.04em',
              }}>
                {c.short}
              </span>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>{c.label}</p>
            </div>
            <div>
              <p style={{ fontSize: 14, color: 'var(--color-text)', marginBottom: 12, lineHeight: 1.6 }}>
                {c.description}
              </p>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {c.details.map((d, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.9 }}>{d}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 13, color: 'var(--color-text-faint)', marginTop: 32, lineHeight: 1.7 }}>
        If you have any questions about a specific card's condition, feel free to reach out at{' '}
        <a href="mailto:1624tcg@gmail.com" style={{ color: 'var(--brand-blue)' }}>1624tcg@gmail.com</a>.
      </p>
    </div>
  )
}
