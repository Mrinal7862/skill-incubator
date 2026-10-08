
import { Routes, Route, Link } from 'react-router-dom'
import { SignIn, SignUp, useUser, UserButton } from '@clerk/react'
import RoleDashboardRoute from '../components/dashboard/RoleDashboardRoute'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Zap,
  Box,
  HandFist,
  Users,
  Trophy,
  Code2,
  Sparkles,
} from 'lucide-react'

const features = [
  {
    number: '01',
    title: 'Discover Hackathons',
    description: 'Find opportunities to challenge your skills.',
    icon: Zap,
    color: 'cyan',
    to: '/student/hackathons',
  },
  {
    number: '02',
    title: 'Build Your Team',
    description: 'Collaborate with people who share your vision.',
    icon: Users,
    color: 'pink',
    to: '/student/teams',
  },
  {
    number: '03',
    title: 'Showcase Projects',
    description: 'Turn your ideas into real-world solutions.',
    icon: Trophy,
    color: 'orange',
    to: '/student/submissions',
  },
]

function Home() {
  const { isLoaded, isSignedIn, user } = useUser()

  // The role should be assigned by your trusted backend/admin.
  const role = String(
    user?.publicMetadata?.role ?? 'STUDENT'
  ).toUpperCase()

  const dashboardPath =
    role === 'ORGANIZER' ? '/organizer' : '/student'

  return (
    <main className="cyber-bg min-h-screen overflow-hidden text-white">
      <div className="scanlines" />

      {/* Navigation */}
      <nav className="navbar">
        <Link to="/" className="brand glitch-logo">
          <span className="brand-icon">
            <Code2 size={24} />
          </span>

          <span>
            Skill<span className="text-cyan-400">Incubator</span>
          </span>
        </Link>

        <div className="nav-links">
          <a href="#home" className="nav-active">
            Home
          </a>
          <a href="#features">Hackathons</a>
          <a href="#features">Explore</a>
          <a href="#about">About</a>
        </div>

        {/* Auth-aware navbar */}
        <div className="nav-actions">
          {!isLoaded ? (
            <span className="text-sm text-cyan-300">
              Loading...
            </span>
          ) : isSignedIn ? (
            <>
              <Link
                to={dashboardPath}
                className="cyber-button primary"
              >
                Dashboard <ArrowRight size={16} />
              </Link>

              <div className="flex items-center">
                <UserButton />
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="cyber-button secondary"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="cyber-button primary"
              >
                Get Started <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="hero">
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="eyebrow"
          >
            <span className="eyebrow-line" />
            COLLEGE HACKATHONS & INNOVATION
            <span className="text-cyan-400">_</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="hero-title glitch-title"
          >
            TURN YOUR
            <br />
            SKILLS INTO
            <br />
            <span className="neon-gradient">
              REAL SOLUTIONS.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hero-description"
          >
            Discover hackathons, build teams, solve real-world
            problems, and turn your ideas into projects that matter.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="hero-actions"
          >
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                to={
                  isLoaded && isSignedIn
                    ? dashboardPath
                    : '/register'
                }
                className="cyber-button primary hero-button"
              >
                {isLoaded && isSignedIn
                  ? 'Open Dashboard'
                  : 'Start Building'}
                <ArrowRight size={20} />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                to={
                  isLoaded && isSignedIn
                    ? '/student/hackathons'
                    : '/login'
                }
                className="cyber-button secondary hero-button"
              >
                {isLoaded && isSignedIn
                  ? 'Explore Hackathons'
                  : 'Explore Your Portal'}
              </Link>
            </motion.div>
          </motion.div>

          <div className="hero-tags">
            <span>● BUILD</span>
            <span>● SOLVE</span>
            <span>● INNOVATE</span>
            <span>● REPEAT</span>
          </div>
        </div>

        {/* Animated portal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="portal-scene"
        >
          <div className="portal-grid" />
          <div className="portal-ring ring-one" />
          <div className="portal-ring ring-two" />

          <div className="portal-core">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="portal-symbol"
            >
              <Code2 size={76} strokeWidth={1.2} />
            </motion.div>

            <span>CREATE_THE_FUTURE</span>
          </div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity }}
            className="floating-label label-top"
          >
            <Sparkles size={15} />
            IDEAS → IMPACT
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="floating-label label-bottom"
          >
            &lt;/&gt; INNOVATION ONLINE
          </motion.div>
        </motion.div>
      </section>

      {/* Feature cards */}
      {/* Feature cards */}
      <section id="features" className="features">
        {features.map(
          ({ number, title, description, icon: Icon, color, to }, i) => (
            <Link
              key={number}
              to={to}
              className="block h-full"
              aria-label={`Go to ${title}`}
            >
              <motion.article
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`glitch-card ${color} h-full cursor-pointer`}
              >
                <div className="card-top">
                  <span className="card-number">{number}</span>

                  <span className="icon-frame">
                    <Icon size={26} />
                  </span>
                </div>

                <h2>{title}</h2>
                <p>{description}</p>

                <ArrowRight className="card-arrow" size={23} />
              </motion.article>
            </Link>
          )
        )}
      </section>

      {/* Footer */}
      <footer id="about" className="footer">
        <span>
          <Zap size={18} /> Real Challenges
        </span>
        <span>
          <Users size={18} /> Talented Peers
        </span>
        <span>
          <Code2 size={18} /> Amazing Projects
        </span>
        <span>
          <Sparkles size={18} /> New Opportunities
        </span>
      </footer>

      <footer className="footer">
        <span>
          <Box size={18} /> Developed by → C Minus Minus
        </span>
        <span>
          <Users size={18} /> Lead Developer · Mrinal Devnath
        </span>
        <span>
          <HandFist size={18} /> Supporting & Tester · Sujal Gupta
        </span>
      </footer>
    </main>
  )
}

function Placeholder({ title }) {
  return (
    <main className="cyber-bg placeholder">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="glitch-title">{title}</h1>
        <p>This page is under development.</p>

        <Link to="/" className="cyber-button primary">
          ← Back to Home
        </Link>
      </motion.div>
    </main>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Homepage */}
      <Route path="/" element={<Home />} />

      {/* Clerk Login */}
      <Route
        path="/login/*"
        element={
          <main className="cyber-bg min-h-screen flex items-center justify-center p-4">
            <SignIn
              routing="path"
              path="/login"
              signUpUrl="/register"
              forceRedirectUrl="/"
            />
          </main>
        }
      />

      {/* Clerk Registration */}
      <Route
        path="/register/*"
        element={
          <main className="cyber-bg min-h-screen flex items-center justify-center p-4">
            <SignUp
              routing="path"
              path="/register"
              signInUrl="/login"
              forceRedirectUrl="/"
            />
          </main>
        }
      />

      {/* Role-protected dashboards */}
      <Route
        path="/student/*"
        element={<RoleDashboardRoute allowedRole="STUDENT" />}
      />

      <Route
        path="/organizer/*"
        element={<RoleDashboardRoute allowedRole="ORGANIZER" />}
      />

      {/* 404 */}
      <Route
        path="*"
        element={<Placeholder title="404 — NOT FOUND" />}
      />
    </Routes>
  )
}
