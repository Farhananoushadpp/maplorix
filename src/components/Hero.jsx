import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { jobsAPI } from '../services/api'

// Global video controller singleton
class GlobalVideoController {
  constructor() {
    this.currentController = null
    this.videoElement = null
    this.currentVideoIndex = 0
    this.isInitialized = false
  }

  setController(id, videoRef, videos) {
    if (this.currentController && this.currentController !== id) {
      return false // Another controller is already active
    }

    if (!this.currentController) {
      this.currentController = id
      this.videoElement = videoRef.current
      this.isInitialized = true

      if (import.meta.env.DEV) {
        console.log(`🎬 GlobalVideoController: Controller ${id} established`)
      }
      return true
    }

    return this.currentController === id
  }

  releaseController(id) {
    if (this.currentController === id) {
      this.currentController = null
      this.videoElement = null
      this.isInitialized = false

      if (import.meta.env.DEV) {
        console.log(`🎬 GlobalVideoController: Controller ${id} released`)
      }
    }
  }

  isActiveController(id) {
    return this.currentController === id && this.isInitialized
  }
}

// Global instance
const globalVideoController = new GlobalVideoController()

// Video definitions - moved outside component to prevent initialization errors - v2
const VIDEOS = [
  { src: '/job1.webm', type: 'video/webm' },
  { src: '/job2.webm', type: 'video/webm' },
  { src: '/job3.webm', type: 'video/webm' },
]

