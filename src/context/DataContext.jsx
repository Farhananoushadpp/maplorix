// Data Context for managing jobs and applications state
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react'
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
    backup: false,
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
  backups: {
    lastBackup: null,
    backupHistory: [],
    autoBackupEnabled: true,
    backupInterval: 24 * 60 * 60 * 1000, // 24 hours
    nextBackupTime: null,
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

  // Backup
  BACKUP_START: 'BACKUP_START',
  BACKUP_SUCCESS: 'BACKUP_SUCCESS',
  BACKUP_FAILURE: 'BACKUP_FAILURE',
  SET_AUTO_BACKUP: 'SET_AUTO_BACKUP',
  SET_BACKUP_INTERVAL: 'SET_BACKUP_INTERVAL',
  CLEAR_BACKUP_HISTORY: 'CLEAR_BACKUP_HISTORY',

  // Common
  CLEAR_ERROR: 'CLEAR_ERROR',
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

    // Backup
    case DATA_ACTIONS.BACKUP_START:
      return {
        ...state,
        loading: { ...state.loading, backup: true },
        error: null,
      }

    case DATA_ACTIONS.BACKUP_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, backup: false },
        error: null,
        backups: {
          ...state.backups,
          lastBackup: action.payload.timestamp,
          backupHistory: [action.payload, ...state.backups.backupHistory].slice(0, 10), // Keep last 10 backups
          nextBackupTime: new Date(Date.now() + state.backups.backupInterval),
        },
      }

    case DATA_ACTIONS.BACKUP_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, backup: false },
        error: action.payload,
      }

    case DATA_ACTIONS.SET_AUTO_BACKUP:
      return {
        ...state,
        backups: {
          ...state.backups,
          autoBackupEnabled: action.payload,
        },
      }

    case DATA_ACTIONS.SET_BACKUP_INTERVAL:
      return {
        ...state,
        backups: {
          ...state.backups,
          backupInterval: action.payload,
          nextBackupTime: new Date(Date.now() + action.payload),
        },
      }

    case DATA_ACTIONS.CLEAR_BACKUP_HISTORY:
      return {
        ...state,
        backups: {
          ...state.backups,
          backupHistory: [],
          lastBackup: null,
        },
      }

    // Common
    case DATA_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    default:
      return state
  }
}

