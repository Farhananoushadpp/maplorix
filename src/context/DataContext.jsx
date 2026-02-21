// Data Context for managing jobs and applications state
import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { jobsAPI, applicationsAPI } from '../services/api'

// Data context
const DataContext = createContext()

// Initial state
const initialState = {
  jobs: [],
  applications: [],
  loading: {
    jobs: false,
    applications: false,
    createJob: false,
    createApplication: false,
    updateJob: false,
    deleteJob: false,
    updateApplication: false,
    deleteApplication: false,
  },
  error: null,
  stats: {
    totalJobs: 0,
    recentJobs: 0,
    totalApplications: 0,
    recentApplications: 0,
  },
  lastUpdated: {
    jobs: null,
    applications: null,
  },
}

// Action types
const DATA_ACTIONS = {
  // Jobs
  FETCH_JOBS_START: 'FETCH_JOBS_START',
  FETCH_JOBS_SUCCESS: 'FETCH_JOBS_SUCCESS',
  FETCH_JOBS_FAILURE: 'FETCH_JOBS_FAILURE',
  CREATE_JOB_START: 'CREATE_JOB_START',
  CREATE_JOB_SUCCESS: 'CREATE_JOB_SUCCESS',
  CREATE_JOB_FAILURE: 'CREATE_JOB_FAILURE',
  UPDATE_JOB_START: 'UPDATE_JOB_START',
  UPDATE_JOB_SUCCESS: 'UPDATE_JOB_SUCCESS',
  UPDATE_JOB_FAILURE: 'UPDATE_JOB_FAILURE',
  DELETE_JOB_START: 'DELETE_JOB_START',
  DELETE_JOB_SUCCESS: 'DELETE_JOB_SUCCESS',
  DELETE_JOB_FAILURE: 'DELETE_JOB_FAILURE',

  // Applications
  FETCH_APPLICATIONS_START: 'FETCH_APPLICATIONS_START',
  FETCH_APPLICATIONS_SUCCESS: 'FETCH_APPLICATIONS_SUCCESS',
  FETCH_APPLICATIONS_FAILURE: 'FETCH_APPLICATIONS_FAILURE',
  CREATE_APPLICATION_START: 'CREATE_APPLICATION_START',
  CREATE_APPLICATION_SUCCESS: 'CREATE_APPLICATION_SUCCESS',
  CREATE_APPLICATION_FAILURE: 'CREATE_APPLICATION_FAILURE',
  UPDATE_APPLICATION_START: 'UPDATE_APPLICATION_START',
  UPDATE_APPLICATION_SUCCESS: 'UPDATE_APPLICATION_SUCCESS',
  UPDATE_APPLICATION_FAILURE: 'UPDATE_APPLICATION_FAILURE',
  DELETE_APPLICATION_START: 'DELETE_APPLICATION_START',
  DELETE_APPLICATION_SUCCESS: 'DELETE_APPLICATION_SUCCESS',
  DELETE_APPLICATION_FAILURE: 'DELETE_APPLICATION_FAILURE',

  // Common
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_STATS: 'UPDATE_STATS',
}

