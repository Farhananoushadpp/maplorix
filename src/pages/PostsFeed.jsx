// Feed Page - Backend Integration with API
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
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
  const [jobsData, setJobsData] = useState([])
  
  // Filter jobs to show only admin-posted jobs
  const filteredJobs = useMemo(() => {
    return jobsData.filter((job) => {
      // Show only admin-posted jobs
      return job.postedBy === 'admin';
    });
  }, [jobsData])

  console.log('📋 PostsFeed: Filtered admin jobs:', filteredJobs.length)
  console.log('📋 PostsFeed: Original jobs:', jobsData.length)
  console.log('📋 PostsFeed: Filtered out (non-admin):', jobsData.length - filteredJobs.length)
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
        // Use fetchJobsForFeed to get jobs (same as Home.jsx)
        const fetchedJobs = await fetchJobsForFeed()
        setJobsData(fetchedJobs)
        
        console.log('📋 PostsFeed: Loaded jobs from backend')
        console.log('📋 PostsFeed: Jobs data:', fetchedJobs)
        console.log('📋 PostsFeed: Job count:', fetchedJobs.length)

        // Log each job to see their status and postedBy
        fetchedJobs.forEach((job, index) => {
          console.log(`📋 Job ${index + 1}:`, {
            title: job.title,
            status: job.status,
            postedBy: job.postedBy,
            isActive: job.isActive,
            isAdminPost: job.postedBy === 'admin', // Simple and correct admin detection
            // Show all fields to debug
            allFields: job,
          })
        })

        // Show sample job structure for debugging
        if (fetchedJobs.length > 0) {
          console.log('📋 Sample job structure:', fetchedJobs[0])
        }
      } catch (error) {
        console.error('📋 PostsFeed: Error loading jobs:', error)
      }
    }

    loadJobs()
  }, [fetchJobsForFeed]) // Run only on mount

  // Refresh feed when jobs data changes (to catch admin posts created elsewhere)
  useEffect(() => {
    if (jobs.length > 0) {
      console.log('📋 PostsFeed: Jobs updated, checking for admin posts...')

      // Count admin posts - Simple and correct admin detection
      const adminPosts = jobs.filter((job) => job.postedBy === 'admin')
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
        // Use fetchJobsForFeed to get latest data and update local state
        const fetchedJobs = await fetchJobsForFeed()
        setJobsData(fetchedJobs)

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
      // Use fetchJobsForFeed to get latest data and update local state
      const fetchedJobs = await fetchJobsForFeed()
      setJobsData(fetchedJobs)

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
    <>
      <SEO 
        title="Job Feed - Latest Job Opportunities | Maplorix"
        description="Browse the latest job opportunities from top employers. Find your dream job with Maplorix - admin-posted vacancies, career opportunities, and professional positions."
        keywords="job feed, job opportunities, job vacancies, career opportunities, admin jobs, job search, employment, job postings"
        canonicalUrl="https://www.maplorix.com/feed"
        ogUrl="https://www.maplorix.com/feed"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Job Feed - Latest Opportunities",
          "description": "Browse the latest job opportunities from top employers",
          "url": "https://www.maplorix.com/feed",
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": filteredJobs.length,
            "itemListElement": filteredJobs.map((job, index) => ({
              "@type": "JobPosting",
              "position": index + 1,
              "title": job.title,
              "description": job.description,
              "datePosted": job.createdAt || job.postedDate,
              "hiringOrganization": {
                "@type": "Organization",
                "name": job.company
              },
              "jobLocation": {
                "@type": "Place",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": job.location
                }
              }
            }))
          }
        }}
      />
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

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Search and Filters */}
        <div className="card bg-white shadow-custom mb-8">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
              <div className="flex-1 w-full lg:w-auto">
                <input
                  type="text"
                  placeholder="Search job titles, requirements, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-border-color rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-base"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-3 border border-border-color rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-base min-w-[140px]"
                >
                  <option value="all">All Posts</option>
                  <option value="recent">Recent (Last 7 Days)</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-border-color rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-base min-w-[140px]"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayedPosts.map((post) => (
              <article
                key={post._id}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-3">
                      <h2 className="text-xl font-bold text-primary mb-2 leading-tight group-hover:text-secondary transition-colors duration-300">
                        {post.title || post.jobTitle}
                      </h2>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <i className="fas fa-briefcase mr-2 text-secondary flex-shrink-0 w-4"></i>
                          <span className="font-medium">{post.experience || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <i className="fas fa-map-marker-alt mr-2 text-secondary flex-shrink-0 w-4"></i>
                          <span className="font-medium">{post.location || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <i className="fas fa-building mr-2 text-secondary flex-shrink-0 w-4"></i>
                          <span className="font-medium">{post.company || 'Not specified'}</span>
                        </div>
                        {post.salary && (
                          <div className="flex items-center text-sm text-green-700">
                            <i className="fas fa-dollar-sign mr-2 text-green-600 flex-shrink-0 w-4"></i>
                            <span className="font-medium">
                              {post.salary.min && post.salary.max
                                ? `${post.salary.currency || 'USD'} ${post.salary.min} - ${post.salary.max}`
                                : typeof post.salary === 'object'
                                  ? post.salary.min ||
                                    post.salary.max ||
                                    'Competitive'
                                  : post.salary}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {post.featured && (
                      <span className="px-3 py-1 bg-gradient-to-r from-accent to-secondary text-white text-xs font-bold rounded-full shadow-lg flex-shrink-0">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                      {post.description || 'No description provided'}
                    </p>
                  </div>

                  {/* Requirements */}
                  {post.requirements && (
                    <div className="mb-4">
                      <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
                        {post.requirements}
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500 order-2 sm:order-1">
                      <i className="fas fa-calendar-alt mr-1 text-secondary"></i>
                      {new Date(post.createdAt || post.postedDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <button
                      onClick={() => handleApplyNow(post)}
                      className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:from-secondary hover:to-primary transition-all duration-300 font-bold text-sm whitespace-nowrap order-1 sm:order-2 w-full sm:w-auto shadow-md hover:shadow-lg flex items-center justify-center"
                    >
                      <i className="fas fa-rocket mr-2"></i>
                      Apply Now
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {/* See More / Show Less Button */}
            {filteredAndSortedPosts.length > 5 && (
              <div className="lg:col-span-2 text-center mt-8">
                <button
                  onClick={() =>
                    setPostsToShow(
                      postsToShow === 5 ? filteredAndSortedPosts.length : 5
                    )
                  }
                  className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:from-secondary hover:to-primary transition-all duration-300 font-bold text-base shadow-md hover:shadow-lg flex items-center justify-center mx-auto group"
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
    </>
  )
}

export default PostsFeed
