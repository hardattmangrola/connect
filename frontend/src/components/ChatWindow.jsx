import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";
import { useAuth } from "../context/AuthContext";
import { formatMessageTime } from "../utils/formatTime";

export default function ChatWindow({ conversationId, otherParticipant }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [typing, setTyping] = useState(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const listRef = useRef(null);

  // Load messages
  const loadMessages = useCallback((before = null) => {
    if (!conversationId) return Promise.resolve();
    return api
      .getMessages(conversationId, 1, 30, before)
      .then(({ data }) => ({
        messages: data.messages || [],
        hasMore: data.pagination?.hasMore ?? false,
      }));
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    setLoading(true);
    setMessages([]);
    loadMessages()
      .then(({ messages: msgs, hasMore: more }) => {
        setMessages(msgs);
        setHasMore(more);
        const myId = user?._id?.toString?.() || user?._id;
        const unreadIds = msgs
          .filter((m) => {
            const sid = m.sender?._id?.toString?.() ?? m.sender;
            return sid !== myId;
          })
          .filter((m) => {
            const read = (m.readBy || []).map((r) => r?.toString?.() ?? r);
            return !read.includes(myId);
          })
          .map((m) => m._id);
        if (unreadIds.length) {
          api.markAsRead(conversationId, unreadIds).catch(() => {});
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [conversationId, user?._id, loadMessages]);

  // Infinite scroll - load older messages
  const loadOlder = () => {
    if (!hasMore || loadingMore || messages.length === 0) return;
    const oldest = messages[0];
    if (!oldest?.createdAt) return;
    setLoadingMore(true);
    loadMessages(oldest.createdAt)
      .then(({ messages: older, hasMore: more }) => {
        setMessages((prev) => [...older, ...prev]);
        setHasMore(more);
      })
      .catch(console.error)
      .finally(() => setLoadingMore(false));
  };

  // Join room & Socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !conversationId) return;

    socket.emit("join-conversation", { conversationId });

    const onNewMessage = (msg) => {
      if (
        msg.conversation?._id === conversationId ||
        msg.conversation === conversationId
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    const onTypingStart = ({ userId: uid }) => {
      if (uid !== user?._id) setTyping(uid);
    };

    const onTypingStop = ({ userId: uid }) => {
      if (uid !== user?._id) setTyping(null);
    };

    const onMessageRead = ({ userId: readerId, messageIds: ids }) => {
      if (!ids?.length || !readerId) return;
      setMessages((prev) =>
        prev.map((m) =>
          ids.includes(m._id)
            ? {
                ...m,
                readBy: [...new Set([...(m.readBy || []).map((r) => r?.toString?.() ?? r), readerId?.toString?.() ?? readerId])],
              }
            : m
        )
      );
    };

    socket.on("message:new", onNewMessage);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);
    socket.on("message:read", onMessageRead);

    return () => {
      socket.emit("leave-conversation", { conversationId });
      socket.off("message:new", onNewMessage);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
      socket.off("message:read", onMessageRead);
    };
  }, [conversationId, user?._id]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const content = input.trim();
    setInput("");
    setSending(true);

    try {
      const { data } = await api.sendMessage({
        content,
        conversationId,
      });
      setMessages((prev) => {
        if (prev.some((m) => m._id === data.message._id)) return prev;
        return [...prev, data.message];
      });
    } catch (err) {
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const debounceRef = useRef(null);
  const onInputChange = (e) => {
    setInput(e.target.value);
    const socket = getSocket();
    if (socket && conversationId) {
      socket.emit("typing:start", { conversationId });
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(
        () => socket.emit("typing:stop", { conversationId }),
        2000
      );
    }
  };

  if (!conversationId)
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-500 p-4">
        Select a chat or start a new conversation
      </div>
    );

  const typingName = otherParticipant?.displayName || "Someone";

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div
        className="flex-1 overflow-y-auto p-4 scrollbar-thin flex flex-col"
        ref={listRef}
      >
        {loading ? (
          <div className="flex items-center justify-center flex-1 text-slate-500">
            Loading messages...
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="flex justify-center py-2">
                <button
                  type="button"
                  onClick={loadOlder}
                  disabled={loadingMore}
                  className="text-sm text-teal-600 hover:underline disabled:opacity-50"
                >
                  {loadingMore ? "Loading..." : "Load older messages"}
                </button>
              </div>
            )}
            {messages.map((msg) => {
              const isMe =
                msg.sender?._id === user?._id || msg.sender === user?._id;
              const readBy = msg.readBy || [];
                const isRead = isMe && readBy.length > 0;
              return (
                <div
                  key={msg._id}
                  className={`flex mb-4 ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isMe
                        ? "bg-teal-600 text-white rounded-br-md"
                        : "bg-white text-slate-800 rounded-bl-md shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    <div
                      className={`flex items-center gap-1 mt-1 ${
                        isMe ? "text-teal-100" : "text-slate-500"
                      }`}
                    >
                      <span className="text-xs">
                        {formatMessageTime(msg.createdAt)}
                      </span>
                      {isMe && (
                        <span
                          className="text-xs"
                          title={isRead ? "Read" : "Sent"}
                        >
                          {isRead ? (
                            <span className="inline-block">✓✓</span>
                          ) : (
                            <span className="inline-block">✓</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {typing && (
              <div className="flex mb-2 text-slate-500 text-sm italic">
                {typingName} is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form
        onSubmit={sendMessage}
        className="p-4 bg-white border-t border-slate-200 flex gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={onInputChange}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 rounded-full border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="px-6 py-3 bg-teal-600 text-white font-medium rounded-full hover:bg-teal-700 disabled:opacity-50 transition shrink-0"
        >
          Send
        </button>
      </form>
    </div>
  );
}
