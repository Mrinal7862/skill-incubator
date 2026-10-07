
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import { motion } from 'framer-motion'
import {
  Search,
  CalendarDays,
  Users,
  IndianRupee,
  ArrowUpRight,
  SlidersHorizontal,
  RefreshCw,
  Code2,
  Sparkles,
  Clock3,
  Trophy,
  SearchX,
} from 'lucide-react'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
).replace(/\/+$/, '')

const formatDate = (value) => {
  if (!value) return 'Date to be announced'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date to be announced'

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const formatFee = (amount) => {
  const value = Number(amount || 0)

  if (value === 0) return 'Free'

  return `₹${value.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`
}

const statusStyles = {
  OPEN: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-300',
  LIVE: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
  ENDED: 'border-white/10 bg-white/5 text-gray-400',
  DRAFT: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
  CANCELLED: 'border-rose-400/25 bg-rose-400/10 text-rose-300',
}

function HackathonCard({ hackathon, index, onOpen }) {
  const status = String(hackathon.status || 'OPEN').toUpperCase()
  const isFree = Number(hackathon.registration_amount || 0) === 0

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.3) }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#101019] transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_16px_50px_-25px_rgba(34,211,238,0.3)]"
    >
      <div className="relative h-44 overflow-hidden border-b border-white/10 bg-gradient-to-br from-cyan-950 via-[#17152a] to-violet-950">
        {hackathon.image_url ? (
          <img
            src={hackathon.image_url}
            alt={hackathon.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-t from-[#101019] via-transparent to-black/10" />

        {!hackathon.image_url && (
          <div className="absolute inset-0 grid place-items-center">
            <Code2 size={48} className="text-cyan-300/70" />
          </div>
        )}

        <span
          className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-[10px] font-bold tracking-[0.16em] ${
            statusStyles[status] || statusStyles.OPEN
          }`}
        >
          {status.replace('_', ' ')}
        </span>

        <span
          className={`absolute right-4 top-4 rounded-full border px-3 py-1 text-xs font-semibold ${
            isFree
              ? 'border-emerald-400/30 bg-black/60 text-emerald-300'
              : 'border-white/15 bg-black/60 text-white'
          }`}
        >
          {formatFee(hackathon.registration_amount)}
        </span>

        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">
            Skill Incubator
          </p>
          <h2 className="mt-1 line-clamp-2 text-xl font-bold text-white">
            {hackathon.name}
          </h2>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="mb-5 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-gray-400">
          {hackathon.description || 'Build something meaningful. Collaborate with other innovators and put your skills to the test.'}
        </p>

        <div className="mb-5 space-y-3 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <CalendarDays size={16} className="shrink-0 text-cyan-300" />
            <span>
              Event: {formatDate(hackathon.event_start)}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Clock3 size={16} className="shrink-0 text-cyan-300" />
            <span>
              Registration ends: {formatDate(hackathon.registration_end)}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Users size={16} className="shrink-0 text-cyan-300" />
            <span>
              Team size: {hackathon.min_team_size}–{hackathon.max_team_size} members
            </span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
              Registration fee
            </p>
            <p className="mt-1 flex items-center gap-1 font-semibold text-white">
              {!isFree && <IndianRupee size={15} />}
              {isFree ? 'Free' : Number(hackathon.registration_amount).toLocaleString('en-IN')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpen(hackathon.id)}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300 hover:bg-cyan-400/20"
          >
            View details
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </motion.article>
  )
}

export default function Hackathons() {
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const [hackathons, setHackathons] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadHackathons = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const token = await getToken()

      if (!token) {
        throw new Error('Your session could not be verified. Please sign in again.')
      }

      const response = await fetch(`${API_BASE_URL}/hackathons`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        let detail = ''

        try {
          const body = await response.json()
          detail = body.detail || ''
        } catch {
          // The response may not contain JSON.
        }

        if (response.status === 401 || response.status === 403) {
          throw new Error(detail || 'Your session is not authorized. Please sign in again.')
        }

        if (response.status === 404) {
          throw new Error('The hackathon listing API was not found. Check the backend route.')
        }

        throw new Error(detail || `Could not load hackathons (${response.status}).`)
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error('The server returned an unexpected hackathon list.')
      }

      setHackathons(data)
    } catch (err) {
      setError(err.message || 'Unable to load hackathons right now.')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    loadHackathons()
  }, [loadHackathons])

  const filteredHackathons = useMemo(() => {
    const query = search.trim().toLowerCase()

    return hackathons.filter((hackathon) => {
      const matchesSearch =
        !query ||
        `${hackathon.name || ''} ${hackathon.description || ''}`
          .toLowerCase()
          .includes(query)

      const amount = Number(hackathon.registration_amount || 0)
      const matchesFee =
        filter === 'ALL' ||
        (filter === 'FREE' && amount === 0) ||
        (filter === 'PAID' && amount > 0)

      return matchesSearch && matchesFee
    })
  }, [hackathons, search, filter])

  const openDetails = (id) => {
    navigate(`/student/hackathons/${id}`)
  }

  return (
    <main className="min-h-screen bg-[#09090f] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.23em] text-cyan-300">
            <Sparkles size={15} />
            Discover opportunities
          </div>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Explore <span className="text-cyan-300">Hackathons</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
                Find your next challenge, team up with innovators, and turn
                your ideas into something real.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="grid size-10 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <Trophy size={20} />
              </div>
              <div>
                <p className="text-xl font-bold">
                  {loading ? '—' : hackathons.length}
                </p>
                <p className="text-xs text-gray-500">Available events</p>
              </div>
            </div>
          </div>
        </motion.header>

        <section className="mb-8 rounded-2xl border border-white/10 bg-[#101019] p-3 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by hackathon name or description..."
                className="w-full rounded-xl border border-white/10 bg-[#09090f] py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-cyan-400/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 flex items-center gap-2 px-2 text-xs text-gray-500">
                <SlidersHorizontal size={15} />
                Fee
              </span>

              {[
                { value: 'ALL', label: 'All' },
                { value: 'FREE', label: 'Free' },
                { value: 'PAID', label: 'Paid' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    filter === option.value
                      ? 'border-cyan-300/50 bg-cyan-300/10 text-cyan-200'
                      : 'border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}

              <button
                type="button"
                onClick={loadHackathons}
                disabled={loading}
                title="Refresh hackathons"
                className="grid size-11 place-items-center rounded-xl border border-white/10 text-gray-400 transition hover:border-cyan-300/40 hover:text-cyan-200 disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </section>

        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-[#101019]"
              >
                <div className="h-44 bg-white/[0.04]" />
                <div className="space-y-4 p-5">
                  <div className="h-5 w-2/3 rounded bg-white/[0.07]" />
                  <div className="h-4 rounded bg-white/[0.05]" />
                  <div className="h-4 w-4/5 rounded bg-white/[0.05]" />
                  <div className="h-10 rounded bg-white/[0.05]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.05] px-6 py-12 text-center">
            <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-rose-400/10 text-rose-300">
              <RefreshCw size={22} />
            </div>
            <h2 className="text-lg font-bold">Could not load hackathons</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-400">
              {error}
            </p>
            <button
              type="button"
              onClick={loadHackathons}
              className="mt-5 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-[#09090f] transition hover:bg-cyan-200"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredHackathons.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-gray-400">
                Showing <span className="font-semibold text-white">{filteredHackathons.length}</span>
                {' '}hackathon{filteredHackathons.length === 1 ? '' : 's'}
              </p>
            </div>

            <div className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredHackathons.map((hackathon, index) => (
                <HackathonCard
                  key={hackathon.id}
                  hackathon={hackathon}
                  index={index}
                  onOpen={openDetails}
                />
              ))}
            </div>
          </>
        )}

        {!loading && !error && filteredHackathons.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-white/[0.04] text-gray-400">
              <SearchX size={26} />
            </div>

            <h2 className="text-lg font-bold">
              {hackathons.length === 0
                ? 'No hackathons published yet'
                : 'No matching hackathons'}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {hackathons.length === 0
                ? 'Published hackathons will appear here when organizers make them available.'
                : 'Try another search or change the fee filter.'}
            </p>

            {hackathons.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setFilter('ALL')
                }}
                className="mt-5 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
