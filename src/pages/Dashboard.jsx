// Dashboard Page Component - Side-by-Side Layout with Complete Isolation
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import api, { candidatesAPI } from '../services/api'
import * as XLSX from 'xlsx'

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
    createBackup,
    downloadBackup,
    setAutoBackup,
    clearBackupHistory,
    backups,
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

  // Candidates Section State
  const [activeSection, setActiveSection] = useState('all') // 'all', 'candidates', 'applications', 'jobs'
  const [candidates, setCandidates] = useState([])
  const [candidateFilters, setCandidateFilters] = useState({
    search: '',
    location: '',
    visaStatus: '',
    industry: '',
    nationality: '',
  })
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [showCandidateModal, setShowCandidateModal] = useState(false)
  const [deletingCandidateId, setDeletingCandidateId] = useState(null)
  const [candidatesToShow, setCandidatesToShow] = useState(6)
  const [showAllCandidates, setShowAllCandidates] = useState(false)

  // Fetch candidates from API or derive from registered applications
  const fetchCandidateProfiles = useCallback(async () => {
    try {
      const candidatesData = await candidatesAPI.getAllCandidates()
      if (Array.isArray(candidatesData) && candidatesData.length > 0) {
        setCandidates(candidatesData)
      } else {
        // Fallback: Build candidates list from registered applications & sessionStorage
        const savedApps = JSON.parse(sessionStorage.getItem('dashboardApplications') || '[]')
        const allCandidateApps = [...(applications || []), ...savedApps]
        
        // Deduplicate candidates by email
        const candidateMap = new Map()
        allCandidateApps.forEach((app) => {
          if (app && app.email && !candidateMap.has(app.email.toLowerCase())) {
            candidateMap.set(app.email.toLowerCase(), {
              _id: app._id || app.id || String(Date.now()),
              firstName: app.firstName || app.fullName?.split(' ')[0] || 'Candidate',
              lastName: app.lastName || app.fullName?.split(' ').slice(1).join(' ') || '',
              fullName: app.fullName || `${app.firstName || ''} ${app.lastName || ''}`.trim() || 'Candidate',
              email: app.email,
              mobile: app.mobile || app.phone || '',
              phone: app.phone || app.mobile || '',
              nationality: app.nationality || 'Not specified',
              currentlyLocated: app.currentlyLocated || 'Not specified',
              visaStatus: app.visaStatus || '',
              industry: app.industry || app.jobRole || app.jobTitle || 'General Profile',
              attachedCv: app.attachedCv || app.resume || '',
              resume: app.resume || app.attachedCv || '',
              createdAt: app.createdAt || new Date().toISOString(),
              status: app.status || 'Active Candidate',
            })
          }
        })
        setCandidates(Array.from(candidateMap.values()))
      }
    } catch (err) {
      console.warn('Notice loading candidates:', err)
    }
  }, [applications])

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

        // Fetch candidate profiles
        fetchCandidateProfiles()
      } catch (error) {
        if (!isMounted) return
        console.error('❌ Error fetching dashboard data:', error)
      }
    }

    timeoutId = setTimeout(() => {
      fetchData()
    }, 1000)

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [fetchCandidateProfiles])

  // Refresh candidate profiles when applications change
  useEffect(() => {
    fetchCandidateProfiles()
  }, [applications, fetchCandidateProfiles])

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

  // Debug applicationFilters changes
  useEffect(() => {
    console.log('🔍 Application Filters Updated:', applicationFilters)
  }, [applicationFilters])

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
            (application.jobRole && applicationFilters.jobRole === 'other'
              ? !application.jobRole.toLowerCase().includes('developer') &&
                !application.jobRole.toLowerCase().includes('designer') &&
                !application.jobRole.toLowerCase().includes('manager') &&
                !application.jobRole.toLowerCase().includes('analyst') &&
                !application.jobRole.toLowerCase().includes('engineer') &&
                !application.jobRole.toLowerCase().includes('consultant') &&
                !application.jobRole.toLowerCase().includes('accountant') &&
                !application.jobRole.toLowerCase().includes('marketing') &&
                !application.jobRole.toLowerCase().includes('sales') &&
                !application.jobRole.toLowerCase().includes('hr')
              : application.jobRole
                  .toLowerCase()
                  .includes(applicationFilters.jobRole.toLowerCase()))
          const matchesExperience =
            !applicationFilters.experience ||
            (application.experience &&
              application.experience === applicationFilters.experience)
          const matchesSalary =
            !applicationFilters.expectedSalary ||
            (application.expectedSalary &&
              (() => {
                const appSalary =
                  typeof application.expectedSalary === 'object'
                    ? application.expectedSalary.min
                    : application.expectedSalary
                const appSalaryNum = Number(
                  String(appSalary).replace(/[^0-9.-]+/g, '')
                )
                const filterSalaryNum = Number(
                  applicationFilters.expectedSalary
                )
                return appSalaryNum >= filterSalaryNum
              })())
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

  // Filter candidate profiles
  const filterCandidates = useMemo(() => {
    return (candidatesToFilter) => {
      if (!Array.isArray(candidatesToFilter)) return []

      return candidatesToFilter.filter((cand) => {
        const searchLower = candidateFilters.search.toLowerCase()
        const matchesSearch =
          !candidateFilters.search ||
          cand.fullName?.toLowerCase().includes(searchLower) ||
          cand.email?.toLowerCase().includes(searchLower) ||
          cand.mobile?.toLowerCase().includes(searchLower) ||
          cand.nationality?.toLowerCase().includes(searchLower) ||
          cand.industry?.toLowerCase().includes(searchLower)

        const matchesLocation =
          !candidateFilters.location ||
          cand.currentlyLocated?.toLowerCase() === candidateFilters.location.toLowerCase()

        const matchesVisa =
          !candidateFilters.visaStatus ||
          cand.visaStatus?.toLowerCase() === candidateFilters.visaStatus.toLowerCase()

        const matchesIndustry =
          !candidateFilters.industry ||
          cand.industry?.toLowerCase().includes(candidateFilters.industry.toLowerCase())

        const matchesNationality =
          !candidateFilters.nationality ||
          cand.nationality?.toLowerCase().includes(candidateFilters.nationality.toLowerCase())

        return (
          matchesSearch &&
          matchesLocation &&
          matchesVisa &&
          matchesIndustry &&
          matchesNationality
        )
      })
    }
  }, [candidateFilters])

  const handleDeleteCandidate = async (candidate) => {
    if (
      !window.confirm(
        `Are you sure you want to remove candidate "${candidate.fullName}" from the talent pool?`
      )
    ) {
      return
    }

    setDeletingCandidateId(candidate._id)
    try {
      await candidatesAPI.deleteCandidate(candidate._id)
      setCandidates((prev) => prev.filter((c) => c._id !== candidate._id))
      setSuccessMessage(`Candidate "${candidate.fullName}" removed successfully!`)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.warn('Candidate delete fallback:', error)
      setCandidates((prev) => prev.filter((c) => c._id !== candidate._id))
      setSuccessMessage(`Candidate "${candidate.fullName}" removed from list.`)
      setTimeout(() => setSuccessMessage(''), 3000)
    } finally {
      setDeletingCandidateId(null)
    }
  }

  const downloadCandidatesExcel = () => {
    try {
      const filteredCands = filterCandidates(candidates)
      if (!filteredCands || filteredCands.length === 0) {
        setSuccessMessage('No candidates data to download')
        setTimeout(() => setSuccessMessage(''), 3000)
        return
      }

      const excelData = filteredCands.map((cand, index) => ({
        'S.No': index + 1,
        'First Name': cand.firstName || '',
        'Last Name': cand.lastName || '',
        'Full Name': cand.fullName || '',
        Email: cand.email || '',
        Mobile: cand.mobile || cand.phone || '',
        Nationality: cand.nationality || '',
        'Currently Located': cand.currentlyLocated || '',
        'Visa Status': cand.visaStatus || '',
        Industry: cand.industry || '',
        'CV / Resume': typeof cand.attachedCv === 'string' ? cand.attachedCv : cand.attachedCv?.name || 'Attached',
        'Registered Date': cand.createdAt ? new Date(cand.createdAt).toLocaleDateString() : '',
      }))

      const ws = XLSX.utils.json_to_sheet(excelData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Candidates')

      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const filename = `Maplorix_Candidates_Pool_${timestamp}.xlsx`
      XLSX.writeFile(wb, filename)

      setSuccessMessage('Candidates Excel downloaded successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Failed to export candidates excel:', err)
      setSuccessMessage('Failed to download Excel')
      setTimeout(() => setSuccessMessage(''), 3000)
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

      // Check if response has valid data
      if (!response || !response.data || response.data.size === 0) {
        setSuccessMessage('No resume file available for this application')
        setTimeout(() => setSuccessMessage(''), 3000)
        return
      }

      // Safely get headers (may be undefined with mock data fallback)
      const headers = response.headers || {}

      // Create a blob from the response
      const blob = new Blob([response.data], {
        type: headers['content-type'] || 'application/octet-stream',
      })

      // Create a temporary URL and trigger download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Get filename from response headers or use default
      const contentDisposition = headers['content-disposition']
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

      // Check if response has valid data
      if (!response || !response.data || response.data.size === 0) {
        setSuccessMessage('No resume file available for this application')
        setTimeout(() => setSuccessMessage(''), 3000)
        return
      }

      // Safely get headers (may be undefined with mock data fallback)
      const headers = response.headers || {}

      // Create a blob from the response
      const blob = new Blob([response.data], {
        type: headers['content-type'] || 'application/octet-stream',
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

  // Download Excel function for applications data
  const downloadApplicationsExcel = () => {
    try {
      console.log('📊 Downloading applications data as Excel...')

      // Get filtered applications
      const filteredApps = filterApplications(applications)

      if (!filteredApps || filteredApps.length === 0) {
        setSuccessMessage('No applications data to download')
        setTimeout(() => setSuccessMessage(''), 3000)
        return
      }

      // Prepare data for Excel
      const excelData = filteredApps.map((app, index) => ({
        'S.No': index + 1,
        'Application ID': app._id || '',
        'Full Name': app.fullName || '',
        Email: app.email || '',
        Phone: app.phone || '',
        'Job Role': app.jobRole || '',
        Experience: app.experience || '',
        'Current Company': app.currentCompany || '',
        'Current Position': app.currentPosition || '',
        Education: app.education || '',
        Skills: app.skills || '',
        'Cover Letter': app.coverLetter || '',
        LinkedIn: app.linkedin || '',
        Portfolio: app.portfolio || '',
        'Expected Salary': app.expectedSalary || '',
        'Notice Period': app.noticePeriod || '',
        'Work Mode': app.workMode || '',
        Location: app.location || '',
        Status: app.status || 'Pending',
        'Applied Date': app.createdAt
          ? new Date(app.createdAt).toLocaleDateString()
          : '',
        'Updated Date': app.updatedAt
          ? new Date(app.updatedAt).toLocaleDateString()
          : '',
        'Resume Available': app.resume && app.resume.data ? 'Yes' : 'No',
      }))
      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Applications')

      // Auto-size columns
      const colWidths = []
      Object.keys(excelData[0] || {}).forEach((key) => {
        const maxLength = Math.max(
          key.length,
          ...excelData.map((row) => String(row[key] || '').length)
        )
        colWidths.push({ wch: Math.min(maxLength + 2, 50) })
      })
      ws['!cols'] = colWidths

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const filename = `Maplorix_Applications_${timestamp}.xlsx`

      // Download the file
      XLSX.writeFile(wb, filename)

      setSuccessMessage(
        `Successfully downloaded ${filteredApps.length} applications as Excel!`
      )
      setTimeout(() => setSuccessMessage(''), 3000)

      console.log(`✅ Excel file downloaded: ${filename}`)
    } catch (error) {
      console.error('❌ Error downloading Excel:', error)
      setSuccessMessage('Failed to download Excel file')
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-white p-6 border-l-4 border-[#149fc9] shadow-custom">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-light uppercase tracking-wider">
                  Candidate Profiles
                </p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {candidates.length}
                </p>
                <p className="text-xs text-emerald-600 font-medium mt-1">Talent Pool Records</p>
              </div>
              <div className="w-12 h-12 bg-[#149fc9]/10 rounded-xl flex items-center justify-center">
                <i className="fas fa-id-card text-[#149fc9] text-xl"></i>
              </div>
            </div>
          </div>

          <div className="card bg-white p-6 border-l-4 border-primary shadow-custom">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-light uppercase tracking-wider">
                  Job Applications
                </p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {stats.totalApplications || applications.length}
                </p>
                <p className="text-xs text-text-light mt-1">Submitted for jobs</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <i className="fas fa-file-signature text-primary text-xl"></i>
              </div>
            </div>
          </div>

          <div className="card bg-white p-6 border-l-4 border-secondary shadow-custom">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-light uppercase tracking-wider">
                  Total Jobs Posted
                </p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {stats.totalJobs || jobs.length}
                </p>
                <p className="text-xs text-text-light mt-1">Active Positions</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                <i className="fas fa-briefcase text-secondary text-xl"></i>
              </div>
            </div>
          </div>

          <div className="card bg-white p-6 border-l-4 border-accent shadow-custom">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-light uppercase tracking-wider">
                  Recent Activity
                </p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {(stats.recentApplications || 0) + (stats.recentJobs || 0)}
                </p>
                <p className="text-xs text-text-light mt-1">Last 7 days</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <i className="fas fa-clock text-accent text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveSection('all')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'all'
                ? 'bg-[#023341] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <i className="fas fa-th-large"></i>
            All Dashboard
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('candidates')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'candidates'
                ? 'bg-[#149fc9] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <i className="fas fa-users"></i>
            Candidates Pool / Profiles
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeSection === 'candidates' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
            }`}>
              {candidates.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('applications')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'applications'
                ? 'bg-[#023341] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <i className="fas fa-file-alt"></i>
            Job Applications
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeSection === 'applications' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-800'
            }`}>
              {applications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('jobs')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'jobs'
                ? 'bg-[#023341] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <i className="fas fa-briefcase"></i>
            Jobs Posted
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeSection === 'jobs' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-800'
            }`}>
              {jobs.length}
            </span>
          </button>
        </div>

        {/* ── SECTION 1: CANDIDATES POOL (PROFILES) ── */}
        {(activeSection === 'all' || activeSection === 'candidates') && (
          <div className="card bg-white shadow-custom mb-8">
            <div className="px-6 py-4 border-b border-border-color bg-gradient-to-r from-blue-50/50 to-emerald-50/50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#149fc9] text-white rounded-xl flex items-center justify-center shadow-sm">
                  <i className="fas fa-id-card text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary">
                    Candidates Profile Pool
                  </h3>
                  <p className="text-xs text-text-light">
                    Registered candidates with full profile information and attached CVs
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadCandidatesExcel}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <i className="fas fa-file-excel"></i> Export Candidates
                </button>
                <button
                  type="button"
                  onClick={fetchCandidateProfiles}
                  className="px-3.5 py-2 bg-[#023341] hover:bg-[#034a5e] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <i className="fas fa-sync-alt"></i> Refresh
                </button>
              </div>
            </div>

            {/* Candidate Filters */}
            <div className="px-6 py-4 border-b border-border-color bg-gray-50/60">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Search name, email, phone..."
                  value={candidateFilters.search}
                  onChange={(e) =>
                    setCandidateFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#149fc9] focus:border-[#149fc9]"
                />

                <select
                  value={candidateFilters.location}
                  onChange={(e) =>
                    setCandidateFilters((prev) => ({ ...prev, location: e.target.value }))
                  }
                  className="px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#149fc9] focus:border-[#149fc9]"
                >
                  <option value="">All Locations</option>
                  <option value="India">India</option>
                  <option value="UAE">UAE</option>
                </select>

                <select
                  value={candidateFilters.visaStatus}
                  onChange={(e) =>
                    setCandidateFilters((prev) => ({ ...prev, visaStatus: e.target.value }))
                  }
                  className="px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#149fc9] focus:border-[#149fc9]"
                >
                  <option value="">All Visa Statuses</option>
                  <option value="visitVisa">Visit Visa</option>
                  <option value="residenceVisa">Residence Visa</option>
                  <option value="spouseVisa">Spouse Visa</option>
                </select>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Filter industry..."
                    value={candidateFilters.industry}
                    onChange={(e) =>
                      setCandidateFilters((prev) => ({ ...prev, industry: e.target.value }))
                    }
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#149fc9] focus:border-[#149fc9]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setCandidateFilters({
                        search: '',
                        location: '',
                        visaStatus: '',
                        industry: '',
                        nationality: '',
                      })
                    }
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-semibold"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Candidates Grid */}
            <div className="p-6">
              {filterCandidates(candidates).length === 0 ? (
                <div className="text-center py-10">
                  <i className="fas fa-user-slash text-4xl text-gray-300 mb-2"></i>
                  <p className="text-sm font-semibold text-gray-600">No candidate profiles found</p>
                  <p className="text-xs text-gray-400 mt-1">Candidates who register on the website will automatically appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterCandidates(candidates)
                    .slice(0, showAllCandidates ? undefined : candidatesToShow)
                    .map((candidate) => (
                      <div
                        key={candidate._id}
                        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all hover:border-[#149fc9]/50 flex flex-col justify-between"
                      >
                        <div>
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100 mb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-full bg-[#023341] text-white flex items-center justify-center font-bold text-sm shrink-0">
                                {(candidate.firstName?.[0] || candidate.fullName?.[0] || 'C').toUpperCase()}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-gray-900 leading-tight">
                                  {candidate.firstName && candidate.lastName
                                    ? `${candidate.firstName} ${candidate.lastName}`
                                    : candidate.fullName || 'Candidate'}
                                </h4>
                                <span className="inline-block text-[11px] font-semibold text-[#149fc9] bg-blue-50 px-2 py-0.5 rounded mt-0.5">
                                  {candidate.industry || 'General Profile'}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                              Registered
                            </span>
                          </div>

                          {/* Candidate Information Fields */}
                          <div className="space-y-1.5 text-xs text-gray-600 mb-3">
                            <p className="flex items-center gap-2 truncate">
                              <i className="fas fa-envelope text-gray-400 w-3.5"></i>
                              <span className="font-medium text-gray-800 truncate">{candidate.email}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <i className="fas fa-phone text-gray-400 w-3.5"></i>
                              <span className="font-medium text-gray-800">{candidate.mobile || candidate.phone || 'N/A'}</span>
                            </p>
                            <div className="grid grid-cols-2 gap-1 pt-1 text-[11px]">
                              <div>
                                <span className="text-gray-400 block text-[10px]">Nationality</span>
                                <span className="font-semibold text-gray-700">{candidate.nationality || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[10px]">Location</span>
                                <span className="font-semibold text-gray-700">{candidate.currentlyLocated || 'N/A'}</span>
                              </div>
                              {candidate.visaStatus && (
                                <div className="col-span-2 mt-0.5">
                                  <span className="text-gray-400 block text-[10px]">Visa Status</span>
                                  <span className="font-semibold text-gray-700">{candidate.visaStatus}</span>
                                </div>
                              )}
                            </div>

                            {/* CV Badge */}
                            {(candidate.attachedCv || candidate.resume) && (
                              <div className="mt-2 p-2 bg-emerald-50/80 border border-emerald-200 rounded-lg flex items-center justify-between gap-1 text-[11px]">
                                <div className="flex items-center gap-1.5 truncate">
                                  <i className="fas fa-file-pdf text-red-500"></i>
                                  <span className="font-semibold text-gray-800 truncate">
                                    {typeof candidate.attachedCv === 'string'
                                      ? candidate.attachedCv
                                      : candidate.attachedCv?.name || 'Resume.pdf'}
                                  </span>
                                </div>
                                <span className="text-[10px] text-emerald-700 font-bold bg-white px-1.5 py-0.5 rounded shadow-2xs">
                                  Verified
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCandidate(candidate)
                              setShowCandidateModal(true)
                            }}
                            className="flex-1 py-1.5 bg-[#023341] hover:bg-[#034a5e] text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                          >
                            <i className="fas fa-eye"></i> View Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadResume(candidate._id)}
                            className="py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors"
                            title="Download CV"
                          >
                            <i className="fas fa-download"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCandidate(candidate)}
                            disabled={deletingCandidateId === candidate._id}
                            className="py-1.5 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                            title="Remove Candidate"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Show More/Less for Candidates */}
              {filterCandidates(candidates).length > candidatesToShow && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAllCandidates(!showAllCandidates)}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                  >
                    {showAllCandidates ? (
                      <>
                        <i className="fas fa-chevron-up"></i> Show Less Candidates
                      </>
                    ) : (
                      <>
                        <i className="fas fa-chevron-down"></i> View All ({filterCandidates(candidates).length}) Candidates
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SECTION 2 & 3: JOBS AND APPLICATIONS SIDE-BY-SIDE ── */}
        {(activeSection === 'all' || activeSection === 'jobs' || activeSection === 'applications') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Jobs Section - Left */}
            {(activeSection === 'all' || activeSection === 'jobs') && (
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
                                {job.title}
                              </h4>
                              <span className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-full">
                                {job.type || job.jobType || 'Full-time'}
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
                                <i className="fas fa-money-bill mr-2"></i>
                                {job.salary &&
                                (job.salary.min || job.salary.max)
                                  ? `${job.salary.currency || 'AED'} ${job.salary.min || ''}${job.salary.min && job.salary.max ? ' - ' : ''}${job.salary.max || ''}${job.salary.min && !job.salary.max ? '+' : ''}`
                                  : 'Competitive'}
                              </p>
                            </div>
                            <div className="mt-3 flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedJob(job)
                                  setShowJobModal(true)
                                }}
                                className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/90 transition-colors"
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

                  {/* See More/Less Button */}
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
            )}

            {/* Applications Section - Right */}
            {(activeSection === 'all' || activeSection === 'applications') && (
              <div className="card bg-white shadow-custom">
                <div className="px-6 py-4 border-b border-border-color flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                      <i className="fas fa-file-alt text-accent"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-primary">
                      Applications
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={downloadApplicationsExcel}
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors flex items-center gap-1 font-semibold"
                      title="Download applications data as Excel"
                    >
                      <i className="fas fa-download"></i>
                      Excel
                    </button>
                    <span className="text-sm text-text-light">
                      {filterApplications(applications).length} apps
                    </span>
                  </div>
                </div>

                {/* Applications Filters */}
                <div className="px-6 py-4 border-b border-border-color bg-accent/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Candidate name..."
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
                      placeholder="Email..."
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
                      value={applicationFilters.jobRole}
                      onChange={(e) =>
                        setApplicationFilters((prev) => ({
                          ...prev,
                          jobRole: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border border-border-color rounded-lg text-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
                    >
                      <option value="">All Roles</option>
                      <option value="developer">Developer</option>
                      <option value="designer">Designer</option>
                      <option value="manager">Manager</option>
                      <option value="marketing">Marketing</option>
                      <option value="sales">Sales</option>
                      <option value="hr">HR</option>
                      <option value="other">Other</option>
                    </select>
                    <button
                      onClick={() =>
                        setApplicationFilters({
                          fullName: '',
                          email: '',
                          jobRole: '',
                          experience: '',
                          expectedSalary: '',
                        })
                      }
                      className="px-3 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90 transition-colors"
                    >
                      Clear Filters
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
                            <div className="space-y-1.5 text-xs text-text-light">
                              <p className="flex items-center gap-2">
                                <i className="fas fa-envelope text-accent w-4"></i>
                                <span className="font-medium text-gray-800">{application.email || 'Not specified'}</span>
                              </p>
                              <p className="flex items-center gap-2">
                                <i className="fas fa-phone text-accent w-4"></i>
                                <span className="font-medium text-gray-800">{application.mobile || application.phone || 'Not specified'}</span>
                              </p>
                              <p className="flex items-center gap-2">
                                <i className="fas fa-briefcase text-accent w-4"></i>
                                <span>Role / Industry: <strong>{application.industry || application.jobRole || 'Candidate Profile'}</strong></span>
                              </p>
                              <div className="grid grid-cols-2 gap-1 pt-1 text-[11px] text-gray-500">
                                <span><i className="fas fa-globe mr-1 text-gray-400"></i> {application.nationality || 'Nationality: N/A'}</span>
                                <span><i className="fas fa-map-marker-alt mr-1 text-gray-400"></i> {application.currentlyLocated || 'Location: N/A'}</span>
                                {application.visaStatus && (
                                  <span className="col-span-2"><i className="fas fa-passport mr-1 text-gray-400"></i> Visa: {application.visaStatus}</span>
                                )}
                              </div>
                              {(application.attachedCv || application.resume) && (
                                <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-medium border border-emerald-200">
                                  <i className="fas fa-file-pdf text-red-500"></i>
                                  <span className="truncate max-w-[200px]">
                                    {typeof application.attachedCv === 'string'
                                      ? application.attachedCv
                                      : typeof application.resume === 'string'
                                        ? application.resume
                                        : application.attachedCv?.name || application.resume?.originalName || 'CV Attached'}
                                  </span>
                                </div>
                              )}
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
                                onClick={() =>
                                  handleDeleteApplication(application)
                                }
                                disabled={
                                  deletingApplicationId === application._id
                                }
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
                  {filterApplications(applications).length >
                    applicationsToShow && (
                    <div className="p-4 border-t border-border-color">
                      <button
                        onClick={() =>
                          setShowAllApplications(!showAllApplications)
                        }
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
            )}
          </div>
        )}
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
              <div className="bg-gradient-to-br from-blue-50/50 to-emerald-50/50 p-4 rounded-xl border border-gray-200 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#023341] text-white flex items-center justify-center font-bold text-lg">
                    {(selectedApplication.firstName?.[0] || selectedApplication.fullName?.[0] || 'C').toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {selectedApplication.firstName && selectedApplication.lastName
                        ? `${selectedApplication.firstName} ${selectedApplication.lastName}`
                        : selectedApplication.fullName || 'Candidate Profile'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Applied on {new Date(selectedApplication.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {/* 1. First Name */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-500 uppercase">First Name</span>
                  <p className="font-medium text-gray-900 mt-0.5">
                    {selectedApplication.firstName || selectedApplication.fullName?.split(' ')[0] || 'N/A'}
                  </p>
                </div>

                {/* 2. Last Name */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-500 uppercase">Last Name</span>
                  <p className="font-medium text-gray-900 mt-0.5">
                    {selectedApplication.lastName || selectedApplication.fullName?.split(' ').slice(1).join(' ') || 'N/A'}
                  </p>
                </div>

                {/* 3. Email Address */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-500 uppercase">Email Address</span>
                  <p className="font-medium text-gray-900 mt-0.5">{selectedApplication.email || 'N/A'}</p>
                </div>

                {/* 4. Mobile / Phone Number */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-500 uppercase">Mobile / Phone Number</span>
                  <p className="font-medium text-gray-900 mt-0.5">
                    {selectedApplication.mobile || selectedApplication.phone || 'N/A'}
                  </p>
                </div>

                {/* 5. Nationality */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-500 uppercase">Nationality</span>
                  <p className="font-medium text-gray-900 mt-0.5">{selectedApplication.nationality || 'N/A'}</p>
                </div>

                {/* 6. Currently Located */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-500 uppercase">Currently Located</span>
                  <p className="font-medium text-gray-900 mt-0.5">{selectedApplication.currentlyLocated || 'N/A'}</p>
                </div>

                {/* 7. Visa Status */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-500 uppercase">Visa Status</span>
                  <p className="font-medium text-gray-900 mt-0.5">{selectedApplication.visaStatus || 'N/A'}</p>
                </div>

                {/* 8. Industry / Job Role */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-500 uppercase">Industry / Job Role</span>
                  <p className="font-medium text-gray-900 mt-0.5">
                    {selectedApplication.industry || selectedApplication.jobRole || selectedApplication.jobTitle || 'N/A'}
                  </p>
                </div>
              </div>

              {/* 9. Attach CV / Resume Section */}
              <div className="mt-5 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <span className="block text-xs font-semibold text-gray-500 uppercase mb-2">Attach CV / Resume</span>
                {selectedApplication.attachedCv || selectedApplication.resume ? (
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-file-pdf text-red-500 text-2xl"></i>
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {typeof selectedApplication.attachedCv === 'string'
                            ? selectedApplication.attachedCv
                            : typeof selectedApplication.resume === 'string'
                              ? selectedApplication.resume
                              : selectedApplication.attachedCv?.name || selectedApplication.resume?.originalName || 'Resume.pdf'}
                        </p>
                        <p className="text-xs text-emerald-600 font-medium">CV attached &amp; verified</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleViewResume(selectedApplication._id)}
                        className="px-3 py-1.5 bg-[#023341] text-white rounded-lg hover:bg-[#034a5e] transition-colors text-xs font-semibold flex items-center gap-1.5"
                      >
                        <i className="fas fa-eye"></i> View CV
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadResume(selectedApplication._id)}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs font-semibold flex items-center gap-1.5"
                      >
                        <i className="fas fa-download"></i> Download
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">No resume attached</p>
                )}
              </div>
              {/* Modal Footer Actions */}
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseApplicationModal}
                  className="px-5 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg text-sm font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Profile Details Modal */}
      {showCandidateModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-150">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-[#023341] to-[#034a5e] text-white rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                    {(selectedCandidate.firstName?.[0] || selectedCandidate.fullName?.[0] || 'C').toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedCandidate.firstName && selectedCandidate.lastName
                        ? `${selectedCandidate.firstName} ${selectedCandidate.lastName}`
                        : selectedCandidate.fullName || 'Candidate Profile'}
                    </h2>
                    <p className="text-xs text-emerald-300 font-medium">
                      Registered Candidate • {selectedCandidate.industry || 'Talent Pool'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCandidateModal(false)
                    setSelectedCandidate(null)
                  }}
                  className="text-white/80 hover:text-white text-2xl font-light w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">First Name</span>
                  <p className="font-semibold text-gray-900 mt-1">
                    {selectedCandidate.firstName || selectedCandidate.fullName?.split(' ')[0] || 'N/A'}
                  </p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Last Name</span>
                  <p className="font-semibold text-gray-900 mt-1">
                    {selectedCandidate.lastName || selectedCandidate.fullName?.split(' ').slice(1).join(' ') || 'N/A'}
                  </p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</span>
                  <p className="font-semibold text-gray-900 mt-1">{selectedCandidate.email || 'N/A'}</p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mobile / Phone Number</span>
                  <p className="font-semibold text-gray-900 mt-1">
                    {selectedCandidate.mobile || selectedCandidate.phone || 'N/A'}
                  </p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nationality</span>
                  <p className="font-semibold text-gray-900 mt-1">{selectedCandidate.nationality || 'N/A'}</p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Currently Located</span>
                  <p className="font-semibold text-gray-900 mt-1">{selectedCandidate.currentlyLocated || 'N/A'}</p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Visa Status</span>
                  <p className="font-semibold text-gray-900 mt-1">{selectedCandidate.visaStatus || 'N/A'}</p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Industry / Job Role</span>
                  <p className="font-semibold text-gray-900 mt-1">
                    {selectedCandidate.industry || selectedCandidate.jobRole || 'General Profile'}
                  </p>
                </div>
              </div>

              {/* Attach CV / Resume section */}
              <div className="mt-4 bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
                <span className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-2">Attached CV / Resume</span>
                {selectedCandidate.attachedCv || selectedCandidate.resume ? (
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2.5">
                      <i className="fas fa-file-pdf text-red-500 text-2xl"></i>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {typeof selectedCandidate.attachedCv === 'string'
                            ? selectedCandidate.attachedCv
                            : typeof selectedCandidate.resume === 'string'
                              ? selectedCandidate.resume
                              : selectedCandidate.attachedCv?.name || selectedCandidate.resume?.originalName || 'Candidate_Resume.pdf'}
                        </p>
                        <p className="text-xs text-emerald-700">Uploaded during candidate registration</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleViewResume(selectedCandidate._id)}
                        className="px-3.5 py-1.5 bg-[#023341] text-white rounded-lg hover:bg-[#034a5e] transition-colors text-xs font-semibold flex items-center gap-1.5"
                      >
                        <i className="fas fa-eye"></i> View CV
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadResume(selectedCandidate._id)}
                        className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs font-semibold flex items-center gap-1.5"
                      >
                        <i className="fas fa-download"></i> Download
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">No CV uploaded for this candidate</p>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCandidateModal(false)
                    setSelectedCandidate(null)
                  }}
                  className="px-5 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-xl text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
