import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@clerk/react'

import {
  ArrowUpRight,
  CalendarDays,
  UsersRound,
  Ticket,
  CheckCircle2,
  Clock3,
  XCircle,
  FileText,
  CircleDollarSign,
  Trophy,
  RefreshCw,
} from 'lucide-react'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8000/api/v1'

const STATUS_CONFIG = {
  CONFIRMED: {
    label: 'Confirmed',
    icon: CheckCircle2,
    classes:
      'border-emerald-300/20 bg-emerald-300/10 text-emerald-300',
  },

  PENDING: {
    label: 'Pending',
    icon: Clock3,
    classes:
      'border-amber-300/20 bg-amber-300/10 text-amber-300',
  },

  WAITLISTED: {
    label: 'Waitlisted',
    icon: Clock3,
    classes:
      'border-violet-300/20 bg-violet-300/10 text-violet-300',
  },

  REJECTED: {
    label: 'Rejected',
    icon: XCircle,
    classes:
      'border-rose-300/20 bg-rose-300/10 text-rose-300',
  },

  CANCELLED: {
    label: 'Cancelled',
    icon: XCircle,
    classes:
      'border-slate-300/20 bg-slate-300/5 text-slate-400',
  },
}

function formatDate(value) {
  if (!value) return 'Date not available'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date not available'
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function StatusBadge({ status }) {
  const config =
    STATUS_CONFIG[status] || STATUS_CONFIG.PENDING

  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${config.classes}`}
    >
      <Icon size={13} />
      {config.label}
    </span>
  )
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0 text-cyan-300">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium leading-5 text-slate-200">
          {value || 'Not available'}
        </p>
      </div>
    </div>
  )
}

function RegistrationCard({ registration, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101522] transition hover:border-cyan-300/25"
    >
      {/* Header */}
      <div className="border-b border-white/[0.07] bg-gradient-to-r from-cyan-300/[0.05] to-violet-400/[0.04] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.08] text-cyan-300">
              <Trophy size={22} />
            </div>

            <div className="min-w-0">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-cyan-300">
                Hackathon
              </p>

              <h3 className="text-xl font-bold text-white">
                {registration.hackathon_name ||
                  'Unnamed Hackathon'}
              </h3>
            </div>
          </div>

          <StatusBadge status={registration.status} />
        </div>
      </div>

      {/* Details */}
      <div className="p-5 sm:p-6">

        {/* Main details */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            icon={FileText}
            label="PS ID"
            value={
              registration.problem_statement_id ||
              'Not assigned'
            }
          />

          <InfoItem
            icon={FileText}
            label="Problem Statement"
            value={
              registration.problem_statement_title ||
              'Not selected'
            }
          />

          <InfoItem
            icon={UsersRound}
            label="Team"
            value={
              registration.team_name ||
              'No team assigned'
            }
          />

          <InfoItem
            icon={CalendarDays}
            label="Registered On"
            value={formatDate(
              registration.registered_at
            )}
          />
        </div>

        {/* Registration / payment */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">

          <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Ticket
                size={14}
                className="text-violet-300"
              />
              Registration ID
            </div>

            <p className="mt-2 break-all text-sm font-semibold text-slate-200">
              {registration.id}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <CircleDollarSign
                size={14}
                className="text-emerald-300"
              />
              Payment
            </div>

            <p className="mt-2 text-sm font-semibold text-slate-200">
              {registration.payment_status === 'FREE'
                ? 'Free'
                : registration.payment_status === 'PAID'
                  ? 'Paid'
                  : 'Payment Pending'}
            </p>
          </div>
        </div>

        {/* Student info */}
        <div className="mt-6 rounded-xl border border-white/[0.07] bg-black/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Participant
          </p>

          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-[10px] text-slate-600">
                Name
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-200">
                {registration.name || 'Not available'}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-slate-600">
                Email
              </p>

              <p className="mt-1 break-all text-sm font-semibold text-slate-200">
                {registration.email || 'Not available'}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-slate-600">
                Student ID
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-200">
                {registration.student_id ||
                  'Not available'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">
            Hackathon ID:{' '}
            <span className="text-slate-400">
              {registration.hackathon_id}
            </span>
          </div>

          <Link
            to={`/student/hackathons/${registration.hackathon_id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/5 px-4 py-2.5 text-xs font-bold text-cyan-300 transition hover:bg-cyan-300/10"
          >
            View Hackathon
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

export default function MyRegistrations() {
  const { getToken } = useAuth()

  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadRegistrations() {
    try {
      setLoading(true)
      setError('')

      const token = await getToken()

      if (!token) {
        throw new Error('Login session expired.')
      }

      const response = await fetch(
        `${API_BASE_URL}/registrations/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          `Failed to load registrations (${response.status})`
        )
      }

      const data = await response.json()

      setRegistrations(
        Array.isArray(data) ? data : []
      )
    } catch (err) {
      console.error(
        'Failed to load registrations:',
        err
      )

      setError(
        err.message ||
          'Failed to load your hackathons.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRegistrations()
  }, [])

  return (
    <div className="min-h-screen bg-[#080b14] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-7">

        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-[#111a2b] via-[#101523] to-[#10101f] p-6 sm:p-8"
        >
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.17em] text-cyan-300">
                <Ticket size={14} />
                Student Workspace
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Your{' '}
                <span className="text-cyan-300">
                  Hackathons
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                All your registered hackathons, selected
                problem statements, team information, and
                registration details in one place.
              </p>
            </div>

            <button
              type="button"
              onClick={loadRegistrations}
              disabled={loading}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 disabled:cursor-wait disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  loading ? 'animate-spin' : ''
                }
              />
              Refresh
            </button>
          </div>
        </motion.section>

        {/* Loading */}
        {loading && (
          <div className="grid min-h-[300px] place-items-center rounded-2xl border border-white/[0.08] bg-[#101522]">
            <div className="text-center">
              <RefreshCw
                size={28}
                className="mx-auto animate-spin text-cyan-300"
              />

              <p className="mt-4 text-sm text-slate-400">
                Loading your hackathons...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-300/20 bg-red-300/[0.04] p-6">
            <h2 className="font-bold text-red-300">
              Unable to load hackathons
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              {error}
            </p>

            <button
              type="button"
              onClick={loadRegistrations}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-300"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          registrations.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#101522]/60 px-5 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-300">
                <Trophy size={25} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-white">
                No hackathons yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                You haven't registered for any hackathon
                yet. Explore available hackathons and join
                your first one.
              </p>

              <Link
                to="/student/hackathons"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                Explore Hackathons
                <ArrowUpRight size={16} />
              </Link>
            </div>
          )}

        {/* Registrations */}
        {!loading &&
          !error &&
          registrations.length > 0 && (
            <section>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-white">
                  Registered Hackathons
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {registrations.length}{' '}
                  {registrations.length === 1
                    ? 'hackathon'
                    : 'hackathons'}{' '}
                  registered
                </p>
              </div>

              <div className="space-y-5">
                {registrations.map(
                  (registration, index) => (
                    <RegistrationCard
                      key={registration.id}
                      registration={registration}
                      index={index}
                    />
                  )
                )}
              </div>
            </section>
          )}

        <div className="border-t border-white/[0.07] pt-5 text-center text-xs text-slate-600">
          Skill Incubator · Your Hackathons
        </div>
      </div>
    </div>
  )
}