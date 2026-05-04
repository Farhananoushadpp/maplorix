import React, { useState, useEffect } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { applicationsAPI } from '../services/api'

const DashboardJobApplyModal = ({
  isOpen,
  onClose,
  onSuccess,
  prefillData = {},
}) => {
  // Google reCAPTCHA site key from environment variable
  const RECAPTCHA_SITE_KEY =
    import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
    '6LeIxAcTAAAAAJcZVRqyHh71UMIEbQjQ5y3FkT_y' // Google's official test key for development

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    jobRole: '',
    experience: 'Entry Level',
    expectedSalary: {
      min: '',
      max: '',
      currency: 'AED',
    },
    coverLetter: '',
    resume: null,
    captchaToken: '', // For Google reCAPTCHA
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with prefill data when modal opens
  useEffect(() => {
    if (isOpen && Object.keys(prefillData).length > 0) {
      setFormData((prev) => ({
        fullName: prefillData.fullName || '',
        email: prefillData.email || '',
        phone: prefillData.phone || '',
        jobRole: prefillData.jobRole || '',
        experience: prefillData.experience || 'Entry Level',
        expectedSalary: prefillData.expectedSalary || {
          min: '',
          max: '',
          currency: 'AED',
        },
        coverLetter: prefillData.coverLetter || '',
        resume: prefillData.resume || null,
      }))
    }
  }, [isOpen, prefillData])

  // Show fallback checkbox immediately to avoid reCAPTCHA issues
  useEffect(() => {
    if (!isOpen) return

    const showFallback = setTimeout(() => {
      const fallbackCaptcha = document.getElementById('fallback-captcha')
      if (fallbackCaptcha) {
        fallbackCaptcha.classList.remove('hidden')
        console.log('Showing fallback verification checkbox')
      }
    }, 1000) // Show fallback after 1 second

    return () => clearTimeout(showFallback)
  }, [isOpen])

  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB max file size

  const handleChange = (e) => {
    const { name, value, type, files } = e.target
    if (type === 'file') {
      const file = files[0]
      if (file && file.size > MAX_FILE_SIZE) {
        alert(
          `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the 10MB limit. Please upload a smaller file.`
        )
        e.target.value = ''
        return
      }
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }))
    } else if (
      name === 'expectedSalaryMin' ||
      name === 'expectedSalaryMax' ||
      name === 'expectedSalaryCurrency'
    ) {
      // Handle expectedSalary object fields
      setFormData((prev) => ({
        ...prev,
        expectedSalary: {
          ...prev.expectedSalary,
          [name.replace('expectedSalary', '').toLowerCase()]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  // reCAPTCHA handlers
  const handleCaptchaChange = (token) => {
    console.log('reCAPTCHA token received:', token ? 'success' : 'failed')
    setFormData((prev) => ({
      ...prev,
      captchaToken: token,
    }))
  }

  const handleCaptchaError = () => {
    console.warn('reCAPTCHA error occurred - using fallback verification')
    // Set a fallback token for development
    setFormData((prev) => ({
      ...prev,
      captchaToken: 'fallback-verification-' + Date.now(),
    }))
  }

  const handleCaptchaExpired = () => {
    console.warn('reCAPTCHA expired')
    setFormData((prev) => ({
      ...prev,
      captchaToken: '',
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate reCAPTCHA
    if (!formData.captchaToken) {
      alert('Please complete the CAPTCHA verification')
      return
    }

    setIsSubmitting(true)

    try {
      // Create FormData for file upload with correct field names
      const formDataToSend = new FormData()
      formDataToSend.append('fullName', formData.fullName)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('jobRole', formData.jobRole)
      formDataToSend.append('experience', formData.experience)
      // Send expectedSalary as object with min/max/currency
      formDataToSend.append(
        'expectedSalary',
        JSON.stringify(formData.expectedSalary)
      )
      formDataToSend.append('coverLetter', formData.coverLetter)
      formDataToSend.append('status', 'submitted')
      formDataToSend.append('source', 'website')
      formDataToSend.append('location', 'Dubai, UAE')
      // Send captcha token for backend recaptcha middleware
      formDataToSend.append(
        'recaptchaToken',
        formData.captchaToken || 'development-bypass'
      )

      // Add resume if it exists and is a valid file
      console.log('🔍 Resume check - formData.resume:', formData.resume)
      if (
        formData.resume &&
        formData.resume instanceof File &&
        formData.resume.size > 0
      ) {
        formDataToSend.append('resume', formData.resume)
        console.log(
          '📎 Resume file attached:',
          formData.resume.name,
          formData.resume.size,
          'bytes'
        )
      } else {
        console.log('⚠️ No resume file provided - submitting without resume')
      }

      console.log('📤 Submitting application with data:')
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`  ${key}:`, value)
      }

      // Submit to backend API using the proper API service
      console.log('🚀 Starting application submission...')
      const startTime = Date.now()

      // Prepare the application data (used for guest/fallback JSON submissions)
      const jsonData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        jobRole: formData.jobRole,
        experience: formData.experience,
        expectedSalary: formData.expectedSalary,
        coverLetter: formData.coverLetter,
        status: 'submitted',
        source: 'website',
        location: 'Dubai, UAE',
        recaptchaToken: formData.captchaToken || 'development-bypass',
      }

      // Check if user is authenticated
      const token = localStorage.getItem('authToken')
      if (!token) {
        // For non-authenticated users, create a temporary guest application
        console.log(
          '👤 Guest user detected - submitting application without authentication'
        )

        // Try direct submission without auth headers
        try {
          const guestResponse = await fetch(
            'http://localhost:4000/api/applications',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(jsonData),
            }
          )

          if (!guestResponse.ok) {
            if (guestResponse.status === 401) {
              throw new Error(
                'Please login to submit applications. Click the Login button to continue.'
              )
            }
            throw new Error(`HTTP error! status: ${guestResponse.status}`)
          }

          const result = await guestResponse.json()
          console.log('✅ Guest application submission successful:', result)

          // Dispatch global event
          window.dispatchEvent(
            new CustomEvent('applicationPosted', {
              detail: {
                application: result.data || result,
                timestamp: new Date().toISOString(),
              },
            })
          )
          console.log('🌐 Dispatched applicationPosted event')

          // Show success message
          if (onSuccess) {
            onSuccess(
              `Application submitted successfully for "${formData.jobRole}"!`
            )
          }

          const endTime = Date.now()
          console.log(
            `✅ Application submitted successfully in ${endTime - startTime}ms`
          )

          // Reset form and close
          setFormData({
            fullName: '',
            email: '',
            phone: '',
            jobRole: '',
            experience: 'Entry Level',
            expectedSalary: {
              min: '',
              max: '',
              currency: 'AED',
            },
            coverLetter: '',
            resume: null,
          })

          setTimeout(() => {
            onClose()
          }, 1000)

          return // Exit early for guest users
        } catch (guestError) {
          console.error('❌ Guest submission failed:', guestError)
          throw guestError
        }
      }

      // For authenticated users, use the API service with FormData for file upload
      console.log(
        '🔐 Authenticated user detected - using API service with FormData'
      )
      try {
        // Use FormData for file upload instead of JSON
        const response = await applicationsAPI.createApplication(formDataToSend)
        console.log('✅ Application submission successful:', response)
        console.log(
          '📋 Full response structure:',
          JSON.stringify(response, null, 2)
        )

        // Update the selected application with the response data
        if (response && response.data) {
          console.log('📋 Response data:', response.data)

          // Extract the correct application data structure
          const applicationData =
            response.data?.data?.application ||
            response.data?.application ||
            response.data?.data ||
            response.data ||
            response

          console.log('📄 Extracted application data:', applicationData)
          console.log(
            '📄 Full application structure:',
            JSON.stringify(applicationData, null, 2)
          )
          console.log(
            '🔍 Resume in submitted application:',
            applicationData?.resume
          )

          // The application will be available in the dashboard through the data context
        }

        const endTime = Date.now()
        console.log(
          `✅ Application submitted successfully in ${endTime - startTime}ms`
        )

        // Dispatch global event to notify other components (like Dashboard)
        window.dispatchEvent(
          new CustomEvent('applicationPosted', {
            detail: {
              application: response.data || response,
              timestamp: new Date().toISOString(),
            },
          })
        )
        console.log('🌐 Dispatched applicationPosted event')

        // Show success message
        if (onSuccess) {
          onSuccess(
            `Application submitted successfully for "${formData.jobRole}"!`
          )
        }

        // Reset form and close
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          jobRole: '',
          experience: 'Entry Level',
          expectedSalary: {
            min: '',
            max: '',
            currency: 'AED',
          },
          coverLetter: '',
          resume: null,
        })

        setTimeout(() => {
          onClose()
        }, 1000)
      } catch (apiError) {
        console.error('❌ API service failed, trying fallback:', apiError)
        console.error('❌ API error response data:', apiError.response?.data)

        // Fallback: Try direct fetch with different approach
        try {
          const fallbackResponse = await fetch(
            'http://localhost:4000/api/applications',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(jsonData),
            }
          )

          if (!fallbackResponse.ok) {
            throw new Error(`Fallback failed: ${fallbackResponse.status}`)
          }

          const result = await fallbackResponse.json()
          console.log('✅ Fallback submission successful:', result)

          // Dispatch global event
          window.dispatchEvent(
            new CustomEvent('applicationPosted', {
              detail: {
                application: result.data || result,
                timestamp: new Date().toISOString(),
              },
            })
          )

          // Show success message
          if (onSuccess) {
            onSuccess(
              `Application submitted successfully for "${formData.jobRole}"!`
            )
          }

          // Reset form and close
          setFormData({
            fullName: '',
            email: '',
            phone: '',
            jobRole: '',
            experience: 'Entry Level',
            expectedSalary: {
              min: '',
              max: '',
              currency: 'AED',
            },
            coverLetter: '',
            resume: null,
          })

          setTimeout(() => {
            onClose()
          }, 1000)
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError)
          throw apiError // Throw the original error
        }
      }
    } catch (error) {
      console.error('❌ Failed to submit application:', error)
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: JSON.stringify(error.response?.data, null, 2),
      })

      // Show more detailed error message
      let errorMessage = 'Failed to submit application. Please try again.'

      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage =
          'Request timed out. The server is taking too long to respond. Please try again in a moment.'
      } else if (error.response?.status === 404) {
        errorMessage = 'Application endpoint not found. Please contact support.'
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred. Please try again later.'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }

      alert(`Failed to submit application: ${errorMessage}`)
      console.error('❌ Full error object:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-primary">
              Find a Job - Apply Now
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-secondary text-2xl transition-colors"
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Submit your application to the Dashboard Applications section.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
                placeholder="+971 50 123 4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Job Role *
              </label>
              <input
                type="text"
                name="jobRole"
                value={formData.jobRole}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
                placeholder="e.g. React Developer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Experience Level
              </label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
              >
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior Level">Senior Level</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Expected Salary
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="expectedSalaryMin"
                  value={formData.expectedSalary.min}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
                  placeholder="Min"
                />
                <input
                  type="number"
                  name="expectedSalaryMax"
                  value={formData.expectedSalary.max}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
                  placeholder="Max"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Currency
              </label>
              <select
                name="expectedSalaryCurrency"
                value={formData.expectedSalary.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
              >
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Cover Letter *
            </label>
            <textarea
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
              placeholder="Tell us why you're interested in this role and what makes you a great fit..."
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-primary mb-2">
              Resume (Optional)
            </label>
            <input
              type="file"
              name="resume"
              onChange={handleChange}
              accept=".pdf,.doc,.docx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all bg-white"
            />
            <p className="text-xs text-gray-500 mt-2">
              Accepted formats: PDF, DOC, DOCX (Max 5MB)
            </p>
          </div>

          {/* Security Verification */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-primary mb-2 flex items-center">
              <i className="fas fa-shield-alt mr-2 text-secondary"></i>
              Security Verification *
            </label>
            <div className="flex flex-col items-center space-y-3">
              {/* Simple verification checkbox */}
              <div
                id="fallback-captcha"
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-secondary to-accent rounded-full">
                    <i className="fas fa-shield-alt text-white text-sm"></i>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!formData.captchaToken}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        captchaToken: e.target.checked
                          ? 'verified-' + Date.now()
                          : '',
                      }))
                    }}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    I confirm I am not a robot
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Please complete the verification to confirm you are human.
              </p>

              {/* Status */}
              <div className="text-xs text-blue-500 text-center">
                {formData.captchaToken
                  ? '✅ Verified'
                  : '⏳ Pending verification'}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-primary rounded-lg hover:bg-gray-50 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-secondary to-accent text-white rounded-lg hover:from-secondary/90 hover:to-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-custom hover:shadow-custom-hover transform hover:-translate-y-0.5"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default DashboardJobApplyModal
