// Dashboard Page Component - Side-by-Side Layout with Complete Isolation
import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import api from '../services/api'

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
  const [applicationsToShow, setApplicationsToShow] = useState(5)
  const [showAllApplications, setShowAllApplications] = useState(false)
  const [jobsToShow, setJobsToShow] = useState(5)
  const [showAllJobs, setShowAllJobs] = useState(false)

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
    jobRole: '',
    experience: '',
    expectedSalary: '',
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

  useEffect(() => {
    if (jobs.length > 0 || applications.length > 0) {
      console.log('🔍 Dashboard Data Updated:')
      console.log('  Jobs:', jobs.length, 'items')
      console.log('  Applications:', applications.length, 'items')

      // Log sample data structures
      if (jobs.length > 0) {
        const sampleJob = jobs.find((job) => job.title === 'tytuuiuityiiyyi')
        if (sampleJob) {
          console.log('📋 Sample Job Data (tytuuiuityiiyyi):', sampleJob)
        } else {
          console.log('📋 Sample Job Data (first job):', jobs[0])
        }
      }

      // Log sample application data
      if (applications.length > 0) {
        const sampleApp = applications.find(
          (app) =>
            app.fullName &&
            app.fullName.toLowerCase().includes('farhanatyyu'.toLowerCase())
        )
        if (sampleApp) {
          console.log('📋 Sample Application Data (farhanatyyu):', sampleApp)
        } else {
          console.log(
            '📋 Sample Application Data (first app):',
            applications[0]
          )
        }
      }
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
            !jobFilters.experience ||
            (job.experience && job.experience === jobFilters.experience) ||
            (job.type && job.type === jobFilters.experience)
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
          const matchesPostedBy = job.postedBy === 'user' // Only show user-posted jobs in Dashboard

          return (
            matchesRole &&
            matchesExperience &&
            matchesSalary &&
            matchesLocation &&
            matchesPostedBy
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
          const matchesJobRole =
            !applicationFilters.jobRole ||
            (application.jobRole &&
              application.jobRole
                .toLowerCase()
                .includes(applicationFilters.jobRole.toLowerCase()))
          const matchesExperience =
            !applicationFilters.experience ||
            (application.experience &&
              application.experience === applicationFilters.experience)
          const matchesSalary =
            !applicationFilters.expectedSalary ||
            (application.expectedSalary &&
              (typeof application.expectedSalary === 'object'
                ? application.expectedSalary.min &&
                  parseInt(application.expectedSalary.min) >=
                    parseInt(applicationFilters.expectedSalary)
                : parseInt(application.expectedSalary) >=
                  parseInt(applicationFilters.expectedSalary)))

          return (
            matchesName &&
            matchesEmail &&
            matchesJobRole &&
            matchesExperience &&
            matchesSalary
          )
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
    if (
      !window.confirm(`Are you sure you want to delete the job "${job.title}"?`)
    ) {
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
    if (
      !window.confirm(
        `Are you sure you want to delete the application from "${application.fullName}"?`
      )
    ) {
      return
    }

    setDeletingApplicationId(application._id)
    try {
      await deleteApplication(application._id)
      setSuccessMessage(
        `Application from "${application.fullName}" deleted successfully!`
      )
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

  // Force refresh data function
  const forceRefreshData = async () => {
    console.log('🔄 Force refreshing data...')
    try {
      const [jobsData, applicationsData] = await Promise.all([
        fetchJobs({ forceRefresh: true }),
        fetchApplications({ forceRefresh: true }),
      ])
      console.log('✅ Data refreshed successfully')
      setSuccessMessage('Data refreshed successfully!')
      setTimeout(() => setSuccessMessage(''), 2000)
    } catch (error) {
      console.error('❌ Error refreshing data:', error)
      setSuccessMessage('Failed to refresh data')
      setTimeout(() => setSuccessMessage(''), 2000)
    }
  }

  // Test function to manually add resume data for testing
  const addTestResumeData = () => {
    if (!selectedApplication || !selectedApplication._id) {
      setSuccessMessage('No application selected')
      setTimeout(() => setSuccessMessage(''), 2000)
      return
    }

    console.log('🧪 Adding test resume data for debugging...')

    // Create mock resume data
    const testResumeData = {
      filename: `resume_${selectedApplication._id}.pdf`,
      originalName: 'test_resume.pdf',
      size: 1024,
      contentType: 'application/pdf',
      data: 'JVBERi0xLjQKJeLjz9M=', // Base64 for minimal PDF
    }

    // Update selected application with test resume
    const updatedApplication = {
      ...selectedApplication,
      resume: testResumeData,
    }

    console.log('🧪 Test resume data added:', testResumeData)
    setSelectedApplication(updatedApplication)
    setSuccessMessage('Test resume data added for debugging!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }
  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('❌ Error during logout:', error)
    }
  }

  // Download resume handler
  const handleDownloadResume = async (applicationId) => {
    try {
      console.log('🔽 Downloading resume for application:', applicationId)

      // First, check if we have the application data with resume info
      const application = applications.find((app) => app._id === applicationId)

      if (application && application.resume && application.resume.data) {
        // Resume is stored as base64 data in the application object
        console.log('📄 Resume found in application data')

        try {
          // Decode base64 data
          const binaryString = atob(application.resume.data)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }

          const blob = new Blob([bytes], {
            type: application.resume.contentType || 'application/octet-stream',
          })

          // Create download link
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download =
            application.resume.originalName || `resume_${applicationId}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)

          console.log('✅ Resume downloaded successfully from application data')
          setSuccessMessage('Resume downloaded successfully!')
          setTimeout(() => setSuccessMessage(''), 2000)
          return
        } catch (decodeError) {
          console.error('❌ Error decoding resume data:', decodeError)
        }
      }

      // If not found in application data, try the API endpoint
      console.log('🌐 Trying API endpoint for resume download')
      const { applicationsAPI } = await import('../services/api')
      const response = await applicationsAPI.downloadResume(applicationId)

      // Check if response has data
      if (!response.data || response.data.size === 0) {
        setSuccessMessage('No resume file available for this application')
        setTimeout(() => setSuccessMessage(''), 3000)
        return
      }

      // Create a blob from the response
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream',
      })

      // Create a temporary URL and trigger download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition']
      let filename = `resume_${applicationId}.pdf`

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      console.log('✅ Resume downloaded successfully from API')
      setSuccessMessage('Resume downloaded successfully!')
      setTimeout(() => setSuccessMessage(''), 2000)
    } catch (error) {
      console.error('❌ Error downloading resume:', error)
      if (error.response?.status === 404) {
        setSuccessMessage('No resume file available for this application')
      } else if (error.response?.status === 401) {
        setSuccessMessage('Authentication required to download resume')
      } else if (error.response?.status === 403) {
        setSuccessMessage('You do not have permission to download this resume')
      } else {
        setSuccessMessage('Failed to download resume - please try again')
      }
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  // View resume handler (opens in new tab)
  const handleViewResume = async (applicationId) => {
    try {
      console.log('👁️ Viewing resume for application:', applicationId)

      // First, check if we have the application data with resume info
      const application = applications.find((app) => app._id === applicationId)

      if (application && application.resume && application.resume.data) {
        // Resume is stored as base64 data in the application object
        console.log('📄 Resume found in application data')

        try {
          // Decode base64 data
          const binaryString = atob(application.resume.data)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }

          const blob = new Blob([bytes], {
            type: application.resume.contentType || 'application/octet-stream',
          })

          // Create URL and open in new tab
          const url = window.URL.createObjectURL(blob)
          const newWindow = window.open(url, '_blank')

          // Clean up the URL object after a delay
          setTimeout(() => {
            window.URL.revokeObjectURL(url)
          }, 1000)

          console.log('✅ Resume opened in new tab from application data')
          setSuccessMessage('Resume opened in new tab!')
          setTimeout(() => setSuccessMessage(''), 2000)
          return
        } catch (decodeError) {
          console.error('❌ Error decoding resume data:', decodeError)
        }
      }

      // If not found in application data, try the API endpoint
      console.log('🌐 Trying API endpoint for resume view')
      const { applicationsAPI } = await import('../services/api')
      const response = await applicationsAPI.downloadResume(applicationId)

      // Check if response has data
      if (!response.data || response.data.size === 0) {
        setSuccessMessage('No resume file available for this application')
        setTimeout(() => setSuccessMessage(''), 3000)
        return
      }

      // Create a blob from the response
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream',
      })

      // Create a URL and open in new tab
      const url = window.URL.createObjectURL(blob)
      const newWindow = window.open(url, '_blank')

      // Clean up the URL object after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 1000)

      console.log('✅ Resume opened in new tab from API')
      setSuccessMessage('Resume opened in new tab!')
      setTimeout(() => setSuccessMessage(''), 2000)
    } catch (error) {
      console.error('❌ Error viewing resume:', error)
      if (error.response?.status === 404) {
        setSuccessMessage('No resume file available for this application')
      } else if (error.response?.status === 401) {
        setSuccessMessage('Authentication required to view resume')
      } else if (error.response?.status === 403) {
        setSuccessMessage('You do not have permission to view this resume')
      } else {
        setSuccessMessage('Failed to view resume - please try again')
      }
      setTimeout(() => setSuccessMessage(''), 3000)
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
                onClick={forceRefreshData}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 font-semibold"
                title="Force refresh data from database"
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Refresh
              </button>
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
                <select
                  value={jobFilters.salary}
                  onChange={(e) =>
                    setJobFilters((prev) => ({
                      ...prev,
                      salary: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-border-color rounded-lg text-sm focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                >
                  <option value="">All Salaries</option>
                  <option value="3000">3000+</option>
                  <option value="5000">5000+</option>
                  <option value="7000">7000+</option>
                  <option value="10000">10000+</option>
                  <option value="15000">15000+</option>
                  <option value="20000">20000+</option>
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
                      salary: '',
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
                  {filterJobs(jobs)
                    .slice(0, showAllJobs ? undefined : jobsToShow)
                    .map((job) => (
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
                          <p>
                            <i className="fas fa-chart-line mr-2"></i>
                            {job.experience || 'Entry Level'}
                          </p>
                          <p>
                            <i className="fas fa-money-bill mr-2"></i>
                            {job.salary && (job.salary.min || job.salary.max)
                              ? `${job.salary.currency || 'AED'} ${job.salary.min || ''}${
                                  job.salary.min && job.salary.max ? ' - ' : ''
                                }${job.salary.max || ''}${
                                  job.salary.min && !job.salary.max ? '+' : ''
                                }`
                              : 'Competitive'}
                          </p>
                          <p>
                            <i className="fas fa-info-circle mr-2"></i>
                            {job.description && job.description.trim()
                              ? job.description.length > 50
                                ? `${job.description.substring(0, 50)}...`
                                : job.description
                              : 'No description provided'}
                          </p>
                          <p>
                            <i className="fas fa-list-check mr-2"></i>
                            {job.requirements && job.requirements.trim()
                              ? job.requirements.length > 50
                                ? `${job.requirements.substring(0, 50)}...`
                                : job.requirements
                              : 'No specific requirements'}
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

              {/* See More/Less Button for Jobs */}
              {filterJobs(jobs).length > jobsToShow && (
                <div className="p-4 border-t border-border-color">
                  <button
                    onClick={() => setShowAllJobs(!showAllJobs)}
                    className="w-full px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {showAllJobs ? (
                      <>
                        <i className="fas fa-chevron-up"></i>
                        See Less
                      </>
                    ) : (
                      <>
                        <i className="fas fa-chevron-down"></i>
                        See More ({filterJobs(jobs).length - jobsToShow} more)
                      </>
                    )}
                  </button>
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
                  value={applicationFilters.experience}
                  onChange={(e) =>
                    setApplicationFilters((prev) => ({
                      ...prev,
                      experience: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-border-color rounded-lg text-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  <option value="">All Experience</option>
                  <option value="Entry Level">Entry Level</option>
                  <option value="Mid Level">Mid Level</option>
                  <option value="Senior Level">Senior Level</option>
                  <option value="Executive">Executive</option>
                </select>
                <select
                  value={applicationFilters.expectedSalary}
                  onChange={(e) =>
                    setApplicationFilters((prev) => ({
                      ...prev,
                      expectedSalary: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-border-color rounded-lg text-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  <option value="">All Salaries</option>
                  <option value="3000">3000+</option>
                  <option value="5000">5000+</option>
                  <option value="7000">7000+</option>
                  <option value="10000">10000+</option>
                  <option value="15000">15000+</option>
                  <option value="20000">20000+</option>
                </select>
                <button
                  onClick={() =>
                    setApplicationFilters({
                      fullName: '',
                      email: '',
                      jobRole: '',
                      experience: '',
                      expectedSalary: '',
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
                  {filterApplications(applications)
                    .slice(
                      0,
                      showAllApplications ? undefined : applicationsToShow
                    )
                    .map((application) => (
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
                            {application.experience || 'Entry Level'}
                          </p>
                          <p>
                            <i className="fas fa-money-bill mr-2"></i>
                            {application.expectedSalary
                              ? typeof application.expectedSalary === 'object'
                                ? application.expectedSalary.amount ||
                                  application.expectedSalary.min
                                  ? `${application.expectedSalary.currency || 'AED'} ${application.expectedSalary.amount || application.expectedSalary.min}`
                                  : `${application.expectedSalary.currency || 'AED'} (Not specified)`
                                : `${application.currency || 'AED'} ${application.expectedSalary}`
                              : 'Not specified'}
                          </p>
                          <p>
                            <i className="fas fa-file-alt mr-2"></i>
                            {application.coverLetter &&
                            application.coverLetter.trim().length > 0
                              ? application.coverLetter.length > 50
                                ? `${application.coverLetter.substring(0, 50)}...`
                                : application.coverLetter
                              : 'Not specified'}
                          </p>
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <button
                            onClick={() => {
                              console.log(
                                '🔍 Opening application details:',
                                application
                              )
                              console.log('🔍 Application ID:', application._id)
                              console.log(
                                '🔍 Application fullName:',
                                application.fullName
                              )
                              console.log(
                                '🔍 Application email:',
                                application.email
                              )
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

              {/* See More/Less Button */}
              {filterApplications(applications).length > applicationsToShow && (
                <div className="p-4 border-t border-border-color">
                  <button
                    onClick={() => setShowAllApplications(!showAllApplications)}
                    className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {showAllApplications ? (
                      <>
                        <i className="fas fa-chevron-up"></i>
                        See Less
                      </>
                    ) : (
                      <>
                        <i className="fas fa-chevron-down"></i>
                        See More (
                        {filterApplications(applications).length -
                          applicationsToShow}{' '}
                        more)
                      </>
                    )}
                  </button>
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
                    {selectedJob.salary &&
                    (selectedJob.salary.min || selectedJob.salary.max)
                      ? `${selectedJob.salary.currency || 'AED'} ${selectedJob.salary.min || ''}${selectedJob.salary.min && selectedJob.salary.max ? ' - ' : ''}${selectedJob.salary.max || ''}${selectedJob.salary.min && !selectedJob.salary.max ? '+' : ''}`
                      : 'Competitive'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Experience Level
                  </h3>
                  <p className="text-gray-600">
                    {selectedJob.experience || 'Entry Level'}
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
              {/* Debug: Show selected application data */}
              {console.log(
                '🎯 Modal opened with selectedApplication:',
                selectedApplication
              )}
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
                    {selectedApplication.experience || 'Entry Level'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Expected Salary
                  </h3>
                  <p className="text-gray-600">
                    {selectedApplication.expectedSalary
                      ? typeof selectedApplication.expectedSalary === 'object'
                        ? selectedApplication.expectedSalary.amount ||
                          selectedApplication.expectedSalary.min
                          ? `${selectedApplication.expectedSalary.currency || 'AED'} ${selectedApplication.expectedSalary.amount || selectedApplication.expectedSalary.min}`
                          : `${selectedApplication.expectedSalary.currency || 'AED'} (Not specified)`
                        : `${selectedApplication.currency || 'AED'} ${selectedApplication.expectedSalary}`
                      : 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Cover Letter
                  </h3>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {selectedApplication.coverLetter &&
                    selectedApplication.coverLetter.trim().length > 0
                      ? selectedApplication.coverLetter
                      : 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Resume/CV
                  </h3>
                  {/* Debug: Log resume data structure */}
                  {console.log(
                    '🔍 Resume data structure:',
                    selectedApplication.resume
                  )}
                  {selectedApplication.resume &&
                  (selectedApplication.resume.filename ||
                    selectedApplication.resume.originalName ||
                    selectedApplication.resume.data ||
                    selectedApplication.resume.size > 0) ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        <i className="fas fa-file-pdf-alt mr-2"></i>
                        {selectedApplication.resume.originalName ||
                          selectedApplication.resume.filename}
                        <span className="ml-2 text-xs text-gray-500">
                          (
                          {Math.round(
                            (selectedApplication.resume.size || 0) / 1024
                          )}{' '}
                          KB)
                        </span>
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleViewResume(selectedApplication._id)
                          }
                          className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                          <i className="fas fa-eye mr-2"></i>
                          View Resume
                        </button>
                        <button
                          onClick={() =>
                            handleDownloadResume(selectedApplication._id)
                          }
                          className="px-3 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors text-sm font-medium"
                        >
                          <i className="fas fa-download mr-2"></i>
                          Download Resume
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        <i className="fas fa-file-alt mr-2"></i>
                        No resume uploaded
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            // Check if we have a valid selected application
                            if (
                              !selectedApplication ||
                              !selectedApplication._id
                            ) {
                              console.log('❌ No valid application selected')
                              setSuccessMessage('No application selected')
                              setTimeout(() => setSuccessMessage(''), 2000)
                              return
                            }

                            console.log(
                              '🔄 Force refreshing application data from backend...'
                            )
                            console.log(
                              '📋 Application ID:',
                              selectedApplication._id
                            )

                            fetchApplications(true) // Force refresh with cache busting

                            // Also fetch the specific application details
                            const fetchApplicationDetails = async () => {
                              try {
                                const response = await api.get(
                                  `/applications/${selectedApplication._id}`
                                )
                                console.log('📋 API Response:', response)
                                console.log(
                                  '📋 Response data structure:',
                                  JSON.stringify(response.data, null, 2)
                                )

                                // Handle different response structures
                                const applicationData =
                                  response.data?.data?.application || // New structure: data.application
                                  response.data?.application || // Alternative: data.application
                                  response.data?.data || // Original: data
                                  response.data || // Direct: response
                                  response // Fallback: response

                                if (applicationData) {
                                  console.log(
                                    '📄 Fresh application data:',
                                    applicationData
                                  )
                                  console.log(
                                    '📄 Complete application structure:',
                                    JSON.stringify(applicationData, null, 2)
                                  )
                                  console.log(
                                    '🔍 Resume in fresh data:',
                                    applicationData.resume
                                  )
                                  console.log(
                                    '🔍 Resume type:',
                                    typeof applicationData.resume
                                  )
                                  console.log(
                                    '🔍 Resume keys:',
                                    applicationData.resume
                                      ? Object.keys(applicationData.resume)
                                      : 'no resume object'
                                  )
                                  // Update the selected application with fresh data
                                  setSelectedApplication(applicationData)
                                  setSuccessMessage(
                                    'Application data refreshed!'
                                  )
                                  setTimeout(() => setSuccessMessage(''), 2000)
                                } else {
                                  console.log(
                                    '⚠️ No application data in response'
                                  )
                                  setSuccessMessage('No application data found')
                                  setTimeout(() => setSuccessMessage(''), 2000)
                                }
                              } catch (error) {
                                console.error(
                                  '❌ Error fetching application details:',
                                  error
                                )
                                setSuccessMessage(
                                  'Failed to fetch application details'
                                )
                                setTimeout(() => setSuccessMessage(''), 2000)
                              }
                            }

                            fetchApplicationDetails()
                          }}
                          className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                        >
                          <i className="fas fa-sync-alt mr-2"></i>
                          Refresh Data
                        </button>
                        <button
                          onClick={addTestResumeData}
                          className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                          title="Add test resume data for debugging"
                        >
                          <i className="fas fa-flask mr-2"></i>
                          Test Resume
                        </button>
                        <button
                          disabled
                          className="px-3 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm font-medium"
                          title="No resume available"
                        >
                          <i className="fas fa-eye mr-2"></i>
                          View Resume
                        </button>
                        <button
                          disabled
                          className="px-3 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm font-medium"
                          title="No resume available"
                        >
                          <i className="fas fa-download mr-2"></i>
                          Download Resume
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                  <p className="text-gray-600">
                    {selectedApplication.status || 'pending'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Submitted Date
                  </h3>
                  <p className="text-gray-600">
                    {selectedApplication.createdAt
                      ? new Date(selectedApplication.createdAt).toLocaleString()
                      : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
