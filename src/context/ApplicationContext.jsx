// Application Context for managing application state across components
import React, { createContext, useContext, useState, useEffect } from 'react'

const ApplicationContext = createContext()

export const ApplicationProvider = ({ children }) => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Listen for application submission events
  useEffect(() => {
    const handleApplicationSubmitted = (event) => {
      console.log('Application submitted event received:', event.detail)

      // Add the new application to the state
      const newApplication = event.detail.application
      setApplications((prev) => [newApplication, ...prev])
    }

    // Add event listener - changed from applicationSubmitted to applicationPosted
    window.addEventListener('applicationPosted', handleApplicationSubmitted)

    // Clean up event listener
    return () => {
      window.removeEventListener(
        'applicationPosted',
        handleApplicationSubmitted
      )
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
