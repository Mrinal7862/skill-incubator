
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Trophy,
  Medal,
  Award,
  Users,
  Target,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Download,
  X,
  ChevronDown,
  RotateCcw,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Filter,
  Globe,
  EyeOff,
} from "lucide-react";

const HACKATHONS = [
  { id: "hackathon-1", name: "Minerva Innovation Challenge" },
  { id: "hackathon-2", name: "CampusForge Hackathon" },
];

const INITIAL_RESULTS = [
  {
    id: "RES-001",
    hackathonId: "hackathon-1",
    hackathon: "Minerva Innovation Challenge",
    project: "AttendAI",
    team: "Code Warriors",
    problem: "AI-Powered Smart Attendance",
    members: ["Aarav Sharma", "Rahul Verma"],
    score: 8.5,
    innovation: 9,
    technical: 8,
    impact: 9,
    presentation: 8,
    rank: 1,
    prize: "Winner",
    feedback: "Strong use case and a clear product direction.",
    published: true,
    evaluatedAt: "2026-09-28T15:30:00.000Z",
  },
  {
    id: "RES-002",
    hackathonId: "hackathon-1",
    hackathon: "Minerva Innovation Challenge",
    project: "GreenCampus",
    team: "Neural Ninjas",
    problem: "Sustainable Campus Assistant",
    members: ["Priya Singh", "Karan Gupta"],
    score: 7.0,
    innovation: 7,
    technical: 7,
    impact: 8,
    presentation: 6,
    rank: 2,
    prize: "Runner-up",
    feedback: "Promising concept. Improve the demonstration and implementation details.",
    published: true,
    evaluatedAt: "2026-09-28T15:45:00.000Z",
  },
  {
    id: "RES-003",
    hackathonId: "hackathon-1",
    hackathon: "Minerva Innovation Challenge",
    project: "VisionTrack",
    team: "Vision Builders",
    problem: "AI-Powered Smart Attendance",
    members: ["Sneha Patel", "Rohan Singh"],
    score: 6.8,
    innovation: 7,
    technical: 7,
    impact: 6,
    presentation: 7,
    rank: 3,
    prize: "Second Runner-up",
    feedback: "Good prototype. Validate the approach with more test cases.",
    published: true,
    evaluatedAt: "2026-09-28T16:00:00.000Z",
  },
  {
    id: "RES-004",
    hackathonId: "hackathon-1",
    hackathon: "Minerva Innovation Challenge",
    project: "CampusPulse",
    team: "The Innovators",
    problem: "Sustainable Campus Assistant",
    members: ["Ananya Singh", "Vikas Mishra"],
    score: 6.2,
    innovation: 6,
    technical: 6,
    impact: 7,
    presentation: 6,
    rank: 4,
    prize: "Participant",
    feedback: "A useful idea with opportunities to improve usability.",
    published: false,
    evaluatedAt: "2026-09-28T16:15:00.000Z",
  },
  {
    id: "RES-005",
    hackathonId: "hackathon-2",
    hackathon: "CampusForge Hackathon",
    project: "LearnSphere",
    team: "Pixel Pioneers",
    problem: "Intelligent Learning Companion",
    members: ["Ananya Gupta", "Rishabh Verma"],
    score: 9.0,
    innovation: 8,
    technical: 9,
    impact: 9,
    presentation: 10,
    rank: 1,
    prize: "Winner",
    feedback: "Excellent presentation and a well-structured implementation.",
    published: true,
    evaluatedAt: "2026-09-29T14:00:00.000Z",
  },
  {
    id: "RES-006",
    hackathonId: "hackathon-2",
    hackathon: "CampusForge Hackathon",
    project: "CivicConnect",
    team: "Build Beyond",
    problem: "Local Community Problem Solver",
    members: ["Aditya Mishra", "Meera Patel"],
    score: 8.0,
    innovation: 8,
    technical: 8,
    impact: 9,
    presentation: 7,
    rank: 2,
    prize: "Runner-up",
    feedback: "Strong community focus. Further clarify issue verification.",
    published: true,
    evaluatedAt: "2026-09-29T14:30:00.000Z",
  },
  {
    id: "RES-007",
    hackathonId: "hackathon-2",
    hackathon: "CampusForge Hackathon",
    project: "SkillBridge",
    team: "Future Forge",
    problem: "Intelligent Learning Companion",
    members: ["Dev Sharma", "Isha Singh"],
    score: 7.5,
    innovation: 8,
    technical: 7,
    impact: 8,
    presentation: 7,
    rank: 3,
    prize: "Second Runner-up",
    feedback: "A solid concept. Demonstrate the key features more clearly.",
    published: false,
    evaluatedAt: "2026-09-29T15:00:00.000Z",
  },
];

