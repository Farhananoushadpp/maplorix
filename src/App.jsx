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

// Pages

import Home from './pages/Home'

import AboutPage from './pages/About'

import JobPostPage from './pages/JobPost'

import ApplicationsPage from './pages/Applications'

import ContactPage from './pages/ContactPage'

import Login from './pages/Login'

import Dashboard from './pages/Dashboard'

import AdminPosts from './pages/AdminPosts'

import PostsFeed from './pages/PostsFeed'

import ApplyJob from './pages/ApplyJob'

// Constants

import { ANIMATION_VARIANTS, ROUTES } from './constants'

/**

 * AnimatedRoutes component for page transitions

 * @returns {JSX.Element} Animated routes

 */

const AnimatedRoutes = () => {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path={ROUTES.HOME}
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
          path={ROUTES.ABOUT}
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
          path={ROUTES.POST_JOB}
          element={
            <motion.div
              variants={ANIMATION_VARIANTS.pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <JobPostPage />
            </motion.div>
          }
        />

        <Route
          path={ROUTES.CONTACT}
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

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/applications" element={<ApplicationsPage />} />

        <Route
          path="/apply"
          element={
            <motion.div
              variants={ANIMATION_VARIANTS.pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <ApplyJob />
            </motion.div>
          }
        />

        <Route
          path={ROUTES.ADMIN_POSTS}
          element={
            <motion.div
              variants={ANIMATION_VARIANTS.pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AdminPosts />
            </motion.div>
          }
        />

        <Route
          path={ROUTES.POSTS_FEED}
          element={
            <motion.div
              variants={ANIMATION_VARIANTS.pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <PostsFeed />
            </motion.div>
          }
        />

        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
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
