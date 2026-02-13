// Dashboard Page Component
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { jobsAPI, applicationsAPI } from '../services/api'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  const [activeTab, setActiveTab] = useState('overview')
  const [allJobs, setAllJobs] = useState([])
  const [allApplications, setAllApplications] = useState([])

  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    recentApplications: 0,
  })

  const [recentJobs, setRecentJobs] = useState([])
  const [recentApplications, setRecentApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [jobsSearchTerm, setJobsSearchTerm] = useState('')
  const [applicationsSearchTerm, setApplicationsSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedJobRole, setSelectedJobRole] = useState('all')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch jobs and applications
      const [jobsResponse, applicationsResponse] = await Promise.all([
        jobsAPI.getAllJobs({ limit: isAdmin ? 100 : 5 }),
        applicationsAPI.getAllApplications({ limit: isAdmin ? 100 : 5 }),
      ])

      console.log('Jobs response:', jobsResponse.data)
      console.log('Applications response:', applicationsResponse.data)

      // Calculate stats
      const totalJobs = jobsResponse.data.pagination?.total || 0
      const activeJobs =
        jobsResponse.data.jobs?.filter((job) => job.isActive).length || 0
      const totalApplications = applicationsResponse.data.pagination?.total || 0
      const recentApplications =
        applicationsResponse.data.applications?.length || 0

      setStats({
        totalJobs,
        activeJobs,
        totalApplications,
        recentApplications,
      })

      setRecentJobs(jobsResponse.data.jobs?.slice(0, 5) || [])

      // For admin, store all jobs and applications
      if (isAdmin) {
        setAllJobs(jobsResponse.data.jobs || [])
        setAllApplications(applicationsResponse.data.applications || [])
      }

      // Use real applications if available
      const realApplications =
        applicationsResponse.data.applications?.slice(0, 5) || []
      if (realApplications.length > 0) {
        setRecentApplications(realApplications)
      } else {
        // Mock data for demonstration
        const mockApplications = [
          {
            _id: 'mock1',
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            jobRole: 'Software Developer',
            status: 'submitted',
            createdAt: new Date().toISOString(),
          },
        ]
        setRecentApplications(mockApplications)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setRecentJobs([])
      setRecentApplications([])
      setAllJobs([])
      setAllApplications([])
      setStats({
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        recentApplications: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Filter functions
  const filteredJobs = recentJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(jobsSearchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(jobsSearchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(jobsSearchTerm.toLowerCase())
    const matchesDepartment =
      selectedDepartment === 'all' || job.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const filteredApplications = recentApplications.filter((application) => {
    const matchesSearch =
      application.fullName
        .toLowerCase()
        .includes(applicationsSearchTerm.toLowerCase()) ||
      application.email
        .toLowerCase()
        .includes(applicationsSearchTerm.toLowerCase()) ||
      application.jobRole
        .toLowerCase()
        .includes(applicationsSearchTerm.toLowerCase())
    const matchesJobRole =
      selectedJobRole === 'all' || application.jobRole === selectedJobRole
    return matchesSearch && matchesJobRole
  })

  // Get unique departments and job roles for filter options
  const departments = [
    ...new Set(recentJobs.map((job) => job.department).filter(Boolean)),
  ]
  const jobRoles = [
    ...new Set(recentApplications.map((app) => app.jobRole).filter(Boolean)),
  ]

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
            className="bg-white p-6 rounded-lg shadow-custom cursor-pointer hover:shadow-custom-hover transition-shadow"
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

        {/* Admin Tabs - Only visible to admin users */}
        {isAdmin && (
          <div className="flex gap-2 mb-6 border-b border-border-color pb-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'jobs'
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              💼 All Jobs ({allJobs.length})
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'applications'
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📝 All Applications ({allApplications.length})
            </button>
          </div>
        )}

        {/* Content based on active tab */}
        {(!isAdmin || activeTab === 'overview') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Jobs */}
            <div className="bg-white rounded-lg shadow-custom">
              <div className="px-6 py-4 border-b border-border-color">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-primary font-heading">
                    Recent Jobs
                  </h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-search text-text-light text-sm"></i>
                    </div>
                    <input
                      type="text"
                      placeholder="Search jobs..."
                      value={jobsSearchTerm}
                      onChange={(e) => setJobsSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-border-color rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-filter text-text-light text-sm"></i>
                    </div>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-border-color rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors appearance-none bg-white"
                    >
                      <option value="all">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <i className="fas fa-chevron-down text-text-light text-xs"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {filteredJobs.length > 0 ? (
                  <div className="space-y-4">
                    {filteredJobs.map((job) => (
                      <div
                        key={job._id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <h3 className="text-sm font-medium text-primary">
                            {job.title}
                          </h3>
                          <p className="text-sm text-text-light">
                            {job.company} • {job.location}
                          </p>
                          <div className="flex items-center mt-1 space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent bg-opacity-20 text-accent">
                              {job.type}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                job.isActive
                                  ? 'bg-secondary bg-opacity-20 text-secondary'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {job.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-text-light">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm font-medium text-accent">
                            {job.applicationCount} applications
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-light text-center py-8">
                    {jobsSearchTerm
                      ? 'No jobs found matching your search'
                      : 'No jobs posted yet'}
                  </p>
                )}
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-lg shadow-custom">
              <div className="px-6 py-4 border-b border-border-color">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-primary font-heading">
                    Recent Applications
                  </h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-search text-text-light text-sm"></i>
                    </div>
                    <input
                      type="text"
                      placeholder="Search applications..."
                      value={applicationsSearchTerm}
                      onChange={(e) =>
                        setApplicationsSearchTerm(e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-2 border border-border-color rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-filter text-text-light text-sm"></i>
                    </div>
                    <select
                      value={selectedJobRole}
                      onChange={(e) => setSelectedJobRole(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-border-color rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors appearance-none bg-white"
                    >
                      <option value="all">All Job Roles</option>
                      {jobRoles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <i className="fas fa-chevron-down text-text-light text-xs"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {filteredApplications.length > 0 ? (
                  <div className="space-y-4">
                    {filteredApplications.map((application) => (
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
                          <div className="flex items-center mt-1">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                application.status === 'submitted'
                                  ? 'bg-accent bg-opacity-20 text-accent'
                                  : application.status === 'under-review'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : application.status === 'shortlisted'
                                      ? 'bg-secondary bg-opacity-20 text-secondary'
                                      : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {application.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-text-light">
                            {new Date(
                              application.createdAt
                            ).toLocaleDateString()}
                          </p>
                          <button className="text-sm text-accent hover:text-accent hover:opacity-80 transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-light text-center py-8">
                    {applicationsSearchTerm
                      ? 'No applications found matching your search'
                      : 'No applications received yet'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* All Jobs Tab - Admin Only */}
        {isAdmin && activeTab === 'jobs' && (
          <div className="bg-white rounded-lg shadow-custom">
            <div className="px-6 py-4 border-b border-border-color">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-primary font-heading">
                  All Posted Jobs
                </h2>
                <button
                  onClick={() => navigate('/post-job')}
                  className="bg-accent text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors text-sm"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Create New Job
                </button>
              </div>
            </div>
            <div className="p-6">
              {allJobs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Job Title
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Company
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Location
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Applications
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {allJobs.map((job) => (
                        <tr key={job._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-primary">
                              {job.title}
                            </div>
                            {job.featured && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                                ⭐ Featured
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {job.company}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {job.location}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent bg-opacity-20 text-accent">
                              {job.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                job.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {job.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-accent">
                            {job.applicationCount || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-text-light text-center py-8">
                  No jobs posted yet. Click "Create New Job" to get started.
                </p>
              )}
            </div>
          </div>
        )}

        {/* All Applications Tab - Admin Only */}
        {isAdmin && activeTab === 'applications' && (
          <div className="bg-white rounded-lg shadow-custom">
            <div className="px-6 py-4 border-b border-border-color">
              <h2 className="text-lg font-medium text-primary font-heading">
                All Submitted Applications
              </h2>
              <p className="text-sm text-text-light mt-1">
                Total: {allApplications.length} applications received
              </p>
            </div>
            <div className="p-6">
              {allApplications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Applicant
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Job Applied
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Applied Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {allApplications.map((application) => (
                        <tr key={application._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-primary">
                            {application.fullName}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {application.email}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800">
                              {application.job?.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {application.job?.company}
                            </div>
                          </td>
                          <td className="px-4 py-3">
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
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(
                              application.createdAt
                            ).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-text-light text-center py-8">
                  No applications submitted yet. They will appear here when
                  candidates apply.
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard
