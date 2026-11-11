
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CircleHelp,
  CircleUserRound,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserDisplayName, getUserAvatarUrl, getUserInitials } from "../utils/userUtils";

const navLinks = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Scans", path: "/scan" },
  { name: "History", path: "/history" },
  { name: "Settings", path: "/settings" },
];

function Navbar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const displayName = getUserDisplayName(user);
  const avatarUrl = getUserAvatarUrl(user);
  const initials = getUserInitials(user);

  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    if (logoutLoading) return;

    setLogoutLoading(true);
    setLogoutError("");

    try {
      await signOut();

      setProfileOpen(false);
      setMenuOpen(false);

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error.message);
      setLogoutError("Unable to sign out. Please try again.");
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <header className="relative z-50 w-full border-b border-gray-200 bg-white">
      <nav className="mx-auto flex h-[56px] max-w-[1200px] items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Logo */}
        <Link
          to="/"
          className="shrink-0 text-[17px] font-extrabold tracking-tight text-[#006747]"
        >
          MailGuard
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden h-full items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <li key={link.name} className="h-full">
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `relative flex h-full items-center text-[12px] font-medium transition-colors ${
                    isActive
                      ? "text-[#006747] after:absolute after:bottom-[10px] after:left-0 after:h-[2px] after:w-full after:bg-[#00875A]"
                      : "text-[#263746] hover:text-[#006747]"
                  }`
                }
              >
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-5 md:flex">
          <button
            type="button"
            aria-label="Notifications"
            title="Notifications coming soon"
            className="text-gray-600 transition hover:text-emerald-700"
          >
            <Bell size={17} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            aria-label="Help"
            title="Help coming soon"
            className="text-gray-600 transition hover:text-emerald-700"
          >
            <CircleHelp size={17} strokeWidth={1.8} />
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              aria-label="Profile"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((previous) => !previous)}
              className="flex items-center text-gray-600 transition hover:text-emerald-700"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-7 w-7 rounded-full object-cover ring-2 ring-emerald-600/30"
                />
              ) : user ? (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 ring-1 ring-emerald-700/20">
                  {initials}
                </span>
              ) : (
                <CircleUserRound size={23} strokeWidth={1.5} />
              )}
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-9 z-50 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-xl"
              >
                <div className="flex items-center gap-3 border-b border-gray-100 px-2 pb-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-emerald-600/30"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900" title={displayName}>
                      {displayName}
                    </p>
                    {user?.email && (
                      <p className="truncate text-xs text-gray-500" title={user.email}>
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  Settings & Profile
                </Link>

                {logoutError && (
                  <p role="alert" className="mt-2 px-2 text-xs text-red-600">
                    {logoutError}
                  </p>
                )}

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LogOut size={16} />
                  {logoutLoading ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="-mr-2 rounded-lg p-2 text-gray-700 transition hover:bg-gray-100 hover:text-emerald-700 md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((previous) => !previous)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div
          id="mobile-nav"
          className="border-t border-gray-100 bg-white px-6 py-5 md:hidden"
        >
          <ul className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <li key={link.name}>
                <NavLink
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-sm font-medium ${
                      isActive ? "text-emerald-700" : "text-gray-600"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>

          <Link
            to="/scan"
            onClick={() => setMenuOpen(false)}
            className="mt-6 block rounded-lg bg-emerald-700 px-4 py-3 text-center text-sm font-semibold text-white"
          >
            New Scan
          </Link>

          {/* Mobile Account Section */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex items-center gap-3 mb-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-emerald-600/30"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-900" title={displayName}>
                  {displayName}
                </p>
                {user?.email && (
                  <p className="truncate text-xs text-gray-500" title={user.email}>
                    {user.email}
                  </p>
                )}
              </div>
            </div>

            {logoutError && (
              <p role="alert" className="mt-2 text-xs text-red-600">
                {logoutError}
              </p>
            )}

            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutLoading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut size={17} />
              {logoutLoading ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
