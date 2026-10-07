import { motion } from 'framer-motion'
import {
  Trophy,
  Medal,
  Crown,
  CalendarDays,
  UsersRound,
  ArrowUpRight,
} from 'lucide-react'

const WINNERS = [
  {
    rank: 1,
    teamName: 'Code Warriors',
    projectName: 'AI Powered Smart Attendance',
    hackathon: 'Minerva Innovation Challenge',
    members: 4,
    date: '15 Nov 2026',
    icon: Crown,
    position: '1st Place',
    badge:
      'border-yellow-300/30 bg-yellow-300/10 text-yellow-300',
  },
  {
    rank: 2,
    teamName: 'Pixel Pioneers',
    projectName: 'Intelligent Learning Companion',
    hackathon: 'Minerva Innovation Challenge',
    members: 3,
    date: '15 Nov 2026',
    icon: Medal,
    position: '2nd Place',
    badge:
      'border-slate-300/30 bg-slate-300/10 text-slate-300',
  },
  {
    rank: 3,
    teamName: 'Tech Titans',
    projectName: 'Accessible Digital Services',
    hackathon: 'Minerva Innovation Challenge',
    members: 4,
    date: '15 Nov 2026',
    icon: Medal,
    position: '3rd Place',
    badge:
      'border-orange-300/30 bg-orange-300/10 text-orange-300',
  },
]

const PAST_RESULTS = [
  {
    hackathon: 'Minerva Innovation Challenge',
    winner: 'Code Warriors',
    project: 'AI Powered Smart Attendance',
    date: '15 Nov 2026',
  },
  {
    hackathon: 'CampusForge Hackathon',
    winner: 'Future Builders',
    project: 'Smart Campus Ecosystem',
    date: '22 Nov 2026',
  },
]

function WinnerCard({ winner, featured = false }) {
  const Icon = winner.icon

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
              : winner.rank === 2
                ? 'border-slate-300/20 bg-slate-300/10 text-slate-300'
                : 'border-orange-300/20 bg-orange-300/10 text-orange-300'
          }`}
        >
          <Icon size={38} />
        </div>

        <span
          className={`rounded-full border px-3 py-1.5 text-xs font-bold ${winner.badge}`}
        >
          #{winner.rank} · {winner.position}
        </span>

        <h2 className="mt-4 text-2xl font-black text-white">
          {winner.teamName}
        </h2>

        <p className="mt-2 text-sm font-medium text-cyan-300">
          {winner.projectName}
        </p>

        <div className="mt-5 w-full space-y-3 border-t border-white/[0.07] pt-5 text-left">
          <div className="flex items-center gap-3">
            <Trophy size={16} className="shrink-0 text-cyan-300" />

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Hackathon
              </p>
              <p className="mt-1 text-sm text-slate-200">
                {winner.hackathon}
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
                {winner.members}{' '}
                {winner.members === 1 ? 'member' : 'members'}
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
                {winner.date}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export default function StudentResults() {
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

        {/* Top 3 */}
        <section>
          <div className="mb-8 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
              Latest Winners
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              Top 3 Teams
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Celebrating the best projects and teams
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3 lg:items-end">
            {/* 2nd */}
            <div className="lg:order-1">
              <WinnerCard winner={WINNERS[1]} />
            </div>

            {/* 1st */}
            <div className="lg:order-2">
              <WinnerCard
                winner={WINNERS[0]}
                featured
              />
            </div>

            {/* 3rd */}
            <div className="lg:order-3">
              <WinnerCard winner={WINNERS[2]} />
            </div>
          </div>
        </section>

        {/* Past results */}
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
            {PAST_RESULTS.map((result) => (
              <motion.div
                key={result.hackathon}
                whileHover={{ x: 3 }}
                className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-[#101522] p-5 transition hover:border-violet-300/20 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-300/[0.08] text-violet-300">
                    <Trophy size={20} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-white">
                      {result.hackathon}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      Winner:{' '}
                      <span className="font-semibold text-cyan-300">
                        {result.winner}
                      </span>
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {result.project}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={14} />
                    {result.date}
                  </span>

                  <ArrowUpRight
                    size={16}
                    className="text-slate-500"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="border-t border-white/[0.07] pt-5 text-center text-xs text-slate-600">
          Skill Incubator · Student Results
        </div>

      </div>
    </div>
  )
}