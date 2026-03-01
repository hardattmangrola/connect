import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-teal-600">
          Connect
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/search"
            className="text-slate-600 hover:text-teal-600 text-sm font-medium"
          >
            New Chat
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-2 text-slate-700 hover:text-teal-600"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-sm font-bold">
                {user?.displayName?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <span className="hidden sm:inline text-sm font-medium">
              {user?.displayName}
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="text-slate-600 hover:text-red-600 text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
