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

export default function AgbPage() {
  useEffect(() => { setPageMeta('Terms & Conditions') }, [])

  const isMobile = useIsMobile()

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '32px 9px' : '48px 13px' }}>
      <h1 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 600, marginBottom: 8 }}>Terms & Conditions</h1>
      <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 40 }}>
        Last updated: June 2026 · Applicable to all purchases made on 1624cards.ch
      </p>

      <Section title="1. Seller">
        <Body>
          These Terms & Conditions govern all purchases made on 1624cards.ch, operated by:<br />
          <span style={{ color: 'var(--color-text)' }}>
            TH Vu, 8050 Zürich, Switzerland<br />
            Email: <a href="mailto:1624tcg@gmail.com" style={{ color: 'var(--brand-blue)' }}>1624tcg@gmail.com</a>
          </span>
        </Body>
      </Section>

      <Section title="2. Scope">
        <Body>
          These terms apply to all orders placed through 1624cards.ch. By completing a purchase, you agree to these Terms & Conditions in full. We sell individual trading card game singles — primarily Pokémon TCG and One Piece TCG — to private buyers in Switzerland, Germany, and Italy.
        </Body>
      </Section>

      <Section title="3. Contract formation">
        <Body>
          A binding purchase contract is formed when your payment is successfully processed by Stripe and you receive an order confirmation email. We reserve the right to cancel any order prior to dispatch in the event of a stock discrepancy, pricing error, or payment issue, in which case you will receive a full refund.
        </Body>
      </Section>

      <Section title="4. Prices and payment">
        <Body>
          All prices are listed in Swiss Francs (CHF) and exclude shipping costs. Shipping is charged separately at checkout as shown on the{' '}
          <a href="/shipping" style={{ color: 'var(--brand-blue)' }}>Shipping & Returns</a> page. No additional taxes apply.
        </Body>
        <Body>
          Payment is handled exclusively by Stripe. Accepted methods include Visa, Mastercard, and other cards supported by Stripe. We never see or store your card details.
        </Body>
      </Section>

      <Section title="5. Shipping and partial orders">
        <Body>
          Orders are shipped via Swiss Post. Shipping costs and estimated delivery times are detailed on the{' '}
          <a href="/shipping" style={{ color: 'var(--brand-blue)' }}>Shipping & Returns</a> page. We ship to Switzerland, Germany, and Italy only. Risk of loss transfers to you upon handover to the carrier.
        </Body>
        <Body>
          If you order multiple items and one becomes unavailable, we will fulfil the remaining items and issue a refund for the unavailable item. We do not hold orders pending restocking.
        </Body>
      </Section>

      <Section title="6. Card condition and descriptions">
        <Body>
          Every card listed on 1624cards.ch is individually photographed — the scan shown is the exact card you will receive. Condition grades (NM, LP, MP, HP, DMG) follow the standard definitions described on the{' '}
          <a href="/conditions" style={{ color: 'var(--brand-blue)' }}>Condition Guide</a> page. We grade cards carefully and honestly; minor subjective differences in grading do not constitute a defect.
        </Body>
      </Section>

      <Section title="7. No right of withdrawal">
        <Body>
          Swiss consumer law does not provide a general right of withdrawal for distance purchases. Returns are not accepted for change of mind. Because each listing includes a photograph of the exact card being sold, we encourage you to review scans carefully before purchasing.
        </Body>
      </Section>

      <Section title="8. Warranty and defect claims">
        <Body>
          We comply with the statutory warranty provisions of the Swiss Code of Obligations (CO Art. 197 ff.). If you receive a card that materially differs from its listing — such as the wrong card, a significantly misgraded card, or a card damaged in transit — please contact us within 7 days of delivery at{' '}
          <a href="mailto:1624tcg@gmail.com" style={{ color: 'var(--brand-blue)' }}>1624tcg@gmail.com</a> with photos and a description of the issue. We will review the claim and, where appropriate, offer a refund or replacement.
        </Body>
        <Body>
          Damage to packaging alone (envelope, sleeve, or top-loader) does not constitute a defect if the card itself is in the described condition.
        </Body>
      </Section>

      <Section title="9. Availability and stock">
        <Body>
          All listings reflect real-time stock. In the rare event that an item becomes unavailable after your order is placed (e.g. due to simultaneous orders), we will notify you promptly and issue a full refund for the affected item.
        </Body>
      </Section>

      <Section title="10. Liability">
        <Body>
          Our liability is limited to the purchase price of the affected item(s). We are not liable for indirect or consequential damages, loss of profits, or delays beyond our reasonable control. Nothing in these terms limits liability for fraud, gross negligence, or personal injury.
        </Body>
      </Section>

      <Section title="11. Governing law and jurisdiction">
        <Body>
          These Terms & Conditions are governed by Swiss law. Any disputes arising from purchases made on 1624cards.ch shall be subject to the exclusive jurisdiction of the courts of Zürich, Switzerland.
        </Body>
      </Section>

      <Section title="12. Changes to these terms">
        <Body>
          We may update these Terms & Conditions from time to time. The version in effect at the time of your order applies to that purchase. Continued use of the site after an update constitutes acceptance of the revised terms.
        </Body>
      </Section>
    </div>
  )
}
