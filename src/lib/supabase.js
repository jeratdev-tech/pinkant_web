import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table names
export const TABLES = {
  USERS: "users",
  POSTS: "posts",
  REPLIES: "replies",
  LIKES: "likes",
};

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
  console.error("Supabase error:", error);
  return {
    error: error.message || "An unexpected error occurred",
    details: error,
  };
};
