
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  FileText,
  Layers3,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

const HACKATHONS = [
  { id: "all", name: "All hackathons" },
  { id: "hackathon-1", name: "Minerva Innovation Challenge" },
  { id: "hackathon-2", name: "CampusForge Hackathon" },
];

const ANALYTICS = {
  "hackathon-1": {
    name: "Minerva Innovation Challenge",
    registrations: 124,
    teams: 31,
    submissions: 24,
    evaluated: 16,
    publishedResults: 1,
    registrationTrend: [
      { label: "Week 1", value: 18 },
      { label: "Week 2", value: 32 },
      { label: "Week 3", value: 44 },
      { label: "Week 4", value: 30 },
    ],
    categories: [
      { label: "Artificial Intelligence", value: 12 },
      { label: "Web Development", value: 8 },
      { label: "Sustainability", value: 7 },
      { label: "Cybersecurity", value: 5 },
    ],
    pipeline: [
      { label: "Submitted", value: 24 },
      { label: "Under review", value: 5 },
      { label: "Evaluated", value: 16 },
      { label: "Results published", value: 1 },
    ],
    topTeams: [
      { name: "Code Warriors", project: "AttendAI", score: 8.5 },
      { name: "Neural Ninjas", project: "GreenCampus", score: 7.0 },
      { name: "Vision Builders", project: "VisionTrack", score: 6.8 },
      { name: "The Innovators", project: "CampusPulse", score: 6.2 },
    ],
  },
  "hackathon-2": {
    name: "CampusForge Hackathon",
    registrations: 86,
    teams: 22,
    submissions: 18,
    evaluated: 12,
    publishedResults: 1,
    registrationTrend: [
      { label: "Week 1", value: 12 },
      { label: "Week 2", value: 19 },
      { label: "Week 3", value: 27 },
      { label: "Week 4", value: 28 },
    ],
    categories: [
      { label: "Education", value: 10 },
      { label: "Social Impact", value: 8 },
      { label: "Web Development", value: 6 },
      { label: "Artificial Intelligence", value: 5 },
    ],
    pipeline: [
      { label: "Submitted", value: 18 },
      { label: "Under review", value: 6 },
      { label: "Evaluated", value: 12 },
      { label: "Results published", value: 1 },
    ],
    topTeams: [
      { name: "Pixel Pioneers", project: "LearnSphere", score: 9.0 },
      { name: "Build Beyond", project: "CivicConnect", score: 8.0 },
      { name: "Future Forge", project: "SkillBridge", score: 7.5 },
      { name: "Campus Creators", project: "CampusConnect", score: 7.1 },
    ],
  },
};

const ALL_ANALYTICS = {
  name: "All hackathons",
  registrations: 210,
  teams: 53,
  submissions: 42,
  evaluated: 28,
  publishedResults: 2,
  registrationTrend: [
    { label: "Week 1", value: 30 },
    { label: "Week 2", value: 51 },
    { label: "Week 3", value: 71 },
    { label: "Week 4", value: 58 },
  ],
  categories: [
    { label: "Artificial Intelligence", value: 17 },
    { label: "Web Development", value: 14 },
    { label: "Education", value: 10 },
    { label: "Social Impact", value: 8 },
    { label: "Sustainability", value: 7 },
    { label: "Cybersecurity", value: 5 },
  ],
  pipeline: [
    { label: "Submitted", value: 42 },
    { label: "Under review", value: 11 },
    { label: "Evaluated", value: 28 },
    { label: "Results published", value: 2 },
  ],
  topTeams: [
    { name: "Pixel Pioneers", project: "LearnSphere", score: 9.0 },
    { name: "Code Warriors", project: "AttendAI", score: 8.5 },
    { name: "Build Beyond", project: "CivicConnect", score: 8.0 },
    { name: "Future Forge", project: "SkillBridge", score: 7.5 },
  ],
};

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

