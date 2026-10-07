
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Users,
  UserCheck,
  Clock3,
  UsersRound,
  Download,
  Eye,
  X,
  GraduationCap,
  CalendarDays,
  Target,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  UserRound,
  LoaderCircle,
  RefreshCw,
  Mail,
  Filter,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"
).replace(/\/+$/, "");

const REGISTRATION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "WAITLISTED",
  "REJECTED",
];

const STATUS_LABELS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  WAITLISTED: "Waitlisted",
  REJECTED: "Rejected",
};

const STATUS_STYLES = {
  CONFIRMED: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  PENDING: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  WAITLISTED: "border-violet-400/25 bg-violet-400/10 text-violet-300",
  REJECTED: "border-rose-400/25 bg-rose-400/10 text-rose-300",
};

const PAYMENT_LABELS = {
  PAID: "Paid",
  FREE: "Free",
  PENDING: "Pending",
};

const PAYMENT_STYLES = {
  PAID: "text-emerald-300",
  FREE: "text-cyan-300",
  PENDING: "text-amber-300",
};

async function readError(response) {
  try {
    const body = await response.json();

    if (typeof body.detail === "string") return body.detail;

    if (Array.isArray(body.detail)) {
      return body.detail.map((item) => item.msg || "Invalid input").join(" ");
    }

    return `Request failed (${response.status}).`;
  } catch {
    return `Request failed (${response.status}).`;
  }
}

function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function exportParticipants(participants) {
  const columns = [
    ["Registration ID", "id"],
    ["Student ID", "student_id"],
    ["Name", "name"],
    ["Email", "email"],
    ["Department", "department"],
    ["Year", "year"],
    ["Hackathon", "hackathon_name"],
    ["Team", "team_name"],
    ["Problem Statement", "problem_statement_title"],
    ["Registration Status", "status"],
    ["Payment Status", "payment_status"],
    ["Registered On", "registered_at"],
  ];

  const escapeCSV = (value) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const csv = [
    columns.map(([heading]) => escapeCSV(heading)).join(","),
    ...participants.map((participant) =>
      columns
        .map(([, key]) => {
          let value = participant[key];

          if (key === "status") {
            value = STATUS_LABELS[value] || value;
          }

          if (key === "payment_status") {
            value = PAYMENT_LABELS[value] || value;
          }

          if (key === "registered_at") {
            value = formatDate(value);
          }

          return escapeCSV(value);
        })
        .join(","),
    ),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "skill-incubator-participants.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function ParticipantAvatar({ name, large = false }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-gradient-to-br from-cyan-300/15 to-violet-400/10 font-bold text-cyan-200 ${
        large ? "h-16 w-16 text-xl" : "h-10 w-10 text-xs"
      }`}
    >
      {initials(name)}
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold sm:text-xs ${
        STATUS_STYLES[status] ||
        "border-white/10 bg-white/5 text-slate-300"
      }`}
    >
      {STATUS_LABELS[status] || status || "Unknown"}
    </span>
  );
}

