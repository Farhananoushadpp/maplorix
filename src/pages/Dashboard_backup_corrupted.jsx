// Dashboard Page Component - Enhanced with Maplorix Theme
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { applicationsAPI, jobsAPI } from '../services/api'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [showJobModal, setShowJobModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)

  // Stats state
  const [stats, setStats] = useState({
    totalJobs: 0,
    recentJobs: 0,
    totalApplications: 0,
    recentApplications: 0,
  })

  // Filter states
  const [jobFilters, setJobFilters] = useState({
    role: '',
    experience: '',
    salary: '',
    salaryRange: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const [applicationFilters, setApplicationFilters] = useState({
    jobRole: '',
    experience: '',
    salary: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  // Pagination state
  const [jobsPerPage] = useState(5)
  const [currentJobsPage, setCurrentJobsPage] = useState(1)
  const [applicationsPerPage] = useState(5)
  const [currentApplicationsPage, setCurrentApplicationsPage] = useState(1)

  // Memoized filter functions
  const filterJobs = useMemo(
    () => (jobsList) => {
      if (!jobsList || !Array.isArray(jobsList)) return []
      let filtered = [...jobsList]

      if (jobFilters.role)
        filtered = filtered.filter((job) =>
          job.title?.toLowerCase().includes(jobFilters.role.toLowerCase())
        )
      if (jobFilters.experience)
        filtered = filtered.filter(
          (job) => job.experience === jobFilters.experience
        )
      if (jobFilters.salary)
        filtered = filtered.filter(
          (job) =>
            job.salaryMin &&
            parseInt(job.salaryMin) >= parseInt(jobFilters.salary)
        )
      if (jobFilters.salaryRange) {
        const [min, max] = jobFilters.salaryRange.split('-').map(Number)
        filtered = filtered.filter(
          (job) =>
            job.salaryMin &&
            job.salaryMax &&
            parseInt(job.salaryMin) >= min &&
            parseInt(job.salaryMax) <= max
        )
      }

      // Sort
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.postedAt || 0)
        const dateB = new Date(b.createdAt || b.postedAt || 0)
        return jobFilters.sortOrder === 'desc'
          ? dateB.getTime() - dateA.getTime()
          : dateA.getTime() - dateB.getTime()
      })

      return filtered
    },
    [jobFilters]
  )

  const filterApplications = useMemo(
    () => (applicationsList) => {
      if (!applicationsList || !Array.isArray(applicationsList)) return []
      let filtered = [...applicationsList]

      if (applicationFilters.jobRole) {
        filtered = filtered.filter((app) =>
          app.jobRole
            ?.toLowerCase()
            .includes(applicationFilters.jobRole.toLowerCase())
        )
      }
      if (applicationFilters.experience) {
        filtered = filtered.filter(
          (app) => app.experience === applicationFilters.experience
        )
      }
      if (applicationFilters.salary) {
        filtered = filtered.filter(
          (app) =>
            app.expectedSalary &&
            parseInt(app.expectedSalary) >= parseInt(applicationFilters.salary)
        )
      }
      if (applicationFilters.status) {
        filtered = filtered.filter(
          (app) => app.status === applicationFilters.status
        )
      }

      // Sort
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0)
        const dateB = new Date(b.createdAt || 0)

        if (applicationFilters.sortBy === 'createdAt') {
          return applicationFilters.sortOrder === 'desc'
            ? dateB.getTime() - dateA.getTime()
            : dateA.getTime() - dateB.getTime()
        } else if (applicationFilters.sortBy === 'jobRole') {
          return applicationFilters.sortOrder === 'desc'
            ? b.jobRole?.localeCompare(a.jobRole || '')
            : a.jobRole?.localeCompare(b.jobRole || '')
        }
        return 0
      })

      return filtered
    },
    [applicationFilters]
  )

  // Fetch functions
  const fetchJobs = async () => {
    try {
      const storedJobs = JSON.parse(
        sessionStorage.getItem('dashboard_jobs') || '[]'
      )
      setJobs(storedJobs)

      // Calculate recent jobs (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const recentJobs = storedJobs.filter((job) => {
        const jobDate = new Date(job.createdAt || job.postedAt)
        return jobDate >= sevenDaysAgo
      })

      setStats((prev) => ({
        ...prev,
        totalJobs: storedJobs.length,
        recentJobs: recentJobs.length,
      }))
    } catch (error) {
      console.error(
        '❌ Error loading jobs from dashboard_jobs sessionStorage:',
        error
      )
      setJobs([])
    }
  }

  const fetchApplications = async () => {
    try {
      const storedApplications = JSON.parse(
        sessionStorage.getItem('dashboardApplications') || '[]'
      )
      setApplications(storedApplications)

      // Calculate recent applications (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const recentApplications = storedApplications.filter((app) => {
        const appDate = new Date(app.createdAt || app.submittedAt)
        return appDate >= sevenDaysAgo
      })

      setStats((prev) => ({
        ...prev,
        totalApplications: storedApplications.length,
        recentApplications: recentApplications.length,
      }))
    } catch (error) {
      console.error(
        '❌ Error loading applications from dashboardApplications sessionStorage:',
        error
      )
      setApplications([])
    }
  }

  // Event handlers
  const handleDeleteJob = async (job) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return

    try {
      // Remove from state
      const updatedJobs = jobs.filter((j) => j._id !== job._id)
      setJobs(updatedJobs)
      sessionStorage.setItem('dashboard_jobs', JSON.stringify(updatedJobs))

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalJobs: prev.totalJobs - 1,
        recentJobs: (() => {
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
          const jobDate = new Date(job.createdAt || job.postedAt)
          return jobDate >= sevenDaysAgo ? prev.recentJobs - 1 : prev.recentJobs
        })(),
      }))

      setSuccessMessage('Job deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('❌ Error deleting job:', error)
    }
  }

  const handleDeleteApplication = async (application) => {
    if (!window.confirm('Are you sure you want to delete this application?'))
      return

    try {
      // Remove from state
      const updatedApplications = applications.filter(
        (a) => a._id !== application._id
      )
      setApplications(updatedApplications)
      sessionStorage.setItem(
        'dashboardApplications',
        JSON.stringify(updatedApplications)
      )

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalApplications: prev.totalApplications - 1,
        recentApplications: (() => {
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
          const appDate = new Date(
            application.createdAt || application.submittedAt
          )
          return appDate >= sevenDaysAgo
            ? prev.recentApplications - 1
            : prev.recentApplications
        })(),
      }))

      setSuccessMessage('Application deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('❌ Error deleting application:', error)
    }
  }

  const handleCloseJobModal = () => {
    setShowJobModal(false)
    setSelectedJob(null)
  }

  const handleCloseApplicationModal = () => {
    setShowApplicationModal(false)
    setSelectedApplication(null)
  }

  // Effects
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchJobs(), fetchApplications()])
      setLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    const handleJobPosted = (event) => {
      const newJob = event.detail.job
      setJobs((prev) => {
        const updated = [newJob, ...prev]
        sessionStorage.setItem('dashboard_jobs', JSON.stringify(updated))
        return updated
      })
      setStats((prev) => ({
        ...prev,
        totalJobs: prev.totalJobs + 1,
        recentJobs: prev.recentJobs + 1,
      }))
    }

    const handleApplicationPosted = (event) => {
      const newApplication = event.detail.application
      setApplications((prev) => {
        const updated = [newApplication, ...prev]
        sessionStorage.setItem('dashboardApplications', JSON.stringify(updated))
        return updated
      })
      setStats((prev) => ({
        ...prev,
        totalApplications: prev.totalApplications + 1,
        recentApplications: prev.recentApplications + 1,
      }))
    }

    window.addEventListener('jobPosted', handleJobPosted)
    window.addEventListener('applicationPosted', handleApplicationPosted)

    return () => {
      window.removeEventListener('jobPosted', handleJobPosted)
      window.removeEventListener('applicationPosted', handleApplicationPosted)
    }
  }, [])

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-secondary text-white px-6 py-3 rounded-lg shadow-custom-hover flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-accent shadow-xl">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-custom">
                <i className="fas fa-chart-line text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white font-heading">
                  Dashboard
                </h1>
                <p className="text-white text-opacity-90 text-sm">
                  Manage your jobs and applications
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all duration-300 backdrop-blur-custom"
              >
                <i className="fas fa-home mr-2"></i>
                Home
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-white text-primary rounded-lg hover:bg-gray-100 transition-all duration-300 font-semibold"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Jobs */}
          <div className="card bg-white p-6 border-l-4 border-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-light uppercase tracking-wide">
                  Total Jobs
                </p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {stats.totalJobs}
                </p>
                <p className="text-xs text-text-light mt-1">Posted positions</p>
              </div>
              <div className="w-12 h-12 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center">
                <i className="fas fa-briefcase text-secondary text-xl"></i>
              </div>
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="card bg-white p-6 border-l-4 border-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-light uppercase tracking-wide">
                  Recent Jobs
                </p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {stats.recentJobs}
                </p>
                <p className="text-xs text-text-light mt-1">Last 7 days</p>
              </div>
              <div className="w-12 h-12 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center">
                <i className="fas fa-clock text-accent text-xl"></i>
              </div>
            </div>
          </div>

          {/* Total Applications */}
          <div className="card bg-white p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-light uppercase tracking-wide">
                  Total Applications
                </p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {stats.totalApplications}
                </p>
                <p className="text-xs text-text-light mt-1">All submissions</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-purple-500 text-xl"></i>
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="card bg-white p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-light uppercase tracking-wide">
                  Recent Applications
                </p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {stats.recentApplications}
                </p>
                <p className="text-xs text-text-light mt-1">Last 7 days</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-user-plus text-orange-500 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Section */}
        <div className="card bg-white shadow-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-briefcase text-secondary"></i>
                </div>
                <h3 className="text-lg font-semibold text-primary font-heading">
                  All Jobs
                </h3>
              </div>
              {filterJobs(jobs).length > jobsPerPage && (
                <div className="text-sm text-text-light">
                  Showing{' '}
                  {Math.min(
                    currentJobsPage * jobsPerPage,
                    filterJobs(jobs).length
                  )}{' '}
                  of {filterJobs(jobs).length} jobs
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {filterJobs(jobs).length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No jobs posted yet
              </p>
            ) : (
              <>
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
                          Salary
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Posted Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filterJobs(jobs)
                        .slice(0, currentJobsPage * jobsPerPage)
                        .map((job) => (
                          <tr
                            key={job._id}
                            className="hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-primary">
                                {job.title || 'N/A'}
                              </div>
                              {job.experience && (
                                <div className="text-xs text-text-light">
                                  {job.experience}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {job.location || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {(() => {
                                const currency = job.currency || 'AED'
                                const salaryMin =
                                  job.salaryMin || job.minSalary || job.salary
                                const salaryMax = job.salaryMax || job.maxSalary

                                if (salaryMin && salaryMax) {
                                  return `${currency} ${Number(salaryMin).toLocaleString()} - ${Number(salaryMax).toLocaleString()}`
                                } else if (salaryMin) {
                                  return `${currency} ${Number(salaryMin).toLocaleString()}`
                                } else if (job.salary) {
                                  return `${currency} ${Number(job.salary).toLocaleString()}`
                                } else {
                                  return 'N/A'
                                }
                              })()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {job.createdAt
                                ? new Date(job.createdAt).toLocaleDateString(
                                    'en-US',
                                    {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    }
                                  )
                                : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => {
                                  setSelectedJob(job)
                                  setShowJobModal(true)
                                }}
                                className="text-accent hover:text-accent-dark mr-3"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* See More / Show Less */}
                {filterJobs(jobs).length > jobsPerPage && (
                  <div className="mt-4 text-center">
                    {currentJobsPage * jobsPerPage < filterJobs(jobs).length ? (
                      <button
                        onClick={() => setCurrentJobsPage(currentJobsPage + 1)}
                        className="btn btn-primary text-sm px-6 py-2"
                      >
                        See More (
                        {filterJobs(jobs).length -
                          currentJobsPage * jobsPerPage}{' '}
                        remaining)
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentJobsPage(1)}
                        className="btn btn-outline text-sm px-6 py-2"
                      >
                        Show Less
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Applications Section */}
        <div className="card bg-white shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-users text-accent"></i>
                </div>
                <h3 className="text-lg font-semibold text-primary font-heading">
                  All Applications
                </h3>
              </div>
              {filterApplications(applications).length >
                applicationsPerPage && (
                <div className="text-sm text-text-light">
                  Showing{' '}
                  {Math.min(
                    currentApplicationsPage * applicationsPerPage,
                    filterApplications(applications).length
                  )}{' '}
                  of {filterApplications(applications).length} applications
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {filterApplications(applications).length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No applications found
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applicant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Job Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Experience
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Salary
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filterApplications(applications)
                        .slice(0, currentApplicationsPage * applicationsPerPage)
                        .map((application) => (
                          <tr
                            key={application._id}
                            className="hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-primary">
                                {application.fullName || 'N/A'}
                              </div>
                              {application.email && (
                                <div className="text-xs text-text-light">
                                  {application.email}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {application.jobRole || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {application.experience || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {application.expectedSalary
                                ? `AED ${Number(application.expectedSalary).toLocaleString()}`
                                : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  application.status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : application.status === 'rejected'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {application.status || 'pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => {
                                  setSelectedApplication(application)
                                  setShowApplicationModal(true)
                                }}
                                className="text-accent hover:text-accent-dark mr-3"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteApplication(application)
                                }
                                className="text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* See More / Show Less */}
                {filterApplications(applications).length >
                  applicationsPerPage && (
                  <div className="mt-4 text-center">
                    {currentApplicationsPage * applicationsPerPage <
                    filterApplications(applications).length ? (
                      <button
                        onClick={() =>
                          setCurrentApplicationsPage(
                            currentApplicationsPage + 1
                          )
                        }
                        className="btn btn-primary text-sm px-6 py-2"
                      >
                        See More (
                        {filterApplications(applications).length -
                          currentApplicationsPage * applicationsPerPage}{' '}
                        remaining)
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentApplicationsPage(1)}
                        className="btn btn-outline text-sm px-6 py-2"
                      >
                        Show Less
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Job Details</h3>
              <button
                onClick={handleCloseJobModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-semibold text-gray-900">
                  {selectedJob?.title || 'N/A'}
                </h4>
                <p className="text-sm text-gray-500">
                  {selectedJob?.location || 'N/A'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Experience Level
                  </p>
                  <p className="text-sm text-gray-900">
                    {selectedJob?.experience || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Salary Range
                  </p>
                  <p className="text-sm text-gray-900">
                    {selectedJob?.currency || 'AED'}{' '}
                    {selectedJob?.salaryMin && selectedJob?.salaryMax
                      ? `${selectedJob.salaryMin.toLocaleString()} - ${selectedJob.salaryMax.toLocaleString()}`
                      : selectedJob?.salaryMin
                        ? selectedJob.salaryMin.toLocaleString()
                        : 'Not specified'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">
                  Job Description
                </p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedJob?.description || 'No description available'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">
                  Requirements
                </p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedJob?.requirements ||
                    'No specific requirements listed'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Posted Date</p>
                <p className="text-sm text-gray-900">
                  {selectedJob?.createdAt
                    ? new Date(selectedJob.createdAt).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )
                    : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Status</p>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    selectedJob?.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {selectedJob?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Application Details
              </h3>
              <button
                onClick={handleCloseApplicationModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-semibold text-gray-900">
                  {selectedApplication?.fullName || 'N/A'}
                </h4>
                <p className="text-sm text-gray-500">
                  {selectedApplication?.email || 'N/A'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Job Role</p>
                  <p className="text-sm text-gray-900">
                    {selectedApplication?.jobRole || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Experience
                  </p>
                  <p className="text-sm text-gray-900">
                    {selectedApplication?.experience || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Expected Salary
                  </p>
                  <p className="text-sm text-gray-900">
                    {selectedApplication?.expectedSalary
                      ? `AED ${Number(selectedApplication.expectedSalary).toLocaleString()}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p className="text-sm text-gray-900">
                    {selectedApplication?.phone || 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">
                  Cover Letter
                </p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedApplication?.coverLetter ||
                    'No cover letter provided'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">
                  Applied Date
                </p>
                <p className="text-sm text-gray-900">
                  {selectedApplication?.createdAt
                    ? new Date(
                        selectedApplication.createdAt
                      ).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Status</p>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    selectedApplication?.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : selectedApplication?.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {selectedApplication?.status || 'pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
