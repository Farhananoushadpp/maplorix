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

// Get API URL - Use proxy to connect to backend on port 4000
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // Use proxy in development to connect to backend on port 4000
  if (import.meta.env.DEV) {
    return '/api'
  }

  // Use direct HTTP backend in production
  return 'http://localhost:4000/api'
}

// Create axios instance with default configuration
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
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

// Function to update baseURL if needed
const updateApiBaseUrl = async () => {
  const baseUrl = getApiBaseUrl()
  console.log('Using API base URL:', baseUrl)
  api.defaults.baseURL = baseUrl
  return
}
// Try to update the base URL on initialization
if (import.meta.env.DEV) {
  console.log(' API Service: Initializing port detection...')
  console.log('🔧 API Service: Initializing port detection...')
}
updateApiBaseUrl()
  .then(() => {
    if (import.meta.env.DEV) {
      console.log(
        '🔧 API Service: Initialization complete, baseURL:',
        api.defaults.baseURL
      )
    }
  })
  .catch((error) => {
    console.error('🔧 API Service: Initialization failed:', error)
  })

// Mock data for development when backend is not available
const mockData = {
  jobs: [
    {
      id: 1,
      title: 'Senior React Developer',
      company: 'Maplorix',
      location: 'Dubai, UAE',
      type: 'Full-time',
      experience: 'Senior',
      salaryMin: 15000,
      salaryMax: 25000,
      currency: 'AED',
      description: 'Looking for an experienced React developer...',
      requirements: '5+ years of React experience...',
      postedBy: 'user',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      title: 'Frontend Developer',
      company: 'Maplorix',
      location: 'Abu Dhabi, UAE',
      type: 'Full-time',
      experience: 'Mid-level',
      salaryMin: 10000,
      salaryMax: 18000,
      currency: 'AED',
      description: 'Frontend developer position...',
      requirements: '3+ years of frontend experience...',
      postedBy: 'user',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  applications: [
    {
      id: 1,
      fullName: 'Ahmed Hassan',
      email: 'ahmed.hassan@email.com',
      phone: '+971 50 123 4567',
      experience: 'Senior',
      expectedSalary: 20000,
      currency: 'AED',
      currentCompany: 'Tech Solutions',
      jobRole: 'Senior React Developer',
      jobId: 1,
      jobTitle: 'Senior React Developer',
      coverLetter: 'Experienced React developer with 5+ years...',
      resume: 'resume_ahmed_hassan.pdf',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      appliedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
    },
    {
      id: 2,
      fullName: 'Fatima Al Maktoum',
      email: 'fatima.m@email.com',
      phone: '+971 55 987 6543',
      experience: 'Mid-level',
      expectedSalary: 15000,
      currency: 'AED',
      currentCompany: 'Digital Agency',
      jobRole: 'Frontend Developer',
      jobId: 2,
      jobTitle: 'Frontend Developer',
      coverLetter: 'Passionate frontend developer...',
      resume: 'resume_fatima_almaktoum.pdf',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      appliedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
    },
    {
      id: 3,
      fullName: 'Mohammed Ali',
      email: 'mohammed.ali@email.com',
      phone: '+971 52 456 7890',
      experience: 'Senior',
      expectedSalary: 22000,
      currency: 'AED',
      currentCompany: 'Startup Hub',
      jobRole: 'Senior React Developer',
      jobId: 1,
      jobTitle: 'Senior React Developer',
      coverLetter: 'Senior developer with expertise in React...',
      resume: 'resume_mohammed_ali.pdf',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'reviewed',
    },
    {
      id: 4,
      fullName: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+971 56 234 5678',
      experience: 'Junior',
      expectedSalary: 8000,
      currency: 'AED',
      currentCompany: 'Fresh Graduate',
      jobRole: 'Junior Developer',
      jobId: 3,
      jobTitle: 'Junior Developer',
      coverLetter: 'Recent graduate looking for opportunities...',
      resume: 'resume_sarah_johnson.pdf',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
      appliedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
    },
    {
      id: 5,
      fullName: 'Khalid Omar',
      email: 'khalid.omar@email.com',
      phone: '+971 54 345 6789',
      experience: 'Senior',
      expectedSalary: 25000,
      currency: 'AED',
      currentCompany: 'Enterprise Corp',
      jobRole: 'Full Stack Developer',
      jobId: 4,
      jobTitle: 'Full Stack Developer',
      coverLetter: 'Experienced full stack developer...',
      resume: 'resume_khalid_omar.pdf',
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
      appliedDate: new Date(
        Date.now() - 12 * 24 * 60 * 60 * 1000
      ).toISOString(),
      status: 'interview',
    },
  ],
}

// Calculate stats from mock data
const calculateMockStats = () => {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const userJobs = mockData.jobs.filter((job) => job.postedBy === 'user')
  const recentUserJobs = userJobs.filter(
    (job) => new Date(job.createdAt || job.postedDate) > sevenDaysAgo
  )
  const recentApplications = mockData.applications.filter(
    (app) => new Date(app.createdAt) > sevenDaysAgo
  )

  return {
    totalJobs: userJobs.length,
    recentJobs: recentUserJobs.length,
    totalApplications: mockData.applications.length,
    recentApplications: recentApplications.length,
  }
}

// Add response interceptor to handle backend not available
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors and 404s (backend not available)
    if (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ERR_NETWORK' ||
      error.response?.status === 404
    ) {
      console.warn('â ï¸ Backend not available, using mock data')

      // Handle authentication requests with mock responses
      if (error.config?.url?.includes('/auth/login')) {
        console.log('ð Using mock login response')
        return Promise.resolve({
          data: {
            success: true,
            data: {
              token: 'mock-jwt-token-' + Date.now(),
              user: {
                _id: 'mock-user-id',
                email: error.config?.data
                  ? JSON.parse(error.config.data).email
                  : 'mock@example.com',
                fullName: 'Mock User',
                role: 'user',
              },
            },
          },
        })
      }

      if (error.config?.url?.includes('/auth/register')) {
        console.log('ð Using mock register response')
        return Promise.resolve({
          data: {
            success: true,
            data: {
              token: 'mock-jwt-token-' + Date.now(),
              user: {
                _id: 'mock-user-id',
                email: error.config?.data
                  ? JSON.parse(error.config.data).email
                  : 'mock@example.com',
                fullName: 'Mock User',
                role: 'user',
              },
            },
          },
        })
      }

      if (error.config?.url?.includes('/auth/me')) {
        console.log('ð Using mock profile response')
        return Promise.resolve({
          data: {
            success: true,
            user: {
              _id: 'mock-user-id',
              email: 'mock@example.com',
              fullName: 'Mock User',
              role: 'user',
            },
          },
        })
      }

      // Handle application submissions
      if (
        error.config?.url?.includes('/applications') &&
        error.config?.method === 'post'
      ) {
        console.log('ð Using mock application submission response')
        const appData =
          error.config?.data instanceof FormData
            ? Object.fromEntries(error.config.data.entries())
            : JSON.parse(error.config?.data || '{}')

        return Promise.resolve({
          data: {
            success: true,
            application: {
              _id: 'mock-app-' + Date.now(),
              ...appData,
              status: 'submitted',
              createdAt: new Date().toISOString(),
            },
          },
        })
      }

      // Handle other requests with existing mock data
      const mockDataWithStats = {
        ...mockData,
        stats: calculateMockStats(),
      }
      console.log('ð Mock data stats:', mockDataWithStats.stats)
      return Promise.resolve({
        data: { success: true, data: mockDataWithStats },
      })
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
          limit: 10000,
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
        limit: 10000,
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
    try {
      const response = await api.post('/contact', {
        ...contactData,
        recaptchaToken: contactData.recaptchaToken, // Ensure token is included
      })
      return response.data
    } catch (error) {
      console.error('Error submitting contact:', error)
      throw error
    }
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
