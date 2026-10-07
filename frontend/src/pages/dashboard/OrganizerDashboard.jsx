
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import {
  Trophy,
  BarChart3,
  Users,
  ClipboardCheck,
  Plus,
  ArrowUpRight,
  ArrowRight,
  CalendarDays,
  Clock3,
  RefreshCw,
  Sparkles,
  Activity,
  Rocket,
  CircleAlert,
  Radio,
  FileText,
} from 'lucide-react'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
).replace(/\/+$/, '')

const STATUS_STYLES = {
  DRAFT: 'border-amber-300/25 bg-amber-300/10 text-amber-200',
  OPEN: 'border-cyan-300/25 bg-cyan-300/10 text-cyan-200',
  LIVE: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-200',
  ENDED: 'border-white/10 bg-white/5 text-gray-400',
  CANCELLED: 'border-rose-300/25 bg-rose-300/10 text-rose-200',
}

function formatDate(value) {
  if (!value) return 'Date not announced'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date not announced'

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}


function StatCard({ label, value, description, icon: Icon, accent, loading }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#101019] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20">
      <div
        className={`pointer-events-none absolute -right-8 -top-8 size-28 rounded-full opacity-10 blur-2xl ${accent}`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="mt-4 text-3xl font-black tracking-tight text-white">
            {loading ? (
              <span className="inline-block h-9 w-12 animate-pulse rounded bg-white/10" />
            ) : (
              value
            )}
          </p>
          <p className="mt-2 text-xs leading-5 text-gray-500">{description}</p>
        </div>

        <div className={`grid size-11 shrink-0 place-items-center rounded-xl border border-white/10 ${accent}`}>
          <Icon size={21} />
        </div>
      </div>
    </article>
  )
}

