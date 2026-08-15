import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { applicationsAPI } from '../services/api'

const Applications = () => {
  const { user, isAuthenticated } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState({
    status: '',
    dateRange: '',
    search: '',
  })
  const [selectedApplication, setSelectedApplication] = useState(null)

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true)
      const params = {}

      if (filter.status) params.status = filter.status
      if (filter.search) params.search = filter.search

      const response = await applicationsAPI.getAllApplications(params)
      const apps = response.data?.applications || response.applications || response.data?.data?.applications || []
      setApplications(apps)
      setError('')
    } catch (error) {
      console.error('Error fetching applications:', error)
      setError('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications()
    }
  }, [isAuthenticated, fetchApplications])

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await applicationsAPI.updateApplicationStatus(applicationId, newStatus)
      fetchApplications() // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error)
      setError('Failed to update application status')
    }
  }

  const handleDownloadResume = async (applicationId) => {
    try {
      const response = await applicationsAPI.downloadResume(applicationId)
      const blob = new Blob([response.data], {
        type: 'application/octet-stream',
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resume-${applicationId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading resume:', error)
      setError('Failed to download resume')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'under-review':
        return 'bg-yellow-100 text-yellow-800'
      case 'shortlisted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'hired':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600">Please log in to view applications.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Job Applications
            </h1>
            <p className="text-gray-600">
              Manage and review candidate applications
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filter.status}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="under-review">Under Review</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={filter.search}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, search: e.target.value }))
                }
                placeholder="Search by name, email, or job role..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() =>
                  setFilter({ status: '', dateRange: '', search: '' })
                }
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Applications ({applications.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <i className="fas fa-spinner fa-spin text-2xl text-indigo-600"></i>
              <p className="mt-2 text-gray-600">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-6 text-center">
              <i className="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-500">No applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role / Industry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location &amp; Visa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
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
                  {applications.map((application) => (
                    <tr key={application._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {application.firstName && application.lastName
                              ? `${application.firstName} ${application.lastName}`
                              : application.fullName || 'Candidate'}
                          </div>
                          <div className="text-xs text-gray-500">
                            <i className="fas fa-envelope mr-1 text-gray-400"></i>
                            {application.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            <i className="fas fa-phone mr-1 text-gray-400"></i>
                            {application.mobile || application.phone || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            <i className="fas fa-globe mr-1"></i>
                            {application.nationality || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {application.industry || application.jobRole || 'General Application'}
                        </div>
                        {(application.attachedCv || application.resume) && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <i className="fas fa-file-pdf text-red-500"></i> CV Attached
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                        <div>
                          <span className="font-medium text-gray-800">
                            {application.currentlyLocated || 'N/A'}
                          </span>
                        </div>
                        {application.visaStatus && (
                          <div className="text-gray-500 mt-0.5">
                            Visa: {application.visaStatus}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {formatDate(application.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={application.status}
                          onChange={(e) =>
                            handleStatusUpdate(application._id, e.target.value)
                          }
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 ${getStatusColor(application.status)}`}
                        >
                          <option value="submitted">Submitted</option>
                          <option value="under-review">Under Review</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="rejected">Rejected</option>
                          <option value="hired">Hired</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                        <button
                          onClick={() => setSelectedApplication(application)}
                          className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 font-semibold mr-2 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadResume(application._id)}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 font-semibold transition-colors"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto p-6 border w-full max-w-2xl shadow-2xl rounded-2xl bg-white">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Candidate Application Profile
                </h3>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {/* 1. First Name */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-400 uppercase">First Name</span>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {selectedApplication.firstName || selectedApplication.fullName?.split(' ')[0] || 'N/A'}
                  </p>
                </div>

                {/* 2. Last Name */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Last Name</span>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {selectedApplication.lastName || selectedApplication.fullName?.split(' ').slice(1).join(' ') || 'N/A'}
                  </p>
                </div>

                {/* 3. Email Address */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Email Address</span>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedApplication.email || 'N/A'}</p>
                </div>

                {/* 4. Mobile / Phone Number */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Mobile / Phone Number</span>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {selectedApplication.mobile || selectedApplication.phone || 'N/A'}
                  </p>
                </div>

                {/* 5. Nationality */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Nationality</span>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedApplication.nationality || 'N/A'}</p>
                </div>

                {/* 6. Currently Located */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Currently Located</span>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedApplication.currentlyLocated || 'N/A'}</p>
                </div>

                {/* 7. Visa Status */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Visa Status</span>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedApplication.visaStatus || 'N/A'}</p>
                </div>

                {/* 8. Industry / Job Role */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Industry / Job Role</span>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {selectedApplication.industry || selectedApplication.jobRole || selectedApplication.jobTitle || 'N/A'}
                  </p>
                </div>
              </div>

              {/* 9. Attach CV / Resume */}
              <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <span className="block text-xs font-semibold text-gray-400 uppercase mb-2">Attach CV / Resume</span>
                {selectedApplication.attachedCv || selectedApplication.resume ? (
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-file-pdf text-red-500 text-2xl"></i>
                      <div>
                        <p className="text-xs font-bold text-gray-800">
                          {typeof selectedApplication.attachedCv === 'string'
                            ? selectedApplication.attachedCv
                            : typeof selectedApplication.resume === 'string'
                              ? selectedApplication.resume
                              : selectedApplication.attachedCv?.name || selectedApplication.resume?.originalName || 'Resume.pdf'}
                        </p>
                        <p className="text-[11px] text-emerald-600 font-medium">CV attached &amp; ready</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadResume(selectedApplication._id)}
                      className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <i className="fas fa-download"></i> Download CV
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">No resume attached</p>
                )}
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="px-5 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 text-xs font-bold transition-colors"
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

export default Applications
