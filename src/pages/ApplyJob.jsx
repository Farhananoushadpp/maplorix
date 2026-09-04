// Job Application Page Component - Maplorix Frontend
import React, { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { applicationsAPI } from '../services/api'
import getFriendlyErrorMessage from '../utils/errorUtils'

const ApplyJob = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const fileInputRef = useRef(null)

  // Check for job context from navigation state
  const jobContext = location.state || {}

  // Exact form state structure (camelCase)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    attachedCv: null,
    nationality: '',
    currentlyLocated: '',
    visaStatus: '',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      }
      if (
        name === 'currentlyLocated' &&
        value !== 'uae' &&
        value !== 'UAE' &&
        value !== 'dubai'
      ) {
        updated.visaStatus = ''
      }
      return updated
    })

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
    if (
      name === 'currentlyLocated' &&
      value !== 'uae' &&
      value !== 'UAE' &&
      value !== 'dubai'
    ) {
      setErrors((prev) => ({
        ...prev,
        visaStatus: '',
      }))
    }
    if (submitError) {
      setSubmitError('')
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          attachedCv: 'File size exceeds 10MB limit. Please upload a smaller file.',
        }))
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      setFormData((prev) => ({
        ...prev,
        attachedCv: file,
      }))

      if (errors.attachedCv) {
        setErrors((prev) => ({
          ...prev,
          attachedCv: '',
        }))
      }
    }
  }

  const handleRemoveFile = () => {
    setFormData((prev) => ({
      ...prev,
      attachedCv: null,
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First Name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile is required'
    }

    if (!formData.attachedCv) {
      newErrors.attachedCv = 'CV is required'
    }

    if (!formData.nationality.trim()) {
      newErrors.nationality = 'Nationality is required'
    }

    if (!formData.currentlyLocated) {
      newErrors.currentlyLocated = 'Currently Located is required'
    }

    // Visa status required only if located in UAE
    if (
      (formData.currentlyLocated === 'uae' ||
        formData.currentlyLocated === 'UAE' ||
        formData.currentlyLocated === 'dubai') &&
      !formData.visaStatus
    ) {
      newErrors.visaStatus = 'Visa Status is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Prevent duplicate submissions
    if (isSubmitting) return

    setSubmitError('')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Create FormData payload for multi-part submission
      const submitData = new FormData()
      submitData.append('firstName', formData.firstName.trim())
      submitData.append('lastName', formData.lastName.trim())
      submitData.append('fullName', `${formData.firstName.trim()} ${formData.lastName.trim()}`)
      submitData.append('email', formData.email.trim())
      submitData.append('mobile', formData.mobile.trim())
      submitData.append('phone', formData.mobile.trim()) // backward compatibility
      
      if (formData.attachedCv) {
        submitData.append('attachedCv', formData.attachedCv)
        submitData.append('resume', formData.attachedCv)
      }

      submitData.append('nationality', formData.nationality.trim())
      submitData.append('currentlyLocated', formData.currentlyLocated)
      submitData.append('visaStatus', formData.visaStatus || '')
      
      const targetJobId = jobContext.jobId || jobContext._id || jobContext.id
      if (targetJobId) {
        submitData.append('job', targetJobId)
        submitData.append('jobId', targetJobId)
      }
      if (jobContext.jobTitle || jobContext.jobRole) {
        submitData.append('jobRole', jobContext.jobTitle || jobContext.jobRole)
        submitData.append('jobTitle', jobContext.jobTitle || jobContext.jobRole)
      }

      const response = await applicationsAPI.createApplication(submitData)
      console.log('Application submitted successfully:', response)

      // Dispatch event to notify Dashboard / App state
      const applicationPayload = {
        _id: response.data?.application?._id || response.data?._id || Date.now().toString(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        mobile: formData.mobile,
        phone: formData.mobile,
        attachedCv: formData.attachedCv ? formData.attachedCv.name : null,
        nationality: formData.nationality,
        currentlyLocated: formData.currentlyLocated,
        visaStatus: formData.visaStatus,
        jobRole: jobContext.jobTitle || jobContext.jobRole || 'General Application',
        status: 'submitted',
        createdAt: new Date().toISOString(),
      }

      window.dispatchEvent(
        new CustomEvent('applicationPosted', {
          detail: { application: applicationPayload },
        })
      )

      // Store in dashboardApplications sessionStorage for persistence
      const dashboardApplications = JSON.parse(
        sessionStorage.getItem('dashboardApplications') || '[]'
      )
      dashboardApplications.unshift(applicationPayload)
      sessionStorage.setItem(
        'dashboardApplications',
        JSON.stringify(dashboardApplications)
      )

      setSubmitSuccess(true)

      // Reset form and navigate after delay
      setTimeout(() => {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          mobile: '',
          attachedCv: null,
          nationality: '',
          currentlyLocated: '',
          visaStatus: '',
        })
        if (fileInputRef.current) fileInputRef.current.value = ''
        setSubmitSuccess(false)
        navigate('/')
      }, 3000)
    } catch (error) {
      console.error('Application submission error:', error)
      const friendlyMessage = getFriendlyErrorMessage(error)
      setSubmitError(friendlyMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            type="button"
            onClick={handleBackToHome}
            className="inline-flex items-center text-text-light hover:text-primary mb-6 transition-colors group"
          >
            <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
            Back to Home
          </button>
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary shadow-custom mb-4">
            <i className="fas fa-file-contract text-accent text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2 font-heading">
            Apply Job
          </h1>
          {jobContext.jobTitle && (
            <p className="text-lg font-se
            mibold text-secondary mb-2">
              Position: {jobContext.jobTitle}
            </p>
          )}
          <p className="text-text-light max-w-lg mx-auto">
            Please fill out the details below to submit your job application.
          </p>
        </div>

        {/* Success Alert */}
        {submitSuccess && (
          <div className="mb-6 p-6 bg-gradient-to-r from-secondary/10 to-accent/10 border border-secondary/30 rounded-xl">
            <div className="flex items-center">
              <i className="fas fa-check-circle text-secondary text-3xl mr-4"></i>
              <div>
                <h3 className="text-lg font-semibold text-secondary mb-1">
                  Job application submitted successfully.
                </h3>
                <p className="text-text-light text-sm">
                  Thank you for your application! Redirecting to home page...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-custom p-8 border border-border-color">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. First Name */}
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-primary transition-colors ${
                  errors.firstName ? 'border-red-500 bg-red-50/20' : 'border-border-color'
                }`}
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* 2. Last Name */}
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-primary transition-colors ${
                  errors.lastName ? 'border-red-500 bg-red-50/20' : 'border-border-color'
                }`}
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {errors.lastName}
                </p>
              )}
            </div>

            {/* 3. Email */}
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-primary transition-colors ${
                  errors.email ? 'border-red-500 bg-red-50/20' : 'border-border-color'
                }`}
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {errors.email}
                </p>
              )}
            </div>

            {/* 4. Mobile */}
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">
                Mobile *
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-primary transition-colors ${
                  errors.mobile ? 'border-red-500 bg-red-50/20' : 'border-border-color'
                }`}
                placeholder="+971 50 123 4567"
              />
              {errors.mobile && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {errors.mobile}
                </p>
              )}
            </div>

            {/* 5. Attach CV */}
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">
                Attach CV *
              </label>
              {!formData.attachedCv ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="attachedCv"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="w-full text-sm text-text-light file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark transition-colors border border-border-color rounded-lg cursor-pointer"
                  />
                  <p className="mt-1 text-xs text-text-light">
                    Accepted formats: PDF, DOC, DOCX (Max 10MB)
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 border border-secondary/40 bg-secondary/5 rounded-lg">
                  <div className="flex items-center space-x-3 truncate">
                    <i className="fas fa-file-pdf text-secondary text-2xl"></i>
                    <div className="truncate">
                      <p className="text-sm font-medium text-primary truncate">
                        {formData.attachedCv.name}
                      </p>
                      <p className="text-xs text-text-light">
                        {(formData.attachedCv.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <i className="fas fa-trash mr-1"></i> Remove
                  </button>
                </div>
              )}
              {errors.attachedCv && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {errors.attachedCv}
                </p>
              )}
            </div>

            {/* 6. Nationality */}
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">
                Nationality *
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-primary transition-colors ${
                  errors.nationality ? 'border-red-500 bg-red-50/20' : 'border-border-color'
                }`}
                placeholder="e.g. Indian, Emirati, etc."
              />
              {errors.nationality && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {errors.nationality}
                </p>
              )}
            </div>

            {/* 7. Currently Located */}
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">
                Currently Located *
              </label>
              <select
                name="currentlyLocated"
                value={formData.currentlyLocated}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-primary bg-white transition-colors ${
                  errors.currentlyLocated ? 'border-red-500 bg-red-50/20' : 'border-border-color'
                }`}
              >
                <option value="">Select location</option>
                <option value="india">India</option>
                <option value="uae">UAE</option>
              </select>
              {errors.currentlyLocated && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {errors.currentlyLocated}
                </p>
              )}
            </div>

            {/* 8. Visa Status (only if currently located in UAE) */}
            {(formData.currentlyLocated === 'uae' ||
              formData.currentlyLocated === 'UAE' ||
              formData.currentlyLocated === 'dubai') && (
              <div>
                <label className="block text-sm font-semibold text-text-dark mb-2">
                  Visa Status *
                </label>
                <select
                  name="visaStatus"
                  value={formData.visaStatus}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-primary bg-white transition-colors ${
                    errors.visaStatus ? 'border-red-500 bg-red-50/20' : 'border-border-color'
                  }`}
                >
                  <option value="">Select visa status</option>
                  <option value="visitVisa">Visit Visa</option>
                  <option value="residenceVisa">Residence Visa</option>
                  <option value="spouseVisa">Spouse Visa</option>
                </select>
                {errors.visaStatus && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {errors.visaStatus}
                  </p>
                )}
              </div>
            )}

            {/* Global Error Display */}
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-medium flex items-center">
                  <i className="fas fa-exclamation-triangle mr-2 text-red-500"></i>
                  {submitError}
                </p>
              </div>
            )}

            {/* 9. Confirm Button */}
            <div className="pt-4 border-t border-border-color flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleBackToHome}
                disabled={isSubmitting}
                className="px-6 py-3 border border-border-color rounded-lg text-text-dark hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
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
                  'Confirm'
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
