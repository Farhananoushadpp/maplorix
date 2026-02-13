import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/ApplicationStyles.css'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    activeJobs: 0,
    featuredJobs: 0,
    recentApplications: [],
  })
  const [allJobs, setAllJobs] = useState([])
  const [allApplications, setAllApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const navigate = useNavigate()

  useEffect(() => {
    checkAdminAuth()
    fetchDashboardData()
  }, [])

  const checkAdminAuth = () => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      navigate('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== 'admin') {
        navigate('/')
        return
      }
      setUser(parsedUser)
    } catch (error) {
      console.error('Error parsing user data:', error)
      navigate('/login')
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      // Fetch job statistics
      const statsResponse = await fetch(
        'http://localhost:4000/api/admin/jobs/stats',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const statsResult = await statsResponse.json()

      // Fetch recent applications
      const applicationsResponse = await fetch(
        'http://localhost:4000/api/admin/applications?limit=10',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const applicationsResult = await applicationsResponse.json()

      // Fetch all jobs
      const jobsResponse = await fetch(
        'http://localhost:4000/api/admin/jobs?limit=100',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const jobsResult = await jobsResponse.json()

      // Fetch all applications
      const allAppsResponse = await fetch(
        'http://localhost:4000/api/admin/applications?limit=100',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const allAppsResult = await allAppsResponse.json()

      if (statsResult.success && applicationsResult.success) {
        setStats({
          totalJobs: statsResult.data.totalJobs || 0,
          totalApplications: applicationsResult.data.total || 0,
          activeJobs: statsResult.data.activeJobs || 0,
          featuredJobs: statsResult.data.featuredJobs || 0,
          recentApplications: applicationsResult.data.applications || [],
        })
      }

      if (jobsResult.success) {
        setAllJobs(jobsResult.data.jobs || [])
      }

      if (allAppsResult.success) {
        setAllApplications(allAppsResult.data.applications || [])
      }

      if (!statsResult.success || !applicationsResult.success) {
        setError('Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ffc107'
      case 'reviewed':
        return '#17a2b8'
      case 'shortlisted':
        return '#28a745'
      case 'rejected':
        return '#dc3545'
      default:
        return '#6c757d'
    }
  }

  const getJobStatusColor = (isActive, isExpired) => {
    if (isExpired) return '#dc3545'
    if (isActive) return '#28a745'
    return '#6c757d'
  }

  const getJobStatusText = (isActive, isExpired) => {
    if (isExpired) return 'Expired'
    if (isActive) return 'Active'
    return 'Inactive'
  }

  const handleViewApplication = (applicationId) => {
    navigate(`/admin/applications/${applicationId}`)
  }

  const handleViewJob = (jobId) => {
    navigate(`/admin/jobs/${jobId}`)
  }

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading">
          <h2>Loading Dashboard...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-dashboard-container">
        <div className="error">
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard-container">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.firstName}! Here's your overview.</p>
      </header>

      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          💼 All Jobs ({allJobs.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          📝 All Applications ({allApplications.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>{stats.totalJobs}</h3>
                <p>Total Jobs</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <h3>{stats.totalApplications}</h3>
                <p>Total Applications</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>{stats.activeJobs}</h3>
                <p>Active Jobs</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <h3>{stats.featuredJobs}</h3>
                <p>Featured Jobs</p>
              </div>
            </div>
          </section>

          <section className="dashboard-content">
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Recent Applications</h2>
                <button
                  onClick={() => setActiveTab('applications')}
                  className="view-all-btn"
                >
                  View All Applications
                </button>
              </div>

              {stats.recentApplications.length === 0 ? (
                <div className="no-data">
                  <h3>No Recent Applications</h3>
                  <p>
                    Applications will appear here when candidates apply for
                    jobs.
                  </p>
                </div>
              ) : (
                <div className="applications-list">
                  {stats.recentApplications.slice(0, 5).map((application) => (
                    <div key={application._id} className="application-card">
                      <div className="application-header">
                        <div className="applicant-info">
                          <h4>{application.fullName}</h4>
                          <p>{application.email}</p>
                          <p>📱 {application.phone}</p>
                        </div>
                        <div className="application-status">
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: getStatusColor(
                                application.status
                              ),
                            }}
                          >
                            {application.status?.charAt(0).toUpperCase() +
                              application.status?.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="application-details">
                        <div className="job-info">
                          <h5>Applied for: {application.job?.title}</h5>
                          <p>🏢 {application.job?.company}</p>
                          <p>📍 {application.job?.location}</p>
                        </div>

                        <div className="application-meta">
                          <p>📅 Applied: {formatDate(application.createdAt)}</p>
                          {application.skills && (
                            <p>💼 Skills: {application.skills}</p>
                          )}
                        </div>
                      </div>

                      <div className="application-actions">
                        <button
                          onClick={() => handleViewApplication(application._id)}
                          className="view-btn"
                        >
                          View Full Application
                        </button>
                        <button
                          onClick={() => handleViewJob(application.job?._id)}
                          className="view-job-btn"
                        >
                          View Job Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dashboard-section">
              <div className="section-header">
                <h2>Quick Actions</h2>
              </div>

              <div className="quick-actions">
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="action-btn"
                >
                  📝 Manage Jobs
                </button>
                <button
                  onClick={() => setActiveTab('applications')}
                  className="action-btn"
                >
                  📋 View All Applications
                </button>
                <button
                  onClick={() => navigate('/post-job')}
                  className="action-btn"
                >
                  ➕ Create New Job
                </button>
                <button
                  onClick={() => navigate('/feed')}
                  className="action-btn"
                >
                  👁 View Public Feed
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* All Jobs Tab */}
      {activeTab === 'jobs' && (
        <section className="dashboard-content">
          <div className="dashboard-section full-width">
            <div className="section-header">
              <h2>All Posted Jobs</h2>
              <div className="section-actions">
                <button
                  onClick={() => navigate('/post-job')}
                  className="create-btn"
                >
                  ➕ Create New Job
                </button>
              </div>
            </div>

            {allJobs.length === 0 ? (
              <div className="no-data">
                <h3>No Jobs Posted Yet</h3>
                <p>Click "Create New Job" to post your first job listing.</p>
              </div>
            ) : (
              <div className="jobs-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Company</th>
                      <th>Location</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Applications</th>
                      <th>Posted Date</th>
                      <th>Deadline</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allJobs.map((job) => (
                      <tr key={job._id}>
                        <td>
                          <strong>{job.title}</strong>
                          {job.featured && (
                            <span className="featured-badge">⭐ Featured</span>
                          )}
                        </td>
                        <td>{job.company}</td>
                        <td>{job.location}</td>
                        <td>{job.type}</td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: getJobStatusColor(
                                job.active,
                                job.isExpired
                              ),
                            }}
                          >
                            {getJobStatusText(job.active, job.isExpired)}
                          </span>
                        </td>
                        <td>{job.applicationCount || 0}</td>
                        <td>{formatDate(job.createdAt)}</td>
                        <td>{formatDate(job.applicationDeadline)}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              onClick={() => handleViewJob(job._id)}
                              className="view-btn-sm"
                            >
                              View
                            </button>
                            <button
                              onClick={() =>
                                navigate(`/admin/jobs/${job._id}/edit`)
                              }
                              className="edit-btn-sm"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* All Applications Tab */}
      {activeTab === 'applications' && (
        <section className="dashboard-content">
          <div className="dashboard-section full-width">
            <div className="section-header">
              <h2>All Submitted Applications</h2>
              <p>Total: {allApplications.length} applications received</p>
            </div>

            {allApplications.length === 0 ? (
              <div className="no-data">
                <h3>No Applications Submitted Yet</h3>
                <p>
                  Applications will appear here when candidates apply for your
                  job postings.
                </p>
              </div>
            ) : (
              <div className="applications-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Applicant Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Job Applied For</th>
                      <th>Status</th>
                      <th>Applied Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allApplications.map((application) => (
                      <tr key={application._id}>
                        <td>
                          <strong>{application.fullName}</strong>
                        </td>
                        <td>{application.email}</td>
                        <td>{application.phone}</td>
                        <td>
                          <div>
                            <strong>{application.job?.title}</strong>
                            <br />
                            <small>{application.job?.company}</small>
                          </div>
                        </td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: getStatusColor(
                                application.status
                              ),
                            }}
                          >
                            {application.status?.charAt(0).toUpperCase() +
                              application.status?.slice(1)}
                          </span>
                        </td>
                        <td>{formatDate(application.createdAt)}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              onClick={() =>
                                handleViewApplication(application._id)
                              }
                              className="view-btn-sm"
                            >
                              View
                            </button>
                            <button
                              onClick={() =>
                                handleViewJob(application.job?._id)
                              }
                              className="view-job-btn-sm"
                            >
                              Job
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

export default AdminDashboard