function exportAnalytics(data) {
  const rows = [
    ["Metric", "Value"],
    ["Hackathon", data.name],
    ["Total registrations", data.registrations],
    ["Teams created", data.teams],
    ["Project submissions", data.submissions],
    ["Projects evaluated", data.evaluated],
    ["Published results", data.publishedResults],
    [
      "Evaluation coverage (%)",
      data.submissions
        ? ((data.evaluated / data.submissions) * 100).toFixed(1)
        : "0",
    ],
    [],
    ["Registration activity", "Registrations"],
    ...data.registrationTrend.map((item) => [item.label, item.value]),
    [],
    ["Problem category", "Statements"],
    ...data.categories.map((item) => [item.label, item.value]),
    [],
    ["Team", "Project", "Average score"],
    ...data.topTeams.map((item) => [
      item.name,
      item.project,
      item.score,
    ]),
  ];

  const escapeCSV = (value) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const csv = rows
    .map((row) => row.map(escapeCSV).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "skill-incubator-analytics.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function MetricCard({ title, value, description, icon: Icon, color, bg, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-2xl border border-white/[0.08] bg-[#101522] p-4 transition hover:border-white/[0.15] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium leading-5 text-slate-400 sm:text-sm">
            {title}
          </p>
          <p className="mt-4 text-3xl font-black tracking-tight text-white">
            {formatNumber(value)}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${bg} ${color}`}>
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">{description}</p>
    </motion.div>
  );
}

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] p-2.5 text-cyan-300">
        <Icon size={19} />
      </div>

      <div>
        <h2 className="font-bold text-white">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function RegistrationChart({ items }) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="mt-7">
      <div className="flex h-56 items-end justify-around gap-3 border-b border-l border-white/10 px-2 sm:px-5">
        {items.map((item, index) => (
          <div
            key={item.label}
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
          >
            <span className="mb-2 text-xs font-semibold text-slate-300">
              {item.value}
            </span>

            <motion.div
              initial={{ height: 0 }}
              animate={{
                height: `${Math.max((item.value / max) * 78, 4)}%`,
              }}
              transition={{ duration: 0.65, delay: index * 0.1 }}
              title={`${item.label}: ${item.value} registrations`}
              className="w-full max-w-16 rounded-t-lg border border-cyan-300/20 bg-gradient-to-t from-cyan-500/30 to-cyan-300/80 shadow-lg shadow-cyan-950/20"
            />

            <span className="absolute" />
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-around gap-3 px-2 sm:px-5">
        {items.map((item) => (
          <span
            key={item.label}
            className="flex-1 text-center text-[10px] text-slate-500 sm:text-xs"
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function CategoryBars({ items }) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="mt-6 space-y-5">
      {items.map((item, index) => (
        <div key={item.label}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="min-w-0 truncate text-xs font-medium text-slate-300 sm:text-sm">
              {item.label}
            </span>

            <span className="shrink-0 text-xs font-bold text-slate-400">
              {item.value}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / max) * 100}%` }}
              transition={{ duration: 0.6, delay: index * 0.06 }}
              className={`h-full rounded-full ${
                index % 3 === 0
                  ? "bg-cyan-300"
                  : index % 3 === 1
                    ? "bg-violet-300"
                    : "bg-sky-400"
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function PipelineRow({ item, max, index }) {
  const percentage = max ? (item.value / max) * 100 : 0;

  const barColors = [
    "bg-cyan-300",
    "bg-amber-300",
    "bg-emerald-300",
    "bg-violet-300",
  ];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/10 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-300">
          {item.label}
        </span>
        <span className="text-sm font-bold text-white">{item.value}</span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, delay: index * 0.08 }}
          className={`h-full rounded-full ${barColors[index % barColors.length]}`}
        />
      </div>
    </div>
  );
}

export default function Analytics() {
  const [hackathonId, setHackathonId] = useState("all");

  const data = useMemo(
    () =>
      hackathonId === "all"
        ? ALL_ANALYTICS
        : ANALYTICS[hackathonId] || ALL_ANALYTICS,
    [hackathonId],
  );

  const evaluationCoverage = data.submissions
    ? Math.round((data.evaluated / data.submissions) * 100)
    : 0;

  const completionRate = data.registrations
    ? Math.round((data.teams / data.registrations) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#080b14] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Page header */}
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

            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Platform <span className="text-cyan-300">Analytics</span>
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                  Understand registrations, track project submissions, and
                  monitor judging progress across your hackathons.
                </p>
              </div>

              <button
                type="button"
                onClick={() => exportAnalytics(data)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300"
              >
                <Download size={17} />
                Export report
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2">
                <Activity size={14} />
                Activity overview
              </span>
              <span className="inline-flex items-center gap-2">
                <BarChart3 size={14} />
                Submission trends
              </span>
              <span className="inline-flex items-center gap-2">
                <Trophy size={14} />
                Team performance
              </span>
            </div>
          </div>
        </motion.div>

        {/* Demo warning */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] px-4 py-3.5">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-amber-300"
          />
          <div>
            <p className="text-sm font-semibold text-amber-100">
              Sample analytics data
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              All figures and charts are illustrative demo values, not live
              platform analytics. The CSV report exports the displayed sample
              figures.
            </p>
          </div>
        </div>

        {/* Hackathon selection */}
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Analytics overview</h2>
            <p className="mt-1 text-sm text-slate-500">
              Select an event to explore its metrics.
            </p>
          </div>

          <div className="relative sm:w-80">
            <CalendarDays
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <select
              value={hackathonId}
              onChange={(event) => setHackathonId(event.target.value)}
              aria-label="Select hackathon analytics"
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

        {/* Main metrics */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total registrations"
            value={data.registrations}
            description="Recorded in this demo dataset"
            icon={Users}
            color="text-cyan-300"
            bg="bg-cyan-300/10"
            index={0}
          />

          <MetricCard
            title="Teams formed"
            value={data.teams}
            description={`${completionRate}% of registrations, illustrative ratio`}
            icon={Layers3}
            color="text-violet-300"
            bg="bg-violet-300/10"
            index={1}
          />

          <MetricCard
            title="Project submissions"
            value={data.submissions}
            description="Projects in the sample submission records"
            icon={FileText}
            color="text-sky-300"
            bg="bg-sky-300/10"
            index={2}
          />

          <MetricCard
            title="Projects evaluated"
            value={data.evaluated}
            description={`${evaluationCoverage}% of submitted projects in this demo`}
            icon={CheckCircle2}
            color="text-emerald-300"
            bg="bg-emerald-300/10"
            index={3}
          />
        </div>

        {/* Registration trend + category breakdown */}
        <div className="grid gap-5 xl:grid-cols-2">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/[0.08] bg-[#101522] p-5 sm:p-6"
          >
            <SectionHeading
              icon={TrendingUp}
              title="Registration activity"
              description="Illustrative registrations across four weeks"
            />

            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-300/10 bg-cyan-300/[0.035] px-4 py-3">
              <div>
                <p className="text-xs text-slate-500">Total registrations</p>
                <p className="mt-1 text-xl font-black text-white">
                  {formatNumber(data.registrations)}
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.06] px-2.5 py-2 text-xs font-semibold text-cyan-200">
                <Activity size={13} />
                4-week view
              </span>
            </div>

            <RegistrationChart items={data.registrationTrend} />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-white/[0.08] bg-[#101522] p-5 sm:p-6"
          >
            <SectionHeading
              icon={Target}
              title="Problem statement categories"
              description="Sample challenge counts by category"
            />

            <CategoryBars items={data.categories} />

            <div className="mt-6 rounded-xl border border-white/[0.07] bg-black/10 p-3.5">
              <p className="text-xs leading-5 text-slate-500">
                Category counts are illustrative and do not necessarily equal
                participant registrations or submitted projects.
              </p>
            </div>
          </motion.section>
        </div>

        {/* Submission pipeline */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/[0.08] bg-[#101522] p-5 sm:p-6"
        >
          <SectionHeading
            icon={Zap}
            title="Submission & evaluation pipeline"
            description="Current workflow counts in the illustrative dataset"
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {data.pipeline.map((item, index) => (
              <PipelineRow
                key={item.label}
                item={item}
                max={Math.max(
                  ...data.pipeline.map((pipelineItem) => pipelineItem.value),
                  1,
                )}
                index={index}
              />
            ))}
          </div>

          <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-300/10 bg-amber-300/[0.03] p-3.5">
            <Clock3
              size={15}
              className="mt-0.5 shrink-0 text-amber-300"
            />
            <p className="text-xs leading-5 text-slate-500">
              These pipeline statuses are independent sample counts; they
              should not be summed as unique projects.
            </p>
          </div>
        </motion.section>

        {/* Top performing teams */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101522]"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] p-5 sm:p-6">
            <SectionHeading
              icon={Trophy}
              title="Top performing teams"
              description="Illustrative average project scores"
            />

            <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-400">
              Demo leaderboard
            </span>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {[...data.topTeams]
              .sort((a, b) => b.score - a.score)
              .map((team, index) => (
                <div
                  key={`${team.name}-${team.project}`}
                  className="flex items-center gap-3 px-5 py-4 transition hover:bg-white/[0.02] sm:gap-4 sm:px-6"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-black ${
                      index === 0
                        ? "border-amber-300/25 bg-amber-300/10 text-amber-200"
                        : "border-white/10 bg-white/[0.03] text-slate-400"
                    }`}
                  >
                    {index === 0 ? <Trophy size={17} /> : `#${index + 1}`}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-200">
                      {team.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {team.project}
                    </p>
                  </div>

                  <div className="w-24 shrink-0 sm:w-36">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm font-black text-cyan-300">
                        {team.score.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-slate-600">/ 10</span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-cyan-300"
                        style={{
                          width: `${Math.min(team.score * 10, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </motion.section>

        {/* Event summary */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-cyan-300/15 bg-gradient-to-r from-cyan-300/[0.055] to-violet-400/[0.04] p-5 sm:p-6"
        >
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.07] p-3 text-cyan-300">
                <BarChart3 size={21} />
              </div>

              <div>
                <h2 className="font-bold text-white">Reporting snapshot</h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  {data.name} currently displays {formatNumber(data.registrations)}{" "}
                  sample registrations, {formatNumber(data.teams)} teams and{" "}
                  {formatNumber(data.submissions)} sample project submissions.
                  Use the CSV export to save this prototype report.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => exportAnalytics(data)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-300/[0.12]"
            >
              <Download size={16} />
              Download report
              <ArrowUpRight size={15} />
            </button>
          </div>
        </motion.section>

        <div className="flex flex-col gap-2 border-t border-white/[0.07] py-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>Skill Incubator · Organizer workspace</span>
          <span>Analytics & reporting · Frontend prototype</span>
        </div>
      </div>
    </div>
  );
}
