import { useEffect } from 'react'
import { setPageMeta } from '../lib/pageMeta'
import { useIsMobile } from '../hooks/useIsMobile'

export default function ImpressumPage() {
  useEffect(() => { setPageMeta('Impressum') }, [])

  const isMobile = useIsMobile()

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '32px 9px' : '48px 13px' }}>
      <h1 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 600, marginBottom: 8 }}>Impressum</h1>
      <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 40 }}>Legal disclosure pursuant to Swiss law</p>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Website operator</h2>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--color-text)' }}>
          TH Vu<br />
          8050 Zürich<br />
          Switzerland
        </p>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Contact</h2>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--color-text)' }}>
          Email: <a href="mailto:1624tcg@gmail.com" style={{ color: 'var(--brand-blue)' }}>1624tcg@gmail.com</a>
        </p>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Business type</h2>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--color-text)' }}>
          Sole proprietorship (Einzelunternehmen). Not entered in the Swiss commercial register.
        </p>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Disclaimer</h2>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--color-text-muted)' }}>
          All product images shown are scans of the actual physical cards for sale. Card names, set names, and artwork are trademarks of their respective owners (The Pokémon Company, Bandai). 1624 Cards is not affiliated with or endorsed by these companies.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Dispute resolution</h2>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--color-text-muted)' }}>
          We are not obligated to participate in dispute resolution proceedings before a consumer arbitration board. In case of disputes, Swiss law applies and the courts of Zürich have jurisdiction.
        </p>
      </section>
    </div>
  )
}
