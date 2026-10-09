import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy,
  Medal,
  Crown,
  CalendarDays,
  UsersRound,
  ArrowUpRight,
} from 'lucide-react'
import { useAuth } from '@clerk/react'

const API_BASE_URL = import.meta.env.API_BASE_URL;

function formatDate(dateString) {
  if (!dateString) return 'Date unavailable'

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getWinnerData(result, rank) {
  if (rank === 1) return result.first
  if (rank === 2) return result.second
  if (rank === 3) return result.third

  return null
}

function getWinnerIcon(rank) {
  if (rank === 1) return Crown
  return Medal
}

function getWinnerBadge(rank) {
  if (rank === 1) {
    return 'border-yellow-300/30 bg-yellow-300/10 text-yellow-300'
  }

  if (rank === 2) {
    return 'border-slate-300/30 bg-slate-300/10 text-slate-300'
  }

  return 'border-orange-300/30 bg-orange-300/10 text-orange-300'
}

function WinnerCard({ winner, result, featured = false }) {
  if (!winner) return null

  const Icon = getWinnerIcon(winner.position)

  return (
    <motion.article
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -6 }}
      className={`relative overflow-hidden rounded-3xl border ${
        featured
          ? 'border-yellow-300/30 bg-gradient-to-b from-yellow-300/[0.10] via-[#111522] to-[#101522] lg:-translate-y-4'
          : 'border-white/[0.08] bg-[#101522]'
      } p-6`}
    >
      {featured && (
        <div className="absolute right-4 top-4 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-300">
          Champion
        </div>
      )}

      <div className="flex flex-col items-center text-center">
        <div
          className={`mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border ${
            featured
              ? 'border-yellow-300/30 bg-yellow-300/10 text-yellow-300'
              : winner.position === 2
                ? 'border-slate-300/20 bg-slate-300/10 text-slate-300'
                : 'border-orange-300/20 bg-orange-300/10 text-orange-300'
          }`}
        >
          <Icon size={38} />
        </div>

        <span
          className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getWinnerBadge(
            winner.position,
          )}`}
        >
          #{winner.position} ·{' '}
          {winner.position === 1
            ? '1st Place'
            : winner.position === 2
              ? '2nd Place'
              : '3rd Place'}
        </span>

        <h2 className="mt-4 text-2xl font-black text-white">
          {winner.team_name}
        </h2>

        <p className="mt-2 text-sm font-medium text-cyan-300">
          {winner.project_name}
        </p>

        <div className="mt-5 w-full space-y-3 border-t border-white/[0.07] pt-5 text-left">
          <div className="flex items-center gap-3">
            <Trophy size={16} className="shrink-0 text-cyan-300" />

            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Hackathon
              </p>

              <p className="mt-1 truncate text-sm text-slate-200">
                {result.hackathon_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <UsersRound
              size={16}
              className="shrink-0 text-violet-300"
            />

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Team Size
              </p>

              <p className="mt-1 text-sm text-slate-200">
                {winner.members?.length || 0}{' '}
                {winner.members?.length === 1 ? 'member' : 'members'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CalendarDays
              size={16}
              className="shrink-0 text-emerald-300"
            />

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Event Date
              </p>

              <p className="mt-1 text-sm text-slate-200">
                {formatDate(result.event_end)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export default function StudentResults() {
  const { getToken } = useAuth()

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchResults() {
      try {
        setLoading(true)
        setError('')

        const token = await getToken()

        const response = await fetch(`${API_BASE_URL}/results`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          let message = 'Failed to load results.'

          try {
            const errorData = await response.json()

            if (errorData?.detail) {
              message = errorData.detail
            }
          } catch {
            // Ignore invalid error response
          }

          throw new Error(message)
        }

        const data = await response.json()

        if (!cancelled) {
          setResults(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message || 'Something went wrong while loading results.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchResults()

    return () => {
      cancelled = true
    }
  }, [getToken])

  /*
   * Backend already sorts published results by event_end DESC,
   * so the first result is the latest published hackathon.
   */
  const latestResult = results[0] || null

  const latestWinners = useMemo(() => {
    if (!latestResult) return []

    return [
      latestResult.second,
      latestResult.first,
      latestResult.third,
    ]
  }, [latestResult])

  const pastResults = useMemo(() => {
    return results.slice(1)
  }, [results])

  return (
    <div className="min-h-screen bg-[#080b14] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-violet-300/15 bg-gradient-to-br from-[#181328] via-[#111523] to-[#10101c] p-6 sm:p-8"
        >
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.17em] text-violet-300">
              <Trophy size={14} />
              Student Results
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Hackathon{' '}
              <span className="text-violet-300">Results</span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              See the teams that turned their ideas into winning
              solutions. Top performers from your hackathons are
              highlighted here.
            </p>
          </div>
        </motion.section>

        {/* Loading */}
        {loading && (
          <section className="py-16 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-violet-300/20 border-t-violet-300" />

            <p className="mt-4 text-sm text-slate-500">
              Loading hackathon results...
            </p>
          </section>
        )}

        {/* Error */}
        {!loading && error && (
          <section className="rounded-2xl border border-red-400/20 bg-red-400/5 p-6 text-center">
            <p className="text-sm font-medium text-red-300">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Try Again
            </button>
          </section>
        )}

        {/* No results */}
        {!loading && !error && !latestResult && (
          <section className="rounded-3xl border border-white/[0.08] bg-[#101522] p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-300/15 bg-violet-300/5 text-violet-300">
              <Trophy size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-white">
              No results published yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Hackathon results will appear here once an organizer
              publishes them.
            </p>
          </section>
        )}

        {/* Top 3 */}
        {!loading && !error && latestResult && (
          <section>
            <div className="mb-8 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
                Latest Winners
              </p>

              <h2 className="mt-2 text-2xl font-black text-white">
                Top 3 Teams
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {latestResult.hackathon_name}
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3 lg:items-end">
              {/* 2nd */}
              <div className="lg:order-1">
                <WinnerCard
                  winner={latestResult.second}
                  result={latestResult}
                />
              </div>

              {/* 1st */}
              <div className="lg:order-2">
                <WinnerCard
                  winner={latestResult.first}
                  result={latestResult}
                  featured
                />
              </div>

              {/* 3rd */}
              <div className="lg:order-3">
                <WinnerCard
                  winner={latestResult.third}
                  result={latestResult}
                />
              </div>
            </div>
          </section>
        )}

        {/* Past results */}
        {!loading &&
          !error &&
          latestResult &&
          pastResults.length > 0 && (
            <section className="pt-4">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-white">
                  Past Hackathon Results
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Previous winners and their projects
                </p>
              </div>

              <div className="space-y-3">
                {pastResults.map((result) => {
                  const winner = result.first

                  return (
                    <motion.div
                      key={result.hackathon_id}
                      whileHover={{ x: 3 }}
                      className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-[#101522] p-5 transition hover:border-violet-300/20 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-300/[0.08] text-violet-300">
                          <Trophy size={20} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-bold text-white">
                            {result.hackathon_name}
                          </h3>

                          {winner ? (
                            <>
                              <p className="mt-1 text-sm text-slate-400">
                                Winner:{' '}
                                <span className="font-semibold text-cyan-300">
                                  {winner.team_name}
                                </span>
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {winner.project_name}
                              </p>
                            </>
                          ) : (
                            <p className="mt-1 text-sm text-slate-500">
                              Winner information unavailable
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {formatDate(result.event_end)}
                        </span>

                        <ArrowUpRight
                          size={16}
                          className="text-slate-500"
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </section>
          )}

        <div className="border-t border-white/[0.07] pt-5 text-center text-xs text-slate-600">
          Skill Incubator · Student Results
        </div>
      </div>
    </div>
  )
}