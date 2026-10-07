
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  FileCode2,
  Layers3,
  Clock3,
  CheckCircle2,
  Eye,
  ExternalLink,
  Code2,
  X,
  Filter,
  ChevronDown,
  CalendarDays,
  Users,
  Target,
  MessageSquare,
  Save,
  RotateCcw,
  AlertCircle,
  Send,
  Sparkles,
} from "lucide-react";

const INITIAL_SUBMISSIONS = [
  {
    id: "SUB-001",
    projectName: "AttendAI",
    teamName: "Code Warriors",
    hackathon: "Minerva Innovation Challenge",
    hackathonId: "hackathon-1",
    problem: "AI-Powered Smart Attendance",
    description:
      "An intelligent attendance platform that uses computer vision to automate student attendance and provide useful class analytics.",
    techStack: ["Python", "FastAPI", "React", "OpenCV"],
    githubUrl: "https://github.com/",
    demoUrl: "https://example.com/",
    status: "Submitted",
    submittedAt: "2026-09-28T09:30:00.000Z",
    feedback: "",
  },
  {
    id: "SUB-002",
    projectName: "GreenCampus",
    teamName: "Neural Ninjas",
    hackathon: "Minerva Innovation Challenge",
    hackathonId: "hackathon-1",
    problem: "Sustainable Campus Assistant",
    description:
      "A campus sustainability dashboard designed to track everyday eco-friendly activities and encourage waste reduction.",
    techStack: ["React", "Node.js", "MongoDB"],
    githubUrl: "https://github.com/",
    demoUrl: "https://example.com/",
    status: "Under Review",
    submittedAt: "2026-09-27T13:00:00.000Z",
    feedback: "",
  },
  {
    id: "SUB-003",
    projectName: "LearnSphere",
    teamName: "Pixel Pioneers",
    hackathon: "CampusForge Hackathon",
    hackathonId: "hackathon-2",
    problem: "Intelligent Learning Companion",
    description:
      "A student-focused learning environment that organizes resources and gives learners a simple way to track their progress.",
    techStack: ["React", "FastAPI", "PostgreSQL"],
    githubUrl: "https://github.com/",
    demoUrl: "https://example.com/",
    status: "Accepted",
    submittedAt: "2026-09-26T11:15:00.000Z",
    feedback: "Good project direction and clear student workflow.",
  },
  {
    id: "SUB-004",
    projectName: "CivicConnect",
    teamName: "Build Beyond",
    hackathon: "CampusForge Hackathon",
    hackathonId: "hackathon-2",
    problem: "Local Community Problem Solver",
    description:
      "A platform where people can submit local issues, track updates and discover solutions to community problems.",
    techStack: ["Next.js", "Python", "PostgreSQL"],
    githubUrl: "https://github.com/",
    demoUrl: "https://example.com/",
    status: "Needs Changes",
    submittedAt: "2026-09-25T16:45:00.000Z",
    feedback: "Please clarify the issue verification flow and provide more implementation details.",
  },
  {
    id: "SUB-005",
    projectName: "VisionTrack",
    teamName: "Independent",
    hackathon: "Minerva Innovation Challenge",
    hackathonId: "hackathon-1",
    problem: "AI-Powered Smart Attendance",
    description:
      "A prototype for tracking attendance events and reviewing attendance records from a single interface.",
    techStack: ["Python", "Streamlit", "OpenCV"],
    githubUrl: "https://github.com/",
    demoUrl: "",
    status: "Submitted",
    submittedAt: "2026-09-24T10:10:00.000Z",
    feedback: "",
  },
];

const HACKATHONS = [
  { id: "all", name: "All hackathons" },
  { id: "hackathon-1", name: "Minerva Innovation Challenge" },
  { id: "hackathon-2", name: "CampusForge Hackathon" },
];

const STATUSES = [
  "All statuses",
  "Submitted",
  "Under Review",
  "Accepted",
  "Needs Changes",
];

