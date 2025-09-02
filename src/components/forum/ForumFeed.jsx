import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase, TABLES } from "../../lib/supabase";
import Post from "./Post";
import CreatePostForm from "./CreatePostForm";
import ReplyForm from "./ReplyForm";
import { Plus, Filter, Search, TrendingUp, Clock } from "lucide-react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest", icon: Clock },
  { value: "trending", label: "Trending", icon: TrendingUp },
];

export default function ForumFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPosts();
  }, [selectedTags, sortBy, searchQuery]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from(TABLES.POSTS)
        .select(
          `
          *,
          user:users(display_name, avatar_url),
          replies:replies(id, body, created_at, user:users(display_name)),
          likes:likes(id)
        `
        )
        .order("created_at", { ascending: false });

      // Apply tag filter
      if (selectedTags.length > 0) {
        query = query.overlaps("tags", selectedTags);
      }

      // Apply search filter
      if (searchQuery.trim()) {
        query = query.or(
          `title.ilike.%${searchQuery}%,body.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process posts to add computed fields
      const processedPosts = data.map((post) => ({
        ...post,
        reply_count: post.replies?.length || 0,
        like_count: post.likes?.length || 0,
      }));

      // Sort posts
      if (sortBy === "trending") {
        processedPosts.sort(
          (a, b) =>
            b.like_count + b.reply_count - (a.like_count + a.reply_count)
        );
      }

      setPosts(processedPosts);
    } catch (error) {
      setError("Failed to fetch posts");
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowCreateForm(false);
  };

  const handleReply = (post) => {
    setReplyingTo(post);
  };

  const handleReplySubmitted = (reply) => {
    // Update the post's replies
    setPosts(
      posts.map((post) => {
        if (post.id === reply.post_id) {
          return {
            ...post,
            replies: [...(post.replies || []), reply],
            reply_count: (post.reply_count || 0) + 1,
          };
        }
        return post;
      })
    );
    setReplyingTo(null);
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSearchQuery("");
    setSortBy("newest");
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
        {user && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            New Post
          </button>
        )}
      </div>

      {/* Create Post Form */}
      {showCreateForm && (
        <CreatePostForm
          onPostCreated={handlePostCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Filters and Search */}
      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field min-w-[140px]"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(selectedTags.length > 0 || searchQuery) && (
            <button onClick={clearFilters} className="btn-secondary">
              Clear Filters
            </button>
          )}
        </div>

        {/* Tag Filters */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Filter by tags:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "mental-health",
              "relationships",
              "coming-out",
              "family",
              "work",
              "lifestyle",
              "dating",
              "support",
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <MessageCircle className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No posts found
          </h3>
          <p className="text-gray-600">
            {searchQuery || selectedTags.length > 0
              ? "Try adjusting your search or filters"
              : "Be the first to start a conversation!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id}>
              <Post
                post={post}
                onReply={handleReply}
                onPostUpdate={fetchPosts}
              />
              {replyingTo?.id === post.id && (
                <ReplyForm
                  post={post}
                  onReplySubmitted={handleReplySubmitted}
                  onCancel={() => setReplyingTo(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
