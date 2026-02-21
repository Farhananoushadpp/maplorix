// Job Application Page Component - Handles applications from Home Banner and Feed Apply Now
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ReCAPTCHA from 'react-google-recaptcha'
import { applicationsAPI } from '../services/api'

const ApplyJob = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // Google reCAPTCHA site key - replace with your actual site key
  const RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI' // Test key, replace with production key

  // Check for job context from navigation state (Feed Apply Now)
  const jobContext = location.state || {}
  console.log('📋 ApplyJob: Received job context:', jobContext)

  const [formData, setFormData] = useState({
    // Essential Personal Information
    firstName: '',
    lastName: '',
    fullName: '', // Backend requires this field
    email: '',
    phone: '',
    location: '',

    // Essential Professional Information
    jobRole: jobContext.jobTitle || '', // Pre-fill from Feed context
    experience: '',
    skills: '', // Backend expects string, not array
    currentCompany: '',
    currentDesignation: '',
    expectedSalary: {
      min: '',
      max: '',
      currency: 'USD',
    },
    noticePeriod: '30 days',

    // Optional but useful
    resume: null,
    linkedinProfile: '',
    portfolio: '',
    source: jobContext.source || 'website', // Track source: 'adminFeed' or 'website'
    captchaToken: '', // For Google reCAPTCHA

    // Additional context from Feed
    jobCompany: jobContext.company || '',
    jobDescription: jobContext.jobDescription || '',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const experienceLevels = [
    'fresher',
    '1-3',
    '3-5',
    '5+',
    '10+',
    'Entry Level',
    'Mid Level',
    'Senior Level',
    'Executive',
  ]

  const handleChange = (e) => {
    const { name, value, type, files } = e.target

    if (type === 'file') {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }))
    } else {
      setFormData((prev) => {
        const newData = { ...prev, [name]: value }

        // Auto-generate fullName when firstName or lastName changes
        if (name === 'firstName' || name === 'lastName') {
          const first = name === 'firstName' ? value : prev.firstName
          const last = name === 'lastName' ? value : prev.lastName
          newData.fullName = `${first} ${last}`.trim()
        }

        return newData
      })
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

    // Essential Personal Information validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

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

    // Essential Professional Information validation
    if (!formData.jobRole.trim()) {
      newErrors.jobRole = 'Job role is required'
    }

    if (!formData.experience.trim()) {
      newErrors.experience = 'Experience level is required'
    }

    // CAPTCHA validation - optional during development
    if (process.env.NODE_ENV === 'production' && !formData.captchaToken) {
      newErrors.captcha = 'Please complete the CAPTCHA verification'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCaptchaChange = (token) => {
    setFormData((prev) => ({
      ...prev,
      captchaToken: token,
    }))
    // Clear CAPTCHA error when verified
    if (errors.captcha) {
      setErrors((prev) => ({
        ...prev,
        captcha: '',
      }))
    }
  }

  const handleCaptchaError = () => {
    console.warn('reCAPTCHA error occurred')
    setErrors((prev) => ({
      ...prev,
      captcha: 'CAPTCHA verification failed. Please try again.',
    }))
  }

  const handleCaptchaExpired = () => {
    console.warn('reCAPTCHA expired')
    setFormData((prev) => ({
      ...prev,
      captchaToken: '',
    }))
    setErrors((prev) => ({
      ...prev,
      captcha: 'CAPTCHA expired. Please verify again.',
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      let response

      // Only use FormData if there's a resume file
      if (formData.resume) {
        console.log(
          'Resume file detected:',
          formData.resume.name,
          'Type:',
          formData.resume.type,
          'Size:',
          formData.resume.size
        )

        // Create FormData for file upload
        const submitData = new FormData()

        // Add all form fields with correct backend field names
        submitData.append('fullName', formData.fullName)
        submitData.append('email', formData.email)
        submitData.append('phone', formData.phone)
        submitData.append('location', formData.location)
        submitData.append('jobRole', formData.jobRole)
        submitData.append('experience', formData.experience)
        submitData.append('skills', formData.skills)
        submitData.append('currentCompany', formData.currentCompany)
        submitData.append('currentDesignation', formData.currentDesignation)

        // Handle expectedSalary as JSON string
        if (formData.expectedSalary) {
          submitData.append(
            'expectedSalary',
            JSON.stringify(formData.expectedSalary)
          )
        }

        submitData.append('noticePeriod', formData.noticePeriod)
        submitData.append(
          'captchaToken',
          formData.captchaToken || 'development-bypass'
        )
        submitData.append('resume', formData.resume)

        console.log('Submitting application with resume file')
        response = await applicationsAPI.createApplication(submitData)
      } else {
        // Send as JSON without file upload
        const applicationData = {
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
          captchaToken: formData.captchaToken || 'development-bypass',
        }

        console.log(
          'Submitting application without resume file:',
          applicationData
        )
        response = await applicationsAPI.createApplication(applicationData)
      }

      console.log('Application submitted successfully:', response)

      // Dispatch event to notify Dashboard IMMEDIATELY (before any timeout/navigation)
      const applicationData = {
        _id: response.data?.application?._id || Date.now().toString(),
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
        status: 'submitted', // Use valid enum value
        createdAt: new Date().toISOString(),
      }

      console.log('🚀 Dispatching applicationPosted event:', applicationData)
      window.dispatchEvent(
        new CustomEvent('applicationPosted', {
          detail: { application: applicationData },
        })
      )

      // Store in dashboardApplications sessionStorage for persistence - completely isolated
      const dashboardApplications = JSON.parse(
        sessionStorage.getItem('dashboardApplications') || '[]'
      )
      dashboardApplications.unshift({
        ...applicationData,
        submittedAt: new Date().toISOString(),
      })
      sessionStorage.setItem(
        'dashboardApplications',
        JSON.stringify(dashboardApplications)
      )
      console.log(
        '📋 ApplyJob: Stored application in dashboardApplications sessionStorage'
      )

      setSubmitSuccess(true)

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          // Essential Personal Information
          firstName: '',
          lastName: '',
          fullName: '',
          email: '',
          phone: '',
          location: '',

          // Essential Professional Information
          jobRole: '',
          experience: '',
          skills: '',
          currentCompany: '',
          currentDesignation: '',
          expectedSalary: {
            min: '',
            max: '',
            currency: 'USD',
          },
          noticePeriod: '30 days',

          // Optional but useful
          resume: null,
          linkedinProfile: '',
          portfolio: '',
          source: 'website',
          captchaToken: '',

          // Additional context fields
          jobCompany: '',
          jobDescription: '',
        })
        // Reset reCAPTCHA
        if (window.grecaptcha) {
          window.grecaptcha.reset()
        }
        setSubmitSuccess(false)
        navigate('/')
      }, 3000)
    } catch (error) {
      console.error('Application submission error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('Error details:', error.response?.data?.error)
      console.error('Error message:', error.response?.data?.message)
      console.error(
        'Full error object:',
        JSON.stringify(error.response?.data, null, 2)
      )

      setErrors({
        submit:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Failed to submit application. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={handleBackToHome}
            className="inline-flex items-center text-text-light hover:text-primary mb-6 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Home
          </button>
          <h1 className="text-3xl font-bold text-primary mb-4">
            Job Application
          </h1>
          <p className="text-text-light max-w-2xl mx-auto">
            Join our team! Fill out the form below to apply for a position at
            Maplorix.
          </p>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <i className="fas fa-check-circle text-green-500 text-2xl mr-4"></i>
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  Application Submitted Successfully!
                </h3>
                <p className="text-green-600">
                  Thank you for your application. We'll review it and get back
                  to you soon.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Application Form */}
        <div className="bg-white rounded-2xl shadow-custom p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-primary mb-4">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john.doe@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="New York, NY"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.location}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Job Information */}
            <div>
              <h2 className="text-xl font-semibold text-primary mb-4">
                Job Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Job Role *
                  </label>
                  <input
                    type="text"
                    name="jobRole"
                    value={formData.jobRole}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                      errors.jobRole ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Senior Frontend Developer"
                  />
                  {errors.jobRole && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.jobRole}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Experience Level *
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                      errors.experience ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select experience level</option>
                    {experienceLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                  {errors.experience && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.experience}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary mb-2">
                    Expected Salary
                  </label>
                  <input
                    type="text"
                    name="expectedSalary"
                    value={formData.expectedSalary}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="$80,000 - $100,000"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h2 className="text-xl font-semibold text-primary mb-4">
                Additional Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Resume/CV
                  </label>
                  <input
                    type="file"
                    name="resume"
                    onChange={handleChange}
                    accept=".pdf,.doc,.docx"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-text-light">
                    Accepted formats: PDF, DOC, DOCX (Max 5MB)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      name="linkedinProfile"
                      value={formData.linkedinProfile}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                      placeholder="https://linkedin.com/in/johndoe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Portfolio Website
                    </label>
                    <input
                      type="url"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                      placeholder="https://johndoe.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CAPTCHA Verification */}
            <div className="py-4">
              <label className="block text-sm font-medium text-primary mb-4">
                Security Verification *
              </label>
              <div className="flex flex-col items-center">
                <ReCAPTCHA
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={handleCaptchaChange}
                  onErrored={handleCaptchaError}
                  onExpired={handleCaptchaExpired}
                  asyncScriptOnLoad={() => {
                    console.log('reCAPTCHA script loaded')
                  }}
                />
                {errors.captcha && (
                  <p className="mt-2 text-sm text-red-600 text-center">
                    {errors.captcha}
                  </p>
                )}
              </div>
              <p className="mt-2 text-sm text-text-light text-center">
                Please complete the CAPTCHA to verify you are human.
              </p>
            </div>

            {/* Error Display */}
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleBackToHome}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ApplyJob
