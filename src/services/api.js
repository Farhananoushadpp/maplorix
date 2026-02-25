// API Service for Maplorix Frontend

import axios from 'axios'

// Request debouncing cache
const requestCache = new Map()
const CACHE_TTL = 1000 // 1 second cache for identical requests

// Debounce function for API requests
const debounceRequest = (key, fn) => {
  if (requestCache.has(key)) {
    return requestCache.get(key)
  }

  const promise = fn().finally(() => {
    setTimeout(() => requestCache.delete(key), CACHE_TTL)
  })

  requestCache.set(key, promise)
  return promise
}

// Try to connect to available backend ports (prioritize 4000 since backend is running there)
const API_PORTS = [4000, 4001, 4002, 4003]

// Create axios instance with default configuration
const api = axios.create({
  baseURL: 'http://localhost:4000/api', // Use port 4000 (backend is running on 4000)
  timeout: 15000, // Reduced from 10000 to 15000 to give more time but still reasonable
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add cache-busting interceptor for GET requests
api.interceptors.request.use(
  (config) => {
    // Add cache-busting query parameter to GET requests
    if (config.method === 'get') {
      const separator = config.url.includes('?') ? '&' : '?'
      config.url += `${separator}_t=${Date.now()}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Function to update baseURL if needed - DISABLED to force port 4000
const updateApiBaseUrl = async () => {
  // Force use port 4000 since backend is running there
  console.log('🔧 Forcing backend port 4000')
  api.defaults.baseURL = 'http://localhost:4000/api'
  return
}

// Try to update the base URL on initialization
console.log('🔧 API Service: Initializing port detection...')
updateApiBaseUrl()
  .then(() => {
    console.log(
      '🔧 API Service: Initialization complete, baseURL:',
      api.defaults.baseURL
    )
  })
  .catch((error) => {
    console.error('🔧 API Service: Initialization failed:', error)
  })

// Mock data for development when backend is not available
const mockData = {
  jobs: [],
  applications: [],
  stats: {
    totalJobs: 0,
    recentJobs: 0,
    totalApplications: 0,
    recentApplications: 0,
  },
}

// Add response interceptor to handle backend not available
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.warn('⚠️ Backend not available, using mock data')
      return Promise.resolve({ data: { success: true, data: mockData } })
    }
    return Promise.reject(error)
  }
)

// Request interceptor to add auth token

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },

  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors - DISABLED PORT SWITCHING
api.interceptors.response.use(
  (response) => {
    return response
  },

  async (error) => {
    const originalRequest = error.config

    // DISABLED: Don't try to switch ports on network errors
    // Force use of port 4000 only

    // Handle 429 Too Many Requests with retry
    if (error.response?.status === 429 && !originalRequest._retry) {
      originalRequest._retry = true

      console.log('⚠️ Rate limited (429), retrying in 2 seconds...')

      // Wait 2 seconds and retry once
      await new Promise((resolve) => setTimeout(resolve, 2000))

      try {
        return await api(originalRequest)
      } catch (retryError) {
        console.error('❌ Retry failed for 429 error')
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    console.error('API Error:', error)
    console.error('Response:', error.response)

    return Promise.reject(error)
  }
)

// Authentication API

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })

    return response // Return full response, not response.data
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData)

    return response.data
  },

  getProfile: async () => {
    const response = await api.get('/auth/me')

    return response.data
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/me', userData)

    return response.data
  },

  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password', passwordData)

    return response.data
  },
}

// Jobs API

export const jobsAPI = {
  getAllJobs: async (params = {}) => {
    const response = await api.get('/jobs', { params })
    return response.data
  },

  getJobById: async (id) => {
    const response = await api.get(`/jobs/${id}`)
    return response.data
  },

  getFeaturedJobs: async (params = {}) => {
    const response = await api.get('/jobs/featured', { params })
    return response.data
  },

  getRecentJobs: async (params = {}) => {
    const response = await api.get('/jobs/recent', { params })
    return response.data
  },

  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData)
    return response.data
  },

  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData)
    return response.data
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`)
    return response.data
  },

  getJobStats: async () => {
    const response = await api.get('/jobs/stats')
    return response.data
  },

  // Enhanced methods for dashboard integration
  getJobsForDashboard: async (filters = {}) => {
    const response = await api.get('/jobs', {
      params: {
        ...filters,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    })
    return response.data.data || response.data // Handle both old and new response structures
  },

  getJobsForFeed: async (filters = {}) => {
    const cacheKey = `jobs-feed-${JSON.stringify(filters)}`
    return debounceRequest(cacheKey, async () => {
      const response = await api.get('/jobs', {
        params: {
          ...filters,
          status: 'active', // Only show admin posts (active status)
          limit: 100,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        },
      })
      return response.data.data || response.data // Handle both old and new response structures
    })
  },
}

// Applications API

export const applicationsAPI = {
  getAllApplications: async (params = {}) => {
    const response = await api.get('/applications', { params })
    return response.data
  },

  getApplicationById: async (id) => {
    const response = await api.get(`/applications/${id}`)
    return response.data
  },

  createApplication: async (formData) => {
    // Increased timeout for file uploads
    const response = await api.post('/applications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // Increased to 60 seconds for file uploads
    })
    return response.data
  },

  updateApplication: async (id, applicationData) => {
    const response = await api.put(`/applications/${id}`, applicationData)
    return response.data
  },

  deleteApplication: async (id) => {
    const response = await api.delete(`/applications/${id}`)
    return response.data
  },

  downloadResume: async (id) => {
    const response = await api.get(`/applications/${id}/resume`, {
      responseType: 'blob',
    })
    return response
  },

  getApplicationStats: async () => {
    const response = await api.get('/applications/stats')
    return response.data
  },

  // Enhanced methods for dashboard integration
  getApplicationsForDashboard: async (filters = {}) => {
    const response = await api.get('/applications', {
      params: {
        ...filters,
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    })
    return response.data
  },

  createApplicationFromFeed: async (applicationData) => {
    const response = await api.post('/applications', applicationData, {
      timeout: 60000, // Increased to 60 seconds for application submission
    })
    return response.data
  },

  getApplicationsByJobId: async (jobId) => {
    const response = await api.get(`/applications/job/${jobId}`)
    return response.data
  },
}

// Contact API

export const contactAPI = {
  submitContact: async (contactData) => {
    const response = await api.post('/contact', contactData)

    return response.data
  },

  getAllContacts: async (params = {}) => {
    const response = await api.get('/contact', { params })

    return response.data
  },

  getContactById: async (id) => {
    const response = await api.get(`/contact/${id}`)

    return response.data
  },

  updateContact: async (id, contactData) => {
    const response = await api.put(`/contact/${id}`, contactData)

    return response.data
  },

  deleteContact: async (id) => {
    const response = await api.delete(`/contact/${id}`)

    return response.data
  },
}

// Health check API

export const healthAPI = {
  checkHealth: async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000'}/health`
    )

    return response.data
  },
}

export default api
