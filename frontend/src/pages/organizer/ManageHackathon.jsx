
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Users,
  IndianRupee,
  Trophy,
  Pencil,
  RefreshCw,
  Save,
  CircleAlert,
  CheckCircle2,
  FileText,
  ClipboardCheck,
  BarChart3,
  Sparkles,
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
  if (!value) return 'Not specified'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not specified'

  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
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
    // Fall back to the HTTP status.
  }

  return `Request failed (${response.status}).`
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#101019] p-5">
      <div className="mb-3 grid size-10 place-items-center rounded-xl border border-cyan-300/10 bg-cyan-300/[0.06] text-cyan-300">
        <Icon size={20} />
      </div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-2 break-words text-base font-bold text-white">{value}</p>
    </div>
  )
}

export default function ManageHackathon() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getToken } = useAuth()

  const [hackathon, setHackathon] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('DRAFT')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadHackathon = useCallback(async () => {
    setLoading(true)
    setError('')
    setNotice('')

    try {
      const token = await getToken()
      if (!token) throw new Error('Your login session could not be verified.')

      const response = await fetch(
        `${API_BASE_URL}/hackathons/${encodeURIComponent(id)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      )

      if (!response.ok) throw new Error(await readError(response))

      const data = await response.json()
      setHackathon(data)
      setSelectedStatus(String(data.status || 'DRAFT').toUpperCase())
    } catch (err) {
      setError(err.message || 'Could not load this hackathon.')
    } finally {
      setLoading(false)
    }
  }, [getToken, id])

  useEffect(() => {
    loadHackathon()
  }, [loadHackathon])

  async function saveStatus() {
    if (!hackathon || selectedStatus === hackathon.status) return

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const token = await getToken()
      if (!token) throw new Error('Your login session could not be verified.')

      const response = await fetch(
        `${API_BASE_URL}/hackathons/${encodeURIComponent(id)}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ status: selectedStatus }),
        },
      )

      if (!response.ok) throw new Error(await readError(response))

      const updated = await response.json()
      setHackathon(updated)
      setSelectedStatus(String(updated.status || selectedStatus).toUpperCase())
      setNotice('Hackathon status updated successfully.')
    } catch (err) {
      setError(err.message || 'Could not update the hackathon.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center bg-[#09090f] text-gray-300">
        <div className="text-center">
          <RefreshCw size={26} className="mx-auto animate-spin text-cyan-300" />
          <p className="mt-4 text-sm">Loading hackathon workspace...</p>
        </div>
      </div>
    )
  }

  if (error && !hackathon) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-rose-300/20 bg-[#101019] p-7 text-white">
        <CircleAlert size={24} className="text-rose-300" />
        <h1 className="mt-4 text-xl font-bold">Hackathon unavailable</h1>
        <p className="mt-2 text-sm leading-6 text-gray-400">{error}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadHackathon}
            className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-[#09090f]"
          >
            Try again
          </button>
          <Link
            to="/organizer/hackathons"
            className="rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-300"
          >
            Back to hackathons
          </Link>
        </div>
      </div>
    )
  }

  const status = String(hackathon?.status || 'DRAFT').toUpperCase()

  return (
    <main className="min-h-screen space-y-7 bg-[#09090f] text-white">
      <Link
        to="/organizer/hackathons"
        className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-cyan-300"
      >
        <ArrowLeft size={17} />
        Back to My Hackathons
      </Link>

      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            <Sparkles size={15} />
            Event Control Center
          </div>

          <h1 className="si-glitch-title max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
            Manage <span className="text-cyan-300">Hackathon.</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">
            Review your event details and manage its current status.
          </p>
        </div>

        <button
          type="button"
          onClick={loadHackathon}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-300 hover:border-cyan-300/30 hover:text-cyan-200"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-300/20 bg-rose-300/[0.05] p-4 text-sm text-rose-200">
          <CircleAlert size={17} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {notice && (
        <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.05] p-4 text-sm text-emerald-200">
          <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
          {notice}
        </div>
      )}

      {hackathon && (
        <>
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#102332] via-[#101019] to-[#191129] p-6 sm:p-9">
            <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-cyan-400/[0.08] blur-3xl" />

            <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="min-w-0 flex-1">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${STATUS_STYLES[status] || STATUS_STYLES.DRAFT}`}>
                    {status}
                  </span>
                  <span className="text-xs text-gray-500">
                    Created {formatDate(hackathon.created_at)}
                  </span>
                </div>

                <h2 className="max-w-3xl break-words text-2xl font-black sm:text-4xl">
                  {hackathon.name}
                </h2>

                <p className="mt-4 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-gray-400">
                  {hackathon.description || 'No description has been added.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/organizer/hackathons/${id}/edit`)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-[#09090f] transition hover:bg-cyan-200"
              >
                <Pencil size={16} />
                Edit details
              </button>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              icon={CalendarDays}
              label="Event starts"
              value={formatDate(hackathon.event_start)}
            />
            <InfoCard
              icon={Clock3}
              label="Registration closes"
              value={formatDate(hackathon.registration_end)}
            />
            <InfoCard
              icon={Users}
              label="Team size"
              value={`${hackathon.min_team_size}–${hackathon.max_team_size} members`}
            />
            <InfoCard
              icon={IndianRupee}
              label="Registration fee"
              value={formatFee(hackathon.registration_amount)}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-white/10 bg-[#101019] p-5 sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300">
                  <Trophy size={20} />
                </div>
                <div>
                  <h2 className="font-bold">Event status</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Update how this event is presented.
                  </p>
                </div>
              </div>

              <label className="block text-sm font-medium text-gray-300">
                Status
                <select
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#09090f] px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="OPEN">Open for registration</option>
                  <option value="LIVE">Live</option>
                  <option value="ENDED">Ended</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </label>

              <button
                type="button"
                onClick={saveStatus}
                disabled={saving || selectedStatus === status}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-[#09090f] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save status'}
              </button>

              <p className="mt-4 text-xs leading-5 text-gray-600">
                Status changes are saved to the backend. Only publish the event
                when its details and schedule are ready.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#101019] p-5 sm:p-7">
              <h2 className="font-bold">Event management</h2>
              <p className="mt-1 text-xs text-gray-500">
                Open the related organizer workspace.
              </p>

              <div className="mt-5 space-y-3">
                {[
                  {
                    label: 'Edit event details',
                    detail: 'Update description, fees, team size, and schedule.',
                    to: `/organizer/hackathons/${id}/edit`,
                    icon: Pencil,
                  },
                  {
                    label: 'Problem statements',
                    detail: 'Prepare the challenges teams will solve.',
                    to: `/organizer/hackathons/${id}/problems`,
                    icon: FileText,
                  },
                  {
                    label: 'Participants',
                    detail: 'Review teams and registrations.',
                    to: `/organizer/participants?hackathon_id=${encodeURIComponent(id)}`,
                    icon: Users,
                  },
                  {
                    label: 'Submissions',
                    detail: 'Review projects submitted for this event.',
                    to: `/organizer/submissions?hackathon_id=${encodeURIComponent(id)}`,
                    icon: ClipboardCheck,
                  },
                  {
                    label: 'Analytics',
                    detail: 'Review event activity and performance.',
                    to: `/organizer/analytics?hackathon_id=${encodeURIComponent(id)}`,
                    icon: BarChart3,
                  },
                ].map(({ label, detail, to, icon: Icon }) => (
                  <Link
                    key={label}
                    to={to}
                    className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 transition hover:border-cyan-300/25 hover:bg-cyan-300/[0.04]"
                  >
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[0.04] text-cyan-300">
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="mt-1 text-xs leading-5 text-gray-500">{detail}</p>
                    </div>

                    <ArrowUpRight
                      size={16}
                      className="shrink-0 text-gray-600 transition group-hover:text-cyan-300"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  )
}
