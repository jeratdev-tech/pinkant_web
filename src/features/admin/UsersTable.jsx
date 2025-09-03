import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function UsersTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, role, is_org, created_at")
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

  async function updateRole(id, role) {
    await supabase.from("profiles").update({ role }).eq("id", id);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, role } : r)));
  }

  return (
    <div className="bg-white rounded-2xl shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Users</h2>
      </div>
      {loading ? (
        <div className="p-6">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="p-3">Display</th>
                <th className="p-3">Username</th>
                <th className="p-3">Role</th>
                <th className="p-3">Org</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3">{u.display_name}</td>
                  <td className="p-3">@{u.username}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">{u.is_org ? "Yes" : "No"}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {["user", "moderator", "admin", "superadmin"].map(
                        (role) => (
                          <button
                            key={role}
                            onClick={() => updateRole(u.id, role)}
                            className="px-2 py-1 bg-gray-100 rounded"
                          >
                            {role}
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
