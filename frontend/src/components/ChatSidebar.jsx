import { Link } from "react-router-dom";
import { formatTime } from "../utils/formatTime";

export default function ChatSidebar({ conversations, activeId, user }) {
  const getOtherParticipant = (conv) => {
    const other = conv.participants?.find((p) => p._id !== user?._id);
    return other || conv.participants?.[0];
  };

  const getLastMessagePreview = (conv) => {
    const last = conv.lastMessage;
    if (!last) return "No messages yet";
    const text = last.content?.slice(0, 40) || "";
    return text + (last.content?.length > 40 ? "…" : "");
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="p-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800">Chats</h2>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {conversations.length === 0 ? (
          <p className="p-4 text-slate-500 text-sm">No conversations yet.</p>
        ) : (
          conversations.map((conv) => {
            const other = getOtherParticipant(conv);
            const isActive = activeId === conv._id;
            return (
              <Link
                key={conv._id}
                to={`/chat/${conv._id}`}
                className={`flex items-center gap-3 p-3 hover:bg-slate-50 transition ${
                  isActive ? "bg-teal-50 border-l-4 border-teal-600" : ""
                }`}
              >
                <div className="relative flex-shrink-0">
                  {other?.avatar ? (
                    <img
                      src={other.avatar}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                      {other?.displayName?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  {other?.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">
                    {other?.displayName || "Unknown"}
                  </p>
                  <p className="text-sm text-slate-500 truncate">
                    {other?.isOnline
                      ? "Online"
                      : other?.lastSeen
                        ? `Last seen ${formatTime(other.lastSeen)}`
                        : getLastMessagePreview(conv)}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
