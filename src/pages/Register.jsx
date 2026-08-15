import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../constants'
import { getFriendlyErrorMessage } from '../utils/errorUtils'

const Register = () => {
  // Google reCAPTCHA site key from environment variable
  const RECAPTCHA_SITE_KEY =
    import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
    '6LeIxAcTAAAAAJcZVRqyHh71UMIEbQjQ5y3FkT_y' // Google's official test key for development

  // Step state: 1 = Form, 2 = OTP, 3 = Password Setup
  const [step, setStep] = useState(1)

  // Registration form state using strict camelCase naming
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    attachedCv: null,
    nationality: '',
    currentlyLocated: '',
    visaStatus: '',
    industry: '',
    otherIndustry: '',
    captcha: '',
  })

  // OTP state
  const [otp, setOtp] = useState('')

  // Password setup state
  const [passwordState, setPasswordState] = useState({
    password: '',
    confirmPassword: '',
  })

  // UI state
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [recaptchaWidgetId, setRecaptchaWidgetId] = useState(null)
  const [otpResendCountdown, setOtpResendCountdown] = useState(0)

  // Duplicate User Popup Modal state
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [duplicateDetails, setDuplicateDetails] = useState({
    type: 'email', // 'email' | 'mobile' | 'both' | 'general'
    title: 'Account Already Exists',
    message: '',
    email: '',
    mobile: '',
  })

  const recaptchaContainerRef = useRef(null)
  const emailInputRef = useRef(null)
  const mobileInputRef = useRef(null)
  const otpInputRef = useRef(null)
  const navigate = useNavigate()
  const { register: authRegister } = useAuth()

  // Focus OTP input when entering step 2
  useEffect(() => {
    if (step === 2 && otpInputRef.current) {
      otpInputRef.current.focus()
    }
  }, [step])

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer
    if (otpResendCountdown > 0) {
      timer = setInterval(() => {
        setOtpResendCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [otpResendCountdown])

  // Password strength checker
  useEffect(() => {
    if (passwordState.password) {
      let strength = 0
      if (passwordState.password.length >= 6) strength++
      if (passwordState.password.length >= 8) strength++
      if (/[a-z]/.test(passwordState.password)) strength++
      if (/[A-Z]/.test(passwordState.password)) strength++
      if (/[0-9]/.test(passwordState.password)) strength++
      if (/[^a-zA-Z0-9]/.test(passwordState.password)) strength++
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(0)
    }
  }, [passwordState.password])

  // Render reCAPTCHA explicitly when component mounts or on Step 1
  useEffect(() => {
    if (step !== 1) return
    let isMounted = true

    const renderRecaptcha = () => {
      if (
        isMounted &&
        recaptchaContainerRef.current &&
        recaptchaContainerRef.current.children.length === 0 &&
        window.grecaptcha &&
        window.grecaptcha.render
      ) {
        try {
          const widgetId = window.grecaptcha.render(
            recaptchaContainerRef.current,
            {
              sitekey: RECAPTCHA_SITE_KEY,
              callback: (token) => {
                setFormData((prev) => ({ ...prev, captcha: token }))
                setErrors((prev) => ({ ...prev, captcha: '' }))
              },
              'expired-callback': () => {
                setFormData((prev) => ({ ...prev, captcha: '' }))
                setErrors((prev) => ({
                  ...prev,
                  captcha: 'CAPTCHA expired. Please verify again.',
                }))
              },
              'error-callback': () => {
                setErrors((prev) => ({
                  ...prev,
                  captcha: 'CAPTCHA verification failed. Please try again.',
                }))
              },
            }
          )
          if (isMounted) setRecaptchaWidgetId(widgetId)
        } catch (err) {
          if (!err?.message?.includes('already been rendered')) {
            console.error('Error rendering reCAPTCHA:', err)
          }
        }
      }
    }

    if (window.whenRecaptchaReady) {
      window.whenRecaptchaReady(renderRecaptcha)
    } else if (window.grecaptcha) {
      renderRecaptcha()
    }

    return () => {
      isMounted = false
    }
  }, [RECAPTCHA_SITE_KEY, step])

  // Reset reCAPTCHA helper
  const resetRecaptcha = useCallback(() => {
    if (recaptchaWidgetId !== null && window.grecaptcha) {
      try {
        window.grecaptcha.reset(recaptchaWidgetId)
        setFormData((prev) => ({ ...prev, captcha: '' }))
      } catch (err) {
        console.error('Error resetting reCAPTCHA:', err)
      }
    }
  }, [recaptchaWidgetId])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target
    if (type === 'file') {
      const file = files[0] || null
      if (file && file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          [name]: 'File size exceeds 10MB limit. Please upload a smaller file.',
        }))
        e.target.value = ''
        setFormData((prev) => ({
          ...prev,
          [name]: null,
        }))
        return
      }
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordState((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  // Step 1 Validation
  const validateStep1 = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required'
    } else if (formData.mobile.replace(/\D/g, '').length < 7) {
      newErrors.mobile = 'Please enter a valid mobile number'
    }

    if (!formData.attachedCv) {
      newErrors.attachedCv = 'Attached CV is required'
    }

    if (!formData.nationality.trim()) {
      newErrors.nationality = 'Nationality is required'
    }

    if (!formData.currentlyLocated.trim()) {
      newErrors.currentlyLocated = 'Current location is required'
    }

    // Visa status is required only if currently located in UAE
    if (
      (formData.currentlyLocated === 'UAE' ||
        formData.currentlyLocated === 'uae') &&
      !formData.visaStatus
    ) {
      newErrors.visaStatus = 'Visa status is required'
    }

    if (!formData.industry) {
      newErrors.industry = 'Industry is required'
    } else if (
      formData.industry === 'Other' &&
      !formData.otherIndustry?.trim()
    ) {
      newErrors.otherIndustry = 'Please specify your industry'
    }

    if (!formData.captcha) {
      newErrors.captcha = 'Please complete the CAPTCHA verification.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Duplicate Check Handler Helper: parses error and opens popup modal
  const handleDuplicateError = (error) => {
    const errorData = error.response?.data
    const errorCode = errorData?.errorCode || errorData?.code || ''
    const errorMessage = errorData?.message || errorData?.error || ''

    const isEmailDuplicate =
      errorMessage.toLowerCase().includes('email') ||
      errorCode === 'EMAIL_ALREADY_EXISTS'
    const isMobileDuplicate =
      errorMessage.toLowerCase().includes('mobile') ||
      errorMessage.toLowerCase().includes('phone') ||
      errorCode === 'MOBILE_ALREADY_EXISTS' ||
      errorCode === 'PHONE_ALREADY_EXISTS'

    let duplicateType = 'general'
    let title = 'Account Already Exists'
    let message = ''

    if (isEmailDuplicate && isMobileDuplicate) {
      duplicateType = 'both'
      title = 'Email & Phone Number Already Registered'
      message = `Both the email address (${formData.email}) and phone number (${formData.mobile}) are already in use by an existing Maplorix account.`
      setErrors((prev) => ({
        ...prev,
        email: 'This email address is already registered',
        mobile: 'This mobile number is already registered',
      }))
    } else if (isEmailDuplicate) {
      duplicateType = 'email'
      title = 'Email Address Already Registered'
      message = `The email address "${formData.email}" is already in use by an existing Maplorix account.`
      setErrors((prev) => ({
        ...prev,
        email: 'This email address is already registered',
      }))
    } else if (isMobileDuplicate) {
      duplicateType = 'mobile'
      title = 'Phone Number Already Registered'
      message = `The phone number "${formData.mobile}" is already in use by an existing Maplorix account.`
      setErrors((prev) => ({
        ...prev,
        mobile: 'This mobile number is already registered',
      }))
    } else {
      duplicateType = 'general'
      title = 'Account Already Registered'
      message =
        errorMessage && !errorMessage.includes('500')
          ? errorMessage
          : 'An account with this email address or phone number already exists in Maplorix.'
    }

    setDuplicateDetails({
      type: duplicateType,
      title,
      message,
      email: formData.email,
      mobile: formData.mobile,
    })

    setShowDuplicateModal(true)
  }

  // Step 1 Submit: Backend Duplicate Check & Send Email OTP
  const handleStep1Submit = async (e) => {
    e.preventDefault()

    if (!validateStep1()) return

    setIsLoading(true)
    setErrors({})

    try {
      // Send OTP to user's email while checking existing user
      const response = await authAPI.sendOtp({
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
      })

      if (response.success || response.status === 'success' || response.data) {
        setSuccessMessage(`A 6-digit OTP code has been sent to ${formData.email}. Please check your inbox.`)
        setOtpResendCountdown(60)
        setStep(2) // Move to OTP verification screen
      }
    } catch (error) {
      console.error('Send OTP error:', error)
      const errorData = error.response?.data
      const errorCode = errorData?.errorCode || errorData?.code
      const errorMessage = errorData?.message || errorData?.error || ''

      const isDuplicate =
        errorCode === 'USER_ALREADY_EXISTS' ||
        errorCode === 'EMAIL_ALREADY_EXISTS' ||
        errorCode === 'MOBILE_ALREADY_EXISTS' ||
        errorCode === 'PHONE_ALREADY_EXISTS' ||
        errorMessage.toLowerCase().includes('email already') ||
        errorMessage.toLowerCase().includes('phone already') ||
        errorMessage.toLowerCase().includes('mobile already') ||
        errorMessage.toLowerCase().includes('user already') ||
        errorMessage.toLowerCase().includes('already exists') ||
        error.response?.status === 409

      if (isDuplicate) {
        handleDuplicateError(error)
      } else {
        setErrors({
          submit: getFriendlyErrorMessage(error),
        })
      }
      resetRecaptcha()
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2 Submit: Verify Email OTP
  const handleStep2Submit = async (e) => {
    e.preventDefault()

    if (!otp.trim()) {
      setErrors({ otp: 'Please enter the 6-digit OTP code' })
      return
    }

    if (otp.trim().length !== 6) {
      setErrors({ otp: 'OTP code must be exactly 6 digits' })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await authAPI.verifyOtp({
        email: formData.email.trim().toLowerCase(),
        otp: otp.trim(),
      })

      if (response.success || response.status === 'success') {
        setSuccessMessage('✓ Email verified successfully! Please choose a secure password.')
        setStep(3) // Move to password setup screen
      } else {
        setErrors({
          otp: response.message || 'Invalid or expired OTP. Please try again.',
        })
      }
    } catch (error) {
      console.error('Verify OTP error:', error)
      setErrors({
        otp: getFriendlyErrorMessage(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (otpResendCountdown > 0) return

    setIsLoading(true)
    setErrors({})

    try {
      await authAPI.sendOtp({
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
      })
      setSuccessMessage('A fresh 6-digit OTP has been sent to your email.')
      setOtpResendCountdown(60)
      setOtp('')
    } catch (error) {
      setErrors({
        otp: getFriendlyErrorMessage(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3 Submit: Password Setup & Final Registration
  const handleStep3Submit = async (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!passwordState.password) {
      newErrors.password = 'Password is required'
    } else if (passwordState.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long'
    }

    if (!passwordState.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (passwordState.password !== passwordState.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const registrationPayload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
        phone: formData.mobile.trim(),
        nationality: formData.nationality.trim(),
        currentlyLocated: formData.currentlyLocated.trim(),
        visaStatus: formData.visaStatus,
        industry:
          formData.industry === 'Other'
            ? formData.otherIndustry.trim()
            : formData.industry,
        password: passwordState.password,
        recaptchaToken: formData.captcha,
        attachedCvName: formData.attachedCv ? formData.attachedCv.name : undefined,
      }

      const response = await authAPI.register(registrationPayload)

      setSuccessMessage('🎉 Account created successfully! Logging you in...')

      // Save token and user if returned
      const token = response.data?.token || response.token
      const user = response.data?.user || response.user

      if (token && user) {
        localStorage.setItem('authToken', token)
        localStorage.setItem('user', JSON.stringify(user))
      }

      // Clear password values from memory immediately
      setPasswordState({ password: '', confirmPassword: '' })

      setTimeout(() => {
        if (user?.role === 'admin') {
          navigate(ROUTES.DASHBOARD)
        } else {
          navigate(ROUTES.HOME)
        }
      }, 1500)
    } catch (error) {
      console.error('Final Registration Error:', error)
      const errorCode = error.response?.data?.errorCode
      if (errorCode === 'USER_ALREADY_EXISTS' || error.response?.status === 409) {
        handleDuplicateError(error)
      } else {
        setErrors({
          submit: getFriendlyErrorMessage(error),
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Modal Action: Redirect to Login with email
  const handleModalLogin = () => {
    setShowDuplicateModal(false)
    navigate(ROUTES.LOGIN, {
      state: { email: formData.email },
    })
  }

  // Modal Action: Register with new Email or Phone Number
  const handleModalNewInput = () => {
    setShowDuplicateModal(false)
    setStep(1)

    // Focus on the duplicate field so user can easily change it
    setTimeout(() => {
      if (duplicateDetails.type === 'mobile' && mobileInputRef.current) {
        mobileInputRef.current.focus()
        mobileInputRef.current.select?.()
      } else if (emailInputRef.current) {
        emailInputRef.current.focus()
        emailInputRef.current.select?.()
      }
    }, 150)
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500'
    if (passwordStrength <= 4) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak'
    if (passwordStrength <= 4) return 'Medium'
    return 'Strong'
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #012530 0%, #023341 45%, #034a5e 100%)' }}>

      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #4cbd99 0%, transparent 70%)' }}></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #149fc9 0%, transparent 70%)' }}></div>
        <div className="absolute -bottom-20 right-1/4 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #4cbd99 0%, transparent 70%)' }}></div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }}></div>
      </div>

      {/* ── HERO HEADLINE ── */}
      <div className="relative z-10 pt-24 pb-6 text-center px-4">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 backdrop-blur-sm shadow-inner">
          <i className="fas fa-briefcase text-[#4cbd99]"></i>
          Your Career Journey Starts Here
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-2 drop-shadow-lg">
          {step === 1 && <>Join <span className="text-[#4cbd99]">Maplorix</span> &amp; Find Your Dream Job</>}
          {step === 2 && <>Verify Your <span className="text-[#4cbd99]">Email Address</span></>}
          {step === 3 && <>Set Your <span className="text-[#4cbd99]">Account Password</span></>}
        </h1>
        <p className="text-white/70 text-sm sm:text-base max-w-lg mx-auto">
          {step === 1 && 'Create your free account and connect with top employers across the UAE.'}
          {step === 2 && `Enter the 6-digit verification code sent to ${formData.email || 'your email'}.`}
          {step === 3 && 'Choose a secure password to protect your Maplorix profile.'}
        </p>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mt-5">
          {[
            { num: 1, label: 'Details' },
            { num: 2, label: 'Email OTP' },
            { num: 3, label: 'Password' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                    step > s.num
                      ? 'border-[#4cbd99] bg-[#4cbd99] text-[#012530] shadow-md shadow-[#4cbd99]/30'
                      : step === s.num
                      ? 'border-[#4cbd99] bg-white/20 text-white shadow-lg ring-2 ring-[#4cbd99]/30'
                      : 'border-white/25 bg-white/5 text-white/40'
                  }`}
                >
                  {step > s.num ? <i className="fas fa-check text-xs"></i> : s.num}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:inline ${
                    step === s.num ? 'text-white font-semibold' : 'text-white/50'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {s.num < 3 && (
                <div
                  className={`w-8 sm:w-12 h-0.5 rounded-full transition-all duration-300 ${
                    step > s.num ? 'bg-[#4cbd99]' : 'bg-white/20'
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── FORM CARD ── */}
      <div className="relative z-10 pb-12 px-4 sm:px-6">
        <div className="mx-auto w-full max-w-md">
          <div
            className="rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl border border-white/20 transition-all"
            style={{ background: 'rgba(255,255,255,0.98)' }}
          >
            {/* Card top accent bar */}
            <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #4cbd99, #149fc9, #4cbd99)' }}></div>

            <div className="px-5 py-6 sm:px-7">
              {/* Global Error Banner */}
              {errors.submit && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center shadow-sm">
                  <i className="fas fa-exclamation-circle text-red-500 mr-2 text-sm flex-shrink-0"></i>
                  <span>{errors.submit}</span>
                </div>
              )}

              {/* Global Success Banner */}
              {successMessage && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-xl text-xs flex items-center shadow-sm">
                  <i className="fas fa-check-circle text-emerald-500 mr-2 text-sm flex-shrink-0"></i>
                  <span>{successMessage}</span>
                </div>
              )}

              {/* STEP 1: REGISTRATION FORM */}
              {step === 1 && (
                <form className="space-y-3.5" onSubmit={handleStep1Submit}>
                  {/* First & Last Name row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="firstName" className="block text-xs font-semibold text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#149fc9]/40 focus:border-[#149fc9] transition-all ${
                          errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50/80 hover:border-gray-300'
                        }`}
                        placeholder="John"
                      />
                      {errors.firstName && <p className="mt-0.5 text-xs text-red-600">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-xs font-semibold text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#149fc9]/40 focus:border-[#149fc9] transition-all ${
                          errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50/80 hover:border-gray-300'
                        }`}
                        placeholder="Doe"
                      />
                      {errors.lastName && <p className="mt-0.5 text-xs text-red-600">{errors.lastName}</p>}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        ref={emailInputRef}
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className={`block w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#149fc9]/40 focus:border-[#149fc9] transition-all ${
                          errors.email ? 'border-red-400 bg-red-50 ring-1 ring-red-300' : 'border-gray-200 bg-gray-50/80 hover:border-gray-300'
                        }`}
                        placeholder="john.doe@example.com"
                      />
                      <i className="fas fa-envelope absolute left-3 top-2.5 text-gray-400 text-xs"></i>
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <i className="fas fa-info-circle text-xs"></i>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Mobile */}
                  <div>
                    <label htmlFor="mobile" className="block text-xs font-semibold text-gray-700 mb-1">
                      Mobile / Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        ref={mobileInputRef}
                        id="mobile"
                        name="mobile"
                        type="tel"
                        required
                        value={formData.mobile}
                        onChange={handleChange}
                        className={`block w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#149fc9]/40 focus:border-[#149fc9] transition-all ${
                          errors.mobile ? 'border-red-400 bg-red-50 ring-1 ring-red-300' : 'border-gray-200 bg-gray-50/80 hover:border-gray-300'
                        }`}
                        placeholder="+971 50 123 4567"
                      />
                      <i className="fas fa-phone absolute left-3 top-2.5 text-gray-400 text-xs"></i>
                    </div>
                    {errors.mobile && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <i className="fas fa-info-circle text-xs"></i>
                        {errors.mobile}
                      </p>
                    )}
                  </div>

                  {/* Attached CV */}
                  <div>
                    <label htmlFor="attachedCv" className="block text-xs font-semibold text-gray-700 mb-1">
                      Attach CV / Resume <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="attachedCv"
                      name="attachedCv"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      required
                      onChange={handleChange}
                      className={`block w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#023341] file:text-white hover:file:bg-[#034a5e] border rounded-lg p-1.5 transition-all ${
                        errors.attachedCv ? 'border-red-300' : 'border-gray-200 bg-gray-50/80'
                      }`}
                    />
                    {formData.attachedCv && (
                      <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1">
                        <i className="fas fa-file-pdf"></i>
                        <span>{formData.attachedCv.name}</span>
                      </p>
                    )}
                    {errors.attachedCv && <p className="mt-0.5 text-xs text-red-600">{errors.attachedCv}</p>}
                  </div>

                  {/* Nationality & Location row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="nationality" className="block text-xs font-semibold text-gray-700 mb-1">
                        Nationality <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="nationality"
                        name="nationality"
                        type="text"
                        required
                        value={formData.nationality}
                        onChange={handleChange}
                        className={`block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#149fc9]/40 focus:border-[#149fc9] transition-all ${
                          errors.nationality ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50/80 hover:border-gray-300'
                        }`}
                        placeholder="e.g. Indian"
                      />
                      {errors.nationality && <p className="mt-0.5 text-xs text-red-600">{errors.nationality}</p>}
                    </div>
                    <div>
                      <label htmlFor="currentlyLocated" className="block text-xs font-semibold text-gray-700 mb-1">
                        Currently Located <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="currentlyLocated"
                        name="currentlyLocated"
                        required
                        value={formData.currentlyLocated}
                        onChange={(e) => {
                          const val = e.target.value
                          setFormData((prev) => ({
                            ...prev,
                            currentlyLocated: val,
                            visaStatus: val === 'UAE' ? prev.visaStatus || 'visitVisa' : '',
                          }))
                          if (errors.currentlyLocated) {
                            setErrors((prev) => ({ ...prev, currentlyLocated: '' }))
                          }
                          if (val !== 'UAE') {
                            setErrors((prev) => ({ ...prev, visaStatus: '' }))
                          }
                        }}
                        className={`block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#149fc9]/40 focus:border-[#149fc9] transition-all ${
                          errors.currentlyLocated ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50/80 hover:border-gray-300'
                        }`}
                      >
                        <option value="">Select Location</option>
                        <option value="India">India</option>
                        <option value="UAE">UAE</option>
                      </select>
                      {errors.currentlyLocated && <p className="mt-0.5 text-xs text-red-600">{errors.currentlyLocated}</p>}
                    </div>
                  </div>

                  {/* Visa Status (only if currently located in UAE) */}
                  {(formData.currentlyLocated === 'UAE' || formData.currentlyLocated === 'uae') && (
                    <div>
                      <label htmlFor="visaStatus" className="block text-xs font-semibold text-gray-700 mb-1">
                        Visa Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="visaStatus"
                        name="visaStatus"
                        required
                        value={formData.visaStatus}
                        onChange={handleChange}
                        className={`block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#149fc9]/40 focus:border-[#149fc9] transition-all ${
                          errors.visaStatus ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50/80 hover:border-gray-300'
                        }`}
                      >
                        <option value="">Select Visa Status</option>
                        <option value="visitVisa">Visit Visa</option>
                        <option value="residenceVisa">Residence Visa</option>
                        <option value="spouseVisa">Spouse Visa</option>
                      </select>
                      {errors.visaStatus && <p className="mt-0.5 text-xs text-red-600">{errors.visaStatus}</p>}
                    </div>
                  )}

                  {/* Industry */}
                  <div>
                    <label htmlFor="industry" className="block text-xs font-semibold text-gray-700 mb-1">
                      Industry <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="industry"
                      name="industry"
                      required
                      value={formData.industry}
                      onChange={(e) => {
                        const val = e.target.value
                        setFormData((prev) => ({
                          ...prev,
                          industry: val,
                          otherIndustry: val === 'Other' ? prev.otherIndustry : '',
                        }))
                        if (errors.industry) {
                          setErrors((prev) => ({ ...prev, industry: '' }))
                        }
                        if (val !== 'Other') {
                          setErrors((prev) => ({ ...prev, otherIndustry: '' }))
                        }
                      }}
                      className={`block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#149fc9]/40 focus:border-[#149fc9] transition-all ${
                        errors.industry ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50/80 hover:border-gray-300'
                      }`}
                    >
                      <option value="">Select Industry</option>
                      <option value="Information Technology">Information Technology &amp; Software</option>
                      <option value="Banking & Finance">Banking &amp; Financial Services</option>
                      <option value="Construction & Real Estate">Construction &amp; Real Estate</option>
                      <option value="Healthcare & Medical">Healthcare &amp; Medical</option>
                      <option value="Engineering & Manufacturing">Engineering &amp; Manufacturing</option>
                      <option value="Oil & Gas / Energy">Oil &amp; Gas / Energy</option>
                      <option value="Hospitality & Tourism">Hospitality &amp; Tourism</option>
                      <option value="Retail & FMCG">Retail &amp; FMCG</option>
                      <option value="Logistics & Supply Chain">Logistics &amp; Supply Chain</option>
                      <option value="Marketing & Advertising">Marketing, Media &amp; Advertising</option>
                      <option value="Education & Training">Education &amp; Training</option>
                      <option value="Human Resources">Human Resources &amp; Recruitment</option>
                      <option value="Accounting & Auditing">Accounting &amp; Auditing</option>
                      <option value="Customer Service & Operations">Customer Service &amp; Operations</option>
                      <option value="Aviation & Aerospace">Aviation &amp; Aerospace</option>
                      <option value="Legal & Compliance">Legal &amp; Compliance</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.industry && <p className="mt-0.5 text-xs text-red-600">{errors.industry}</p>}
                  </div>

                  {/* Specify Other Industry */}
                  {formData.industry === 'Other' && (
                    <div>
                      <label htmlFor="otherIndustry" className="block text-xs font-semibold text-gray-700 mb-1">
                        Specify Industry <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="otherIndustry"
                        name="otherIndustry"
                        type="text"
                        required
                        value={formData.otherIndustry}
                        onChange={handleChange}
                        className={`block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#149fc9]/40 focus:border-[#149fc9] transition-all ${
                          errors.otherIndustry ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50/80 hover:border-gray-300'
                        }`}
                        placeholder="Please type your industry"
                      />
                      {errors.otherIndustry && (
                        <p className="mt-0.5 text-xs text-red-600">{errors.otherIndustry}</p>
                      )}
                    </div>
                  )}

                  {/* Captcha */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Captcha Verification <span className="text-red-500">*</span>
                    </label>
                    <div className="flex justify-center">
                      <div ref={recaptchaContainerRef} id="register-recaptcha-container"></div>
                    </div>
                    {errors.captcha && <p className="mt-1 text-xs text-red-600 text-center">{errors.captcha}</p>}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-2.5 px-4 text-sm font-bold rounded-lg text-white transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(90deg, #023341, #149fc9)' }}
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>Verifying Details...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-arrow-right mr-2"></i>Continue to Email Verification
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: EMAIL OTP VERIFICATION */}
              {step === 2 && (
                <form className="space-y-4" onSubmit={handleStep2Submit}>
                  <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-xl text-blue-900 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#149fc9]/15 flex items-center justify-center text-[#149fc9] flex-shrink-0 mt-0.5">
                        <i className="fas fa-envelope-open-text text-sm"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-0.5">
                          Verification Code Sent
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          We sent a 6-digit OTP code to <strong className="text-gray-900 break-all">{formData.email}</strong>
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setStep(1)
                            setErrors({})
                          }}
                          className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#149fc9] hover:underline"
                        >
                          <i className="fas fa-edit text-[10px]"></i> Change email address
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="otp" className="block text-xs font-semibold text-gray-700 mb-1.5 text-center">
                      Enter 6-Digit Email OTP
                    </label>
                    <input
                      ref={otpInputRef}
                      id="otp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '')
                        setOtp(val)
                        if (errors.otp) setErrors((prev) => ({ ...prev, otp: '' }))
                      }}
                      className={`block w-full text-center text-2xl tracking-[0.4em] font-mono py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#149fc9]/40 focus:border-[#149fc9] transition-all ${
                        errors.otp ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50/90'
                      }`}
                      placeholder="••••••"
                    />
                    {errors.otp && (
                      <p className="mt-2 text-xs text-red-600 text-center flex items-center justify-center gap-1 font-medium">
                        <i className="fas fa-exclamation-circle text-xs"></i>
                        {errors.otp}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full flex justify-center items-center py-2.5 px-4 text-sm font-bold rounded-lg text-white transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(90deg, #023341, #149fc9)' }}
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>Verifying OTP...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle mr-2"></i>Verify OTP &amp; Proceed
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100 mt-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="hover:text-gray-900 transition-colors flex items-center gap-1 font-medium"
                    >
                      <i className="fas fa-arrow-left text-[10px]"></i> Back to Form
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpResendCountdown > 0 || isLoading}
                      className="font-semibold hover:underline disabled:opacity-50 disabled:no-underline transition-colors text-[#149fc9]"
                    >
                      {otpResendCountdown > 0 ? (
                        <span className="flex items-center gap-1 text-gray-400">
                          <i className="fas fa-clock text-[10px]"></i> Resend in {otpResendCountdown}s
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <i className="fas fa-redo-alt text-[10px]"></i> Resend OTP
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: PASSWORD SETUP */}
              {step === 3 && (
                <form className="space-y-4" onSubmit={handleStep3Submit}>
                  <div>
                    <label htmlFor="password" className="block text-xs font-semibold text-gray-700 mb-1">
                      Create Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={passwordState.password}
                        onChange={handlePasswordChange}
                        className={`block w-full pr-10 py-2 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#149fc9]/40 focus:border-[#149fc9] transition-all ${
                          errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50/80 hover:border-gray-300'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {errors.password && <p className="mt-0.5 text-xs text-red-600">{errors.password}</p>}

                    {passwordState.password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-gray-500">Password strength:</span>
                          <span className={`text-[11px] font-bold ${passwordStrength <= 2 ? 'text-red-500' : passwordStrength <= 4 ? 'text-yellow-600' : 'text-emerald-600'}`}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength / 6) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={passwordState.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`block w-full pr-10 py-2 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#149fc9]/40 focus:border-[#149fc9] transition-all ${
                          errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50/80 hover:border-gray-300'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-0.5 text-xs text-red-600">{errors.confirmPassword}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-2.5 px-4 text-sm font-bold rounded-lg text-white transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(90deg, #023341, #149fc9)' }}
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>Completing Registration...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-check mr-2"></i>Complete Registration
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Sign In Link */}
              <div className="mt-5 text-center pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Already have an account?{' '}
                  <Link
                    to={ROUTES.LOGIN}
                    state={{ email: formData.email }}
                    className="font-bold hover:underline transition-colors text-[#149fc9]"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── EXISTING USER POPUP MODAL ── */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 transform transition-all animate-scale-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="duplicate-modal-title"
          >
            {/* Modal Header Top Color Accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-rose-500 to-[#023341]"></div>

            {/* Close Button (X) */}
            <button
              onClick={() => setShowDuplicateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <i className="fas fa-times text-sm"></i>
            </button>

            <div className="p-6 sm:p-7 text-center">
              {/* Animated Glowing Icon Badge */}
              <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-md mb-4 ring-8 ring-amber-50/60">
                <i className="fas fa-user-shield text-2xl"></i>
              </div>

              {/* Modal Title */}
              <h3 id="duplicate-modal-title" className="text-xl font-extrabold text-gray-900 mb-1.5">
                {duplicateDetails.title}
              </h3>

              {/* Sub-badge */}
              <div className="inline-block mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  <i className="fas fa-exclamation-triangle text-[10px]"></i>
                  {duplicateDetails.type === 'email' && 'Email Already In Use'}
                  {duplicateDetails.type === 'mobile' && 'Phone Number Already In Use'}
                  {duplicateDetails.type === 'both' && 'Email & Phone Number In Use'}
                  {duplicateDetails.type === 'general' && 'Duplicate Account Detected'}
                </span>
              </div>

              {/* Detailed Message Box */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs text-gray-700 text-left mb-5 space-y-2">
                <p className="leading-relaxed text-gray-800">
                  {duplicateDetails.message}
                </p>
                <div className="pt-2 border-t border-gray-200 text-gray-500 flex items-center gap-1.5">
                  <i className="fas fa-info-circle text-blue-500 text-xs"></i>
                  <span>Would you like to sign in to your existing account or register with a new email / phone?</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5">
                {/* Primary CTA: Sign in to Existing Account */}
                <button
                  type="button"
                  onClick={handleModalLogin}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 text-sm font-bold rounded-xl text-white shadow-md hover:shadow-lg transition-all duration-200"
                  style={{ background: 'linear-gradient(90deg, #023341, #149fc9)' }}
                >
                  <i className="fas fa-sign-in-alt text-xs"></i>
                  Sign In to Existing Account
                </button>

                {/* Secondary CTA: Use a New Email or Phone */}
                <button
                  type="button"
                  onClick={handleModalNewInput}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 text-xs font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                >
                  <i className="fas fa-user-edit text-xs text-gray-500"></i>
                  Register with New Email / Phone Number
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Register
