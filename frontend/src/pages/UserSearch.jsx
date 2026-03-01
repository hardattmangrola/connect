import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function UserSearch() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      setLoading(true);
      api
        .searchUsers(query)
        .then(({ data }) => setResults(data.users || []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-xl font-bold text-slate-800 mb-4">New Chat</h1>
      <input
        type="search"
        placeholder="Search users by name or email..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none mb-4"
      />
      {loading && <p className="text-slate-500 text-sm">Searching...</p>}
      <ul className="space-y-2">
        {results.map((u) => (
          <li key={u._id}>
            <Link
              to={`/chat/new/${u._id}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition"
            >
              {u.avatar ? (
                <img
                  src={u.avatar}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                  {u.displayName?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div>
                <p className="font-medium text-slate-800">{u.displayName}</p>
                <p className="text-sm text-slate-500">{u.email}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {query && !loading && results.length === 0 && (
        <p className="text-slate-500 text-sm">No users found.</p>
      )}
    </div>
  );
}
