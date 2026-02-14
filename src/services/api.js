// API Service for Maplorix Frontend

import axios from 'axios'

// Create axios instance with base configuration

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',

  timeout: 10000,

  headers: {
    'Content-Type': 'application/json',
  },
})

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

// Response interceptor to handle common errors

api.interceptors.response.use(
  (response) => {
    return response
  },

  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid

      localStorage.removeItem('authToken')

      localStorage.removeItem('user')

      window.location.href = '/login'
    }

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
    const response = await api.post('/applications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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
