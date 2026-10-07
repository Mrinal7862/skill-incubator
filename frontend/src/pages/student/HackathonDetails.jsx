
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Users,
  IndianRupee,
  Code2,
  RefreshCw,
  Sparkles,
  Wallet,
  CalendarCheck,
  Info,
} from 'lucide-react'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
).replace(/\/+$/, '')

function formatDate(value) {
  if (!value) return 'Not specified'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Not specified'

  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatFee(amount) {
  const value = Number(amount || 0)

  if (value === 0) return 'Free'

  return `₹${value.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-gray-100">
          {value}
        </p>
      </div>
    </div>
  )
}

export default function HackathonDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getToken } = useAuth()

  const [hackathon, setHackathon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDetails = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const token = await getToken()

      if (!token) {
        throw new Error('Your session could not be verified. Please sign in again.')
      }

      const response = await fetch(
        `${API_BASE_URL}/hackathons/${encodeURIComponent(id)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      )

      if (!response.ok) {
        let detail = ''

        try {
          const body = await response.json()
          detail = body.detail || ''
        } catch {
          // The server may return a non-JSON response.
        }

        if (response.status === 404) {
          throw new Error(
            detail || 'This hackathon was not found or is no longer available.',
          )
        }

        if (response.status === 401 || response.status === 403) {
          throw new Error(detail || 'You are not authorized to view this hackathon.')
        }

        throw new Error(detail || `Unable to load details (${response.status}).`)
      }

      const data = await response.json()
      setHackathon(data)
    } catch (err) {
      setError(err.message || 'Something went wrong while loading this hackathon.')
    } finally {
      setLoading(false)
    }
  }, [getToken, id])

  useEffect(() => {
    loadDetails()
  }, [loadDetails])

  const status = String(hackathon?.status || 'OPEN').toUpperCase()

  const statusClass = {
    OPEN: 'border-cyan-300/30 bg-cyan-300/10 text-cyan-200',
    LIVE: 'border-emerald-300/30 bg-emerald-300/10 text-emerald-200',
    DRAFT: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
    ENDED: 'border-white/10 bg-white/5 text-gray-400',
    CANCELLED: 'border-rose-300/30 bg-rose-300/10 text-rose-200',
  }[status] || 'border-white/10 bg-white/5 text-gray-300'

  if (loading) {
    return (
      <main className="grid min-h-[60vh] place-items-center bg-[#09090f] px-6 text-gray-300">
        <div className="text-center">
          <RefreshCw size={28} className="mx-auto animate-spin text-cyan-300" />
          <p className="mt-4 text-sm">Loading hackathon details...</p>
        </div>
      </main>
    )
  }

  if (error || !hackathon) {
    return (
      <main className="min-h-[60vh] bg-[#09090f] px-5 py-10 text-white sm:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#101019] p-8 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-400/10 text-rose-300">
            <Info size={26} />
          </div>

          <h1 className="mt-5 text-xl font-bold">
            Could not load hackathon
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            {error || 'This hackathon is not available.'}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/student/hackathons')}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-200 hover:bg-white/5"
            >
              Back to Explore
            </button>

            <button
              type="button"
              onClick={loadDetails}
              className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-[#09090f] hover:bg-cyan-200"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    )
  }

  const isFree = Number(hackathon.registration_amount || 0) === 0

  return (
    <main className="min-h-screen bg-[#09090f] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate('/student/hackathons')}
          className="mb-6 inline-flex items-center gap-2 rounded-lg text-sm text-gray-400 transition hover:text-cyan-300"
        >
          <ArrowLeft size={17} />
          Back to Explore Hackathons
        </button>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-[#101019]"
        >
          <div className="relative min-h-64 overflow-hidden border-b border-white/10 bg-gradient-to-br from-cyan-950 via-[#17152a] to-violet-950 sm:min-h-80">
            {hackathon.image_url && (
              <img
                src={hackathon.image_url}
                alt={hackathon.name}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#101019] via-[#09090f]/50 to-black/10" />

            {!hackathon.image_url && (
              <div className="absolute inset-0 grid place-items-center">
                <Code2 size={72} className="text-cyan-300/50" />
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-black/40 px-3 py-1.5 text-xs font-semibold text-cyan-200">
                  <Sparkles size={13} />
                  Skill Incubator
                </span>

                <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${statusClass}`}>
                  {status}
                </span>
              </div>

              <h1 className="max-w-4xl text-3xl font-black leading-tight sm:text-5xl">
                {hackathon.name}
              </h1>

              <p className="mt-4 flex items-center gap-2 text-sm text-gray-300">
                <CalendarDays size={16} className="text-cyan-300" />
                Event starts {formatDate(hackathon.event_start)}
              </p>
            </div>
          </div>

          <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_320px] lg:p-10">
            <section>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                About the event
              </p>

              <h2 className="mt-3 text-xl font-bold">Hackathon overview</h2>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-400">
                {hackathon.description || 'The organizer has not added a description yet.'}
              </p>

              <h2 className="mt-9 text-xl font-bold">Event information</h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={CalendarCheck}
                  label="Registration starts"
                  value={formatDate(hackathon.registration_start)}
                />

                <DetailItem
                  icon={Clock3}
                  label="Registration ends"
                  value={formatDate(hackathon.registration_end)}
                />

                <DetailItem
                  icon={CalendarDays}
                  label="Event starts"
                  value={formatDate(hackathon.event_start)}
                />

                <DetailItem
                  icon={CalendarDays}
                  label="Event ends"
                  value={formatDate(hackathon.event_end)}
                />

                <DetailItem
                  icon={Users}
                  label="Minimum team size"
                  value={`${hackathon.min_team_size} member(s)`}
                />

                <DetailItem
                  icon={Users}
                  label="Maximum team size"
                  value={`${hackathon.max_team_size} member(s)`}
                />
              </div>
            </section>

            <aside>
              <div className="rounded-2xl border border-white/10 bg-[#09090f] p-5 sm:p-6 lg:sticky lg:top-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Registration fee
                </p>

                <div className="mt-3 flex items-center gap-2">
                  {!isFree && <IndianRupee size={25} className="text-cyan-300" />}

                  <span className="text-3xl font-black text-white">
                    {formatFee(hackathon.registration_amount)}
                  </span>
                </div>

                <div className="my-6 h-px bg-white/10" />

                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300">
                    <Wallet size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">Team participation</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Team size must be between {hackathon.min_team_size} and {hackathon.max_team_size} members.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.025] p-4">
                  <p className="text-xs font-semibold text-gray-300">
                    Registration window
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    {formatDate(hackathon.registration_start)}
                  </p>
                  <p className="my-1 text-xs text-gray-600">to</p>
                  <p className="text-sm text-gray-400">
                    {formatDate(hackathon.registration_end)}
                  </p>
                </div>

                <button
                  type="button"
                  disabled
                  title="Registration flow will be added in the next step"
                  className="mt-5 w-full cursor-not-allowed rounded-xl bg-cyan-300/40 px-4 py-3.5 text-sm font-bold text-[#09090f]/70"
                >
                  Registration coming next
                </button>

                <p className="mt-3 text-center text-xs leading-5 text-gray-600">
                  Registration functionality has not been enabled yet.
                </p>
              </div>
            </aside>
          </div>
        </motion.section>
      </div>
    </main>
  )
}