// Data provider component
export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState)

  // Track previous data to prevent unnecessary recalculations
  const prevDataRef = useRef({
    jobsLength: 0,
    applicationsLength: 0,
    jobsHash: '',
    applicationsHash: '',
    lastStats: {
      totalJobs: 0,
      recentJobs: 0,
      totalApplications: 0,
      recentApplications: 0,
    },
  })

  // Stats calculation - safely memoized to prevent infinite loops
  // Calculate stats using useMemo to avoid infinite loops
  const stats = useMemo(() => {
    // Only calculate if we have valid data
    if (!Array.isArray(state.jobs) || !Array.isArray(state.applications)) {
      if (import.meta.env.DEV)
        console.log('⚠️ Stats: Invalid data arrays, returning default stats')
      return {
        totalJobs: 0,
        recentJobs: 0,
        totalApplications: 0,
        recentApplications: 0,
      }
    }

    // Check if data actually changed to prevent unnecessary recalculations
    const currentJobsHash = state.jobs.map((j) => j._id).join(',')
    const currentApplicationsHash = state.applications
      .map((a) => a._id)
      .join(',')

    const prevData = prevDataRef.current
    if (
      prevData.jobsLength === state.jobs.length &&
      prevData.applicationsLength === state.applications.length &&
      prevData.jobsHash === currentJobsHash &&
      prevData.applicationsHash === currentApplicationsHash
    ) {
      // Data hasn't actually changed, return previous calculation
      return prevData.lastStats
    }

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Filter jobs by postedBy for Dashboard stats (only user posts)
    const userJobs = state.jobs.filter((job) => job.postedBy === 'user')
    const recentUserJobs = userJobs.filter(
      (job) => new Date(job.createdAt || job.postedDate) > sevenDaysAgo
    )
    const recentApplications = state.applications.filter(
      (app) => new Date(app.createdAt) > sevenDaysAgo
    )

    const newStats = {
      totalJobs: userJobs.length,
      recentJobs: recentUserJobs.length,
      totalApplications: state.applications.length,
      recentApplications: recentApplications.length,
    }

    // Update ref with current data and store calculated stats
    prevDataRef.current = {
      jobsLength: state.jobs.length,
      applicationsLength: state.applications.length,
      jobsHash: currentJobsHash,
      applicationsHash: currentApplicationsHash,
      lastStats: newStats,
    }

    // Only log in development mode and only if data actually changed
    if (
      import.meta.env.DEV &&
      state.jobs.length + state.applications.length > 0
    ) {
      console.log(
        '🧮 Stats: Calculating stats for',
        state.jobs.length,
        'jobs and',
        state.applications.length,
        'applications'
      )
    }

    // Only log in development mode and only if stats are meaningful
    if (
      import.meta.env.DEV &&
      (newStats.totalJobs > 0 || newStats.totalApplications > 0)
    ) {
      console.log('📊 Stats: New stats calculated:', newStats)
    }
    return newStats
  }, [state.jobs, state.applications]) // Only depend on jobs and applications arrays

  // Backup actions - Define before useEffect to avoid initialization errors
  const createBackup = useCallback(async () => {
    try {
      dispatch({ type: DATA_ACTIONS.BACKUP_START })
      
      const backupData = {
        timestamp: new Date().toISOString(),
        jobs: state.jobs,
        applications: state.applications,
        stats: state.stats,
        metadata: {
          totalJobs: state.jobs.length,
          totalApplications: state.applications.length,
          backupVersion: '1.0',
          source: 'Maplorix Dashboard',
        },
      }

      // Store backup in localStorage
      const backupKey = `maplorix_backup_${new Date().toISOString().slice(0, 10)}`
      localStorage.setItem(backupKey, JSON.stringify(backupData))

      // Also store in sessionStorage for quick access
      sessionStorage.setItem('maplorix_latest_backup', JSON.stringify(backupData))

      // Store backup history
      const existingHistory = JSON.parse(localStorage.getItem('maplorix_backup_history') || '[]')
      const newHistory = [backupData, ...existingHistory].slice(0, 10) // Keep last 10 backups
      localStorage.setItem('maplorix_backup_history', JSON.stringify(newHistory))

      dispatch({
        type: DATA_ACTIONS.BACKUP_SUCCESS,
        payload: backupData,
      })

      console.log('✅ Backup created successfully:', backupData.timestamp)
      return backupData
    } catch (error) {
      const errorMessage = error.message || 'Failed to create backup'
      dispatch({ type: DATA_ACTIONS.BACKUP_FAILURE, payload: errorMessage })
      console.error('❌ Backup failed:', error)
      throw error
    }
  }, [state.jobs, state.applications, state.stats])

  // Auto-backup effect
  useEffect(() => {
    if (!state.backups.autoBackupEnabled) {
      return
    }

    const checkAndCreateBackup = async () => {
      const now = new Date()
      const nextBackupTime = state.backups.nextBackupTime

      if (nextBackupTime && now >= nextBackupTime) {
        console.log('🔄 Auto-backup triggered at:', now.toISOString())
        try {
          await createBackup()
          console.log('✅ Auto-backup completed successfully')
        } catch (error) {
          console.error('❌ Auto-backup failed:', error)
        }
      }
    }

    // Check immediately on mount
    checkAndCreateBackup()

    // Set up interval to check for backup time
    const interval = setInterval(checkAndCreateBackup, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [state.backups.autoBackupEnabled, state.backups.nextBackupTime, createBackup])

  // Initialize backup time on first load
  useEffect(() => {
    if (state.backups.autoBackupEnabled && !state.backups.nextBackupTime) {
      const nextBackup = new Date(Date.now() + state.backups.backupInterval)
      dispatch({
        type: DATA_ACTIONS.SET_BACKUP_INTERVAL,
        payload: state.backups.backupInterval,
      })
    }
  }, [state.backups.autoBackupEnabled, state.backups.nextBackupTime, state.backups.backupInterval])

  // Jobs actions
  const fetchJobs = useCallback(async (filters = {}) => {
    try {
      dispatch({ type: DATA_ACTIONS.FETCH_JOBS_START })
      // Add timestamp to force refresh if requested
      const params = { ...filters }
      if (filters.forceRefresh) {
        params._t = Date.now() // Cache busting parameter
        delete params.forceRefresh
      }
      const response = await jobsAPI.getJobsForDashboard(params)
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
  }, [])

  const fetchJobsForFeed = useCallback(async (filters = {}) => {
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
  }, [])

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
      // Add timestamp to force refresh if requested
      const params = { ...filters }
      if (filters.forceRefresh) {
        params._t = Date.now() // Cache busting parameter
        delete params.forceRefresh
      }
      const response = await applicationsAPI.getApplicationsForDashboard(params)
      // Handle backend response structure: {success: true, data: {applications: [...], pagination: {...}}}
      const applicationsData = Array.isArray(response)
        ? response
        : response.data?.applications || response.applications || []
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

  const restoreBackup = useCallback(async (backupData) => {
    try {
      console.log('🔄 Restoring backup from:', backupData.timestamp)
      
      // Restore jobs
      if (backupData.jobs && Array.isArray(backupData.jobs)) {
        dispatch({
          type: DATA_ACTIONS.FETCH_JOBS_SUCCESS,
          payload: backupData.jobs,
        })
      }

      // Restore applications
      if (backupData.applications && Array.isArray(backupData.applications)) {
        dispatch({
          type: DATA_ACTIONS.FETCH_APPLICATIONS_SUCCESS,
          payload: backupData.applications,
        })
      }

      console.log('✅ Backup restored successfully')
      return backupData
    } catch (error) {
      console.error('❌ Failed to restore backup:', error)
      throw error
    }
  }, [])

  const downloadBackup = useCallback(async () => {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        jobs: state.jobs,
        applications: state.applications,
        stats: state.stats,
        metadata: {
          totalJobs: state.jobs.length,
          totalApplications: state.applications.length,
          backupVersion: '1.0',
          source: 'Maplorix Dashboard',
          exportedAt: new Date().toISOString(),
        },
      }

      // Create downloadable JSON file
      const dataStr = JSON.stringify(backupData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const url = window.URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Maplorix_Backup_${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      console.log('✅ Backup downloaded successfully')
      return backupData
    } catch (error) {
      console.error('❌ Failed to download backup:', error)
      throw error
    }
  }, [state.jobs, state.applications, state.stats])

  const setAutoBackup = useCallback((enabled) => {
    dispatch({
      type: DATA_ACTIONS.SET_AUTO_BACKUP,
      payload: enabled,
    })
  }, [])

  const setBackupInterval = useCallback((interval) => {
    dispatch({
      type: DATA_ACTIONS.SET_BACKUP_INTERVAL,
      payload: interval,
    })
  }, [])

  const clearBackupHistory = useCallback(() => {
    dispatch({ type: DATA_ACTIONS.CLEAR_BACKUP_HISTORY })
    localStorage.removeItem('maplorix_backup_history')
  }, [])

  // Common actions
  const clearError = () => {
    dispatch({ type: DATA_ACTIONS.CLEAR_ERROR })
  }

  // Simplified context value without useMemo to stop infinite loop
  const value = {
    ...state,
    stats, // Use memoized stats instead of state.stats
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
    // Backup
    createBackup,
    restoreBackup,
    downloadBackup,
    setAutoBackup,
    setBackupInterval,
    clearBackupHistory,
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
