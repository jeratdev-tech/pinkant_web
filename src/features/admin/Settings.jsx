import { useEffect, useState } from "react";

export default function Settings() {
  const [flags, setFlags] = useState({
    dms_enabled: true,
    donations_enabled: true,
  });

  // Placeholder: would load/save to a settings table
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Settings</h2>
      <div className="space-y-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={flags.dms_enabled}
            onChange={(e) =>
              setFlags((f) => ({ ...f, dms_enabled: e.target.checked }))
            }
          />
          DMs enabled
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={flags.donations_enabled}
            onChange={(e) =>
              setFlags((f) => ({ ...f, donations_enabled: e.target.checked }))
            }
          />
          Donations enabled
        </label>
      </div>
    </div>
  );
}
