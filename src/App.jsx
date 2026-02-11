/**

 * Main App Component

 * Root component with routing and animations

 */

import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from 'react-router-dom'

import { motion, AnimatePresence } from 'framer-motion'

// Context

import { AuthProvider } from './context/AuthContext'

// Components

import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'

// Pages

import Home from './pages/Home'
import AboutPage from './pages/About'
import ContactPage from './pages/ContactPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PostJob from './pages/PostJob'
import ApplyJob from './pages/ApplyJob'
import CandidateSearch from './pages/CandidateSearch'

// Constants

import { ANIMATION_VARIANTS } from './constants'

/**

 * AnimatedRoutes component for page transitions

 * @returns {JSX.Element} Animated routes

 */

const AnimatedRoutes = () => {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <motion.div
              variants={ANIMATION_VARIANTS.pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Home />
            </motion.div>
          }
        />

        <Route
          path="/about"
          element={
            <motion.div
              variants={ANIMATION_VARIANTS.pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AboutPage />
            </motion.div>
          }
        />

        <Route
          path="/contact"
          element={
            <motion.div
              variants={ANIMATION_VARIANTS.pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <ContactPage />
            </motion.div>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/apply" element={<ApplyJob />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <motion.div
                variants={ANIMATION_VARIANTS.pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Dashboard />
              </motion.div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/post-job"
          element={
            <ProtectedRoute>
              <motion.div
                variants={ANIMATION_VARIANTS.pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <PostJob />
              </motion.div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate-search"
          element={
            <ProtectedRoute>
              <motion.div
                variants={ANIMATION_VARIANTS.pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <CandidateSearch />
              </motion.div>
            </ProtectedRoute>
          }
        />

        {/* Redirect old routes */}
        <Route path="/signup" element={<Navigate to="/register" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

/**

 * Main App component

 * @returns {JSX.Element} App component

 */

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <AnimatedRoutes />
        <Footer />
        <ScrollToTop />
      </Router>
    </AuthProvider>
  )
}

export default App
