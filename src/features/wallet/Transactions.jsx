import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Transactions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return setLoading(false);
      const { data: wallets } = await supabase
        .from("wallets")
        .select("id")
        .eq("owner_profile", user.id);
      if (!wallets || wallets.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }
      const walletIds = wallets.map((w) => w.id);
      const { data } = await supabase
        .from("transactions")
        .select("id, wallet_id, type, amount_cents, pending, created_at")
        .in("wallet_id", walletIds)
        .order("created_at", { ascending: false });
      if (mounted) {
        setItems(data || []);
        setLoading(false);
      }
    }
    load();

    // Realtime subscription for new transactions
    const channel = supabase
      .channel("wallet-transactions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions" },
        () => load()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "transactions" },
        () => load()
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>
      <div className="bg-white rounded-2xl shadow divide-y">
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-gray-600">No transactions yet.</div>
        ) : (
          items.map((tx) => (
            <div key={tx.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm uppercase text-gray-500">
                  {tx.type}
                </span>
                {tx.pending && (
                  <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    pending
                  </span>
                )}
              </div>
              <div className="font-medium">
                {(tx.amount_cents / 100).toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