const Hero = ({ onPostJob, onFindJob }) => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [featuredJobs, setFeaturedJobs] = useState([])
  const [jobStats, setJobStats] = useState({ total: 0, featured: 0 })
  const [loading, setLoading] = useState(true)
  const [showPlayOverlay, setShowPlayOverlay] = useState(false)
  const [loadingVideoIndex, setLoadingVideoIndex] = useState(-1)
  const [heroInstanceId] = useState(() => `hero-${Date.now()}-${Math.random()}`)
  const videoRef = useRef(null)
  const isControllerActive = useRef(false)

  // Global controller management
  useEffect(() => {
    // Try to establish this instance as the controller
    const success = globalVideoController.setController(
      heroInstanceId,
      videoRef,
      VIDEOS
    )
    isControllerActive.current = success

    if (!success) {
      if (import.meta.env.DEV) {
        console.log(
          `🎬 Hero ${heroInstanceId}: Another controller is active, deferring`
        )
      }
      return
    }

    // Cleanup when unmounted
    return () => {
      globalVideoController.releaseController(heroInstanceId)
      isControllerActive.current = false
    }
  }, [heroInstanceId])

  const showPlayButtonOverlay = () => {
    setShowPlayOverlay(true)
    // Hide overlay after 3 seconds
    setTimeout(() => setShowPlayOverlay(false), 3000)
  }

  const handleHireTalentClick = () => {
    if (import.meta.env.DEV) {
      console.log('Hero handleHireTalentClick called')
      console.log('onPostJob function:', onPostJob)
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login page with return URL
      navigate('/login', {
        state: {
          message: 'Please login to post a job',
          returnUrl: '/',
        },
      })
      return
    }

    if (onPostJob) {
      onPostJob()
    } else {
      const element = document.getElementById('employers')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const handleFindJobClick = () => {
    if (import.meta.env.DEV) {
      console.log('Hero handleFindJobClick called')
      console.log('onFindJob function:', onFindJob)
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login page with return URL
      navigate('/login', {
        state: {
          message: 'Please login to find jobs',
          returnUrl: '/jobs',
        },
      })
      return
    }

    if (onFindJob) {
      onFindJob()
    } else {
      navigate('/jobs')
    }
  }

  useEffect(() => {
    // Fetch job data from backend
    const fetchJobData = async () => {
      try {
        setLoading(true)

        // Fetch featured jobs
        const featuredResponse = await jobsAPI.getFeaturedJobs({ limit: 3 })
        const jobs = featuredResponse.data?.jobs || []
        setFeaturedJobs(jobs)

        // Fetch job statistics
        const allJobsResponse = await jobsAPI.getAllJobs()
        const totalJobs = allJobsResponse.data?.pagination?.total || 0

        setJobStats({
          total: totalJobs,
          featured: jobs.length,
        })
      } catch (error) {
        console.error('Error fetching job data:', error)
        // Set default values if backend is not available
        setJobStats({ total: 0, featured: 0 })
      } finally {
        setLoading(false)
      }
    }

    fetchJobData()
  }, [])

  useEffect(() => {
    // Only run video logic for the active controller
    if (!isControllerActive.current) return

    const videoElement = videoRef.current
    if (!videoElement) return

    // Video event handlers
    const handleVideoEnd = () => {
      if (import.meta.env.DEV) console.log('Video ended, moving to next video')
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % VIDEOS.length)
    }

    const handleVideoLoad = () => {
      if (import.meta.env.DEV) console.log('Video loaded, attempting to play')
      // Try to play with user interaction requirement
      const playPromise = videoElement.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (import.meta.env.DEV) console.log('Video autoplay successful')
          })
          .catch((error) => {
            if (import.meta.env.DEV)
              console.log('Auto-play prevented, adding play button overlay')
            showPlayButtonOverlay()
          })
      }
    }

    const handleVideoError = (e) => {
      if (import.meta.env.DEV) console.error('Video loading error:', e)
      // Advance to next video on error
      setTimeout(() => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % VIDEOS.length)
      }, 2000)
    }

    const handleVideoStalled = () => {
      if (import.meta.env.DEV) console.log('Video stalled, advancing to next')
      setTimeout(() => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % VIDEOS.length)
      }, 2000)
    }

    // Set up event listeners
    videoElement.addEventListener('ended', handleVideoEnd)
    videoElement.addEventListener('loadeddata', handleVideoLoad)
    videoElement.addEventListener('error', handleVideoError)
    videoElement.addEventListener('stalled', handleVideoStalled)

    // Configure video properties
    videoElement.playsInline = true
    videoElement.muted = true
    videoElement.preload = 'auto'

    // Load and play new video when index changes
    if (loadingVideoIndex !== currentVideoIndex) {
      setLoadingVideoIndex(currentVideoIndex)

      if (import.meta.env.DEV) {
        console.log(
          `Loading video ${currentVideoIndex}: ${VIDEOS[currentVideoIndex].src}`
        )
      }

      // Reset and load new video
      videoElement.pause()
      videoElement.currentTime = 0
      videoElement.load()
    }

    // Set a timeout to advance if video gets stuck (longer timeout for better UX)
    const timeoutId = setTimeout(() => {
      if (import.meta.env.DEV)
        console.log('Video timeout - advancing to next video')
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % VIDEOS.length)
    }, 15000) // Increased from 10s to 15s

    // Cleanup
    return () => {
      videoElement.removeEventListener('ended', handleVideoEnd)
      videoElement.removeEventListener('loadeddata', handleVideoLoad)
      videoElement.removeEventListener('error', handleVideoError)
      videoElement.removeEventListener('stalled', handleVideoStalled)
      clearTimeout(timeoutId)
    }
  }, [currentVideoIndex, loadingVideoIndex])

  return (
    <section
      id="home"
      data-hero-id={heroInstanceId}
      className="relative overflow-hidden min-h-screen flex items-center"
    >
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          key={currentVideoIndex}
          className="w-full h-full object-cover"
          muted
          loop={false}
          playsInline
          preload="auto"
          disablePictureInPicture
          x-webkit-airplay="allow"
          style={{
            filter: 'brightness(0.8) contrast(1.2) saturate(1.1)',
            transform: 'scale(1.05)',
            transition: 'opacity 0.8s ease-in-out',
          }}
        >
          <source
            src={VIDEOS[currentVideoIndex].src}
            type={VIDEOS[currentVideoIndex].type}
          />
          Your browser does not support the video tag.
        </video>

        {/* Play Button Overlay */}
        {showPlayOverlay && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
            <button
              onClick={() => {
                videoRef.current?.play()
                setShowPlayOverlay(false)
              }}
              className="bg-white/90 hover:bg-white text-primary rounded-full p-4 transform hover:scale-110 transition-all"
            >
              <i className="fas fa-play text-2xl ml-1"></i>
            </button>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-secondary/80"></div>
      </div>

      <div className="container relative z-20 px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 leading-tight">
            <span className="block text-white drop-shadow-2xl">
              Connecting Talent with Opportunity
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-12 leading-relaxed text-white/95 max-w-3xl mx-auto px-2">
            Maplorix helps companies find skilled professionals and candidates
            secure the right job—faster and smarter.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
            <button
              onClick={handleHireTalentClick}
              className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-accent to-secondary hover:from-secondary hover:to-accent text-primary font-bold text-base sm:text-lg rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-accent/25 focus:outline-none focus:ring-4 focus:ring-accent/50"
            >
              <span className="relative z-10 flex items-center justify-center">
                <i className="fas fa-briefcase mr-2 sm:mr-3 group-hover:rotate-12 transition-transform"></i>
                Post a Job
                <i className="fas fa-arrow-right ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform"></i>
              </span>
            </button>

            <button
              onClick={handleFindJobClick}
              className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-secondary to-accent hover:from-accent hover:to-secondary text-primary font-bold text-base sm:text-lg rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-accent/25 focus:outline-none focus:ring-4 focus:ring-accent/50"
            >
              <span className="relative z-10 flex items-center justify-center">
                <i className="fas fa-search mr-2 sm:mr-3 group-hover:animate-bounce"></i>
                Find a Job
                <i className="fas fa-arrow-right ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform"></i>
              </span>
            </button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2">
                <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  15,000+
                </span>
              </div>
              <div className="text-white/80 font-medium text-xs sm:text-sm">
                Success Stories
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2">
                <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  1000+
                </span>
              </div>
              <div className="text-white/80 font-medium text-xs sm:text-sm">
                Partner Companies
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2">
                <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  98%
                </span>
              </div>
              <div className="text-white/80 font-medium text-xs sm:text-sm">
                Success Rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2">
                <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  24/7
                </span>
              </div>
              <div className="text-white/80 font-medium text-xs sm:text-sm">
                Support Available
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="animate-bounce">
          <i className="fas fa-chevron-down text-white/60 text-2xl"></i>
        </div>
      </div>
    </section>
  )
}

export default Hero
