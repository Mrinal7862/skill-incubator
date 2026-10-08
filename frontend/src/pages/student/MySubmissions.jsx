import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileCode2,
  Code2,
  Loader2,
  Plus,
  RefreshCw,
  Send,
  XCircle,
  Code,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"
).replace(/\/+$/, "");

const STATUS_CONFIG = {
  SUBMITTED: {
    label: "Submitted",
    className:
      "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    className:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
  },
  ACCEPTED: {
    label: "Accepted",
    className:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  },
  NEEDS_CHANGES: {
    label: "Needs Changes",
    className:
      "border-rose-400/20 bg-rose-400/10 text-rose-300",
  },
};

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatus(status) {
  return STATUS_CONFIG[String(status || "").toUpperCase()] || {
    label: status || "Unknown",
    className: "border-white/10 bg-white/5 text-gray-300",
  };
}

function Field({ label, children, required = false }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="ml-1 text-rose-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/40 focus:bg-white/[0.06]";

export default function MySubmissions() {
  const { getToken } = useAuth();

  const [submissions, setSubmissions] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [teams, setTeams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingFormData, setLoadingFormData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    hackathon_id: "",
    team_id: "",
    problem_statement_id: "",
    project_name: "",
    description: "",
    tech_stack: "",
    github_url: "",
    demo_url: "",
  });

  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(false);

  const authHeaders = useCallback(
    async () => {
      const token = await getToken();

      if (!token) {
        throw new Error(
          "Your login session could not be verified. Please sign in again."
        );
      }

      return {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      };
    },
    [getToken]
  );

  const readError = async (response, fallback) => {
    try {
      const body = await response.json();

      if (typeof body?.detail === "string") {
        return body.detail;
      }

      if (Array.isArray(body?.detail)) {
        return body.detail
          .map((item) => item?.msg || "Validation error")
          .join(", ");
      }
    } catch {
      // Ignore non-JSON response.
    }

    return fallback;
  };

  const loadSubmissions = useCallback(async () => {
    const headers = await authHeaders();

    const response = await fetch(`${API_BASE_URL}/submissions/my`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(
        await readError(
          response,
          `Unable to load submissions (${response.status}).`
        )
      );
    }

    const data = await response.json();
    setSubmissions(Array.isArray(data) ? data : []);
  }, [authHeaders]);

  const loadHackathons = useCallback(async () => {
    const headers = await authHeaders();

    const response = await fetch(`${API_BASE_URL}/hackathons`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(
        await readError(
          response,
          `Unable to load hackathons (${response.status}).`
        )
      );
    }

    const data = await response.json();
    setHackathons(Array.isArray(data) ? data : []);
  }, [authHeaders]);

  const loadTeams = useCallback(async () => {
    const headers = await authHeaders();

    const response = await fetch(`${API_BASE_URL}/teams/my`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(
        await readError(
          response,
          `Unable to load teams (${response.status}).`
        )
      );
    }

    const data = await response.json();
    setTeams(Array.isArray(data) ? data : []);
  }, [authHeaders]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([
        loadSubmissions(),
        loadHackathons(),
        loadTeams(),
      ]);
    } catch (err) {
      setError(err.message || "Unable to load submission data.");
    } finally {
      setLoading(false);
    }
  }, [loadSubmissions, loadHackathons, loadTeams]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const loadProblems = useCallback(
    async (hackathonId) => {
      if (!hackathonId) {
        setProblems([]);
        return;
      }

      setLoadingProblems(true);

      try {
        const headers = await authHeaders();


        const response = await fetch(
          `${API_BASE_URL}/hackathon/${encodeURIComponent(
            hackathonId
          )}/problem-statements`,
          {
            headers,
          }
        );

        if (!response.ok) {
          throw new Error(
            await readError(
              response,
              `Unable to load problem statements (${response.status}).`
            )
          );
        }

        const data = await response.json();
        setProblems(Array.isArray(data) ? data : []);
      } catch (err) {
        setProblems([]);
        setError(
          err.message ||
            "Unable to load problem statements for this hackathon."
        );
      } finally {
        setLoadingProblems(false);
      }
    },
    [authHeaders]
  );

  useEffect(() => {
    if (!form.hackathon_id) {
      setProblems([]);
      setForm((prev) => ({
        ...prev,
        problem_statement_id: "",
      }));
      return;
    }

    loadProblems(form.hackathon_id);
  }, [form.hackathon_id, loadProblems]);

  const availableTeams = useMemo(() => {
    return teams.filter((team) => {
      const memberCount = Number(team.member_count || 0);
      const maxMembers = Number(team.max_members || 0);

      return maxMembers === 0 || memberCount <= maxMembers;
    });
  }, [teams]);

  const selectedHackathon = useMemo(
    () =>
      hackathons.find(
        (item) => String(item.id) === String(form.hackathon_id)
      ),
    [hackathons, form.hackathon_id]
  );

  const selectedTeam = useMemo(
    () =>
      teams.find(
        (item) => String(item.id) === String(form.team_id)
      ),
    [teams, form.team_id]
  );

  const resetForm = () => {
    setForm({
      hackathon_id: "",
      team_id: "",
      problem_statement_id: "",
      project_name: "",
      description: "",
      tech_stack: "",
      github_url: "",
      demo_url: "",
    });

    setProblems([]);
    setError("");
    setSuccess("");
  };

  const closeForm = () => {
    if (submitting) return;

    setShowForm(false);
    resetForm();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.hackathon_id) {
      setError("Please select a hackathon.");
      return;
    }

    if (!form.team_id) {
      setError("Please select your team.");
      return;
    }

    if (!form.project_name.trim()) {
      setError("Please enter your project name.");
      return;
    }

    if (form.description.trim().length < 10) {
      setError("Project description must contain at least 10 characters.");
      return;
    }

    if (!form.github_url.trim()) {
      setError("GitHub repository URL is required.");
      return;
    }

    const techStack = form.tech_stack
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    setSubmitting(true);

    try {
      const headers = await authHeaders();

      const payload = {
        hackathon_id: form.hackathon_id,
        team_id: form.team_id,
        problem_statement_id:
          form.problem_statement_id || null,
        project_name: form.project_name.trim(),
        description: form.description.trim(),
        tech_stack: techStack,
        github_url: form.github_url.trim(),
        demo_url: form.demo_url.trim() || null,
      };

      const response = await fetch(`${API_BASE_URL}/submissions`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          await readError(
            response,
            `Submission failed (${response.status}).`
          )
        );
      }

      await response.json();

      setSuccess("Project submitted successfully! 🚀");

      await loadSubmissions();

      setTimeout(() => {
        setShowForm(false);
        resetForm();
      }, 700);
    } catch (err) {
      setError(err.message || "Unable to submit your project.");
    } finally {
      setSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: submissions.length,
      submitted: submissions.filter(
        (item) => item.status === "SUBMITTED"
      ).length,
      review: submissions.filter(
        (item) => item.status === "UNDER_REVIEW"
      ).length,
      accepted: submissions.filter(
        (item) => item.status === "ACCEPTED"
      ).length,
    };
  }, [submissions]);

  return (
    <div className="min-h-full bg-[#09090f] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
              <FileCode2 size={14} />
              Project Submissions
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              My Submissions
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-gray-400 sm:text-base">
              Submit your hackathon project and track its review status.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={loadAll}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-gray-200 transition hover:bg-white/[0.08] disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setShowForm(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-cyan-400"
            >
              <Plus size={18} />
              New Submission
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-300">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300">
            <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            ["Total", stats.total],
            ["Submitted", stats.submitted],
            ["Under Review", stats.review],
            ["Accepted", stats.accepted],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
            >
              <p className="text-sm text-gray-500">{label}</p>
              <p className="mt-2 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3 text-gray-400">
              <Loader2 size={20} className="animate-spin" />
              Loading your submissions...
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && submissions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
              <FileCode2 size={28} />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              No submissions yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              You haven't submitted a project yet. Pick a hackathon and
              submit your project to get started.
            </p>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-black hover:bg-cyan-400"
            >
              <Plus size={18} />
              Submit Project
            </button>
          </div>
        )}

        {/* Submission Cards */}
        {!loading && submissions.length > 0 && (
          <div className="space-y-4">
            {submissions.map((submission) => {
              const status = getStatus(submission.status);

              return (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-white/15"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-semibold text-white">
                          {submission.project_name}
                        </h2>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        Submitted on{" "}
                        {formatDate(submission.submitted_at)}
                      </p>

                      <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-400">
                        {submission.description}
                      </p>

                      {Array.isArray(submission.tech_stack) &&
                        submission.tech_stack.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {submission.tech_stack.map((tech) => (
                              <span
                                key={tech}
                                className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-gray-300"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      {submission.github_url && (
                        <a
                          href={submission.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-gray-200 hover:bg-white/[0.08]"
                        >
                          <Code2 size={16} />
                          GitHub
                          <ExternalLink size={13} />
                        </a>
                      )}

                      {submission.demo_url && (
                        <a
                          href={submission.demo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-300 hover:bg-cyan-400/15"
                        >
                          <ExternalLink size={16} />
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>

                  {submission.feedback && (
                    <div className="mt-5 rounded-xl border border-amber-400/10 bg-amber-400/[0.05] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                        Organizer Feedback
                      </p>

                      <p className="mt-2 text-sm leading-6 text-gray-300">
                        {submission.feedback}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submission Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#101019] shadow-2xl"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold">
                    Submit Your Project
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Make sure all project details are correct.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={submitting}
                  className="rounded-lg p-2 text-gray-500 hover:bg-white/5 hover:text-white disabled:opacity-50"
                >
                  <XCircle size={22} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-5">
                  {/* Hackathon + Team */}
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Hackathon" required>
                      <select
                        name="hackathon_id"
                        value={form.hackathon_id}
                        onChange={handleChange}
                        className={inputClass}
                        required
                      >
                        <option value="" className="bg-[#101019]">
                          Select hackathon
                        </option>

                        {hackathons.map((hackathon) => (
                          <option
                            key={hackathon.id}
                            value={hackathon.id}
                            className="bg-[#101019]"
                          >
                            {hackathon.name}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Team" required>
                      <select
                        name="team_id"
                        value={form.team_id}
                        onChange={handleChange}
                        className={inputClass}
                        required
                      >
                        <option value="" className="bg-[#101019]">
                          Select team
                        </option>

                        {availableTeams.map((team) => (
                          <option
                            key={team.id}
                            value={team.id}
                            className="bg-[#101019]"
                          >
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  {/* Selected team info */}
                  {selectedTeam && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4 text-sm">
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-400">
                        <span>
                          Members:{" "}
                          <strong className="text-white">
                            {selectedTeam.member_count ?? "—"}
                          </strong>
                        </span>

                        <span>
                          Max:{" "}
                          <strong className="text-white">
                            {selectedTeam.max_members ?? "—"}
                          </strong>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Problem Statement */}
                  <Field label="Problem Statement">
                    <select
                      name="problem_statement_id"
                      value={form.problem_statement_id}
                      onChange={handleChange}
                      disabled={
                        !form.hackathon_id || loadingProblems
                      }
                      className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <option value="" className="bg-[#101019]">
                        {loadingProblems
                          ? "Loading problem statements..."
                          : form.hackathon_id
                          ? "Select problem statement"
                          : "Select hackathon first"}
                      </option>

                      {problems.map((problem) => (
                        <option
                          key={problem.id}
                          value={problem.id}
                          className="bg-[#101019]"
                        >
                          {problem.title ||
                            problem.name ||
                            `Problem Statement ${problem.id}`}
                        </option>
                      ))}
                    </select>
                  </Field>

                  {/* Project Name */}
                  <Field label="Project Name" required>
                    <input
                      name="project_name"
                      value={form.project_name}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g. CampusForge AI"
                      minLength={2}
                      maxLength={255}
                      required
                    />
                  </Field>

                  {/* Description */}
                  <Field label="Project Description" required>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      className={`${inputClass} min-h-[130px] resize-y`}
                      placeholder="Explain what your project does, the problem it solves, and the main features..."
                      minLength={10}
                      required
                    />

                    <p className="mt-1 text-right text-xs text-gray-600">
                      {form.description.length} characters
                    </p>
                  </Field>

                  {/* Tech Stack */}
                  <Field label="Tech Stack">
                    <input
                      name="tech_stack"
                      value={form.tech_stack}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="React, FastAPI, PostgreSQL, Python"
                    />

                    <p className="mt-1 text-xs text-gray-600">
                      Separate technologies using commas.
                    </p>
                  </Field>

                  {/* URLs */}
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="GitHub Repository" required>
                      <div className="relative">
                        <Github
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                        />

                        <input
                          name="github_url"
                          value={form.github_url}
                          onChange={handleChange}
                          className={`${inputClass} pl-11`}
                          placeholder="https://github.com/username/project"
                          required
                        />
                      </div>
                    </Field>

                    <Field label="Live Demo URL">
                      <div className="relative">
                        <ExternalLink
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                        />

                        <input
                          name="demo_url"
                          value={form.demo_url}
                          onChange={handleChange}
                          className={`${inputClass} pl-11`}
                          placeholder="https://your-project.vercel.app"
                        />
                      </div>
                    </Field>
                  </div>

                  {/* Selected hackathon info */}
                  {selectedHackathon && (
                    <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.04] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                        Selected Hackathon
                      </p>

                      <p className="mt-2 font-semibold text-white">
                        {selectedHackathon.name}
                      </p>

                      {selectedHackathon.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                          {selectedHackathon.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Modal footer */}
                <div className="mt-7 flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={submitting}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-gray-300 hover:bg-white/[0.08] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={17} />
                        Submit Project
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}