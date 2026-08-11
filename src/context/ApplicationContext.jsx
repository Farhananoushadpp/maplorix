// Application Context for managing application state across components safely without duplicates
import React, { createContext, useContext, useState, useEffect } from 'react'

const ApplicationContext = createContext()

export const ApplicationProvider = ({ children }) => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Listen for application submission events
  useEffect(() => {
    const handleApplicationSubmitted = (event) => {
      if (import.meta.env.DEV) {
        console.log('Application submitted event received:', event.detail)
      }

      const newApp = event.detail?.application || event.detail
      if (!newApp) return

      // Add the new application to state with deduplication by ID
      setApplications((prev) => {
        const id = newApp._id || newApp.id
        if (id && prev.some((app) => (app._id || app.id) === id)) {
          return prev // Skip duplicate
        }
        return [newApp, ...prev]
      })
    }

    window.addEventListener('applicationPosted', handleApplicationSubmitted)
    window.addEventListener('applicationSubmitted', handleApplicationSubmitted)

    return () => {
      window.removeEventListener('applicationPosted', handleApplicationSubmitted)
      window.removeEventListener('applicationSubmitted', handleApplicationSubmitted)
    }
  }, [])

  const value = {
    applications,
    loading,
    error,
    setApplications,
    setLoading,
    setError,
  }

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  )
}

export const useApplicationContext = () => {
  const context = useContext(ApplicationContext)
  if (!context) {
    throw new Error(
      'useApplicationContext must be used within an ApplicationProvider'
    )
  }
  return context
}

export default ApplicationContext
