
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/react";
import {
  Code2,
  LayoutDashboard,
  Trophy,
  Users,
  UserRound,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  FileText,
  ClipboardCheck,
  BarChart3,
  Award,
  CalendarDays,
} from "lucide-react";

export default function DashboardLayout({ role, user, children }) {
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isOrganizer = role === "ORGANIZER";

  const displayName =
    user?.name ||
    user?.full_name ||
    user?.username ||
    "Skill Incubator User";

  const email = user?.email || user?.email_address || "";
  const avatarUrl = user?.avatar_url || user?.image_url || user?.imageUrl;
  const roleLabel = isOrganizer ? "Organizer" : "Student";

  const profilePath = isOrganizer
    ? "/organizer/profile"
    : "/student/profile";

  const settingsPath = isOrganizer
    ? "/organizer/settings"
    : "/student/settings";

  const navigation = isOrganizer
    ? [
      {
        label: "Dashboard",
        to: "/organizer",
        icon: LayoutDashboard,
        end: true,
      },
      {
        label: "Hackathons",
        to: "/organizer/hackathons",
        icon: Trophy,
      },
      {
        label: "Participants",
        to: "/organizer/participants",
        icon: Users,
      },
      {
        label: "Submissions",
        to: "/organizer/submissions",
        icon: FileText,
      },
      {
        label: "Evaluation",
        to: "/organizer/evaluation",
        icon: ClipboardCheck,
      },
      {
        label: "Results",
        to: "/organizer/results",
        icon: Award,
      },
      {
        label: "Analytics",
        to: "/organizer/analytics",
        icon: BarChart3,
      },
    ]
  : [
  {
    label: "Dashboard",
    to: "/student",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Explore Hackathons",
    to: "/student/hackathons",
    icon: Trophy,
  },
  {
    label: "Your Hackathons",
    to: "/student/registrations",
    icon: CalendarDays,
  },
  {
    label: "Results",
    to: "/student/results",
    icon: Award,
  },
];
  function isActive(path, end = false) {
    if (end) return location.pathname === path;
    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setProfileOpen(false);

    try {
      await signOut();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  }

  function closeMobileSidebar() {
    setSidebarOpen(false);
  }

  function handleNavigation(path) {
    setProfileOpen(false);
    setSidebarOpen(false);
    navigate(path);
  }

  return (
    <div className="min-h-screen bg-[#09090f] text-white">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#0d0d16] transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
      >
        {/* Brand */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <Link
            to="/"
            className="flex items-center gap-3"
            onClick={closeMobileSidebar}
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
              <Code2 size={23} />
            </span>

            <span className="font-bold tracking-tight">
              Skill<span className="text-cyan-400">Incubator</span>
            </span>
          </Link>

          <button
            type="button"
            aria-label="Close menu"
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 md:hidden"
            onClick={closeMobileSidebar}
          >
            <X size={20} />
          </button>
        </div>

        {/* Workspace identity */}
        <div className="shrink-0 border-b border-white/10 px-5 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
            Workspace
          </p>

          <div className="mt-3 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-violet-400/20 bg-violet-500/15 text-violet-300">
              <ShieldCheck size={20} />
            </span>

            <div className="min-w-0">
              <p className="truncate font-semibold">
                {roleLabel} Portal
              </p>
              <p className="text-xs text-gray-500">
                From Skills to Solutions
              </p>
            </div>
          </div>
        </div>

        {/* Role-based navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="px-3 pb-3 pt-1 text-xs uppercase tracking-widest text-gray-500">
            Menu
          </p>

          {navigation.map(({ label, to, icon: Icon, end }) => {
            const active = isActive(to, end);

            return (
              <Link
                key={to}
                to={to}
                onClick={closeMobileSidebar}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${active
                    ? "border-cyan-400/20 bg-cyan-400/10 font-semibold text-cyan-300"
                    : "border-transparent text-gray-300 hover:bg-white/[0.04] hover:text-cyan-300"
                  }`}
              >
                <Icon size={19} />
                <span className="min-w-0 flex-1">{label}</span>

                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                )}
              </Link>
            );
          })}

          <div className="my-4 border-t border-white/[0.07]" />

          <p className="px-3 pb-2 text-xs uppercase tracking-widest text-gray-500">
            Account
          </p>

          <Link
            to={profilePath}
            onClick={closeMobileSidebar}
            aria-current={
              isActive(profilePath) ? "page" : undefined
            }
            className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${isActive(profilePath)
                ? "border-cyan-400/20 bg-cyan-400/10 font-semibold text-cyan-300"
                : "border-transparent text-gray-300 hover:bg-white/[0.04] hover:text-cyan-300"
              }`}
          >
            <UserRound size={19} />
            My Profile
          </Link>

          <Link
            to={settingsPath}
            onClick={closeMobileSidebar}
            className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${isActive(settingsPath)
                ? "border-cyan-400/20 bg-cyan-400/10 font-semibold text-cyan-300"
                : "border-transparent text-gray-300 hover:bg-white/[0.04] hover:text-cyan-300"
              }`}
          >
            <Settings size={19} />
            Settings
          </Link>
        </nav>

        {/* Sidebar account summary */}
        <div className="shrink-0 border-t border-white/10 p-4">
          <div className="mb-3 flex min-w-0 items-center gap-3 rounded-xl bg-white/[0.025] p-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-9 w-9 shrink-0 rounded-lg border border-white/10 object-cover"
              />
            ) : (
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cyan-400/10 font-bold text-cyan-300">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {displayName}
              </p>
              <p className="truncate text-xs text-gray-500">
                {email || roleLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loggingOut}
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-300 transition hover:bg-red-400/10 disabled:cursor-wait disabled:opacity-50"
          >
            <LogOut size={19} />
            {loggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>

      {/* Main dashboard */}
      <div className="min-w-0 md:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-[#09090f]/95 px-4 backdrop-blur-xl sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              className="shrink-0 rounded-xl border border-white/10 p-2 text-gray-300 hover:bg-white/5 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={21} />
            </button>

            <div className="min-w-0">
              <p className="text-xs text-gray-500">Welcome back</p>
              <h1 className="truncate font-semibold">
                {displayName}
              </h1>
            </div>
          </div>

          {/* User profile dropdown */}
          <div className="relative ml-3 shrink-0">
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-expanded={profileOpen}
              aria-label="Open user profile menu"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2 transition hover:border-cyan-400/30 sm:gap-3"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="h-9 w-9 rounded-lg object-cover"
                />
              ) : (
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-400/10 font-bold text-cyan-300">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}

              <span className="hidden max-w-36 text-left sm:block">
                <span className="block truncate text-sm font-medium">
                  {displayName}
                </span>
                <span className="block text-xs text-gray-500">
                  {roleLabel}
                </span>
              </span>

              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${profileOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {profileOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close profile menu"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setProfileOpen(false)}
                />

                <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-white/10 bg-[#12121d] p-3 shadow-2xl">
                  <div className="border-b border-white/10 px-2 pb-3">
                    <div className="flex items-center gap-3">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cyan-400/10 font-bold text-cyan-300">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      )}

                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {displayName}
                        </p>
                        <p className="truncate text-xs text-gray-400">
                          {email || "Email unavailable"}
                        </p>
                      </div>
                    </div>

                    <span className="mt-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-300">
                      {roleLabel}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavigation(profilePath)}
                    className="mt-2 flex w-full items-center gap-3 rounded-lg px-2 py-3 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
                  >
                    <UserRound size={17} />
                    View profile
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigation(settingsPath)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
                  >
                    <Settings size={17} />
                    Settings
                  </button>

                  <div className="my-2 border-t border-white/10" />

                  <button
                    type="button"
                    disabled={loggingOut}
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-sm text-red-300 transition hover:bg-red-400/10 disabled:opacity-50"
                  >
                    <LogOut size={17} />
                    {loggingOut ? "Signing out..." : "Sign out"}
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="min-w-0 p-5 md:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
