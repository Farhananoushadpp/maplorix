// Feed Page - Backend Integration with API
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useNavigate } from 'react-router-dom'
import DashboardJobApplyModal from '../components/DashboardJobApplyModal'

const PostsFeed = () => {
  const { user } = useAuth()
  const {
    jobs,
    loading,
    error,
    fetchJobsForFeed,
    createApplication,
    clearError,
  } = useData()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [postsToShow, setPostsToShow] = useState(5)

  // Fetch jobs from backend - only run once on mount
  useEffect(() => {
    const loadJobs = async () => {
      try {
        await fetchJobsForFeed()
        console.log('📋 PostsFeed: Loaded jobs from backend')
      } catch (error) {
        console.error('Error fetching posts:', error)
      }
    }
    loadJobs()
  }, [fetchJobsForFeed]) // Add dependency now that it's memoized

  // Handle Apply Now button click
  const handleApplyNow = (post) => {
    setSelectedPost(post)
    setShowApplyModal(true)
  }

  // Handle successful application submission
  const handleApplySuccess = async (applicationData) => {
    try {
      await createApplication(applicationData)
      setSuccessMessage('Application submitted successfully!')
      setShowApplyModal(false)
      setSelectedPost(null)

      console.log('✅ PostsFeed: Application submitted to backend')
    } catch (error) {
      console.error('❌ Error submitting application:', error)
      setSuccessMessage('Failed to submit application')
    }

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  // Filter and sort posts - TEMPORARILY SIMPLIFIED TO STOP INFINITE LOOP
  const filteredAndSortedPosts = Array.isArray(jobs) ? jobs : []

  // Paginate posts
  const displayedPosts = filteredAndSortedPosts.slice(0, postsToShow)
  const hasMorePosts = filteredAndSortedPosts.length > postsToShow

  if (loading?.jobs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
          <p className="mt-4 text-text-dark">Loading job vacancies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-secondary text-white px-6 py-3 rounded-lg shadow-custom animate-fade-in">
          <div className="flex items-center">
            <i className="fas fa-check-circle mr-2"></i>
            {successMessage}
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-custom animate-fade-in">
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
      <header className="bg-white shadow-sm border-b border-border-color">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">Job Feed</h1>
              <span className="text-sm text-text-light">
                Browse available opportunities
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin-posts')}
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all duration-300 font-semibold shadow-custom hover:shadow-custom-hover"
                >
                  <i className="fas fa-cog mr-2"></i>
                  Manage Posts
                </button>
              )}
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-white text-primary rounded-lg hover:bg-secondary/10 transition-all duration-300 font-semibold border border-border-color"
              >
                <i className="fas fa-tachometer-alt mr-2"></i>
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="card bg-white shadow-custom mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search job titles, requirements, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-border-color rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-2 border border-border-color rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                >
                  <option value="all">All Posts</option>
                  <option value="recent">Recent (Last 7 Days)</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-border-color rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Job Vacancies */}
        {displayedPosts.length === 0 ? (
          <div className="card bg-white shadow-custom">
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-briefcase text-secondary text-3xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                {Array.isArray(jobs) && jobs.length === 0
                  ? 'No job vacancies available'
                  : 'No jobs match your search'}
              </h3>
              <p className="text-text-light">
                {Array.isArray(jobs) && jobs.length === 0
                  ? 'Check back later for new opportunities'
                  : 'Try adjusting your search terms or filters'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {displayedPosts.map((post) => (
              <article
                key={post._id}
                className="card bg-white shadow-custom hover:shadow-custom-hover transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-primary mb-2">
                        {post.title || post.jobTitle}
                      </h2>
                      <div className="flex flex-wrap gap-2 text-sm text-text-light">
                        <span className="flex items-center">
                          <i className="fas fa-briefcase mr-1 text-secondary"></i>
                          {post.experience}
                        </span>
                        <span className="flex items-center">
                          <i className="fas fa-money-bill mr-1 text-accent"></i>
                          {post.salary 
                            ? typeof post.salary === 'object' 
                              ? `${post.salary.currency || ''} ${post.salary.min || ''}${post.salary.max ? ` - ${post.salary.max}` : ''}`
                              : post.salary
                            : 'Not specified'
                          }
                        </span>
                        <span className="flex items-center">
                          <i className="fas fa-calendar mr-1 text-secondary"></i>
                          {post.postedDate
                            ? new Date(post.postedDate).toLocaleDateString()
                            : post.createdAt
                              ? new Date(post.createdAt).toLocaleDateString()
                              : 'Date not specified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-primary mb-2">
                      Requirements
                    </h3>
                    <div className="text-text-light whitespace-pre-wrap">
                      {post.requirements}
                    </div>
                  </div>

                  {/* Job Description */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-primary mb-2">
                      Job Description
                    </h3>
                    <div className="text-text-light whitespace-pre-wrap">
                      {post.description || post.jobDescription}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-text-light">
                      Posted{' '}
                      {post.postedDate
                        ? new Date(post.postedDate).toLocaleDateString()
                        : post.createdAt
                          ? new Date(post.createdAt).toLocaleDateString()
                          : 'Date not specified'}
                    </div>
                    <button
                      onClick={() => handleApplyNow(post)}
                      className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-all duration-300 flex items-center space-x-2 font-medium shadow-custom hover:shadow-custom-hover transform hover:-translate-y-0.5"
                    >
                      <i className="fas fa-paper-plane"></i>
                      <span>Apply Now</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {/* See More / Show Less Button */}
            {filteredAndSortedPosts.length > 5 && (
              <div className="text-center mt-8">
                <button
                  onClick={() =>
                    setPostsToShow(
                      postsToShow === 5 ? filteredAndSortedPosts.length : 5
                    )
                  }
                  className="px-6 py-3 bg-white text-primary border border-border-color rounded-lg hover:bg-secondary/10 transition-all duration-300 font-medium shadow-custom hover:shadow-custom-hover"
                >
                  {postsToShow === 5 ? (
                    <>
                      <i className="fas fa-chevron-down mr-2"></i>
                      See More ({filteredAndSortedPosts.length - 5} more)
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
          </div>
        )}
      </main>

      {/* Apply Modal */}
      <DashboardJobApplyModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onSuccess={handleApplySuccess}
        prefillData={
          selectedPost
            ? {
                jobRole: selectedPost.jobTitle,
                coverLetter: `I'm interested in the ${selectedPost.jobTitle} position.`,
              }
            : {}
        }
      />

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {successMessage}
        </div>
      )}
    </div>
  )
}

export default PostsFeed
