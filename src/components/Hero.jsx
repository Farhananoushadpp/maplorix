import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobsAPI } from '../services/api'

const Hero = ({ onPostJob, onFindJob }) => {
  const navigate = useNavigate()
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [featuredJobs, setFeaturedJobs] = useState([])
  const [jobStats, setJobStats] = useState({ total: 0, featured: 0 })
  const [loading, setLoading] = useState(true)
  const videoRef = useRef(null)

  const videos = useMemo(() => [
    { src: '/job1.webm', type: 'video/webm' },
    { src: '/job2.webm', type: 'video/webm' },
    { src: '/job3.webm', type: 'video/webm' }
  ], [])

  const handleHireTalentClick = () => {
    console.log('Hero handleHireTalentClick called')
    console.log('onPostJob function:', onPostJob)

    if (onPostJob) {
      console.log('Calling onPostJob function')
      onPostJob()
    } else {
      console.log('No onPostJob function, scrolling to employers section')
      const element = document.getElementById('employers')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const handleFindJobClick = () => {
    console.log('Hero handleFindJobClick called')
    console.log('onFindJob function:', onFindJob)

    if (onFindJob) {
      console.log('Calling onFindJob function')
      onFindJob()
    } else {
      console.log('No onFindJob function, navigating to apply page')
      navigate('/apply')
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
    const videoElement = videoRef.current

    const handleVideoEnd = () => {
      console.log('Video ended, moving to next video')
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length)
    }

    const handleVideoLoad = () => {
      console.log('Video loaded, attempting to play')
      if (videoElement) {
        videoElement.play().catch((error) => {
          console.log('Auto-play was prevented:', error)
          // If autoplay fails, try to advance to next video after a delay
          setTimeout(() => {
            setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length)
          }, 3000) // Wait 3 seconds then advance
        })
      }
    }

    const handleVideoError = (e) => {
      console.error('Video loading error:', e)
      // Advance to next video on error
      setTimeout(() => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length)
      }, 1000)
    }

    const handleVideoStalled = () => {
      console.log('Video stalled, advancing to next')
      setTimeout(() => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length)
      }, 2000)
    }

    if (videoElement) {
      // Remove existing listeners
      videoElement.removeEventListener('ended', handleVideoEnd)
      videoElement.removeEventListener('loadeddata', handleVideoLoad)
      videoElement.removeEventListener('error', handleVideoError)
      videoElement.removeEventListener('stalled', handleVideoStalled)
      
      // Add new listeners
      videoElement.addEventListener('ended', handleVideoEnd)
      videoElement.addEventListener('loadeddata', handleVideoLoad)
      videoElement.addEventListener('error', handleVideoError)
      videoElement.addEventListener('stalled', handleVideoStalled)

      videoElement.playsInline = true
      videoElement.muted = true
      videoElement.preload = 'auto'
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('ended', handleVideoEnd)
        videoElement.removeEventListener('loadeddata', handleVideoLoad)
        videoElement.removeEventListener('error', handleVideoError)
        videoElement.removeEventListener('stalled', handleVideoStalled)
      }
    }
  }, [currentVideoIndex, videos.length])

  useEffect(() => {
    if (videoRef.current) {
      const videoElement = videoRef.current
      console.log(`Loading video ${currentVideoIndex}: ${videos[currentVideoIndex].src}`)
      
      // Reset and load new video
      videoElement.pause()
      videoElement.currentTime = 0
      videoElement.load()

      // Set a timeout to advance if video gets stuck
      const timeoutId = setTimeout(() => {
        console.log('Video timeout - advancing to next video')
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length)
      }, 10000) // 10 seconds timeout

      // Try to play with fallback
      const attemptPlay = () => {
        videoElement.play().then(() => {
          // Clear timeout if play succeeds
          clearTimeout(timeoutId)
        }).catch((error) => {
          console.log('Play failed:', error)
          // If play fails, advance to next video after delay
          setTimeout(() => {
            console.log('Advancing to next video due to play failure')
            setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length)
          }, 2000)
        })
      }

      // Immediate play attempt
      attemptPlay()
      
      // Fallback play attempt
      setTimeout(attemptPlay, 500)

      // Cleanup timeout on unmount
      return () => clearTimeout(timeoutId)
    }
  }, [currentVideoIndex, videos])

  return (
    <section
      id="home"
      className="relative overflow-hidden min-h-screen flex items-center"
    >
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          key={currentVideoIndex}
          className="w-full h-full object-cover"
          autoPlay
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
          <source src={videos[currentVideoIndex].src} type={videos[currentVideoIndex].type} />
          Your browser does not support the video tag.
        </video>

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
