import Stripe from 'npm:stripe@14'
import { createClient } from 'npm:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// ── Email ────────────────────────────────────────────────────────────────────

async function sendConfirmationEmail(
  to: string,
  buyerName: string,
  items: { card_name: string; set_name: string; condition: string; quantity: number; price_chf: number }[],
  shippingAddress: Stripe.Address | null,
  totalCHF: number,
  shippingCHF: number,
) {
  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) {
    console.warn('RESEND_API_KEY not set — skipping confirmation email')
    return
  }

  const itemRows = items.map(i => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
        <div style="font-size:14px;font-weight:500;color:#18181B;">${i.card_name}</div>
        <div style="font-size:12px;color:#71717A;margin-top:2px;">${i.set_name} · ${i.condition}</div>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:center;font-size:13px;color:#52525B;">x${i.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:14px;font-weight:500;color:#18181B;">CHF ${(i.price_chf * i.quantity).toFixed(2)}</td>
    </tr>
  `).join('')

  const addressLines = shippingAddress ? [
    shippingAddress.line1,
    shippingAddress.line2,
    `${shippingAddress.postal_code} ${shippingAddress.city}`,
    shippingAddress.country,
  ].filter(Boolean).join('<br>') : '—'

  const subtotal = items.reduce((s, i) => s + i.price_chf * i.quantity, 0)

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F4F5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F5;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td style="background:#18181B;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.5px;">1624 Cards</div>
          <div style="font-size:12px;color:#A1A1AA;margin-top:4px;letter-spacing:0.05em;text-transform:uppercase;">Order Confirmed</div>
        </td></tr>
        <tr><td style="background:#fff;padding:32px;">
          <p style="font-size:16px;font-weight:600;color:#18181B;margin:0 0 6px;">Thank you${buyerName ? `, ${buyerName.split(' ')[0]}` : ''}!</p>
          <p style="font-size:14px;color:#71717A;margin:0 0 28px;line-height:1.6;">Your payment has been confirmed. Your cards will be carefully packaged and shipped within 1-2 business days.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <th style="text-align:left;font-size:11px;font-weight:600;color:#A1A1AA;letter-spacing:0.07em;text-transform:uppercase;padding-bottom:10px;border-bottom:2px solid #F4F4F5;">Card</th>
              <th style="text-align:center;font-size:11px;font-weight:600;color:#A1A1AA;letter-spacing:0.07em;text-transform:uppercase;padding-bottom:10px;border-bottom:2px solid #F4F4F5;">Qty</th>
              <th style="text-align:right;font-size:11px;font-weight:600;color:#A1A1AA;letter-spacing:0.07em;text-transform:uppercase;padding-bottom:10px;border-bottom:2px solid #F4F4F5;">Price</th>
            </tr>
            ${itemRows}
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="font-size:13px;color:#71717A;padding:4px 0;">Subtotal</td>
              <td style="font-size:13px;color:#71717A;text-align:right;padding:4px 0;">CHF ${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#71717A;padding:4px 0;">Shipping</td>
              <td style="font-size:13px;color:${shippingCHF === 0 ? '#16A34A' : '#71717A'};text-align:right;padding:4px 0;">${shippingCHF === 0 ? 'Free' : `CHF ${shippingCHF.toFixed(2)}`}</td>
            </tr>
            <tr>
              <td style="font-size:15px;font-weight:700;color:#18181B;padding:10px 0 0;border-top:1px solid #F4F4F5;">Total</td>
              <td style="font-size:15px;font-weight:700;color:#18181B;text-align:right;padding:10px 0 0;border-top:1px solid #F4F4F5;">CHF ${totalCHF.toFixed(2)}</td>
            </tr>
          </table>
          <div style="background:#F9F9F9;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
            <div style="font-size:11px;font-weight:600;color:#A1A1AA;letter-spacing:0.07em;text-transform:uppercase;margin-bottom:8px;">Shipping to</div>
            <div style="font-size:14px;color:#18181B;line-height:1.7;">${addressLines}</div>
          </div>
          <p style="font-size:13px;color:#A1A1AA;margin:0;line-height:1.6;">Questions? Reach us at <a href="mailto:1624tcg@gmail.com" style="color:#0B42A7;">1624tcg@gmail.com</a></p>
        </td></tr>
        <tr><td style="background:#F4F4F5;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
          <p style="font-size:12px;color:#A1A1AA;margin:0;">1624 Cards · Zurich, Switzerland</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: '1624 Cards <orders@1624cards.ch>',
      to: [to],
      subject: 'Your order is confirmed — 1624 Cards',
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Resend error:', err)
  } else {
    console.log('Confirmation email sent to', to)
  }
}

// ── Webhook handler ──────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        stripe_payment_intent: session.payment_intent as string,
        customer_email: session.customer_details?.email ?? null,
      })
      .eq('stripe_session_id', session.id)

    if (updateError) {
      console.error('Failed to update order:', updateError)
      return new Response('DB error', { status: 500 })
    }

    const items: { listing_id: string; quantity: number; price_chf: number; card_name: string; set_name: string; condition: string }[] = JSON.parse(
      session.metadata?.items ?? '[]'
    )

    for (const item of items) {
      const { error } = await supabase.rpc('decrement_listing_quantity', {
        p_listing_id: item.listing_id,
        p_qty: item.quantity,
      })
      if (error) {
        console.error(`Failed to decrement listing ${item.listing_id}:`, error)
      }
    }

    const email = session.customer_details?.email
    const buyerName = session.customer_details?.name ?? ''
    const shippingAddress = session.shipping_details?.address ?? session.customer_details?.address ?? null
    const shippingCHF = Number(session.metadata?.shipping_chf ?? 0)
    const totalCHF = items.reduce((s, i) => s + i.price_chf * i.quantity, 0) + shippingCHF

    if (email) {
      await sendConfirmationEmail(email, buyerName, items, shippingAddress, totalCHF, shippingCHF)
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
