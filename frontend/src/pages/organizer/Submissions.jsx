import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/react";
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
  Sparkles,
} from "lucide-react";


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";


/* ============================================================
   STATUS HELPERS
============================================================ */

const STATUS_LABELS = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  ACCEPTED: "Accepted",
  NEEDS_CHANGES: "Needs Changes",
};

const STATUS_VALUES = [
  "All statuses",
  "Submitted",
  "Under Review",
  "Accepted",
  "Needs Changes",
];

const STATUS_STYLES = {
  Submitted:
    "border-cyan-300/25 bg-cyan-300/10 text-cyan-200",

  "Under Review":
    "border-amber-300/25 bg-amber-300/10 text-amber-200",

  Accepted:
    "border-emerald-300/25 bg-emerald-300/10 text-emerald-200",

  "Needs Changes":
    "border-rose-300/25 bg-rose-300/10 text-rose-200",
};


function backendStatusToLabel(status) {
  return STATUS_LABELS[status] || status || "Submitted";
}


function labelToBackendStatus(status) {
  const map = {
    Submitted: "SUBMITTED",
    "Under Review": "UNDER_REVIEW",
    Accepted: "ACCEPTED",
    "Needs Changes": "NEEDS_CHANGES",
  };

  return map[status] || "SUBMITTED";
}


/* ============================================================
   DATE
============================================================ */

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}


/* ============================================================
   STATUS BADGE
============================================================ */

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


/* ============================================================
   SUBMISSION MODAL
============================================================ */