function ParticipantDetailsModal({
  participant,
  saving,
  onClose,
  onSaveStatus,
}) {
  const [status, setStatus] = useState(participant.status);

  async function handleSubmit(event) {
    event.preventDefault();
    await onSaveStatus(participant.id, status);
  }

  const details = [
    {
      icon: GraduationCap,
      label: "College / department",
      value: participant.department || "Not provided",
    },
    {
      icon: UserRound,
      label: "Academic year",
      value: participant.year ? `Year ${participant.year}` : "Not provided",
    },
    {
      icon: UsersRound,
      label: "Team",
      value: participant.team_name || "No team assigned",
    },
    {
      icon: Target,
      label: "Problem statement",
      value: participant.problem_statement_title || "Not selected",
    },
    {
      icon: CalendarDays,
      label: "Registered on",
      value: formatDate(participant.registered_at),
    },
    {
      icon: CheckCircle2,
      label: "Payment status",
      value:
        PAYMENT_LABELS[participant.payment_status] ||
        participant.payment_status ||
        "Unknown",
    },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="participant-dialog-title"
        className="my-auto max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-cyan-300/15 bg-[#101523] shadow-2xl"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
      >
        <div className="flex items-start justify-between border-b border-white/10 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.17em] text-cyan-300">
              Participant profile
            </p>
            <h2
              id="participant-dialog-title"
              className="mt-2 text-xl font-bold text-white"
            >
              Registration details
            </h2>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close participant details"
            className="rounded-xl border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex items-center gap-4">
            <ParticipantAvatar name={participant.name} large />

            <div className="min-w-0">
              <h3 className="break-words text-lg font-bold text-white">
                {participant.name}
              </h3>

              <p className="mt-1 break-all text-sm text-slate-400">
                {participant.email}
              </p>

              {participant.student_id && (
                <p className="mt-1 text-xs text-slate-500">
                  Student ID: {participant.student_id}
                </p>
              )}

              <div className="mt-2">
                <StatusBadge status={participant.status} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CalendarDays size={14} className="text-cyan-300" />
              Registered for
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-200">
              {participant.hackathon_name}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {details.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="min-w-0 rounded-xl border border-white/[0.07] bg-black/10 p-3.5"
                >
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Icon size={14} className="shrink-0 text-cyan-300" />
                    {item.label}
                  </div>

                  <p className="mt-2 break-words text-sm font-medium text-slate-200">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 border-t border-white/10 pt-5"
          >
            <div>
              <label
                htmlFor="participant-status"
                className="text-sm font-semibold text-slate-200"
              >
                Registration status
              </label>

              <select
                id="participant-status"
                value={status}
                disabled={saving}
                onChange={(event) => setStatus(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#090d18] px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/40 disabled:opacity-50"
              >
                {REGISTRATION_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {STATUS_LABELS[item]}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Changes are saved through the authenticated backend API.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={onClose}
                className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-40"
              >
                Close
              </button>

              <button
                type="submit"
                disabled={saving || status === participant.status}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                {saving ? "Saving..." : "Save status"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Participants() {
  const { getToken } = useAuth();
  const [searchParams] = useSearchParams();

  const requestedHackathonId = searchParams.get("hackathon_id") || "all";

  const [hackathons, setHackathons] = useState([]);
  const [participants, setParticipants] = useState([]);

  const [hackathonFilter, setHackathonFilter] = useState(
    requestedHackathonId,
  );
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [loadingHackathons, setLoadingHackathons] = useState(true);
  const [loadingParticipants, setLoadingParticipants] = useState(true);
  const [savingStatusId, setSavingStatusId] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);

  const apiRequest = useCallback(
    async (path, options = {}) => {
      const token = await getToken();

      if (!token) {
        throw new Error("Login session unavailable. Please sign in again.");
      }

      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      if (response.status === 204) return null;

      return response.json();
    },
    [getToken],
  );

  const loadHackathons = useCallback(async () => {
    setLoadingHackathons(true);

    try {
      const data = await apiRequest("/hackathons/my");
      const list = Array.isArray(data) ? data : [];

      setHackathons(list);

      if (
        requestedHackathonId !== "all" &&
        !list.some(
          (hackathon) =>
            String(hackathon.id) === String(requestedHackathonId),
        )
      ) {
        setHackathonFilter("all");
      }
    } catch (err) {
      setError(err.message || "Could not load your hackathons.");
    } finally {
      setLoadingHackathons(false);
    }
  }, [apiRequest, requestedHackathonId]);

  const loadParticipants = useCallback(async () => {
    setLoadingParticipants(true);
    setError("");

    try {
      const query =
        hackathonFilter !== "all"
          ? `?hackathon_id=${encodeURIComponent(hackathonFilter)}`
          : "";

      const data = await apiRequest(`/participants${query}`);

      setParticipants(Array.isArray(data) ? data : []);
    } catch (err) {
      setParticipants([]);
      setError(err.message || "Could not load participant registrations.");
    } finally {
      setLoadingParticipants(false);
    }
  }, [apiRequest, hackathonFilter]);

  useEffect(() => {
    loadHackathons();
  }, [loadHackathons]);

  useEffect(() => {
    loadParticipants();
  }, [loadParticipants]);

  const filteredParticipants = useMemo(() => {
    const term = search.trim().toLowerCase();

    return participants.filter((participant) => {
      const matchesSearch =
        !term ||
        (participant.name || "").toLowerCase().includes(term) ||
        (participant.email || "").toLowerCase().includes(term) ||
        (participant.department || "").toLowerCase().includes(term) ||
        (participant.team_name || "").toLowerCase().includes(term) ||
        (participant.problem_statement_title || "")
          .toLowerCase()
          .includes(term) ||
        (participant.student_id || "").toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "ALL" || participant.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [participants, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: participants.length,
      confirmed: participants.filter((p) => p.status === "CONFIRMED").length,
      pending: participants.filter((p) => p.status === "PENDING").length,
      teams: new Set(
        participants.map((p) => p.team_id).filter(Boolean).map(String),
      ).size,
    }),
    [participants],
  );

  function showNotice(message, type = "success") {
    setNotice({ message, type });
    window.setTimeout(() => setNotice(null), 3500);
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setHackathonFilter("all");
  }

  async function handleStatusChange(registrationId, nextStatus) {
    setSavingStatusId(String(registrationId));
    setError("");

    try {
      const updated = await apiRequest(
        `/participants/${encodeURIComponent(registrationId)}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatus }),
        },
      );

      setParticipants((current) =>
        current.map((participant) =>
          String(participant.id) === String(registrationId)
            ? updated
            : participant,
        ),
      );

      setSelectedParticipant(updated);
      showNotice("Registration status updated successfully.");
    } catch (err) {
      showNotice(
        err.message || "Unable to update registration status.",
        "error",
      );
    } finally {
      setSavingStatusId("");
    }
  }

  const selectedHackathon = hackathons.find(
    (hackathon) => String(hackathon.id) === String(hackathonFilter),
  );

  const hasFilters = search !== "" || statusFilter !== "ALL";

  const isLoading = loadingHackathons || loadingParticipants;

  return (
    <div className="min-h-screen bg-[#080b14] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-[#111a2b] via-[#101523] to-[#10101f] p-6 sm:p-9"
        >
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/3 h-36 w-36 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.17em] text-cyan-300">
                <UsersRound size={14} />
                Organizer workspace
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Participant <span className="text-cyan-300">Management</span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                Review actual registrations, inspect student profiles, and
                manage registration decisions for your hackathons.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadParticipants}
                disabled={loadingParticipants}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.07] disabled:opacity-40"
              >
                <RefreshCw
                  size={16}
                  className={loadingParticipants ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => exportParticipants(filteredParticipants)}
                disabled={filteredParticipants.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download size={17} />
                Export CSV
              </button>
            </div>
          </div>

          <div className="relative mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-xs text-slate-500">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              Live registration API
            </span>
            <span className="inline-flex items-center gap-2">
              <UserCheck size={14} />
              Participant profiles
            </span>
            <span className="inline-flex items-center gap-2">
              <Download size={14} />
              CSV export
            </span>
          </div>
        </motion.div>

        {/* Current event */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#101522] p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-white">Registrations</h2>
              <p className="mt-1 text-xs text-slate-500">
                Only registrations belonging to your organizer account are
                returned by the API.
              </p>
            </div>

            <select
              value={hackathonFilter}
              disabled={loadingHackathons}
              onChange={(event) => setHackathonFilter(event.target.value)}
              aria-label="Filter by hackathon"
              className="w-full rounded-xl border border-white/10 bg-[#090d18] px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-300/40 disabled:opacity-50 sm:max-w-sm"
            >
              <option value="all">All my hackathons</option>
              {hackathons.map((hackathon) => (
                <option key={hackathon.id} value={hackathon.id}>
                  {hackathon.name}
                </option>
              ))}
            </select>
          </div>

          {selectedHackathon && (
            <div className="mt-4 flex items-center gap-2 border-t border-white/[0.07] pt-4 text-sm text-slate-400">
              <CalendarDays size={15} className="text-cyan-300" />
              Selected event:
              <span className="font-semibold text-slate-200">
                {selectedHackathon.name}
              </span>
            </div>
          )}
        </section>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-300/15 bg-rose-300/[0.04] px-4 py-3.5">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-rose-300"
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-rose-200">
                Could not load participant data
              </p>
              <p className="mt-1 break-words text-xs leading-5 text-slate-400">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                loadHackathons();
                loadParticipants();
              }}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5"
            >
              <RotateCcw size={13} />
              Retry
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            {
              label: "Total registrations",
              value: stats.total,
              icon: Users,
              color: "text-cyan-300",
              bg: "bg-cyan-300/10",
            },
            {
              label: "Confirmed",
              value: stats.confirmed,
              icon: UserCheck,
              color: "text-emerald-300",
              bg: "bg-emerald-300/10",
            },
            {
              label: "Pending review",
              value: stats.pending,
              icon: Clock3,
              color: "text-amber-300",
              bg: "bg-amber-300/10",
            },
            {
              label: "Teams represented",
              value: stats.teams,
              icon: UsersRound,
              color: "text-violet-300",
              bg: "bg-violet-300/10",
            },
          ].map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl border border-white/[0.08] bg-[#101522] p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium leading-5 text-slate-400 sm:text-sm">
                    {stat.label}
                  </p>
                  <div className={`rounded-xl p-2 ${stat.bg} ${stat.color}`}>
                    <Icon size={17} />
                  </div>
                </div>

                <p className="mt-4 text-3xl font-black tracking-tight text-white">
                  {isLoading ? "—" : String(stat.value).padStart(2, "0")}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Search and filters */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, college, team..."
                className="w-full rounded-xl border border-white/10 bg-[#101522] py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/40"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowFilters((current) => !current)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-semibold transition ${
                showFilters
                  ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                  : "border-white/10 bg-[#101522] text-slate-300 hover:bg-white/5"
              }`}
            >
              <Filter size={16} />
              Status filters
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl border border-white/10 bg-[#101522] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Registration status
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      ["ALL", "All statuses"],
                      ...REGISTRATION_STATUSES.map((status) => [
                        status,
                        STATUS_LABELS[status],
                      ]),
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setStatusFilter(value)}
                        className={`rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ${
                          statusFilter === value
                            ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                            : "border-white/10 text-slate-400 hover:bg-white/5"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Registration list heading */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">
              Participant directory
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isLoading
                ? "Loading registration data..."
                : `${filteredParticipants.length} of ${participants.length} registrations`}
            </p>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
            >
              <RotateCcw size={13} />
              Clear filters
            </button>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-[#101522] py-14 text-sm text-slate-400">
            <LoaderCircle size={20} className="animate-spin text-cyan-300" />
            Loading participant registrations...
          </div>
        )}

        {/* Desktop table */}
        {!isLoading && filteredParticipants.length > 0 && (
          <div className="hidden overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101522] md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                    {[
                      "Participant",
                      "Hackathon / Team",
                      "Registered",
                      "Payment",
                      "Status",
                      "Action",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.06]">
                  {filteredParticipants.map((participant, index) => (
                    <motion.tr
                      key={participant.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(index * 0.02, 0.2) }}
                      className="transition hover:bg-white/[0.025]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <ParticipantAvatar name={participant.name} />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-200">
                              {participant.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {participant.email}
                            </p>
                            {participant.student_id && (
                              <p className="mt-1 text-[10px] text-slate-600">
                                ID: {participant.student_id}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="max-w-[240px] px-5 py-4">
                        <p className="truncate text-sm font-medium text-slate-300">
                          {participant.hackathon_name}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          Team: {participant.team_name || "Not assigned"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-400">
                        {formatDate(participant.registered_at)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-semibold ${
                            PAYMENT_STYLES[participant.payment_status] ||
                            "text-slate-400"
                          }`}
                        >
                          {PAYMENT_LABELS[participant.payment_status] ||
                            participant.payment_status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={participant.status} />
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedParticipant(participant)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/25 hover:bg-cyan-300/5 hover:text-cyan-200"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mobile cards */}
        {!isLoading && filteredParticipants.length > 0 && (
          <div className="grid gap-3 md:hidden">
            {filteredParticipants.map((participant) => (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/[0.08] bg-[#101522] p-4"
              >
                <div className="flex items-start gap-3">
                  <ParticipantAvatar name={participant.name} />

                  <div className="min-w-0 flex-1">
                    <p className="break-words font-semibold text-white">
                      {participant.name}
                    </p>
                    <p className="mt-1 break-all text-xs text-slate-500">
                      {participant.email}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-600">
                      {participant.student_id || participant.id}
                    </p>
                  </div>

                  <StatusBadge status={participant.status} />
                </div>

                <div className="mt-4 space-y-2 border-t border-white/[0.07] pt-4">
                  <p className="text-xs leading-5 text-slate-400">
                    <span className="text-slate-600">Hackathon:</span>{" "}
                    {participant.hackathon_name}
                  </p>
                  <p className="text-xs text-slate-400">
                    <span className="text-slate-600">Team:</span>{" "}
                    {participant.team_name || "Not assigned"}
                  </p>
                  <p className="text-xs text-slate-400">
                    <span className="text-slate-600">Registered:</span>{" "}
                    {formatDate(participant.registered_at)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedParticipant(participant)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-semibold text-slate-300 transition hover:border-cyan-300/25 hover:text-cyan-200"
                >
                  <Eye size={15} />
                  View participant
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading &&
          filteredParticipants.length === 0 &&
          !error && (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#101522]/50 px-5 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-300">
                {participants.length > 0 ? (
                  <Search size={24} />
                ) : (
                  <Users size={24} />
                )}
              </div>

              <h3 className="mt-5 text-lg font-bold text-white">
                {participants.length > 0
                  ? "No matching participants"
                  : "No registrations found"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {participants.length > 0
                  ? "Try changing your search or status filters."
                  : "This hackathon currently has no registration records returned by the API. Once students register and registration records are created, they will appear here."}
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {hasFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5"
                  >
                    <RotateCcw size={15} />
                    Clear filters
                  </button>
                )}

                <button
                  type="button"
                  onClick={loadParticipants}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
                >
                  <RefreshCw size={15} />
                  Refresh registrations
                </button>
              </div>
            </div>
          )}

        <div className="flex flex-col gap-2 border-t border-white/[0.07] py-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>Skill Incubator · Organizer workspace</span>
          <span>Participants · Connected to API</span>
        </div>
      </div>

      {/* Participant details and status update */}
      <AnimatePresence>
        {selectedParticipant && (
          <ParticipantDetailsModal
            key={selectedParticipant.id}
            participant={selectedParticipant}
            saving={savingStatusId === String(selectedParticipant.id)}
            onClose={() => setSelectedParticipant(null)}
            onSaveStatus={handleStatusChange}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {notice && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={`fixed bottom-5 right-5 z-[60] flex max-w-md items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-2xl ${
              notice.type === "error"
                ? "border-rose-300/20 bg-[#211218]"
                : "border-emerald-300/20 bg-[#101a20]"
            }`}
          >
            {notice.type === "error" ? (
              <AlertCircle size={18} className="shrink-0 text-rose-300" />
            ) : (
              <CheckCircle2 size={18} className="shrink-0 text-emerald-300" />
            )}

            <span className="min-w-0 break-words text-sm text-slate-200">
              {notice.message}
            </span>

            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Dismiss notification"
              className="ml-1 rounded-md p-1 text-slate-500 hover:text-white"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
