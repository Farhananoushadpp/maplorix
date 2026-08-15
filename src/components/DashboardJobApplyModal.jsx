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
    savedCvName: '',
    nationality: '',
    currentlyLocated: '',
    visaStatus: '',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const prevIsOpenRef = useRef(false)

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      const savedCv =
        prefillData.attachedCvName ||
        (typeof prefillData.attachedCv === 'string' ? prefillData.attachedCv : '') ||
        (typeof prefillData.resume === 'string' ? prefillData.resume : '')

      setFormData({
        firstName: prefillData.firstName || '',
        lastName: prefillData.lastName || '',
        email: prefillData.email || '',
        mobile: prefillData.mobile || prefillData.phone || '',
        attachedCv:
          prefillData.attachedCv instanceof File ? prefillData.attachedCv : null,
        savedCvName: savedCv,
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
  }, [isOpen, prefillData])

  if (!isOpen) return null

  const jobRoleTitle =
    prefillData.jobTitle ||
    prefillData.jobRole ||
    prefillData.title ||
    'Selected Job Position'

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
        savedCvName: file.name,
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
      savedCvName: '',
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
      newErrors.mobile = 'Mobile number is required'
    }

    if (!formData.attachedCv && !formData.savedCvName) {
      newErrors.attachedCv = 'Please attach your CV / Resume'
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
    if (e) e.preventDefault()

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
      formDataToSend.append(
        'fullName',
        `${formData.firstName.trim()} ${formData.lastName.trim()}`
      )
      formDataToSend.append('email', formData.email.trim().toLowerCase())
      formDataToSend.append('mobile', formData.mobile.trim())
      formDataToSend.append('phone', formData.mobile.trim())

      if (formData.attachedCv instanceof File) {
        formDataToSend.append('attachedCv', formData.attachedCv)
        formDataToSend.append('resume', formData.attachedCv)
      } else if (formData.savedCvName) {
        formDataToSend.append('attachedCvName', formData.savedCvName)
      }

      formDataToSend.append('nationality', formData.nationality.trim())
      formDataToSend.append('currentlyLocated', formData.currentlyLocated)
      formDataToSend.append('visaStatus', formData.visaStatus || '')

      const targetJobId = prefillData.jobId || prefillData._id || prefillData.id
      if (targetJobId) {
        formDataToSend.append('job', targetJobId)
        formDataToSend.append('jobId', targetJobId)
      }
      formDataToSend.append('jobRole', jobRoleTitle)
      formDataToSend.append('jobTitle', jobRoleTitle)

      const response = await applicationsAPI.createApplication(formDataToSend)

      const applicationPayload = {
        _id:
          response.data?.application?._id ||
          response.data?._id ||
          Date.now().toString(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        mobile: formData.mobile,
        phone: formData.mobile,
        attachedCv:
          formData.attachedCv instanceof File
            ? formData.attachedCv.name
            : formData.savedCvName || 'Resume',
        nationality: formData.nationality,
        currentlyLocated: formData.currentlyLocated,
        visaStatus: formData.visaStatus,
        jobRole: jobRoleTitle,
        status: 'submitted',
        createdAt: new Date().toISOString(),
      }

      // Dispatch global event for dashboard synchronization
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

      const successMsg = `Applied for ${jobRoleTitle} successfully!`

      if (onSuccess) {
        onSuccess(successMsg)
      }

      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Failed to submit application:', error)
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        getFriendlyErrorMessage(error)
      setSubmitError(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 transition-all">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-[#012530] via-[#023341] to-[#034a5e] text-white rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-block bg-[#4cbd99]/20 text-[#4cbd99] border border-[#4cbd99]/40 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1.5">
                Job Application
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {jobRoleTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center transition-colors text-lg"
            >
              ×
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {submitSuccess && (
          <div className="m-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 shadow-sm">
            <i className="fas fa-check-circle text-emerald-600 text-xl"></i>
            <div>
              <p className="font-bold text-sm">Applied successfully!</p>
              <p className="text-xs text-emerald-700">
                Your application for <strong>{jobRoleTitle}</strong> has been submitted.
              </p>
            </div>
          </div>
        )}

        {/* Global Error Display */}
        {submitError && (
          <div className="mx-5 mt-5 p-3.5 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-xs font-medium flex items-center">
              <i className="fas fa-exclamation-triangle mr-2 text-red-500 text-sm"></i>
              {submitError}
            </p>
          </div>
        )}

        {/* Application Form */}
        {!submitSuccess && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Pre-fill Notice if user is logged in */}
            {formData.email && (
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center justify-between text-xs text-blue-900">
                <span className="flex items-center gap-1.5 font-medium">
                  <i className="fas fa-user-check text-[#149fc9]"></i>
                  Pre-filled with your profile details
                </span>
                <span className="text-[11px] text-gray-500">Edit below if needed</span>
              </div>
            )}

            {/* 1. First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#149fc9] focus:border-[#149fc9] transition-all ${
                    errors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50/50'
                  }`}
                  placeholder="John"
                />
                {errors.firstName && <p className="mt-0.5 text-xs text-red-600">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#149fc9] focus:border-[#149fc9] transition-all ${
                    errors.lastName ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50/50'
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && <p className="mt-0.5 text-xs text-red-600">{errors.lastName}</p>}
              </div>
            </div>

            {/* 2. Email & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#149fc9] focus:border-[#149fc9] transition-all ${
                    errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50/50'
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && <p className="mt-0.5 text-xs text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#149fc9] focus:border-[#149fc9] transition-all ${
                    errors.mobile ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50/50'
                  }`}
                  placeholder="+971 50 123 4567"
                />
                {errors.mobile && <p className="mt-0.5 text-xs text-red-600">{errors.mobile}</p>}
              </div>
            </div>

            {/* 3. Attach CV / Update CV */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Attach CV / Resume <span className="text-red-500">*</span>
              </label>

              {formData.attachedCv ? (
                <div className="flex items-center justify-between p-3 border border-[#149fc9] bg-blue-50/40 rounded-xl">
                  <div className="flex items-center gap-2 truncate">
                    <i className="fas fa-file-pdf text-red-500 text-lg"></i>
                    <span className="text-xs font-semibold text-gray-800 truncate">
                      {formData.attachedCv.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1"
                  >
                    <i className="fas fa-trash mr-1"></i> Replace
                  </button>
                </div>
              ) : formData.savedCvName ? (
                <div className="p-3 border border-gray-200 bg-gray-50/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <i className="fas fa-file-pdf text-red-500 text-lg"></i>
                      <span className="text-xs font-medium text-gray-700 truncate">
                        {formData.savedCvName} (Profile CV)
                      </span>
                    </div>
                  </div>
                  <div className="pt-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      name="attachedCv"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#023341] file:text-white hover:file:bg-[#034a5e] border border-gray-300 rounded-lg cursor-pointer bg-white p-1"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Upload a new file to update, or keep profile CV</p>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="attachedCv"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#023341] file:text-white hover:file:bg-[#034a5e] border border-gray-300 rounded-xl cursor-pointer bg-gray-50/50 p-1"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Accepted: PDF, DOC, DOCX (Max 10MB)</p>
                </div>
              )}

              {errors.attachedCv && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <i className="fas fa-exclamation-circle text-xs"></i>
                  {errors.attachedCv}
                </p>
              )}
            </div>

            {/* 4. Nationality & Location */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nationality <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#149fc9] focus:border-[#149fc9] transition-all ${
                    errors.nationality ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50/50'
                  }`}
                  placeholder="e.g. Indian"
                />
                {errors.nationality && <p className="mt-0.5 text-xs text-red-600">{errors.nationality}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Currently Located <span className="text-red-500">*</span>
                </label>
                <select
                  name="currentlyLocated"
                  value={formData.currentlyLocated}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#149fc9] focus:border-[#149fc9] transition-all ${
                    errors.currentlyLocated ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50/50'
                  }`}
                >
                  <option value="">Select Location</option>
                  <option value="India">India</option>
                  <option value="UAE">UAE</option>
                </select>
                {errors.currentlyLocated && <p className="mt-0.5 text-xs text-red-600">{errors.currentlyLocated}</p>}
              </div>
            </div>

            {/* 5. Visa Status (if UAE) */}
            {(formData.currentlyLocated === 'UAE' ||
              formData.currentlyLocated === 'uae' ||
              formData.currentlyLocated === 'dubai') && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Visa Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="visaStatus"
                  value={formData.visaStatus}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#149fc9] focus:border-[#149fc9] transition-all ${
                    errors.visaStatus ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50/50'
                  }`}
                >
                  <option value="">Select visa status</option>
                  <option value="visitVisa">Visit Visa</option>
                  <option value="residenceVisa">Residence Visa</option>
                  <option value="spouseVisa">Spouse Visa</option>
                </select>
                {errors.visaStatus && <p className="mt-0.5 text-xs text-red-600">{errors.visaStatus}</p>}
              </div>
            )}

            {/* Submit Action Buttons */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold text-xs disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-[#023341] to-[#149fc9] text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane text-[10px]"></i> Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default DashboardJobApplyModal
