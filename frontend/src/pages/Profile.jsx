import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [about, setAbout] = useState(user?.about || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("displayName", displayName);
      formData.append("about", about);
      const file = fileRef.current?.files?.[0];
      if (file) formData.append("avatar", file);

      await api.updateProfile(formData);
      await refreshUser();
      setMessage("Profile updated");
    } catch (err) {
      setMessage(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-xl font-bold text-slate-800 mb-6">Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message === "Profile updated" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}
        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-2xl font-bold">
              {displayName?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="text-sm text-slate-600"
          />
        </div>
        <input
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          required
        />
        <div>
          <textarea
            placeholder="About"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
            maxLength={150}
          />
          <p className="text-xs text-slate-500 mt-1 text-right">
            {about.length}/150
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-60 transition"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
