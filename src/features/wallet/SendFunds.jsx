import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function SendFunds() {
  const [toUsername, setToUsername] = useState("");
  const [amount, setAmount] = useState(5);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      // Lookup destination wallet by profile username
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("username", toUsername)
        .maybeSingle();
      if (!profile) throw new Error("Recipient not found");

      const { data: toWallet } = await supabase
        .from("wallets")
        .select("id, currency")
        .eq("owner_profile", profile.id)
        .maybeSingle();
      if (!toWallet) throw new Error("Recipient wallet not found");

      // Call RPC (to be created in SQL) for atomic transfer
      const { error } = await supabase.rpc("rpc_create_transfer", {
        from_wallet: null, // server will infer from auth if preferred. Placeholder
        to_wallet: toWallet.id,
        amount_cents: Math.round(amount * 100),
        note,
      });
      if (error) throw error;
      setMessage("Transfer submitted.");
    } catch (err) {
      setMessage(err?.message || "Failed to send");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Send Funds</h1>
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-2xl shadow p-6 space-y-4"
      >
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Recipient username
          </label>
          <input
            value={toUsername}
            onChange={(e) => setToUsername(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="@username"
            required
          />
        </div>
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
          <label className="block text-sm text-gray-600 mb-1">Note</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="(optional)"
          />
        </div>
        <button
          disabled={loading}
          className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send"}
        </button>
        {message && <p className="text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  );
}
