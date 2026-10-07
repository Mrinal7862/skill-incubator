
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Plus,
  FileText,
  Target,
  Pencil,
  Trash2,
  X,
  Clock3,
  SlidersHorizontal,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Code2,
  ArrowUpRight,
  LoaderCircle,
  Layers3,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"
).replace(/\/+$/, "");

const CATEGORIES = [
  "Artificial Intelligence",
  "Web Development",
  "Cybersecurity",
  "Education",
  "Sustainability",
  "Social Impact",
  "Healthcare",
  "Agriculture",
  "General",
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

const DIFFICULTY_STYLES = {
  Beginner: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  Intermediate: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
  Advanced: "border-fuchsia-400/25 bg-fuchsia-400/10 text-fuchsia-300",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "Artificial Intelligence",
  difficulty: "Intermediate",
  requirements: "",
  expected_outcome: "",
};

function formatDate(value) {
  if (!value) return "Recently added";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Recently added";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function readError(response) {
  try {
    const body = await response.json();

    if (typeof body.detail === "string") return body.detail;

    if (Array.isArray(body.detail)) {
      return body.detail
        .map((item) => item.msg || "Invalid input")
        .join(" ");
    }

    return `Request failed (${response.status}).`;
  } catch {
    return `Request failed (${response.status}).`;
  }
}

function ProblemStatementForm({ initialValue, onClose, onSave, saving }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...(initialValue || {}),
    requirements: initialValue?.requirements || "",
    expected_outcome: initialValue?.expected_outcome || "",
  }));

  const [errors, setErrors] = useState({});

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};

    if (form.title.trim().length < 3) {
      nextErrors.title = "Title must contain at least 3 characters.";
    }

    if (form.description.trim().length < 10) {
      nextErrors.description =
        "Description must contain at least 10 characters.";
    }

    if (!form.category) {
      nextErrors.category = "Select a category.";
    }

    if (!form.difficulty) {
      nextErrors.difficulty = "Select a difficulty level.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    await onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      difficulty: form.difficulty,
      requirements: form.requirements.trim() || null,
      expected_outcome: form.expected_outcome.trim() || null,
    });
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-[#090d18] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10";

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
        aria-labelledby="ps-form-title"
        className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-cyan-400/20 bg-[#101523] shadow-2xl shadow-cyan-950/30"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6 sm:p-7">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              <Sparkles size={14} />
              Problem workspace
            </div>

            <h2
              id="ps-form-title"
              className="text-xl font-bold tracking-tight text-white sm:text-2xl"
            >
              {initialValue?.id
                ? "Edit problem statement"
                : "Create a problem statement"}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Define a clear challenge for participating teams.
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close form"
            className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-7">
          <div>
            <label className="text-sm font-medium text-slate-200">
              Problem title <span className="text-cyan-300">*</span>
            </label>

            <input
              autoFocus
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="e.g. AI-powered waste management"
              className={inputClass}
              maxLength={200}
              required
            />

            {errors.title && (
              <p className="mt-2 text-xs text-rose-400">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-200">
              Description <span className="text-cyan-300">*</span>
            </label>

            <textarea
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="Explain the challenge, who it affects, and what teams need to solve..."
              rows={4}
              className={`${inputClass} resize-y`}
              required
            />

            <div className="mt-1 flex items-center justify-between gap-3">
              {errors.description ? (
                <p className="text-xs text-rose-400">
                  {errors.description}
                </p>
              ) : (
                <span className="text-xs text-slate-600">
                  At least 10 characters.
                </span>
              )}

              <span className="shrink-0 text-xs text-slate-600">
                {form.description.length} characters
              </span>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-200">
                Category
              </label>

              <select
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
                className={inputClass}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-200">
                Difficulty
              </label>

              <select
                value={form.difficulty}
                onChange={(event) =>
                  updateField("difficulty", event.target.value)
                }
                className={inputClass}
              >
                {DIFFICULTIES.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-200">
              Requirements
            </label>

            <textarea
              value={form.requirements}
              onChange={(event) =>
                updateField("requirements", event.target.value)
              }
              placeholder="Features, technical constraints, or expectations..."
              rows={3}
              className={`${inputClass} resize-y`}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-200">
              Expected outcome
            </label>

            <textarea
              value={form.expected_outcome}
              onChange={(event) =>
                updateField("expected_outcome", event.target.value)
              }
              placeholder="What should a successful solution demonstrate?"
              rows={3}
              className={`${inputClass} resize-y`}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-wait disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}

              {saving
                ? "Saving..."
                : initialValue?.id
                  ? "Save changes"
                  : "Create statement"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function ProblemStatements() {
  const { getToken } = useAuth();
  const params = useParams();
  const fixedHackathonId = params.hackathonId || params.id || "";

  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathonId, setSelectedHackathonId] =
    useState(fixedHackathonId);

  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All Categories");
  const [selectedDifficulty, setSelectedDifficulty] =
    useState("All Levels");

  const [loadingHackathons, setLoadingHackathons] = useState(true);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState("");

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

  const activeHackathon = hackathons.find(
    (hackathon) => String(hackathon.id) === String(selectedHackathonId),
  );

  const loadHackathons = useCallback(async () => {
    setLoadingHackathons(true);
    setError("");

    try {
      const data = await apiRequest("/hackathons/my");

      const list = Array.isArray(data) ? data : [];

      setHackathons(list);

      const chosenId = fixedHackathonId
        ? String(fixedHackathonId)
        : String(list[0]?.id || "");

      setSelectedHackathonId(chosenId);

      if (!list.length) {
        setProblems([]);
      }
    } catch (err) {
      setError(err.message || "Could not load your hackathons.");
    } finally {
      setLoadingHackathons(false);
    }
  }, [apiRequest, fixedHackathonId]);

  const loadProblems = useCallback(async () => {
    if (!selectedHackathonId) {
      setProblems([]);
      return;
    }

    setLoadingProblems(true);
    setError("");

    try {
      const data = await apiRequest(
        `/hackathons/${encodeURIComponent(
          selectedHackathonId,
        )}/problem-statements`,
      );

      setProblems(Array.isArray(data) ? data : []);
    } catch (err) {
      setProblems([]);
      setError(err.message || "Could not load problem statements.");
    } finally {
      setLoadingProblems(false);
    }
  }, [apiRequest, selectedHackathonId]);

  useEffect(() => {
    loadHackathons();
  }, [loadHackathons]);

  useEffect(() => {
    if (selectedHackathonId) loadProblems();
  }, [loadProblems, selectedHackathonId]);

  useEffect(() => {
    if (fixedHackathonId) {
      setSelectedHackathonId(String(fixedHackathonId));
    }
  }, [fixedHackathonId]);

  const categoryOptions = useMemo(
    () => [
      "All Categories",
      ...new Set(
        problems.map((problem) => problem.category).filter(Boolean),
      ),
    ],
    [problems],
  );

  const filteredProblems = useMemo(() => {
    const term = search.trim().toLowerCase();

    return problems.filter((problem) => {
      const matchesSearch =
        !term ||
        (problem.title || "").toLowerCase().includes(term) ||
        (problem.description || "").toLowerCase().includes(term) ||
        (problem.category || "").toLowerCase().includes(term);

      const matchesCategory =
        selectedCategory === "All Categories" ||
        problem.category === selectedCategory;

      const matchesDifficulty =
        selectedDifficulty === "All Levels" ||
        problem.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [problems, search, selectedCategory, selectedDifficulty]);

  const stats = useMemo(
    () => ({
      total: problems.length,
      beginner: problems.filter((p) => p.difficulty === "Beginner").length,
      intermediate: problems.filter(
        (p) => p.difficulty === "Intermediate",
      ).length,
      advanced: problems.filter((p) => p.difficulty === "Advanced").length,
    }),
    [problems],
  );

  function showNotice(message, type = "success") {
    setNotice({ message, type });
    window.setTimeout(() => setNotice(null), 3500);
  }

  function resetFilters() {
    setSearch("");
    setSelectedCategory("All Categories");
    setSelectedDifficulty("All Levels");
  }

  function openCreateModal() {
    setEditingProblem(null);
    setModalOpen(true);
  }

  function openEditModal(problem) {
    setEditingProblem({ ...problem });
    setModalOpen(true);
  }

  async function handleSave(form) {
    if (!selectedHackathonId) {
      showNotice("Select a hackathon first.", "error");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingProblem?.id) {
        const updated = await apiRequest(
          `/problem-statements/${encodeURIComponent(editingProblem.id)}`,
          {
            method: "PUT",
            body: JSON.stringify(form),
          },
        );

        setProblems((current) =>
          current.map((problem) =>
            String(problem.id) === String(updated.id) ? updated : problem,
          ),
        );

        showNotice("Problem statement updated successfully.");
      } else {
        const created = await apiRequest(
          `/hackathons/${encodeURIComponent(
            selectedHackathonId,
          )}/problem-statements`,
          {
            method: "POST",
            body: JSON.stringify(form),
          },
        );

        setProblems((current) => [created, ...current]);
        showNotice("Problem statement created successfully.");
      }

      setModalOpen(false);
      setEditingProblem(null);
    } catch (err) {
      showNotice(err.message || "Unable to save the problem statement.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(problem) {
    const confirmed = window.confirm(
      `Delete "${problem.title}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(String(problem.id));
    setError("");

    try {
      await apiRequest(
        `/problem-statements/${encodeURIComponent(problem.id)}`,
        { method: "DELETE" },
      );

      setProblems((current) =>
        current.filter((item) => String(item.id) !== String(problem.id)),
      );

      showNotice("Problem statement deleted successfully.");
    } catch (err) {
      showNotice(
        err.message || "Unable to delete the problem statement.",
        "error",
      );
    } finally {
      setDeletingId("");
    }
  }

  const hasFilters =
    search !== "" ||
    selectedCategory !== "All Categories" ||
    selectedDifficulty !== "All Levels";

  return (
    <div className="min-h-screen bg-[#080b14] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-cyan-400/15 bg-gradient-to-br from-[#111a2b] via-[#101523] to-[#10101f] p-6 sm:p-9"
        >
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/3 h-36 w-36 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
                <Sparkles size={14} />
                Organizer workspace
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Problem <span className="text-cyan-300">Statements</span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                Manage challenges for your hackathons. Changes are saved to
                the database through your authenticated API.
              </p>
            </div>

            <button
              type="button"
              disabled={!selectedHackathonId || loadingHackathons}
              onClick={openCreateModal}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={18} />
              Create Problem
            </button>
          </div>
        </motion.div>

        {/* Hackathon selector */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#101522] p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-white">Select hackathon</h2>
              <p className="mt-1 text-xs text-slate-500">
                Only hackathons managed by your organizer account are listed.
              </p>
            </div>

            <select
              value={selectedHackathonId}
              disabled={Boolean(fixedHackathonId) || loadingHackathons}
              onChange={(event) =>
                setSelectedHackathonId(event.target.value)
              }
              aria-label="Select hackathon"
              className="w-full rounded-xl border border-white/10 bg-[#090d18] px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-300/40 disabled:opacity-60 sm:max-w-sm"
            >
              {!hackathons.length && (
                <option value="">
                  {loadingHackathons
                    ? "Loading hackathons..."
                    : "No hackathons found"}
                </option>
              )}

              {hackathons.map((hackathon) => (
                <option key={hackathon.id} value={hackathon.id}>
                  {hackathon.name}
                </option>
              ))}
            </select>
          </div>

          {activeHackathon && (
            <div className="mt-4 flex items-center gap-2 border-t border-white/[0.07] pt-4 text-sm text-slate-400">
              <Target size={15} className="text-cyan-300" />
              Managing:{" "}
              <span className="font-semibold text-slate-200">
                {activeHackathon.name}
              </span>
            </div>
          )}
        </section>

        {/* Error notice */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-300/15 bg-rose-300/[0.04] px-4 py-3.5">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-rose-300"
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-rose-200">
                Could not complete request
              </p>
              <p className="mt-1 break-words text-xs leading-5 text-slate-400">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!hackathons.length) loadHackathons();
                else loadProblems();
              }}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5"
            >
              <RotateCcw size={13} />
              Retry
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            {
              label: "Total statements",
              value: stats.total,
              icon: FileText,
              color: "text-cyan-300",
              bg: "bg-cyan-300/10",
            },
            {
              label: "Beginner",
              value: stats.beginner,
              icon: Layers3,
              color: "text-emerald-300",
              bg: "bg-emerald-300/10",
            },
            {
              label: "Intermediate",
              value: stats.intermediate,
              icon: Code2,
              color: "text-sky-300",
              bg: "bg-sky-300/10",
            },
            {
              label: "Advanced",
              value: stats.advanced,
              icon: Target,
              color: "text-fuchsia-300",
              bg: "bg-fuchsia-300/10",
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
                  {stat.value.toString().padStart(2, "0")}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Search / filters */}
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
                placeholder="Search by title, description, or category..."
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
                <div className="grid gap-4 rounded-2xl border border-white/10 bg-[#101522] p-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Category
                    </label>

                    <select
                      value={selectedCategory}
                      onChange={(event) =>
                        setSelectedCategory(event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#090d18] px-3 py-3 text-sm text-slate-200 outline-none focus:border-cyan-300/40"
                    >
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Difficulty
                    </label>

                    <select
                      value={selectedDifficulty}
                      onChange={(event) =>
                        setSelectedDifficulty(event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#090d18] px-3 py-3 text-sm text-slate-200 outline-none focus:border-cyan-300/40"
                    >
                      {["All Levels", ...DIFFICULTIES].map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
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
              Challenge library
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredProblems.length}{" "}
              {filteredProblems.length === 1 ? "statement" : "statements"}
              {" "}found
            </p>
          </div>

          {hasFilters && (
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

        {/* Loading */}
        {(loadingHackathons || loadingProblems) && (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-[#101522] py-14 text-sm text-slate-400">
            <LoaderCircle size={20} className="animate-spin text-cyan-300" />
            Loading your problem statements...
          </div>
        )}

        {/* Real API data */}
        {!loadingHackathons &&
          !loadingProblems &&
          selectedHackathonId &&
          filteredProblems.length > 0 && (
            <motion.div layout className="grid gap-4 xl:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {filteredProblems.map((problem, index) => (
                  <motion.article
                    layout
                    key={problem.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: Math.min(index * 0.025, 0.2) }}
                    className="group rounded-2xl border border-white/[0.08] bg-[#101522] p-5 transition hover:border-cyan-300/25 hover:bg-[#121a2a] sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.07] text-cyan-300">
                          <FileText size={20} />
                        </div>

                        <div className="min-w-0">
                          <span className="mb-2 inline-flex rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {problem.category}
                          </span>

                          <h3 className="break-words text-base font-bold leading-6 text-white transition group-hover:text-cyan-200 sm:text-lg">
                            {problem.title}
                          </h3>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold sm:text-xs ${
                          DIFFICULTY_STYLES[problem.difficulty] ||
                          "border-white/10 bg-white/5 text-slate-300"
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                    </div>

                    <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-400">
                      {problem.description}
                    </p>

                    {problem.requirements && (
                      <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/10 p-3.5">
                        <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-slate-300">
                          <Code2 size={14} className="text-cyan-300" />
                          Key requirements
                        </div>

                        <p className="whitespace-pre-wrap break-words text-xs leading-5 text-slate-500">
                          {problem.requirements}
                        </p>
                      </div>
                    )}

                    {problem.expected_outcome && (
                      <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-500">
                        <Target
                          size={14}
                          className="mt-0.5 shrink-0 text-violet-300"
                        />
                        <p className="whitespace-pre-wrap break-words">
                          <span className="font-semibold text-slate-400">
                            Expected outcome:
                          </span>{" "}
                          {problem.expected_outcome}
                        </p>
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock3 size={14} />
                        {formatDate(problem.created_at)}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(problem)}
                          aria-label={`Edit ${problem.title}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/25 hover:bg-cyan-300/5 hover:text-cyan-200"
                        >
                          <Pencil size={13} />
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={deletingId === String(problem.id)}
                          onClick={() => handleDelete(problem)}
                          aria-label={`Delete ${problem.title}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/10 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-rose-400/30 hover:bg-rose-400/5 hover:text-rose-300 disabled:opacity-40"
                        >
                          {deletingId === String(problem.id) ? (
                            <LoaderCircle
                              size={13}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={13} />
                          )}
                          Delete
                        </button>

                        <ArrowUpRight
                          size={15}
                          className="hidden text-slate-700 transition group-hover:text-cyan-300 sm:block"
                        />
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

        {/* Empty state */}
        {!loadingHackathons &&
          !loadingProblems &&
          selectedHackathonId &&
          filteredProblems.length === 0 &&
          !error && (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#101522]/50 px-5 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-300">
                <FileText size={24} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-white">
                {problems.length
                  ? "No matching statements"
                  : "No problem statements yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {problems.length
                  ? "Try changing your search or filters."
                  : "Create the first challenge for this hackathon. It will be saved in your database."}
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

                {!problems.length && (
                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
                  >
                    <Plus size={16} />
                    Create problem
                  </button>
                )}
              </div>
            </div>
          )}

        {!loadingHackathons &&
          !loadingProblems &&
          !selectedHackathonId &&
          !error && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#101522] px-5 py-12 text-center">
              <Layers3 size={26} className="mx-auto text-slate-500" />
              <h3 className="mt-4 font-bold text-white">
                No hackathons available
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Create a hackathon first, then add its problem statements.
              </p>
            </div>
          )}

        <div className="flex flex-col gap-2 border-t border-white/[0.07] py-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>Skill Incubator · Organizer workspace</span>
          <span>Problem statements · Connected to API</span>
        </div>
      </div>

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
              <AlertCircle
                size={18}
                className="shrink-0 text-rose-300"
              />
            ) : (
              <CheckCircle2
                size={18}
                className="shrink-0 text-emerald-300"
              />
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

      {/* Create / edit modal */}
      <AnimatePresence>
        {modalOpen && (
          <ProblemStatementForm
            key={editingProblem?.id || "new-problem"}
            initialValue={editingProblem}
            saving={saving}
            onClose={() => {
              if (saving) return;
              setModalOpen(false);
              setEditingProblem(null);
            }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
