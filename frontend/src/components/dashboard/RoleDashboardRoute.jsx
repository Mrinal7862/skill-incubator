import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@clerk/react'

// Layout
import DashboardLayout from './DashboardLayout'

// Dashboards
import StudentDashboard from '../../pages/dashboard/StudentDashboard'
import OrganizerDashboard from '../../pages/dashboard/OrganizerDashboard'

// Student Pages
import Hackathons from '../../pages/student/Hackathons'
import HackathonDetails from '../../pages/student/HackathonDetails'
import MyTeams from '../../pages/student/MyTeams'
import MyRegistrations from '../../pages/student/MyRegistrations'
import StudentResults from '../../pages/student/Results'
import MySubmissions from '../../pages/student/MySubmissions'

// Organizer Pages
import MyHackathons from '../../pages/organizer/MyHackathons'
import CreateHackathon from '../../pages/organizer/CreateHackathon'
import ManageHackathon from '../../pages/organizer/ManageHackathon'
import EditHackathon from '../../pages/organizer/EditHackathon'
import ProblemStatements from '../../pages/organizer/ProblemStatements'
import Participants from '../../pages/organizer/Participants'
import Submissions from '../../pages/organizer/Submissions'
import Evaluation from '../../pages/organizer/Evaluation'
import Results from '../../pages/organizer/Results'
import Analytics from '../../pages/organizer/Analytics'

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:8000/api/v1'

export default function RoleDashboardRoute({ allowedRole }) {
    const { isLoaded, isSignedIn, getToken } = useAuth()

    const [user, setUser] = useState(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

        async function loadUser() {
            if (!isLoaded) return

            if (!isSignedIn) {
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError('')

                const token = await getToken()

                if (!token) {
                    throw new Error(
                        'Unable to get your login session token.'
                    )
                }

                const response = await fetch(
                    `${API_BASE_URL}/auth/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                if (!response.ok) {
                    if (
                        response.status === 401 ||
                        response.status === 403
                    ) {
                        throw new Error(
                            'Your account could not be verified by the backend. Clerk token verification and account sync may need to be configured.'
                        )
                    }

                    throw new Error(
                        `Backend request failed (${response.status}).`
                    )
                }

                const data = await response.json()

                if (
                    !['STUDENT', 'ORGANIZER'].includes(
                        data.role
                    )
                ) {
                    throw new Error(
                        'Your account has an invalid role.'
                    )
                }

                if (!cancelled) {
                    setUser(data)
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.message ||
                            'Something went wrong.'
                    )
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadUser()

        return () => {
            cancelled = true
        }
    }, [isLoaded, isSignedIn, getToken])

    // Loading
    if (!isLoaded || loading) {
        return (
            <div className="grid min-h-screen place-items-center bg-[#09090f] text-gray-300">
                Loading your dashboard...
            </div>
        )
    }

    // Not logged in
    if (!isSignedIn) {
        return <Navigate to="/login" replace />
    }

    // Backend error
    if (error) {
        return (
            <div className="grid min-h-screen place-items-center bg-[#09090f] p-6 text-white">
                <div className="max-w-lg rounded-2xl border border-white/10 p-6">
                    <h1 className="text-xl font-bold">
                        Dashboard unavailable
                    </h1>

                    <p className="mt-3 text-sm text-gray-400">
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            window.location.reload()
                        }
                        className="mt-5 rounded-xl bg-violet-600 px-4 py-2 hover:bg-violet-500"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    // Wrong role
    if (user.role !== allowedRole) {
        return (
            <Navigate
                to={
                    user.role === 'ORGANIZER'
                        ? '/organizer'
                        : '/student'
                }
                replace
            />
        )
    }

    return (
        <DashboardLayout
            role={user.role}
            user={user}
        >
            {allowedRole === 'STUDENT' ? (
                // STUDENT ROUTES
                <Routes>

                    {/* Dashboard */}
                    <Route
                        index
                        element={<StudentDashboard />}
                    />

                    {/* Explore Hackathons */}
                    <Route
                        path="hackathons"
                        element={<Hackathons />}
                    />

                    {/* Hackathon Details */}
                    <Route
                        path="hackathons/:id"
                        element={<HackathonDetails />}
                    />

                    {/* My Registrations */}
                    <Route
                        path="registrations"
                        element={<MyRegistrations />}
                    />

                    {/* My Teams */}
                    <Route
                        path="teams"
                        element={<MyTeams />}
                    />

                    {/* My Submissions */}
                    <Route
                        path="submissions"
                        element={<MySubmissions />}
                    />

                    {/* Results */}
                    <Route
                        path="results"
                        element={<StudentResults />}
                    />

                    {/* Student fallback */}
                    <Route
                        path="*"
                        element={<StudentDashboard />}
                    />

                </Routes>
            ) : (
                // ORGANIZER ROUTES
                <Routes>

                    {/* Organizer Dashboard */}
                    <Route
                        index
                        element={<OrganizerDashboard />}
                    />

                    {/* Hackathons */}
                    <Route
                        path="hackathons"
                        element={<MyHackathons />}
                    />

                    {/* Create Hackathon */}
                    <Route
                        path="hackathons/new"
                        element={<CreateHackathon />}
                    />

                    {/* Manage Hackathon */}
                    <Route
                        path="hackathons/:id/manage"
                        element={<ManageHackathon />}
                    />

                    {/* Edit Hackathon */}
                    <Route
                        path="hackathons/:id/edit"
                        element={<EditHackathon />}
                    />

                    {/* Problem Statements */}
                    <Route
                        path="hackathons/:id/problems"
                        element={<ProblemStatements />}
                    />

                    {/* Participants */}
                    <Route
                        path="participants"
                        element={<Participants />}
                    />

                    {/* Submissions */}
                    <Route
                        path="submissions"
                        element={<Submissions />}
                    />

                    Evaluation
                    <Route
                        path="evaluation"
                        element={<Evaluation />}
                    />

                    {/* Results */}
                    <Route
                        path="results"
                        element={<Results />}
                    />

                    {/* Analytics */}
                    <Route
                        path="analytics"
                        element={<Analytics />}
                    />

                    {/* Organizer fallback */}
                    <Route
                        path="*"
                        element={<OrganizerDashboard />}
                    />

                </Routes>
            )}
        </DashboardLayout>
    )
}