import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Public pages that all users can access
const PUBLIC_PAGES = ['/home', '/about', '/feed', '/contact']

// Admin-only pages
const ADMIN_PAGES = ['/dashboard', '/admin-posts', '/applications']

// Protected Route Component
export const ProtectedRoute = ({ children, requiredRole = 'user' }) => {
  const { user, isAuthenticated, isLoading } = useAuth()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check if user has required role
  if (requiredRole === 'admin' && user?.role !== 'admin') {
    // Regular users trying to access admin pages get redirected to home
    return <Navigate to="/home" replace />
  }

  // If authenticated and has correct role, allow access
  return children
}

// Route Access Checker Component
export const RouteAccess = ({ children, path }) => {
  const { user, isAuthenticated, isLoading } = useAuth()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  // Public pages - always accessible
  if (PUBLIC_PAGES.includes(path)) {
    return children
  }

  // Admin pages - require admin role
  if (ADMIN_PAGES.includes(path)) {
    if (!isAuthenticated || user?.role !== 'admin') {
      return <Navigate to="/home" replace />
    }
    return children
  }

  // Other pages - require authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Hook to check if user can access a specific page
export const usePageAccess = (path) => {
  const { user, isAuthenticated } = useAuth()

  // Public pages - everyone can access
  if (PUBLIC_PAGES.includes(path)) {
    return { canAccess: true, reason: 'public' }
  }

  // Admin pages - only admin can access
  if (ADMIN_PAGES.includes(path)) {
    const canAccess = isAuthenticated && user?.role === 'admin'
    return { 
      canAccess, 
      reason: canAccess ? 'admin' : 'admin_required' 
    }
  }

  // Other pages - require authentication
  const canAccess = isAuthenticated
  return { 
    canAccess, 
    reason: canAccess ? 'authenticated' : 'login_required' 
  }
}
