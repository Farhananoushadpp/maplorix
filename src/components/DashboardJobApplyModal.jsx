import React, { useState, useEffect } from 'react'
import { applicationsAPI } from '../services/api'

const DashboardJobApplyModal = ({
  isOpen,
  onClose,
  onSuccess,
  prefillData = {},
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    jobRole: '',
    experience: 'Entry Level',
    expectedSalary: '',
    currency: 'AED',
    coverLetter: '',
    resume: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with prefill data when modal opens
  useEffect(() => {
    if (isOpen && Object.keys(prefillData).length > 0) {
      setFormData((prev) => ({
        ...prev,
        ...prefillData,
      }))
    }
  }, [isOpen, prefillData])

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
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create FormData for file upload with correct field names
      const formDataToSend = new FormData()
      formDataToSend.append('fullName', formData.fullName)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('jobRole', formData.jobRole)
      formDataToSend.append('experience', formData.experience)
      formDataToSend.append('expectedSalary', formData.expectedSalary)
      formDataToSend.append('currency', formData.currency)
      formDataToSend.append('coverLetter', formData.coverLetter)
      formDataToSend.append('status', 'pending')
      formDataToSend.append('source', 'website') // Fixed: use valid backend value
      formDataToSend.append('location', 'Dubai, UAE') // Added back required location field

      // Try alternative field names that backend might expect
      formDataToSend.append('name', formData.fullName) // Backend might also accept 'name'
      formDataToSend.append('position', formData.jobRole) // Backend might expect 'position'

      // Only add resume if it exists and is a valid file - TEMPORARILY DISABLED FOR TESTING
      console.log('🔍 Resume check - formData.resume:', formData.resume)
      if (
        false && // Temporarily disabled
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
        console.log(
          '⚠️ Resume upload temporarily disabled for testing - submitting without resume'
        )
      }

      console.log('📤 Submitting application with data:')
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`  ${key}:`, value)
      }

      // Submit to backend API using the proper API service
      console.log('🚀 Starting application submission...')
      const startTime = Date.now()

      // Prepare the application data
      const jsonData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        jobRole: formData.jobRole,
        experience: formData.experience,
        expectedSalary: formData.expectedSalary,
        currency: formData.currency,
        coverLetter: formData.coverLetter,
        status: 'pending',
        source: 'website',
        location: 'Dubai, UAE',
      }

      // Check if user is authenticated
      const token = localStorage.getItem('authToken')
      if (!token) {
        // For non-authenticated users, create a temporary guest application
        console.log('👤 Guest user detected - submitting application without authentication')
        
        // Try direct submission without auth headers
        try {
          const guestResponse = await fetch('http://localhost:4001/api/applications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData),
          })

          if (!guestResponse.ok) {
            if (guestResponse.status === 401) {
              throw new Error('Please login to submit applications. Click the Login button to continue.')
            }
            throw new Error(`HTTP error! status: ${guestResponse.status}`)
          }

          const result = await guestResponse.json()
          console.log('✅ Guest application submission successful:', result)
          
          // Dispatch global event
          window.dispatchEvent(new CustomEvent('applicationPosted', {
            detail: {
              application: result.data || result,
              timestamp: new Date().toISOString()
            }
          }))
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
            expectedSalary: '',
            currency: 'AED',
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

      // For authenticated users, use the API service with fallback
      console.log('🔐 Authenticated user detected - using API service')
      try {
        const response = await applicationsAPI.createApplicationFromFeed(jsonData)
        console.log('✅ Application submission successful:', response)

        const endTime = Date.now()
        console.log(
          `✅ Application submitted successfully in ${endTime - startTime}ms`
        )

        // Dispatch global event to notify other components (like Dashboard)
        window.dispatchEvent(new CustomEvent('applicationPosted', {
          detail: {
            application: response.data || response,
            timestamp: new Date().toISOString()
          }
        }))
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
          expectedSalary: '',
          currency: 'AED',
          coverLetter: '',
          resume: null,
        })

        setTimeout(() => {
          onClose()
        }, 1000)
      } catch (apiError) {
        console.error('❌ API service failed, trying fallback:', apiError)
        
        // Fallback: Try direct fetch with different approach
        try {
          const fallbackResponse = await fetch('http://localhost:4000/api/applications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(jsonData),
          })

          if (!fallbackResponse.ok) {
            throw new Error(`Fallback failed: ${fallbackResponse.status}`)
          }

          const result = await fallbackResponse.json()
          console.log('✅ Fallback submission successful:', result)

          // Dispatch global event
          window.dispatchEvent(new CustomEvent('applicationPosted', {
            detail: {
              application: result.data || result,
              timestamp: new Date().toISOString()
            }
          }))

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
            expectedSalary: '',
            currency: 'AED',
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
        data: error.response?.data
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
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Find a Job - Apply Now
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="John Doe"
              />
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
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="+971 50 123 4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Role *
              </label>
              <input
                type="text"
                name="jobRole"
                value={formData.jobRole}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g. React Developer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience Level
              </label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior Level">Senior Level</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Salary
              </label>
              <input
                type="number"
                name="expectedSalary"
                value={formData.expectedSalary}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g. 8000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Letter *
            </label>
            <textarea
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Tell us why you're interested in this role and what makes you a great fit..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resume (Optional)
            </label>
            <input
              type="file"
              name="resume"
              onChange={handleChange}
              accept=".pdf,.doc,.docx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Accepted formats: PDF, DOC, DOCX (Max 5MB)
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
