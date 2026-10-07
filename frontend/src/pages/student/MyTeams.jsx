
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/react'
import {
  Users,
  Plus,
  Search,
  X,
  Copy,
  Check,
  Crown,
  UserPlus,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Code2,
  KeyRound,
  Clock3,
  UsersRound,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
).replace(/\/+$/, '')

const TEAM_COLORS = [
  'from-cyan-500/20 to-blue-500/5',
  'from-violet-500/20 to-fuchsia-500/5',
  'from-emerald-500/20 to-teal-500/5',
  'from-orange-500/20 to-rose-500/5',
]

const inputClass =
  'w-full rounded-xl border border-white/10 bg-[#09090f] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10'

const actionClass =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40'

function formatDate(value) {
  if (!value) return 'Date unavailable'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

async function getErrorMessage(response) {
  try {
    const body = await response.json()
    if (typeof body.detail === 'string') return body.detail
    if (Array.isArray(body.detail)) {
      return body.detail.map((item) => item.msg).join(', ')
    }
  } catch {
    // The server may return a non-JSON response.
  }

  return `Request failed (${response.status}).`
}

function Modal({ title, subtitle, icon: Icon, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#11111c] shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/10 p-6">
          <div className="flex items-start gap-3">
            <div className="grid size-11 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              <Icon size={21} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="mt-1 text-sm leading-5 text-gray-500">{subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-xl p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-300">
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-2 block text-xs leading-5 text-gray-600">
          {hint}
        </span>
      )}
    </label>
  )
}

