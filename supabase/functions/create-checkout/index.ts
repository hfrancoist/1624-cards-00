import Stripe from "npm:stripe@14";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const body = await req.json();
    // Accept only listing_id + quantity — never trust client-supplied prices
    const clientItems: { listing_id: string; quantity: number }[] = body.items;
    const shipping_chf = Number(body.shipping_chf) || 0;
    const origin = req.headers.get("origin") ?? "http://localhost:5173";

    if (!Array.isArray(clientItems) || clientItems.length === 0) {
      throw new Error("No items provided");
    }

    // Fetch real prices and details from the database
    const listingIds = clientItems.map((i) => i.listing_id);
    const { data: listings, error: listingsError } = await supabase
      .from("listings")
      .select("id, price_chf, quantity, condition, card:cards(name_en, set_name)")
      .in("id", listingIds)
      .eq("is_active", true);

    if (listingsError || !listings) {
      throw new Error("Failed to fetch listings");
    }

    // Validate each item and build line items using server prices
    const line_items = [];
    const validatedItems = [];

    for (const clientItem of clientItems) {
      const listing = listings.find((l) => l.id === clientItem.listing_id);
      if (!listing) {
        throw new Error(`Listing ${clientItem.listing_id} not found or inactive`);
      }
      if (clientItem.quantity < 1 || clientItem.quantity > listing.quantity) {
        throw new Error(`Invalid quantity for ${listing.card.name_en}`);
      }

      const unitAmount = Math.round(Number(listing.price_chf) * 100);
      if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
        throw new Error(`Invalid price for listing ${listing.id}: ${listing.price_chf}`);
      }

      line_items.push({
        price_data: {
          currency: "chf",
          product_data: {
            name: listing.card.name_en,
            description: `${listing.card.set_name} — ${listing.condition}`,
          },
          unit_amount: unitAmount,
        },
        quantity: clientItem.quantity,
      });

      validatedItems.push({
        listing_id: listing.id,
        quantity: clientItem.quantity,
        price_chf: listing.price_chf,
        card_name: listing.card.name_en,
        set_name: listing.card.set_name,
        condition: listing.condition,
      });
    }

    if (shipping_chf > 0) {
      line_items.push({
        price_data: {
          currency: "chf",
          product_data: { name: "Swiss Post A-Post Tracked Shipping" },
          unit_amount: Math.round(shipping_chf * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      shipping_address_collection: { allowed_countries: ["CH", "DE", "IT"] },
      success_url: origin + "/order/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: origin + "/cart",
      metadata: {
        items: JSON.stringify(
          validatedItems.map((i) => ({ listing_id: i.listing_id, quantity: i.quantity, price_chf: i.price_chf }))
        ),
        shipping_chf: String(shipping_chf),
      },
    });

    const total_chf =
      validatedItems.reduce((sum, i) => sum + i.price_chf * i.quantity, 0) +
      shipping_chf;

    await supabase.from("orders").insert({
      stripe_session_id: session.id,
      status: "pending",
      total_chf,
      shipping_chf,
      items: validatedItems,
    });

    return new Response(JSON.stringify({ url: session.url }), { headers });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers,
    });
  }
});