const STATUS_STYLES = {
  Submitted: "border-cyan-300/25 bg-cyan-300/10 text-cyan-200",
  "Under Review": "border-amber-300/25 bg-amber-300/10 text-amber-200",
  Accepted: "border-emerald-300/25 bg-emerald-300/10 text-emerald-200",
  "Needs Changes": "border-rose-300/25 bg-rose-300/10 text-rose-200",
};

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold sm:text-xs ${
        STATUS_STYLES[status] ||
        "border-white/10 bg-white/5 text-slate-300"
      }`}
    >
      {status}
    </span>
  );
}

function SubmissionModal({ submission, onClose, onSave }) {
  const [status, setStatus] = useState(submission.status);
  const [feedback, setFeedback] = useState(submission.feedback || "");

  function handleSubmit(event) {
    event.preventDefault();

    if (status === "Needs Changes" && !feedback.trim()) {
      return;
    }

    onSave(submission.id, {
      status,
      feedback: feedback.trim(),
    });

    onClose();
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-[#090d18] px-3.5 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/40";

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
        aria-labelledby="submission-dialog-title"
        className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-cyan-300/15 bg-[#101523] shadow-2xl"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.17em] text-cyan-300">
              Submission review
            </p>

            <h2
              id="submission-dialog-title"
              className="mt-2 text-xl font-bold text-white sm:text-2xl"
            >
              {submission.projectName}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {submission.teamName} · {submission.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close review"
            className="rounded-xl border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Project description
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              {submission.description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Target size={14} className="text-cyan-300" />
                Problem statement
              </div>

              <p className="mt-2 text-sm font-medium text-slate-200">
                {submission.problem}
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CalendarDays size={14} className="text-cyan-300" />
                Submitted on
              </div>

              <p className="mt-2 text-sm font-medium text-slate-200">
                {formatDate(submission.submittedAt)}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tech stack
            </p>

            <div className="flex flex-wrap gap-2">
              {submission.techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href={submission.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-cyan-300/25 hover:bg-white/[0.03] hover:text-cyan-200"
            >
              <Github size={17} />
              Source code
              <ExternalLink size={13} />
            </a>

            {submission.demoUrl ? (
              <a
                href={submission.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-cyan-300/25 hover:bg-white/[0.03] hover:text-cyan-200"
              >
                <ExternalLink size={16} />
                Live demo
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm text-slate-600">
                No demo link provided
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 border-t border-white/10 pt-5"
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={17} className="text-cyan-300" />
              <h3 className="text-sm font-bold text-white">
                Review decision
              </h3>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300">
                Submission status
              </label>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className={inputClass}
              >
                {STATUSES.filter(
                  (item) => item !== "All statuses",
                ).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300">
                Feedback for the team
              </label>

              <textarea
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder="Write constructive feedback or explain any required changes..."
                rows={4}
                className={`${inputClass} resize-y`}
              />

              {status === "Needs Changes" && !feedback.trim() && (
                <p className="mt-2 text-xs text-amber-300">
                  Add feedback describing what the team should improve.
                </p>
              )}
            </div>

            <p className="text-xs leading-5 text-slate-500">
              Demo mode: the review is stored in local page state only.
            </p>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={status === "Needs Changes" && !feedback.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Save size={16} />
                Save review
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Submissions() {
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
  const [search, setSearch] = useState("");
  const [hackathonFilter, setHackathonFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [notice, setNotice] = useState("");

  const filteredSubmissions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return submissions.filter((submission) => {
      const matchesSearch =
        !term ||
        submission.projectName.toLowerCase().includes(term) ||
        submission.teamName.toLowerCase().includes(term) ||
        submission.problem.toLowerCase().includes(term) ||
        submission.techStack.some((tech) =>
          tech.toLowerCase().includes(term),
        );

      const matchesHackathon =
        hackathonFilter === "all" ||
        submission.hackathonId === hackathonFilter;

      const matchesStatus =
        statusFilter === "All statuses" ||
        submission.status === statusFilter;

      return matchesSearch && matchesHackathon && matchesStatus;
    });
  }, [submissions, search, hackathonFilter, statusFilter]);

  const stats = useMemo(
    () => ({
      total: submissions.length,
      submitted: submissions.filter((item) => item.status === "Submitted")
        .length,
      reviewing: submissions.filter(
        (item) => item.status === "Under Review",
      ).length,
      accepted: submissions.filter((item) => item.status === "Accepted")
        .length,
    }),
    [submissions],
  );

  const hasFilters =
    search !== "" ||
    hackathonFilter !== "all" ||
    statusFilter !== "All statuses";

  function clearFilters() {
    setSearch("");
    setHackathonFilter("all");
    setStatusFilter("All statuses");
  }

  function saveReview(id, updates) {
    setSubmissions((current) =>
      current.map((submission) =>
        submission.id === id ? { ...submission, ...updates } : submission,
      ),
    );

    setNotice("Review updated in this demo.");
    window.setTimeout(() => setNotice(""), 3000);
  }

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

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.17em] text-cyan-300">
              <Sparkles size={14} />
              Organizer workspace
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Project <span className="text-cyan-300">Submissions</span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Review projects, inspect source code and demos, and provide
              useful feedback to participating teams.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2">
                <FileCode2 size={14} />
                Project repository
              </span>
              <span className="inline-flex items-center gap-2">
                <Eye size={14} />
                Review workspace
              </span>
              <span className="inline-flex items-center gap-2">
                <MessageSquare size={14} />
                Team feedback
              </span>
            </div>
          </div>
        </motion.div>

        {/* Prototype notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] px-4 py-3.5">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-amber-300"
          />
          <div>
            <p className="text-sm font-semibold text-amber-100">
              Frontend demo mode
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              The projects and repository links are sample data. Review
              decisions are kept in local page state until backend integration.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            {
              label: "Total submissions",
              value: stats.total,
              icon: FileCode2,
              color: "text-cyan-300",
              bg: "bg-cyan-300/10",
            },
            {
              label: "Awaiting review",
              value: stats.submitted,
              icon: Clock3,
              color: "text-amber-300",
              bg: "bg-amber-300/10",
            },
            {
              label: "Under review",
              value: stats.reviewing,
              icon: Layers3,
              color: "text-sky-300",
              bg: "bg-sky-300/10",
            },
            {
              label: "Accepted",
              value: stats.accepted,
              icon: CheckCircle2,
              color: "text-emerald-300",
              bg: "bg-emerald-300/10",
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
                  {stat.value.toString().padStart(2, "0")}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Search & filters */}
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
                placeholder="Search project, team, problem, or tech..."
                className="w-full rounded-xl border border-white/10 bg-[#101522] py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/40"
              />
            </div>

            <div className="relative lg:w-72">
              <select
                value={hackathonFilter}
                onChange={(event) =>
                  setHackathonFilter(event.target.value)
                }
                aria-label="Filter by hackathon"
                className="w-full appearance-none rounded-xl border border-white/10 bg-[#101522] px-4 py-3.5 pr-10 text-sm text-slate-200 outline-none focus:border-cyan-300/40"
              >
                {HACKATHONS.map((hackathon) => (
                  <option key={hackathon.id} value={hackathon.id}>
                    {hackathon.name}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
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
                <div className="rounded-2xl border border-white/10 bg-[#101522] p-4">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Review status
                  </label>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {STATUSES.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        className={`rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ${
                          statusFilter === status
                            ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                            : "border-white/10 text-slate-400 hover:bg-white/5"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* List heading */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">
              Submission library
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredSubmissions.length} of {submissions.length} projects
            </p>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
            >
              <RotateCcw size={13} />
              Clear filters
            </button>
          )}
        </div>

        {/* Submission cards */}
        {filteredSubmissions.length > 0 ? (
          <motion.div layout className="grid gap-4 xl:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {filteredSubmissions.map((submission, index) => (
                <motion.article
                  key={submission.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: index * 0.025 }}
                  className="rounded-2xl border border-white/[0.08] bg-[#101522] p-5 transition hover:border-cyan-300/25 hover:bg-[#121a2a] sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.07] text-cyan-300">
                        <FileCode2 size={21} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="break-words text-lg font-bold text-white">
                          {submission.projectName}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {submission.id}
                        </p>
                      </div>
                    </div>

                    <StatusBadge status={submission.status} />
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="min-w-0 rounded-xl border border-white/[0.06] bg-black/10 p-3.5">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Users size={14} className="text-cyan-300" />
                        Team
                      </div>
                      <p className="mt-2 truncate text-sm font-semibold text-slate-200">
                        {submission.teamName}
                      </p>
                    </div>

                    <div className="min-w-0 rounded-xl border border-white/[0.06] bg-black/10 p-3.5">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <CalendarDays
                          size={14}
                          className="text-cyan-300"
                        />
                        Submitted
                      </div>
                      <p className="mt-2 text-sm font-semibold text-slate-200">
                        {formatDate(submission.submittedAt)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">
                    {submission.description}
                  </p>

                  <div className="mt-4">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Technology stack
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {submission.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 py-1.5 text-[11px] font-medium text-slate-400"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/10 p-3.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Target size={14} className="text-violet-300" />
                      Problem statement
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-300">
                      {submission.problem}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
                    <div className="flex items-center gap-3">
                      <a
                        href={submission.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open source code for ${submission.projectName}`}
                        className="rounded-lg border border-white/10 p-2.5 text-slate-400 transition hover:border-cyan-300/25 hover:text-cyan-200"
                      >
                        <Code2 size={16} />
                      </a>

                      {submission.demoUrl && (
                        <a
                          href={submission.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open demo for ${submission.projectName}`}
                          className="rounded-lg border border-white/10 p-2.5 text-slate-400 transition hover:border-cyan-300/25 hover:text-cyan-200"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedSubmission(submission)}
                      className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-300"
                    >
                      <Eye size={14} />
                      Review submission
                    </button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-[#101522]/50 px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-300">
              <FileCode2 size={24} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-white">
              No submissions found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try another search term or clear your filters to see other
              project submissions.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5"
            >
              <RotateCcw size={15} />
              Reset filters
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-white/[0.07] py-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>Skill Incubator · Organizer workspace</span>
          <span>Project submissions · Frontend prototype</span>
        </div>
      </div>

      {/* Review modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <SubmissionModal
            key={selectedSubmission.id}
            submission={selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
            onSave={saveReview}
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
            className="fixed bottom-5 right-5 z-[60] flex items-center gap-3 rounded-2xl border border-emerald-300/20 bg-[#101a20] px-4 py-3.5 shadow-2xl"
          >
            <CheckCircle2
              size={18}
              className="shrink-0 text-emerald-300"
            />
            <span className="text-sm text-slate-200">{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
              className="rounded-md p-1 text-slate-500 hover:text-white"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