export default function MyTeams() {
  const { getToken } = useAuth()

  const [teams, setTeams] = useState([])
  const [activeTab, setActiveTab] = useState('ALL')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState('')
  const [selectedTeam, setSelectedTeam] = useState(null)

  const [teamName, setTeamName] = useState('')
  const [description, setDescription] = useState('')
  const [teamSize, setTeamSize] = useState('4')
  const [joinCode, setJoinCode] = useState('')

  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [copiedCode, setCopiedCode] = useState('')

  const loadTeams = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const token = await getToken()

      if (!token) {
        throw new Error('Login session unavailable. Please sign in again.')
      }

      const response = await fetch(`${API_BASE_URL}/teams/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response))
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error('The server returned an invalid teams response.')
      }

      setTeams(data)
    } catch (err) {
      setError(err.message || 'Unable to load your teams.')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    loadTeams()
  }, [loadTeams])

  function closeModal() {
    setModal('')
    setNotice('')
    setTeamName('')
    setDescription('')
    setJoinCode('')
    setTeamSize('4')
    setSelectedTeam(null)
  }

  async function createTeam(event) {
    event.preventDefault()
    setNotice('')
    setSubmitting(true)

    try {
      const token = await getToken()

      if (!token) throw new Error('Login session unavailable.')

      const response = await fetch(`${API_BASE_URL}/teams`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: teamName.trim(),
          description: description.trim() || null,
          max_members: Number(teamSize),
        }),
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response))
      }

      const createdTeam = await response.json()

      setTeams((current) => [
        createdTeam,
        ...current.filter((team) => team.id !== createdTeam.id),
      ])

      closeModal()
      setActiveTab('ALL')
      setSearch('')
    } catch (err) {
      setNotice(err.message || 'Could not create the team.')
    } finally {
      setSubmitting(false)
    }
  }

  async function joinTeam(event) {
    event.preventDefault()
    setNotice('')
    setSubmitting(true)

    try {
      const token = await getToken()

      if (!token) throw new Error('Login session unavailable.')

      const response = await fetch(`${API_BASE_URL}/teams/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          join_code: joinCode.trim().toUpperCase(),
        }),
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response))
      }

      const joinedTeam = await response.json()

      setTeams((current) => [
        joinedTeam,
        ...current.filter((team) => team.id !== joinedTeam.id),
      ])

      closeModal()
      setActiveTab('ALL')
      setSearch('')
    } catch (err) {
      setNotice(err.message || 'Could not join the team.')
    } finally {
      setSubmitting(false)
    }
  }

  async function copyCode(code) {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      window.setTimeout(() => setCopiedCode(''), 1800)
    } catch {
      setError('Clipboard access failed. Copy the join code manually.')
    }
  }

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const query = search.trim().toLowerCase()

      const matchesSearch =
        !query ||
        `${team.name || ''} ${team.description || ''} ${team.join_code || ''}`
          .toLowerCase()
          .includes(query)

      const matchesTab =
        activeTab === 'ALL' ||
        (activeTab === 'OWNED' && team.is_owner) ||
        (activeTab === 'JOINED' && !team.is_owner)

      return matchesSearch && matchesTab
    })
  }, [teams, search, activeTab])

  return (
    <main className="min-h-[70vh] bg-[#09090f] text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
          <Sparkles size={15} />
          Collaboration workspace
        </div>

        <section className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#141827] via-[#101019] to-[#171024] p-6 sm:p-9">
          <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-cyan-400/[0.07] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/3 size-56 rounded-full bg-violet-500/[0.07] blur-3xl" />

          <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-gray-300">
                <UsersRound size={14} className="text-cyan-300" />
                Build together
              </span>

              <h1 className="si-glitch-title mt-5 text-3xl font-black tracking-tight sm:text-5xl">
                My <span className="text-cyan-300">Teams</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
                Find your people, bring your ideas together, and build something
                worth showing the world. Your next great project starts here.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setNotice('')
                    setModal('create')
                  }}
                  className={`${actionClass} bg-cyan-300 text-[#09090f] hover:bg-cyan-200`}
                >
                  <Plus size={18} />
                  Create a team
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNotice('')
                    setModal('join')
                  }}
                  className={`${actionClass} border border-white/15 bg-white/[0.04] text-white hover:border-cyan-300/40 hover:bg-white/[0.07]`}
                >
                  <KeyRound size={17} />
                  Join with code
                </button>
              </div>
            </div>

            <div className="relative grid min-w-[190px] grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <Users size={19} className="text-cyan-300" />
                <p className="mt-4 text-3xl font-black">
                  {loading ? '—' : teams.length}
                </p>
                <p className="mt-1 text-xs text-gray-500">My teams</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <Crown size={19} className="text-violet-300" />
                <p className="mt-4 text-3xl font-black">
                  {teams.filter((team) => team.is_owner).length}
                </p>
                <p className="mt-1 text-xs text-gray-500">Created by me</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-6">
          <h2 className="text-xl font-bold">Your workspace</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your teams and get ready for your next hackathon.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 flex flex-col gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.05] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="flex items-start gap-2 text-sm text-rose-200">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              {error}
            </p>
            <button
              type="button"
              onClick={loadTeams}
              className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
            >
              Retry
            </button>
          </div>
        )}

        <section className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#101019] p-3 sm:flex-row sm:items-center sm:p-4">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search teams or join codes..."
              className={`${inputClass} pl-11`}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {[
              { value: 'ALL', label: 'All teams' },
              { value: 'OWNED', label: 'Created by me' },
              { value: 'JOINED', label: 'Joined' },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`whitespace-nowrap rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  activeTab === tab.value
                    ? 'border-cyan-300/30 bg-cyan-300/10 text-cyan-200'
                    : 'border-white/10 text-gray-400 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            title="Refresh teams"
            onClick={loadTeams}
            disabled={loading}
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/10 text-gray-400 hover:text-cyan-300 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </section>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-[#101019]"
              >
                <div className="h-36 bg-white/[0.04]" />
                <div className="space-y-4 p-5">
                  <div className="h-5 w-2/3 rounded bg-white/[0.07]" />
                  <div className="h-4 rounded bg-white/[0.05]" />
                  <div className="h-10 rounded bg-white/[0.05]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTeams.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredTeams.map((team, index) => {
              const members = team.members || []
              const owner =
                members.find((member) => member.role === 'OWNER') ||
                members.find((member) => member.user_id === team.owner_id)

              return (
                <article
                  key={team.id}
                  className="si-glitch-card group overflow-hidden rounded-2xl border border-white/10 bg-[#101019] transition hover:-translate-y-1 hover:border-cyan-300/30"
                >
                  <div
                    className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${
                      TEAM_COLORS[index % TEAM_COLORS.length]
                    }`}
                  >
                    <div className="absolute left-4 top-4 rounded-lg border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-300">
                      {team.is_owner ? 'Team owner' : 'Team member'}
                    </div>

                    <div className="grid size-16 place-items-center rounded-2xl border border-white/15 bg-black/20 text-cyan-200 transition group-hover:scale-105">
                      <Code2 size={30} />
                    </div>

                    <span className="absolute right-4 top-4 rounded-lg border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-gray-300">
                      {team.member_count ?? members.length}/{team.max_members} members
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="truncate text-lg font-bold">{team.name}</h3>

                    <p className="mt-2 min-h-10 text-sm leading-5 text-gray-500">
                      {team.description || 'Ready to build, learn, and collaborate.'}
                    </p>

                    <div className="my-5 flex items-center gap-3 border-y border-white/10 py-4">
                      {owner?.avatar_url ? (
                        <img
                          src={owner.avatar_url}
                          alt=""
                          className="size-9 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="grid size-9 place-items-center rounded-xl bg-violet-400/10 text-violet-300">
                          <Crown size={16} />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Team owner</p>
                        <p className="truncate text-sm font-medium">
                          {owner?.name || 'Team owner'}
                        </p>
                      </div>

                      <ShieldCheck size={17} className="ml-auto shrink-0 text-emerald-300" />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-gray-500">
                          Join code
                        </p>
                        <p className="mt-1 truncate font-mono text-sm font-bold tracking-wider text-cyan-200">
                          {team.join_code}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyCode(team.join_code)}
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-gray-300 transition hover:border-cyan-300/30 hover:text-cyan-200"
                      >
                        {copiedCode === team.join_code ? (
                          <>
                            <Check size={14} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock3 size={13} />
                        {formatDate(team.created_at)}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setNotice('')
                          setSelectedTeam(team)
                          setModal('details')
                        }}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
                      >
                        Members
                        <ArrowUpRight size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.015] px-5 py-14 text-center sm:py-20">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-cyan-300">
              <UsersRound size={29} />
            </div>

            <h3 className="mt-5 text-xl font-bold">
              {teams.length === 0 ? 'Your team story starts here' : 'No teams found'}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {teams.length === 0
                ? 'Create your first team or join your friends with an invite code. Great ideas are better when built together.'
                : 'Try a different search or switch to another team filter.'}
            </p>

            {teams.length === 0 ? (
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setNotice('')
                    setModal('create')
                  }}
                  className={`${actionClass} bg-cyan-300 text-[#09090f] hover:bg-cyan-200`}
                >
                  <Plus size={17} />
                  Create your first team
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNotice('')
                    setModal('join')
                  }}
                  className={`${actionClass} border border-white/10 text-white hover:bg-white/5`}
                >
                  <UserPlus size={17} />
                  Join a team
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setActiveTab('ALL')
                }}
                className="mt-5 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {modal === 'create' && (
        <Modal
          title="Create your team"
          subtitle="Give your team an identity before the next challenge."
          icon={Users}
          onClose={closeModal}
        >
          <form className="space-y-5" onSubmit={createTeam}>
            <Field label="Team name" hint="Choose a name your teammates will recognize.">
              <input
                autoFocus
                required
                minLength={3}
                maxLength={80}
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                placeholder="e.g. C Minus Minus"
                className={inputClass}
              />
            </Field>

            <Field label="Short description" hint="Optional — what does your team want to build?">
              <textarea
                rows={3}
                maxLength={300}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Tell teammates what your team is about..."
                className={`${inputClass} resize-none`}
              />
            </Field>

            <Field label="Maximum team size">
              <select
                value={teamSize}
                onChange={(event) => setTeamSize(event.target.value)}
                className={inputClass}
              >
                {[2, 3, 4, 5, 6].map((size) => (
                  <option key={size} value={size}>
                    {size} members
                  </option>
                ))}
              </select>
            </Field>

            {notice && (
              <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-3 text-sm text-rose-300">
                {notice}
              </p>
            )}

            <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className={`${actionClass} border border-white/10 text-gray-300 hover:bg-white/5`}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className={`${actionClass} bg-cyan-300 text-[#09090f] hover:bg-cyan-200`}
              >
                <Plus size={17} />
                {submitting ? 'Creating...' : 'Create team'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'join' && (
        <Modal
          title="Join a team"
          subtitle="Enter the invite code shared by your team owner."
          icon={KeyRound}
          onClose={closeModal}
        >
          <form className="space-y-5" onSubmit={joinTeam}>
            <Field label="Team join code" hint="Ask the team owner to share their invitation code.">
              <input
                autoFocus
                required
                maxLength={16}
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                placeholder="e.g. SI-A1B2C3"
                className={`${inputClass} font-mono tracking-widest`}
              />
            </Field>

            {notice && (
              <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-3 text-sm leading-6 text-rose-300">
                {notice}
              </p>
            )}

            <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className={`${actionClass} border border-white/10 text-gray-300 hover:bg-white/5`}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || !joinCode.trim()}
                className={`${actionClass} bg-cyan-300 text-[#09090f] hover:bg-cyan-200`}
              >
                <UserPlus size={17} />
                {submitting ? 'Joining...' : 'Join team'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'details' && selectedTeam && (
        <Modal
          title={selectedTeam.name}
          subtitle={`${selectedTeam.member_count ?? selectedTeam.members?.length ?? 0} of ${selectedTeam.max_members} members`}
          icon={Users}
          onClose={closeModal}
        >
          <div className="space-y-3">
            {(selectedTeam.members || []).map((member) => (
              <div
                key={member.user_id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3"
              >
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt=""
                    className="size-10 rounded-xl object-cover"
                  />
                ) : (
                  <div className="grid size-10 place-items-center rounded-xl bg-cyan-300/10 text-cyan-200">
                    <Users size={17} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {member.name}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {member.email}
                  </p>
                </div>

                <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-cyan-200">
                  {member.role}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={closeModal}
            className={`${actionClass} mt-5 w-full bg-cyan-300 text-[#09090f] hover:bg-cyan-200`}
          >
            Done
          </button>
        </Modal>
      )}
    </main>
  )
}
