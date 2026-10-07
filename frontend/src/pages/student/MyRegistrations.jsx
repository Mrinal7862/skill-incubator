
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  CalendarDays,
  MapPin,
  UsersRound,
  ArrowUpRight,
  Ticket,
  CheckCircle2,
  Clock3,
  XCircle,
  X,
  RotateCcw,
  ExternalLink,
  FileText,
  Sparkles,
  SlidersHorizontal,
  CircleDollarSign,
  ClipboardList,
} from "lucide-react";

const INITIAL_REGISTRATIONS = [
  {
    id: "REG-001",
    hackathonId: "demo-hackathon-1",
    hackathon: "Minerva Innovation Challenge",
    organization: "Skill Incubator",
    description:
      "Build practical solutions to real-world problems through technology, creativity, and teamwork.",
    category: "AI / Innovation",
    format: "On campus",
    venue: "SHEAT College of Engineering, Varanasi",
    startDate: "2026-11-15T09:00:00",
    endDate: "2026-11-16T18:00:00",
    registeredAt: "2026-10-01T10:30:00",
    teamName: "Code Warriors",
    teamSize: 4,
    registrationStatus: "CONFIRMED",
    paymentStatus: "FREE",
    registrationFee: 0,
    problemStatement: "AI-Powered Smart Attendance",
  },
  {
    id: "REG-002",
    hackathonId: "demo-hackathon-2",
    hackathon: "CampusForge Hackathon",
    organization: "CampusForge",
    description:
      "Create solutions that improve campus life, education, and student innovation.",
    category: "Web Development",
    format: "Hybrid",
    venue: "Varanasi, Uttar Pradesh",
    startDate: "2026-11-22T09:00:00",
    endDate: "2026-11-23T17:00:00",
    registeredAt: "2026-10-03T12:00:00",
    teamName: "Pixel Pioneers",
    teamSize: 3,
    registrationStatus: "PENDING",
    paymentStatus: "PENDING",
    registrationFee: 299,
    problemStatement: "Intelligent Learning Companion",
  },
  {
    id: "REG-003",
    hackathonId: "demo-hackathon-3",
    hackathon: "Build for Bharat",
    organization: "Innovation Community",
    description:
      "Design impactful technology for accessibility, communities, and public services.",
    category: "Social Impact",
    format: "Online",
    venue: "Online event",
    startDate: "2026-12-05T10:00:00",
    endDate: "2026-12-06T18:00:00",
    registeredAt: "2026-09-27T15:00:00",
    teamName: "Independent",
    teamSize: 1,
    registrationStatus: "WAITLISTED",
    paymentStatus: "FREE",
    registrationFee: 0,
    problemStatement: "Accessible Digital Services",
  },
];

const STATUS_CONFIG = {
  CONFIRMED: {
    label: "Confirmed",
    classes: "border-emerald-300/20 bg-emerald-300/10 text-emerald-300",
    icon: CheckCircle2,
  },
  PENDING: {
    label: "Pending",
    classes: "border-amber-300/20 bg-amber-300/10 text-amber-300",
    icon: Clock3,
  },
  WAITLISTED: {
    label: "Waitlisted",
    classes: "border-violet-300/20 bg-violet-300/10 text-violet-300",
    icon: Clock3,
  },
  REJECTED: {
    label: "Rejected",
    classes: "border-rose-300/20 bg-rose-300/10 text-rose-300",
    icon: XCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    classes: "border-slate-300/20 bg-slate-300/5 text-slate-400",
    icon: XCircle,
  },
};

