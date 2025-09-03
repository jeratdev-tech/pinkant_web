import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Finance() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("transactions")
        .select("id, wallet_id, amount_cents, pending, created_at, type")
        .eq("type", "withdrawal")
        .order("created_at", { ascending: false })
        .limit(200);
      if (mounted) {
        setWithdrawals(data || []);
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function approve(id) {
    // Mark cleared; in real flow call payout provider then clear
    await supabase.from("transactions").update({ pending: false }).eq("id", id);
    setWithdrawals((prev) =>
      prev.map((w) => (w.id === id ? { ...w, pending: false } : w))
    );
  }

  async function deny(id) {
    // Simple deny: mark pending false and credit back wallet (out of scope for placeholder)
    await supabase.from("transactions").update({ pending: false }).eq("id", id);
    setWithdrawals((prev) =>
      prev.map((w) => (w.id === id ? { ...w, pending: false } : w))
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Finance - Withdrawals</h2>
      </div>
      {loading ? (
        <div className="p-6">Loading...</div>
      ) : (
        <div className="divide-y">
          {withdrawals.map((w) => (
            <div key={w.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {(w.amount_cents / 100).toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">{w.id}</div>
              </div>
              <div className="flex items-center gap-2">
                {w.pending ? (
                  <>
                    <button
                      onClick={() => approve(w.id)}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => deny(w.id)}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded"
                    >
                      Deny
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-gray-600">cleared</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
