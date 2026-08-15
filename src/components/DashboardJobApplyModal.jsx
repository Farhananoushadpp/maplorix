import React, { useState, useEffect, useRef } from 'react'
import { applicationsAPI } from '../services/api'
import getFriendlyErrorMessage from '../utils/errorUtils'

const DashboardJobApplyModal = ({
  isOpen,
  onClose,
  onSuccess,
  prefillData = {},
}) => {
  const fileInputRef = useRef(null)

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
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const prevIsOpenRef = useRef(false)

  // Initialize form when modal transitions from closed to open
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setFormData({
        firstName: prefillData.firstName || '',
        lastName: prefillData.lastName || '',
        email: prefillData.email || '',
        mobile: prefillData.mobile || prefillData.phone || '',
        attachedCv: prefillData.attachedCv || prefillData.resume || null,
        nationality: prefillData.nationality || '',
        currentlyLocated: prefillData.currentlyLocated || '',
        visaStatus: prefillData.visaStatus || '',
      })
      setErrors({})
      setSubmitError('')
      setSubmitSuccess(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    prevIsOpenRef.current = isOpen
  }, [isOpen])

  if (!isOpen) return null

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

    // Prevent double-click submissions
    if (isSubmitting) return

    setSubmitError('')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('firstName', formData.firstName.trim())
      formDataToSend.append('lastName', formData.lastName.trim())
      formDataToSend.append('fullName', `${formData.firstName.trim()} ${formData.lastName.trim()}`)
      formDataToSend.append('email', formData.email.trim())
      formDataToSend.append('mobile', formData.mobile.trim())
      formDataToSend.append('phone', formData.mobile.trim())
      
      if (formData.attachedCv) {
        formDataToSend.append('attachedCv', formData.attachedCv)
        formDataToSend.append('resume', formData.attachedCv)
      }

      formDataToSend.append('nationality', formData.nationality.trim())
      formDataToSend.append('currentlyLocated', formData.currentlyLocated)
      formDataToSend.append('visaStatus', formData.visaStatus)

      if (prefillData.jobId) {
        formDataToSend.append('jobId', prefillData.jobId)
      }
      if (prefillData.jobRole || prefillData.jobTitle) {
        formDataToSend.append('jobRole', prefillData.jobRole || prefillData.jobTitle)
      }

      const response = await applicationsAPI.createApplication(formDataToSend)

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
        jobRole: prefillData.jobRole || prefillData.jobTitle || 'General Application',
        status: 'submitted',
        createdAt: new Date().toISOString(),
      }

      // Dispatch global event
      window.dispatchEvent(
        new CustomEvent('applicationPosted', {
          detail: {
            application: applicationPayload,
            timestamp: new Date().toISOString(),
          },
        })
      )

      // Save to sessionStorage
      const dashboardApplications = JSON.parse(
        sessionStorage.getItem('dashboardApplications') || '[]'
      )
      dashboardApplications.unshift(applicationPayload)
      sessionStorage.setItem(
        'dashboardApplications',
        JSON.stringify(dashboardApplications)
      )

      setSubmitSuccess(true)

      if (onSuccess) {
        onSuccess('Job application submitted successfully.')
      }

      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Failed to submit application:', error)
      const friendlyMessage = getFriendlyErrorMessage(error)
      setSubmitError(friendlyMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-primary">
              Apply Job
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-secondary text-2xl transition-colors"
            >
              ×
            </button>
          </div>
          {prefillData.jobTitle && (
            <p className="text-sm font-semibold text-secondary mt-1">
              Position: {prefillData.jobTitle}
            </p>
          )}
        </div>

        {/* Success Alert */}
        {submitSuccess && (
          <div className="m-6 p-4 bg-gradient-to-r from-secondary/10 to-accent/10 border border-secondary/30 rounded-lg">
            <p className="text-secondary font-semibold text-center">
              Job application submitted successfully.
            </p>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* 1. First Name */}
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all ${
                errors.firstName ? 'border-red-500 bg-red-50/20' : 'border-gray-300'
              }`}
              placeholder="First Name"
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.firstName}
              </p>
            )}
          </div>

          {/* 2. Last Name */}
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all ${
                errors.lastName ? 'border-red-500 bg-red-50/20' : 'border-gray-300'
              }`}
              placeholder="Last Name"
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.lastName}
              </p>
            )}
          </div>

          {/* 3. Email */}
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all ${
                errors.email ? 'border-red-500 bg-red-50/20' : 'border-gray-300'
              }`}
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.email}
              </p>
            )}
          </div>

          {/* 4. Mobile */}
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Mobile *
            </label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all ${
                errors.mobile ? 'border-red-500 bg-red-50/20' : 'border-gray-300'
              }`}
              placeholder="+971 50 123 4567"
            />
            {errors.mobile && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.mobile}
              </p>
            )}
          </div>

          {/* 5. Attach CV */}
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
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
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-secondary file:text-white hover:file:bg-secondary/90 border border-gray-300 rounded-lg cursor-pointer bg-white"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Accepted formats: PDF, DOC, DOCX (Max 10MB)
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 border border-secondary/40 bg-secondary/5 rounded-lg">
                <div className="flex items-center space-x-2 truncate">
                  <i className="fas fa-file-pdf text-secondary text-xl"></i>
                  <span className="text-xs font-medium text-primary truncate">
                    {formData.attachedCv.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  <i className="fas fa-trash mr-1"></i> Remove
                </button>
              </div>
            )}
            {errors.attachedCv && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.attachedCv}
              </p>
            )}
          </div>

          {/* 6. Nationality */}
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Nationality *
            </label>
            <input
              type="text"
              name="nationality"
              value={formData.nationality}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all ${
                errors.nationality ? 'border-red-500 bg-red-50/20' : 'border-gray-300'
              }`}
              placeholder="e.g. Indian, Emirati, etc."
            />
            {errors.nationality && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.nationality}
              </p>
            )}
          </div>

          {/* 7. Currently Located */}
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Currently Located *
            </label>
            <select
              name="currentlyLocated"
              value={formData.currentlyLocated}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all bg-white ${
                errors.currentlyLocated ? 'border-red-500 bg-red-50/20' : 'border-gray-300'
              }`}
            >
              <option value="">Select location</option>
              <option value="india">India</option>
              <option value="uae">UAE</option>
            </select>
            {errors.currentlyLocated && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
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
              <label className="block text-sm font-medium text-primary mb-1">
                Visa Status *
              </label>
              <select
                name="visaStatus"
                value={formData.visaStatus}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all bg-white ${
                  errors.visaStatus ? 'border-red-500 bg-red-50/20' : 'border-gray-300'
                }`}
              >
                <option value="">Select visa status</option>
                <option value="visitVisa">Visit Visa</option>
                <option value="residenceVisa">Residence Visa</option>
                <option value="spouseVisa">Spouse Visa</option>
              </select>
              {errors.visaStatus && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {errors.visaStatus}
                </p>
              )}
            </div>
          )}

          {/* Global Error Display */}
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-xs font-medium flex items-center">
                <i className="fas fa-exclamation-triangle mr-2 text-red-500"></i>
                {submitError}
              </p>
            </div>
          )}

          {/* 9. Confirm Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2 border border-gray-300 text-primary rounded-lg hover:bg-gray-50 transition-all font-medium text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-secondary to-accent text-white rounded-lg hover:from-secondary/90 hover:to-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm shadow-custom"
            >
              {isSubmitting ? 'Submitting...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DashboardJobApplyModal
