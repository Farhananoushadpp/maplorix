import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { jobsAPI } from '../services/api'

const JobPost = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    // Job Details (matching backend API field names)
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    category: 'Technology',
    customCategory: '',
    department: '',
    experience: 'Mid Level',

    // Contact Information
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactTitle: '',

    // Company Information
    companyWebsite: '',
    companySize: '',
    companyIndustry: '',
    companyDescription: '',

    // Work Location
    workLocationType: 'On-site',

    // Salary Information
    salaryMin: '',
    salaryMax: '',
    salaryType: 'Annual',
    currency: 'AED', // Default to AED as required

    // Job Content
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    skills: '',

    // Application Details
    applicationDeadline: '',
    applicationMethod: 'Email',
    applicationEmail: '',
    applicationUrl: '',

    // Additional Info
    tags: '',
    featured: false,
    urgent: false,
    status: 'active', // Active by default
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  const jobTypeOptions = [
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Contract-to-hire', label: 'Contract-to-hire' },
    { value: 'Internship', label: 'Internship' },
    { value: 'Temporary', label: 'Temporary' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Hybrid', label: 'Hybrid' },
  ]

  const categoryOptions = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Education', label: 'Education' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Design', label: 'Design' },
    { value: 'Customer Service', label: 'Customer Service' },
    { value: 'Human Resources', label: 'Human Resources' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Legal', label: 'Legal' },
    { value: 'Consulting', label: 'Consulting' },
    { value: 'Other', label: 'Other' },
  ]

  const experienceOptions = [
    { value: 'Entry Level', label: 'Entry Level (0-2 years)' },
    { value: 'Junior Level', label: 'Junior Level (2-4 years)' },
    { value: 'Mid Level', label: 'Mid Level (4-6 years)' },
    { value: 'Senior Level', label: 'Senior Level (6-10 years)' },
    { value: 'Lead/Manager', label: 'Lead/Manager (10+ years)' },
    { value: 'Executive', label: 'Executive (15+ years)' },
  ]

  const companySizeOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000+', label: '1000+ employees' },
  ]

  const workLocationOptions = [
    { value: 'On-site', label: 'On-site' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Hybrid', label: 'Hybrid' },
  ]

  const salaryTypeOptions = [
    { value: 'Annual', label: 'Annual Salary' },
    { value: 'Hourly', label: 'Hourly Rate' },
    { value: 'Monthly', label: 'Monthly Salary' },
    { value: 'Project-based', label: 'Project-based' },
    { value: 'Commission', label: 'Commission-based' },
  ]

  const currencyOptions = [
    { value: 'AED', label: 'AED - UAE Dirham' }, // Default currency
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'INR', label: 'INR - Indian Rupee' },
  ]

  const applicationMethodOptions = [
    { value: 'Email', label: 'Email Application' },
    { value: 'Website', label: 'Company Website' },
    { value: 'Platform', label: 'Apply on Platform' },
    { value: 'Both', label: 'Email + Platform' },
  ]

  const validateForm = () => {
    const newErrors = {}

    // Required fields that actually exist in the form
    if (!formData.company?.trim()) {
      newErrors.company = 'Company name is required'
    }

    // Contact Information Validation
    if (
      !formData.contactName?.trim() ||
      formData.contactName.trim().length < 2
    ) {
      newErrors.contactName = 'Contact name is required (at least 2 characters)'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (
      !formData.contactEmail?.trim() ||
      !emailRegex.test(formData.contactEmail)
    ) {
      newErrors.contactEmail = 'Please enter a valid email address'
    }

    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    if (
      !formData.contactPhone?.trim() ||
      !phoneRegex.test(formData.contactPhone) ||
      formData.contactPhone.replace(/\D/g, '').length < 10
    ) {
      newErrors.contactPhone =
        'Please enter a valid phone number (at least 10 digits)'
    }

    if (!formData.location?.trim()) {
      newErrors.location = 'Job location is required'
    }

    if (!formData.title?.trim()) {
      newErrors.title = 'Job title is required'
    }

    // Custom Category Validation
    if (formData.category === 'Other' && !formData.customCategory?.trim()) {
      newErrors.customCategory =
        'Please specify category when Other is selected'
    }

    // Job Content Validation
    if (
      !formData.description?.trim() ||
      formData.description.trim().length < 50
    ) {
      newErrors.description =
        'Job description is required (at least 50 characters)'
    }

    if (
      !formData.requirements?.trim() ||
      formData.requirements.trim().length < 20
    ) {
      newErrors.requirements =
        'Job requirements are required (at least 20 characters)'
    }

    // Optional website validation (only if provided)
    if (formData.companyWebsite && !isValidUrl(formData.companyWebsite)) {
      newErrors.companyWebsite = 'Please enter a valid website URL'
    }

    // Optional salary validation (only if both provided)
    if (
      formData.salaryMin &&
      formData.salaryMax &&
      parseFloat(formData.salaryMin) > parseFloat(formData.salaryMax)
    ) {
      newErrors.salaryMax = 'Maximum salary must be greater than minimum salary'
    }

    // Currency validation - must be AED
    if (formData.currency !== 'AED') {
      newErrors.currency = 'Currency must be AED'
    }

    return newErrors
  }

  const isValidUrl = (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('JobPost form submission started')

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors:', newErrors)
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')
    setUploadProgress(0)

    try {
      // Prepare job data matching backend API expectations
      const jobData = {
        // Required fields
        title: formData.title,
        location: formData.location,
        postedBy: user?.role === 'admin' ? 'admin' : 'user', // Determine if user or admin

        // Optional fields
        company: formData.company || 'Maplorix',
        type: formData.type || 'Full-time',
        description: formData.description || '',
      }

      console.log('Submitting job data:', jobData)
      console.log('Currency in payload:', jobData.currency) // Verify currency is AED

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      // Call the API
      console.log('Calling jobsAPI.createJob...')
      const response = await jobsAPI.createJob(jobData)
      console.log('API response:', response)

      clearInterval(progressInterval)
      setUploadProgress(100)

      setSubmitMessage('🎉 Job posted successfully')

      // Dispatch jobPosted event for real-time Dashboard update
      console.log('Checking response structure:', response)
      console.log('response.data:', response.data)
      console.log('response itself:', response)

      // Check multiple possible response structures for the job
      let responseJobData = null

      if (response.data?.job) {
        responseJobData = response.data.job
        console.log('📋 Found job in response.data.job')
      } else if (response.data) {
        responseJobData = response.data.job || response.data
        console.log('📋 Found job in response.data')
      } else if (response.job) {
        responseJobData = response.job
        console.log('📋 Found job in response.job')
      } else if (response._id || response.title) {
        responseJobData = response
        console.log('📋 Response itself is the job')
      }

      if (responseJobData) {
        const jobEvent = new CustomEvent('jobPosted', {
          detail: {
            job: responseJobData,
            timestamp: new Date().toISOString(),
          },
        })
        window.dispatchEvent(jobEvent)
        console.log('📋 Dispatched jobPosted event:', responseJobData)
      } else {
        console.log('❌ No job found in response, skipping event dispatch')
        console.log(
          '❌ Full response structure:',
          JSON.stringify(response, null, 2)
        )
      }

      // Store in sessionStorage for persistence
      if (response.data?.job) {
        const recentJobs = JSON.parse(
          sessionStorage.getItem('recentJobs') || '[]'
        )
        recentJobs.unshift({
          ...response.data.job,
          postedAt: new Date().toISOString(),
        })
        // Keep only last 5 jobs
        const limitedJobs = recentJobs.slice(0, 5)
        sessionStorage.setItem('recentJobs', JSON.stringify(limitedJobs))
      }

      // Auto-scroll to top for success message visibility
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })

      // Reset form
      setFormData({
        title: '',
        company: '',
        location: '',
        type: 'Full-time',
        category: 'Technology',
        customCategory: '',
        department: '',
        experience: 'Mid Level',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        contactTitle: '',
        companyWebsite: '',
        companySize: '',
        companyIndustry: '',
        companyDescription: '',
        workLocationType: 'On-site',
        salaryMin: '',
        salaryMax: '',
        salaryType: 'Annual',
        currency: 'AED', // Reset to AED default
        description: '',
        requirements: '',
        responsibilities: '',
        benefits: '',
        skills: '',
        applicationDeadline: '',
        applicationMethod: 'Email',
        applicationEmail: '',
        applicationUrl: '',
        tags: '',
        featured: false,
        urgent: false,
      })

      // Redirect to dashboard after successful submission
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)

      setErrors({})
      setUploadProgress(0)

      // Clear success message after 8 seconds
      setTimeout(() => {
        setSubmitMessage('')
      }, 8000)
    } catch (error) {
      console.error('Error posting job:', error)
      setSubmitMessage(
        error.response?.data?.message ||
          '❌ Sorry, there was an error posting your job. Please try again.'
      )
      setUploadProgress(0)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      id="resume-upload"
      className="py-16 sm:py-20 bg-gradient-to-br from-primary/5 to-secondary/10 pt-20"
    >
      <div className="container px-4">
        <div className="section-header">
          <h2 className="section-title">Post a Job Opportunity</h2>
          <div className="divider"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Page Title & Description */}
          <div className="text-center mb-12">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary shadow-custom mb-4">
              <i className="fas fa-briefcase text-accent text-2xl"></i>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-primary mb-4 font-heading">
              Post a Job Opportunity
            </h3>
            <p className="text-text-light max-w-2xl mx-auto text-base sm:text-lg">
              Create a job listing and find the perfect candidate for your
              organization. Fill in the details below to post your job
              opportunity.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-custom p-6 sm:p-8">
            {submitMessage && (
              <div
                className={`mb-6 p-4 rounded-lg text-center ${
                  submitMessage.includes('🎉')
                    ? 'bg-secondary/10 border border-secondary/20 text-secondary'
                    : 'bg-red-50 border border-red-200 text-red-600'
                }`}
              >
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information Section */}
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-1 bg-secondary rounded-full mr-3"></div>
                  <h4 className="text-xl font-bold text-primary">
                    Contact Information
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="contactName"
                      className="block text-sm font-semibold text-text-dark mb-2"
                    >
                      Your Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-user text-text-light"></i>
                      </div>
                      <input
                        type="text"
                        id="contactName"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-primary placeholder-text-light transition-colors ${
                          errors.contactName
                            ? 'border-error'
                            : 'border-border-color'
                        }`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.contactName && (
                      <p className="text-error text-sm mt-1 flex items-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.contactName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contactEmail"
                      className="block text-sm font-semibold text-text-dark mb-2"
                    >
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-envelope text-text-light"></i>
                      </div>
                      <input
                        type="email"
                        id="contactEmail"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-primary placeholder-text-light transition-colors ${
                          errors.contactEmail
                            ? 'border-error'
                            : 'border-border-color'
                        }`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.contactEmail && (
                      <p className="text-error text-sm mt-1 flex items-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.contactEmail}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contactPhone"
                      className="block text-sm font-semibold text-text-dark mb-2"
                    >
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-phone text-text-light"></i>
                      </div>
                      <input
                        type="tel"
                        id="contactPhone"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 123-4567"
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-primary placeholder-text-light transition-colors ${
                          errors.contactPhone
                            ? 'border-error'
                            : 'border-border-color'
                        }`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.contactPhone && (
                      <p className="text-error text-sm mt-1 flex items-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.contactPhone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-semibold text-text-dark mb-2"
                    >
                      Location *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-map-marker-alt text-text-light"></i>
                      </div>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="City, State/Country"
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-primary placeholder-text-light transition-colors ${
                          errors.location
                            ? 'border-error'
                            : 'border-border-color'
                        }`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.location && (
                      <p className="text-error text-sm mt-1 flex items-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Details Section */}
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-1 bg-accent rounded-full mr-3"></div>
                  <h4 className="text-xl font-bold text-primary">
                    Job Details
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="jobTitle"
                      className="block text-sm font-semibold text-text-dark mb-2"
                    >
                      Job Title *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-briefcase text-text-light"></i>
                      </div>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Software Developer"
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-primary placeholder-text-light transition-colors ${
                          errors.title ? 'border-error' : 'border-border-color'
                        }`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.title && (
                      <p className="text-error text-sm mt-1 flex items-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-semibold text-text-dark mb-2"
                    >
                      Company Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-building text-text-light"></i>
                      </div>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="e.g., Tech Corp"
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-primary placeholder-text-light transition-colors ${
                          errors.company
                            ? 'border-error'
                            : 'border-border-color'
                        }`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.company && (
                      <p className="text-error text-sm mt-1 flex items-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.company}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="jobType"
                      className="block text-sm font-semibold text-text-dark mb-2"
                    >
                      Job Type *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-clock text-text-light"></i>
                      </div>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-primary appearance-none bg-white transition-colors ${
                          errors.type ? 'border-error' : 'border-border-color'
                        }`}
                        disabled={isSubmitting}
                      >
                        {jobTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.type && (
                      <p className="text-error text-sm mt-1 flex items-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.type}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-semibold text-text-dark mb-2"
                    >
                      Category *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-tags text-text-light"></i>
                      </div>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-primary appearance-none bg-white transition-colors ${
                          errors.category
                            ? 'border-error'
                            : 'border-border-color'
                        }`}
                        disabled={isSubmitting}
                      >
                        {categoryOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.category && (
                      <p className="text-error text-sm mt-1 flex items-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.category}
                      </p>
                    )}
                  </div>

                  {/* Custom Category Field - Show when Other is selected */}
                  {formData.category === 'Other' && (
                    <div>
                      <label
                        htmlFor="customCategory"
                        className="block text-sm font-semibold text-text-dark mb-2"
                      >
                        Specify Category *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-tag text-text-light"></i>
                        </div>
                        <input
                          type="text"
                          id="customCategory"
                          name="customCategory"
                          value={formData.customCategory}
                          onChange={handleInputChange}
                          placeholder="e.g., Hospitality, Retail, Construction"
                          className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-primary placeholder-text-light transition-colors ${
                            errors.customCategory
                              ? 'border-error'
                              : 'border-border-color'
                          }`}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.customCategory && (
                        <p className="text-error text-sm mt-1 flex items-center">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {errors.customCategory}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="department"
                      className="block text-sm font-semibold text-text-dark mb-2"
                    >
                      Department
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-sitemap text-text-light"></i>
                      </div>
                      <input
                        type="text"
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        placeholder="e.g., Engineering, Marketing, Sales"
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-primary placeholder-text-light transition-colors ${
                          errors.department
                            ? 'border-error'
                            : 'border-border-color'
                        }`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.department && (
                      <p className="text-error text-sm mt-1 flex items-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.department}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="experience"
                      className="block text-sm font-semibold text-text-dark mb-2"
                    >
                      Experience Level *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-chart-line text-text-light"></i>
                      </div>
                      <select
                        id="experience"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-primary appearance-none bg-white transition-colors ${
                          errors.experience
                            ? 'border-error'
                            : 'border-border-color'
                        }`}
                        disabled={isSubmitting}
                      >
                        {experienceOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.experience && (
                      <p className="text-error text-sm mt-1 flex items-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.experience}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="salaryMin"
                        className="block text-sm font-semibold text-text-dark mb-2"
                      >
                        Minimum Salary (Optional)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-dollar-sign text-text-light"></i>
                        </div>
                        <input
                          type="number"
                          id="salaryMin"
                          name="salaryMin"
                          value={formData.salaryMin}
                          onChange={handleInputChange}
                          placeholder="e.g., 80000"
                          className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-primary placeholder-text-light transition-colors ${
                            errors.salaryMin
                              ? 'border-error'
                              : 'border-border-color'
                          }`}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.salaryMin && (
                        <p className="text-error text-sm mt-1 flex items-center">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {errors.salaryMin}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="salaryMax"
                        className="block text-sm font-semibold text-text-dark mb-2"
                      >
                        Maximum Salary (Optional)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-dollar-sign text-text-light"></i>
                        </div>
                        <input
                          type="number"
                          id="salaryMax"
                          name="salaryMax"
                          value={formData.salaryMax}
                          onChange={handleInputChange}
                          placeholder="e.g., 120000"
                          className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-primary placeholder-text-light transition-colors ${
                            errors.salaryMax
                              ? 'border-error'
                              : 'border-border-color'
                          }`}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.salaryMax && (
                        <p className="text-error text-sm mt-1 flex items-center">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {errors.salaryMax}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="salaryType"
                        className="block text-sm font-semibold text-text-dark mb-2"
                      >
                        Salary Type
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-money-bill text-text-light"></i>
                        </div>
                        <select
                          id="salaryType"
                          name="salaryType"
                          value={formData.salaryType}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-primary appearance-none bg-white transition-colors ${
                            errors.salaryType
                              ? 'border-error'
                              : 'border-border-color'
                          }`}
                          disabled={isSubmitting}
                        >
                          {salaryTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.salaryType && (
                        <p className="text-error text-sm mt-1 flex items-center">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {errors.salaryType}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label
                      htmlFor="description"
                      className="block text-sm font-semibold text-text-dark mb-2"
                    >
                      Job Description *
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <i className="fas fa-file-alt text-text-light"></i>
                      </div>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Provide a detailed description of the role, responsibilities, and what the candidate will be doing..."
                        rows={4}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-vertical text-primary placeholder-text-light transition-colors ${
                          errors.description
                            ? 'border-error'
                            : 'border-border-color'
                        }`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.description && (
                      <p className="text-error text-sm mt-1 flex items-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="requirements"
                      className="block text-sm font-semibold text-text-dark mb-2"
                    >
                      Requirements *
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <i className="fas fa-clipboard-check text-text-light"></i>
                      </div>
                      <textarea
                        id="requirements"
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleInputChange}
                        placeholder="List the required qualifications, skills, and experience..."
                        rows={3}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-vertical text-primary placeholder-text-light transition-colors ${
                          errors.requirements
                            ? 'border-error'
                            : 'border-border-color'
                        }`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.requirements && (
                      <p className="text-error text-sm mt-1 flex items-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.requirements}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="applicationDeadline"
                      className="block text-sm font-semibold text-text-dark mb-2"
                    >
                      Application Deadline (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-calendar-alt text-text-light"></i>
                      </div>
                      <input
                        type="date"
                        id="applicationDeadline"
                        name="applicationDeadline"
                        value={formData.applicationDeadline}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-primary transition-colors ${
                          errors.applicationDeadline
                            ? 'border-error'
                            : 'border-border-color'
                        }`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.applicationDeadline && (
                      <p className="text-error text-sm mt-1 flex items-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.applicationDeadline}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-1 bg-accent rounded-full mr-3"></div>
                  <h4 className="text-xl font-bold text-primary">
                    Additional Information
                  </h4>
                </div>

                <div>
                  <label
                    htmlFor="skills"
                    className="block text-sm font-semibold text-text-dark mb-2"
                  >
                    Required Skills (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <i className="fas fa-tools text-text-light"></i>
                    </div>
                    <textarea
                      id="skills"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      placeholder="List required skills separated by commas (e.g., JavaScript, React, Node.js, MongoDB)"
                      rows={3}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-vertical text-primary placeholder-text-light transition-colors ${
                        errors.skills ? 'border-error' : 'border-border-color'
                      }`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.skills && (
                    <p className="text-error text-sm mt-1 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.skills}
                    </p>
                  )}
                </div>
              </div>

              {/* Privacy Note / Consent */}
              <div className="bg-gradient-to-r from-primary/5 to-secondary/10 p-6 rounded-xl border border-primary/20">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <i className="fas fa-shield-alt text-primary text-xl mt-1"></i>
                  </div>
                  <div className="ml-4">
                    <h5 className="text-lg font-semibold text-primary mb-2">
                      Privacy Note
                    </h5>
                    <p className="text-sm text-text-light leading-relaxed">
                      By posting this job, you confirm that you have the
                      authority to recruit for this position. Maplorix will use
                      this information to connect you with qualified candidates
                      and will not share your data with third parties without
                      your consent.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg sm:text-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {uploadProgress > 0
                        ? `Posting... ${uploadProgress}%`
                        : 'Posting...'}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <i className="fas fa-paper-plane mr-2"></i>
                      Post Job
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default JobPost
