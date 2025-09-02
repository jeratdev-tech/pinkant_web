import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase, TABLES } from "../../lib/supabase";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Clock,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Post({ post, onReply, onPostUpdate }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [showReplies, setShowReplies] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (liked) {
        // Unlike
        const { error } = await supabase
          .from(TABLES.LIKES)
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);

        if (!error) {
          setLiked(false);
          setLikeCount((prev) => Math.max(0, prev - 1));
        }
      } else {
        // Like
        const { error } = await supabase.from(TABLES.LIKES).insert([
          {
            post_id: post.id,
            user_id: user.id,
          },
        ]);

        if (!error) {
          setLiked(true);
          setLikeCount((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.body.substring(0, 100) + "...",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  return (
    <div className="card mb-4 hover:shadow-md transition-shadow">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            {post.user?.display_name?.charAt(0) || "U"}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {post.user?.display_name || "Anonymous"}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
              })}
            </div>
          </div>
        </div>

        <button className="text-gray-400 hover:text-gray-600 p-1">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {post.title}
        </h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {post.body}
        </p>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span key={tag} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              liked
                ? "text-pink-600 bg-pink-50"
                : "text-gray-500 hover:text-pink-600 hover:bg-pink-50"
            }`}
          >
            <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
            <span className="font-medium">{likeCount}</span>
          </button>

          <button
            onClick={() => onReply(post)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">{post.reply_count || 0}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition-colors"
          >
            <Share2 className="h-5 w-5" />
            <span className="font-medium">Share</span>
          </button>
        </div>

        {post.reply_count > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-pink-600 hover:text-pink-700 font-medium text-sm"
          >
            {showReplies ? "Hide replies" : `Show ${post.reply_count} replies`}
          </button>
        )}
      </div>

      {/* Replies Section */}
      {showReplies && post.replies && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="font-medium text-gray-900 mb-3">Replies</h4>
          <div className="space-y-3">
            {post.replies.map((reply) => (
              <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {reply.user?.display_name?.charAt(0) || "U"}
                  </div>
                  <span className="font-medium text-sm text-gray-900">
                    {reply.user?.display_name || "Anonymous"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(reply.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{reply.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
