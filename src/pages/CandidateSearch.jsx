// Candidate Search Page Component (Dashboard Feature)
import React, { useState, useEffect } from 'react'
import { applicationsAPI } from '../services/api'

const CandidateSearch = () => {
  const [filters, setFilters] = useState({
    jobRole: '',
    experience: '',
    keyword: '',
  })
  const [candidates, setCandidates] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive']
  const jobRoles = [
    'Software Engineer',
    'Product Manager',
    'Data Scientist',
    'UI/UX Designer',
    'Marketing Manager',
    'Sales Representative',
    'HR Manager',
    'Financial Analyst',
  ]

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setSearched(true)

    try {
      const params = {}
      if (filters.jobRole) params.jobRole = filters.jobRole
      if (filters.experience) params.experience = filters.experience
      if (filters.keyword) params.keyword = filters.keyword

      const response = await applicationsAPI.searchApplications(params)
      setCandidates(response.data?.applications || [])
    } catch (error) {
      console.error('Error searching candidates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearFilters = () => {
    setFilters({
      jobRole: '',
      experience: '',
      keyword: '',
    })
    setCandidates([])
    setSearched(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Candidate Search</h1>
          <p className="mt-2 text-gray-600">Find the right candidates for your open positions</p>
        </div>

        {/* Search Filters */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Role
                </label>
                <select
                  name="jobRole"
                  value={filters.jobRole}
                  onChange={handleFilterChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                >
                  <option value="">All Roles</option>
                  {jobRoles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                <select
                  name="experience"
                  value={filters.experience}
                  onChange={handleFilterChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                >
                  <option value="">All Levels</option>
                  {experienceLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills Keyword
                </label>
                <input
                  type="text"
                  name="keyword"
                  value={filters.keyword}
                  onChange={handleFilterChange}
                  placeholder="e.g., React, Python, Marketing"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Searching...' : 'Search Candidates'}
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear Filters
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {searched && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Search Results ({candidates.length} candidates found)
              </h2>
            </div>

            {candidates.length === 0 ? (
              <div className="bg-white p-8 rounded-xl shadow-md text-center">
                <p className="text-gray-500">No candidates found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {candidates.map((candidate) => (
                  <div
                    key={candidate._id}
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center mb-4">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold text-lg">
                          {candidate.fullName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {candidate.fullName}
                        </h3>
                        <p className="text-sm text-gray-500">{candidate.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm">
                        <span className="font-medium text-gray-700">Job Role:</span>{' '}
                        <span className="text-gray-600">{candidate.jobRole}</span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium text-gray-700">Experience:</span>{' '}
                        <span className="text-gray-600">{candidate.experience}</span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium text-gray-700">Phone:</span>{' '}
                        <span className="text-gray-600">{candidate.phone}</span>
                      </p>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Skills:</p>
                      <p className="text-sm text-gray-600">{candidate.skills}</p>
                    </div>

                    {candidate.resume && (
                      <div className="mt-4">
                        <button
                          onClick={() => window.open(candidate.resume.url, '_blank')}
                          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          View Resume →
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CandidateSearch
