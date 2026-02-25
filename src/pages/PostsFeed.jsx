// Feed Page - Backend Integration with API
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useNavigate } from 'react-router-dom'
import DashboardJobApplyModal from '../components/DashboardJobApplyModal'
import { jobsAPI } from '../services/api'

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
  // Filter jobs to only show admin posts (client-side backup filter)
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      return (
        job.postedBy === 'admin' &&
        (job.status === 'active' || job.isActive === true)
      )
    })
  }, [jobs])

  console.log('📋 PostsFeed: Filtered jobs (admin only):', filteredJobs.length)
  console.log('📋 PostsFeed: Original jobs:', jobs.length)
  console.log('📋 PostsFeed: Filtered out:', jobs.length - filteredJobs.length)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [postsToShow, setPostsToShow] = useState(5)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Create sample admin post for testing
  const createSampleAdminPost = async () => {
    try {
      const sampleAdminJob = {
        title: 'Senior React Developer - Admin Post',
        company: 'Maplorix Tech',
        location: 'Dubai, UAE',
        type: 'Full-time',
        category: 'Technology',
        experience: 'Senior Level',
        description:
          'We are looking for a Senior React Developer to join our team. This is an admin post for testing purposes.',
        requirements:
          '5+ years of React experience, TypeScript knowledge, and strong problem-solving skills.',
        salary: {
          min: 15000,
          max: 25000,
          currency: 'AED',
        },
        postedBy: 'admin', // Admin-posted job
        status: 'active', // Show in feed
        featured: true,
      }

      console.log('📝 Creating sample admin post:', sampleAdminJob)

      // Create the job directly via API
      await jobsAPI.createJob(sampleAdminJob)

      // Refresh the jobs list
      await fetchJobsForFeed()

      setSuccessMessage('Sample admin post created successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error creating sample admin post:', error)
      alert('Failed to create sample admin post. Backend may be down.')
    }
  }

  // Fetch jobs from backend - only run once on mount
  useEffect(() => {
    const loadJobs = async () => {
      try {
        // Fetch directly from API to ensure we get latest data
        const response = await jobsAPI.getJobsForFeed()
        console.log('📋 PostsFeed: Loaded jobs from backend')

        // Update the DataContext to sync with latest data
        await fetchJobsForFeed()

        // Debug: Check what jobs we actually have
        console.log('📋 PostsFeed: Jobs data:', jobs)
        console.log('📋 PostsFeed: Job count:', jobs.length)

        // Log each job to see their status and postedBy
        jobs.forEach((job, index) => {
          console.log(`📋 Job ${index + 1}:`, {
            title: job.title,
            status: job.status,
            postedBy: job.postedBy,
            isActive: job.isActive,
            isAdminPost:
              job.postedBy === 'admin' &&
              (job.status === 'active' || job.isActive === true),
            // Show all fields to debug
            allFields: job,
          })
        })

        // Show sample job structure for debugging
        if (jobs.length > 0) {
          console.log('📋 Sample job structure:', jobs[0])
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
      }
    }
    loadJobs()
  }, []) // Run only on mount

  // Refresh feed when jobs data changes (to catch admin posts created elsewhere)
  useEffect(() => {
    if (jobs.length > 0) {
      console.log('📋 PostsFeed: Jobs updated, checking for admin posts...')

      // Count admin posts
      const adminPosts = jobs.filter(
        (job) =>
          job.postedBy === 'admin' &&
          (job.status === 'active' || job.isActive === true)
      )
      console.log(
        `📋 PostsFeed: Found ${adminPosts.length} admin posts out of ${jobs.length} total jobs`
      )

      if (adminPosts.length > 0) {
        console.log(
          '📋 PostsFeed: Admin posts found:',
          adminPosts.map((job) => job.title)
        )
      }
    }
  }, [jobs])

  // Auto-refresh every 10 seconds to catch admin posts created elsewhere
  useEffect(() => {
    const interval = setInterval(async () => {
      console.log('📋 PostsFeed: Auto-refreshing feed...')

      try {
        // Fetch directly from API to get latest data
        await jobsAPI.getJobsForFeed()

        // Update DataContext
        await fetchJobsForFeed()

        setLastUpdated(new Date())
        console.log('📋 PostsFeed: Auto-refresh completed')
      } catch (error) {
        console.error('📋 PostsFeed: Auto-refresh failed:', error)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [fetchJobsForFeed])

  // Manual refresh function
  const handleRefresh = async () => {
    console.log('📋 PostsFeed: Manual refresh triggered...')

    try {
      // Fetch directly from API to get latest data
      await jobsAPI.getJobsForFeed()

      // Update DataContext
      await fetchJobsForFeed()

      setLastUpdated(new Date())
      console.log('📋 PostsFeed: Manual refresh completed')
    } catch (error) {
      console.error('📋 PostsFeed: Manual refresh failed:', error)
    }
  }

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

  // Filter and sort posts - use filteredJobs (admin only) and apply additional filters
  const filteredAndSortedPosts = useMemo(() => {
    let posts = Array.isArray(filteredJobs) ? filteredJobs : []

    // Apply search filter
    if (searchTerm) {
      posts = posts.filter(
        (post) =>
          post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.requirements?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.company?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply date filter
    if (selectedFilter === 'recent') {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      posts = posts.filter((post) => {
        const postDate = new Date(post.createdAt || post.postedDate)
        return postDate >= sevenDaysAgo
      })
    }

    // Apply sorting
    posts.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.postedDate || 0)
      const dateB = new Date(b.createdAt || b.postedDate || 0)

      if (sortBy === 'recent') {
        return dateB - dateA // Most recent first
      } else {
        return dateA - dateB // Oldest first
      }
    })

    return posts
  }, [filteredJobs, searchTerm, selectedFilter, sortBy])

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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 pt-20">
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
                {Array.isArray(filteredJobs) && filteredJobs.length === 0
                  ? 'No admin job vacancies available'
                  : searchTerm || selectedFilter !== 'all'
                    ? 'No jobs match your search criteria'
                    : 'No jobs match your filters'}
              </h3>
              <p className="text-text-light mb-4">
                {Array.isArray(filteredJobs) && filteredJobs.length === 0
                  ? 'Admin posts will appear here once created'
                  : searchTerm || selectedFilter !== 'all'
                    ? 'Try adjusting your search terms or filters'
                    : 'Try adjusting your search terms or filters'}
              </p>
              {(searchTerm || selectedFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedFilter('all')
                  }}
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-all duration-300 font-semibold"
                >
                  <i className="fas fa-times mr-2"></i>
                  Clear Filters
                </button>
              )}
              {Array.isArray(jobs) &&
                jobs.length > 0 &&
                filteredJobs.length === 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-2">
                      <i className="fas fa-info-circle mr-2"></i>
                      There are {jobs.length} total jobs, but none are admin
                      posts. Only admin posts are shown in the feed.
                    </p>
                    {user?.role === 'admin' && (
                      <p className="text-sm text-yellow-700">
                        <i className="fas fa-lightbulb mr-2"></i>
                        Create admin posts through the AdminPosts page to see
                        them here.
                      </p>
                    )}
                  </div>
                )}
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
                          <i className="fas fa-map-marker-alt mr-1 text-secondary"></i>
                          {post.location}
                        </span>
                        <span className="flex items-center">
                          <i className="fas fa-building mr-1 text-secondary"></i>
                          {post.company}
                        </span>
                        {post.salary && (
                          <span className="flex items-center">
                            <i className="fas fa-dollar-sign mr-1 text-secondary"></i>
                            {post.salary.min && post.salary.max
                              ? `${post.salary.min} - ${post.salary.max} ${post.salary.currency || 'USD'}`
                              : typeof post.salary === 'object'
                                ? post.salary.min ||
                                  post.salary.max ||
                                  'Salary not specified'
                                : post.salary}
                          </span>
                        )}
                      </div>
                    </div>
                    {post.featured && (
                      <span className="px-3 py-1 bg-accent text-white text-xs font-semibold rounded-full">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-text-dark line-clamp-3">
                      {post.description}
                    </p>
                  </div>

                  {/* Requirements */}
                  {post.requirements && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-primary mb-2">
                        Requirements:
                      </h4>
                      <p className="text-text-dark text-sm">
                        {post.requirements}
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border-color">
                    <div className="text-sm text-text-light">
                      Posted{' '}
                      {new Date(
                        post.createdAt || post.postedDate
                      ).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => handleApplyNow(post)}
                      className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-all duration-300 font-semibold"
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
