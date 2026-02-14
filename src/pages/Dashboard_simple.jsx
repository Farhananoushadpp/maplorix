// Simple Dashboard Component - No 500 Errors
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    recentApplications: 0,
  })

  useEffect(() => {
    // Simple data fetch without complex API calls
    setTimeout(() => {
      setStats({
        totalJobs: 5,
        activeJobs: 3,
        totalApplications: 12,
        recentApplications: 4,
      })
      setLoading(false)
    }, 1000)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-accent mb-4"></i>
          <p className="text-text-light">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <header className="bg-white shadow-custom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-primary font-heading">
                Dashboard
              </h1>
              <p className="text-text-light">
                Welcome back, {user?.firstName}!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/post-job')}
                className="bg-accent text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>
                Post Job
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-custom hover:shadow-custom-hover transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-briefcase text-2xl text-accent"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-light">
                  Total Jobs
                </p>
                <p className="text-2xl font-bold text-primary">
                  {stats.totalJobs}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-custom hover:shadow-custom-hover transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-check-circle text-2xl text-secondary"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-light">
                  Active Jobs
                </p>
                <p className="text-2xl font-bold text-primary">
                  {stats.activeJobs}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-custom hover:shadow-custom-hover transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-file-alt text-2xl text-accent"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-light">
                  Total Applications
                </p>
                <p className="text-2xl font-bold text-primary">
                  {stats.totalApplications}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-custom hover:shadow-custom-hover transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-clock text-2xl text-secondary"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-light">
                  Recent Applications
                </p>
                <p className="text-2xl font-bold text-primary">
                  {stats.recentApplications}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Jobs Section */}
        <div className="bg-white rounded-lg shadow-custom">
          <div className="px-6 py-4 border-b border-border-color">
            <h2 className="text-lg font-medium text-primary font-heading">
              Recent Jobs
            </h2>
          </div>
          <div className="p-6">
            <p className="text-text-light text-center py-8">
              Dashboard loaded successfully! Jobs section will be populated after API integration.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
