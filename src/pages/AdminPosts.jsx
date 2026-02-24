// Admin Posts Page - Backend Integration with API
import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useNavigate } from 'react-router-dom'

const AdminPosts = () => {
  const { user } = useAuth()
  const {
    jobs,
    loading,
    error,
    fetchJobsForFeed,
    createJob,
    updateJob,
    deleteJob,
    clearError,
  } = useData()
  const navigate = useNavigate()

  // Separate state for admin jobs (feed jobs)
  const [adminJobs, setAdminJobs] = useState([])

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard')
      return
    }
  }, [user, navigate])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [errors, setErrors] = useState({})
  const [postsToShow, setPostsToShow] = useState(5)
  const [successMessage, setSuccessMessage] = useState('')
  const [deletingPostId, setDeletingPostId] = useState(null)

  // Helper function to parse salary string to object
  const parseSalary = (salaryString) => {
    if (!salaryString || typeof salaryString === 'object') {
      return salaryString
    }

    // Try to parse formats like "80,000 - 120,000 AED" or "50000 AED"
    const match = salaryString.match(
      /(\d+[,\d]*)\s*(?:-\s*(\d+[,\d]*))?\s*([A-Z]{3})?/i
    )
    if (match) {
      const [, min, max, currency] = match
      return {
        min: min.replace(/,/g, ''),
        max: max ? max.replace(/,/g, '') : undefined,
        currency: currency || 'AED',
      }
    }

    return { min: salaryString, currency: 'AED' }
  }

  // Form state for creating/editing job vacancies
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    experience: '',
    salary: '',
    requirements: '',
    description: '',
    postedDate: new Date().toISOString().split('T')[0],
  })

  // Fetch existing posts from backend - defined before useEffect
  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetchJobsForFeed()
      console.log('📋 AdminPosts: Fetched admin jobs from feed:', response)
      setAdminJobs(response || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }, [fetchJobsForFeed])

  // Fetch existing posts from backend
  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Remove local posts state - use jobs directly from context

  // Validate form fields
  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Job Title is required'
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }
    if (!formData.experience.trim()) {
      newErrors.experience = 'Experience level is required'
    }
    if (!formData.salary.trim()) {
      newErrors.salary = 'Salary is required'
    }
    if (!formData.requirements.trim()) {
      newErrors.requirements = 'Requirements are required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Job Description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Create new job vacancy
  const handleCreatePost = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const jobData = {
        title: formData.title,
        location: formData.location,
        experience: formData.experience,
        salary: parseSalary(formData.salary),
        requirements: formData.requirements,
        description: formData.description,
        postedDate: formData.postedDate,
        type: 'Full-time', // Default job type
        postedBy: 'admin', // Admin-posted job (shows in feed)
        status: 'active', // Show in feed - admin approved posts
      }

      await createJob(jobData)

      setSuccessMessage('Job vacancy created successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)

      // Reset form
      resetForm()
      setShowCreateModal(false)

      // Refresh admin jobs list
      fetchPosts()

      console.log('✅ AdminPosts: Job vacancy created successfully')
    } catch (error) {
      console.error('❌ Error creating job vacancy:', error)
      setSuccessMessage('Failed to create job vacancy')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  // Update existing job vacancy
  const handleUpdatePost = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const jobData = {
        title: formData.title,
        location: formData.location,
        experience: formData.experience,
        salary: parseSalary(formData.salary),
        requirements: formData.requirements,
        description: formData.description,
        postedDate: formData.postedDate,
        status: 'active', // Maintain active status for admin posts
      }

      await updateJob(editingPost._id, jobData)

      setSuccessMessage('Job vacancy updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)

      // Reset form
      resetForm()
      setEditingPost(null)
      setShowCreateModal(false)

      console.log('✅ AdminPosts: Job vacancy updated successfully')
    } catch (error) {
      console.error('❌ Error updating job vacancy:', error)
      setSuccessMessage('Failed to update job vacancy')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  // Delete job vacancy
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this job vacancy?')) {
      return
    }

    setDeletingPostId(postId)
    try {
      await deleteJob(postId)

      setSuccessMessage('Job vacancy deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)

      // Refresh admin jobs list
      fetchPosts()

      console.log('✅ AdminPosts: Job vacancy deleted successfully')
    } catch (error) {
      console.error('❌ Error deleting job vacancy:', error)
      setSuccessMessage('Failed to delete job vacancy')
      setTimeout(() => setSuccessMessage(''), 3000)
    } finally {
      setDeletingPostId(null)
    }
  }

  // Open edit modal
  const handleEditPost = (post) => {
    setEditingPost(post)
    setFormData({
      title: post.title || post.jobTitle || '',
      location: post.location || 'Remote', // Default value for existing posts
      experience: post.experience || '',
      salary: post.salary
        ? typeof post.salary === 'object'
          ? `${post.salary.currency || ''} ${post.salary.min || ''}${post.salary.max ? ` - ${post.salary.max}` : ''}`
          : post.salary
        : '',
      requirements: post.requirements || '',
      description: post.description || post.jobDescription || '',
      postedDate: post.postedDate || new Date().toISOString().split('T')[0],
    })
    setShowCreateModal(true)
    setErrors({})
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      location: '',
      experience: '',
      salary: '',
      requirements: '',
      description: '',
      postedDate: new Date().toISOString().split('T')[0],
    })
    setErrors({})
  }

  // Close modal
  const handleCloseModal = () => {
    setShowCreateModal(false)
    setEditingPost(null)
    resetForm()
  }

  if (loading?.jobs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center">
            <i className="fas fa-check-circle mr-2"></i>
            {successMessage}
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
            <button
              onClick={clearError}
              className="ml-4 text-white hover:text-gray-200"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">Admin Posts</h1>
              <span className="text-sm text-gray-500">
                Manage job vacancies
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-white text-primary rounded-lg hover:bg-gray-100 transition-all duration-300 font-semibold"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Dashboard
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all duration-300 font-semibold"
              >
                <i className="fas fa-plus mr-2"></i>
                Create Job Vacancy
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-white p-6 border-l-4 border-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Total Vacancies
                </p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {adminJobs.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Posted positions</p>
              </div>
              <div className="w-12 h-12 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center">
                <i className="fas fa-briefcase text-accent text-xl"></i>
              </div>
            </div>
          </div>

          <div className="card bg-white p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Active
                </p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {jobs.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Currently active</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-green-500 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="card bg-white p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Recent
                </p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {
                    jobs.filter((post) => {
                      const postDate = new Date(post.createdAt)
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return postDate >= weekAgo
                    }).length
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-clock text-purple-500 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Create Job Vacancy Button */}
        <div className="mb-8">
          <div className="text-center">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-8 py-4 bg-accent text-white text-lg font-semibold rounded-lg hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <i className="fas fa-plus-circle mr-3 text-xl"></i>
              Create New Job Vacancy
            </button>
            <p className="text-sm text-gray-500 mt-3">
              Post a new job vacancy to the Feed page
            </p>
          </div>
        </div>

        {/* Job Vacancies Table */}
        <div className="card bg-white shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-briefcase text-accent"></i>
                </div>
                <h3 className="text-lg font-semibold text-primary">
                  Job Vacancies
                </h3>
              </div>
              <div className="text-sm text-gray-500">
                {adminJobs.length} vacancies
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
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
                {jobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <i className="fas fa-briefcase text-4xl text-gray-300 mb-4"></i>
                        <p className="text-lg font-medium">
                          No job vacancies posted yet
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          Create your first job vacancy to get started
                        </p>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="mt-6 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all duration-300 font-semibold"
                        >
                          <i className="fas fa-plus mr-2"></i>
                          Create Job Vacancy
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  adminJobs.slice(0, postsToShow).map((post) => (
                    <tr key={post._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {post.imageUrl && (
                            <div className="flex-shrink-0 h-10 w-10 mr-3">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={post.imageUrl}
                                alt=""
                              />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {post.title || post.jobTitle}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {post._id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {post.experience}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {post.salary
                          ? typeof post.salary === 'object'
                            ? `${post.salary.currency || ''} ${post.salary.min || ''}${post.salary.max ? ` - ${post.salary.max}` : ''}`
                            : post.salary
                          : 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(post.postedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditPost(post)}
                          className="text-accent hover:text-accent-dark mr-3"
                        >
                          <i className="fas fa-edit mr-1"></i>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          disabled={deletingPostId === post._id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {deletingPostId === post._id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-trash mr-1"></i>
                              Delete
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* See More / Show Less Button */}
        {adminJobs.length > 5 && (
          <div className="text-center mt-6">
            <button
              onClick={() =>
                setPostsToShow(postsToShow === 5 ? adminJobs.length : 5)
              }
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {postsToShow === 5 ? (
                <>
                  <i className="fas fa-chevron-down mr-2"></i>
                  See More ({adminJobs.length - 5} more)
                </>
              ) : (
                <>
                  <i className="fas fa-chevron-up mr-2"></i>
                  Show Less
                </>
              )}
            </button>
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingPost ? 'Edit Job Vacancy' : 'Create Job Vacancy'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            <form
              onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
              className="p-6"
            >
              <div className="space-y-6">
                {/* Job Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g. Senior Frontend Developer"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g. New York, NY"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.location}
                    </p>
                  )}
                </div>

                {/* Experience and Salary */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="experience"
                      value={formData.experience || ''}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                        errors.experience ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select experience</option>
                      <option value="Entry Level">Entry Level</option>
                      <option value="Mid Level">Mid Level</option>
                      <option value="Senior Level">Senior Level</option>
                      <option value="Executive">Executive</option>
                    </select>
                    {errors.experience && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.experience}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="salary"
                      value={formData.salary || ''}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                        errors.salary ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g. 80,000 - 120,000 AED"
                    />
                    {errors.salary && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.salary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Posted Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posted Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="postedDate"
                    value={formData.postedDate || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                      errors.postedDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements || ''}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                      errors.requirements ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="List the key requirements for this position..."
                  />
                  {errors.requirements && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.requirements}
                    </p>
                  )}
                </div>

                {/* Job Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Provide a detailed description of the role and responsibilities..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                >
                  {editingPost ? 'Update Vacancy' : 'Create Vacancy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPosts
