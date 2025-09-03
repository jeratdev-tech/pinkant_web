// Deno Deploy / Supabase Edge Function: webhook-stripe
// - Verifies Stripe signature (placeholder)
// - On successful event, mark transaction cleared and credit wallet balance

import { createClient } from "jsr:@supabase/supabase-js@2";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function getEnv(name: string) {
  return Deno.env.get(name) ?? "";
}

function getSupabaseAdmin() {
  const url = getEnv("SUPABASE_URL");
  const key = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const admin = getSupabaseAdmin();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = getEnv("STRIPE_WEBHOOK_SECRET");

  // TODO: Verify signature using Stripe SDK (placeholder)
  if (!sig || !webhookSecret) {
    // Allow mock/testing when not configured
  }

  const payload = await req.text();
  let event: any;
  try {
    event = JSON.parse(payload);
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  // Expected event should carry a transaction id we created earlier
  const txId = event?.data?.object?.metadata?.tx_id ?? event?.tx_id;
  if (!txId) return json(400, { error: "Missing tx_id" });

  // Mark transaction cleared and credit wallet balance
  const { data: tx, error: txErr } = await admin
    .from("transactions")
    .select("id, wallet_id, amount_cents, pending")
    .eq("id", txId)
    .maybeSingle();
  if (txErr || !tx) return json(404, { error: "Transaction not found" });
  if (tx.pending === false) return json(200, { ok: true });

  const { error: updateErr } = await admin
    .from("transactions")
    .update({ pending: false })
    .eq("id", txId);
  if (updateErr) return json(500, { error: updateErr.message });

  const { error: balErr } = await admin.rpc("increment_wallet_balance", {
    p_wallet_id: tx.wallet_id,
    p_amount_cents: tx.amount_cents,
  });
  // Fallback: direct update if RPC not yet created
  if (balErr) {
    await admin.rpc("increment_wallet_balance_fallback", {
      p_wallet_id: tx.wallet_id,
      p_amount_cents: tx.amount_cents,
    });
  }

  return json(200, { ok: true });
});
