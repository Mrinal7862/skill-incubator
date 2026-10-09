import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Trophy,
  Medal,
  Award,
  Users,
  CheckCircle2,
  Clock3,
  Eye,
  Download,
  X,
  ChevronDown,
  RotateCcw,
  AlertCircle,
  Sparkles,
  Filter,
  Globe,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@clerk/react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

function exportResults(results) {
  const columns = [
    ["Hackathon", "hackathon"],
    ["Rank", "rank"],
    ["Project", "project"],
    ["Team", "team"],
    ["Problem Statement", "problem"],
    ["Prize", "prize"],
    ["Published", "published"],
  ];

  const escapeCSV = (value) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const csv = [
    columns.map(([heading]) => escapeCSV(heading)).join(","),
    ...results.map((result) =>
      columns
        .map(([, key]) => {
          let value = result[key];

          if (key === "published") {
            value = value ? "Yes" : "No";
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
  link.download = "skill-incubator-results.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function normalizeSubmission(submission) {
  return {
    id: submission.id,
    project:
      submission.project_name ||
      submission.project ||
      "Untitled Project",

    team:
      submission.team_name ||
      submission.team?.name ||
      "Unknown Team",

    teamId:
      submission.team_id ||
      submission.team?.id ||
      null,

    problem:
      submission.problem_statement_name ||
      submission.problem_statement ||
      submission.problem_statement?.title ||
      "Problem Statement",

    members:
      submission.members ||
      submission.team_members ||
      [],

    description: submission.description || "",
  };
}

function WinnerSelection({
  submissions,
  selectedWinners,
  onSelect,
  saving,
}) {
  const positions = [
    {
      key: "first_submission_id",
      label: "1st Place",
      color: "text-amber-200",
      border: "border-amber-300/20",
    },
    {
      key: "second_submission_id",
      label: "2nd Place",
      color: "text-slate-200",
      border: "border-slate-300/20",
    },
    {
      key: "third_submission_id",
      label: "3rd Place",
      color: "text-orange-200",
      border: "border-orange-300/20",
    },
  ];

  return (
    <div className="space-y-4">
      {positions.map((position) => (
        <div
          key={position.key}
          className={`rounded-2xl border ${position.border} bg-black/10 p-4`}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className={`text-sm font-bold ${position.color}`}>
              {position.label}
            </p>

            {selectedWinners[position.key] && (
              <button
                type="button"
                disabled={saving}
                onClick={() => onSelect(position.key, "")}
                className="text-xs text-slate-500 transition hover:text-red-300"
              >
                Clear
              </button>
            )}
          </div>

          <select
            value={selectedWinners[position.key] || ""}
            disabled={saving}
            onChange={(event) =>
              onSelect(position.key, event.target.value)
            }
            className="w-full rounded-xl border border-white/10 bg-[#0b101b] px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-300/40 disabled:opacity-50"
          >
            <option value="">
              Select submission
            </option>

            {submissions.map((submission) => {
              const selectedElsewhere = Object.entries(
                selectedWinners,
              ).some(
                ([key, value]) =>
                  key !== position.key &&
                  value === submission.id,
              );

              return (
                <option
                  key={submission.id}
                  value={submission.id}
                  disabled={selectedElsewhere}
                >
                  {submission.project} — {submission.team}
                </option>
              );
            })}
          </select>
        </div>
      ))}
    </div>
  );
}

function ResultDetailsModal({
  result,
  onClose,
  onPublish,
  publishing,
}) {
  if (!result) return null;

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

            <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
              {result.project}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {result.team}
            </p>
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
                #{result.rank}
                <span className="ml-2 text-base font-semibold text-cyan-300">
                  {result.prize}
                </span>
              </p>
            </div>

            <StatusBadge published={result.published} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Hackathon
            </p>

            <p className="mt-2 text-sm font-medium text-slate-200">
              {result.hackathon}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Problem statement
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              {result.problem}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white">
              Team members
            </h3>

            {result.members?.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {result.members.map((member, index) => (
                  <span
                    key={`${member}-${index}`}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300"
                  >
                    {typeof member === "string"
                      ? member
                      : member.name ||
                        member.email ||
                        "Member"}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                Team member information unavailable.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Project description
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {result.description ||
                "No project description available."}
            </p>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <StatusBadge published={result.published} />

            <button
              type="button"
              disabled={publishing || result.published}
              onClick={() => onPublish(result.resultId)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {result.published ? (
                <>
                  <Globe size={16} />
                  Published
                </>
              ) : (
                <>
                  <Globe size={16} />
                  {publishing
                    ? "Publishing..."
                    : "Publish result"}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Results() {
  const { getToken } = useAuth();

  const [hackathons, setHackathons] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [selectedHackathon, setSelectedHackathon] =
    useState("");

  const [resultRecord, setResultRecord] = useState(null);

  const [selectedWinners, setSelectedWinners] = useState({
    first_submission_id: "",
    second_submission_id: "",
    third_submission_id: "",
  });

  const [search, setSearch] = useState("");
  const [publicationFilter, setPublicationFilter] =
    useState("All");

  const [showFilters, setShowFilters] = useState(false);
  const [selectedResult, setSelectedResult] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] =
    useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  function showNotice(message) {
    setNotice(message);

    window.setTimeout(() => {
      setNotice("");
    }, 3000);
  }

  async function apiRequest(path, options = {}) {
    const token = await getToken();

    const response = await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      },
    );

    if (!response.ok) {
      let message = "Something went wrong.";

      try {
        const data = await response.json();

        if (data?.detail) {
          message = data.detail;
        }
      } catch {
        // Ignore invalid error response
      }

      throw new Error(message);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  async function loadHackathons() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/hackathons");

      const list = Array.isArray(data)
        ? data
        : data?.items || [];

      setHackathons(list);

      if (list.length > 0) {
        setSelectedHackathon((current) =>
          current || String(list[0].id),
        );
      }
    } catch (err) {
      setError(
        err?.message ||
          "Failed to load hackathons.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadSubmissions(hackathonId) {
    if (!hackathonId) return;

    try {
      setLoadingSubmissions(true);
      setError("");

      const data = await apiRequest(
        "/submissions/organizer/all",
      );

      const list = Array.isArray(data)
        ? data
        : data?.items || [];

      const filtered = list
        .filter(
          (submission) =>
            String(
              submission.hackathon_id ||
                submission.hackathon?.id,
            ) === String(hackathonId),
        )
        .map(normalizeSubmission);

      setSubmissions(filtered);
    } catch (err) {
      setError(
        err?.message ||
          "Failed to load submissions.",
      );

      setSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  }

  async function loadResult(hackathonId) {
    if (!hackathonId) return;

    try {
      setResultRecord(null);

      setSelectedWinners({
        first_submission_id: "",
        second_submission_id: "",
        third_submission_id: "",
      });

      const data = await apiRequest(
        `/results/hackathon/${hackathonId}`,
      );

      setResultRecord(data);

      setSelectedWinners({
        first_submission_id:
          data.first_submission_id || "",
        second_submission_id:
          data.second_submission_id || "",
        third_submission_id:
          data.third_submission_id || "",
      });
    } catch (err) {
      // 404 simply means result has not been created yet.
      if (!err?.message?.toLowerCase().includes("no result")) {
        setResultRecord(null);
      }
    }
  }

  useEffect(() => {
    loadHackathons();
  }, []);

  useEffect(() => {
    if (!selectedHackathon) return;

    setSearch("");
    setPublicationFilter("All");

    loadSubmissions(selectedHackathon);
    loadResult(selectedHackathon);
  }, [selectedHackathon]);

  function handleWinnerSelect(key, value) {
    setSelectedWinners((current) => {
      const next = {
        ...current,
        [key]: value,
      };

      Object.keys(next).forEach((winnerKey) => {
        if (
          winnerKey !== key &&
          next[winnerKey] === value &&
          value
        ) {
          next[winnerKey] = "";
        }
      });

      return next;
    });
  }

  async function saveResult() {
    if (!selectedHackathon) {
      showNotice("Please select a hackathon.");
      return;
    }

    if (
      !selectedWinners.first_submission_id &&
      !selectedWinners.second_submission_id &&
      !selectedWinners.third_submission_id
    ) {
      showNotice("Select at least one winner.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        hackathon_id: selectedHackathon,
        first_submission_id:
          selectedWinners.first_submission_id || null,
        second_submission_id:
          selectedWinners.second_submission_id || null,
        third_submission_id:
          selectedWinners.third_submission_id || null,
      };

      let data;

      if (resultRecord?.id) {
        data = await apiRequest(
          `/results/${resultRecord.id}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              first_submission_id:
                payload.first_submission_id,
              second_submission_id:
                payload.second_submission_id,
              third_submission_id:
                payload.third_submission_id,
            }),
          },
        );
      } else {
        data = await apiRequest("/results", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setResultRecord(data);

      showNotice(
        resultRecord?.id
          ? "Result updated successfully."
          : "Result saved successfully.",
      );
    } catch (err) {
      setError(
        err?.message ||
          "Failed to save result.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function publishResult(resultId) {
    if (!resultId) {
      showNotice("Save the result before publishing.");
      return;
    }

    try {
      setPublishing(true);
      setError("");

      const data = await apiRequest(
        `/results/${resultId}/publish`,
        {
          method: "POST",
        },
      );

      setResultRecord(data);

      showNotice(
        "Result published successfully.",
      );

      setSelectedResult((current) =>
        current
          ? {
              ...current,
              published: true,
            }
          : current,
      );
    } catch (err) {
      setError(
        err?.message ||
          "Failed to publish result.",
      );
    } finally {
      setPublishing(false);
    }
  }

  const rankedResults = useMemo(() => {
    const selectedMap = [
      {
        id: selectedWinners.first_submission_id,
        rank: 1,
        prize: "Winner",
      },
      {
        id: selectedWinners.second_submission_id,
        rank: 2,
        prize: "Runner-up",
      },
      {
        id: selectedWinners.third_submission_id,
        rank: 3,
        prize: "Second Runner-up",
      },
    ];

    return selectedMap
      .filter((item) => item.id)
      .map((item) => {
        const submission = submissions.find(
          (entry) =>
            String(entry.id) === String(item.id),
        );

        if (!submission) return null;

        return {
          ...submission,
          rank: item.rank,
          prize: item.prize,
          published: Boolean(
            resultRecord?.published,
          ),
          resultId: resultRecord?.id || null,
          hackathon:
            hackathons.find(
              (hackathon) =>
                String(hackathon.id) ===
                String(selectedHackathon),
            )?.name || "Hackathon",
        };
      })
      .filter(Boolean);
  }, [
    selectedWinners,
    submissions,
    resultRecord,
    hackathons,
    selectedHackathon,
  ]);

  const filteredResults = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rankedResults.filter((result) => {
      const matchesSearch =
        !term ||
        result.project
          .toLowerCase()
          .includes(term) ||
        result.team
          .toLowerCase()
          .includes(term) ||
        result.problem
          .toLowerCase()
          .includes(term);

      const matchesPublication =
        publicationFilter === "All" ||
        (publicationFilter === "Published" &&
          result.published) ||
        (publicationFilter === "Draft" &&
          !result.published);

      return (
        matchesSearch &&
        matchesPublication
      );
    });
  }, [
    rankedResults,
    search,
    publicationFilter,
  ]);

  const stats = useMemo(() => {
    return {
      total: rankedResults.length,
      published: resultRecord?.published
        ? rankedResults.length
        : 0,
      drafts: resultRecord?.published
        ? 0
        : rankedResults.length,
      average: 0,
    };
  }, [rankedResults, resultRecord]);

  const topThree = rankedResults.slice(0, 3);

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

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.17em] text-cyan-300">
              <Sparkles size={14} />
              Organizer workspace
            </div>

            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Hackathon{" "}
                  <span className="text-cyan-300">
                    Results
                  </span>
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                  Select winning teams, review final
                  standings, and publish results for
                  your hackathon.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  exportResults(filteredResults)
                }
                disabled={
                  filteredResults.length === 0
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.07] disabled:opacity-40"
              >
                <Download size={16} />
                Export CSV
              </button>
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

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-300/15 bg-red-300/[0.04] px-4 py-3.5">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-red-300"
            />

            <div className="flex-1">
              <p className="text-sm font-semibold text-red-200">
                Something went wrong
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-slate-500 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Hackathon selector */}
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              Select hackathon
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Rankings are managed separately for
              each event.
            </p>
          </div>

          <div className="relative sm:w-80">
            <select
              value={selectedHackathon}
              onChange={(event) =>
                setSelectedHackathon(
                  event.target.value,
                )
              }
              disabled={loading}
              aria-label="Select hackathon"
              className="w-full appearance-none rounded-xl border border-white/10 bg-[#101522] py-3.5 px-4 pr-10 text-sm text-slate-200 outline-none focus:border-cyan-300/40 disabled:opacity-50"
            >
              {hackathons.length === 0 && (
                <option value="">
                  No hackathons found
                </option>
              )}

              {hackathons.map((hackathon) => (
                <option
                  key={hackathon.id}
                  value={hackathon.id}
                >
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

        {/* Winner selection */}
        <section className="rounded-3xl border border-white/[0.08] bg-[#101522] p-5 sm:p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-white">
                Select winners
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Choose the top three submissions for
                this hackathon.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={
                  saving ||
                  loadingSubmissions ||
                  !selectedHackathon
                }
                onClick={saveResult}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CheckCircle2 size={16} />

                {saving
                  ? "Saving..."
                  : resultRecord
                    ? "Update Result"
                    : "Save Result"}
              </button>

              {resultRecord && (
                <button
                  type="button"
                  disabled={
                    saving ||
                    publishing ||
                    resultRecord.published
                  }
                  onClick={() =>
                    publishResult(resultRecord.id)
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-bold text-emerald-200 transition hover:bg-emerald-300/15 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {resultRecord.published ? (
                    <>
                      <Globe size={16} />
                      Published
                    </>
                  ) : (
                    <>
                      <Globe size={16} />
                      {publishing
                        ? "Publishing..."
                        : "Publish Result"}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {loadingSubmissions ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-300" />

              <p className="mt-3 text-sm text-slate-500">
                Loading submissions...
              </p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
              <Trophy
                size={28}
                className="mx-auto text-slate-600"
              />

              <h3 className="mt-4 font-bold text-white">
                No submissions available
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Teams must submit their projects before
                winners can be selected.
              </p>
            </div>
          ) : (
            <WinnerSelection
              submissions={submissions}
              selectedWinners={selectedWinners}
              onSelect={handleWinnerSelect}
              saving={saving}
            />
          )}
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            {
              label: "Winning projects",
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
              label: "Hackathon",
              value:
                hackathons.find(
                  (hackathon) =>
                    String(hackathon.id) ===
                    String(selectedHackathon),
                )?.name || "—",
              icon: Trophy,
              color: "text-violet-300",
              bg: "bg-violet-300/10",
            },
          ].map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
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

                <p
                  className={`mt-4 ${
                    stat.label === "Hackathon"
                      ? "truncate text-sm"
                      : "text-3xl"
                  } font-black tracking-tight text-white`}
                >
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
              <h2 className="text-lg font-bold text-white">
                Winners podium
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Selected winners for this hackathon
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
                    onClick={() =>
                      setSelectedResult({
                        ...result,
                        resultId:
                          resultRecord?.id,
                      })
                    }
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.08,
                    }}
                    className={`relative overflow-hidden rounded-2xl border p-5 text-left transition hover:-translate-y-1 ${medal.color} ${
                      index === 0
                        ? "lg:-translate-y-2"
                        : ""
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

                    <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                      <p className={`font-black ${medal.text}`}>
                        #{result.rank}
                      </p>

                      <StatusBadge
                        published={result.published}
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
              No winners selected yet.
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
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by project, team, or problem..."
                className="w-full rounded-xl border border-white/10 bg-[#101522] py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/40"
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
              Publication filter
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
                <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#101522] p-4">
                  {[
                    "All",
                    "Published",
                    "Draft",
                  ].map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() =>
                        setPublicationFilter(
                          filter,
                        )
                      }
                      className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                        publicationFilter ===
                        filter
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

        {/* Final standings */}
        <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101522]">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.08] p-5 sm:p-6">
            <div>
              <h2 className="font-bold text-white">
                Final standings
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredResults.length} selected results
              </p>
            </div>

            {(search ||
              publicationFilter !== "All") && (
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
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[800px] text-left">
                  <thead>
                    <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                      {[
                        "Rank",
                        "Project / Team",
                        "Problem",
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
                    {filteredResults.map(
                      (result) => (
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
                                    : "border-orange-300/20 bg-orange-300/[0.05] text-orange-200"
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
                            <StatusBadge
                              published={
                                result.published
                              }
                            />
                          </td>

                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedResult(
                                  {
                                    ...result,
                                    resultId:
                                      resultRecord?.id,
                                  },
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/25 hover:text-cyan-200"
                            >
                              <Eye size={14} />
                              View
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="grid gap-3 p-4 md:hidden">
                {filteredResults.map(
                  (result) => (
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
                      </div>

                      <p className="mt-3 text-xs leading-5 text-slate-400">
                        {result.problem}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <StatusBadge
                          published={
                            result.published
                          }
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedResult({
                              ...result,
                              resultId:
                                resultRecord?.id,
                            })
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300"
                        >
                          <Eye size={14} />
                          View result
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </>
          ) : (
            <div className="px-5 py-14 text-center">
              <Trophy
                size={28}
                className="mx-auto text-slate-600"
              />

              <h3 className="mt-4 font-bold text-white">
                No results found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Select winners above or try a
                different filter.
              </p>
            </div>
          )}
        </section>

        <div className="flex flex-col gap-2 border-t border-white/[0.07] py-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Skill Incubator · Organizer workspace
          </span>

          <span>
            Results and rankings · Live backend
          </span>
        </div>
      </div>

      {/* Details modal */}
      <AnimatePresence>
        {selectedResult && (
          <ResultDetailsModal
            key={selectedResult.id}
            result={selectedResult}
            onClose={() =>
              setSelectedResult(null)
            }
            onPublish={publishResult}
            publishing={publishing}
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