function SubmissionModal({
  submission,
  onClose,
  onSave,
  saving,
}) {
  const [status, setStatus] = useState(submission.status);
  const [feedback, setFeedback] = useState(
    submission.feedback || "",
  );

  function handleSubmit(event) {
    event.preventDefault();

    if (status === "Needs Changes" && !feedback.trim()) {
      return;
    }

    onSave(submission.id, {
      status,
      feedback: feedback.trim(),
    });
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
        if (event.target === event.currentTarget) {
          onClose();
        }
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
        {/* Header */}
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
          {/* Description */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Project description
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              {submission.description}
            </p>
          </div>

          {/* Problem + Date */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Target
                  size={14}
                  className="text-cyan-300"
                />
                Problem statement
              </div>

              <p className="mt-2 text-sm font-medium text-slate-200">
                {submission.problem || "No problem statement selected"}
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CalendarDays
                  size={14}
                  className="text-cyan-300"
                />
                Submitted on
              </div>

              <p className="mt-2 text-sm font-medium text-slate-200">
                {formatDate(submission.submittedAt)}
              </p>
            </div>
          </div>

          {/* Tech stack */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tech stack
            </p>

            <div className="flex flex-wrap gap-2">
              {(submission.techStack || []).map((tech) => (
                <span
                  key={tech}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="grid gap-3 sm:grid-cols-2">
            {submission.githubUrl ? (
              <a
                href={submission.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-cyan-300/25 hover:bg-white/[0.03] hover:text-cyan-200"
              >
                <Code2 size={17} />
                Source code
                <ExternalLink size={13} />
              </a>
            ) : (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm text-slate-600">
                No source link
              </div>
            )}

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

          {/* Review form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 border-t border-white/10 pt-5"
          >
            <div className="flex items-center gap-2">
              <MessageSquare
                size={17}
                className="text-cyan-300"
              />

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
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                className={inputClass}
              >
                {STATUS_VALUES.filter(
                  (item) => item !== "All statuses",
                ).map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
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
                onChange={(event) =>
                  setFeedback(event.target.value)
                }
                placeholder="Write constructive feedback or explain any required changes..."
                rows={4}
                className={`${inputClass} resize-y`}
              />

              {status === "Needs Changes" &&
                !feedback.trim() && (
                  <p className="mt-2 text-xs text-amber-300">
                    Add feedback describing what the team
                    should improve.
                  </p>
                )}
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  saving ||
                  (status === "Needs Changes" &&
                    !feedback.trim())
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Save size={16} />

                {saving ? "Saving..." : "Save review"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}


/* ============================================================
   MAIN PAGE
============================================================ */

export default function Submissions() {
  const { getToken } = useAuth();

  const [submissions, setSubmissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [hackathonFilter, setHackathonFilter] =
    useState("all");
  const [statusFilter, setStatusFilter] =
    useState("All statuses");

  const [showFilters, setShowFilters] = useState(false);

  const [selectedSubmission, setSelectedSubmission] =
    useState(null);

  const [notice, setNotice] = useState("");
  const [savingReview, setSavingReview] =
    useState(false);


  /* ==========================================================
     FETCH SUBMISSIONS
  ========================================================== */

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = await getToken();

      if (!token) {
        throw new Error(
          "Your session could not be verified.",
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/submissions/organizer/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        let message = `Unable to load submissions (${response.status}).`;

        try {
          const body = await response.json();

          if (body?.detail) {
            message = body.detail;
          }
        } catch {
          // Ignore JSON parsing failure.
        }

        throw new Error(message);
      }

      const data = await response.json();

      const normalized = Array.isArray(data)
        ? data.map((item) => ({
            id: item.id,

            projectName:
              item.project_name || "Untitled Project",

            teamName:
              item.team_name || "Unknown Team",

            hackathon:
              item.hackathon_name || "Unknown Hackathon",

            hackathonId:
              item.hackathon_id,

            problem:
              item.problem_statement_title ||
              "No problem statement selected",

            description:
              item.description || "",

            techStack:
              Array.isArray(item.tech_stack)
                ? item.tech_stack
                : [],

            githubUrl:
              item.github_url || "",

            demoUrl:
              item.demo_url || "",

            status:
              backendStatusToLabel(item.status),

            submittedAt:
              item.submitted_at,

            feedback:
              item.feedback || "",
          }))
        : [];

      setSubmissions(normalized);
    } catch (err) {
      console.error(
        "Failed to load submissions:",
        err,
      );

      setError(
        err.message ||
          "Unable to load submissions.",
      );
    } finally {
      setLoading(false);
    }
  }, [getToken]);


  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);


  /* ==========================================================
     DYNAMIC HACKATHON FILTERS
  ========================================================== */

  const hackathons = useMemo(() => {
    const unique = new Map();

    submissions.forEach((submission) => {
      if (
        submission.hackathonId &&
        !unique.has(submission.hackathonId)
      ) {
        unique.set(
          submission.hackathonId,
          submission.hackathon ||
            "Unknown Hackathon",
        );
      }
    });

    return [
      {
        id: "all",
        name: "All hackathons",
      },
      ...Array.from(unique.entries()).map(
        ([id, name]) => ({
          id,
          name,
        }),
      ),
    ];
  }, [submissions]);


  /* ==========================================================
     FILTERING
  ========================================================== */

  const filteredSubmissions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return submissions.filter((submission) => {
      const matchesSearch =
        !term ||
        submission.projectName
          .toLowerCase()
          .includes(term) ||
        submission.teamName
          .toLowerCase()
          .includes(term) ||
        submission.problem
          .toLowerCase()
          .includes(term) ||
        submission.techStack.some((tech) =>
          tech.toLowerCase().includes(term),
        );

      const matchesHackathon =
        hackathonFilter === "all" ||
        submission.hackathonId ===
          hackathonFilter;

      const matchesStatus =
        statusFilter === "All statuses" ||
        submission.status === statusFilter;

      return (
        matchesSearch &&
        matchesHackathon &&
        matchesStatus
      );
    });
  }, [
    submissions,
    search,
    hackathonFilter,
    statusFilter,
  ]);


  /* ==========================================================
     STATS
  ========================================================== */

  const stats = useMemo(
    () => ({
      total: submissions.length,

      submitted: submissions.filter(
        (item) =>
          item.status === "Submitted",
      ).length,

      reviewing: submissions.filter(
        (item) =>
          item.status === "Under Review",
      ).length,

      accepted: submissions.filter(
        (item) =>
          item.status === "Accepted",
      ).length,
    }),
    [submissions],
  );


  /* ==========================================================
     FILTER HELPERS
  ========================================================== */

  const hasFilters =
    search !== "" ||
    hackathonFilter !== "all" ||
    statusFilter !== "All statuses";


  function clearFilters() {
    setSearch("");
    setHackathonFilter("all");
    setStatusFilter("All statuses");
  }


  /* ==========================================================
     SAVE REVIEW
  ========================================================== */

  async function saveReview(id, updates) {
    setSavingReview(true);
    setError("");

    try {
      const token = await getToken();

      if (!token) {
        throw new Error(
          "Your session could not be verified.",
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/submissions/${id}/review`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            status: labelToBackendStatus(
              updates.status,
            ),
            feedback:
              updates.feedback || null,
          }),
        },
      );

      if (!response.ok) {
        let message = `Unable to save review (${response.status}).`;

        try {
          const body = await response.json();

          if (body?.detail) {
            message = body.detail;
          }
        } catch {
          // Ignore JSON parsing failure.
        }

        throw new Error(message);
      }

      const updated = await response.json();

      const normalized = {
        id: updated.id,

        projectName:
          updated.project_name ||
          "Untitled Project",

        teamName:
          updated.team_name ||
          "Unknown Team",

        hackathon:
          updated.hackathon_name ||
          "Unknown Hackathon",

        hackathonId:
          updated.hackathon_id,

        problem:
          updated.problem_statement_title ||
          "No problem statement selected",

        description:
          updated.description || "",

        techStack:
          Array.isArray(updated.tech_stack)
            ? updated.tech_stack
            : [],

        githubUrl:
          updated.github_url || "",

        demoUrl:
          updated.demo_url || "",

        status:
          backendStatusToLabel(
            updated.status,
          ),

        submittedAt:
          updated.submitted_at,

        feedback:
          updated.feedback || "",
      };

      setSubmissions((current) =>
        current.map((submission) =>
          submission.id === id
            ? {
                ...submission,
                ...normalized,
              }
            : submission,
        ),
      );

      setSelectedSubmission(null);

      setNotice(
        "Review updated successfully.",
      );

      window.setTimeout(
        () => setNotice(""),
        3000,
      );
    } catch (err) {
      console.error(
        "Failed to save review:",
        err,
      );

      setError(
        err.message ||
          "Unable to save review.",
      );
    } finally {
      setSavingReview(false);
    }
  }


  /* ==========================================================
     RENDER
  ========================================================== */

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
              Project{" "}
              <span className="text-cyan-300">
                Submissions
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Review projects, inspect source code
              and demos, and provide useful feedback
              to participating teams.
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


        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-300/20 bg-rose-300/[0.05] px-4 py-3.5">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-rose-300"
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-rose-100">
                Something went wrong
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={loadSubmissions}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5"
            >
              Retry
            </button>
          </div>
        )}


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
                transition={{
                  delay: index * 0.06,
                }}
                className="rounded-2xl border border-white/[0.08] bg-[#101522] p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium leading-5 text-slate-400 sm:text-sm">
                    {stat.label}
                  </p>

                  <div
                    className={`rounded-xl p-2 ${stat.bg} ${stat.color}`}
                  >
                    <Icon size={17} />
                  </div>
                </div>

                <p className="mt-4 text-3xl font-black tracking-tight text-white">
                  {stat.value
                    .toString()
                    .padStart(2, "0")}
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
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search project, team, problem, or tech..."
                className="w-full rounded-xl border border-white/10 bg-[#101522] py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/40"
              />
            </div>

            <div className="relative lg:w-72">
              <select
                value={hackathonFilter}
                onChange={(event) =>
                  setHackathonFilter(
                    event.target.value,
                  )
                }
                aria-label="Filter by hackathon"
                className="w-full appearance-none rounded-xl border border-white/10 bg-[#101522] px-4 py-3.5 pr-10 text-sm text-slate-200 outline-none focus:border-cyan-300/40"
              >
                {hackathons.map(
                  (hackathon) => (
                    <option
                      key={hackathon.id}
                      value={hackathon.id}
                    >
                      {hackathon.name}
                    </option>
                  ),
                )}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setShowFilters(
                  (current) => !current,
                )
              }
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
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl border border-white/10 bg-[#101522] p-4">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Review status
                  </label>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {STATUS_VALUES.map(
                      (status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() =>
                            setStatusFilter(
                              status,
                            )
                          }
                          className={`rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ${
                            statusFilter ===
                            status
                              ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                              : "border-white/10 text-slate-400 hover:bg-white/5"
                          }`}
                        >
                          {status}
                        </button>
                      ),
                    )}
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
              {filteredSubmissions.length} of{" "}
              {submissions.length} projects
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


        {/* Loading */}
        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-[#101522] px-5 py-16 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-300" />

            <p className="mt-5 text-sm font-semibold text-slate-300">
              Loading submissions...
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Fetching projects from the backend.
            </p>
          </div>
        ) : filteredSubmissions.length > 0 ? (
          <motion.div
            layout
            className="grid gap-4 xl:grid-cols-2"
          >
            <AnimatePresence mode="popLayout">
              {filteredSubmissions.map(
                (submission, index) => (
                  <motion.article
                    key={submission.id}
                    layout
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.97,
                    }}
                    transition={{
                      delay: index * 0.025,
                    }}
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

                      <StatusBadge
                        status={submission.status}
                      />
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="min-w-0 rounded-xl border border-white/[0.06] bg-black/10 p-3.5">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Users
                            size={14}
                            className="text-cyan-300"
                          />
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
                          {formatDate(
                            submission.submittedAt,
                          )}
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
                        {submission.techStack.map(
                          (tech) => (
                            <span
                              key={tech}
                              className="rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 py-1.5 text-[11px] font-medium text-slate-400"
                            >
                              {tech}
                            </span>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/10 p-3.5">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Target
                          size={14}
                          className="text-violet-300"
                        />
                        Problem statement
                      </div>

                      <p className="mt-2 text-sm font-medium text-slate-300">
                        {submission.problem}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
                      <div className="flex items-center gap-3">
                        {submission.githubUrl && (
                          <a
                            href={
                              submission.githubUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open source code for ${submission.projectName}`}
                            className="rounded-lg border border-white/10 p-2.5 text-slate-400 transition hover:border-cyan-300/25 hover:text-cyan-200"
                          >
                            <Code2 size={16} />
                          </a>
                        )}

                        {submission.demoUrl && (
                          <a
                            href={
                              submission.demoUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open demo for ${submission.projectName}`}
                            className="rounded-lg border border-white/10 p-2.5 text-slate-400 transition hover:border-cyan-300/25 hover:text-cyan-200"
                          >
                            <ExternalLink
                              size={16}
                            />
                          </a>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedSubmission(
                            submission,
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-300"
                      >
                        <Eye size={14} />
                        Review submission
                      </button>
                    </div>
                  </motion.article>
                ),
              )}
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
              {submissions.length === 0
                ? "No teams have submitted projects to your hackathons yet."
                : "Try another search term or clear your filters to see other project submissions."}
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5"
              >
                <RotateCcw size={15} />
                Reset filters
              </button>
            )}
          </div>
        )}


        {/* Footer */}
        <div className="flex flex-col gap-2 border-t border-white/[0.07] py-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Skill Incubator · Organizer workspace
          </span>

          <span>
            Project submissions · Backend connected
          </span>
        </div>
      </div>


      {/* Review modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <SubmissionModal
            key={selectedSubmission.id}
            submission={selectedSubmission}
            onClose={() =>
              !savingReview &&
              setSelectedSubmission(null)
            }
            onSave={saveReview}
            saving={savingReview}
          />
        )}
      </AnimatePresence>


      {/* Toast */}
      <AnimatePresence>
        {notice && (
          <motion.div
            role="status"
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 8,
            }}
            className="fixed bottom-5 right-5 z-[60] flex items-center gap-3 rounded-2xl border border-emerald-300/20 bg-[#101a20] px-4 py-3.5 shadow-2xl"
          >
            <CheckCircle2
              size={18}
              className="shrink-0 text-emerald-300"
            />

            <span className="text-sm text-slate-200">
              {notice}
            </span>

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