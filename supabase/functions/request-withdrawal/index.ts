// Deno Deploy / Supabase Edge Function: request-withdrawal
// - Auth required
// - Creates a pending withdrawal transaction for admin review

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

async function getAuthUserId(req: Request): Promise<string | null> {
  const auth =
    req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth) return null;
  const token = auth.replace(/^Bearer\s+/i, "");
  const admin = getSupabaseAdmin();
  const { data } = await admin.auth.getUser(token);
  return data.user?.id ?? null;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const userId = await getAuthUserId(req);
  if (!userId) return json(401, { error: "Unauthorized" });

  const body = await req.json().catch(() => ({}));
  const amountCents = Number(body?.amountCents ?? 0);
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return json(400, { error: "Invalid amount" });
  }

  const admin = getSupabaseAdmin();
  const { data: wallet, error: wErr } = await admin
    .from("wallets")
    .select("id, balance_cents")
    .eq("owner_profile", userId)
    .maybeSingle();
  if (wErr || !wallet) return json(404, { error: "Wallet not found" });
  if (wallet.balance_cents < amountCents)
    return json(400, { error: "Insufficient funds" });

  const { data: tx, error: txErr } = await admin
    .from("transactions")
    .insert({
      wallet_id: wallet.id,
      type: "withdrawal",
      amount_cents: amountCents,
      description: "Withdrawal request",
      pending: true,
    })
    .select("id")
    .single();
  if (txErr) return json(500, { error: txErr.message });

  return json(200, { ok: true, tx_id: tx.id });
});
