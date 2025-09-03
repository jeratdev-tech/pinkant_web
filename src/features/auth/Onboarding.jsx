import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Onboarding() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function uploadPublicFile(bucket, file) {
    const fileName = `${crypto.randomUUID()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        upsert: false,
        cacheControl: "3600",
      });
    if (error) throw error;
    const { data: urlData } = await supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    return urlData.publicUrl;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      let avatar_url;
      let banner_url;
      if (avatarFile)
        avatar_url = await uploadPublicFile("avatars", avatarFile);
      if (bannerFile)
        banner_url = await uploadPublicFile("banners", bannerFile);

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          username,
          pronouns,
          short_bio: bio,
          ...(avatar_url ? { avatar_url } : {}),
          ...(banner_url ? { banner_url } : {}),
        })
        .eq("id", user.id);
      if (error) throw error;
      setMessage("Onboarding completed.");
    } catch (err) {
      setMessage(err?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Profile Setup</h1>
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-2xl shadow p-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Display name
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Username</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Pronouns</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={pronouns}
              onChange={(e) => setPronouns(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Bio</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Banner</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>
        <button
          disabled={loading}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg"
        >
          {loading ? "Saving..." : "Save"}
        </button>
        {message && <p className="text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  );
}
