
import { Link } from "react-router-dom";
import { useUser, UserButton } from "@clerk/react";
import {
  Trophy,
  Users,
  FolderKanban,
  ArrowRight,
  UserRound,
  CalendarDays,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

const stats = [
  { label: "Hackathons Joined", value: "0", icon: Trophy },
  { label: "My Teams", value: "0", icon: Users },
  { label: "Projects Submitted", value: "0", icon: FolderKanban },
];

export default function StudentDashboard() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-400">
        Loading your profile...
      </div>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <UserRound size={36} className="mb-4 text-violet-300" />
        <h1 className="text-xl font-bold text-white">
          Sign in to access your dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Your student profile and activities will appear here.
        </p>
        <Link
          to="/login"
          className="mt-5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-500"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const displayName =
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    "Student";

  const email = user.primaryEmailAddress?.emailAddress || "";
  const avatarUrl = user.imageUrl;

  return (
    <div className="space-y-8">
      {/* Student profile */}
      <section className="flex flex-col justify-between gap-5 rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-600/20 via-[#171326] to-[#101019] p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex min-w-0 items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${displayName}'s profile`}
              className="h-16 w-16 shrink-0 rounded-2xl border border-violet-300/20 object-cover"
            />
          ) : (
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-violet-300/20 bg-violet-500/20 text-2xl font-bold text-violet-200">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-violet-300">
              Student Profile
            </p>

            <h2 className="truncate text-xl font-bold text-white sm:text-2xl">
              {displayName}
            </h2>

            <p className="mt-1 truncate text-sm text-gray-400">
              {email || "Email not available"}
            </p>

            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
              <CheckCircle2 size={13} />
              Logged in
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            to="/student/profile"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-violet-300/40 hover:bg-white/5"
          >
            <UserRound size={16} />
            My Profile
          </Link>

          <UserButton />
        </div>
      </section>

      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-600/20 via-[#171326] to-[#101019] p-6 md:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-violet-300">
            <Sparkles size={16} />
            YOUR INNOVATION JOURNEY
          </p>

          <h1 className="max-w-xl text-3xl font-bold text-white md:text-4xl">
            Welcome back, {user.firstName || "innovator"}.
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
            Discover hackathons, find teammates and turn your ideas into real
            projects.
          </p>

          <Link
            to="/student/hackathons"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Explore Hackathons
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Activity statistics */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Your activity
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Your hackathon journey at a glance.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-violet-400/25 hover:bg-white/[0.05]"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm text-gray-400">{label}</span>
                <Icon className="text-violet-300" size={21} />
              </div>

              <p className="text-3xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Quick access
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/student/registrations"
            className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-violet-400/30 hover:bg-violet-400/[0.04]"
          >
            <div className="flex items-center gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
                <CalendarDays size={21} />
              </span>
              <div>
                <h3 className="font-semibold text-white">
                  My Registrations
                </h3>
                <p className="mt-1 text-xs text-gray-400">
                  View your registered events
                </p>
              </div>
            </div>

            <ArrowUpRight
              size={18}
              className="text-gray-500 transition group-hover:text-violet-300"
            />
          </Link>

          <Link
            to="/student/teams"
            className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-violet-400/30 hover:bg-violet-400/[0.04]"
          >
            <div className="flex items-center gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
                <Users size={21} />
              </span>
              <div>
                <h3 className="font-semibold text-white">My Teams</h3>
                <p className="mt-1 text-xs text-gray-400">
                  Create a team or find your teammates
                </p>
              </div>
            </div>

            <ArrowUpRight
              size={18}
              className="text-gray-500 transition group-hover:text-violet-300"
            />
          </Link>
        </div>
      </section>

      {/* Empty state */}
      <section className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
        <Trophy className="mx-auto mb-4 text-gray-500" size={32} />

        <h2 className="font-semibold text-white">
          Your next challenge awaits
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Join a hackathon and start building your next project.
        </p>

        <Link
          to="/student/hackathons"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-300 transition hover:text-violet-200"
        >
          Browse hackathons
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
