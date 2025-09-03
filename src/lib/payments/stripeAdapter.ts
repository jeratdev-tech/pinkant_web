import type { PaymentAdapter } from "./index";
import { supabase } from "../supabase";

export class StripeAdapter implements PaymentAdapter {
  async createTopUpIntent(amountCents: number, currency: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    const res = await fetch("/functions/v1/create-topup", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ amountCents, currency }),
    });
    if (!res.ok) throw new Error("Failed to create top-up");
    return res.json();
  }

  async handleWebhook(_e: unknown) {
    // Server-side only (Edge Function). No-op on client
    return Promise.resolve();
  }
}
