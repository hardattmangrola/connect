import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import NewChat from "./NewChat";

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversationId, recipientId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getConversations()
      .then(({ data }) => setConversations(data.conversations || []))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, [conversationId]);

  const isNewChat = recipientId && !conversationId;
  const activeConv = conversations.find((c) => c._id === conversationId);
  const otherParticipant = activeConv?.participants?.find(
    (p) => p._id !== user?._id
  );

  // Mobile: show conversation list when no chat selected
  const showMobileList = !conversationId && !recipientId;

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar - visible on desktop, or on mobile when showing list */}
      <aside
        className={`w-80 flex-shrink-0 border-r border-slate-200 overflow-hidden transition-all ${showMobileList ? "block flex-1 sm:flex-initial" : "hidden sm:block"
          }`}
      >
        <ChatSidebar
          conversations={conversations}
          activeId={conversationId}
          user={user}
        />
      </aside>

      {/* Main chat area - on mobile with active chat, show back button */}
      <main
        className={`flex-1 flex flex-col min-w-0 overflow-hidden ${!showMobileList ? "flex flex-col" : "hidden sm:flex sm:flex-col"
          }`}
      >
        {conversationId && (
          <div className="sm:hidden flex items-center gap-2 p-3 bg-white border-b border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => navigate("/chat")}
              className="text-teal-600 font-medium"
              aria-label="Back to chats"
            >
              ← Back
            </button>
            <span className="font-medium text-slate-800 truncate">
              {otherParticipant?.displayName || "Chat"}
            </span>
          </div>
        )}
        {isNewChat ? (
          <NewChat />
        ) : (
          <ChatWindow
            conversationId={conversationId}
            otherParticipant={otherParticipant}
          />
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-slate-200 flex items-center justify-around z-10">
        <Link
          to="/chat"
          className={`flex-1 text-center py-3 ${showMobileList ? "text-teal-600 font-medium" : "text-slate-600"
            }`}
        >
          Chats
        </Link>
        <Link
          to="/search"
          className="flex-1 text-center py-3 text-slate-600"
        >
          Search
        </Link>
        <Link
          to="/profile"
          className="flex-1 text-center py-3 text-slate-600"
        >
          Profile
        </Link>
      </nav>
      {conversationId && (
        <div className="sm:hidden h-14 flex-shrink-0" aria-hidden />
      )}
    </div>
  );
}
