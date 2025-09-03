import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Withdraw() {
  const [amount, setAmount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("/functions/v1/request-withdrawal", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({ amountCents: Math.round(amount * 100) }),
      });
      if (!res.ok) throw new Error("Failed to request withdrawal");
      setMessage("Withdrawal requested. Awaiting admin review.");
    } catch (err) {
      setMessage(err?.message || "Failed to request withdrawal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Withdraw</h1>
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
        <button
          disabled={loading}
          className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-lg disabled:opacity-60"
        >
          {loading ? "Requesting..." : "Request withdrawal"}
        </button>
        {message && <p className="text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  );
}