function EmptyEvents() {
  return (
    <div className="px-5 py-12 text-center sm:px-8">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-cyan-300">
        <Trophy size={25} />
      </div>

      <h3 className="mt-4 text-base font-bold text-white">
        Your first event starts here
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
        Create your first hackathon to bring students, teams, and new ideas
        together.
      </p>

      <Link
        to="/organizer/hackathons"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-[#09090f] transition hover:bg-cyan-200"
      >
        <Plus size={16} />
        Get started
      </Link>
    </div>
  )
}

export default function OrganizerDashboard() {
  const { getToken } = useAuth()
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadHackathons = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const token = await getToken()

      if (!token) {
        throw new Error('Your login session could not be verified.')
      }

      const response = await fetch(`${API_BASE_URL}/hackathons/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        let message = `Could not load your hackathons (${response.status}).`

        try {
          const body = await response.json()
          if (typeof body.detail === 'string') message = body.detail
        } catch {
          // Keep the default error message for non-JSON responses.
        }

        throw new Error(message)
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error('The backend returned an unexpected response.')
      }

      setHackathons(data)
    } catch (err) {
      setError(err.message || 'Unable to load your organizer data.')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    loadHackathons()
  }, [loadHackathons])

  const countStatus = (status) =>
    hackathons.filter(
      (hackathon) => String(hackathon.status).toUpperCase() === status,
    ).length

  const stats = [
    {
      label: 'Hackathons Created',
      value: hackathons.length,
      description: 'Events in your workspace',
      icon: Trophy,
      accent: 'bg-cyan-400/10 text-cyan-300',
    },
    {
      label: 'Open for Registration',
      value: countStatus('OPEN'),
      description: 'Accepting registrations',
      icon: Users,
      accent: 'bg-emerald-400/10 text-emerald-300',
    },
    {
      label: 'Live Events',
      value: countStatus('LIVE'),
      description: 'Currently in progress',
      icon: Radio,
      accent: 'bg-violet-400/10 text-violet-300',
    },
    {
      label: 'Drafts',
      value: countStatus('DRAFT'),
      description: 'Still being prepared',
      icon: FileText,
      accent: 'bg-amber-400/10 text-amber-300',
    },
  ]

  const recentHackathons = [...hackathons]
    .sort(
      (a, b) =>
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime(),
    )
    .slice(0, 5)

  return (
    <main className="min-h-screen space-y-8 bg-[#09090f] text-white">
      {/* Dashboard heading */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
            <Sparkles size={15} />
            Organizer Workspace
          </div>

          <h1 className="si-glitch-title text-3xl font-black tracking-tight sm:text-4xl">
            Control <span className="text-cyan-300">Center.</span>
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
            Create events, coordinate participants, and turn promising ideas
            into real projects.
          </p>
        </div>

        <button
          type="button"
          onClick={loadHackathons}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-gray-300 transition hover:border-cyan-300/30 hover:text-cyan-200 disabled:opacity-50 sm:self-center"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh data
        </button>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-[#11222f] via-[#101019] to-[#19112a] p-6 sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-cyan-400/[0.09] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-1/3 size-64 rounded-full bg-violet-500/[0.09] blur-3xl" />

        <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-black/20 px-3 py-1.5 text-xs font-medium text-cyan-200">
              <Activity size={14} />
              Your innovation workspace
            </span>

            <h2 className="mt-5 text-2xl font-black leading-tight sm:text-4xl">
              Make innovation
              <span className="block text-cyan-300">happen.</span>
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-7 text-gray-400">
              Everything you need to organize great hackathons—from publishing
              your challenge to evaluating the projects students build.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/organizer/hackathons"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-[#09090f] transition hover:bg-cyan-200"
              >
                <Plus size={17} />
                Manage hackathons
                <ArrowUpRight size={16} />
              </Link>

              <Link
                to="/organizer/participants"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                <Users size={17} />
                Participants
              </Link>
            </div>
          </div>

          <div className="relative hidden shrink-0 lg:block">
            <div className="grid size-36 place-items-center rounded-[2rem] border border-cyan-300/20 bg-black/20 shadow-[0_0_60px_-20px_rgba(34,211,238,0.35)]">
              <div className="grid size-24 place-items-center rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-300/20 to-violet-400/10 text-cyan-200">
                <Rocket size={45} strokeWidth={1.4} />
              </div>
            </div>
            <span className="absolute -right-4 -top-3 rounded-lg border border-white/10 bg-[#101019] px-3 py-2 text-[10px] font-bold tracking-widest text-cyan-200">
              BUILD. SHIP. REPEAT.
            </span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Event overview</h2>
            <p className="mt-1 text-xs text-gray-500">
              Based on your hackathons in the backend.
            </p>
          </div>
          <span className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-gray-500">
            Live data
          </span>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.05] p-4 text-sm text-rose-200"
          >
            <CircleAlert size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Could not load organizer data</p>
              <p className="mt-1 text-rose-200/70">{error}</p>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} loading={loading} />
          ))}
        </div>
      </section>

      {/* Events and quick actions */}
      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#101019]">
          <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6">
            <div>
              <h2 className="font-bold">Your hackathons</h2>
              <p className="mt-1 text-xs text-gray-500">
                The latest events you created.
              </p>
            </div>

            <Link
              to="/organizer/hackathons"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 transition hover:text-cyan-200"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4 p-5 sm:p-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex animate-pulse gap-3">
                  <div className="size-11 rounded-xl bg-white/[0.06]" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-1/2 rounded bg-white/[0.07]" />
                    <div className="h-3 w-1/3 rounded bg-white/[0.04]" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentHackathons.length === 0 ? (
            <EmptyEvents />
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {recentHackathons.map((hackathon) => {
                const status = String(hackathon.status || 'DRAFT').toUpperCase()

                return (
                  <div
                    key={hackathon.id}
                    className="group flex flex-col justify-between gap-4 p-5 transition hover:bg-white/[0.025] sm:flex-row sm:items-center sm:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-cyan-300/10 bg-cyan-300/[0.06] text-cyan-300">
                        <Trophy size={20} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-gray-100">
                          {hackathon.name}
                        </h3>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                          <CalendarDays size={13} />
                          Event: {formatDate(hackathon.event_start)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider ${STATUS_STYLES[status] || STATUS_STYLES.DRAFT}`}>
                        {status}
                      </span>

                      <Link
                        to="/organizer/hackathons"
                        aria-label={`Manage ${hackathon.name}`}
                        className="grid size-9 place-items-center rounded-lg border border-white/10 text-gray-400 transition hover:border-cyan-300/30 hover:text-cyan-200"
                      >
                        <ArrowUpRight size={17} />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-[#101019] p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-violet-400/10 text-violet-300">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="font-bold">Quick actions</h2>
                <p className="mt-1 text-xs text-gray-500">Jump into your workflow.</p>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to="/organizer/hackathons"
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-cyan-300/25 hover:bg-cyan-300/[0.04]"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300">
                  <Plus size={19} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">Create or manage hackathons</span>
                  <span className="mt-1 block text-xs text-gray-500">Set up and publish events</span>
                </span>
                <ArrowRight size={17} className="text-gray-600 transition group-hover:translate-x-1 group-hover:text-cyan-300" />
              </Link>

              <Link
                to="/organizer/participants"
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-cyan-300/25 hover:bg-cyan-300/[0.04]"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-300/10 text-violet-300">
                  <Users size={19} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">Participants</span>
                  <span className="mt-1 block text-xs text-gray-500">Review event participation</span>
                </span>
                <ArrowRight size={17} className="text-gray-600 transition group-hover:translate-x-1 group-hover:text-cyan-300" />
              </Link>

              <Link
                to="/organizer/submissions"
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-cyan-300/25 hover:bg-cyan-300/[0.04]"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300">
                  <ClipboardCheck size={19} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">Project submissions</span>
                  <span className="mt-1 block text-xs text-gray-500">Review submitted projects</span>
                </span>
                <ArrowRight size={17} className="text-gray-600 transition group-hover:translate-x-1 group-hover:text-cyan-300" />
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-cyan-300/10 bg-gradient-to-br from-cyan-300/[0.06] to-violet-400/[0.04] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.07] text-cyan-300">
                <ClipboardCheck size={20} />
              </div>
              <div>
                <h2 className="font-bold">Evaluation & results</h2>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Keep submissions, judging, and final results organized
                  throughout your event.
                </p>
                <Link
                  to="/organizer/evaluation"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  Open evaluation
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>

          </section>
        </div>

        <motion.button
          type="button"
          onClick={() => navigate("/organizer/results")}
          className="group rounded-2xl border border-white/10 bg-[#101522] p-5 text-left transition hover:border-amber-300/30 hover:bg-[#151b2a]"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-amber-300">
              <Trophy size={21} />
            </div>
            <ArrowUpRight
              size={17}
              className="text-slate-500 transition group-hover:text-amber-300"
            />
          </div>

          <h3 className="mt-4 font-bold text-white">Results & Rankings</h3>

          <p className="mt-2 text-sm leading-5 text-slate-400">
            View project rankings, manage winners, and publish hackathon results.
          </p>
        </motion.button>


        <motion.button
          type="button"
          onClick={() => navigate("/organizer/analytics")}
          className="group rounded-2xl border border-white/10 bg-[#101522] p-5 text-left transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-[#151b2a]"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-300">
              <BarChart3 size={21} />
            </div>

            <ArrowUpRight
              size={17}
              className="text-slate-500 transition group-hover:text-cyan-300"
            />
          </div>

          <h3 className="mt-4 font-bold text-white">Analytics & Reports</h3>

          <p className="mt-2 text-sm leading-5 text-slate-400">
            Track registrations, project submissions, evaluation progress, and team performance.
          </p>
        </motion.button>


      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-5 text-xs text-gray-600">
        <span>Skill Incubator · Organizer Workspace</span>
        <span className="flex items-center gap-2">
          <Clock3 size={13} />
          Keep building something meaningful.
        </span>
      </footer>
    </main>
  )
}
