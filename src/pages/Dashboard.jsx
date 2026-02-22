// Dashboard Page Component - Side-by-Side Layout with Complete Isolation
import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const {
    jobs,
    applications,
    loading,
    error,
    stats: contextStats,
    fetchJobs,
    fetchApplications,
    deleteJob,
    deleteApplication,
    clearError,
  } = useData()
  const [successMessage, setSuccessMessage] = useState('')
  const [showJobModal, setShowJobModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [deletingJobId, setDeletingJobId] = useState(null)
  const [deletingApplicationId, setDeletingApplicationId] = useState(null)

  // Stats state - use context stats instead of local
  const stats = contextStats

  // Filter states
  const [jobFilters, setJobFilters] = useState({
    role: '',
    experience: '',
    salary: '',
    location: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const [applicationFilters, setApplicationFilters] = useState({
    fullName: '',
    email: '',
    status: '',
    jobRole: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  // Fetch data on component mount with debouncing
  useEffect(() => {
    let isMounted = true
    let timeoutId = null

    const fetchData = async () => {
      if (!isMounted) return
      
      try {
        console.log('🚀 Dashboard: Starting data fetch...')
        const [jobsData, applicationsData] = await Promise.all([
          fetchJobs(),
          fetchApplications(),
        ])
        
        if (!isMounted) return
        
        console.log('📋 Dashboard: Data fetched from backend')
        console.log('📊 Jobs:', jobsData?.length || 0, 'jobs')
        console.log(
          '📄 Applications:',
          applicationsData?.length || 0,
          'applications'
        )
      } catch (error) {
        if (!isMounted) return
        console.error('❌ Error fetching dashboard data:', error)
      }
    }

    // Debounce the initial fetch
    timeoutId = setTimeout(() => {
      fetchData()
    }, 1000)

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  // Debug: Log current data state (only when data changes)
  useEffect(() => {
    if (jobs.length > 0 || applications.length > 0) {
      console.log('🔍 Dashboard Data Updated:')
      console.log('  Jobs:', jobs.length, 'items')
      console.log('  Applications:', applications.length, 'items')
    }
  }, [jobs.length, applications.length])

  // Filter jobs
  const filterJobs = useMemo(() => {
    return (jobsToFilter) => {
      if (!Array.isArray(jobsToFilter)) return []

      return jobsToFilter
        .filter((job) => {
          const matchesRole =
            !jobFilters.role ||
            (job.title &&
              job.title.toLowerCase().includes(jobFilters.role.toLowerCase()))
          const matchesExperience =
            !jobFilters.experience || (job.experience && job.experience === jobFilters.experience) || (job.type && job.type === jobFilters.experience)
          const matchesSalary =
            !jobFilters.salary ||
            (job.salary &&
              job.salary.min &&
              parseInt(job.salary.min) >= parseInt(jobFilters.salary))
          const matchesLocation =
            !jobFilters.location ||
            (job.location &&
              job.location
                .toLowerCase()
                .includes(jobFilters.location.toLowerCase()))

          return (
            matchesRole && matchesExperience && matchesSalary && matchesLocation
          )
        })
        .sort((a, b) => {
          const { sortBy, sortOrder } = jobFilters
          let comparison = 0

          if (sortBy === 'createdAt') {
            comparison = new Date(a.createdAt) - new Date(b.createdAt)
          } else if (sortBy === 'title') {
            comparison = (a.title || '').localeCompare(b.title || '')
          } else if (sortBy === 'salary') {
            comparison = (a.salary?.min || 0) - (b.salary?.min || 0)
          }

          return sortOrder === 'asc' ? comparison : -comparison
        })
    }
  }, [jobFilters])

  // Filter applications
  const filterApplications = useMemo(() => {
    return (applicationsToFilter) => {
      if (!Array.isArray(applicationsToFilter)) return []

      return applicationsToFilter
        .filter((application) => {
          const matchesName =
            !applicationFilters.fullName ||
            (application.fullName &&
              application.fullName
                .toLowerCase()
                .includes(applicationFilters.fullName.toLowerCase()))
          const matchesEmail =
            !applicationFilters.email ||
            (application.email &&
              application.email
                .toLowerCase()
                .includes(applicationFilters.email.toLowerCase()))
          const matchesStatus =
            !applicationFilters.status ||
            application.status === applicationFilters.status
          const matchesJobRole =
            !applicationFilters.jobRole ||
            (application.jobRole &&
              application.jobRole
                .toLowerCase()
                .includes(applicationFilters.jobRole.toLowerCase()))

          return matchesName && matchesEmail && matchesStatus && matchesJobRole
        })
        .sort((a, b) => {
          const { sortBy, sortOrder } = applicationFilters
          let comparison = 0

          if (sortBy === 'createdAt') {
            comparison = new Date(a.createdAt) - new Date(b.createdAt)
          } else if (sortBy === 'fullName') {
            comparison = (a.fullName || '').localeCompare(b.fullName || '')
          } else if (sortBy === 'jobRole') {
            comparison = (a.jobRole || '').localeCompare(b.jobRole || '')
          }

          return sortOrder === 'asc' ? comparison : -comparison
        })
    }
  }, [applicationFilters])

  // Delete handlers
  const handleDeleteJob = async (job) => {
    if (!window.confirm(`Are you sure you want to delete the job "${job.title}"?`)) {
      return
    }

    setDeletingJobId(job._id)
    try {
      await deleteJob(job._id)
      setSuccessMessage(`Job "${job.title}" deleted successfully!`)
      setTimeout(() => setSuccessMessage(''), 3000)
      console.log('✅ Job deleted successfully')
    } catch (error) {
      console.error('❌ Error deleting job:', error)
      setSuccessMessage('Failed to delete job')
      setTimeout(() => setSuccessMessage(''), 3000)
    } finally {
      setDeletingJobId(null)
    }
  }

  const handleDeleteApplication = async (application) => {
    if (!window.confirm(`Are you sure you want to delete the application from "${application.fullName}"?`)) {
      return
    }

    setDeletingApplicationId(application._id)
    try {
      await deleteApplication(application._id)
      setSuccessMessage(`Application from "${application.fullName}" deleted successfully!`)
      setTimeout(() => setSuccessMessage(''), 3000)
      console.log('✅ Application deleted successfully')
    } catch (error) {
      console.error('❌ Error deleting application:', error)
      setSuccessMessage('Failed to delete application')
      setTimeout(() => setSuccessMessage(''), 3000)
    } finally {
      setDeletingApplicationId(null)
    }
  }

  // Modal handlers
  const handleCloseJobModal = () => {
    setShowJobModal(false)
    setSelectedJob(null)
  }

  const handleCloseApplicationModal = () => {
    setShowApplicationModal(false)
    setSelectedApplication(null)
  }

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('❌ Error during logout:', error)
    }
  }

  // Real-time event listeners - these are now handled by DataContext
  useEffect(() => {
    // The DataContext handles real-time updates, so we don't need manual event listeners here
    return () => {
      // Cleanup if needed
    }
  }, [])

  if (loading?.jobs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
          <p className="mt-4 text-text-dark">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border-color">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
              <span className="text-sm text-text-light">
                Welcome back, {user?.name || 'Admin'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-white text-primary rounded-lg hover:bg-secondary/10 transition-all duration-300 font-semibold border border-border-color"
              >
                <i className="fas fa-home mr-2"></i>
                Home
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white text-primary rounded-lg hover:bg-secondary/10 transition-all duration-300 font-semibold border border-border-color"
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
          <div className="card bg-white p-6 border-l-4 border-secondary shadow-custom">
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
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-briefcase text-secondary text-xl"></i>
              </div>
            </div>
          </div>

          <div className="card bg-white p-6 border-l-4 border-accent shadow-custom">
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
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-clock text-accent text-xl"></i>
              </div>
            </div>
          </div>

          <div className="card bg-white p-6 border-l-4 border-primary shadow-custom">
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
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-primary text-xl"></i>
              </div>
            </div>
          </div>

          <div className="card bg-white p-6 border-l-4 border-secondary shadow-custom">
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
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-chart-line text-secondary text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs and Applications Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Jobs Section - Left */}
          <div className="card bg-white shadow-custom">
            <div className="px-6 py-4 border-b border-border-color">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-briefcase text-secondary"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-primary">Jobs</h3>
                </div>
                <div className="text-sm text-text-light">
                  {filterJobs(jobs).length} jobs
                </div>
              </div>
            </div>

            {/* Jobs Filters */}
            <div className="px-6 py-4 border-b border-border-color bg-primary/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Search role..."
                  value={jobFilters.role}
                  onChange={(e) =>
                    setJobFilters((prev) => ({ ...prev, role: e.target.value }))
                  }
                  className="px-3 py-2 border border-border-color rounded-lg text-sm focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
                <select
                  value={jobFilters.experience}
                  onChange={(e) =>
                    setJobFilters((prev) => ({
                      ...prev,
                      experience: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-border-color rounded-lg text-sm focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                >
                  <option value="">All Experience</option>
                  <option value="Entry Level">Entry Level</option>
                  <option value="Mid Level">Mid Level</option>
                  <option value="Senior Level">Senior Level</option>
                  <option value="Executive">Executive</option>
                </select>
                <input
                  type="text"
                  placeholder="Location..."
                  value={jobFilters.location}
                  onChange={(e) =>
                    setJobFilters((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-border-color rounded-lg text-sm focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
                <button
                  onClick={() =>
                    setJobFilters({
                      role: '',
                      experience: '',
                      location: '',
                      sortBy: 'createdAt',
                      sortOrder: 'desc',
                    })
                  }
                  className="px-3 py-2 bg-secondary text-white rounded-lg text-sm hover:bg-secondary/90 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="p-6">
              {filterJobs(jobs).length === 0 ? (
                <p className="text-text-light text-center py-8">
                  No jobs posted yet
                </p>
              ) : (
                <div className="space-y-4">
                  {filterJobs(jobs).map((job) => (
                    <div
                      key={job._id}
                      className="border border-border-color rounded-lg p-4 hover:shadow-custom transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-primary">
                          {job.title || 'N/A'}
                        </h4>
                        <span className="text-xs text-text-light">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-text-light">
                        <p>
                          <i className="fas fa-building mr-2"></i>
                          {job.company || 'Not specified'}
                        </p>
                        <p>
                          <i className="fas fa-map-marker-alt mr-2"></i>
                          {job.location || 'Not specified'}
                        </p>
                        <p>
                          <i className="fas fa-briefcase mr-2"></i>
                          {job.type || job.jobType || 'Not specified'}
                        </p>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedJob(job)
                            setShowJobModal(true)
                          }}
                          className="px-3 py-1 bg-accent text-white rounded text-sm hover:bg-accent/90 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job)}
                          disabled={deletingJobId === job._id}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                        >
                          {deletingJobId === job._id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-trash"></i>
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Applications Section - Right */}
          <div className="card bg-white shadow-custom">
            <div className="px-6 py-4 border-b border-border-color">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-users text-accent"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-primary">
                    Applications
                  </h3>
                </div>
                <div className="text-sm text-text-light">
                  {filterApplications(applications).length} applications
                </div>
              </div>
            </div>

            {/* Applications Filters */}
            <div className="px-6 py-4 border-b border-border-color bg-primary/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Search name..."
                  value={applicationFilters.fullName}
                  onChange={(e) =>
                    setApplicationFilters((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-border-color rounded-lg text-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
                <input
                  type="text"
                  placeholder="Search email..."
                  value={applicationFilters.email}
                  onChange={(e) =>
                    setApplicationFilters((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-border-color rounded-lg text-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
                <select
                  value={applicationFilters.status}
                  onChange={(e) =>
                    setApplicationFilters((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-border-color rounded-lg text-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button
                  onClick={() =>
                    setApplicationFilters({
                      fullName: '',
                      email: '',
                      status: '',
                      jobRole: '',
                      sortBy: 'createdAt',
                      sortOrder: 'desc',
                    })
                  }
                  className="px-3 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="p-6">
              {filterApplications(applications).length === 0 ? (
                <p className="text-text-light text-center py-8">
                  No applications yet
                </p>
              ) : (
                <div className="space-y-4">
                  {filterApplications(applications).map((application) => (
                    <div
                      key={application._id}
                      className="border border-border-color rounded-lg p-4 hover:shadow-custom transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-primary">
                          {application.fullName || 'N/A'}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            application.status === 'approved'
                              ? 'bg-secondary/20 text-secondary'
                              : application.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-accent/20 text-accent'
                          }`}
                        >
                          {application.status || 'pending'}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-text-light">
                        <p>
                          <i className="fas fa-envelope mr-2"></i>
                          {application.email || 'Not specified'}
                        </p>
                        <p>
                          <i className="fas fa-phone mr-2"></i>
                          {application.phone || 'Not specified'}
                        </p>
                        <p>
                          <i className="fas fa-briefcase mr-2"></i>
                          {application.jobRole || 'Not specified'}
                        </p>
                        <p>
                          <i className="fas fa-chart-line mr-2"></i>
                          {application.experience || 'Not specified'}
                        </p>
                        <p>
                          <i className="fas fa-money-bill mr-2"></i>
                          {application.expectedSalary
                            ? `${application.currency} ${application.expectedSalary}`
                            : 'Not specified'}
                        </p>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedApplication(application)
                            setShowApplicationModal(true)
                          }}
                          className="px-3 py-1 bg-secondary text-white rounded text-sm hover:bg-secondary/90 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDeleteApplication(application)}
                          disabled={deletingApplicationId === application._id}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                        >
                          {deletingApplicationId === application._id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-trash"></i>
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedJob.title}
                </h2>
                <button
                  onClick={handleCloseJobModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Company</h3>
                  <p className="text-gray-600">
                    {selectedJob.company || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                  <p className="text-gray-600">
                    {selectedJob.location || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Salary</h3>
                  <p className="text-gray-600">
                    {selectedJob.salary
                      ? `${selectedJob.salary.currency} ${selectedJob.salary.min}${selectedJob.salary.max ? ` - ${selectedJob.salary.max}` : ''}`
                      : 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Experience Level
                  </h3>
                  <p className="text-gray-600">
                    {selectedJob.experience || selectedJob.experienceLevel || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Job Type</h3>
                  <p className="text-gray-600">
                    {selectedJob.type || selectedJob.jobType || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {selectedJob.description || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Requirements
                  </h3>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {selectedJob.requirements || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Posted Date
                  </h3>
                  <p className="text-gray-600">
                    {new Date(selectedJob.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Application Details
                </h2>
                <button
                  onClick={handleCloseApplicationModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Full Name
                  </h3>
                  <p className="text-gray-600">
                    {selectedApplication.fullName || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-600">
                    {selectedApplication.email || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                  <p className="text-gray-600">
                    {selectedApplication.phone || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Job Role</h3>
                  <p className="text-gray-600">
                    {selectedApplication.jobRole || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Experience Level
                  </h3>
                  <p className="text-gray-600">
                    {selectedApplication.experience || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Expected Salary
                  </h3>
                  <p className="text-gray-600">
                    {selectedApplication.expectedSalary
                      ? `${selectedApplication.currency} ${selectedApplication.expectedSalary}`
                      : 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Cover Letter
                  </h3>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {selectedApplication.coverLetter || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      selectedApplication.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : selectedApplication.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {selectedApplication.status || 'pending'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Submitted Date
                  </h3>
                  <p className="text-gray-600">
                    {new Date(selectedApplication.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <i className="fas fa-check-circle"></i>
            <span>{successMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
