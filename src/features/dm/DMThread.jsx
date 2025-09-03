import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function DMThread() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const typingRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("dm_messages")
        .select("id, sender, body, created_at")
        .eq("thread_id", id)
        .order("created_at", { ascending: true });
      if (mounted) {
        setMessages(data || []);
        setLoading(false);
      }
    }
    load();
    const channel = supabase
      .channel(`dm-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dm_messages",
          filter: `thread_id=eq.${id}`,
        },
        load
      )
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [id]);

  async function sendMessage(e) {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !body.trim()) return;
    await supabase
      .from("dm_messages")
      .insert({ thread_id: id, sender: user.id, body: body.trim() });
    setBody("");
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Conversation</h1>
      <div className="bg-white rounded-2xl shadow p-4 h-[60vh] overflow-y-auto">
        {loading ? (
          <div>Loading...</div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="py-1">
              <div className="text-sm text-gray-600">{m.sender}</div>
              <div>{m.body}</div>
            </div>
          ))
        )}
      </div>
      <form onSubmit={sendMessage} className="mt-4 flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Type a message"
        />
        <button className="px-4 py-2 bg-pink-500 text-white rounded-lg">
          Send
        </button>
      </form>
    </div>
  );
}
