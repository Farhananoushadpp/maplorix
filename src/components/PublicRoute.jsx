/**
 * Public Route Component
 * 
 * For routes that should not be accessible to authenticated users (login, register)
 * Redirects authenticated users to dashboard or intended destination
 */

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <p className="mt-4 text-text-light">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect authenticated users away from public routes
  if (isAuthenticated) {
    // Check if there's a redirect destination from state
    const from = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={from} replace />
  }

  return children
}

export default PublicRoute
