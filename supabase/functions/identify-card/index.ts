import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { image } = await req.json();
    if (!image) return json({ match: null, error: "No image provided" }, 400);

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) return json({ match: null, error: "OpenAI key not configured" }, 500);

    // Ask GPT-4o-mini to read the card number — retry up to 3x on 429
    const body = JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/webp;base64,${image}` },
            },
            {
              type: "text",
              text: 'Read the card number/ID printed on this TCG card. One Piece cards have numbers like "OP01-001", "OP15-098", "ST10-005". Pokémon cards have numbers like "025/165", "091/063". Return JSON only, no markdown: {"card_number":"exact text as printed on card","game":"pokemon" or "onepiece"}. If you cannot read it return {"card_number":null,"game":null}.',
            },
          ],
        },
      ],
    });

    let aiRes: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
        body,
      });
      if (aiRes.status !== 429) break;
      // Exponential backoff: 5s, 10s, 20s
      await new Promise(r => setTimeout(r, 5000 * Math.pow(2, attempt)));
    }

    if (!aiRes || !aiRes.ok) {
      const err = await aiRes?.text() ?? "no response";
      return json({ match: null, error: `OpenAI ${aiRes?.status}: ${err.slice(0, 120)}` });
    }

    const aiData = await aiRes.json();
    const rawText: string = aiData.choices?.[0]?.message?.content ?? "";

    let parsed: { card_number: string | null; game: string | null } | null = null;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return json({ match: null, error: `Could not parse AI response: ${rawText.slice(0, 80)}` });
    }

    if (!parsed?.card_number) {
      return json({ match: null, error: "AI could not read card number from image" });
    }

    const cardNumber = parsed.card_number.trim();

    // 1. Exact match
    const { data: exact } = await supabase
      .from("cards")
      .select("id, game, set_code, set_name, card_number, name_en, rarity, language")
      .eq("card_number", cardNumber)
      .limit(5);

    if (exact?.length) {
      const best = parsed.game ? (exact.find((r) => r.game === parsed!.game) ?? exact[0]) : exact[0];
      return json({ match: best, aiNumber: cardNumber });
    }

    // 2. ILIKE fallback for minor OCR variations
    const { data: fuzzy } = await supabase
      .from("cards")
      .select("id, game, set_code, set_name, card_number, name_en, rarity, language")
      .ilike("card_number", `%${cardNumber}%`)
      .limit(3);

    if (fuzzy?.length) {
      return json({ match: fuzzy[0], aiNumber: cardNumber });
    }

    return json({ match: null, aiNumber: cardNumber, error: `No DB match for "${cardNumber}"` });
  } catch (e) {
    return json({ match: null, error: `Server error: ${String(e)}` }, 500);
  }
});
