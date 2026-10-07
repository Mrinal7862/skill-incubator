
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import {
  Plus,
  Search,
  Trophy,
  CalendarDays,
  Users,
  IndianRupee,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  CircleAlert,
  SearchX,
  Clock3,
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

function formatFee(value) {
  const amount = Number(value || 0)

  if (amount === 0) return 'Free'

  return `₹${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`
}

async function readError(response) {
  try {
    const body = await response.json()

    if (typeof body.detail === 'string') return body.detail

    if (Array.isArray(body.detail)) {
      return body.detail.map((item) => item.msg).join(', ')
    }
  } catch {
    // Keep the fallback for non-JSON responses.
  }

  return `Request failed (${response.status}).`
}

function StatusBadge({ status }) {
  const value = String(status || 'DRAFT').toUpperCase()

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider ${
        STATUS_STYLES[value] || STATUS_STYLES.DRAFT
      }`}
    >
      {value}
    </span>
  )
}

function HackathonCard({ hackathon, onManage }) {
  const status = String(hackathon.status || 'DRAFT').toUpperCase()

  return (
    <article className="si-glitch-card group overflow-hidden rounded-2xl border border-white/10 bg-[#101019] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30">
      <div className="relative flex h-40 items-center justify-center overflow-hidden border-b border-white/10 bg-gradient-to-br from-cyan-950 via-[#17152a] to-violet-950">
        {hackathon.image_url ? (
          <img
            src={hackathon.image_url}
            alt={hackathon.name}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <Trophy size={42} className="text-cyan-300/65" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#101019]/90 to-transparent" />

        <div className="absolute left-4 top-4">
          <StatusBadge status={status} />
        </div>

        <div className="absolute right-4 top-4 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
          {formatFee(hackathon.registration_amount)}
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
            Skill Incubator
          </p>
          <h2 className="mt-1 line-clamp-2 text-xl font-bold text-white">
            {hackathon.name}
          </h2>
        </div>
      </div>

      <div className="p-5">
        <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-gray-400">
          {hackathon.description || 'No description has been added yet.'}
        </p>

        <div className="my-5 space-y-3 border-y border-white/[0.07] py-4">
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <CalendarDays size={16} className="shrink-0 text-cyan-300" />
            <span>Starts {formatDate(hackathon.event_start)}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-400">
            <Clock3 size={16} className="shrink-0 text-cyan-300" />
            <span>Registration ends {formatDate(hackathon.registration_end)}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-400">
            <Users size={16} className="shrink-0 text-cyan-300" />
            <span>
              Team size: {hackathon.min_team_size}–{hackathon.max_team_size}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-400">
            <IndianRupee size={16} className="shrink-0 text-cyan-300" />
            <span>Registration fee: {formatFee(hackathon.registration_amount)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-gray-600">
            Created {formatDate(hackathon.created_at)}
          </span>

          <button
            type="button"
            onClick={() => onManage(hackathon.id)}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/[0.07] px-3 py-2.5 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-300/15"
          >
            Manage
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </article>
  )
}

export default function MyHackathons() {
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const [hackathons, setHackathons] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
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
        throw new Error(await readError(response))
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error('The backend returned an unexpected response.')
      }

      setHackathons(data)
    } catch (err) {
      setError(err.message || 'Could not load your hackathons.')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    loadHackathons()
  }, [loadHackathons])

  const counts = useMemo(() => {
    return {
      ALL: hackathons.length,
      DRAFT: hackathons.filter((item) => item.status === 'DRAFT').length,
      OPEN: hackathons.filter((item) => item.status === 'OPEN').length,
      LIVE: hackathons.filter((item) => item.status === 'LIVE').length,
      ENDED: hackathons.filter((item) => item.status === 'ENDED').length,
    }
  }, [hackathons])

  const filteredHackathons = useMemo(() => {
    const query = search.trim().toLowerCase()

    return hackathons.filter((item) => {
      const text = `${item.name || ''} ${item.description || ''}`.toLowerCase()
      const matchesSearch = !query || text.includes(query)
      const matchesStatus =
        statusFilter === 'ALL' || item.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [hackathons, search, statusFilter])

  function handleManage(id) {
    navigate(`/organizer/hackathons/${id}/manage`)
  }

  return (
    <main className="min-h-screen space-y-7 bg-[#09090f] text-white">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            <Sparkles size={15} />
            Organizer Workspace
          </div>

          <h1 className="si-glitch-title text-3xl font-black tracking-tight sm:text-4xl">
            My <span className="text-cyan-300">Hackathons</span>
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
            Create events, track their status, and manage every challenge from
            one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadHackathons}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-300 transition hover:border-cyan-300/30 hover:text-cyan-200 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <Link
            to="/organizer/hackathons/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-[#09090f] transition hover:bg-cyan-200"
          >
            <Plus size={17} />
            Create hackathon
          </Link>
        </div>
      </header>

      <section className="grid gap-3 grid-cols-2 xl:grid-cols-5">
        {[
          { key: 'ALL', label: 'All events' },
          { key: 'DRAFT', label: 'Drafts' },
          { key: 'OPEN', label: 'Open' },
          { key: 'LIVE', label: 'Live' },
          { key: 'ENDED', label: 'Ended' },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setStatusFilter(item.key)}
            className={`rounded-2xl border p-4 text-left transition ${
              statusFilter === item.key
                ? 'border-cyan-300/30 bg-cyan-300/[0.08]'
                : 'border-white/10 bg-[#101019] hover:border-white/20'
            }`}
          >
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className="mt-2 text-2xl font-black">
              {loading ? '—' : counts[item.key]}
            </p>
          </button>
        ))}
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#101019] p-3 sm:flex-row sm:items-center sm:p-4">
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search your hackathons..."
            className="w-full rounded-xl border border-white/10 bg-[#09090f] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-cyan-300/40"
          />
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-rose-300/20 bg-rose-300/[0.05] p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="flex items-start gap-2 text-sm text-rose-200">
            <CircleAlert size={18} className="mt-0.5 shrink-0" />
            {error}
          </p>

          <button
            type="button"
            onClick={loadHackathons}
            className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-[#101019]"
            >
              <div className="h-40 bg-white/[0.04]" />
              <div className="space-y-4 p-5">
                <div className="h-5 w-2/3 rounded bg-white/[0.06]" />
                <div className="h-4 rounded bg-white/[0.04]" />
                <div className="h-4 w-4/5 rounded bg-white/[0.04]" />
                <div className="h-10 rounded bg-white/[0.04]" />
              </div>
            </div>
          ))}
        </div>
      ) : !error && filteredHackathons.length > 0 ? (
        <>
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-white">{filteredHackathons.length}</span>
            {' '}hackathon{filteredHackathons.length === 1 ? '' : 's'}
          </p>

          <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredHackathons.map((hackathon) => (
              <HackathonCard
                key={hackathon.id}
                hackathon={hackathon}
                onManage={handleManage}
              />
            ))}
          </div>
        </>
      ) : !error ? (
        <section className="rounded-3xl border border-dashed border-white/15 bg-white/[0.015] px-5 py-14 text-center sm:py-20">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-cyan-300">
            <SearchX size={27} />
          </div>

          <h2 className="mt-5 text-xl font-bold">
            {hackathons.length === 0
              ? 'No hackathons created yet'
              : 'No matching hackathons'}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            {hackathons.length === 0
              ? 'Start by creating your first event. Once it is saved, it will appear here.'
              : 'Try another search or switch to a different status filter.'}
          </p>

          {hackathons.length === 0 ? (
            <Link
              to="/organizer/hackathons/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-[#09090f] transition hover:bg-cyan-200"
            >
              <Plus size={17} />
              Create first hackathon
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setStatusFilter('ALL')
              }}
              className="mt-5 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
            >
              Clear filters
            </button>
          )}
        </section>
      ) : null}
    </main>
  )
}
