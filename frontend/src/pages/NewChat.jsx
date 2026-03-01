import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function NewChat() {
  const { recipientId } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendFirstMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setLoading(true);
    setError("");

    try {
      const { data } = await api.sendMessage({
        content: input.trim(),
        recipientId,
      });
      const convId =
        data.message?.conversation?._id || data.message?.conversation;
      if (convId) {
        navigate(`/chat/${convId}`, { replace: true });
      } else {
        setError("Could not start conversation");
      }
    } catch (err) {
      setError(err.message || "Failed to send");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4">
      <p className="text-slate-500 text-sm mb-4">
        Send your first message to start the conversation
      </p>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
      <form onSubmit={sendFirstMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 rounded-full border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-teal-600 text-white font-medium rounded-full hover:bg-teal-700 disabled:opacity-50 transition"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
