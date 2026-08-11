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
    visaStatus: 'visitVisa',
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
  const [isExistingUser, setIsExistingUser] = useState(false)
  const [existingUserMessage, setExistingUserMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [recaptchaWidgetId, setRecaptchaWidgetId] = useState(null)
  const [otpResendCountdown, setOtpResendCountdown] = useState(0)

  const recaptchaContainerRef = useRef(null)
  const navigate = useNavigate()
  const { register: authRegister } = useAuth()

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

  // Reset all states when New Registration button is clicked
  const handleNewRegistration = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      attachedCv: null,
      nationality: '',
      currentlyLocated: '',
      visaStatus: 'visitVisa',
      captcha: '',
    })
    setOtp('')
    setPasswordState({
      password: '',
      confirmPassword: '',
    })
    setErrors({})
    setIsExistingUser(false)
    setExistingUserMessage('')
    setIsLoading(false)
    setSuccessMessage('')
    setStep(1)
    resetRecaptcha()
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target
    if (type === 'file') {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0] || null,
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

    if (!formData.visaStatus) {
      newErrors.visaStatus = 'Visa status is required'
    }

    if (!formData.captcha) {
      newErrors.captcha = 'Please complete the CAPTCHA verification.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Step 1 Submit: Backend Verification & Send OTP
  const handleStep1Submit = async (e) => {
    e.preventDefault()

    if (!validateStep1()) return

    setIsLoading(true)
    setErrors({})
    setIsExistingUser(false)

    try {
      // Send OTP to user's email while checking existing user
      const response = await authAPI.sendOtp({
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
      })

      if (response.success) {
        setSuccessMessage('OTP sent successfully to your email.')
        setOtpResendCountdown(60)
        setStep(2) // Move to OTP verification screen
      }
    } catch (error) {
      console.error('Send OTP error:', error)
      const errorCode = error.response?.data?.errorCode

      if (errorCode === 'USER_ALREADY_EXISTS' || error.response?.status === 409) {
        setIsExistingUser(true)
        setExistingUserMessage(
          'An account with this email or mobile number already exists.'
        )
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

  // Step 2 Submit: Verify OTP
  const handleStep2Submit = async (e) => {
    e.preventDefault()

    if (!otp.trim()) {
      setErrors({ otp: 'Please enter the 6-digit OTP code' })
      return
    }

    if (otp.trim().length !== 6) {
      setErrors({ otp: 'OTP must be 6 digits' })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await authAPI.verifyOtp({
        email: formData.email.trim().toLowerCase(),
        otp: otp.trim(),
      })

      if (response.success) {
        setSuccessMessage('OTP verified successfully! Please set your password.')
        setStep(3) // Move to password setup screen
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
      setSuccessMessage('A new OTP has been sent to your email.')
      setOtpResendCountdown(60)
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
        setIsExistingUser(true)
        setExistingUserMessage(
          'An account with this email or mobile number already exists.'
        )
      } else {
        setErrors({
          submit: getFriendlyErrorMessage(error),
        })
      }
    } finally {
      setIsLoading(false)
    }
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary shadow-custom mb-4">
            <i className="fas fa-user-plus text-accent text-2xl"></i>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-primary font-heading">
            {step === 1 && 'Create Your Account'}
            {step === 2 && 'Email Verification'}
            {step === 3 && 'Set Your Password'}
          </h2>
          <p className="mt-2 text-sm text-text-light">
            {step === 1 && 'Join Maplorix to find your dream job'}
            {step === 2 && `An OTP was sent to ${formData.email}`}
            {step === 3 && 'Choose a secure password for your account'}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-custom rounded-lg sm:px-10">
          {/* EXISTING USER MESSAGE UI BOX */}
          {isExistingUser ? (
            <div className="text-center space-y-6 py-4">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <i className="fas fa-exclamation-triangle text-2xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  User Already Exists
                </h3>
                <p className="text-sm text-gray-600">
                  {existingUserMessage ||
                    'An account with this email or mobile number already exists.'}
                </p>
              </div>
              <div className="pt-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleNewRegistration}
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                >
                  <i className="fas fa-redo mr-2"></i>
                  New Registration
                </button>
                <Link
                  to={ROUTES.LOGIN}
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all"
                >
                  Sign in to existing account
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Global Error Banner */}
              {errors.submit && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                  <i className="fas fa-exclamation-circle mr-2 text-base"></i>
                  <span>{errors.submit}</span>
                </div>
              )}

              {/* Global Success Banner */}
              {successMessage && (
                <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm flex items-center">
                  <i className="fas fa-check-circle mr-2 text-base"></i>
                  <span>{successMessage}</span>
                </div>
              )}

              {/* STEP 1: REGISTRATION FORM */}
              {step === 1 && (
                <form className="space-y-5" onSubmit={handleStep1Submit}>
                  {/* 1. First Name */}
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-text-dark mb-1"
                    >
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm ${
                        errors.firstName ? 'border-red-300' : 'border-border-color'
                      }`}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  {/* 2. Last Name */}
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-text-dark mb-1"
                    >
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm ${
                        errors.lastName ? 'border-red-300' : 'border-border-color'
                      }`}
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                    )}
                  </div>

                  {/* 3. Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-text-dark mb-1"
                    >
                      Email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm ${
                        errors.email ? 'border-red-300' : 'border-border-color'
                      }`}
                      placeholder="john.doe@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* 4. Mobile */}
                  <div>
                    <label
                      htmlFor="mobile"
                      className="block text-sm font-medium text-text-dark mb-1"
                    >
                      Mobile *
                    </label>
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      required
                      value={formData.mobile}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm ${
                        errors.mobile ? 'border-red-300' : 'border-border-color'
                      }`}
                      placeholder="+971 50 123 4567"
                    />
                    {errors.mobile && (
                      <p className="mt-1 text-xs text-red-600">{errors.mobile}</p>
                    )}
                  </div>

                  {/* 5. Attached CV */}
                  <div>
                    <label
                      htmlFor="attachedCv"
                      className="block text-sm font-medium text-text-dark mb-1"
                    >
                      Attached CV *
                    </label>
                    <input
                      id="attachedCv"
                      name="attachedCv"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      required
                      onChange={handleChange}
                      className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 border rounded-lg p-1 ${
                        errors.attachedCv ? 'border-red-300' : 'border-border-color'
                      }`}
                    />
                    {formData.attachedCv && (
                      <p className="mt-1 text-xs text-emerald-600">
                        <i className="fas fa-file-pdf mr-1"></i>
                        Selected: {formData.attachedCv.name}
                      </p>
                    )}
                    {errors.attachedCv && (
                      <p className="mt-1 text-xs text-red-600">{errors.attachedCv}</p>
                    )}
                  </div>

                  {/* 6. Nationality */}
                  <div>
                    <label
                      htmlFor="nationality"
                      className="block text-sm font-medium text-text-dark mb-1"
                    >
                      Nationality *
                    </label>
                    <input
                      id="nationality"
                      name="nationality"
                      type="text"
                      required
                      value={formData.nationality}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm ${
                        errors.nationality ? 'border-red-300' : 'border-border-color'
                      }`}
                      placeholder="e.g. Emirati, Indian, British"
                    />
                    {errors.nationality && (
                      <p className="mt-1 text-xs text-red-600">{errors.nationality}</p>
                    )}
                  </div>

                  {/* 7. Currently Located */}
                  <div>
                    <label
                      htmlFor="currentlyLocated"
                      className="block text-sm font-medium text-text-dark mb-1"
                    >
                      Currently Located *
                    </label>
                    <input
                      id="currentlyLocated"
                      name="currentlyLocated"
                      type="text"
                      required
                      value={formData.currentlyLocated}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm ${
                        errors.currentlyLocated ? 'border-red-300' : 'border-border-color'
                      }`}
                      placeholder="e.g. Dubai, UAE"
                    />
                    {errors.currentlyLocated && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.currentlyLocated}
                      </p>
                    )}
                  </div>

                  {/* 8. Visa Status */}
                  <div>
                    <label
                      htmlFor="visaStatus"
                      className="block text-sm font-medium text-text-dark mb-1"
                    >
                      Visa Status *
                    </label>
                    <select
                      id="visaStatus"
                      name="visaStatus"
                      required
                      value={formData.visaStatus}
                      onChange={handleChange}
                      className="block w-full px-3 py-2.5 border border-border-color rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm"
                    >
                      <option value="visitVisa">Visit Visa</option>
                      <option value="residenceVisa">Residence Visa</option>
                      <option value="spouseVisa">Spouse Visa</option>
                    </select>
                    {errors.visaStatus && (
                      <p className="mt-1 text-xs text-red-600">{errors.visaStatus}</p>
                    )}
                  </div>

                  {/* 9. Captcha Verification */}
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Captcha Verification *
                    </label>
                    <div className="flex justify-center">
                      <div
                        ref={recaptchaContainerRef}
                        id="register-recaptcha-container"
                      ></div>
                    </div>
                    {errors.captcha && (
                      <p className="mt-2 text-xs text-red-600 text-center">
                        {errors.captcha}
                      </p>
                    )}
                  </div>

                  {/* 10. Join Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Verifying details...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-arrow-right mr-2"></i>
                          Join
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: EMAIL OTP SCREEN */}
              {step === 2 && (
                <form className="space-y-6" onSubmit={handleStep2Submit}>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-800">
                    <p className="font-semibold mb-1">
                      <i className="fas fa-paper-plane mr-2"></i>
                      OTP Sent to Email
                    </p>
                    <p>
                      We have sent a 6-digit verification code to{' '}
                      <strong>{formData.email}</strong>. Please check your inbox and
                      enter the code below.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="otp"
                      className="block text-sm font-medium text-text-dark mb-2"
                    >
                      6-Digit OTP Code *
                    </label>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, ''))
                        if (errors.otp) setErrors((prev) => ({ ...prev, otp: '' }))
                      }}
                      className={`block w-full text-center text-2xl tracking-widest font-mono py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${
                        errors.otp ? 'border-red-300' : 'border-border-color'
                      }`}
                      placeholder="000000"
                    />
                    {errors.otp && (
                      <p className="mt-2 text-xs text-red-600 text-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.otp}
                      </p>
                    )}
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isLoading || otp.length !== 6}
                      className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Verifying OTP...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check-circle mr-2"></i>
                          Verify OTP
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-text-light pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="hover:text-accent"
                    >
                      ← Back to Registration
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpResendCountdown > 0 || isLoading}
                      className="text-accent hover:underline disabled:opacity-50 disabled:no-underline"
                    >
                      {otpResendCountdown > 0
                        ? `Resend OTP in ${otpResendCountdown}s`
                        : 'Resend OTP'}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: PASSWORD SETUP SCREEN */}
              {step === 3 && (
                <form className="space-y-6" onSubmit={handleStep3Submit}>
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-text-dark mb-2"
                    >
                      Create Password *
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={passwordState.password}
                        onChange={handlePasswordChange}
                        className={`block w-full pr-10 py-3 px-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm ${
                          errors.password ? 'border-red-300' : 'border-border-color'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-light hover:text-accent"
                      >
                        <i
                          className={`fas ${
                            showPassword ? 'fa-eye-slash' : 'fa-eye'
                          }`}
                        ></i>
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                    )}

                    {/* Strength indicator */}
                    {passwordState.password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-text-light">
                            Strength:
                          </span>
                          <span
                            className={`text-xs font-medium ${getPasswordStrengthColor()}`}
                          >
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{
                              width: `${(passwordStrength / 6) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-text-dark mb-2"
                    >
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={passwordState.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`block w-full pr-10 py-3 px-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm ${
                          errors.confirmPassword
                            ? 'border-red-300'
                            : 'border-border-color'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-light hover:text-accent"
                      >
                        <i
                          className={`fas ${
                            showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'
                          }`}
                        ></i>
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-user-check mr-2"></i>
                          Complete Registration
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-text-light">
                  Already have an account?{' '}
                  <Link
                    to={ROUTES.LOGIN}
                    className="font-medium text-accent hover:text-accent/80 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Register
