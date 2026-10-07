
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Trophy,
  Star,
  ClipboardCheck,
  Clock3,
  ChevronDown,
  X,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  UsersRound,
  Target,
  MessageSquare,
  Save,
  Sparkles,
  Medal,
  Filter,
  Eye,
} from "lucide-react";

const CRITERIA = [
  {
    key: "innovation",
    label: "Innovation",
    description: "Originality and creativity of the solution",
  },
  {
    key: "technical",
    label: "Technical execution",
    description: "Implementation quality and technical complexity",
  },
  {
    key: "impact",
    label: "Impact",
    description: "Usefulness and potential real-world impact",
  },
  {
    key: "presentation",
    label: "Presentation",
    description: "Clarity of explanation and demonstration",
  },
];

const INITIAL_EVALUATIONS = [
  {
    id: "EVAL-001",
    projectName: "AttendAI",
    teamName: "Code Warriors",
    hackathon: "Minerva Innovation Challenge",
    hackathonId: "hackathon-1",
    problem: "AI-Powered Smart Attendance",
    status: "Evaluated",
    scores: {
      innovation: 9,
      technical: 8,
      impact: 9,
      presentation: 8,
    },
    feedback:
      "Strong use case and a clear product direction. Improve edge-case handling and explain how the system performs in different lighting conditions.",
    evaluatedAt: "2026-09-28T15:30:00.000Z",
  },
  {
    id: "EVAL-002",
    projectName: "GreenCampus",
    teamName: "Neural Ninjas",
    hackathon: "Minerva Innovation Challenge",
    hackathonId: "hackathon-1",
    problem: "Sustainable Campus Assistant",
    status: "Pending",
    scores: {
      innovation: 7,
      technical: 7,
      impact: 8,
      presentation: 6,
    },
    feedback: "",
    evaluatedAt: null,
  },
  {
    id: "EVAL-003",
    projectName: "LearnSphere",
    teamName: "Pixel Pioneers",
    hackathon: "CampusForge Hackathon",
    hackathonId: "hackathon-2",
    problem: "Intelligent Learning Companion",
    status: "Evaluated",
    scores: {
      innovation: 8,
      technical: 9,
      impact: 8,
      presentation: 9,
    },
    feedback:
      "Well-structured project with a polished demo. Further demonstrate how recommendations adapt to different learning needs.",
    evaluatedAt: "2026-09-27T12:00:00.000Z",
  },
  {
    id: "EVAL-004",
    projectName: "CivicConnect",
    teamName: "Build Beyond",
    hackathon: "CampusForge Hackathon",
    hackathonId: "hackathon-2",
    problem: "Local Community Problem Solver",
    status: "Pending",
    scores: {
      innovation: 0,
      technical: 0,
      impact: 0,
      presentation: 0,
    },
    feedback: "",
    evaluatedAt: null,
  },
  {
    id: "EVAL-005",
    projectName: "VisionTrack",
    teamName: "Independent",
    hackathon: "Minerva Innovation Challenge",
    hackathonId: "hackathon-1",
    problem: "AI-Powered Smart Attendance",
    status: "Pending",
    scores: {
      innovation: 0,
      technical: 0,
      impact: 0,
      presentation: 0,
    },
    feedback: "",
    evaluatedAt: null,
  },
];

const HACKATHONS = [
  { id: "all", name: "All hackathons" },
  { id: "hackathon-1", name: "Minerva Innovation Challenge" },
  { id: "hackathon-2", name: "CampusForge Hackathon" },
];

const REVIEW_FILTERS = ["All", "Pending", "Evaluated"];

