/**
 * API client for Connect backend
 * Loads VITE_API_URL from frontend/.env
 * Empty = same origin (Vite proxy) - no CORS
 * Production: set VITE_API_URL to backend URL
 */

const API_URL = import.meta.env.VITE_API_URL ?? "";

const getToken = () => localStorage.getItem("accessToken");

const getBaseUrl = () => (API_URL ? API_URL : window.location.origin);

const request = async (endpoint, options = {}) => {
  const url = `${getBaseUrl()}${endpoint}`;
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }

  return data;
};

export const api = {
  register: (body) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  refreshToken: (body) =>
    request("/api/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  logout: () => request("/api/auth/logout", { method: "POST" }),

  getMe: () => request("/api/users/me"),
  updateProfile: (formData) => {
    const token = getToken();
    return fetch(`${getBaseUrl()}/api/users/me`, {
      method: "PATCH",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.message);
        return data;
      });
  },
  searchUsers: (q, page = 1, limit = 20) =>
    request(
      `/api/users/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`
    ),
  getUserById: (id) => request(`/api/users/${id}`),

  getConversations: (page = 1, limit = 20) =>
    request(`/api/conversations?page=${page}&limit=${limit}`),
  getMessages: (conversationId, page = 1, limit = 30, before) => {
    let url = `/api/conversations/${conversationId}/messages?page=${page}&limit=${limit}`;
    if (before) url += `&before=${encodeURIComponent(before)}`;
    return request(url);
  },
  sendMessage: (body) =>
    request("/api/messages", { method: "POST", body: JSON.stringify(body) }),
  markAsRead: (conversationId, messageIds) =>
    request("/api/messages/read", {
      method: "POST",
      body: JSON.stringify({
        conversationId,
        messageIds: Array.isArray(messageIds) ? messageIds : [messageIds],
      }),
    }),

  health: () => request("/api/health"),
};

export default api;
