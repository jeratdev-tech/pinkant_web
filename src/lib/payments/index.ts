export interface PaymentAdapter {
  createTopUpIntent(
    amountCents: number,
    currency: string
  ): Promise<{ checkoutUrl?: string; clientSecret?: string }>;
  handleWebhook(event: unknown): Promise<void>;
}

export const getPaymentsAdapter = async (): Promise<PaymentAdapter> => {
  const provider = import.meta.env.VITE_PAYMENTS_PROVIDER || "stripe";
  if (provider !== "stripe") {
    // Fallback to stripe until others are implemented
    console.warn(
      `Payments provider ${provider} not implemented. Falling back to stripe.`
    );
  }
  const module = await import("./stripeAdapter");
  return new module.StripeAdapter();
};
