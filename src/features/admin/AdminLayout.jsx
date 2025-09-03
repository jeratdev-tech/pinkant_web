import { Navigate, Outlet, Routes, Route, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";
import UsersTable from "./UsersTable";
import FlagsQueue from "./FlagsQueue";
import Finance from "./Finance";
import Settings from "./Settings";

export default function AdminLayout() {
  const { user } = useAuth();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadRole() {
      if (!user) return setLoading(false);
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (mounted) {
        setRole(data?.role ?? null);
        setLoading(false);
      }
    }
    loadRole();
    return () => {
      mounted = false;
    };
  }, [user]);

  if (!user && !loading) return <Navigate to="/auth" replace />;
  if (loading) return <div className="p-6">Loading...</div>;
  if (!role || !["admin", "superadmin"].includes(role))
    return <Navigate to="/" replace />;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="flex gap-4 mb-4">
        <Link to="users" className="px-3 py-1 rounded bg-gray-100">
          Users
        </Link>
        <Link to="flags" className="px-3 py-1 rounded bg-gray-100">
          Flags
        </Link>
        <Link to="finance" className="px-3 py-1 rounded bg-gray-100">
          Finance
        </Link>
        <Link to="settings" className="px-3 py-1 rounded bg-gray-100">
          Settings
        </Link>
      </div>
      <Routes>
        <Route path="users" element={<UsersTable />} />
        <Route path="flags" element={<FlagsQueue />} />
        <Route path="finance" element={<Finance />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
    </div>
  );
}
