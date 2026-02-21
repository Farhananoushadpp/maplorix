// All Applications Page with Advanced Filtering - Production Ready
import React, { useState, useEffect } from 'react'
import { applicationsAPI } from '../services/api'

const AllApplicationsEnhanced = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    pages: 0,
  })

  // Filter states - match Dashboard structure
  const [filters, setFilters] = useState(() => {
    // Restore filters from Dashboard if available
    const savedFilters = sessionStorage.getItem('applicationFilters')
    return savedFilters
      ? JSON.parse(savedFilters)
      : {
          role: '', // Job Role search
          experience: '', // Experience level
          salary: '', // Min salary
          sortBy: 'createdAt', // Sort field
          sortOrder: 'desc', // Sort order
        }
  })

  const experienceLevels = [
    'fresher',
    '1-3',
    '3-5',
    '5+',
    '10+',
    'Entry Level',
    'Mid Level',
    'Senior Level',
    'Executive',
  ]

  const sortOptions = [
    { value: 'createdAt', label: 'Date Applied' },
    { value: 'jobRole', label: 'Job Role' },
    { value: 'candidateName', label: 'Candidate Name' },
    { value: 'experience', label: 'Experience' },
    { value: 'expectedSalary', label: 'Expected Salary' },
  ]

  // Fetch applications with filters
  const fetchApplications = async (page = 1) => {
    setLoading(true)
    try {
      // Build query parameters using simplified filters
      const params = {
        page,
        limit: pagination.pageSize,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      }

      // Add role filter if specified
      if (filters.role) {
        params.search = filters.role
      }

      // Add experience filter if specified
      if (filters.experience) {
        params.experience = filters.experience
      }

      // Add salary filter if specified
      if (filters.salary) {
        params.minSalary = parseInt(filters.salary)
      }

      const response = await applicationsAPI.getAllApplications(params)

      setApplications(response.data?.data?.applications || [])
      setPagination(response.data?.data?.pagination || {})
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Apply filters
  const applyFilters = () => {
    fetchApplications(1) // Reset to first page when applying new filters
  }

  // Clear filters
  const clearFilters = () => {
    setFilters({
      jobRole: '',
      candidateName: '',
      minExp: '',
      maxExp: '',
      minSalary: '',
      maxSalary: '',
      applicationId: '',
      dateFrom: '',
      dateTo: '',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
    fetchApplications(1)
  }

  // Handle pagination
  const handlePageChange = (page) => {
    fetchApplications(page)
  }

  // Handle application actions
  const handleViewApplication = (applicationId) => {
    console.log('View application:', applicationId)
    // In a real app, this would navigate to application details
  }

  const handleEditApplication = (applicationId) => {
    console.log('Edit application:', applicationId)
    // In a real app, this would open edit modal or navigate to edit page
  }

  const handleDeleteApplication = async (applicationId) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await applicationsAPI.deleteApplication(applicationId)
        // Refresh the list
        fetchApplications(pagination.current)
      } catch (error) {
        console.error('Error deleting application:', error)
      }
    }
  }

  // Initial load
  useEffect(() => {
    fetchApplications()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            All Applications
          </h1>
          <p className="text-gray-600">
            Manage and filter all job applications with advanced filtering
            options.
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Advanced Filters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Job Role / Title Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Role / Title
              </label>
              <input
                type="text"
                value={filters.jobRole}
                onChange={(e) => handleFilterChange('jobRole', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Frontend Developer, UX Designer"
              />
            </div>

            {/* Candidate Name Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Candidate Name
              </label>
              <input
                type="text"
                value={filters.candidateName}
                onChange={(e) =>
                  handleFilterChange('candidateName', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., John Doe, Jane Smith"
              />
            </div>

            {/* Experience Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Range
              </label>
              <div className="flex space-x-2">
                <select
                  value={filters.minExp}
                  onChange={(e) => handleFilterChange('minExp', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Min Experience</option>
                  {experienceLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.maxExp}
                  onChange={(e) => handleFilterChange('maxExp', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Max Experience</option>
                  {experienceLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Salary Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={filters.minSalary}
                  onChange={(e) =>
                    handleFilterChange('minSalary', e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Min Salary"
                />
                <input
                  type="text"
                  value={filters.maxSalary}
                  onChange={(e) =>
                    handleFilterChange('maxSalary', e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Max Salary"
                />
              </div>
            </div>

            {/* Application ID Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application ID
              </label>
              <input
                type="text"
                value={filters.applicationId}
                onChange={(e) =>
                  handleFilterChange('applicationId', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Application ID"
              />
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    handleFilterChange('dateFrom', e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Search Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by name, email, job role, or skills"
              />
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex space-x-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.sortOrder}
                  onChange={(e) =>
                    handleFilterChange('sortOrder', e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center">
              <i className="fas fa-inbox text-gray-400 text-4xl mb-4"></i>
              <p className="text-gray-500">
                No applications found matching your criteria.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate Name
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => (
                    <tr key={application._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {application._id
                          ? application._id.substring(0, 8) + '...'
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {application.fullName ||
                          `${application.firstName || ''} ${application.lastName || ''}`}
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
                        {new Date(application.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            application.status === 'submitted'
                              ? 'bg-green-100 text-green-800'
                              : application.status === 'under-review'
                                ? 'bg-yellow-100 text-yellow-800'
                                : application.status === 'shortlisted'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {application.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleViewApplication(application._id)
                            }
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            onClick={() =>
                              handleEditApplication(application._id)
                            }
                            className="text-green-600 hover:text-green-900 text-sm font-medium"
                            title="Edit Application"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteApplication(application._id)
                            }
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                            title="Delete Application"
                          >
                            <i className="fas fa-trash"></i>
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

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={pagination.current === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>

              {/* Page Numbers */}
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === pagination.current
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={pagination.current === pagination.pages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}

        {/* Results Summary */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Results Summary
            </h3>
            <span className="text-sm text-gray-600">
              Showing {applications.length} of {pagination.total} applications
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllApplicationsEnhanced
