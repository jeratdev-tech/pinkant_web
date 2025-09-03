import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Toasts() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function subscribe() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const channel = supabase
        .channel("notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `recipient=eq.${user.id}`,
          },
          (payload) => {
            if (!mounted) return;
            const row = payload.new;
            setToasts((prev) => [
              ...prev,
              {
                id: row.id,
                text: row.type,
              },
            ]);
            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== row.id));
            }, 4000);
          }
        )
        .subscribe();
      return () => supabase.removeChannel(channel);
    }
    const cleanupPromise = subscribe();
    return () => {
      mounted = false;
      cleanupPromise?.then((fn) => fn?.());
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg shadow"
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
