// feed Page - LinkedIn-style feed showing Maplorix admin posts
import React, { useState, useEffect } from 'react'
import { jobsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const PostsFeed = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  // Fetch posts
  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await jobsAPI.getAllJobs({ limit: 50 })
      // Filter only Maplorix posts (admin posts)
      const maplorixPosts = (response.data.jobs || []).filter(
        (post) =>
          post.company === 'Maplorix' ||
          post.company === 'maplorix' ||
          (user && user.role === 'admin' && post.createdBy === user._id)
      )
      setPosts(maplorixPosts)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort posts
  const filteredAndSortedPosts = posts
    .filter((post) => {
      const matchesSearch =
        searchTerm === '' ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.skills &&
          post.skills.toLowerCase().includes(searchTerm.toLowerCase()))

      if (selectedFilter === 'featured') {
        return matchesSearch && post.featured
      } else if (selectedFilter === 'recent') {
        return (
          matchesSearch &&
          new Date(post.createdAt) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        )
      }
      return matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt) - new Date(a.createdAt)
      } else if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title)
      } else if (sortBy === 'company') {
        return a.company.localeCompare(b.company)
      }
      return 0
    })

  const handleLike = (postId) => {
    // Implement like functionality
    console.log('Like post:', postId)
  }

  const handleComment = (postId) => {
    // Navigate to post details or open comment modal
    console.log('Comment on post:', postId)
  }

  const handleShare = (postId) => {
    // Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: 'Check out this job opportunity',
        url: `${window.location.origin}/posts/${postId}`,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/posts/${postId}`)
    }
  }

  const handleEdit = (post) => {
    // Navigate to admin posts page with edit mode
    const editUrl = `/admin/posts?edit=${post._id}`
    window.location.href = editUrl
  }

  const handleDelete = async (postId) => {
    if (
      window.confirm(
        'Are you sure you want to delete this post? This action cannot be undone.'
      )
    ) {
      try {
        await jobsAPI.deleteJob(postId)
        fetchPosts() // Refresh posts list
      } catch (error) {
        console.error('Error deleting post:', error)
        alert('Failed to delete post. Please try again.')
      }
    }
  }

  const handleApply = (post) => {
    // Navigate to apply page with pre-filled job info
    const applyUrl = `/apply?jobId=${post._id}&jobTitle=${encodeURIComponent(post.title)}&company=${encodeURIComponent(post.company)}`
    window.open(applyUrl, '_blank')
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffTime / (1000 * 60))

    if (diffDays > 0) {
      return `${diffDays}d ago`
    } else if (diffHours > 0) {
      return `${diffHours}h ago`
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`
    } else {
      return 'Just now'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-accent mb-4"></i>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-secondary rounded-lg flex items-center justify-center">
                <i className="fas fa-briefcase text-white"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Maplorix Posts
                </h1>
                <p className="text-gray-600 text-sm">
                  Official job opportunities from Maplorix
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-gray-400 text-sm"></i>
                </div>
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent w-64"
                />
              </div>

              {/* Filter */}
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
              >
                <option value="all">All Posts</option>
                <option value="featured">Featured Only</option>
                <option value="recent">Recent Only</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
              >
                <option value="recent">Most Recent</option>
                <option value="alphabetical">Alphabetical</option>
                <option value="company">By Company</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* feed */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredAndSortedPosts.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-briefcase text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No posts found
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'No posts available at the moment'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAndSortedPosts.map((post) => (
              <article
                key={post._id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200"
              >
                {/* Post Header */}
                <div className="p-6 border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-briefcase text-white text-lg"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {post.title}
                          </h3>
                          {post.featured && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex-shrink-0">
                              <i className="fas fa-star mr-1"></i>
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 mt-1">
                          <p className="text-sm font-medium text-accent">
                            {post.company}
                          </p>
                          <span className="text-gray-300">•</span>
                          <p className="text-sm text-gray-600">
                            {formatTimeAgo(post.createdAt)}
                          </p>
                          {post.location && (
                            <>
                              <span className="text-gray-300">•</span>
                              <p className="text-sm text-gray-600">
                                <i className="fas fa-map-marker-alt mr-1"></i>
                                {post.location}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="text-gray-400 hover:text-gray-600 p-1">
                        <i className="fas fa-ellipsis-h"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-6">
                  <div className="prose max-w-none mb-4">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {post.description}
                    </p>
                  </div>

                  {/* Skills/Tags */}
                  {post.skills && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {post.skills.split(',').map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent bg-opacity-10 text-accent border border-accent border-opacity-20"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Job Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {post.jobType && (
                      <div className="flex items-center text-sm text-gray-600">
                        <i className="fas fa-clock mr-2 text-accent"></i>
                        <span className="font-medium">Type:</span>
                        <span className="ml-1">{post.jobType}</span>
                      </div>
                    )}
                    {post.experienceLevel && (
                      <div className="flex items-center text-sm text-gray-600">
                        <i className="fas fa-chart-line mr-2 text-accent"></i>
                        <span className="font-medium">Level:</span>
                        <span className="ml-1">{post.experienceLevel}</span>
                      </div>
                    )}
                    {post.workLocationType && (
                      <div className="flex items-center text-sm text-gray-600">
                        <i className="fas fa-laptop-house mr-2 text-accent"></i>
                        <span className="font-medium">Work:</span>
                        <span className="ml-1">{post.workLocationType}</span>
                      </div>
                    )}
                    {post.category && (
                      <div className="flex items-center text-sm text-gray-600">
                        <i className="fas fa-folder mr-2 text-accent"></i>
                        <span className="font-medium">Category:</span>
                        <span className="ml-1">{post.category}</span>
                      </div>
                    )}
                  </div>

                  {/* Salary Range */}
                  {post.salaryMin && (
                    <div className="mb-6 p-4 bg-accent bg-opacity-5 rounded-lg border border-accent border-opacity-20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <i className="fas fa-money-bill-wave mr-2 text-accent"></i>
                          <span className="font-medium text-gray-900">
                            Salary Range:
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-accent">
                            {post.currency} {post.salaryMin}
                            {post.salaryMax && ` - ${post.salaryMax}`}
                          </span>
                          {post.salaryType && (
                            <span className="text-sm text-gray-600 ml-1">
                              /{post.salaryType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Post Footer - Engagement */}
                <div className="px-6 py-4 bg-gray-50 border-t rounded-b-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => handleLike(post._id)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-accent transition-colors group"
                      >
                        <i className="far fa-heart group-hover:fas transition-colors"></i>
                        <span className="text-sm font-medium">Like</span>
                      </button>
                      <button
                        onClick={() => handleComment(post._id)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-accent transition-colors group"
                      >
                        <i className="far fa-comment group-hover:fas transition-colors"></i>
                        <span className="text-sm font-medium">Comment</span>
                      </button>
                      <button
                        onClick={() => handleShare(post._id)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-accent transition-colors group"
                      >
                        <i className="far fa-share group-hover:fas transition-colors"></i>
                        <span className="text-sm font-medium">Share</span>
                      </button>

                      {/* Admin Actions - Edit and Delete */}
                      {user && user.role === 'admin' && (
                        <>
                          <div className="border-l border-gray-300 h-6 mx-2"></div>
                          <button
                            onClick={() => handleEdit(post)}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors group"
                          >
                            <i className="fas fa-edit group-hover:scale-110 transition-transform"></i>
                            <span className="text-sm font-medium">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(post._id)}
                            className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors group"
                          >
                            <i className="fas fa-trash group-hover:scale-110 transition-transform"></i>
                            <span className="text-sm font-medium">Delete</span>
                          </button>
                        </>
                      )}
                    </div>

                    {/* Apply Button */}
                    <button
                      onClick={() => handleApply(post)}
                      className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent/90 transition-colors flex items-center space-x-2 font-medium"
                    >
                      <i className="fas fa-paper-plane"></i>
                      <span>Apply Now</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Load More */}
      {filteredAndSortedPosts.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="text-center">
            <button className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              Load More Posts
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PostsFeed