// Reducer
const dataReducer = (state, action) => {
  switch (action.type) {
    // Jobs
    case DATA_ACTIONS.FETCH_JOBS_START:
      return {
        ...state,
        loading: { ...state.loading, jobs: true },
        error: null,
      }

    case DATA_ACTIONS.FETCH_JOBS_SUCCESS:
      return {
        ...state,
        jobs: action.payload,
        loading: { ...state.loading, jobs: false },
        error: null,
      }

    case DATA_ACTIONS.FETCH_JOBS_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, jobs: false },
        error: action.payload,
      }

    case DATA_ACTIONS.CREATE_JOB_START:
      return {
        ...state,
        loading: { ...state.loading, createJob: true },
        error: null,
      }

    case DATA_ACTIONS.CREATE_JOB_SUCCESS:
      return {
        ...state,
        jobs: [action.payload, ...state.jobs],
        loading: { ...state.loading, createJob: false },
        error: null,
      }

    case DATA_ACTIONS.CREATE_JOB_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, createJob: false },
        error: action.payload,
      }

    case DATA_ACTIONS.UPDATE_JOB_START:
      return {
        ...state,
        loading: { ...state.loading, updateJob: true },
        error: null,
      }

    case DATA_ACTIONS.UPDATE_JOB_SUCCESS:
      return {
        ...state,
        jobs: state.jobs.map((job) =>
          job._id === action.payload._id ? action.payload : job
        ),
        loading: { ...state.loading, updateJob: false },
        error: null,
      }

    case DATA_ACTIONS.UPDATE_JOB_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, updateJob: false },
        error: action.payload,
      }

    case DATA_ACTIONS.DELETE_JOB_START:
      return {
        ...state,
        loading: { ...state.loading, deleteJob: true },
        error: null,
      }

    case DATA_ACTIONS.DELETE_JOB_SUCCESS:
      return {
        ...state,
        jobs: state.jobs.filter((job) => job._id !== action.payload),
        loading: { ...state.loading, deleteJob: false },
        error: null,
      }

    case DATA_ACTIONS.DELETE_JOB_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, deleteJob: false },
        error: action.payload,
      }

    // Applications
    case DATA_ACTIONS.FETCH_APPLICATIONS_START:
      return {
        ...state,
        loading: { ...state.loading, applications: true },
        error: null,
      }

    case DATA_ACTIONS.FETCH_APPLICATIONS_SUCCESS:
      return {
        ...state,
        applications: action.payload,
        loading: { ...state.loading, applications: false },
        error: null,
      }

    case DATA_ACTIONS.FETCH_APPLICATIONS_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, applications: false },
        error: action.payload,
      }

    case DATA_ACTIONS.CREATE_APPLICATION_START:
      return {
        ...state,
        loading: { ...state.loading, createApplication: true },
        error: null,
      }

    case DATA_ACTIONS.CREATE_APPLICATION_SUCCESS:
      return {
        ...state,
        applications: [action.payload, ...state.applications],
        loading: { ...state.loading, createApplication: false },
        error: null,
      }

    case DATA_ACTIONS.CREATE_APPLICATION_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, createApplication: false },
        error: action.payload,
      }

    case DATA_ACTIONS.UPDATE_APPLICATION_START:
      return {
        ...state,
        loading: { ...state.loading, updateApplication: true },
        error: null,
      }

    case DATA_ACTIONS.UPDATE_APPLICATION_SUCCESS:
      return {
        ...state,
        applications: state.applications.map((app) =>
          app._id === action.payload._id ? action.payload : app
        ),
        loading: { ...state.loading, updateApplication: false },
        error: null,
      }

    case DATA_ACTIONS.UPDATE_APPLICATION_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, updateApplication: false },
        error: action.payload,
      }

    case DATA_ACTIONS.DELETE_APPLICATION_START:
      return {
        ...state,
        loading: { ...state.loading, deleteApplication: true },
        error: null,
      }

    case DATA_ACTIONS.DELETE_APPLICATION_SUCCESS:
      return {
        ...state,
        applications: state.applications.filter(
          (app) => app._id !== action.payload
        ),
        loading: { ...state.loading, deleteApplication: false },
        error: null,
      }

    case DATA_ACTIONS.DELETE_APPLICATION_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, deleteApplication: false },
        error: action.payload,
      }

    // Common
    case DATA_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    case DATA_ACTIONS.UPDATE_STATS:
      return {
        ...state,
        stats: action.payload,
      }

    default:
      return state
  }
}