function averageScore(scores) {
  const values = CRITERIA.map((criterion) =>
    Number(scores?.[criterion.key] ?? 0),
  );

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatScore(score) {
  return Number(score).toFixed(1);
}

function formatDate(value) {
  if (!value) return "Not evaluated";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ScorePill({ score }) {
  if (score === null || score === undefined) {
    return (
      <span className="text-sm font-semibold text-slate-600">Pending</span>
    );
  }

  const color =
    score >= 8
      ? "text-emerald-300"
      : score >= 6
        ? "text-cyan-300"
        : "text-amber-300";

  return (
    <span className={`inline-flex items-center gap-1 font-bold ${color}`}>
      <Star size={14} />
      {formatScore(score)}
      <span className="text-xs font-medium text-slate-600">/ 10</span>
    </span>
  );
}

function EvaluationModal({ evaluation, onClose, onSave }) {
  const alreadyEvaluated = evaluation.status === "Evaluated";

  const [scores, setScores] = useState(() => ({
    innovation: evaluation.scores?.innovation ?? 0,
    technical: evaluation.scores?.technical ?? 0,
    impact: evaluation.scores?.impact ?? 0,
    presentation: evaluation.scores?.presentation ?? 0,
  }));

  const [feedback, setFeedback] = useState(evaluation.feedback || "");
  const [errors, setErrors] = useState("");

  const totalScore = averageScore(scores);

  function updateScore(key, value) {
    setScores((current) => ({
      ...current,
      [key]: Number(value),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const hasUnscoredCriteria = CRITERIA.some(
      (criterion) =>
        !Number.isFinite(scores[criterion.key]) ||
        scores[criterion.key] < 1 ||
        scores[criterion.key] > 10,
    );

    if (hasUnscoredCriteria) {
      setErrors("Please score every criterion from 1 to 10.");
      return;
    }

    if (!feedback.trim()) {
      setErrors("Please add feedback for the team.");
      return;
    }

    setErrors("");

    onSave(evaluation.id, {
      scores,
      feedback: feedback.trim(),
      status: "Evaluated",
      evaluatedAt: new Date().toISOString(),
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
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="evaluation-dialog-title"
        className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-cyan-300/15 bg-[#101523] shadow-2xl shadow-black/40"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.17em] text-cyan-300">
              <ClipboardCheck size={15} />
              Judge workspace
            </div>

            <h2
              id="evaluation-dialog-title"
              className="text-xl font-bold text-white sm:text-2xl"
            >
              {alreadyEvaluated ? "Update evaluation" : "Evaluate project"}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              {evaluation.projectName} · {evaluation.teamName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close evaluation"
            className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Target size={14} className="text-cyan-300" />
              Problem statement
            </div>

            <p className="mt-2 text-sm font-medium text-slate-200">
              {evaluation.problem}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {evaluation.hackathon}
            </p>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white">Scoring criteria</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Give each criterion a score from 1 to 10.
                </p>
              </div>

              <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-3 text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Overall average
                </p>
                <p className="mt-1 text-2xl font-black text-cyan-300">
                  {formatScore(totalScore)}
                  <span className="ml-1 text-xs font-medium text-slate-500">
                    / 10
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-5">
              {CRITERIA.map((criterion) => (
                <div
                  key={criterion.key}
                  className="rounded-xl border border-white/[0.07] bg-black/10 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        {criterion.label}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {criterion.description}
                      </p>
                    </div>

                    <span className="shrink-0 text-lg font-black text-cyan-300">
                      {scores[criterion.key]}
                      <span className="text-xs font-medium text-slate-600">
                        /10
                      </span>
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={scores[criterion.key]}
                    onChange={(event) =>
                      updateScore(criterion.key, event.target.value)
                    }
                    aria-label={`${criterion.label} score`}
                    className="mt-4 w-full cursor-pointer accent-cyan-300"
                  />

                  <div className="mt-1 flex justify-between text-[10px] text-slate-600">
                    <span>1 · Needs improvement</span>
                    <span>10 · Outstanding</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="evaluation-feedback"
              className="flex items-center gap-2 text-sm font-semibold text-slate-200"
            >
              <MessageSquare size={15} className="text-cyan-300" />
              Feedback for the team
            </label>

            <textarea
              id="evaluation-feedback"
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              placeholder="Describe the strengths, weaknesses, and improvements..."
              rows={4}
              className={`${inputClass} resize-y`}
            />

            <p className="mt-2 text-xs text-slate-600">
              Constructive feedback helps participants understand their result.
            </p>
          </div>

          {errors && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-400/15 bg-rose-400/[0.05] p-3 text-xs leading-5 text-rose-300">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {errors}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              <Save size={16} />
              Save evaluation
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function Evaluation() {
  const [evaluations, setEvaluations] = useState(INITIAL_EVALUATIONS);
  const [search, setSearch] = useState("");
  const [hackathonFilter, setHackathonFilter] = useState("all");
  const [reviewFilter, setReviewFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [notice, setNotice] = useState("");

  const filteredEvaluations = useMemo(() => {
    const term = search.trim().toLowerCase();

    return evaluations.filter((evaluation) => {
      const matchesSearch =
        !term ||
        evaluation.projectName.toLowerCase().includes(term) ||
        evaluation.teamName.toLowerCase().includes(term) ||
        evaluation.problem.toLowerCase().includes(term);

      const matchesHackathon =
        hackathonFilter === "all" ||
        evaluation.hackathonId === hackathonFilter;

      const matchesStatus =
        reviewFilter === "All" || evaluation.status === reviewFilter;

      return matchesSearch && matchesHackathon && matchesStatus;
    });
  }, [evaluations, search, hackathonFilter, reviewFilter]);

  const stats = useMemo(() => {
    const evaluated = evaluations.filter(
      (item) => item.status === "Evaluated",
    );

    return {
      total: evaluations.length,
      evaluated: evaluated.length,
      pending: evaluations.length - evaluated.length,
      average:
        evaluated.length > 0
          ? evaluated.reduce(
              (sum, item) => sum + averageScore(item.scores),
              0,
            ) / evaluated.length
          : null,
    };
  }, [evaluations]);

  const leaderboard = useMemo(
    () =>
      evaluations
        .filter((item) => item.status === "Evaluated")
        .slice()
        .sort(
          (a, b) =>
            averageScore(b.scores) - averageScore(a.scores),
        ),
    [evaluations],
  );

  const hasFilters =
    search !== "" ||
    hackathonFilter !== "all" ||
    reviewFilter !== "All";

  function clearFilters() {
    setSearch("");
    setHackathonFilter("all");
    setReviewFilter("All");
  }

  function saveEvaluation(id, updates) {
    setEvaluations((current) =>
      current.map((evaluation) =>
        evaluation.id === id
          ? { ...evaluation, ...updates }
          : evaluation,
      ),
    );

    setSelectedEvaluation(null);
    setNotice("Evaluation saved in this demo.");
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
              Project <span className="text-cyan-300">Evaluation</span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Score submissions against consistent judging criteria, provide
              actionable feedback, and compare evaluated projects.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2">
                <ClipboardCheck size={14} />
                Scoring workspace
              </span>
              <span className="inline-flex items-center gap-2">
                <Star size={14} />
                Four judging criteria
              </span>
              <span className="inline-flex items-center gap-2">
                <Trophy size={14} />
                Live demo leaderboard
              </span>
            </div>
          </div>
        </motion.div>

        {/* Demo notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] px-4 py-3.5">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-300" />
          <div>
            <p className="text-sm font-semibold text-amber-100">
              Frontend demo mode
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Scores and feedback are sample data stored in local page state.
              They are not persisted to the database yet.
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            {
              label: "Total projects",
              value: stats.total,
              icon: UsersRound,
              color: "text-cyan-300",
              bg: "bg-cyan-300/10",
            },
            {
              label: "Evaluated",
              value: stats.evaluated,
              icon: CheckCircle2,
              color: "text-emerald-300",
              bg: "bg-emerald-300/10",
            },
            {
              label: "Awaiting evaluation",
              value: stats.pending,
              icon: Clock3,
              color: "text-amber-300",
              bg: "bg-amber-300/10",
            },
            {
              label: "Average score",
              value:
                stats.average === null
                  ? "—"
                  : formatScore(stats.average),
              icon: Star,
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
                  {typeof stat.value === "number"
                    ? String(stat.value).padStart(2, "0")
                    : stat.value}
                </p>

                {stat.label === "Average score" && (
                  <p className="mt-1 text-xs text-slate-600">Out of 10</p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Judging guide */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#101522] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-violet-300/15 bg-violet-300/[0.07] p-3 text-violet-300">
              <Target size={20} />
            </div>

            <div>
              <h2 className="font-bold text-white">Judging criteria</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Every project receives a score across the same four
                dimensions. The overall score is the arithmetic average.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {CRITERIA.map((criterion, index) => (
              <div
                key={criterion.key}
                className="rounded-xl border border-white/[0.07] bg-black/10 p-4"
              >
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-300/15 bg-cyan-300/[0.06] text-xs font-bold text-cyan-300">
                  0{index + 1}
                </div>

                <h3 className="text-sm font-semibold text-slate-200">
                  {criterion.label}
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {criterion.description}
                </p>
              </div>
            ))}
          </div>
        </section>

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
                placeholder="Search project, team, or problem..."
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
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Evaluation status
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {REVIEW_FILTERS.map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setReviewFilter(filter)}
                        className={`rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ${
                          reviewFilter === filter
                            ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                            : "border-white/10 text-slate-400 hover:bg-white/5"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Project list */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">
              Evaluation queue
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredEvaluations.length} of {evaluations.length} projects
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

        {filteredEvaluations.length > 0 ? (
          <motion.div layout className="grid gap-4 xl:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {filteredEvaluations.map((evaluation, index) => {
                const score =
                  evaluation.status === "Evaluated"
                    ? averageScore(evaluation.scores)
                    : null;

                return (
                  <motion.article
                    layout
                    key={evaluation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: index * 0.025 }}
                    className="rounded-2xl border border-white/[0.08] bg-[#101522] p-5 transition hover:border-cyan-300/25 hover:bg-[#121a2a] sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.07] text-cyan-300">
                          <ClipboardCheck size={20} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="break-words text-lg font-bold text-white">
                            {evaluation.projectName}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            {evaluation.id}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                          evaluation.status === "Evaluated"
                            ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-200"
                            : "border-amber-300/25 bg-amber-300/10 text-amber-200"
                        }`}
                      >
                        {evaluation.status}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/[0.06] bg-black/10 p-3.5">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <UsersRound size={14} className="text-cyan-300" />
                          Team
                        </div>

                        <p className="mt-2 truncate text-sm font-semibold text-slate-200">
                          {evaluation.teamName}
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/[0.06] bg-black/10 p-3.5">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock3 size={14} className="text-cyan-300" />
                          Last evaluated
                        </div>

                        <p className="mt-2 text-sm font-semibold text-slate-200">
                          {formatDate(evaluation.evaluatedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/10 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-slate-500">
                            Problem statement
                          </p>

                          <p className="mt-2 text-sm font-medium leading-5 text-slate-300">
                            {evaluation.problem}
                          </p>
                        </div>

                        <Target
                          size={16}
                          className="mt-1 shrink-0 text-violet-300"
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Overall score
                        </p>

                        <div className="mt-2">
                          <ScorePill score={score} />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedEvaluation(evaluation)}
                        className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-300"
                      >
                        <Eye size={15} />
                        {evaluation.status === "Evaluated"
                          ? "Review score"
                          : "Evaluate project"}
                      </button>
                    </div>

                    {evaluation.feedback && (
                      <div className="mt-4 flex items-start gap-2 border-t border-white/[0.07] pt-4">
                        <MessageSquare
                          size={14}
                          className="mt-1 shrink-0 text-slate-500"
                        />
                        <p className="line-clamp-2 text-xs leading-5 text-slate-500">
                          {evaluation.feedback}
                        </p>
                      </div>
                    )}
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-[#101522]/50 px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-300">
              <ClipboardCheck size={24} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-white">
              No projects found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try another search or clear your filters to see more projects in
              the evaluation queue.
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

        {/* Leaderboard */}
        <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101522]">
          <div className="flex items-center gap-3 border-b border-white/[0.08] p-5 sm:p-6">
            <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.07] p-3 text-amber-300">
              <Trophy size={20} />
            </div>

            <div>
              <h2 className="font-bold text-white">Evaluation leaderboard</h2>
              <p className="mt-1 text-xs text-slate-500">
                Ranked by average score among evaluated projects
              </p>
            </div>
          </div>

          {leaderboard.length > 0 ? (
            <div className="divide-y divide-white/[0.06]">
              {leaderboard.map((evaluation, index) => (
                <div
                  key={evaluation.id}
                  className="flex items-center gap-3 px-5 py-4 transition hover:bg-white/[0.02] sm:gap-4 sm:px-6"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-black ${
                      index === 0
                        ? "border-amber-300/25 bg-amber-300/10 text-amber-200"
                        : index === 1
                          ? "border-slate-300/20 bg-slate-300/[0.05] text-slate-300"
                          : "border-white/10 bg-white/[0.03] text-slate-500"
                    }`}
                  >
                    {index === 0 ? (
                      <Medal size={17} />
                    ) : (
                      index + 1
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-200">
                      {evaluation.projectName}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {evaluation.teamName}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-black text-cyan-300">
                      {formatScore(averageScore(evaluation.scores))}
                      <span className="ml-1 text-xs font-medium text-slate-600">
                        / 10
                      </span>
                    </p>
                    <p className="mt-1 text-[10px] text-slate-600">
                      Average score
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <Trophy size={24} className="mx-auto text-slate-600" />
              <p className="mt-3 text-sm font-medium text-slate-300">
                No evaluated projects yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Complete an evaluation to populate the demo leaderboard.
              </p>
            </div>
          )}
        </section>

        <div className="flex flex-col gap-2 border-t border-white/[0.07] py-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>Skill Incubator · Organizer workspace</span>
          <span>Project evaluation · Frontend prototype</span>
        </div>
      </div>

      {/* Evaluation modal */}
      <AnimatePresence>
        {selectedEvaluation && (
          <EvaluationModal
            key={selectedEvaluation.id}
            evaluation={selectedEvaluation}
            onClose={() => setSelectedEvaluation(null)}
            onSave={saveEvaluation}
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
