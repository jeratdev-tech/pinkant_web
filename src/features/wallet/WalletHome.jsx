import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function WalletHome() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchWallet() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("wallets")
        .select("balance_cents, currency")
        .eq("owner_profile", user.id)
        .limit(1)
        .maybeSingle();
      if (isMounted) {
        if (!error && data) setBalance(data);
        setLoading(false);
      }
    }
    fetchWallet();
    const channel = supabase
      .channel("wallet-balance")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "wallets" },
        () => fetchWallet()
      )
      .subscribe();
    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Wallet</h1>
      <div className="bg-white rounded-2xl shadow p-6">
        {loading ? (
          <div className="animate-pulse h-6 w-32 bg-gray-200 rounded" />
        ) : balance ? (
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold">
              {(balance.balance_cents / 100).toFixed(2)}
            </span>
            <span className="text-gray-500">{balance.currency}</span>
          </div>
        ) : (
          <p className="text-gray-600">No wallet found.</p>
        )}

        <div className="mt-6 flex gap-3">
          <a
            href="/wallet/add"
            className="px-4 py-2 bg-pink-500 text-white rounded-lg"
          >
            Add funds
          </a>
          <a
            href="/wallet/send"
            className="px-4 py-2 bg-gray-900 text-white rounded-lg"
          >
            Send
          </a>
          <a
            href="/wallet/withdraw"
            className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg"
          >
            Withdraw
          </a>
          <a
            href="/wallet/transactions"
            className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg"
          >
            Transactions
          </a>
        </div>
      </div>
    </div>
  );
}
