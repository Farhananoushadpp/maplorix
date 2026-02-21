import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import Hero from '../components/Hero'
import About from '../components/About'
import Contact from '../components/Contact'
import DashboardJobPostModal from '../components/DashboardJobPostModal'
import DashboardJobApplyModal from '../components/DashboardJobApplyModal'

import { useAuth } from '../context/AuthContext'
import { applicationsAPI, jobsAPI } from '../services/api'

const Home = () => {
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [showPostJobModal, setShowPostJobModal] = useState(false)
  const [showApplyJobModal, setShowApplyJobModal] = useState(false)
  const [availableJobs, setAvailableJobs] = useState([])

  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Post Job Form State

  const [postJobData, setPostJobData] = useState({
    title: '',

    company: '',

    location: '',

    type: 'Full-time',

    category: 'Technology',

    experience: 'Mid Level',

    description: '',

    requirements: '',

    salary: {
      min: '',

      max: '',

      currency: 'AED',
    },

    applicationDeadline: '',

    featured: false,

    active: true,
  })

  const [postJobErrors, setPostJobErrors] = useState({})

  const [isPostJobLoading, setIsPostJobLoading] = useState(false)

  const [postJobSuccess, setPostJobSuccess] = useState(false)

  const jobTypes = [
    'Full-time',
    'Part-time',
    'Contract',
    'Internship',
    'Remote',
    'Hybrid',
  ]

  const categories = [
    'Technology',
    'Healthcare',
    'Finance',
    'Marketing',
    'Sales',
    'Education',
    'Engineering',
    'Design',
    'Customer Service',
    'Human Resources',
    'Operations',
    'Legal',
    'Other',
  ]

  const experienceLevels = [
    'Entry Level',
    'Mid Level',
    'Senior Level',
    'Executive',
    'Fresher',
  ]

  const currencies = ['AED', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR']

  const handlePostJobChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name.includes('.')) {
      const [parent, child] = name.split('.')

      setPostJobData((prev) => ({
        ...prev,

        [parent]: {
          ...prev[parent],

          [child]:
            type === 'number' ? (value === '' ? '' : Number(value)) : value,
        },
      }))
    } else {
      setPostJobData((prev) => ({
        ...prev,

        [name]: type === 'checkbox' ? checked : value,
      }))
    }

    // Clear error for this field when user starts typing

    if (postJobErrors[name]) {
      setPostJobErrors((prev) => ({
        ...prev,

        [name]: '',
      }))
    }
  }

  const validatePostJobForm = () => {
    const newErrors = {}

    if (!postJobData.title.trim()) {
      newErrors.title = 'Job title is required'
    } else if (postJobData.title.length < 3) {
      newErrors.title = 'Job title must be at least 3 characters'
    }

    if (!postJobData.company.trim()) {
      newErrors.company = 'Company name is required'
    }

    if (!postJobData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    if (!postJobData.type) {
      newErrors.type = 'Job type is required'
    }

    if (!postJobData.category) {
      newErrors.category = 'Category is required'
    }

    if (!postJobData.experience) {
      newErrors.experience = 'Experience level is required'
    }

    if (!postJobData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (postJobData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters'
    }

    if (!postJobData.requirements.trim()) {
      newErrors.requirements = 'Requirements are required'
    } else if (postJobData.requirements.length < 20) {
      newErrors.requirements = 'Requirements must be at least 20 characters'
    }

    // Salary validation

    if (postJobData.salary.min && postJobData.salary.max) {
      if (Number(postJobData.salary.min) >= Number(postJobData.salary.max)) {
        newErrors['salary.max'] =
          'Maximum salary must be greater than minimum salary'
      }
    }

    // Date validation

    if (postJobData.applicationDeadline) {
      const deadline = new Date(postJobData.applicationDeadline)

      const today = new Date()

      today.setHours(0, 0, 0, 0)

      if (deadline <= today) {
        newErrors.applicationDeadline =
          'Application deadline must be in the future'
      }
    }

    setPostJobErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handlePostJobSubmit = async (e) => {
    e.preventDefault()

    if (!validatePostJobForm()) {
      return
    }

    setIsPostJobLoading(true)

    try {
      // Transform data to match dashboard expectations (flatten salary)
      const newJob = {
        _id: `home-job-${Date.now()}`, // Unique ID for Home Banner jobs
        title: postJobData.title,
        company: postJobData.company,
        location: postJobData.location,
        type: postJobData.type,
        category: postJobData.category,
        experience: postJobData.experience,
        description: postJobData.description,
        requirements: postJobData.requirements,
        salaryMin: postJobData.salary.min
          ? parseFloat(postJobData.salary.min)
          : undefined,
        salaryMax: postJobData.salary.max
          ? parseFloat(postJobData.salary.max)
          : undefined,
        currency: postJobData.salary.currency || 'AED',
        applicationDeadline: postJobData.applicationDeadline || undefined,
        featured: postJobData.featured,
        active: true,
        postedDate: new Date(),
        createdAt: new Date().toISOString(),
        source: 'homeBanner', // Mark as Home Banner job
      }

      // Store immediately in dashboard_jobs sessionStorage - completely isolated
      const existingJobs = JSON.parse(
        sessionStorage.getItem('dashboard_jobs') || '[]'
      )
      existingJobs.unshift(newJob) // Add to beginning
      sessionStorage.setItem('dashboard_jobs', JSON.stringify(existingJobs))
      console.log(
        '📋 Home: Stored job directly in dashboard_jobs sessionStorage'
      )

      // Dispatch event to update Dashboard immediately
      console.log('📋 Home dispatching jobPosted event with job:', newJob)

      try {
        window.dispatchEvent(
          new CustomEvent('jobPosted', {
            detail: { job: newJob },
          })
        )
        console.log('📋 Home jobPosted event dispatched successfully')
      } catch (error) {
        console.error('Error dispatching jobPosted event:', error)
      }

      setPostJobSuccess(true)

      // Auto-scroll to top for success message visibility
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })

      // Close modal after 2 seconds (stay on current page)
      setTimeout(() => {
        setShowPostJobModal(false)
        setPostJobSuccess(false)
      }, 2000)

      // Reset form
      setPostJobData({
        title: '',
        company: '',
        location: '',
        type: 'Full-time',
        category: 'Technology',
        experience: 'Mid Level',
        description: '',
        requirements: '',
        salary: {
          min: '',
          max: '',
          currency: 'AED',
        },
        applicationDeadline: '',
        featured: false,
        active: true,
      })

      setPostJobErrors({})
    } catch (error) {
      setPostJobErrors({
        submit: error.message || 'Failed to post job. Please try again.',
      })
    } finally {
      setIsPostJobLoading(false)
    }
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

  const [formData, setFormData] = useState({
    // Personal Information (Required)
    fullName: '',
    email: '',
    phone: '',
    location: '',

    // Professional Information (Required)
    jobRole: '', // Changed from jobTitle to match backend
    experience: 'Mid Level', // Matches backend enum
    skills: '',
    currentCompany: '', // Added from backend
    currentDesignation: '', // Added from backend

    // Salary Information (Optional)
    expectedSalary: {
      min: '',
      max: '',
      currency: 'USD', // Default from backend
    },

    // Additional Information (Optional)
    noticePeriod: '30 days', // Default from backend
    job: '', // Job ID reference (optional)
    resume: null, // Resume file (optional)
  })

  const [errors, setErrors] = useState({})

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [uploadProgress, setUploadProgress] = useState(0)

  const [successMessage, setSuccessMessage] = useState('')

  // Dashboard Job Post and Apply handlers
  const handlePostJobSuccess = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 5000)
  }

  const handleApplyJobSuccess = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 5000)
  }

  // Fetch available jobs for the application form

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await jobsAPI.getAllJobs({ limit: 20 })

        // Handle multiple possible response structures
        let jobsData = []
        if (response.data?.jobs) {
          jobsData = response.data.jobs
        } else if (response.data) {
          jobsData = response.data.jobs || response.data
        } else if (response.jobs) {
          jobsData = response.jobs
        } else if (Array.isArray(response)) {
          jobsData = response
        }

        setAvailableJobs(jobsData)
      } catch (error) {
        console.error('Error fetching jobs:', error)
        setAvailableJobs([])
      }
    }

    fetchJobs()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, files } = e.target

    if (type === 'file') {
      setFormData((prev) => ({
        ...prev,

        [name]: files[0],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,

        [name]: value,
      }))
    }

    // Clear error for this field

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,

        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    if (!formData.jobRole.trim()) {
      newErrors.jobRole = 'Job role is required'
    }

    // Job selection is optional - remove validation
    // if (!formData.job) {
    //   newErrors.job = 'Please select a job to apply for'
    // }

    // Skills is optional in backend - remove validation
    // if (!formData.skills.trim()) {
    //   newErrors.skills = 'Skills are required'
    // }

    // Resume is optional - remove validation
    // if (!formData.resume) {
    //   newErrors.resume = 'Resume file is required'
    // } else if (
    //   !formData.resume.name.toLowerCase().endsWith('.pdf') &&
    //   !formData.resume.name.toLowerCase().endsWith('.doc') &&
    //   !formData.resume.name.toLowerCase().endsWith('.docx')
    // ) {
    //   newErrors.resume = 'Please upload a PDF, DOC, or DOCX file'
    // }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      let response

      // Only use FormData if there's a resume file
      if (formData.resume) {
        // Create FormData for file upload
        const formDataToSend = new FormData()

        // Add all form fields with correct field names for backend
        formDataToSend.append('fullName', formData.fullName)
        formDataToSend.append('email', formData.email)
        formDataToSend.append('phone', formData.phone)
        formDataToSend.append('location', formData.location)
        formDataToSend.append('jobRole', formData.jobRole)
        formDataToSend.append('job', formData.job)
        formDataToSend.append('experience', formData.experience)
        formDataToSend.append('skills', formData.skills)
        formDataToSend.append('currentCompany', formData.currentCompany)
        formDataToSend.append('currentDesignation', formData.currentDesignation)

        // Handle expectedSalary as JSON string
        if (formData.expectedSalary) {
          formDataToSend.append(
            'expectedSalary',
            JSON.stringify(formData.expectedSalary)
          )
        }

        formDataToSend.append('noticePeriod', formData.noticePeriod)
        formDataToSend.append('captchaToken', 'development-bypass')
        formDataToSend.append('resume', formData.resume)

        console.log('Submitting application with file upload:')
        for (let [key, value] of formDataToSend.entries()) {
          console.log(
            `${key}:`,
            value instanceof File ? `File: ${value.name}` : value
          )
        }

        response = await applicationsAPI.createApplication(formDataToSend)
      } else {
        // Send as regular JSON without file upload
        const applicationData = {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          jobRole: formData.jobRole,
          job: formData.job,
          experience: formData.experience,
          skills: formData.skills,
          currentCompany: formData.currentCompany,
          currentDesignation: formData.currentDesignation,
          expectedSalary: formData.expectedSalary,
          noticePeriod: formData.noticePeriod,
          captchaToken: 'development-bypass',
        }

        console.log(
          'Submitting application without file upload:',
          applicationData
        )
        response = await applicationsAPI.createApplication(applicationData)
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      clearInterval(progressInterval)
      setUploadProgress(100)
      setSuccessMessage(
        'Your application has been successfully submitted! We will contact you soon.'
      )

      // Auto-scroll to top for success message visibility
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })

      // Dispatch custom event to update Dashboard
      const newApplication = {
        _id: response.data?.data?._id || Date.now().toString(),
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        jobRole: formData.jobRole,
        experience: formData.experience,
        skills: formData.skills,
        currentCompany: formData.currentCompany,
        currentDesignation: formData.currentDesignation,
        expectedSalary: formData.expectedSalary,
        noticePeriod: formData.noticePeriod,
        job: formData.job,
        status: 'submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      console.log('🚀 Dispatching applicationPosted event:', newApplication)
      window.dispatchEvent(
        new CustomEvent('applicationPosted', {
          detail: { application: newApplication },
        })
      )

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        jobRole: '',
        experience: 'Mid Level',
        skills: '',
        currentCompany: '',
        currentDesignation: '',
        expectedSalary: {
          min: '',
          max: '',
          currency: 'USD',
        },
        noticePeriod: '30 days',
        job: '',
        resume: null,
      })

      // Reset file input
      if (e.target.resume) {
        e.target.resume.value = ''
      }

      // Close modal after success
      setTimeout(() => {
        setShowResumeModal(false)
        setUploadProgress(0)
        setSuccessMessage('')
      }, 3000)
    } catch (error) {
      console.error('Application submission error:', error)
      console.error('Error response:', error.response)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)

      let errorMessage = 'Failed to submit application. Please try again.'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }

      setErrors({ submit: errorMessage })
      setUploadProgress(0)
    } finally {
      setIsSubmitting(false)
    }
  }

  const candidateServices = [
    {
      icon: 'fa-search',

      image: '/jobsearch.jpeg',

      title: 'Job Search Assistance',

      description:
        'Personalized job matching based on your skills, experience, and career goals. We connect you with opportunities that align with your aspirations.',
    },

    {
      icon: 'fa-file-alt',

      image: '/resumebuilder.jpeg',

      title: 'Resume Building',

      description:
        'Professional resume optimization to highlight your strengths and stand out to employers. Our experts help you create compelling resumes.',
    },

    {
      icon: 'fa-user-tie',

      image: '/interviewpreparation.jpeg',

      title: 'Interview Preparation',

      description:
        'Comprehensive interview coaching including mock interviews, feedback sessions, and confidence-building techniques to ace your interviews.',
    },

    {
      icon: 'fa-chart-line',

      image: '/careercunseling.jpeg',

      title: 'Career Counseling',

      description:
        'Expert guidance on career path planning, skill development, and professional growth strategies to advance your career effectively.',
    },
  ]

  const employerServices = [
    {
      icon: 'fa-users',

      image: '/talent-acquisition.jpeg',

      title: 'Talent Acquisition',

      description:
        'End-to-end recruitment solutions to find, attract, and hire the best talent for your organization. We handle the entire hiring process.',
    },

    {
      icon: 'fa-filter',

      image: '/candidate-screening.jpeg',

      title: 'Candidate Screening',

      description:
        'Thorough screening and evaluation processes to ensure you get qualified, pre-vetted candidates who match your requirements perfectly.',
    },

    {
      icon: 'fa-handshake',

      image: '/staffing-solutions.jpeg',

      title: 'Staffing Solutions',

      description:
        'Flexible staffing options including temporary, permanent, and contract placements to meet your dynamic business needs.',
    },

    {
      icon: 'fa-briefcase',

      image: '/executive-search.jpeg',

      title: 'Executive Search',

      description:
        'Specialized executive recruitment for senior-level positions and leadership roles with confidentiality and precision.',
    },
  ]

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

              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-primary">
                  Ready to Transform Your Career?
                </h2>

                <p className="text-lg sm:text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
                  Discover personalized solutions designed to accelerate your
                  professional growth and land your dream job
                </p>

                <div className="w-24 h-1 bg-gradient-to-r from-secondary to-accent mx-auto rounded-full mt-6"></div>
              </div>

              {/* Services Grid */}

              <div className="space-y-8">
                {candidateServices.map((service, index) => (
                  <div key={index} className="group relative">
                    {/* Card Background */}

                    <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-accent/5 rounded-2xl transform group-hover:scale-105 transition-all duration-300"></div>

                    <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 lg:p-8 border border-gray-100">
                      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8">
                        {/* Left Side - Image */}

                        <div className="md:w-2/5">
                          <div className="relative overflow-hidden rounded-xl">
                            <img
                              src={service.image}
                              alt={service.title}
                              className="w-full h-48 sm:h-56 md:h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              onError={(e) => {
                                e.target.onerror = null

                                e.target.src = '/placeholder-service.jpg'
                              }}
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                        </div>

                        {/* Right Side - Content */}

                        <div className="md:w-3/5 flex flex-col justify-center">
                          {/* Service Header */}

                          <div className="flex items-center mb-4 sm:mb-6">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-2xl flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-110 transition-transform">
                              <i
                                className={`fas ${service.icon} text-secondary text-lg sm:text-xl`}
                              ></i>
                            </div>

                            <div>
                              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-primary">
                                {service.title}
                              </h3>

                              <div className="flex items-center mt-1">
                                <span className="text-secondary text-xs sm:text-sm font-medium">
                                  Personalized Career Support
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Service Description */}

                          <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                            {service.description}
                          </p>

                          {/* Service Features */}

                          <div className="space-y-2 mb-4 sm:mb-6">
                            <div className="flex items-center text-xs sm:text-sm text-gray-600">
                              <i className="fas fa-check-circle text-secondary mr-2"></i>

                              <span>Personalized approach</span>
                            </div>

                            <div className="flex items-center text-xs sm:text-sm text-gray-600">
                              <i className="fas fa-check-circle text-secondary mr-2"></i>

                              <span>Expert guidance</span>
                            </div>

                            <div className="flex items-center text-xs sm:text-sm text-gray-600">
                              <i className="fas fa-check-circle text-secondary mr-2"></i>

                              <span>Proven results</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom CTA */}

              <div className="text-center mt-12">
                <div className="bg-gradient-to-r from-secondary/10 to-accent/10 rounded-2xl p-8 border border-secondary/20">
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    Ready to Take the Next Step?
                  </h3>

                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Join thousands of professionals who've transformed their
                    careers with our expert guidance and support.
                  </p>

                  <button
                    onClick={() => setShowResumeModal(true)}
                    className="px-8 py-3 bg-gradient-to-r from-secondary to-accent text-primary font-bold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <i className="fas fa-paper-plane mr-2"></i>
                    Start Your Journey
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Services for Employers */}

          <section className="py-20 sm:py-24 bg-gradient-to-br from-accent/5 to-primary/10 relative overflow-hidden">
            {/* Background Elements */}

            <div className="absolute inset-0 z-0">
              <div className="absolute top-10 right-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>

              <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
            </div>

            <div className="container relative z-10 px-4">
              {/* Section Header */}

              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-primary">
                  Looking for Top Talent?
                </h2>

                <p className="text-lg sm:text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
                  Find exceptional candidates who will drive your business
                  forward with our expert recruitment solutions
                </p>

                <div className="w-24 h-1 bg-gradient-to-r from-secondary to-accent mx-auto rounded-full mt-6"></div>
              </div>

              {/* Services Grid */}

              <div className="space-y-8">
                {employerServices.map((service, index) => (
                  <div key={index} className="group relative">
                    {/* Card Background */}

                    <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-secondary/5 rounded-2xl transform group-hover:scale-105 transition-all duration-300"></div>

                    <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 lg:p-8 border border-gray-100">
                      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8">
                        {/* Left Side - Image */}

                        <div className="md:w-2/5">
                          <div className="relative overflow-hidden rounded-xl">
                            <img
                              src={service.image}
                              alt={service.title}
                              className="w-full h-48 sm:h-56 md:h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              onError={(e) => {
                                e.target.onerror = null

                                e.target.src = '/placeholder-service.jpg'
                              }}
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                        </div>

                        {/* Right Side - Content */}

                        <div className="md:w-3/5 flex flex-col justify-center">
                          {/* Service Header */}

                          <div className="flex items-center mb-4 sm:mb-6">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-2xl flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-110 transition-transform">
                              <i
                                className={`fas ${service.icon} text-accent text-lg sm:text-xl`}
                              ></i>
                            </div>

                            <div>
                              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-primary">
                                {service.title}
                              </h3>

                              <div className="flex items-center mt-1">
                                <span className="text-accent text-xs sm:text-sm font-medium">
                                  Expert Hiring Solutions
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Service Description */}

                          <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                            {service.description}
                          </p>

                          {/* Service Features */}

                          <div className="space-y-2 mb-4 sm:mb-6">
                            <div className="flex items-center text-xs sm:text-sm text-gray-600">
                              <i className="fas fa-check-circle text-accent mr-2"></i>

                              <span>End-to-end solutions</span>
                            </div>

                            <div className="flex items-center text-xs sm:text-sm text-gray-600">
                              <i className="fas fa-check-circle text-accent mr-2"></i>

                              <span>Expert recruiters</span>
                            </div>

                            <div className="flex items-center text-xs sm:text-sm text-gray-600">
                              <i className="fas fa-check-circle text-accent mr-2"></i>

                              <span>Quality assurance</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom CTA */}

              <div className="text-center mt-12">
                <div className="bg-gradient-to-r from-accent/10 to-secondary/10 rounded-2xl p-8 border border-accent/20">
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    Ready to Find Your Next Star Player?
                  </h3>

                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Partner with us to access top talent and streamline your
                    hiring process with our proven recruitment strategies.
                  </p>

                  <button
                    onClick={handlePostJobClick}
                    className="px-8 py-3 bg-gradient-to-r from-accent to-secondary text-primary font-bold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <i className="fas fa-briefcase mr-2"></i>
                    Post a Job Now
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Post Job Modal */}

          {showPostJobModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                {/* Background overlay */}

                <div
                  className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                  onClick={() => setShowPostJobModal(false)}
                ></div>

                {/* Modal panel */}

                <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                  {/* Modal Header */}

                  <div className="bg-primary text-white px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-secondary/20 rounded-full p-2 mr-3">
                          <i className="fas fa-briefcase text-secondary"></i>
                        </div>

                        <h2 className="text-xl font-bold">Post a New Job</h2>
                      </div>

                      <button
                        onClick={() => setShowPostJobModal(false)}
                        className="text-white/80 hover:text-white transition-colors"
                      >
                        <i className="fas fa-times text-xl"></i>
                      </button>
                    </div>
                  </div>

                  <div className="px-6 py-6">
                    {/* Success message */}

                    {postJobSuccess && (
                      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex">
                          <i className="fas fa-check-circle text-green-400 mr-3"></i>

                          <div>
                            <h3 className="text-sm font-medium text-green-800">
                              Job Posted Successfully!
                            </h3>

                            <p className="text-sm text-green-700 mt-1">
                              Your job has been posted and is now live.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error message */}

                    {postJobErrors.submit && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex">
                          <i className="fas fa-exclamation-circle text-red-400 mr-3"></i>

                          <div>
                            <h3 className="text-sm font-medium text-red-800">
                              Error
                            </h3>

                            <p className="text-sm text-red-700 mt-1">
                              {postJobErrors.submit}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Post Job Form */}

                    <form onSubmit={handlePostJobSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Job Title */}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Job Title *
                          </label>

                          <input
                            type="text"
                            name="title"
                            value={postJobData.title}
                            onChange={handlePostJobChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                              postJobErrors.title
                                ? 'border-red-300'
                                : 'border-gray-300'
                            }`}
                            placeholder="e.g. Senior Software Developer"
                          />

                          {postJobErrors.title && (
                            <p className="mt-1 text-sm text-red-600">
                              {postJobErrors.title}
                            </p>
                          )}
                        </div>

                        {/* Company */}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name *
                          </label>

                          <input
                            type="text"
                            name="company"
                            value={postJobData.company}
                            onChange={handlePostJobChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                              postJobErrors.company
                                ? 'border-red-300'
                                : 'border-gray-300'
                            }`}
                            placeholder="e.g. Tech Corp"
                          />

                          {postJobErrors.company && (
                            <p className="mt-1 text-sm text-red-600">
                              {postJobErrors.company}
                            </p>
                          )}
                        </div>

                        {/* Location */}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location *
                          </label>

                          <input
                            type="text"
                            name="location"
                            value={postJobData.location}
                            onChange={handlePostJobChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                              postJobErrors.location
                                ? 'border-red-300'
                                : 'border-gray-300'
                            }`}
                            placeholder="e.g. New York, NY"
                          />

                          {postJobErrors.location && (
                            <p className="mt-1 text-sm text-red-600">
                              {postJobErrors.location}
                            </p>
                          )}
                        </div>

                        {/* Job Type */}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Job Type *
                          </label>

                          <select
                            name="type"
                            value={postJobData.type}
                            onChange={handlePostJobChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                              postJobErrors.type
                                ? 'border-red-300'
                                : 'border-gray-300'
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
                <form onSubmit={handleSubmit} className="p-6">
                  {successMessage && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <i className="fas fa-check-circle text-green-400"></i>
                        </div>

                        <div className="ml-3">
                          <p className="text-sm text-green-700">
                            {successMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {errors.submit && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <i className="fas fa-exclamation-circle text-red-400"></i>
                        </div>

                        <div className="ml-3">
                          <p className="text-sm text-red-700">
                            {errors.submit}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Personal Information */}

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-primary mb-4">
                      Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>

                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent ${
                            errors.fullName
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          placeholder="John Doe"
                          disabled={isSubmitting}
                        />

                        {errors.fullName && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.fullName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>

                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="john@example.com"
                          disabled={isSubmitting}
                        />

                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone *
                        </label>

                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent ${
                            errors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="+1 (555) 123-4567"
                          disabled={isSubmitting}
                        />

                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location *
                        </label>

                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent ${
                            errors.location
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          placeholder="New York, NY"
                          disabled={isSubmitting}
                        />

                        {errors.location && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-primary mb-4">
                      Professional Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Job Title *
                        </label>

                        <input
                          type="text"
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent ${
                            errors.jobTitle
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          placeholder="Software Engineer"
                          disabled={isSubmitting}
                        />

                        {errors.jobTitle && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.jobTitle}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Experience Level
                        </label>

                        <select
                          name="experience"
                          value={formData.experience}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                          disabled={isSubmitting}
                        >
                          <option value="Entry Level">Entry Level</option>

                          <option value="Mid Level">Mid Level</option>

                          <option value="Senior Level">Senior Level</option>

                          <option value="Manager">Manager</option>

                          <option value="Director">Director</option>

                          <option value="Executive">Executive</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Apply for Position *
                        </label>

                        <select
                          name="job"
                          value={formData.job}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent ${
                            errors.job ? 'border-red-500' : 'border-gray-300'
                          }`}
                          disabled={isSubmitting}
                        >
                          <option value="">Select a job position</option>

                          {availableJobs.map((job) => (
                            <option key={job._id} value={job._id}>
                              {job.title} at {job.company} - {job.location}
                            </option>
                          ))}
                        </select>

                        {errors.job && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.job}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Skills *
                      </label>

                      <textarea
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        rows={2}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent ${
                          errors.skills ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="JavaScript, React, Node.js, Python, etc."
                        disabled={isSubmitting}
                      />

                      {errors.skills && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.skills}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Resume Upload */}

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-primary mb-4">
                      Resume Upload
                    </h3>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-accent transition-colors">
                      <div className="mb-4">
                        <i className="fas fa-cloud-upload-alt text-3xl text-gray-400"></i>
                      </div>

                      <div className="mb-4">
                        <label className="cursor-pointer">
                          <span className="text-accent font-medium">
                            Click to upload
                          </span>

                          <span className="text-gray-600">
                            {' '}
                            or drag and drop
                          </span>

                          <input
                            type="file"
                            name="resume"
                            onChange={handleChange}
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            disabled={isSubmitting}
                          />
                        </label>
                      </div>

                      <p className="text-sm text-gray-500">
                        PDF, DOC, or DOCX (MAX. 5MB)
                      </p>

                      {formData.resume && (
                        <div className="mt-4 text-sm text-green-600">
                          <i className="fas fa-check-circle mr-2"></i>

                          {formData.resume.name}
                        </div>
                      )}

                      {errors.resume && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.resume}
                        </p>
                      )}
                    </div>

                    {uploadProgress > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Uploading...</span>

                          <span>{uploadProgress}%</span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-accent h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowResumeModal(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-2 bg-secondary hover:bg-secondary/90 text-primary font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane mr-2"></i>
                          Submit Resume
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
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

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {successMessage}
        </div>
      )}
    </div>
  )
}

export default Home