// Data provider component
export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState)

  // Stats calculation - safely memoized to prevent infinite loops
  useEffect(() => {
    // Only calculate if we have valid data
    if (!Array.isArray(state.jobs) || !Array.isArray(state.applications)) {
      console.log('⚠️ Stats: Invalid data arrays, skipping calculation')
      return
    }

    console.log(
      '🧮 Stats: Calculating stats for',
      state.jobs.length,
      'jobs and',
      state.applications.length,
      'applications'
    )

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentJobs = state.jobs.filter(
      (job) => new Date(job.createdAt || job.postedDate) > sevenDaysAgo
    )
    const recentApplications = state.applications.filter(
      (app) => new Date(app.createdAt) > sevenDaysAgo
    )

    const newStats = {
      totalJobs: state.jobs.length,
      recentJobs: recentJobs.length,
      totalApplications: state.applications.length,
      recentApplications: recentApplications.length,
    }

    console.log('📊 Stats: New stats calculated:', newStats)

    // Only update stats if they actually changed (prevent infinite loops)
    const statsChanged =
      newStats.totalJobs !== state.stats.totalJobs ||
      newStats.recentJobs !== state.stats.recentJobs ||
      newStats.totalApplications !== state.stats.totalApplications ||
      newStats.recentApplications !== state.stats.recentApplications

    console.log('🔄 Stats: Stats changed?', statsChanged)

    if (statsChanged) {
      console.log('📤 Stats: Dispatching UPDATE_STATS action')
      dispatch({ type: DATA_ACTIONS.UPDATE_STATS, payload: newStats })
    }
  }, [state.jobs.length, state.applications.length]) // Only depend on array lengths

  // Jobs actions
  const fetchJobs = async (filters = {}) => {
    try {
      dispatch({ type: DATA_ACTIONS.FETCH_JOBS_START })
      const response = await jobsAPI.getJobsForDashboard(filters)
      // Handle both response formats: direct array or wrapped in object
      const jobsData = Array.isArray(response)
        ? response
        : response.jobs || response.data?.jobs || []
      dispatch({ type: DATA_ACTIONS.FETCH_JOBS_SUCCESS, payload: jobsData })
      return jobsData
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch jobs'
      dispatch({ type: DATA_ACTIONS.FETCH_JOBS_FAILURE, payload: errorMessage })
      throw error
    }
  }

  const fetchJobsForFeed = async (filters = {}) => {
    try {
      dispatch({ type: DATA_ACTIONS.FETCH_JOBS_START })
      const response = await jobsAPI.getJobsForFeed(filters)
      // Handle both response formats: direct array or wrapped in object
      const jobsData = Array.isArray(response)
        ? response
        : response.jobs || response.data?.jobs || []
      dispatch({ type: DATA_ACTIONS.FETCH_JOBS_SUCCESS, payload: jobsData })
      return jobsData
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch jobs for feed'
      dispatch({ type: DATA_ACTIONS.FETCH_JOBS_FAILURE, payload: errorMessage })
      throw error
    }
  }

  const createJob = async (jobData) => {
    try {
      dispatch({ type: DATA_ACTIONS.CREATE_JOB_START })
      const response = await jobsAPI.createJob(jobData)
      dispatch({
        type: DATA_ACTIONS.CREATE_JOB_SUCCESS,
        payload: response.data || response,
      })
      return response
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create job'
      dispatch({ type: DATA_ACTIONS.CREATE_JOB_FAILURE, payload: errorMessage })
      throw error
    }
  }

  const updateJob = async (id, jobData) => {
    try {
      dispatch({ type: DATA_ACTIONS.UPDATE_JOB_START })
      const response = await jobsAPI.updateJob(id, jobData)
      dispatch({
        type: DATA_ACTIONS.UPDATE_JOB_SUCCESS,
        payload: response.data || response,
      })
      return response
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update job'
      dispatch({ type: DATA_ACTIONS.UPDATE_JOB_FAILURE, payload: errorMessage })
      throw error
    }
  }

  const deleteJob = async (id) => {
    try {
      dispatch({ type: DATA_ACTIONS.DELETE_JOB_START })
      await jobsAPI.deleteJob(id)
      dispatch({ type: DATA_ACTIONS.DELETE_JOB_SUCCESS, payload: id })
      return id
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete job'
      dispatch({ type: DATA_ACTIONS.DELETE_JOB_FAILURE, payload: errorMessage })
      throw error
    }
  }

  // Applications actions
  const fetchApplications = async (filters = {}) => {
    try {
      dispatch({ type: DATA_ACTIONS.FETCH_APPLICATIONS_START })
      const response =
        await applicationsAPI.getApplicationsForDashboard(filters)
      // Handle both response formats: direct array or wrapped in object
      const applicationsData = Array.isArray(response)
        ? response
        : response.applications || response.data?.applications || []
      dispatch({
        type: DATA_ACTIONS.FETCH_APPLICATIONS_SUCCESS,
        payload: applicationsData,
      })
      return applicationsData
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch applications'
      dispatch({
        type: DATA_ACTIONS.FETCH_APPLICATIONS_FAILURE,
        payload: errorMessage,
      })
      throw error
    }
  }

  const createApplication = async (applicationData) => {
    try {
      dispatch({ type: DATA_ACTIONS.CREATE_APPLICATION_START })
      const response = await applicationsAPI.createApplication(applicationData)
      dispatch({
        type: DATA_ACTIONS.CREATE_APPLICATION_SUCCESS,
        payload: response.data || response,
      })
      return response
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to submit application'
      dispatch({
        type: DATA_ACTIONS.CREATE_APPLICATION_FAILURE,
        payload: errorMessage,
      })
      throw error
    }
  }

  const updateApplication = async (id, applicationData) => {
    try {
      dispatch({ type: DATA_ACTIONS.UPDATE_APPLICATION_START })
      const response = await applicationsAPI.updateApplication(
        id,
        applicationData
      )
      dispatch({
        type: DATA_ACTIONS.UPDATE_APPLICATION_SUCCESS,
        payload: response.data || response,
      })
      return response
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to update application'
      dispatch({
        type: DATA_ACTIONS.UPDATE_APPLICATION_FAILURE,
        payload: errorMessage,
      })
      throw error
    }
  }

  const deleteApplication = async (id) => {
    try {
      dispatch({ type: DATA_ACTIONS.DELETE_APPLICATION_START })
      await applicationsAPI.deleteApplication(id)
      dispatch({ type: DATA_ACTIONS.DELETE_APPLICATION_SUCCESS, payload: id })
      return id
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to delete application'
      dispatch({
        type: DATA_ACTIONS.DELETE_APPLICATION_FAILURE,
        payload: errorMessage,
      })
      throw error
    }
  }

  // Common actions
  const clearError = () => {
    dispatch({ type: DATA_ACTIONS.CLEAR_ERROR })
  }

  // Simplified context value without useMemo to stop infinite loop
  const value = {
    ...state,
    // Jobs
    fetchJobs,
    fetchJobsForFeed,
    createJob,
    updateJob,
    deleteJob,
    // Applications
    fetchApplications,
    createApplication,
    updateApplication,
    deleteApplication,
    // Common
    clearError,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// Custom hook to use data context
export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export default DataContext
