import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { CartItem } from '../types'

export async function redirectToCheckout(items: CartItem[], postalCode: string, shippingCHF: number): Promise<void> {
  const payload = {
    items: items.map((i) => ({
      listing_id: i.listing.id,
      quantity: i.quantity,
    })),
    postal_code: postalCode.trim(),
    shipping_chf: shippingCHF,
  }

  const { data, error } = await supabase.functions.invoke('super-api', { body: payload })

  if (error) {
    let message = error.message
    if (error instanceof FunctionsHttpError) {
      try {
        const body = await error.context.json()
        if (body?.error) message = body.error
      } catch { /* body already consumed or not JSON */ }
    }
    throw new Error(message)
  }

  if (!data?.url) {
    throw new Error(data?.error ?? 'Failed to create checkout session')
  }

  // Validate the redirect URL is a genuine Stripe checkout URL before navigating
  let checkoutUrl: URL
  try {
    checkoutUrl = new URL(data.url)
  } catch {
    throw new Error('Invalid checkout URL returned from server')
  }
  if (checkoutUrl.hostname !== 'checkout.stripe.com') {
    throw new Error('Unexpected redirect target — aborting checkout')
  }

  window.location.href = data.url
}
