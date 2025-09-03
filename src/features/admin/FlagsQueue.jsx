import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function FlagsQueue() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("flags")
        .select(
          "id, reporter, target_type, target_id, reason, status, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(200);
      if (mounted) {
        setRows(data || []);
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function updateStatus(id, status) {
    await supabase.from("flags").update({ status }).eq("id", id);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  return (
    <div className="bg-white rounded-2xl shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Flags Queue</h2>
      </div>
      {loading ? (
        <div className="p-6">Loading...</div>
      ) : (
        <div className="divide-y">
          {rows.map((f) => (
            <div key={f.id} className="p-4">
              <div className="text-sm text-gray-500">
                {f.target_type} • {f.target_id}
              </div>
              <div className="font-medium">
                {f.reason || "No reason provided"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Status: {f.status}
              </div>
              <div className="mt-2 flex gap-2">
                {["open", "reviewing", "actioned", "dismissed"].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(f.id, s)}
                    className="px-2 py-1 bg-gray-100 rounded"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