const MEDALS = [
  {
    label: "1ST PLACE",
    color: "border-amber-300/25 bg-amber-300/[0.07]",
    text: "text-amber-200",
    icon: Trophy,
  },
  {
    label: "2ND PLACE",
    color: "border-slate-300/20 bg-slate-300/[0.05]",
    text: "text-slate-200",
    icon: Medal,
  },
  {
    label: "3RD PLACE",
    color: "border-orange-300/20 bg-orange-300/[0.05]",
    text: "text-orange-200",
    icon: Award,
  },
];

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

function exportResults(results) {
  const columns = [
    ["Hackathon", "hackathon"],
    ["Rank", "rank"],
    ["Project", "project"],
    ["Team", "team"],
    ["Problem Statement", "problem"],
    ["Overall Score", "score"],
    ["Innovation", "innovation"],
    ["Technical", "technical"],
    ["Impact", "impact"],
    ["Presentation", "presentation"],
    ["Prize", "prize"],
    ["Published", "published"],
    ["Evaluated On", "evaluatedAt"],
  ];

  const escapeCSV = (value) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const csv = [
    columns.map(([heading]) => escapeCSV(heading)).join(","),
    ...results.map((result) =>
      columns
        .map(([, key]) => {
          let value = result[key];

          if (key === "published") value = value ? "Yes" : "No";
          if (key === "evaluatedAt") value = formatDate(value);

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
  link.download = "skill-incubator-results.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function StatusBadge({ published }) {
  return published ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-bold text-emerald-200">
      <Globe size={12} />
      Published
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[10px] font-bold text-amber-200">
      <Clock3 size={12} />
      Draft
    </span>
  );
}

function ResultDetailsModal({ result, onClose, onTogglePublish }) {
  const criteria = [
    ["Innovation", result.innovation],
    ["Technical execution", result.technical],
    ["Impact", result.impact],
    ["Presentation", result.presentation],
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
        aria-labelledby="result-details-title"
        className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-cyan-300/15 bg-[#101523] shadow-2xl"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.17em] text-cyan-300">
              Result details
            </p>

            <h2
              id="result-details-title"
              className="mt-2 text-xl font-bold text-white sm:text-2xl"
            >
              {result.project}
            </h2>

            <p className="mt-1 text-sm text-slate-400">{result.team}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close result details"
            className="rounded-xl border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Final placement
              </p>

              <p className="mt-2 text-2xl font-black text-white">
                #{result.rank}{" "}
                <span className="text-base font-semibold text-cyan-300">
                  {result.prize}
                </span>
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-500">Overall score</p>
              <p className="mt-1 text-3xl font-black text-cyan-300">
                {Number(result.score).toFixed(1)}
                <span className="ml-1 text-sm text-slate-500">/ 10</span>
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Hackathon
            </p>
            <p className="mt-2 text-sm font-medium text-slate-200">
              {result.hackathon}
            </p>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Problem statement
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {result.problem}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white">Score breakdown</h3>

            <div className="mt-4 space-y-4">
              {criteria.map(([label, score]) => (
                <div key={label}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-300">{label}</span>
                    <span className="text-sm font-bold text-cyan-300">
                      {score}/10
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400"
                      style={{ width: `${(score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white">Team members</h3>

            <div className="mt-3 flex flex-wrap gap-2">
              {result.members.map((member) => (
                <span
                  key={member}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300"
                >
                  {member}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Judge feedback
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {result.feedback || "No feedback has been added."}
            </p>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <StatusBadge published={result.published} />

            <button
              type="button"
              onClick={() => onTogglePublish(result.id)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              {result.published ? (
                <>
                  <EyeOff size={16} />
                  Unpublish result
                </>
              ) : (
                <>
                  <Globe size={16} />
                  Publish result
                </>
              )}
            </button>
          </div>

          <p className="text-xs leading-5 text-slate-600">
            Demo mode: publication state changes locally and does not change a
            public website or database.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Results() {
  const [results, setResults] = useState(INITIAL_RESULTS);
  const [hackathonFilter, setHackathonFilter] = useState("hackathon-1");
  const [search, setSearch] = useState("");
  const [publicationFilter, setPublicationFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [notice, setNotice] = useState("");

  const rankedResults = useMemo(() => {
    return results
      .filter((result) => result.hackathonId === hackathonFilter)
      .slice()
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.project.localeCompare(b.project),
      )
      .map((result, index) => ({
        ...result,
        rank: index + 1,
        prize:
          index === 0
            ? "Winner"
            : index === 1
              ? "Runner-up"
              : index === 2
                ? "Second Runner-up"
                : "Participant",
      }));
  }, [results, hackathonFilter]);

  const filteredResults = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rankedResults.filter((result) => {
      const matchesSearch =
        !term ||
        result.project.toLowerCase().includes(term) ||
        result.team.toLowerCase().includes(term) ||
        result.problem.toLowerCase().includes(term);

      const matchesPublication =
        publicationFilter === "All" ||
        (publicationFilter === "Published" && result.published) ||
        (publicationFilter === "Draft" && !result.published);

      return matchesSearch && matchesPublication;
    });
  }, [rankedResults, search, publicationFilter]);

  const stats = useMemo(
    () => ({
      total: rankedResults.length,
      published: rankedResults.filter((result) => result.published).length,
      drafts: rankedResults.filter((result) => !result.published).length,
      average:
        rankedResults.length > 0
          ? rankedResults.reduce((sum, result) => sum + result.score, 0) /
            rankedResults.length
          : 0,
    }),
    [rankedResults],
  );

  const topThree = rankedResults.slice(0, 3);

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function togglePublish(resultId) {
    setResults((current) =>
      current.map((result) =>
        result.id === resultId
          ? { ...result, published: !result.published }
          : result,
      ),
    );

    setSelectedResult((current) =>
      current?.id === resultId
        ? { ...current, published: !current.published }
        : current,
    );

    const result = results.find((item) => item.id === resultId);

    showNotice(
      result?.published
        ? "Result unpublished in this demo."
        : "Result published in this demo.",
    );
  }

  function toggleAllPublished() {
    const allPublished =
      rankedResults.length > 0 &&
      rankedResults.every((result) => result.published);

    setResults((current) =>
      current.map((result) =>
        result.hackathonId === hackathonFilter
          ? { ...result, published: !allPublished }
          : result,
      ),
    );

    if (
      selectedResult &&
      selectedResult.hackathonId === hackathonFilter
    ) {
      setSelectedResult((current) => ({
        ...current,
        published: !allPublished,
      }));
    }

    showNotice(
      allPublished
        ? "All results unpublished in this demo."
        : "All results published in this demo.",
    );
  }

  function resetFilters() {
    setSearch("");
    setPublicationFilter("All");
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
          <div className="pointer-events-none absolute bottom-0 right-1/3 h-36 w-36 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.17em] text-cyan-300">
              <Sparkles size={14} />
              Organizer workspace
            </div>

            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Hackathon <span className="text-cyan-300">Results</span>
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                  Celebrate winning teams, review final standings, and manage
                  result publication for each hackathon.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => exportResults(filteredResults)}
                  disabled={filteredResults.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.07] disabled:opacity-40"
                >
                  <Download size={16} />
                  Export CSV
                </button>

                <button
                  type="button"
                  onClick={toggleAllPublished}
                  disabled={rankedResults.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-40"
                >
                  {rankedResults.length > 0 &&
                  rankedResults.every((result) => result.published) ? (
                    <>
                      <EyeOff size={16} />
                      Unpublish all
                    </>
                  ) : (
                    <>
                      <Globe size={16} />
                      Publish all
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2">
                <Trophy size={14} />
                Final rankings
              </span>
              <span className="inline-flex items-center gap-2">
                <Medal size={14} />
                Winners podium
              </span>
              <span className="inline-flex items-center gap-2">
                <Globe size={14} />
                Publication controls
              </span>
            </div>
          </div>
        </motion.div>

        {/* Prototype warning */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] px-4 py-3.5">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-300" />
          <div>
            <p className="text-sm font-semibold text-amber-100">
              Frontend demo mode
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Sample projects and scores are shown here. Publishing and
              unpublishing only changes local page state; no public announcement
              is made and no result is saved to the database.
            </p>
          </div>
        </div>

        {/* Hackathon selector */}
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Select hackathon</h2>
            <p className="mt-1 text-sm text-slate-500">
              Rankings are calculated separately for each event.
            </p>
          </div>

          <div className="relative sm:w-80">
            <CalendarDays
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <select
              value={hackathonFilter}
              onChange={(event) => {
                setHackathonFilter(event.target.value);
                setSearch("");
                setPublicationFilter("All");
              }}
              aria-label="Select hackathon"
              className="w-full appearance-none rounded-xl border border-white/10 bg-[#101522] py-3.5 pl-10 pr-10 text-sm text-slate-200 outline-none focus:border-cyan-300/40"
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
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            {
              label: "Ranked projects",
              value: stats.total,
              icon: Users,
              color: "text-cyan-300",
              bg: "bg-cyan-300/10",
            },
            {
              label: "Published results",
              value: stats.published,
              icon: CheckCircle2,
              color: "text-emerald-300",
              bg: "bg-emerald-300/10",
            },
            {
              label: "Draft results",
              value: stats.drafts,
              icon: Clock3,
              color: "text-amber-300",
              bg: "bg-amber-300/10",
            },
            {
              label: "Average score",
              value: stats.average.toFixed(1),
              icon: Target,
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
                  {stat.value}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Winners podium */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.07] p-3 text-amber-300">
              <Trophy size={20} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">Winners podium</h2>
              <p className="mt-1 text-xs text-slate-500">
                Top three projects by overall score
              </p>
            </div>
          </div>

          {topThree.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {topThree.map((result, index) => {
                const medal = MEDALS[index];
                const Icon = medal.icon;

                return (
                  <motion.button
                    type="button"
                    key={result.id}
                    onClick={() => setSelectedResult(result)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className={`relative overflow-hidden rounded-2xl border p-5 text-left transition hover:-translate-y-1 ${medal.color} ${
                      index === 0 ? "lg:-translate-y-2" : ""
                    }`}
                  >
                    <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/[0.03] blur-2xl" />

                    <div className="relative flex items-start justify-between gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/10 ${medal.text}`}
                      >
                        <Icon size={24} />
                      </div>

                      <span
                        className={`rounded-full border border-white/10 bg-black/10 px-3 py-1.5 text-[10px] font-black tracking-wider ${medal.text}`}
                      >
                        {medal.label}
                      </span>
                    </div>

                    <p className="relative mt-5 text-xs text-slate-500">
                      {result.team}
                    </p>

                    <h3 className="relative mt-1 text-xl font-black text-white">
                      {result.project}
                    </h3>

                    <p className="relative mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
                      {result.problem}
                    </p>

                    <div className="relative mt-5 flex items-end justify-between gap-3 border-t border-white/10 pt-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500">
                          Overall score
                        </p>
                        <p className={`mt-1 text-3xl font-black ${medal.text}`}>
                          {result.score.toFixed(1)}
                          <span className="ml-1 text-xs text-slate-500">
                            / 10
                          </span>
                        </p>
                      </div>

                      <StatusBadge published={result.published} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
              No results are available for this hackathon.
            </div>
          )}
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
                placeholder="Search by project, team, or problem..."
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
              Publication filter
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
                  {["All", "Published", "Draft"].map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setPublicationFilter(filter)}
                      className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                        publicationFilter === filter
                          ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                          : "border-white/10 text-slate-400 hover:bg-white/5"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Results table */}
        <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101522]">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.08] p-5 sm:p-6">
            <div>
              <h2 className="font-bold text-white">Final standings</h2>
              <p className="mt-1 text-xs text-slate-500">
                {filteredResults.length} results · Sorted by score
              </p>
            </div>

            {(search || publicationFilter !== "All") && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
              >
                <RotateCcw size={13} />
                Reset filters
              </button>
            )}
          </div>

          {filteredResults.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[850px] text-left">
                  <thead>
                    <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                      {[
                        "Rank",
                        "Project / Team",
                        "Problem",
                        "Score",
                        "Publication",
                        "Details",
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
                    {filteredResults.map((result) => (
                      <tr
                        key={result.id}
                        className="transition hover:bg-white/[0.025]"
                      >
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-black ${
                              result.rank === 1
                                ? "border-amber-300/25 bg-amber-300/10 text-amber-200"
                                : result.rank === 2
                                  ? "border-slate-300/20 bg-slate-300/[0.05] text-slate-200"
                                  : result.rank === 3
                                    ? "border-orange-300/20 bg-orange-300/[0.05] text-orange-200"
                                    : "border-white/10 text-slate-500"
                            }`}
                          >
                            #{result.rank}
                          </span>
                        </td>

                        <td className="max-w-[230px] px-5 py-4">
                          <p className="truncate text-sm font-semibold text-slate-200">
                            {result.project}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {result.team}
                          </p>
                        </td>

                        <td className="max-w-[220px] px-5 py-4">
                          <p className="truncate text-xs text-slate-400">
                            {result.problem}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-base font-black text-cyan-300">
                            {result.score.toFixed(1)}
                            <span className="ml-1 text-xs font-medium text-slate-600">
                              / 10
                            </span>
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge published={result.published} />
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedResult(result)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/25 hover:text-cyan-200"
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="grid gap-3 p-4 md:hidden">
                {filteredResults.map((result) => (
                  <div
                    key={result.id}
                    className="rounded-xl border border-white/[0.07] bg-black/10 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-cyan-300">
                          RANK #{result.rank}
                        </p>
                        <h3 className="mt-1 break-words font-bold text-white">
                          {result.project}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {result.team}
                        </p>
                      </div>

                      <p className="shrink-0 text-lg font-black text-cyan-300">
                        {result.score.toFixed(1)}
                      </p>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-slate-400">
                      {result.problem}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <StatusBadge published={result.published} />

                      <button
                        type="button"
                        onClick={() => setSelectedResult(result)}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300"
                      >
                        <Eye size={14} />
                        View result
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="px-5 py-14 text-center">
              <Trophy size={28} className="mx-auto text-slate-600" />
              <h3 className="mt-4 font-bold text-white">No results found</h3>
              <p className="mt-2 text-sm text-slate-500">
                Try a different search term or publication filter.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5"
              >
                <RotateCcw size={14} />
                Clear filters
              </button>
            </div>
          )}
        </section>

        <div className="flex flex-col gap-2 border-t border-white/[0.07] py-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>Skill Incubator · Organizer workspace</span>
          <span>Results and rankings · Frontend prototype</span>
        </div>
      </div>

      {/* Result details */}
      <AnimatePresence>
        {selectedResult && (
          <ResultDetailsModal
            key={selectedResult.id}
            result={selectedResult}
            onClose={() => setSelectedResult(null)}
            onTogglePublish={togglePublish}
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
            <CheckCircle2 size={18} className="shrink-0 text-emerald-300" />
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
