import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase, TABLES } from "../../lib/supabase";
import { Plus, X, Hash } from "lucide-react";

const SUGGESTED_TAGS = [
  "mental-health",
  "relationships",
  "coming-out",
  "family",
  "work",
  "lifestyle",
  "dating",
  "friendship",
  "support",
  "advice",
  "celebration",
  "challenges",
  "resources",
  "events",
  "general",
];

export default function CreatePostForm({ onPostCreated, onCancel }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddTag = (tag) => {
    const cleanTag = tag.toLowerCase().trim().replace(/\s+/g, "-");
    if (cleanTag && !tags.includes(cleanTag) && tags.length < 5) {
      setTags([...tags, cleanTag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Please fill in both title and body");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from(TABLES.POSTS)
        .insert([
          {
            user_id: user.id,
            title: title.trim(),
            body: body.trim(),
            tags: tags,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Reset form
      setTitle("");
      setBody("");
      setTags([]);
      setNewTag("");

      onPostCreated(data);
    } catch (error) {
      setError(error.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Create a New Post
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="What would you like to discuss?"
            maxLength={200}
            required
          />
        </div>

        <div>
          <label
            htmlFor="body"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Content
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="input-field min-h-[120px] resize-y"
            placeholder="Share your thoughts, experiences, or questions..."
            maxLength={2000}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (up to 5)
          </label>

          {/* Tag Input */}
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), handleAddTag(newTag))
                }
                className="input-field pl-8 pr-20"
                placeholder="Add a tag"
                maxLength={20}
              />
              <button
                type="button"
                onClick={() => handleAddTag(newTag)}
                disabled={!newTag.trim() || tags.length >= 5}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white p-1 rounded-md transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Current Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span key={tag} className="tag flex items-center gap-1">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-pink-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Suggested Tags */}
          <div className="text-sm text-gray-600">
            <p className="mb-2">Suggested tags:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  disabled={tags.includes(tag) || tags.length >= 5}
                  className="text-pink-600 hover:text-pink-700 disabled:text-gray-400 disabled:cursor-not-allowed text-sm"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || !title.trim() || !body.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Post"}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
