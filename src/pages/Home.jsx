// Home Page - Maplorix Recruitment Agency Landing Page
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const { fetchJobs, fetchApplications } = useData()
  const navigate = useNavigate()

  // Fetch available jobs for display
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await jobsAPI.getAllJobs()
        setAvailableJobs(response.data?.slice(0, 6) || []) // Show latest 6 jobs
      } catch (error) {
        console.error('Error fetching jobs:', error)
      }
    }

    fetchJobs()
  }, [])

  // Handle successful job posting
  const handlePostJobSuccess = (jobData) => {
    console.log('Job posted successfully:', jobData)

    // Show success message
    setSuccessMessage(`Job "${jobData.title || 'Position'}" posted successfully!`)
    
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
    setSuccessMessage(`Application submitted successfully for "${applicationData.jobRole || 'Position'}"!`)

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
    <div className="min-h-screen bg-white">
      {/* Only render main content when no modals are open */}
      {!showPostJobModal && !showApplyJobModal && !showResumeModal && (
        <main>
          <Hero
            onUploadResume={() => setShowResumeModal(true)}
            onPostJob={handlePostJobClick}
            onFindJob={handleFindJobClick}
          />

          <About />

          {/* Services for Candidates */}
          <section className="py-20 sm:py-24 bg-gradient-to-br from-primary/5 to-secondary/10 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
              <div className="absolute top-10 left-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
            </div>

            <div className="container relative z-10 px-4">
              {/* Section Header */}
              <div className="text-center mb-20">
                <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-2 mb-6">
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                  <span className="text-accent font-semibold text-sm">
                    RECRUITMENT SOLUTIONS
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-primary mb-6">
                  Looking for
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
                    {' '}
                    Top Talent?
                  </span>
                </h2>
                <p className="text-lg text-gray-600 mt-6 max-w-3xl mx-auto leading-relaxed">
                  Transform your hiring process with our AI-powered recruitment
                  platform. Find exceptional candidates who will drive your
                  business forward.
                </p>
              </div>

              {/* Services Grid - Modern Design */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: 'fa-search',
                    title: 'Talent Sourcing',
                    description:
                      'Proactive candidate sourcing across multiple channels to find the perfect match.',
                    features: [
                      'Database Search',
                      'Social Media Recruiting',
                      'Referral Programs',
                    ],
                    gradient: 'from-secondary to-accent',
                    bgGradient: 'from-secondary/10 to-accent/10',
                  },
                  {
                    icon: 'fa-user-tie',
                    title: 'Executive Search',
                    description:
                      'Specialized executive recruitment for senior-level positions with confidentiality.',
                    features: [
                      'C-Level Recruitment',
                      'Board Level Placements',
                      'Confidential Search',
                    ],
                    gradient: 'from-primary to-secondary',
                    bgGradient: 'from-primary/10 to-secondary/10',
                  },
                  {
                    icon: 'fa-chart-line',
                    title: 'Market Intelligence',
                    description:
                      'Comprehensive market analysis and salary benchmarking to inform your strategy.',
                    features: [
                      'Salary Reports',
                      'Market Trends',
                      'Competitive Analysis',
                    ],
                    gradient: 'from-accent to-primary',
                    bgGradient: 'from-accent/10 to-primary/10',
                  },
                ].map((service, index) => (
                  <div
                    key={index}
                    className={`group relative bg-gradient-to-br ${service.bgGradient} rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/50 backdrop-blur-sm`}
                  >
                    {/* Background decoration */}
                    <div
                      className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${service.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}
                    ></div>

                    {/* Icon */}
                    <div
                      className={`relative w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                    >
                      <i
                        className={`fas ${service.icon} text-white text-xl`}
                      ></i>
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-primary mb-4 group-hover:text-accent transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-3">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 bg-gradient-to-br ${service.gradient} rounded-full flex items-center justify-center flex-shrink-0`}
                          >
                            <i className="fas fa-check text-white text-xs"></i>
                          </div>
                          <span className="text-gray-700 text-sm font-medium">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Hover effect */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity pointer-events-none`}
                    ></div>
                  </div>
                ))}
              </div>

              {/* CTA Section */}
              <div className="mt-16 text-center">
                <button
                  onClick={() => {
                    setShowPostJobModal(true)
                  }}
                  className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-secondary to-accent text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <span>Start Hiring Today</span>
                  <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary to-accent rounded-2xl blur-xl opacity-50 group-hover:opacity-70 -z-10"></div>
                </button>
                <p className="text-gray-500 mt-4 text-sm">
                  No upfront costs • Pay only when you hire • 30-day guarantee
                </p>
              </div>
            </div>
          </section>

          {/* Available Jobs Section */}
          <section className="py-20 sm:py-24 bg-gradient-to-br from-gray-50 to-white">
            <div className="container px-4">
              {/* Section Header */}
              <div className="text-center mb-20">
                <div className="inline-flex items-center gap-2 bg-secondary/10 rounded-full px-4 py-2 mb-6">
                  <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                  <span className="text-secondary font-semibold text-sm">
                    CAREER OPPORTUNITIES
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-primary mb-6">
                  Latest
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
                    {' '}
                    Opportunities
                  </span>
                </h2>
                <p className="text-xl text-gray-600 mt-6 max-w-3xl mx-auto leading-relaxed">
                  Discover exciting career opportunities with leading companies
                  that match your skills and aspirations.
                </p>
              </div>

              {/* Jobs Grid - Modern Design */}
              {availableJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {availableJobs.map((job, index) => (
                    <div
                      key={job.id || index}
                      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden"
                    >
                      {/* Header with gradient accent */}
                      <div className="h-2 bg-gradient-to-r from-secondary to-accent"></div>

                      <div className="p-8">
                        {/* Company and Type */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-xl flex items-center justify-center">
                              <i className="fas fa-building text-accent"></i>
                            </div>
                            <div>
                              <p className="font-bold text-primary text-lg">
                                {job.company}
                              </p>
                              <p className="text-sm text-gray-500">
                                {job.type}
                              </p>
                            </div>
                          </div>
                          <div className="bg-accent/10 rounded-full px-3 py-1">
                            <span className="text-accent text-xs font-semibold">
                              NEW
                            </span>
                          </div>
                        </div>

                        {/* Job Title */}
                        <h3 className="text-2xl font-bold text-primary mb-4 group-hover:text-accent transition-colors">
                          {job.title}
                        </h3>

                        {/* Job Details */}
                        <div className="space-y-4 mb-6">
                          <div className="flex items-center gap-3 text-gray-600">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <i className="fas fa-map-marker-alt text-accent text-sm"></i>
                            </div>
                            <span className="text-sm font-medium">
                              {job.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-600">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <i className="fas fa-money-bill text-accent text-sm"></i>
                            </div>
                            <span className="text-sm font-medium">
                              {job.salary 
                                ? typeof job.salary === 'object' 
                                  ? `${job.salary.currency || ''} ${job.salary.min || ''}${job.salary.max ? ` - ${job.salary.max}` : ''}`
                                  : job.salary
                                : 'Not specified'
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-600">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <i className="fas fa-clock text-accent text-sm"></i>
                            </div>
                            <span className="text-sm font-medium">
                              {job.type || job.jobType || 'Full-time'}
                            </span>
                          </div>
                        </div>

                        {/* Apply Button */}
                        <button
                          onClick={() => {
                            setSelectedJob(job)
                            setShowApplyJobModal(true)
                          }}
                          className="w-full group/btn bg-gradient-to-r from-secondary to-accent text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <span>Apply Now</span>
                          <i className="fas fa-arrow-right group-hover/btn:translate-x-1 transition-transform"></i>
                        </button>
                      </div>

                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-briefcase text-gray-400 text-3xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    No positions available
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Check back soon for exciting career opportunities with
                    leading companies.
                  </p>
                  <button
                    onClick={() => {
                      setShowApplyJobModal(true)
                    }}
                    className="bg-gradient-to-r from-secondary to-accent text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Submit Your Resume
                  </button>
                </div>
              )}

              {/* View All Jobs CTA */}
              {availableJobs.length > 0 && (
                <div className="text-center mt-16">
                  <button
                    onClick={() => {
                      navigate('/dashboard')
                    }}
                    className="group inline-flex items-center gap-3 text-primary font-semibold text-lg hover:text-accent transition-colors"
                  >
                    <span>View All Opportunities</span>
                    <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                  </button>
                  <p className="text-gray-500 mt-2 text-sm">
                    {availableJobs.length}+ positions available across multiple
                    industries
                  </p>
                </div>
              )}
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
  )
}

export default Home
