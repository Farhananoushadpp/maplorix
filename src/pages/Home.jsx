// Home Page - Maplorix Recruitment Agency Landing Page
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import Hero from '../components/Hero'
import About from '../components/About'
import Contact from '../components/Contact'
import DashboardJobPostModal from '../components/DashboardJobPostModal'
import DashboardJobApplyModal from '../components/DashboardJobApplyModal'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { applicationsAPI, jobsAPI } from '../services/api'

const Home = () => {
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [showPostJobModal, setShowPostJobModal] = useState(false)
  const [showApplyJobModal, setShowApplyJobModal] = useState(false)
  const [availableJobs, setAvailableJobs] = useState([])
  const [successMessage, setSuccessMessage] = useState('')

  const { user, isAuthenticated } = useAuth()
  const { fetchJobsForFeed } = useData()
  const navigate = useNavigate()

  // Fetch available jobs for display (only admin posts should show here)
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Use fetchJobsForFeed to get all jobs (same as PostsFeed)
        const allJobs = await fetchJobsForFeed()

        // Additional client-side filter to ensure only admin posts
        const adminJobs = allJobs.filter((job) => job.postedBy === 'admin')

        console.log('🏠 Home: Total jobs fetched:', allJobs.length)
        console.log('🏠 Home: Admin jobs filtered:', adminJobs.length)

        setAvailableJobs(adminJobs.slice(0, 6)) // Show latest 6 admin jobs
      } catch (error) {
        console.error('Error fetching jobs:', error)
      }
    }

    fetchJobs()
  }, [fetchJobsForFeed])

  // Handle successful job posting
  const handlePostJobSuccess = (jobData) => {
    console.log('Job posted successfully:', jobData)

    // Show success message
    setSuccessMessage(
      `Job "${jobData.title || 'Position'}" posted successfully!`
    )

    setTimeout(() => {
      setShowPostJobModal(false)
      setSuccessMessage('')
      // Refresh dashboard data
      fetchJobs()
      fetchApplications()
    }, 3000)
  }

  // Handle successful job application
  const handleApplyJobSuccess = (applicationData) => {
    console.log('Application submitted successfully:', applicationData)

    // Show success message
    setSuccessMessage(
      `Application submitted successfully for "${applicationData.jobRole || 'Position'}"!`
    )

    // Show success message and redirect
    setTimeout(() => {
      setShowApplyJobModal(false)
      setSuccessMessage('')
      if (isAuthenticated) {
        // Refresh dashboard data before navigating
        fetchJobs()
        fetchApplications()
        navigate('/dashboard')
      }
    }, 3000)
  }

  const handlePostJobClick = () => {
    console.log('Post Job button clicked')
    console.log('Opening Dashboard Job Post modal')
    setShowPostJobModal(true)
  }

  const handleFindJobClick = () => {
    console.log('Find Job button clicked')
    console.log('Opening Dashboard Job Apply modal')
    setShowApplyJobModal(true)
  }

  return (
    <>
      <SEO 
        title="Leading Recruitment Agency | Find Jobs & Hire Talent"
        description="Maplorix is a premier recruitment agency connecting talented professionals with top employers. Search jobs, upload resume, get career counseling, and hire the best talent."
        keywords="recruitment agency, job search, career counseling, resume building, interview preparation, talent acquisition, staffing solutions, executive search"
        canonicalUrl="https://www.maplorix.com/"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Maplorix - Leading Recruitment Agency",
          "description": "Premier recruitment agency connecting talented professionals with top employers",
          "url": "https://www.maplorix.com/",
          "mainEntity": {
            "@type": "Organization",
            "name": "Maplorix Recruitment Agency",
            "url": "https://www.maplorix.com"
          }
        }}
      />
      <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Only render main content when no modals are open */}
      {!showPostJobModal && !showApplyJobModal && !showResumeModal && (
        <main className="w-full max-w-full">
          <header>
            <Hero
              onUploadResume={() => setShowResumeModal(true)}
              onPostJob={handlePostJobClick}
              onFindJob={handleFindJobClick}
            />
          </header>

          <section aria-labelledby="about-section">
            <About />
          </section>

          {/* Career Transformation Section */}
          <section
            className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-primary/5 to-secondary/5"
            aria-labelledby="career-transformation-heading"
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                <h2
                  id="career-transformation-heading"
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-3 sm:mb-4"
                >
                  Ready to Transform Your Career?
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-text-light max-w-3xl mx-auto px-4">
                  Discover personalized solutions designed to accelerate your
                  professional growth and land your dream job
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {/* Job Search Assistance */}
                <article className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
                  <div className="mb-4">
                    <img
                      src="/images/jobsearch.webp"
                      alt="Job Search Assistance - Professional career guidance"
                      className="w-full h-40 sm:h-48 object-cover rounded-lg"
                      onError={(e) => {
                        // Fallback to jpg if webp fails
                        e.target.src = '/public/jobsearch.webp'
                      }}
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-3">
                    Job Search Assistance
                  </h3>
                  <p className="text-sm sm:text-base text-text-light mb-4">
                    Personalized job matching based on your skills, experience,
                    and career goals. We connect you with opportunities that
                    align with your aspirations.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-xs sm:text-sm text-secondary">
                      <i
                        className="fas fa-check-circle mr-2"
                        aria-hidden="true"
                      ></i>
                      Personalized approach
                    </li>
                    <li className="flex items-center text-xs sm:text-sm text-secondary">
                      <i
                        className="fas fa-check-circle mr-2"
                        aria-hidden="true"
                      ></i>
                      Expert guidance
                    </li>
                    <li className="flex items-center text-xs sm:text-sm text-secondary">
                      <i
                        className="fas fa-check-circle mr-2"
                        aria-hidden="true"
                      ></i>
                      Proven results
                    </li>
                  </ul>
                </article>

                {/* Resume Building */}
                <article className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
                  <div className="mb-4">
                    <img
                      src="/images/jobsearch.webp"
                      alt="Resume Building - Professional resume optimization"
                      className="w-full h-40 sm:h-48 object-cover rounded-lg"
                      onError={(e) => {
                        // Fallback to jpg if webp fails
                        e.target.src = '/public/resumebuilder.webp'
                      }}
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-3">
                    Resume Building
                  </h3>
                  <p className="text-sm sm:text-base text-text-light mb-4">
                    Professional resume optimization to highlight your strengths
                    and stand out to employers. Our experts help you create
                    compelling resumes.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-xs sm:text-sm text-secondary">
                      <i
                        className="fas fa-check-circle mr-2"
                        aria-hidden="true"
                      ></i>
                      Personalized approach
                    </li>
                    <li className="flex items-center text-xs sm:text-sm text-secondary">
                      <i
                        className="fas fa-check-circle mr-2"
                        aria-hidden="true"
                      ></i>
                      Expert guidance
                    </li>
                    <li className="flex items-center text-xs sm:text-sm text-secondary">
                      <i
                        className="fas fa-check-circle mr-2"
                        aria-hidden="true"
                      ></i>
                      Proven results
                    </li>
                  </ul>
                </article>

                {/* Interview Preparation */}
                <article className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
                  <div className="mb-4">
                    <img
                      src="/images/jobsearch.webp"
                      alt="Interview Preparation - Mock interviews and coaching"
                      className="w-full h-40 sm:h-48 object-cover rounded-lg"
                      onError={(e) => {
                        // Fallback to jpg if webp fails
                        e.target.src = '/public/interviewpreparation.webp'
                      }}
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-3">
                    Interview Preparation
                  </h3>
                  <p className="text-sm sm:text-base text-text-light mb-4">
                    Comprehensive interview coaching including mock interviews,
                    feedback sessions, and confidence-building techniques to ace
                    your interviews.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-xs sm:text-sm text-secondary">
                      <i
                        className="fas fa-check-circle mr-2"
                        aria-hidden="true"
                      ></i>
                      Personalized approach
                    </li>
                    <li className="flex items-center text-xs sm:text-sm text-secondary">
                      <i
                        className="fas fa-check-circle mr-2"
                        aria-hidden="true"
                      ></i>
                      Expert guidance
                    </li>
                    <li className="flex items-center text-xs sm:text-sm text-secondary">
                      <i
                        className="fas fa-check-circle mr-2"
                        aria-hidden="true"
                      ></i>
                      Proven results
                    </li>
                  </ul>
                </article>

                {/* Career Counseling */}
                <article className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
                  <div className="mb-4">
                    <img
                      src="/images/jobsearch.webp"
                      alt="Career Counseling - Professional career guidance"
                      className="w-full h-40 sm:h-48 object-cover rounded-lg"
                      onError={(e) => {
                        // Fallback to jpg if webp fails
                        e.target.src = '/public/careercunseling.webp'
                      }}
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-3">
                    Career Counseling
                  </h3>
                  <p className="text-sm sm:text-base text-text-light mb-4">
                    Expert guidance on career path planning, skill development,
                    and professional growth strategies to advance your career
                    effectively.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-xs sm:text-sm text-secondary">
                      <i
                        className="fas fa-check-circle mr-2"
                        aria-hidden="true"
                      ></i>
                      Personalized approach
                    </li>
                    <li className="flex items-center text-xs sm:text-sm text-secondary">
                      <i
                        className="fas fa-check-circle mr-2"
                        aria-hidden="true"
                      ></i>
                      Expert guidance
                    </li>
                    <li className="flex items-center text-xs sm:text-sm text-secondary">
                      <i
                        className="fas fa-check-circle mr-2"
                        aria-hidden="true"
                      ></i>
                      Proven results
                    </li>
                  </ul>
                </article>
              </div>

              {/* CTA Section */}
              <div className="text-center mt-8 sm:mt-12 lg:mt-16 bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-primary mb-3 sm:mb-4">
                  Ready to Take the Next Step?
                </h3>
                <p className="text-sm sm:text-base text-text-light mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                  Join thousands of professionals who've transformed their
                  careers with our expert guidance and support.
                </p>
                <button
                  onClick={() => {
                    setShowApplyJobModal(true)
                  }}
                  className="bg-gradient-to-r from-secondary to-accent text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 text-sm sm:text-base lg:text-lg"
                  aria-label="Start your career transformation journey with Maplorix"
                >
                  Start Your Journey
                </button>
              </div>
            </div>
          </section>

          {/* Looking for Top Talent Section */}
          <section className="py-12 sm:py-16 lg:py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-3 sm:mb-4">
                  Looking for Top Talent?
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-text-light max-w-3xl mx-auto px-4">
                  Find exceptional candidates who will drive your business
                  forward with our expert recruitment solutions
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {/* Talent Acquisition */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="mb-4">
                    <img
                      src="/images/talent-acquisition.jpg"
                      alt="Talent Acquisition"
                      className="w-full h-40 sm:h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = `/public/talent-acquisition.webp`
                      }}
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-3">
                    Talent Acquisition
                  </h3>
                  <p className="text-sm sm:text-base text-text-light mb-4">
                    End-to-end recruitment solutions to find, attract, and hire
                    the best talent for your organization. We handle the entire
                    hiring process.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-xs sm:text-sm text-secondary">
                      <i className="fas fa-check-circle mr-2"></i>
                      End-to-end solutions
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-secondary">
                      <i className="fas fa-check-circle mr-2"></i>
                      Expert recruiters
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-secondary">
                      <i className="fas fa-check-circle mr-2"></i>
                      Quality assurance
                    </div>
                  </div>
                </div>

                {/* Candidate Screening */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="mb-4">
                    <img
                      src="/images/candidate-screening.jpg"
                      alt="Candidate Screening"
                      className="w-full h-40 sm:h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = `/public/candidate-screening.webp`
                      }}
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-3">
                    Candidate Screening
                  </h3>
                  <p className="text-sm sm:text-base text-text-light mb-4">
                    Thorough screening and evaluation processes to ensure you
                    get qualified, pre-vetted candidates who match your
                    requirements perfectly.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-xs sm:text-sm text-secondary">
                      <i className="fas fa-check-circle mr-2"></i>
                      End-to-end solutions
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-secondary">
                      <i className="fas fa-check-circle mr-2"></i>
                      Expert recruiters
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-secondary">
                      <i className="fas fa-check-circle mr-2"></i>
                      Quality assurance
                    </div>
                  </div>
                </div>

                {/* Staffing Solutions */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="mb-4">
                    <img
                      src="/images/staffing-solutions.jpg"
                      alt="Staffing Solutions"
                      className="w-full h-40 sm:h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = `/public/staffing-solutions.webp`
                      }}
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-3">
                    Staffing Solutions
                  </h3>
                  <p className="text-sm sm:text-base text-text-light mb-4">
                    Flexible staffing options including temporary, permanent,
                    and contract placements to meet your dynamic business needs.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-xs sm:text-sm text-secondary">
                      <i className="fas fa-check-circle mr-2"></i>
                      End-to-end solutions
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-secondary">
                      <i className="fas fa-check-circle mr-2"></i>
                      Expert recruiters
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-secondary">
                      <i className="fas fa-check-circle mr-2"></i>
                      Quality assurance
                    </div>
                  </div>
                </div>

                {/* Executive Search */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="mb-4">
                    <img
                      src="/images/executive-search.jpg"
                      alt="Executive Search"
                      className="w-full h-40 sm:h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = `/public/executive-search.webp`
                      }}
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-3">
                    Executive Search
                  </h3>
                  <p className="text-sm sm:text-base text-text-light mb-4">
                    Specialized executive recruitment for senior-level positions
                    and leadership roles with confidentiality and precision.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-xs sm:text-sm text-secondary">
                      <i className="fas fa-check-circle mr-2"></i>
                      End-to-end solutions
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-secondary">
                      <i className="fas fa-check-circle mr-2"></i>
                      Expert recruiters
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-secondary">
                      <i className="fas fa-check-circle mr-2"></i>
                      Quality assurance
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="text-center mt-8 sm:mt-12 lg:mt-16 bg-gradient-to-br from-primary/5 to-secondary/10 rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-primary mb-3 sm:mb-4">
                  Ready to Find Your Next Star Player?
                </h3>
                <p className="text-sm sm:text-base text-text-light mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                  Partner with us to access top talent and streamline your
                  hiring process with our proven recruitment strategies.
                </p>
                <button
                  onClick={() => {
                    setShowPostJobModal(true)
                  }}
                  className="bg-gradient-to-r from-primary to-secondary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 text-sm sm:text-base lg:text-lg"
                >
                  Post a Job Now
                </button>
              </div>
            </div>
          </section>

          <Contact />
        </main>
      )}

      {/* Resume Upload Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowResumeModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              {/* Modal Header */}
              <div className="bg-primary text-white px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-secondary/20 rounded-full p-2 mr-3">
                      <i className="fas fa-file-upload text-secondary"></i>
                    </div>
                    <h2 className="text-xl font-bold">Upload Your Resume</h2>
                  </div>
                  <button
                    onClick={() => setShowResumeModal(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="max-h-[80vh] overflow-y-auto">
                <div className="p-6">
                  <div className="text-center py-12">
                    <i className="fas fa-cloud-upload-alt text-6xl text-accent mb-4"></i>
                    <h3 className="text-xl font-semibold text-primary mb-2">
                      Upload Your Resume
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Join our talent pool and let top recruiters find you
                    </p>
                    <button
                      onClick={() => setShowResumeModal(false)}
                      className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <i className="fas fa-check-circle"></i>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Dashboard Job Post Modal */}
      <DashboardJobPostModal
        isOpen={showPostJobModal}
        onClose={() => setShowPostJobModal(false)}
        onSuccess={handlePostJobSuccess}
      />

      {/* Dashboard Job Apply Modal */}
      <DashboardJobApplyModal
        isOpen={showApplyJobModal}
        onClose={() => setShowApplyJobModal(false)}
        onSuccess={handleApplyJobSuccess}
      />
    </div>
    </>
  )
}

export default Home
