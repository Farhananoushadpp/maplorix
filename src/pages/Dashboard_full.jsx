// Dashboard Page Component - Full Version with Recent Applications
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalJobs: 5,
    activeJobs: 3,
    totalApplications: 12,
    recentApplications: 4,
  })

  // Mock recent applications data
  const [recentApplications, setRecentApplications] = useState([
    {
      _id: 'app1',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      jobRole: 'Software Developer',
      status: 'submitted',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'app2',
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      jobRole: 'UX Designer',
      status: 'under-review',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      _id: 'app3',
      fullName: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      jobRole: 'Project Manager',
      status: 'shortlisted',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      _id: 'app4',
      fullName: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      jobRole: 'Marketing Specialist',
      status: 'submitted',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
  ])

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setStats({
        totalJobs: 5,
        activeJobs: 3,
        totalApplications: recentApplications.length,
        recentApplications: recentApplications.length,
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

          <div 
            className="bg-white p-6 rounded-lg shadow-custom hover:shadow-custom-hover transition-shadow cursor-pointer"
            onClick={() => navigate('/applications')}
          >
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
                <p className="text-xs text-accent mt-1">Click to view</p>
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

        {/* Recent Jobs and Applications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Jobs */}
          <div className="bg-white rounded-lg shadow-custom">
            <div className="px-6 py-4 border-b border-border-color">
              <h2 className="text-lg font-medium text-primary font-heading">
                Recent Jobs
              </h2>
            </div>
            <div className="p-6">
              <p className="text-text-light text-center py-8">
                Jobs section will be populated after API integration.
              </p>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-lg shadow-custom">
            <div className="px-6 py-4 border-b border-border-color">
              <h2 className="text-lg font-medium text-primary font-heading">
                Recent Applications
              </h2>
            </div>
            <div className="p-6">
              {recentApplications.length > 0 ? (
                <div className="space-y-4">
                  {recentApplications.map((application) => (
                    <div
                      key={application._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <h3 className="text-sm font-medium text-primary">
                          {application.fullName}
                        </h3>
                        <p className="text-sm text-text-light">
                          {application.email}
                        </p>
                        <p className="text-sm text-text-light">
                          {application.jobRole}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            application.status === 'submitted'
                              ? 'bg-blue-100 text-blue-800'
                              : application.status === 'under-review'
                                ? 'bg-yellow-100 text-yellow-800'
                                : application.status === 'shortlisted'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {application.status}
                        </span>
                        <p className="text-sm text-text-light">
                          {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-light text-center py-8">
                  No applications received yet. They will appear here when candidates apply.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
