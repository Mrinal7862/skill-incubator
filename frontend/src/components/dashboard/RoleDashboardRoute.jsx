import MyHackathons from '../../pages/organizer/MyHackathons'
import Analytics from '../../pages/organizer/Analytics'
import Evaluation from '../../pages/organizer/Evaluation'
import Submissions from '../../pages/organizer/Submissions'
import Results from '../../pages/organizer/Results'
import Participants from '../../pages/organizer/Participants'
import EditHackathon from '../../pages/organizer/EditHackathon'
import ManageHackathon from '../../pages/organizer/ManageHackathon'
import ProblemStatements from '../../pages/organizer/ProblemStatements'
import CreateHackathon from '../../pages/organizer/CreateHackathon'
import { useEffect, useState } from 'react'
import MyTeams from '../../pages/student/MyTeams'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import DashboardLayout from './DashboardLayout'
import { Route, Routes } from 'react-router-dom'
import Hackathons from '../../pages/student/Hackathons'
import HackathonDetails from '../../pages/student/HackathonDetails'
import StudentDashboard from '../../pages/dashboard/StudentDashboard'
import OrganizerDashboard from '../../pages/dashboard/OrganizerDashboard'

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

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
                    throw new Error('Unable to get your login session token.')
                }

                const response = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        throw new Error(
                            'Your account could not be verified by the backend. Clerk token verification and account sync may need to be configured.'
                        )
                    }

                    throw new Error(`Backend request failed (${response.status}).`)
                }

                const data = await response.json()

                if (!['STUDENT', 'ORGANIZER'].includes(data.role)) {
                    throw new Error('Your account has an invalid role.')
                }

                if (!cancelled) setUser(data)
            } catch (err) {
                if (!cancelled) setError(err.message || 'Something went wrong.')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        loadUser()

        return () => {
            cancelled = true
        }
    }, [isLoaded, isSignedIn, getToken])

    if (!isLoaded || loading) {
        return (
            <div className="grid min-h-screen place-items-center bg-[#09090f] text-gray-300">
                Loading your dashboard...
            </div>
        )
    }

    if (!isSignedIn) {
        return <Navigate to="/login" replace />
    }

    if (error) {
        return (
            <div className="grid min-h-screen place-items-center bg-[#09090f] p-6 text-white">
                <div className="max-w-lg rounded-2xl border border-white/10 p-6">
                    <h1 className="text-xl font-bold">Dashboard unavailable</h1>
                    <p className="mt-3 text-sm text-gray-400">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-5 rounded-xl bg-violet-600 px-4 py-2"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    if (user.role !== allowedRole) {
        return (
            <Navigate
                to={user.role === 'ORGANIZER' ? '/organizer' : '/student'}
                replace
            />
        )
    }

    return (
        <DashboardLayout role={user.role} user={user}>
            {allowedRole === 'STUDENT' ? (
                <Routes>
                    <Route index element={<StudentDashboard />} />

                    <Route path="teams" element={<MyTeams />} />
                    <Route index element={<OrganizerDashboard />} />

                    <Route path="hackathons" element={<MyHackathons />} />

                    <Route path="hackathons/new" element={<CreateHackathon />} />

                    <Route path="*" element={<OrganizerDashboard />} />

                    <Route
                        path="hackathons"
                        element={<Hackathons />}
                    />

                    <Route
                        path="hackathons/:id"
                        element={<HackathonDetails />}
                    />

                    <Route
                        path="*"
                        element={<StudentDashboard />}
                    />
                </Routes>
            ) : (
                <Routes>
                    <Route index element={<OrganizerDashboard />} />

                    <Route
                        path="hackathons"
                        element={<MyHackathons />}
                    />

                    <Route
                        path="hackathons/new"
                        element={<CreateHackathon />}
                    />

                    <Route
                        path="hackathons/:id/manage"
                        element={<ManageHackathon />}
                    />

                    <Route
                        path="hackathons/:id/edit"
                        element={<EditHackathon />}
                    />

                    <Route path="evaluation" element={<Evaluation />} />

                    <Route
                        path="*"
                        element={<OrganizerDashboard />}
                    />
                    <Route
                        path="hackathons/:id/problems"
                        element={<ProblemStatements />}
                    />
                    <Route path="participants" element={<Participants />} />
                    <Route path="submissions" element={<Submissions />} />
                    <Route path="results" element={<Results />} />
                    <Route path="analytics" element={<Analytics />} />
                </Routes>

            )}
        </DashboardLayout>
    )
}
