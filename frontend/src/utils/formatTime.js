/**
 * Format timestamps for messages and presence
 */

/** Exact time for messages (e.g. 10:45 AM) */
export const formatMessageTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

/** Relative time for presence (Last seen) */
export const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;

  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diff < 86400000) return "Yesterday";
  if (diff < 604800000)
    return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};
