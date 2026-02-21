// Feed Page - LinkedIn-style feed showing only Maplorix admin job vacancies
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import DashboardJobApplyModal from '../components/DashboardJobApplyModal'

const PostsFeed = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [postsToShow, setPostsToShow] = useState(5) // Show 5 posts initially

  // Fetch admin job vacancies from adminFeedPosts sessionStorage
  useEffect(() => {
    fetchPosts()

    // Listen for real-time admin post updates
    const handleAdminPostCreated = (event) => {
      console.log(
        '📋 PostsFeed: Received adminPostCreated event:',
        event.detail.post
      )
      const newPost = event.detail.post
      setPosts((prev) => [newPost, ...prev])
    }

    window.addEventListener('adminPostCreated', handleAdminPostCreated)

    return () => {
      window.removeEventListener('adminPostCreated', handleAdminPostCreated)
    }
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const storedPosts = JSON.parse(
        sessionStorage.getItem('adminFeedPosts') || '[]'
      )

      // Show all posts from adminFeedPosts
      const allPosts = storedPosts
      setPosts(allPosts)
    } catch (error) {
      console.error('Error fetching posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  // Handle Apply Now button click
  const handleApplyNow = (post) => {
    setSelectedPost(post)
    setShowApplyModal(true)
  }

  // Handle successful application submission
  const handleApplySuccess = (application) => {
    setSuccessMessage('Application submitted successfully!')
    setShowApplyModal(false)
    setSelectedPost(null)

    // Store in feedApplications sessionStorage AND mirror to dashboard_applications
    try {
      // Get existing feed applications
      const feedApplications = JSON.parse(
        sessionStorage.getItem('feedApplications') || '[]'
      )
      const updatedFeedApplications = [application, ...feedApplications]
      sessionStorage.setItem(
        'feedApplications',
        JSON.stringify(updatedFeedApplications)
      )

      // Mirror to dashboard_applications for Dashboard integration
      const dashboardApplications = JSON.parse(
        sessionStorage.getItem('dashboardApplications') || '[]'
      )
      const updatedDashboardApplications = [
        application,
        ...dashboardApplications,
      ]
      sessionStorage.setItem(
        'dashboardApplications',
        JSON.stringify(updatedDashboardApplications)
      )

      // Dispatch event for real-time Dashboard update
      window.dispatchEvent(
        new CustomEvent('applicationPosted', {
          detail: { application },
        })
      )

      console.log(
        '✅ PostsFeed: Application submitted and mirrored to Dashboard'
      )
    } catch (error) {
      console.error('❌ Error storing application:', error)
    }

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  // Filter and sort posts
  const filteredAndSortedPosts = posts
    .filter((post) => {
      const matchesSearch =
        !searchTerm ||
        post.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.requirements?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.jobDescription?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilter =
        selectedFilter === 'all' ||
        (selectedFilter === 'recent' &&
          new Date(post.createdAt) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt) - new Date(a.createdAt)
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt)
      }
    })

  // Paginate posts
  const displayedPosts = filteredAndSortedPosts.slice(0, postsToShow)
  const hasMorePosts = filteredAndSortedPosts.length > postsToShow

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job vacancies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">Job Feed</h1>
              <span className="text-sm text-gray-500">
                Browse available opportunities
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin-posts')}
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all duration-300 font-semibold"
                >
                  <i className="fas fa-cog mr-2"></i>
                  Manage Posts
                </button>
              )}
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-white text-primary rounded-lg hover:bg-gray-100 transition-all duration-300 font-semibold"
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
        <div className="card bg-white shadow-lg mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search job titles, requirements, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="all">All Posts</option>
                  <option value="recent">Recent (Last 7 Days)</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
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
