// Admin Posts Page - Maplorix Admin Only - Job Vacancy Management
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const AdminPosts = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard')
      return
    }
  }, [user, navigate])

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [errors, setErrors] = useState({})

  // Form state for creating/editing job vacancies
  const [formData, setFormData] = useState({
    jobTitle: '',
    experience: '',
    salary: '',
    requirements: '',
    jobDescription: '',
    postedDate: new Date().toISOString().split('T')[0],
    image: null,
    imageUrl: '',
  })

  // Fetch existing posts from adminFeedPosts sessionStorage
  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const storedPosts = JSON.parse(
        sessionStorage.getItem('adminFeedPosts') || '[]'
      )
      console.log(
        '📋 AdminPosts: Loaded posts from adminFeedPosts sessionStorage:',
        storedPosts.length
      )
      setPosts(storedPosts)
    } catch (error) {
      console.error('Error fetching posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  // Validate form fields
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job Title is required'
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
    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = 'Job Description is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0],
        imageUrl: files[0] ? URL.createObjectURL(files[0]) : ''
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Create new job vacancy
  const handleCreatePost = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const newPost = {
        _id: Date.now().toString(),
        jobTitle: formData.jobTitle,
        experience: formData.experience,
        salary: formData.salary,
        requirements: formData.requirements,
        jobDescription: formData.jobDescription,
        postedDate: formData.postedDate,
        image: formData.image,
        imageUrl: formData.imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'adminFeed',
        type: 'job_vacancy'
      }

      // Save to adminFeedPosts sessionStorage
      const updatedPosts = [newPost, ...posts]
      sessionStorage.setItem('adminFeedPosts', JSON.stringify(updatedPosts))
      setPosts(updatedPosts)

      // Reset form
      setFormData({
        jobTitle: '',
        experience: '',
        salary: '',
        requirements: '',
        jobDescription: '',
        postedDate: new Date().toISOString().split('T')[0],
        image: null,
        imageUrl: '',
      })
      setShowCreateModal(false)
      setErrors({})

      console.log('✅ AdminPosts: Job vacancy created successfully')
    } catch (error) {
      console.error('❌ Error creating job vacancy:', error)
    }
  }

  // Update existing job vacancy
  const handleUpdatePost = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const updatedPost = {
        ...editingPost,
        jobTitle: formData.jobTitle,
        experience: formData.experience,
        salary: formData.salary,
        requirements: formData.requirements,
        jobDescription: formData.jobDescription,
        postedDate: formData.postedDate,
        image: formData.image,
        imageUrl: formData.imageUrl,
        updatedAt: new Date().toISOString()
      }

      // Update in adminFeedPosts sessionStorage
      const updatedPosts = posts.map(post => 
        post._id === editingPost._id ? updatedPost : post
      )
      sessionStorage.setItem('adminFeedPosts', JSON.stringify(updatedPosts))
      setPosts(updatedPosts)

      // Reset form
      setFormData({
        jobTitle: '',
        experience: '',
        salary: '',
        requirements: '',
        jobDescription: '',
        postedDate: new Date().toISOString().split('T')[0],
        image: null,
        imageUrl: '',
      })
      setEditingPost(null)
      setShowCreateModal(false)
      setErrors({})

      console.log('✅ AdminPosts: Job vacancy updated successfully')
    } catch (error) {
      console.error('❌ Error updating job vacancy:', error)
    }
  }

  // Delete job vacancy
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this job vacancy?')) {
      return
    }

    try {
      const updatedPosts = posts.filter(post => post._id !== postId)
      sessionStorage.setItem('adminFeedPosts', JSON.stringify(updatedPosts))
      setPosts(updatedPosts)

      console.log('✅ AdminPosts: Job vacancy deleted successfully')
    } catch (error) {
      console.error('❌ Error deleting job vacancy:', error)
    }
  }

  // Open edit modal
  const handleEditPost = (post) => {
    setEditingPost(post)
    setFormData({
      jobTitle: post.jobTitle || '',
      experience: post.experience || '',
      salary: post.salary || '',
      requirements: post.requirements || '',
      jobDescription: post.jobDescription || '',
      postedDate: post.postedDate || new Date().toISOString().split('T')[0],
      image: null,
      imageUrl: post.imageUrl || '',
    })
    setShowCreateModal(true)
    setErrors({})
  }

  // Close modal
  const handleCloseModal = () => {
    setShowCreateModal(false)
    setEditingPost(null)
    setFormData({
      jobTitle: '',
      experience: '',
      salary: '',
      requirements: '',
      jobDescription: '',
      postedDate: new Date().toISOString().split('T')[0],
      image: null,
      imageUrl: '',
    })
    setErrors({})
  }
      setPosts(storedPosts)
    } catch (error) {
      console.error('Error fetching admin posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = () => {
    setEditingPost(null)
    setFormData({
      title: '',
      content: '',
      type: 'job',
      visibility: 'public',
      tags: [],
      featured: false,
      attachments: [],
      images: [],
    })
    setShowCreateModal(true)
  }

  const handleEditPost = (post) => {
    setEditingPost(post)
    setFormData({
      title: post.title || '',
      content: post.description || '',
      type: 'job',
      visibility: 'public',
      tags: post.skills ? post.skills.split(',').map((s) => s.trim()) : [],
      featured: post.featured || false,
      attachments: [],
      images: post.images || [],
    })
    setShowCreateModal(true)
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const newImages = []

    files.forEach((file) => {
      // Validate file type (images only)
      if (file.type.startsWith('image/')) {
        // Validate file size (5MB max)
        if (file.size <= 5 * 1024 * 1024) {
          const reader = new FileReader()
          reader.onload = (event) => {
            newImages.push({
              file: file,
              preview: event.target.result,
              id: Date.now() + Math.random(),
            })
            if (newImages.length === files.length) {
              setFormData((prev) => ({
                ...prev,
                images: [...prev.images, ...newImages],
              }))
            }
          }
          reader.readAsDataURL(file)
        } else {
          alert('Image size must be less than 5MB')
        }
      } else {
        alert('Only image files are allowed (JPG, PNG, GIF, WebP)')
      }
    })
  }

  const removeImage = (imageId) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }))
  }

  const handleSubmitPost = async (e) => {
    e.preventDefault()
    try {
      const postData = {
        ...formData,
        _id: editingPost ? editingPost._id : `admin-post-${Date.now()}`,
        company: user.company || 'Maplorix',
        location: 'Remote',
        jobType: 'Full-time',
        category: 'Technology',
        experienceLevel: 'Mid Level',
        workLocationType: 'Remote',
        salaryMin: '',
        salaryMax: '',
        salaryType: 'Annual',
        currency: 'AED',
        description: formData.content,
        requirements: '',
        responsibilities: '',
        benefits: '',
        skills: formData.tags.join(', '),
        applicationDeadline: '',
        applicationMethod: 'Email',
        applicationEmail: user.email,
        applicationUrl: '',
        tags: formData.tags.join(', '),
        featured: formData.featured,
        urgent: false,
        createdBy: user._id,
        createdAt: editingPost
          ? editingPost.createdAt
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'adminFeed', // Mark as admin feed post
      }

      // Store in adminFeedPosts sessionStorage - completely isolated from Dashboard
      const existingPosts = JSON.parse(
        sessionStorage.getItem('adminFeedPosts') || '[]'
      )

      if (editingPost) {
        // Update existing post
        const updatedPosts = existingPosts.map((post) =>
          post._id === editingPost._id ? postData : post
        )
        sessionStorage.setItem('adminFeedPosts', JSON.stringify(updatedPosts))
        console.log(
          '📋 AdminPosts: Updated post in adminFeedPosts sessionStorage'
        )
      } else {
        // Add new post
        existingPosts.unshift(postData)
        sessionStorage.setItem('adminFeedPosts', JSON.stringify(existingPosts))
        console.log(
          '📋 AdminPosts: Created new post in adminFeedPosts sessionStorage'
        )
      }

      setShowCreateModal(false)
      fetchPosts() // Refresh posts list
    } catch (error) {
      console.error('Error saving post:', error)
    }
  }

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        // Delete from adminFeedPosts sessionStorage - completely isolated
        const existingPosts = JSON.parse(
          sessionStorage.getItem('adminFeedPosts') || '[]'
        )
        const updatedPosts = existingPosts.filter((post) => post._id !== postId)
        sessionStorage.setItem('adminFeedPosts', JSON.stringify(updatedPosts))
        console.log(
          '📋 AdminPosts: Deleted post from adminFeedPosts sessionStorage'
        )

        fetchPosts() // Refresh posts list
      } catch (error) {
        console.error('Error deleting post:', error)
      }
    }
  }

  const handleToggleFeatured = async (post) => {
    try {
      // Toggle featured in adminFeedPosts sessionStorage - completely isolated
      const existingPosts = JSON.parse(
        sessionStorage.getItem('adminFeedPosts') || '[]'
      )
      const updatedPosts = existingPosts.map((p) =>
        p._id === post._id ? { ...p, featured: !p.featured } : p
      )
      sessionStorage.setItem('adminFeedPosts', JSON.stringify(updatedPosts))
      console.log(
        '📋 AdminPosts: Toggled featured status in adminFeedPosts sessionStorage'
      )

      fetchPosts() // Refresh posts list
    } catch (error) {
      console.error('Error toggling featured:', error)
    }
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    )
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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Posts</h1>
              <p className="text-gray-600 mt-1">
                Create and manage job posts like LinkedIn
              </p>
            </div>
            <button
              onClick={handleCreatePost}
              className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors flex items-center"
            >
              <i className="fas fa-plus mr-2"></i>
              Create Post
            </button>
          </div>
        </div>
      </div>

      {/* feed */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-briefcase text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first job post to get started
            </p>
            <button
              onClick={handleCreatePost}
              className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors"
            >
              Create First Post
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                {/* Post Header */}
                <div className="p-6 border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                        <i className="fas fa-briefcase text-white"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {post.company} •{' '}
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {post.featured && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <i className="fas fa-star mr-1"></i>
                          Featured
                        </span>
                      )}
                      <div className="relative">
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          <i className="fas fa-ellipsis-h"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-6">
                  {/* Images */}
                  {post.images && post.images.length > 0 && (
                    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {post.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.preview || image.url}
                            alt={`Post image ${index + 1}`}
                            className="w-full h-48 sm:h-56 object-cover rounded-lg border border-gray-200 group-hover:shadow-md transition-shadow"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg flex items-center justify-center">
                            <i className="fas fa-search-plus text-white opacity-0 group-hover:opacity-100 transition-opacity"></i>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {post.description}
                    </p>
                  </div>

                  {post.skills && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2">
                        {post.skills.split(',').map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent bg-opacity-20 text-accent"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {post.location && (
                    <div className="mt-4 flex items-center text-sm text-gray-600">
                      <i className="fas fa-map-marker-alt mr-2"></i>
                      {post.location}
                    </div>
                  )}

                  {post.jobType && (
                    <div className="mt-2 flex items-center text-sm text-gray-600">
                      <i className="fas fa-clock mr-2"></i>
                      {post.jobType}
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t rounded-b-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <button className="text-gray-600 hover:text-accent transition-colors">
                        <i className="far fa-heart mr-1"></i>
                        Like
                      </button>
                      <button className="text-gray-600 hover:text-accent transition-colors">
                        <i className="far fa-comment mr-1"></i>
                        Comment
                      </button>
                      <button className="text-gray-600 hover:text-accent transition-colors">
                        <i className="far fa-share mr-1"></i>
                        Share
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleFeatured(post)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          post.featured
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <i className={`fas fa-star mr-1`}></i>
                        {post.featured ? 'Featured' : 'Feature'}
                      </button>
                      <button
                        onClick={() => handleEditPost(post)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded hover:bg-blue-200 transition-colors"
                      >
                        <i className="fas fa-edit mr-1"></i>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded hover:bg-red-200 transition-colors"
                      >
                        <i className="fas fa-trash mr-1"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black opacity-50"
              onClick={() => setShowCreateModal(false)}
            ></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingPost ? 'Edit Post' : 'Create New Post'}
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitPost} className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Post Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                      placeholder="e.g., Senior React Developer Needed"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent resize-vertical"
                      placeholder="Describe the job role, requirements, and what you're looking for..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Images
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center justify-center w-full py-8 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <i className="fas fa-cloud-upload-alt text-3xl mb-2"></i>
                        <span className="text-sm font-medium">
                          Click to upload images
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          JPG, PNG, GIF, WebP (Max 5MB each)
                        </span>
                      </label>

                      {/* Image Previews */}
                      {formData.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {formData.images.map((image) => (
                            <div key={image.id} className="relative group">
                              <img
                                src={image.preview}
                                alt="Preview"
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(image.id)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <i className="fas fa-times text-xs"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags.join(', ')}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tags: e.target.value
                            .split(',')
                            .map((tag) => tag.trim())
                            .filter((tag) => tag),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                      placeholder="React, Node.js, MongoDB, JavaScript"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) =>
                        setFormData({ ...formData, featured: e.target.checked })
                      }
                      className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                    />
                    <label
                      htmlFor="featured"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Feature this post
                    </label>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                  >
                    {editingPost ? 'Update Post' : 'Create Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPosts
