import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useUser, UserButton, useAuth } from "@clerk/react";
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
  Plus,
  UserPlus,
  Clock3,
  CircleCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export default function StudentDashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();

  const [registrations, setRegistrations] = useState([]);
  const [teams, setTeams] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    let cancelled = false;

    const loadDashboardData = async () => {
      setLoading(true);
      setError("");

      try {
        const token = await getToken();

        if (!token) {
          throw new Error("Your session could not be verified.");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        };

        const [registrationsResponse, teamsResponse, submissionsResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/registrations/me`, {
              headers,
            }),

            fetch(`${API_BASE_URL}/teams/my`, {
              headers,
            }),

            fetch(`${API_BASE_URL}/submissions/my`, {
              headers,
            }),
          ]);

        if (!registrationsResponse.ok) {
          throw new Error(
            `Unable to load registrations (${registrationsResponse.status}).`
          );
        }

        if (!teamsResponse.ok) {
          throw new Error(
            `Unable to load teams (${teamsResponse.status}).`
          );
        }

        if (!submissionsResponse.ok) {
          throw new Error(
            `Unable to load submissions (${submissionsResponse.status}).`
          );
        }

        const [registrationsData, teamsData, submissionsData] =
          await Promise.all([
            registrationsResponse.json(),
            teamsResponse.json(),
            submissionsResponse.json(),
          ]);

        if (cancelled) return;

        setRegistrations(
          Array.isArray(registrationsData) ? registrationsData : []
        );

        setTeams(Array.isArray(teamsData) ? teamsData : []);

        setSubmissions(
          Array.isArray(submissionsData) ? submissionsData : []
        );
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to load dashboard data:", err);

        setError(
          err?.message ||
            "Something went wrong while loading your dashboard."
        );

        setRegistrations([]);
        setTeams([]);
        setSubmissions([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [getToken, isLoaded, isSignedIn, user]);

  const displayName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    "Student";

  const email = user?.primaryEmailAddress?.emailAddress || "";
  const avatarUrl = user?.imageUrl;


  const teamsCreated = useMemo(
    () => teams.filter((team) => team.is_owner === true).length,
    [teams]
  );

  const teamsJoined = useMemo(
    () => teams.filter((team) => team.is_owner !== true).length,
    [teams]
  );

  const pendingSubmissions = useMemo(
    () =>
      submissions.filter(
        (submission) =>
          submission.status === "SUBMITTED" ||
          submission.status === "UNDER_REVIEW"
      ).length,
    [submissions]
  );

  const acceptedSubmissions = useMemo(
    () =>
      submissions.filter(
        (submission) => submission.status === "ACCEPTED"
      ).length,
    [submissions]
  );

  const stats = [
    {
      label: "Hackathons Joined",
      value: registrations.length,
      icon: Trophy,
    },
    {
      label: "My Teams",
      value: teams.length,
      icon: Users,
    },
    {
      label: "Projects Submitted",
      value: submissions.length,
      icon: FolderKanban,
    },
  ];

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "ACCEPTED":
        return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

      case "UNDER_REVIEW":
        return "border-amber-400/20 bg-amber-400/10 text-amber-300";

      case "NEEDS_CHANGES":
        return "border-red-400/20 bg-red-400/10 text-red-300";

      case "SUBMITTED":
      default:
        return "border-violet-400/20 bg-violet-400/10 text-violet-300";
    }
  };

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

          {loading && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <RefreshCw size={14} className="animate-spin" />
              Updating...
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-medium">Could not load live activity</p>
              <p className="mt-1 text-xs text-red-300/70">{error}</p>
            </div>
          </div>
        )}

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

              <p className="text-3xl font-bold text-white">
                {loading ? "—" : value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed activity */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Team & submission activity
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            A breakdown of what you've been working on.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Teams created */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-gray-400">Teams Created</span>

              <Plus size={20} className="text-violet-300" />
            </div>

            <p className="text-3xl font-bold text-white">
              {loading ? "—" : teamsCreated}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Teams you own
            </p>
          </div>

          {/* Teams joined */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-gray-400">Teams Joined</span>

              <UserPlus size={20} className="text-violet-300" />
            </div>

            <p className="text-3xl font-bold text-white">
              {loading ? "—" : teamsJoined}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Teams you joined
            </p>
          </div>

          {/* Under review */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-gray-400">Under Review</span>

              <Clock3 size={20} className="text-amber-300" />
            </div>

            <p className="text-3xl font-bold text-white">
              {loading ? "—" : pendingSubmissions}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Submitted / being reviewed
            </p>
          </div>

          {/* Accepted */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-gray-400">Accepted</span>

              <CircleCheck size={20} className="text-emerald-300" />
            </div>

            <p className="text-3xl font-bold text-white">
              {loading ? "—" : acceptedSubmissions}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Accepted submissions
            </p>
          </div>
        </div>
      </section>

      {/* Recent registrations */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Recent Hackathons
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your latest registrations.
            </p>
          </div>

          <Link
            to="/student/registrations"
            className="text-xs font-semibold text-violet-300 hover:text-violet-200"
          >
            View all
          </Link>
        </div>

        {registrations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
            <Trophy className="mx-auto mb-3 text-gray-500" size={28} />

            <p className="text-sm font-medium text-white">
              No hackathons yet
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Join your first hackathon to start building.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {registrations.slice(0, 3).map((registration) => (
              <Link
                key={registration.id}
                to={`/student/hackathons/${registration.hackathon_id}`}
                className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-violet-400/30 hover:bg-violet-400/[0.04] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
                    <Trophy size={20} />
                  </span>

                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-white">
                      {registration.hackathon_name ||
                        "Hackathon"}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Registered on{" "}
                      {formatDate(registration.registered_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">
                    {registration.status || "REGISTERED"}
                  </span>

                  <ArrowUpRight
                    size={17}
                    className="text-gray-500 transition group-hover:text-violet-300"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent submissions */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Recent Projects
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your latest project submissions.
            </p>
          </div>

          <Link
            to="/student/submissions"
            className="text-xs font-semibold text-violet-300 hover:text-violet-200"
          >
            View all
          </Link>
        </div>

        {submissions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
            <FolderKanban
              className="mx-auto mb-3 text-gray-500"
              size={28}
            />

            <p className="text-sm font-medium text-white">
              No projects submitted
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Submit your first project from a registered hackathon.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.slice(0, 3).map((submission) => (
              <div
                key={submission.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
                    <FolderKanban size={20} />
                  </span>

                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-white">
                      {submission.project_name ||
                        "Untitled Project"}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Submitted on{" "}
                      {formatDate(submission.submitted_at)}
                    </p>
                  </div>
                </div>

                <span
                  className={`w-fit rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                    submission.status
                  )}`}
                >
                  {(submission.status || "SUBMITTED")
                    .replaceAll("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
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
                <h3 className="font-semibold text-white">
                  My Teams
                </h3>

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
      {registrations.length === 0 &&
        teams.length === 0 &&
        submissions.length === 0 &&
        !loading && (
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
        )}
    </div>
  );
}