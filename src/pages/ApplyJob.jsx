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
            className="inline-flex items-center text-text-light hover:text-primary mb-6 transition-colors group"
          >
            <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
            Back to Home
          </button>
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary shadow-custom mb-4">
            <i className="fas fa-file-contract text-accent text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-4 font-heading">
            Job Application
          </h1>
          <p className="text-text-light max-w-2xl mx-auto">
            Join our team! Fill out the form below to apply for a position at
            Maplorix.
          </p>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-8 p-6 bg-gradient-to-r from-secondary/10 to-accent/10 border border-secondary/30 rounded-xl">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-check-circle text-secondary text-3xl mr-4"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary mb-1">
                  Application Submitted Successfully!
                </h3>
                <p className="text-text-light">
                  Thank you for your application. We'll review it and get back
                  to you soon.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Application Form */}
        <div className="bg-white rounded-2xl shadow-custom p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <div className="flex items-center mb-6">
                <div className="h-8 w-1 bg-secondary rounded-full mr-3"></div>
                <h2 className="text-xl font-bold text-primary">
                  Personal Information
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-user text-text-light"></i>
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-primary placeholder-text-light transition-colors bg-white ${
                        errors.firstName
                          ? 'border-error'
                          : 'border-border-color'
                      }`}
                      placeholder="John"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-error flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">
                    Last Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-user text-text-light"></i>
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-primary placeholder-text-light transition-colors ${
                        errors.lastName ? 'border-error' : 'border-border-color'
                      }`}
                      placeholder="Doe"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-error flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-envelope text-text-light"></i>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-primary placeholder-text-light transition-colors ${
                        errors.email ? 'border-error' : 'border-border-color'
                      }`}
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-error flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-phone text-text-light"></i>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-primary placeholder-text-light transition-colors ${
                        errors.phone ? 'border-error' : 'border-border-color'
                      }`}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-error flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-text-dark mb-2">
                    Location *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-map-marker-alt text-text-light"></i>
                    </div>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-primary placeholder-text-light transition-colors ${
                        errors.location ? 'border-error' : 'border-border-color'
                      }`}
                      placeholder="New York, NY"
                    />
                  </div>
                  {errors.location && (
                    <p className="mt-1 text-sm text-error flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.location}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Job Information */}
            <div>
              <div className="flex items-center mb-6">
                <div className="h-8 w-1 bg-accent rounded-full mr-3"></div>
                <h2 className="text-xl font-bold text-primary">
                  Job Information
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">
                    Job Role *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-briefcase text-text-light"></i>
                    </div>
                    <input
                      type="text"
                      name="jobRole"
                      value={formData.jobRole}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-primary placeholder-text-light transition-colors ${
                        errors.jobRole ? 'border-error' : 'border-border-color'
                      }`}
                      placeholder="e.g., Senior Frontend Developer"
                    />
                  </div>
                  {errors.jobRole && (
                    <p className="mt-1 text-sm text-error flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.jobRole}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">
                    Experience Level *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-chart-line text-text-light"></i>
                    </div>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-primary appearance-none bg-white transition-colors ${
                        errors.experience
                          ? 'border-error'
                          : 'border-border-color'
                      }`}
                    >
                      <option value="">Select experience level</option>
                      {experienceLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.experience && (
                    <p className="mt-1 text-sm text-error flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.experience}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-text-dark mb-2">
                    Expected Salary
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-money-bill text-text-light"></i>
                    </div>
                    <input
                      type="text"
                      name="expectedSalary"
                      value={formData.expectedSalary}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border border-border-color rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-primary placeholder-text-light transition-colors"
                      placeholder="$80,000 - $100,000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <div className="flex items-center mb-6">
                <div className="h-8 w-1 bg-accent rounded-full mr-3"></div>
                <h2 className="text-xl font-bold text-primary">
                  Additional Information
                </h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">
                    Resume/CV
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-file-upload text-text-light"></i>
                    </div>
                    <input
                      type="file"
                      name="resume"
                      onChange={handleChange}
                      accept=".pdf,.doc,.docx"
                      className="w-full pl-10 pr-3 py-3 border border-border-color rounded-lg focus:ring-2 focus:ring-primary focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark transition-colors"
                    />
                  </div>
                  <p className="mt-2 text-sm text-text-light flex items-center">
                    <i className="fas fa-info-circle mr-1"></i>
                    Accepted formats: PDF, DOC, DOCX (Max 5MB)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-text-dark mb-2">
                      LinkedIn Profile
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fab fa-linkedin text-text-light"></i>
                      </div>
                      <input
                        type="url"
                        name="linkedinProfile"
                        value={formData.linkedinProfile}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 border border-border-color rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-primary placeholder-text-light transition-colors"
                        placeholder="https://linkedin.com/in/johndoe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-dark mb-2">
                      Portfolio Website
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-globe text-text-light"></i>
                      </div>
                      <input
                        type="url"
                        name="portfolio"
                        value={formData.portfolio}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 border border-border-color rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-primary placeholder-text-light transition-colors"
                        placeholder="https://johndoe.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CAPTCHA Verification */}
            <div className="py-6">
              <div className="flex items-center mb-4">
                <div className="h-8 w-1 bg-secondary rounded-full mr-3"></div>
                <label className="text-sm font-semibold text-primary">
                  Security Verification *
                </label>
              </div>
              <div className="flex flex-col items-center bg-gradient-to-r from-primary/5 to-secondary/10 p-6 rounded-xl border border-primary/20">
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
                  <p className="mt-2 text-sm text-error text-center flex items-center">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {errors.captcha}
                  </p>
                )}
                <p className="mt-3 text-sm text-text-light text-center flex items-center">
                  <i className="fas fa-shield-alt mr-1"></i>
                  Please complete the CAPTCHA to verify you are human.
                </p>
              </div>
            </div>

            {/* Error Display */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-error flex items-center">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-border-color">
              <button
                type="button"
                onClick={handleBackToHome}
                className="px-6 py-3 border border-border-color rounded-lg text-text-dark hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <i className="fas fa-paper-plane mr-2"></i>
                    Submit Application
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ApplyJob