const FILTERS = [
  { value: "ALL", label: "All registrations" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PENDING", label: "Pending" },
  { value: "WAITLISTED", label: "Waitlisted" },
  { value: "CANCELLED", label: "Cancelled" },
];

function formatDate(value, options = {}) {
  if (!value) return "Date not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date not available";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
}

function formatDateRange(startDate, endDate) {
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (start === end) return start;

  return `${start} — ${end}`;
}

function getEventTiming(registration) {
  const now = new Date();
  const start = new Date(registration.startDate);
  const end = new Date(registration.endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Date to be announced";
  }

  if (now > end) return "Completed";
  if (now >= start && now <= end) return "Live now";

  return "Upcoming";
}

function RegistrationStatus({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-bold sm:text-xs ${config.classes}`}
    >
      <Icon size={13} />
      {config.label}
    </span>
  );
}

function RegistrationDetails({ registration, onClose }) {
  const timing = getEventTiming(registration);

  const details = [
    {
      label: "Event dates",
      value: formatDateRange(
        registration.startDate,
        registration.endDate,
      ),
      icon: CalendarDays,
    },
    {
      label: "Team",
      value: registration.teamName || "No team assigned",
      icon: UsersRound,
    },
    {
      label: "Venue",
      value: registration.venue || "Not announced",
      icon: MapPin,
    },
    {
      label: "Registration fee",
      value:
        registration.registrationFee === 0
          ? "Free"
          : `₹${registration.registrationFee}`,
      icon: CircleDollarSign,
    },
    {
      label: "Selected challenge",
      value: registration.problemStatement || "Not selected",
      icon: FileText,
    },
    {
      label: "Registered on",
      value: formatDate(registration.registeredAt),
      icon: ClipboardList,
    },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="registration-details-title"
        className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-cyan-300/15 bg-[#101523] shadow-2xl"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
              Registration details
            </p>

            <h2
              id="registration-details-title"
              className="mt-2 text-xl font-bold text-white sm:text-2xl"
            >
              {registration.hackathon}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Registration ID: {registration.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close registration details"
            className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <RegistrationStatus status={registration.registrationStatus} />

            <span
              className={`text-xs font-semibold ${
                timing === "Live now"
                  ? "text-emerald-300"
                  : "text-slate-400"
              }`}
            >
              {timing}
            </span>
          </div>

          <p className="text-sm leading-6 text-slate-400">
            {registration.description}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {details.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="min-w-0 rounded-xl border border-white/[0.07] bg-black/10 p-4"
                >
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Icon size={14} className="shrink-0 text-cyan-300" />
                    {item.label}
                  </div>

                  <p className="mt-2 break-words text-sm font-medium leading-5 text-slate-200">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
            <p className="text-xs text-slate-500">Payment status</p>

            <p className="mt-2 text-sm font-semibold text-slate-200">
              {registration.paymentStatus === "PAID"
                ? "Payment completed"
                : registration.paymentStatus === "FREE"
                  ? "No payment required"
                  : "Payment pending"}
            </p>

            {registration.paymentStatus === "PENDING" && (
              <p className="mt-2 text-xs leading-5 text-amber-300">
                Complete payment when the payment workflow is available.
              </p>
            )}
          </div>

          <div className="flex justify-end border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState(INITIAL_REGISTRATIONS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  const filteredRegistrations = useMemo(() => {
    const term = search.trim().toLowerCase();

    return registrations.filter((registration) => {
      const matchesSearch =
        !term ||
        registration.hackathon.toLowerCase().includes(term) ||
        registration.category.toLowerCase().includes(term) ||
        registration.teamName.toLowerCase().includes(term) ||
        (registration.problemStatement || "").toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "ALL" ||
        registration.registrationStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [registrations, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: registrations.length,
      confirmed: registrations.filter(
        (item) => item.registrationStatus === "CONFIRMED",
      ).length,
      pending: registrations.filter(
        (item) => item.registrationStatus === "PENDING",
      ).length,
      upcoming: registrations.filter((item) => {
        const end = new Date(item.endDate);
        return !Number.isNaN(end.getTime()) && end >= new Date();
      }).length,
    }),
    [registrations],
  );

  function resetFilters() {
    setSearch("");
    setStatusFilter("ALL");
  }

  const hasFilters = search !== "" || statusFilter !== "ALL";

  return (
    <div className="min-h-screen bg-[#080b14] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-[#111a2b] via-[#101523] to-[#10101f] p-6 sm:p-9"
        >
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/3 h-36 w-36 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.17em] text-cyan-300">
                <Ticket size={14} />
                Student workspace
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                My <span className="text-cyan-300">Registrations</span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                Keep track of your registered hackathons, team information,
                event schedules, and registration status.
              </p>
            </div>

            <Link
              to="/student/hackathons"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300"
            >
              Explore Hackathons
              <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="relative mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-xs text-slate-500">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              Registration overview
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={14} />
              Event schedules
            </span>
            <span className="inline-flex items-center gap-2">
              <UsersRound size={14} />
              Team details
            </span>
          </div>
        </motion.div>

        {/* Frontend prototype notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] px-4 py-3.5">
          <Sparkles
            size={18}
            className="mt-0.5 shrink-0 text-amber-300"
          />
          <div>
            <p className="text-sm font-semibold text-amber-100">
              Student portal preview
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              These are sample registrations for frontend development.
              Changes made in this page are local and reset on refresh.
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            {
              label: "Total registrations",
              value: stats.total,
              icon: Ticket,
              color: "text-cyan-300",
              bg: "bg-cyan-300/10",
            },
            {
              label: "Confirmed",
              value: stats.confirmed,
              icon: CheckCircle2,
              color: "text-emerald-300",
              bg: "bg-emerald-300/10",
            },
            {
              label: "Pending approval",
              value: stats.pending,
              icon: Clock3,
              color: "text-amber-300",
              bg: "bg-amber-300/10",
            },
            {
              label: "Upcoming events",
              value: stats.upcoming,
              icon: CalendarDays,
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
                transition={{ delay: index * 0.06 }}
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
                  {String(stat.value).padStart(2, "0")}
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
                placeholder="Search hackathon, team, or challenge..."
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
              <SlidersHorizontal size={16} />
              Filters
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
                <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#101522] p-4">
                  {FILTERS.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setStatusFilter(filter.value)}
                      className={`rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ${
                        statusFilter === filter.value
                          ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                          : "border-white/10 text-slate-400 hover:bg-white/5"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* List heading */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">
              Your registered events
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Showing {filteredRegistrations.length} of {registrations.length}{" "}
              registrations
            </p>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 transition hover:text-cyan-200"
            >
              <RotateCcw size={13} />
              Clear filters
            </button>
          )}
        </div>

        {/* Registration cards */}
        {filteredRegistrations.length > 0 ? (
          <motion.div layout className="grid gap-4 xl:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {filteredRegistrations.map((registration, index) => {
                const timing = getEventTiming(registration);

                return (
                  <motion.article
                    layout
                    key={registration.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: index * 0.04 }}
                    className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101522] transition hover:border-cyan-300/25 hover:bg-[#121a2a]"
                  >
                    <div className="relative overflow-hidden border-b border-white/[0.07] bg-gradient-to-br from-cyan-300/[0.06] via-transparent to-violet-400/[0.05] p-5 sm:p-6">
                      <div className="pointer-events-none absolute -right-8 -top-14 h-36 w-36 rounded-full bg-cyan-300/[0.07] blur-2xl" />

                      <div className="relative flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.08] text-cyan-300">
                            <Ticket size={22} />
                          </div>

                          <div className="min-w-0">
                            <span className="mb-2 inline-flex rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {registration.category}
                            </span>

                            <h3 className="break-words text-lg font-bold leading-6 text-white transition group-hover:text-cyan-200">
                              {registration.hackathon}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              Organized by {registration.organization}
                            </p>
                          </div>
                        </div>

                        <RegistrationStatus
                          status={registration.registrationStatus}
                        />
                      </div>

                      <p className="relative mt-4 line-clamp-2 text-sm leading-6 text-slate-400">
                        {registration.description}
                      </p>
                    </div>

                    <div className="space-y-4 p-5 sm:p-6">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex items-start gap-2.5">
                          <CalendarDays
                            size={16}
                            className="mt-0.5 shrink-0 text-cyan-300"
                          />
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                              Event dates
                            </p>
                            <p className="mt-1 text-xs font-medium leading-5 text-slate-300">
                              {formatDateRange(
                                registration.startDate,
                                registration.endDate,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <MapPin
                            size={16}
                            className="mt-0.5 shrink-0 text-cyan-300"
                          />
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                              Location
                            </p>
                            <p className="mt-1 break-words text-xs font-medium leading-5 text-slate-300">
                              {registration.venue}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <UsersRound
                            size={16}
                            className="mt-0.5 shrink-0 text-violet-300"
                          />
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                              Team
                            </p>
                            <p className="mt-1 text-xs font-medium leading-5 text-slate-300">
                              {registration.teamName} · {registration.teamSize}{" "}
                              {registration.teamSize === 1 ? "member" : "members"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <CircleDollarSign
                            size={16}
                            className="mt-0.5 shrink-0 text-emerald-300"
                          />
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                              Registration fee
                            </p>
                            <p className="mt-1 text-xs font-medium leading-5 text-slate-300">
                              {registration.registrationFee === 0
                                ? "Free"
                                : `₹${registration.registrationFee}`}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/[0.06] bg-black/10 p-3.5">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <FileText size={14} className="text-cyan-300" />
                          Selected problem
                        </div>

                        <p className="mt-2 text-sm font-semibold text-slate-300">
                          {registration.problemStatement || "Not selected"}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                            Registration ID
                          </p>
                          <p className="mt-1 text-xs font-medium text-slate-400">
                            {registration.id}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedRegistration(registration)
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/25 hover:bg-cyan-300/[0.04] hover:text-cyan-200"
                        >
                          View details
                          <ArrowUpRight size={14} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 size={13} />
                          Registered {formatDate(registration.registeredAt)}
                        </span>

                        <span
                          className={
                            timing === "Live now"
                              ? "font-semibold text-emerald-300"
                              : "text-slate-500"
                          }
                        >
                          {timing}
                        </span>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-[#101522]/50 px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-300">
              <Ticket size={24} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-white">
              No registrations found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try another search or filter, or explore hackathons and register
              for your next event.
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

              <Link
                to="/student/hackathons"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                Explore Hackathons
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-white/[0.07] py-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>Skill Incubator · Student workspace</span>
          <span>My registrations · Frontend prototype</span>
        </div>
      </div>

      {/* Registration details */}
      <AnimatePresence>
        {selectedRegistration && (
          <RegistrationDetails
            key={selectedRegistration.id}
            registration={selectedRegistration}
            onClose={() => setSelectedRegistration(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
