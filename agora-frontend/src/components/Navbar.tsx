import { Link, NavLink, useNavigate } from "react-router-dom";
import { MessagesSquare, BookOpen, Plus, LogOut, Award } from "lucide-react";
import { useAuth } from "../api/AuthContext";
import Avatar from "./Avatar";

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
    isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
  }`;
}

function Navbar() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const fullName = user ? `${user.firstName} ${user.lastName}` : "";

  return (
    <nav className="bg-white/90 backdrop-blur border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-1 sm:gap-4">
          <Link to="/" className="flex items-center gap-2 mr-2">
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black">
              A
            </span>
            <span className="text-lg font-bold text-gray-900">Agora</span>
          </Link>
          <NavLink to="/" end className={navLinkClass}>
            <MessagesSquare size={16} />
            <span className="hidden sm:inline">Forum</span>
          </NavLink>
          <NavLink to="/resources" className={navLinkClass}>
            <BookOpen size={16} />
            <span className="hidden sm:inline">Resources</span>
          </NavLink>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {token ? (
            <>
              <Link
                to="/create"
                className="inline-flex items-center gap-1 bg-blue-600 text-white text-sm font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Ask a Question
              </Link>
              {user && (
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 transition-colors"
                  title="Your profile"
                >
                  <Avatar name={fullName} id={user.id} />
                  <span className="hidden md:flex flex-col leading-tight">
                    <span className="text-sm font-medium text-gray-900">{user.firstName}</span>
                    <span className="text-[11px] text-amber-600 inline-flex items-center gap-0.5">
                      <Award size={11} /> {user.reputationScore} rep
                    </span>
                  </span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors px-2 py-2"
              >
                <LogOut size={16} />
                <span className="sr-only sm:not-sr-only">Log Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-2 py-2"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
