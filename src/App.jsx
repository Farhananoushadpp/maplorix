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

import React, { useEffect } from 'react'

// Context

import { AuthProvider } from './context/AuthContext'

import { ApplicationProvider } from './context/ApplicationContext'

import { DataProvider } from './context/DataContext'

// Components

import Header from './components/Header'
import Footer from './components/Footer'

import ScrollToTop from './components/ScrollToTop'

import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import { RouteAccess } from './components/RouteAccess'

// Pages

import Home from './pages/Home'

import AboutPage from './pages/About'

import JobPostPage from './pages/JobPost'

import ApplicationsPage from './pages/Applications'

import ContactPage from './pages/ContactPage'

import Login from './pages/Login'

import Register from './pages/Register'

import Dashboard from './pages/Dashboard'

import AdminPosts from './pages/AdminPosts'

import PostsFeed from './pages/PostsFeed'

import ApplyJob from './pages/ApplyJob'

import AllApplications from './pages/AllApplications'

import AllApplicationsEnhanced from './pages/AllApplicationsEnhanced'

import AllJobs from './pages/AllJobs'

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
        {/* Public Routes - Accessible to everyone */}
        <Route
          path={ROUTES.HOME}
          element={
            <RouteAccess path="/home">
              <motion.div
                variants={ANIMATION_VARIANTS.pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Home />
              </motion.div>
            </RouteAccess>
          }
        />

        <Route
          path={ROUTES.ABOUT}
          element={
            <RouteAccess path="/about">
              <motion.div
                variants={ANIMATION_VARIANTS.pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <AboutPage />
              </motion.div>
            </RouteAccess>
          }
        />

        <Route
          path={ROUTES.CONTACT}
          element={
            <RouteAccess path="/contact">
              <motion.div
                variants={ANIMATION_VARIANTS.pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <ContactPage />
              </motion.div>
            </RouteAccess>
          }
        />

        <Route
          path={ROUTES.POSTS_FEED}
          element={
            <RouteAccess path="/feed">
              <motion.div
                variants={ANIMATION_VARIANTS.pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <PostsFeed />
              </motion.div>
            </RouteAccess>
          }
        />

        {/* Auth Routes - Redirect authenticated users */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes - Require authentication */}
        <Route
          path="/dashboard"
          element={
            <RouteAccess path="/dashboard">
              <Dashboard />
            </RouteAccess>
          }
        />

        <Route
          path={ROUTES.ADMIN_POSTS}
          element={
            <RouteAccess path="/admin-posts">
              <motion.div
                variants={ANIMATION_VARIANTS.pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <AdminPosts />
              </motion.div>
            </RouteAccess>
          }
        />

        {/* Additional Routes */}
        <Route
          path={ROUTES.POST_JOB}
          element={
            <ProtectedRoute>
              <motion.div
                variants={ANIMATION_VARIANTS.pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <JobPostPage />
              </motion.div>
            </ProtectedRoute>
          }
        />

        <Route path="/apply" element={<ApplyJob />} />
        <Route path="/all-applications" element={<AllApplications />} />
        <Route
          path="/all-applications-enhanced"
          element={<AllApplicationsEnhanced />}
        />
        <Route path="/all-jobs" element={<AllJobs />} />
        <Route path="/applications" element={<ApplicationsPage />} />

        {/* Catch all route */}
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
  // Global error handler for unhandled promise rejections (especially reCAPTCHA)
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      // Prevent reCAPTCHA timeout errors from crashing the app
      if (
        event.reason &&
        event.reason.message &&
        event.reason.message.includes('timeout')
      ) {
        console.warn('reCAPTCHA timeout handled:', event.reason)
        event.preventDefault()
        return
      }
      // Log other unhandled rejections
      console.error('Unhandled promise rejection:', event.reason)
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  // Global event listener for application events
  useEffect(() => {
    const handleApplicationPosted = (event) => {
      console.log(
        '🌐 Global App received applicationPosted event:',
        event.detail
      )

      // Store in dashboardApplications sessionStorage for Dashboard to pick up when it mounts
      const newApplication = event.detail.application
      if (newApplication) {
        const existingApps = JSON.parse(
          sessionStorage.getItem('dashboardApplications') || '[]'
        )
        existingApps.unshift(newApplication) // Add to beginning
        sessionStorage.setItem(
          'dashboardApplications',
          JSON.stringify(existingApps)
        )
        console.log(
          '🌐 Stored application in dashboardApplications sessionStorage'
        )
      }
    }

    const handleJobPosted = (event) => {
      console.log('🌐 Global App received jobPosted event:', event.detail)

      // Store in dashboard_jobs sessionStorage for Dashboard to pick up when it mounts
      const newJob = event.detail.job
      if (newJob) {
        const existingJobs = JSON.parse(
          sessionStorage.getItem('dashboard_jobs') || '[]'
        )
        existingJobs.unshift(newJob) // Add to beginning
        sessionStorage.setItem('dashboard_jobs', JSON.stringify(existingJobs))
        console.log(
          '🌐 Global App: Stored job in dashboard_jobs sessionStorage'
        )
      }
    }

    // Add global event listeners
    window.addEventListener('applicationPosted', handleApplicationPosted)
    window.addEventListener('jobPosted', handleJobPosted)

    // Clean up on unmount
    return () => {
      window.removeEventListener('applicationPosted', handleApplicationPosted)
      window.removeEventListener('jobPosted', handleJobPosted)
    }
  }, [])

  return (
    <AuthProvider>
      <ApplicationProvider>
        <DataProvider>
          <Router>
            <Header />

            <AnimatedRoutes />

            <Footer />

            <ScrollToTop />
          </Router>
        </DataProvider>
      </ApplicationProvider>
    </AuthProvider>
  )
}

export default App
