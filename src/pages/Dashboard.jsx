// Dashboard Page Component - Production Version with Both Recent Applications and Recent Jobs
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { applicationsAPI } from '../services/api'
import { jobsAPI } from '../services/api'

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
    recentJobs: 0,
  })

  // Real recent applications data from API
  const [recentApplications, setRecentApplications] = useState([])

  // Real recent jobs data from API
  const [recentJobs, setRecentJobs] = useState([])

  // Fetch recent applications (latest 5)
  const fetchRecentApplications = async () => {
    try {
      const response = await applicationsAPI.getAllApplications(
        'page=1&limit=5&sortBy=createdAt&sortOrder=desc'
      )
      setRecentApplications(response.data.data.applications)
      setStats((prev) => ({
        ...prev,
        totalApplications: response.data.data.pagination.total,
        recentApplications: response.data.data.applications.length,
      }))
    } catch (error) {
      console.error('Error fetching recent applications:', error)
    }
  }

  // Fetch recent jobs (latest 5)
  const fetchRecentJobs = async () => {
    try {
      const response = await jobsAPI.getAllJobs(
        'page=1&limit=5&sortBy=createdAt&sortOrder=desc'
      )
      setRecentJobs(response.data.data.jobs)
      setStats((prev) => ({
        ...prev,
        totalJobs: response.data.data.pagination.total,
        activeJobs: response.data.data.jobs.filter((job) => job.isActive)
          .length,
        recentJobs: response.data.data.jobs.length,
      }))
    } catch (error) {
      console.error('Error fetching recent jobs:', error)
    }
  }

  // Listen for new applications
  useEffect(() => {
    const handleApplicationSubmitted = (event) => {
      const newApplication = event.detail.application
      setRecentApplications((prev) => [newApplication, ...prev.slice(0, 4)]) // Keep only latest 5
      setStats((prev) => ({
        ...prev,
        totalApplications: prev.totalApplications + 1,
        recentApplications: prev.recentApplications + 1,
      }))
    }

    window.addEventListener('applicationSubmitted', handleApplicationSubmitted)

    return () => {
      window.removeEventListener(
        'applicationSubmitted',
        handleApplicationSubmitted
      )
    }
  }, [])

  // Listen for new jobs
  useEffect(() => {
    const handleJobPosted = (event) => {
      const newJob = event.detail.job
      setRecentJobs((prev) => [newJob, ...prev.slice(0, 4)]) // Keep only latest 5
      setStats((prev) => ({
        ...prev,
        totalJobs: prev.totalJobs + 1,
        activeJobs: newJob.isActive ? prev.activeJobs + 1 : prev.activeJobs,
        recentJobs: prev.recentJobs + 1,
      }))
    }

    window.addEventListener('jobPosted', handleJobPosted)

    return () => {
      window.removeEventListener('jobPosted', handleJobPosted)
    }
  }, [])

  // Initial load - fetch both datasets
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    // Fetch both recent applications and recent jobs
    Promise.all([fetchRecentApplications(), fetchRecentJobs()])
      .then(() => {
        console.log('Both datasets loaded successfully')
      })
      .catch((error) => {
        console.error('Error loading dashboard data:', error)
      })

    return () => clearTimeout(timer)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNavigateToAllJobs = () => {
    navigate('/all-jobs')
  }

  const handleNavigateToAllApplications = () => {
    navigate('/all-applications')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <span className="ml-4 px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                {isAdmin ? 'Admin' : 'User'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleNavigateToAllJobs}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                All Jobs
              </button>
              <button
                onClick={handleNavigateToAllApplications}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                All Applications
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <i className="fas fa-briefcase text-white text-sm"></i>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Jobs
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalJobs}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <i className="fas fa-check-circle text-white text-sm"></i>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Jobs
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.activeJobs}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <i className="fas fa-file-alt text-white text-sm"></i>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Applications
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalApplications}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                    <i className="fas fa-clock text-white text-sm"></i>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Recent Items
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.recentApplications + stats.recentJobs}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout for Recent Applications and Recent Jobs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Applications Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Applications ({recentApplications.length})
                </h3>
                <button
                  onClick={handleNavigateToAllApplications}
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  View All →
                </button>
              </div>

              {recentApplications.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-inbox text-gray-400 text-4xl mb-4"></i>
                  <p className="text-gray-500">No applications received yet.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Applications will appear here when candidates submit them.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Job Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Experience
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expected Salary
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date Applied
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentApplications.map((application) => (
                        <tr key={application._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {application.fullName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {application.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {application.jobRole}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {application.experience}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {application.expectedSalary || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(
                              application.createdAt
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                application.status === 'submitted'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {application.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Recent Jobs Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Jobs ({recentJobs.length})
                </h3>
                <button
                  onClick={handleNavigateToAllJobs}
                  className="text-sm text-green-600 hover:text-green-500 font-medium"
                >
                  View All →
                </button>
              </div>

              {recentJobs.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-briefcase text-gray-400 text-4xl mb-4"></i>
                  <p className="text-gray-500">No jobs posted yet.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Jobs will appear here when you post them.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Job Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Experience
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Salary
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date Posted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentJobs.map((job) => (
                        <tr key={job._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {job.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {job.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {job.experience}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {job.salary}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                job.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {job.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
