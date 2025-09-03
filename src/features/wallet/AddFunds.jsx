import { useState } from "react";
import { getPaymentsAdapter } from "../../lib/payments";

export default function AddFunds() {
  const [amount, setAmount] = useState(10);
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const adapter = await getPaymentsAdapter();
      const res = await adapter.createTopUpIntent(
        Math.round(amount * 100),
        currency
      );
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else if (res.clientSecret) {
        // TODO: Render Stripe Elements for card payment if using PaymentIntent
        setMessage("ClientSecret received. Complete payment UI coming soon.");
      } else {
        setMessage(
          "Top-up initialized (mock mode). You can refresh your wallet shortly."
        );
      }
    } catch (err) {
      setMessage(err?.message || "Failed to start top-up");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add Funds</h1>
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-2xl shadow p-6 space-y-4"
      >
        <div>
          <label className="block text-sm text-gray-600 mb-1">Amount</label>
          <input
            type="number"
            min={1}
            step={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="USD">USD</option>
          </select>
        </div>
        <button
          disabled={loading}
          className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg disabled:opacity-60"
        >
          {loading ? "Starting..." : "Add funds"}
        </button>
        {message && <p className="text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  );
}
