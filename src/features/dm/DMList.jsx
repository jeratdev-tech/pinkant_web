import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function DMList() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from("dm_threads")
          .select("id, a, b, created_at")
          .or(`a.eq.${user.id},b.eq.${user.id}`)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error loading DM threads:", error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setThreads(data || []);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error in DMList load:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    }
    load();
    const channel = supabase
      .channel("dm-threads")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "dm_threads" },
        load
      )
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Direct Messages</h1>
      <div className="bg-white rounded-2xl shadow divide-y">
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : threads.length === 0 ? (
          <div className="p-6 text-gray-600">No conversations yet.</div>
        ) : (
          threads.map((t) => (
            <a
              key={t.id}
              href={`/dm/${t.id}`}
              className="p-4 block hover:bg-gray-50"
            >
              <div className="text-sm text-gray-600">Thread</div>
              <div className="text-gray-900">{t.id}</div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
