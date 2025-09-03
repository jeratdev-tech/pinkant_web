// Deno Deploy / Supabase Edge Function: create-topup
// - Verifies auth
// - Ensures user wallet exists
// - Creates a pending 'deposit' transaction (mock if STRIPE not configured)
// - Returns { checkoutUrl?, clientSecret?, tx_id }

import { createClient } from "jsr:@supabase/supabase-js@2";

type Json =
  | Record<string, unknown>
  | Array<unknown>
  | string
  | number
  | boolean
  | null;

function json(status: number, body: Json) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function getEnv(name: string) {
  const v = Deno.env.get(name);
  return v ?? "";
}

function getSupabaseAdmin() {
  const url = getEnv("SUPABASE_URL");
  const key = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getAuthUserId(req: Request): Promise<string | null> {
  const auth =
    req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth) return null;
  const token = auth.replace(/^Bearer\s+/i, "");
  // Validate token with Supabase
  const admin = getSupabaseAdmin();
  const { data } = await admin.auth.getUser(token);
  return data.user?.id ?? null;
}

async function ensureWalletForUser(
  admin: ReturnType<typeof getSupabaseAdmin>,
  userId: string
) {
  const { data: existing } = await admin
    .from("wallets")
    .select("id, currency")
    .eq("owner_profile", userId)
    .maybeSingle();
  if (existing) return existing;
  const { data, error } = await admin
    .from("wallets")
    .insert({ owner_profile: userId })
    .select("id, currency")
    .single();
  if (error) throw error;
  return data;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const userId = await getAuthUserId(req);
    if (!userId) return json(401, { error: "Unauthorized" });

    const body = await req.json().catch(() => ({}));
    const amountCents = Number(body?.amountCents ?? 0);
    const currency = String(body?.currency ?? "USD");
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return json(400, { error: "Invalid amount" });
    }

    const admin = getSupabaseAdmin();
    const wallet = await ensureWalletForUser(admin, userId);

    // Create pending transaction
    const { data: tx, error: txErr } = await admin
      .from("transactions")
      .insert({
        wallet_id: wallet.id,
        type: "deposit",
        amount_cents: amountCents,
        description: "Top-up",
        pending: true,
      })
      .select("id")
      .single();
    if (txErr) return json(500, { error: txErr.message });

    const stripeKey = getEnv("STRIPE_SECRET_KEY");
    const mockMode = !stripeKey;

    if (mockMode) {
      return json(200, {
        clientSecret: "mock_client_secret",
        checkoutUrl: "",
        tx_id: tx.id,
        mode: "mock",
      });
    }

    // TODO: Implement Stripe Checkout/PaymentIntent creation here
    // Return a clientSecret or checkoutUrl as appropriate
    return json(200, {
      clientSecret: null,
      checkoutUrl: null,
      tx_id: tx.id,
      mode: "stripe",
    });
  } catch (e) {
    return json(500, { error: e?.message ?? "Server error" });
  }
});
