import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase, TABLES } from "../../lib/supabase";
import { Send, X } from "lucide-react";

export default function ReplyForm({ post, onReplySubmitted, onCancel }) {
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;

    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from(TABLES.REPLIES)
        .insert([
          {
            post_id: post.id,
            user_id: user.id,
            body: body.trim(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Reset form
      setBody("");
      onReplySubmitted(data);
    } catch (error) {
      setError(error.message || "Failed to submit reply");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Reply to "{post.title}"</h4>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="input-field min-h-[100px] resize-y"
            placeholder="Share your thoughts, support, or advice..."
            maxLength={1000}
            required
          />
          <div className="text-sm text-gray-500 mt-1 text-right">
            {body.length}/1000
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !body.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Submitting..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Reply
              </>
            )}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
