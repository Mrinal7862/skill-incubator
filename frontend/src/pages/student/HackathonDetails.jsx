import { useCallback, useEffect, useMemo, useState } from 'react'
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
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    Code2Icon,
    Send,
    X,
} from 'lucide-react'

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:8000/api/v1'
).replace(/\/+$/, '')

const STATUS_CONFIG = {
    SUBMITTED: {
        label: 'Submitted',
        className:
            'border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
    },
    UNDER_REVIEW: {
        label: 'Under Review',
        className:
            'border-amber-400/20 bg-amber-400/10 text-amber-300',
    },
    ACCEPTED: {
        label: 'Accepted',
        className:
            'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    },
    NEEDS_CHANGES: {
        label: 'Needs Changes',
        className:
            'border-rose-400/20 bg-rose-400/10 text-rose-300',
    },
}

function formatDate(value) {
    if (!value) return 'Not specified'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return 'Not specified'
    }

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
                <p className="text-xs text-gray-500">
                    {label}
                </p>

                <p className="mt-1 break-words text-sm font-semibold text-gray-100">
                    {value || 'Not available'}
                </p>
            </div>
        </div>
    )
}

function SubmissionStatus({ status }) {
    const config =
        STATUS_CONFIG[String(status || '').toUpperCase()] || {
            label: status || 'Unknown',
            className:
                'border-white/10 bg-white/5 text-gray-300',
        }

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold ${config.className}`}
        >
            {config.label}
        </span>
    )
}

export default function HackathonDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { getToken } = useAuth()

    const [hackathon, setHackathon] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Registration
    const [registration, setRegistration] = useState(null)
    const [registrationLoading, setRegistrationLoading] =
        useState(true)
    const [registering, setRegistering] = useState(false)
    const [registrationMessage, setRegistrationMessage] =
        useState('')
    const [registrationError, setRegistrationError] =
        useState('')

    // Submission
    const [submission, setSubmission] = useState(null)
    const [submissionLoading, setSubmissionLoading] =
        useState(true)
    const [submissionError, setSubmissionError] =
        useState('')

    const [showSubmissionForm, setShowSubmissionForm] =
        useState(false)

    const [submitting, setSubmitting] = useState(false)

    const [submissionForm, setSubmissionForm] = useState({
        team_id: '',
        problem_statement_id: '',
        project_name: '',
        description: '',
        tech_stack: '',
        github_url: '',
        demo_url: '',
    })

    // Submission options
    const [teams, setTeams] = useState([])
    const [teamsLoading, setTeamsLoading] = useState(false)
    const [problems, setProblems] = useState([])
    const [problemsLoading, setProblemsLoading] = useState(false)

    // ---------------------------------------------------------
    // Load hackathon
    // ---------------------------------------------------------

    const loadDetails = useCallback(async () => {
        setLoading(true)
        setError('')

        try {
            const token = await getToken()

            if (!token) {
                throw new Error(
                    'Your session could not be verified. Please sign in again.'
                )
            }

            const response = await fetch(
                `${API_BASE_URL}/hackathons/${encodeURIComponent(id)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                }
            )

            if (!response.ok) {
                let detail = ''

                try {
                    const body = await response.json()
                    detail = body.detail || ''
                } catch {
                    // Ignore non JSON response
                }

                if (response.status === 404) {
                    throw new Error(
                        detail ||
                            'This hackathon was not found or is no longer available.'
                    )
                }

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {
                    throw new Error(
                        detail ||
                            'You are not authorized to view this hackathon.'
                    )
                }

                throw new Error(
                    detail ||
                        `Unable to load details (${response.status}).`
                )
            }

            const data = await response.json()
            setHackathon(data)
        } catch (err) {
            setError(
                err.message ||
                    'Something went wrong while loading this hackathon.'
            )
        } finally {
            setLoading(false)
        }
    }, [getToken, id])

    // ---------------------------------------------------------
    // Load registration
    // ---------------------------------------------------------

    const loadRegistration = useCallback(async () => {
        setRegistrationLoading(true)
        setRegistrationError('')

        try {
            const token = await getToken()

            if (!token) {
                throw new Error(
                    'Your session could not be verified.'
                )
            }

            const response = await fetch(
                `${API_BASE_URL}/registrations/me`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                }
            )

            if (!response.ok) {
                throw new Error(
                    `Unable to check registration (${response.status}).`
                )
            }

            const registrations = await response.json()

            const currentRegistration =
                Array.isArray(registrations)
                    ? registrations.find(
                          (item) =>
                              String(item.hackathon_id) ===
                              String(id)
                      )
                    : null

            setRegistration(currentRegistration || null)
        } catch (err) {
            console.error(
                'Failed to check registration:',
                err
            )

            setRegistrationError(
                err.message ||
                    'Unable to check your registration status.'
            )
        } finally {
            setRegistrationLoading(false)
        }
    }, [getToken, id])

    // ---------------------------------------------------------
    // Load student's submission for THIS hackathon
    // ---------------------------------------------------------

    const loadSubmission = useCallback(async () => {
        setSubmissionLoading(true)
        setSubmissionError('')

        try {
            const token = await getToken()

            if (!token) {
                throw new Error(
                    'Your session could not be verified.'
                )
            }

            const response = await fetch(
                `${API_BASE_URL}/submissions/my`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                }
            )

            if (!response.ok) {
                throw new Error(
                    `Unable to load your submission (${response.status}).`
                )
            }

            const data = await response.json()

            const currentSubmission =
                Array.isArray(data)
                    ? data.find(
                          (item) =>
                              String(item.hackathon_id) ===
                              String(id)
                      )
                    : null

            setSubmission(currentSubmission || null)

            // Populate edit/display values if submission exists
            if (currentSubmission) {
                setSubmissionForm({
                    team_id: currentSubmission.team_id || '',
                    problem_statement_id:
                        currentSubmission.problem_statement_id || '',
                    project_name:
                        currentSubmission.project_name || '',
                    description:
                        currentSubmission.description || '',
                    tech_stack: Array.isArray(
                        currentSubmission.tech_stack
                    )
                        ? currentSubmission.tech_stack.join(', ')
                        : '',
                    github_url:
                        currentSubmission.github_url || '',
                    demo_url:
                        currentSubmission.demo_url || '',
                })
            }
        } catch (err) {
            console.error(
                'Failed to load submission:',
                err
            )

            setSubmissionError(
                err.message ||
                    'Unable to load your submission.'
            )
        } finally {
            setSubmissionLoading(false)
        }
    }, [getToken, id])

    const loadTeams = useCallback(async () => {
        setTeamsLoading(true)

        try {
            const token = await getToken()

            if (!token) {
                throw new Error('Your session could not be verified.')
            }

            const response = await fetch(
                `${API_BASE_URL}/teams/my`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                }
            )

            if (!response.ok) {
                throw new Error(
                    `Unable to load your teams (${response.status}).`
                )
            }

            const data = await response.json()
            setTeams(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Failed to load teams:', err)
            setTeams([])
        } finally {
            setTeamsLoading(false)
        }
    }, [getToken])

    const loadProblems = useCallback(async () => {
    setProblemsLoading(true)

    try {
        const token = await getToken()

        if (!token) {
            throw new Error('Your session could not be verified.')
        }

        const response = await fetch(
            `${API_BASE_URL}/hackathons/${encodeURIComponent(id)}/problem-statements`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            }
        )

        if (!response.ok) {
            throw new Error(
                `Unable to load problem statements (${response.status}).`
            )
        }

        const data = await response.json()

        console.log('PROBLEM STATEMENTS:', data)

        setProblems(Array.isArray(data) ? data : [])
    } catch (err) {
        console.error('Failed to load problem statements:', err)
        setProblems([])
    } finally {
        setProblemsLoading(false)
    }
}, [getToken, id])

    useEffect(() => {
        loadDetails()
        loadRegistration()
    }, [loadDetails, loadRegistration])

    useEffect(() => {
        if (registration) {
            loadSubmission()
            loadTeams()
            loadProblems()
        } else {
            setSubmission(null)
            setSubmissionLoading(false)
            setTeams([])
            setProblems([])
        }
    }, [registration, loadSubmission, loadTeams, loadProblems])

    // Once teams arrive, preselect the registered team or the only available team.
    // Then open the submission form automatically when no project exists yet.
    useEffect(() => {
        if (!registration || submissionLoading || submission || teamsLoading) {
            return
        }

        const preferredTeamId =
            registration.team_id ||
            (teams.length === 1 ? teams[0]?.id : '')

        setSubmissionForm((previous) => ({
            ...previous,
            team_id: previous.team_id || preferredTeamId || '',
            problem_statement_id:
                previous.problem_statement_id ||
                registration.problem_statement_id ||
                '',
        }))

        setShowSubmissionForm(true)
    }, [
        registration,
        submission,
        submissionLoading,
        teams,
        teamsLoading,
    ])

    // Register


    async function handleRegister() {
        if (!hackathon || registering) return

        setRegistrationMessage('')
        setRegistrationError('')

        if (registration) {
            return
        }

        if (status !== 'OPEN') {
            setRegistrationError(
                `Registration is currently closed because this hackathon is ${status}.`
            )
            return
        }

        const fee = Number(
            hackathon.registration_amount || 0
        )

        if (fee > 0) {
            setRegistrationError(
                'This hackathon has a registration fee. Payment integration is required before registration can be completed.'
            )
            return
        }

        const confirmed = window.confirm(
            `Register for "${hackathon.name}"?`
        )

        if (!confirmed) return

        try {
            setRegistering(true)

            const token = await getToken()

            if (!token) {
                throw new Error(
                    'Your session has expired. Please sign in again.'
                )
            }

            const response = await fetch(
                `${API_BASE_URL}/registrations`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        hackathon_id: hackathon.id,
                        team_id: null,
                        problem_statement_id: null,
                    }),
                }
            )

            let body = null

            try {
                body = await response.json()
            } catch {
                body = null
            }

            if (!response.ok) {
                throw new Error(
                    body?.detail ||
                        `Registration failed (${response.status}).`
                )
            }

            setRegistration(body)

            setRegistrationMessage(
                'You have successfully registered for this hackathon.'
            )
        } catch (err) {
            console.error(
                'Hackathon registration failed:',
                err
            )

            setRegistrationError(
                err.message ||
                    'Unable to complete registration.'
            )
        } finally {
            setRegistering(false)
        }
    }

    // ---------------------------------------------------------
    // Submission form
    // ---------------------------------------------------------

    const handleSubmissionChange = (event) => {
        const { name, value } = event.target

        setSubmissionForm((previous) => ({
            ...previous,
            [name]: value,
        }))

        setSubmissionError('')
    }

    const resetSubmissionForm = () => {
        setSubmissionForm((previous) => ({
            team_id: previous.team_id || registration?.team_id || '',
            problem_statement_id:
                previous.problem_statement_id ||
                registration?.problem_statement_id ||
                '',
            project_name: '',
            description: '',
            tech_stack: '',
            github_url: '',
            demo_url: '',
        }))
    }

    const closeSubmissionForm = () => {
        if (submitting) return

        setShowSubmissionForm(false)
    }

    // ---------------------------------------------------------
    // Submit project
    // ---------------------------------------------------------

    async function handleSubmission(event) {
        event.preventDefault()

        setSubmissionError('')

        if (!registration) {
            setSubmissionError(
                'You must be registered for this hackathon before submitting a project.'
            )
            return
        }

        if (!submissionForm.team_id) {
            setSubmissionError(
                'Please select a team. Create or join a team from My Teams first.'
            )
            return
        }

        if (!submissionForm.project_name.trim()) {
            setSubmissionError(
                'Please enter your project name.'
            )
            return
        }

        if (
            submissionForm.description.trim().length < 10
        ) {
            setSubmissionError(
                'Project description must contain at least 10 characters.'
            )
            return
        }

        if (!submissionForm.github_url.trim()) {
            setSubmissionError(
                'GitHub repository URL is required.'
            )
            return
        }

        const techStack = submissionForm.tech_stack
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)

        try {
            setSubmitting(true)

            const token = await getToken()

            if (!token) {
                throw new Error(
                    'Your session has expired. Please sign in again.'
                )
            }

            const payload = {
                hackathon_id: id,
                team_id: submissionForm.team_id,
                problem_statement_id:
                    submissionForm.problem_statement_id || null,
                project_name:
                    submissionForm.project_name.trim(),
                description:
                    submissionForm.description.trim(),
                tech_stack: techStack,
                github_url:
                    submissionForm.github_url.trim(),
                demo_url:
                    submissionForm.demo_url.trim() || null,
            }

            const response = await fetch(
                `${API_BASE_URL}/submissions`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            )

            let body = null

            try {
                body = await response.json()
            } catch {
                body = null
            }

            if (!response.ok) {
                throw new Error(
                    body?.detail ||
                        `Submission failed (${response.status}).`
                )
            }

            setSubmission(body)

            setShowSubmissionForm(false)

            setRegistrationMessage(
                'Project submitted successfully! 🚀'
            )

            await loadSubmission()
        } catch (err) {
            console.error(
                'Project submission failed:',
                err
            )

            setSubmissionError(
                err.message ||
                    'Unable to submit your project.'
            )
        } finally {
            setSubmitting(false)
        }
    }

    // ---------------------------------------------------------
    // Derived values
    // ---------------------------------------------------------

    const status = String(
        hackathon?.status || 'OPEN'
    ).toUpperCase()

    const statusClass =
        {
            OPEN:
                'border-cyan-300/30 bg-cyan-300/10 text-cyan-200',
            LIVE:
                'border-emerald-300/30 bg-emerald-300/10 text-emerald-200',
            DRAFT:
                'border-amber-300/30 bg-amber-300/10 text-amber-200',
            ENDED:
                'border-white/10 bg-white/5 text-gray-400',
            CANCELLED:
                'border-rose-300/30 bg-rose-300/10 text-rose-200',
        }[status] ||
        'border-white/10 bg-white/5 text-gray-300'

    const isFree =
        Number(hackathon?.registration_amount || 0) === 0

    const isRegistered = Boolean(registration)

    // ---------------------------------------------------------
    // Loading
    // ---------------------------------------------------------

    if (loading) {
        return (
            <main className="grid min-h-[60vh] place-items-center bg-[#09090f] px-6 text-gray-300">
                <div className="text-center">
                    <RefreshCw
                        size={28}
                        className="mx-auto animate-spin text-cyan-300"
                    />

                    <p className="mt-4 text-sm">
                        Loading hackathon details...
                    </p>
                </div>
            </main>
        )
    }

    // ---------------------------------------------------------
    // Error
    // ---------------------------------------------------------

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
                        {error ||
                            'This hackathon is not available.'}
                    </p>

                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    '/student/hackathons'
                                )
                            }
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

    // ---------------------------------------------------------
    // UI
    // ---------------------------------------------------------

    return (
        <main className="min-h-screen bg-[#09090f] px-4 py-6 text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">

                {/* Back */}
                <button
                    type="button"
                    onClick={() =>
                        navigate('/student/hackathons')
                    }
                    className="mb-6 inline-flex items-center gap-2 rounded-lg text-sm text-gray-400 transition hover:text-cyan-300"
                >
                    <ArrowLeft size={17} />
                    Back to Explore Hackathons
                </button>

                {/* Main */}
                <motion.section
                    initial={{
                        opacity: 0,
                        y: 16,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-[#101019]"
                >
                    {/* Hero */}
                    <div className="relative min-h-64 overflow-hidden border-b border-white/10 bg-gradient-to-br from-cyan-950 via-[#17152a] to-violet-950 sm:min-h-80">

                        {hackathon.image_url && (
                            <img
                                src={hackathon.image_url}
                                alt={hackathon.name}
                                className="absolute inset-0 h-full w-full object-cover"
                                onError={(event) => {
                                    event.currentTarget.style.display =
                                        'none'
                                }}
                            />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-[#101019] via-[#09090f]/50 to-black/10" />

                        {!hackathon.image_url && (
                            <div className="absolute inset-0 grid place-items-center">
                                <Code2
                                    size={72}
                                    className="text-cyan-300/50"
                                />
                            </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                            <div className="mb-4 flex flex-wrap items-center gap-3">

                                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-black/40 px-3 py-1.5 text-xs font-semibold text-cyan-200">
                                    <Sparkles size={13} />
                                    Skill Incubator
                                </span>

                                <span
                                    className={`rounded-full border px-3 py-1.5 text-xs font-bold ${statusClass}`}
                                >
                                    {status}
                                </span>

                                {isRegistered && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-xs font-bold text-emerald-200">
                                        <CheckCircle2 size={13} />
                                        REGISTERED
                                    </span>
                                )}
                            </div>

                            <h1 className="max-w-4xl text-3xl font-black leading-tight sm:text-5xl">
                                {hackathon.name}
                            </h1>

                            <p className="mt-4 flex items-center gap-2 text-sm text-gray-300">
                                <CalendarDays
                                    size={16}
                                    className="text-cyan-300"
                                />

                                Event starts{' '}
                                {formatDate(
                                    hackathon.event_start
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_340px] lg:p-10">

                        {/* Left */}
                        <section>

                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                                About the event
                            </p>

                            <h2 className="mt-3 text-xl font-bold">
                                Hackathon overview
                            </h2>

                            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-400">
                                {hackathon.description ||
                                    'The organizer has not added a description yet.'}
                            </p>

                            {/* Event information */}
                            <h2 className="mt-9 text-xl font-bold">
                                Event information
                            </h2>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <DetailItem
                                    icon={CalendarCheck}
                                    label="Registration starts"
                                    value={formatDate(
                                        hackathon.registration_start
                                    )}
                                />

                                <DetailItem
                                    icon={Clock3}
                                    label="Registration ends"
                                    value={formatDate(
                                        hackathon.registration_end
                                    )}
                                />

                                <DetailItem
                                    icon={CalendarDays}
                                    label="Event starts"
                                    value={formatDate(
                                        hackathon.event_start
                                    )}
                                />

                                <DetailItem
                                    icon={CalendarDays}
                                    label="Event ends"
                                    value={formatDate(
                                        hackathon.event_end
                                    )}
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

                            {/* ------------------------------------------------ */}
                            {/* Registered Student Area */}
                            {/* ------------------------------------------------ */}

                            {isRegistered && (
                                <section className="mt-10">

                                    <div className="mb-5">
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                                            Your participation
                                        </p>

                                        <h2 className="mt-2 text-2xl font-black">
                                            Your Hackathon Workspace
                                        </h2>

                                        <p className="mt-2 text-sm leading-6 text-gray-500">
                                            Everything related to your participation in this hackathon is shown here.
                                        </p>
                                    </div>

                                    {/* Team + Problem Statement */}
                                    <div className="grid gap-4 sm:grid-cols-2">

                                        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                                            <p className="text-xs uppercase tracking-wider text-gray-500">
                                                Your Team
                                            </p>

                                            <div className="mt-3 flex items-center gap-3">
                                                <div className="grid size-10 place-items-center rounded-xl bg-violet-400/10 text-violet-300">
                                                    <Users size={19} />
                                                </div>

                                                <div>
                                                    <p className="font-bold text-white">
                                                        {registration.team_name ||
                                                            teams.find(
                                                                (team) =>
                                                                    String(team.id) ===
                                                                    String(submissionForm.team_id)
                                                            )?.name ||
                                                            'No team selected yet'}
                                                    </p>

                                                    {!registration.team_id && (
                                                        <p className="mt-1 text-xs text-amber-300">
                                                            Join or create a team before submitting.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                                            <p className="text-xs uppercase tracking-wider text-gray-500">
                                                Problem Statement
                                            </p>

                                            <div className="mt-3 flex items-center gap-3">
                                                <div className="grid size-10 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300">
                                                    <Code2 size={19} />
                                                </div>

                                                <div>
                                                    <p className="font-bold text-white">
                                                        {registration.problem_statement_title ||
                                                            'Not selected'}
                                                    </p>

                                                    {registration.problem_statement_id && (
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {registration.problem_statement_id}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submission */}
                                    <div className="mt-5 overflow-hidden rounded-2xl border border-cyan-300/15 bg-gradient-to-br from-cyan-300/[0.06] to-violet-400/[0.04]">

                                        <div className="border-b border-white/10 p-5 sm:p-6">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                                                        Project Submission
                                                    </p>

                                                    <h3 className="mt-2 text-xl font-black text-white">
                                                        {submission
                                                            ? 'Your Submission'
                                                            : 'Submit Your Project'}
                                                    </h3>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {submission
                                                            ? 'Your project has been submitted for this hackathon.'
                                                            : 'Submit your project directly to this hackathon.'}
                                                    </p>
                                                </div>

                                                {!submissionLoading &&
                                                    !submission && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setShowSubmissionForm(
                                                                    true
                                                                )
                                                            }
                                                            disabled={
                                                                teamsLoading
                                                            }
                                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-[#09090f] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-gray-500"
                                                        >
                                                            <Send
                                                                size={17}
                                                            />
                                                            Submit Project
                                                        </button>
                                                    )}
                                            </div>
                                        </div>

                                        {submissionLoading && (
                                            <div className="flex items-center gap-3 p-6 text-sm text-gray-400">
                                                <RefreshCw
                                                    size={18}
                                                    className="animate-spin text-cyan-300"
                                                />
                                                Checking your submission...
                                            </div>
                                        )}

                                        {!submissionLoading &&
                                            submission && (
                                                <div className="p-5 sm:p-6">

                                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                                                        <div>
                                                            <p className="text-2xl font-black text-white">
                                                                {
                                                                    submission.project_name
                                                                }
                                                            </p>

                                                            <p className="mt-2 text-sm text-gray-500">
                                                                Submitted on{' '}
                                                                {formatDate(
                                                                    submission.submitted_at
                                                                )}
                                                            </p>
                                                        </div>

                                                        <SubmissionStatus
                                                            status={
                                                                submission.status
                                                            }
                                                        />
                                                    </div>

                                                    <p className="mt-5 text-sm leading-7 text-gray-400">
                                                        {
                                                            submission.description
                                                        }
                                                    </p>

                                                    {Array.isArray(
                                                        submission.tech_stack
                                                    ) &&
                                                        submission
                                                            .tech_stack
                                                            .length >
                                                            0 && (
                                                            <div className="mt-4 flex flex-wrap gap-2">
                                                                {submission.tech_stack.map(
                                                                    (
                                                                        tech
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                tech
                                                                            }
                                                                            className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-gray-300"
                                                                        >
                                                                            {
                                                                                tech
                                                                            }
                                                                        </span>
                                                                    )
                                                                )}
                                                            </div>
                                                        )}

                                                    <div className="mt-5 flex flex-wrap gap-3">

                                                        {submission.github_url && (
                                                            <a
                                                                href={
                                                                    submission.github_url
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-gray-200 hover:bg-white/[0.08]"
                                                            >
                                                                <Code2Icon
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                                GitHub
                                                                <ExternalLink
                                                                    size={
                                                                        13
                                                                    }
                                                                />
                                                            </a>
                                                        )}

                                                        {submission.demo_url && (
                                                            <a
                                                                href={
                                                                    submission.demo_url
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-300/15"
                                                            >
                                                                <ExternalLink
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                                Live Demo
                                                            </a>
                                                        )}
                                                    </div>

                                                    {submission.feedback && (
                                                        <div className="mt-5 rounded-xl border border-amber-300/15 bg-amber-300/[0.05] p-4">
                                                            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                                                                Organizer Feedback
                                                            </p>

                                                            <p className="mt-2 text-sm leading-6 text-gray-300">
                                                                {
                                                                    submission.feedback
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                        {!submissionLoading &&
                                            !submission && (
                                                <div className="p-6">

                                                    {teams.length === 0 && !teamsLoading ? (
                                                        <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.05] p-5">
                                                            <div className="flex items-start gap-3">
                                                                <AlertCircle
                                                                    size={20}
                                                                    className="mt-0.5 shrink-0 text-amber-300"
                                                                />

                                                                <div>
                                                                    <p className="font-semibold text-amber-200">
                                                                        Team required
                                                                    </p>

                                                                    <p className="mt-1 text-sm leading-6 text-gray-500">
                                                                        You are registered. Create or join a team, then come back here to submit your project.
                                                                    </p>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            navigate('/student/teams')
                                                                        }
                                                                        className="mt-4 rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-bold text-[#09090f] hover:bg-amber-200"
                                                                    >
                                                                        Go to My Teams
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="rounded-xl border border-dashed border-white/10 bg-black/10 p-6 text-center">
                                                            <div className="mx-auto grid size-12 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300">
                                                                <Code2
                                                                    size={
                                                                        22
                                                                    }
                                                                />
                                                            </div>

                                                            <p className="mt-4 font-bold text-white">
                                                                No project submitted yet
                                                            </p>

                                                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                                                                Your team is ready. Submit your project to participate in this hackathon.
                                                            </p>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setShowSubmissionForm(
                                                                        true
                                                                    )
                                                                }
                                                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-[#09090f] hover:bg-cyan-200"
                                                            >
                                                                <Send
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                                Submit Your Project
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                </section>
                            )}
                        </section>

                        {/* Right / Registration */}
                        <aside>
                            <div className="rounded-2xl border border-white/10 bg-[#09090f] p-5 sm:p-6 lg:sticky lg:top-6">

                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                                    Registration
                                </p>

                                <div className="mt-3 flex items-center gap-2">

                                    {!isFree && (
                                        <IndianRupee
                                            size={25}
                                            className="text-cyan-300"
                                        />
                                    )}

                                    <span className="text-3xl font-black text-white">
                                        {formatFee(
                                            hackathon.registration_amount
                                        )}
                                    </span>
                                </div>

                                <div className="my-6 h-px bg-white/10" />

                                <div className="flex items-start gap-3">
                                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300">
                                        <Wallet size={19} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold">
                                            Team participation
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-gray-500">
                                            Team size must be between{' '}
                                            {
                                                hackathon.min_team_size
                                            }{' '}
                                            and{' '}
                                            {
                                                hackathon.max_team_size
                                            }{' '}
                                            members.
                                        </p>
                                    </div>
                                </div>

                                {/* Registration window */}
                                <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.025] p-4">
                                    <p className="text-xs font-semibold text-gray-300">
                                        Registration window
                                    </p>

                                    <p className="mt-2 text-sm text-gray-400">
                                        {formatDate(
                                            hackathon.registration_start
                                        )}
                                    </p>

                                    <p className="my-1 text-xs text-gray-600">
                                        to
                                    </p>

                                    <p className="text-sm text-gray-400">
                                        {formatDate(
                                            hackathon.registration_end
                                        )}
                                    </p>
                                </div>

                                {/* Registration status */}
                                {isRegistered && (
                                    <div className="mt-5 rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-4">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2
                                                size={18}
                                                className="text-emerald-300"
                                            />

                                            <p className="text-sm font-semibold text-emerald-200">
                                                You're registered
                                            </p>
                                        </div>

                                        <p className="mt-2 text-xs leading-5 text-gray-500">
                                            Your registration has been created successfully.
                                        </p>
                                    </div>
                                )}

                                {/* Success */}
                                {registrationMessage && (
                                    <div className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-4">
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2
                                                size={17}
                                                className="mt-0.5 shrink-0 text-emerald-300"
                                            />

                                            <p className="text-xs leading-5 text-emerald-200">
                                                {
                                                    registrationMessage
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Error */}
                                {registrationError && (
                                    <div className="mt-4 rounded-xl border border-rose-300/20 bg-rose-300/5 p-4">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle
                                                size={17}
                                                className="mt-0.5 shrink-0 text-rose-300"
                                            />

                                            <p className="text-xs leading-5 text-rose-200">
                                                {
                                                    registrationError
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Register */}
                                {registrationLoading ? (
                                    <button
                                        type="button"
                                        disabled
                                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3.5 text-sm font-bold text-gray-500"
                                    >
                                        <RefreshCw
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Checking registration...
                                    </button>
                                ) : isRegistered ? (
                                    <button
                                        type="button"
                                        disabled
                                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-300/15 px-4 py-3.5 text-sm font-bold text-emerald-300"
                                    >
                                        <CheckCircle2
                                            size={17}
                                        />
                                        Already Registered
                                    </button>
                                ) : !isFree ? (
                                    <button
                                        type="button"
                                        disabled
                                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-300/15 px-4 py-3.5 text-sm font-bold text-amber-300"
                                        title="Payment integration is not available yet"
                                    >
                                        <Wallet size={17} />
                                        Payment Required
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleRegister}
                                        disabled={registering}
                                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3.5 text-sm font-bold text-[#09090f] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-cyan-300/30 disabled:text-[#09090f]/50"
                                    >
                                        {registering ? (
                                            <>
                                                <RefreshCw
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                                Registering...
                                            </>
                                        ) : status !== 'OPEN' ? (
                                            'Registration Closed'
                                        ) : (
                                            <>
                                                Register Now
                                                <ArrowRightIcon />
                                            </>
                                        )}
                                    </button>
                                )}

                                <p className="mt-3 text-center text-xs leading-5 text-gray-600">
                                    {isRegistered
                                        ? 'Your team and project submission are managed below.'
                                        : isFree
                                          ? 'Free registration. Team and problem statement can be attached later.'
                                          : 'Payment workflow will be connected next.'}
                                </p>

                                {isRegistered && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                '/student/registrations'
                                            )
                                        }
                                        className="mt-4 w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5 hover:text-white"
                                    >
                                        Go to Your Hackathons
                                    </button>
                                )}
                            </div>
                        </aside>
                    </div>
                </motion.section>
            </div>

            {/* ===================================================== */}
            {/* SUBMISSION MODAL */}
            {/* ===================================================== */}

            {showSubmissionForm && (
                <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
                    <div className="flex min-h-full items-center justify-center py-8">

                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.97,
                                y: 10,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#101019] shadow-2xl"
                        >

                            {/* Modal header */}
                            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                                        {hackathon.name}
                                    </p>

                                    <h2 className="mt-1 text-xl font-bold text-white">
                                        Submit Your Project
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Your hackathon is already selected. Choose your team/problem statement and submit the project.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeSubmissionForm
                                    }
                                    disabled={submitting}
                                    className="rounded-lg p-2 text-gray-500 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                                >
                                    <X size={22} />
                                </button>
                            </div>

                            {/* Modal form */}
                            <form
                                onSubmit={
                                    handleSubmission
                                }
                                className="p-6"
                            >

                                {submissionError && (
                                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-300">
                                        <AlertCircle
                                            size={18}
                                            className="mt-0.5 shrink-0"
                                        />

                                        <span>
                                            {
                                                submissionError
                                            }
                                        </span>
                                    </div>
                                )}

                                {/* Team + Problem Statement */}
                                <div className="mb-6 grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-300">
                                            Team
                                            <span className="ml-1 text-rose-400">*</span>
                                        </label>

                                        <select
                                            name="team_id"
                                            value={submissionForm.team_id}
                                            onChange={handleSubmissionChange}
                                            disabled={teamsLoading}
                                            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="" className="bg-[#101019]">
                                                {teamsLoading
                                                    ? 'Loading teams...'
                                                    : teams.length
                                                      ? 'Select your team'
                                                      : 'No teams available'}
                                            </option>

                                            {teams.map((team) => (
                                                <option
                                                    key={team.id}
                                                    value={team.id}
                                                    className="bg-[#101019]"
                                                >
                                                    {team.name || 'Unnamed Team'}
                                                    {team.member_count != null
                                                        ? ` • ${team.member_count}/${team.max_members ?? '?'} members`
                                                        : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-300">
                                            Problem Statement
                                        </label>

                                        <select
                                            name="problem_statement_id"
                                            value={submissionForm.problem_statement_id}
                                            onChange={handleSubmissionChange}
                                            disabled={problemsLoading}
                                            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="" className="bg-[#101019]">
                                                {problemsLoading
                                                    ? 'Loading problem statements...'
                                                    : problems.length
                                                      ? 'Select problem statement'
                                                      : 'No problem statement selected'}
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
                                    </div>
                                </div>

                                <div className="space-y-5">

                                    {/* Project name */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-300">
                                            Project Name
                                            <span className="ml-1 text-rose-400">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            name="project_name"
                                            value={
                                                submissionForm.project_name
                                            }
                                            onChange={
                                                handleSubmissionChange
                                            }
                                            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/40 focus:bg-white/[0.06]"
                                            placeholder="e.g. CampusForge AI"
                                            minLength={2}
                                            maxLength={255}
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-300">
                                            Project Description
                                            <span className="ml-1 text-rose-400">
                                                *
                                            </span>
                                        </label>

                                        <textarea
                                            name="description"
                                            value={
                                                submissionForm.description
                                            }
                                            onChange={
                                                handleSubmissionChange
                                            }
                                            className="min-h-[140px] w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/40 focus:bg-white/[0.06]"
                                            placeholder="Explain what your project does, the problem it solves, its features and how it works..."
                                            minLength={10}
                                            required
                                        />

                                        <p className="mt-1 text-right text-xs text-gray-600">
                                            {
                                                submissionForm
                                                    .description
                                                    .length
                                            }{' '}
                                            characters
                                        </p>
                                    </div>

                                    {/* Tech stack */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-300">
                                            Tech Stack
                                        </label>

                                        <input
                                            name="tech_stack"
                                            value={
                                                submissionForm.tech_stack
                                            }
                                            onChange={
                                                handleSubmissionChange
                                            }
                                            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/40 focus:bg-white/[0.06]"
                                            placeholder="React, FastAPI, PostgreSQL, Python"
                                        />

                                        <p className="mt-1 text-xs text-gray-600">
                                            Separate technologies using commas.
                                        </p>
                                    </div>

                                    {/* URLs */}
                                    <div className="grid gap-5 md:grid-cols-2">

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-300">
                                                GitHub Repository
                                                <span className="ml-1 text-rose-400">
                                                    *
                                                </span>
                                            </label>

                                            <div className="relative">
                                                <Code2Icon
                                                    size={17}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                                                />

                                                <input
                                                    name="github_url"
                                                    value={
                                                        submissionForm.github_url
                                                    }
                                                    onChange={
                                                        handleSubmissionChange
                                                    }
                                                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/40 focus:bg-white/[0.06]"
                                                    placeholder="https://github.com/username/project"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-300">
                                                Live Demo URL
                                            </label>

                                            <div className="relative">
                                                <ExternalLink
                                                    size={17}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                                                />

                                                <input
                                                    name="demo_url"
                                                    value={
                                                        submissionForm.demo_url
                                                    }
                                                    onChange={
                                                        handleSubmissionChange
                                                    }
                                                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/40 focus:bg-white/[0.06]"
                                                    placeholder="https://your-project.vercel.app"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-7 flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">

                                    <button
                                        type="button"
                                        onClick={
                                            closeSubmissionForm
                                        }
                                        disabled={submitting}
                                        className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-gray-300 hover:bg-white/[0.08] disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-6 py-3 text-sm font-bold text-[#09090f] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {submitting ? (
                                            <>
                                                <RefreshCw
                                                    size={17}
                                                    className="animate-spin"
                                                />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send
                                                    size={17}
                                                />
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
        </main>
    )
}

function ArrowRightIcon() {
    return (
        <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
        </svg>
    )
}