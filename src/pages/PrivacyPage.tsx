import { useEffect } from 'react'
import { setPageMeta } from '../lib/pageMeta'
import { useIsMobile } from '../hooks/useIsMobile'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{title}</h2>
      {children}
    </section>
  )
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--color-text-muted)', marginBottom: 10 }}>
      {children}
    </p>
  )
}

export default function PrivacyPage() {
  useEffect(() => { setPageMeta('Privacy Policy') }, [])

  const isMobile = useIsMobile()

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '32px 9px' : '48px 13px' }}>
      <h1 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 600, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 40 }}>
        Last updated: May 2026 · Pursuant to the Swiss Federal Act on Data Protection (nDSG)
      </p>

      <Section title="1. Controller">
        <Body>
          The data controller responsible for this website is:<br />
          <span style={{ color: 'var(--color-text)' }}>
            TH Vu, 8050 Zürich, Switzerland<br />
            Email: <a href="mailto:1624tcg@gmail.com" style={{ color: 'var(--brand-blue)' }}>1624tcg@gmail.com</a>
          </span>
        </Body>
      </Section>

      <Section title="2. What data we collect">
        <Body>
          When you place an order, Stripe collects your name, email address, shipping address, and payment details on our behalf. We receive and store:
        </Body>
        <ul style={{ paddingLeft: 20, fontSize: 14, lineHeight: 2, color: 'var(--color-text-muted)' }}>
          <li>Your email address (from Stripe, after a completed payment)</li>
          <li>Your shipping address (city, postal code, country)</li>
          <li>Order details: items purchased, quantities, and prices</li>
          <li>Stripe session and payment identifiers (no card numbers are stored by us)</li>
        </ul>
        <Body>
          We do not use cookies for tracking or analytics. We do not collect any data when you browse the site without placing an order.
        </Body>
      </Section>

      <Section title="3. How we use your data">
        <Body>We use your data solely to:</Body>
        <ul style={{ paddingLeft: 20, fontSize: 14, lineHeight: 2, color: 'var(--color-text-muted)' }}>
          <li>Process and fulfil your order</li>
          <li>Ship your cards via Swiss Post</li>
          <li>Contact you if there is an issue with your order</li>
        </ul>
        <Body>We do not use your data for marketing, profiling, or any purpose beyond order fulfilment.</Body>
      </Section>

      <Section title="4. Third-party processors">
        <Body>We work with the following third-party services, each bound by their own privacy policies:</Body>
        <ul style={{ paddingLeft: 20, fontSize: 14, lineHeight: 2, color: 'var(--color-text-muted)' }}>
          <li><strong style={{ color: 'var(--color-text)' }}>Stripe</strong> — payment processing. Your payment data is handled exclusively by Stripe and is never stored on our servers. Stripe is PCI-DSS compliant.</li>
          <li><strong style={{ color: 'var(--color-text)' }}>Supabase</strong> — secure cloud database for storing order records. Data is stored in the EU (Frankfurt region).</li>
        </ul>
      </Section>

      <Section title="5. Data retention">
        <Body>
          Order records are retained for 10 years as required by Swiss accounting law (OR Art. 958f). After this period, data is permanently deleted.
        </Body>
      </Section>

      <Section title="6. Your rights">
        <Body>Under Swiss data protection law (nDSG), you have the right to:</Body>
        <ul style={{ paddingLeft: 20, fontSize: 14, lineHeight: 2, color: 'var(--color-text-muted)' }}>
          <li>Request access to the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data (subject to legal retention obligations)</li>
          <li>Object to the processing of your data</li>
        </ul>
        <Body>
          To exercise any of these rights, contact us at <a href="mailto:1624tcg@gmail.com" style={{ color: 'var(--brand-blue)' }}>1624tcg@gmail.com</a>. We will respond within 30 days.
        </Body>
      </Section>

      <Section title="7. Security">
        <Body>
          All data is transmitted over HTTPS. Payment processing is handled entirely by Stripe — we never see or store your card details. Order data is stored in a secured database with row-level access controls.
        </Body>
      </Section>

      <Section title="8. Contact">
        <Body>
          For any privacy-related questions or requests, please contact:<br />
          <a href="mailto:1624tcg@gmail.com" style={{ color: 'var(--brand-blue)' }}>1624tcg@gmail.com</a>
        </Body>
      </Section>
    </div>
  )
}
