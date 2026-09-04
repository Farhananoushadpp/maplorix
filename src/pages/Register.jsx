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
      visaStatus: '',
      industry: '',
      otherIndustry: '',
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

      if (response.success || response.status === 'success' || response.data) {
        setSuccessMessage(`A 6-digit OTP code has been sent to ${formData.email}. Please verify to continue.`)
        setOtpResendCountdown(60)
        setIsExistingUser(false)
        setStep(2) // Move to OTP verification screen
      }
    } catch (error) {
      console.error('Send OTP error:', error)
      const errorData = error.response?.data
      const errorCode = errorData?.errorCode || errorData?.code
      const errorMessage = errorData?.message || errorData?.error || ''

      const isEmailDuplicate =
        errorMessage.toLowerCase().includes('email') ||
        errorCode === 'EMAIL_ALREADY_EXISTS'
      const isMobileDuplicate =
        errorMessage.toLowerCase().includes('mobile') ||
        errorMessage.toLowerCase().includes('phone') ||
        errorCode === 'MOBILE_ALREADY_EXISTS' ||
        errorCode === 'PHONE_ALREADY_EXISTS'

      if (
        errorCode === 'USER_ALREADY_EXISTS' ||
        isEmailDuplicate ||
        isMobileDuplicate ||
        error.response?.status === 409
      ) {
        setIsExistingUser(true)

        let reasonMessage = ''
        if (isEmailDuplicate && isMobileDuplicate) {
          reasonMessage = `Both the email address (${formData.email}) and mobile number (${formData.mobile}) are already registered with an existing Maplorix account.`
          setErrors({
            email: 'This email address is already registered',
            mobile: 'This mobile number is already registered',
          })
        } else if (isEmailDuplicate) {
          reasonMessage = `The email address "${formData.email}" is already in use by an existing account. Please sign in or use a different email.`
          setErrors({ email: 'This email address is already registered' })
        } else if (isMobileDuplicate) {
          reasonMessage = `The mobile number "${formData.mobile}" is already in use by an existing account. Please sign in or use a different number.`
          setErrors({ mobile: 'This mobile number is already registered' })
        } else {
          reasonMessage =
            errorMessage && !errorMessage.includes('500')
              ? errorMessage
              : 'An account with this email address or mobile number already exists in Maplorix.'
        }

        setExistingUserMessage(reasonMessage)
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
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 backdrop-blur-sm">
          <i className="fas fa-briefcase text-secondary"></i>
          Your Career Journey Starts Here
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-2 drop-shadow-lg">
          {step === 1 && <>Join <span className="text-secondary">Maplorix</span> &amp; Find Your Dream Job</>}
          {step === 2 && <>Verify Your <span className="text-secondary">Email</span></>}
          {step === 3 && <>Set Your <span className="text-secondary">Password</span></>}
        </h1>
        <p className="text-white/65 text-sm sm:text-base max-w-lg mx-auto">
          {step === 1 && 'Create your free account and connect with top employers across the UAE.'}
          {step === 2 && `We sent a 6-digit code to ${formData.email}. Please check your inbox.`}
          {step === 3 && 'Almost there! Choose a strong password to secure your account.'}
        </p>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mt-5">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${step > s
                ? 'border-secondary bg-secondary text-primary'
                : step === s
                  ? 'border-secondary bg-white/15 text-white'
                  : 'border-white/25 bg-white/8 text-white/35'
                }`}>
                {step > s ? <i className="fas fa-check text-xs"></i> : s}
              </div>
              {s < 3 && <div className={`w-8 h-0.5 rounded-full transition-all duration-300 ${step > s ? 'bg-secondary' : 'bg-white/20'}`}></div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── FORM CARD ── */}
      <div className="relative z-10 pb-12 px-4 sm:px-6">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl shadow-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.98)', border: '1px solid rgba(255,255,255,0.25)' }}>

            {/* Card top accent bar — teal to blue */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #4cbd99, #149fc9, #4cbd99)' }}></div>

            <div className="px-5 py-6 sm:px-7">

              {/* EXISTING USER FAILURE MESSAGE */}
              {isExistingUser ? (
                <div className="text-center space-y-4 py-2">
                  <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100 text-red-600 shadow-md">
                    <i className="fas fa-user-times text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Registration Failed</h3>
                    <p className="text-xs text-gray-500">Account already exists</p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 text-left mt-3">
                      <p className="font-semibold flex items-center gap-1.5 mb-1 text-red-800">
                        <i className="fas fa-exclamation-circle text-red-500"></i>
                        Reason for failure:
                      </p>
                      <p className="leading-relaxed">
                        {existingUserMessage || 'An account with this email address or mobile number already exists.'}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 flex flex-col gap-2">
                    <Link
                      to={ROUTES.LOGIN}
                      state={{ email: formData.email }}
                      className="w-full flex justify-center items-center gap-2 py-2.5 px-4 text-sm font-bold rounded-lg text-white transition-all shadow-md hover:shadow-lg"
                      style={{ background: 'linear-gradient(90deg, #023341, #149fc9)' }}
                    >
                      <i className="fas fa-sign-in-alt text-xs"></i> Sign In to Existing Account
                    </Link>
                    <button
                      type="button"
                      onClick={() => setIsExistingUser(false)}
                      className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 text-xs font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all"
                    >
                      <i className="fas fa-edit text-xs"></i> Change Email / Mobile &amp; Try Again
                    </button>
                    <button
                      type="button"
                      onClick={handleNewRegistration}
                      className="w-full text-xs text-gray-500 hover:text-gray-700 py-1 transition-colors"
                    >
                      Clear form and start over
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Global Error Banner */}
                  {errors.submit && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-lg text-xs flex items-center">
                      <i className="fas fa-exclamation-circle mr-2"></i>
                      <span>{errors.submit}</span>
                    </div>
                  )}

                  {/* Global Success Banner */}
                  {successMessage && (
                    <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2.5 rounded-lg text-xs flex items-center">
                      <i className="fas fa-check-circle mr-2"></i>
                      <span>{successMessage}</span>
                    </div>
                  )}

                  {/* STEP 1: REGISTRATION FORM */}
                  {step === 1 && (
                    <form className="space-y-3" onSubmit={handleStep1Submit}>
                      {/* First & Last Name row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="firstName" className="block text-xs font-semibold text-gray-600 mb-1">First Name *</label>
                          <input
                            id="firstName" name="firstName" type="text" required
                            value={formData.firstName} onChange={handleChange}
                            className={`block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all ${errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}
                            placeholder="John"
                          />
                          {errors.firstName && <p className="mt-0.5 text-xs text-red-600">{errors.firstName}</p>}
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-xs font-semibold text-gray-600 mb-1">Last Name *</label>
                          <input
                            id="lastName" name="lastName" type="text" required
                            value={formData.lastName} onChange={handleChange}
                            className={`block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all ${errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}
                            placeholder="Doe"
                          />
                          {errors.lastName && <p className="mt-0.5 text-xs text-red-600">{errors.lastName}</p>}
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="email" className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                        <input
                          id="email" name="email" type="email" required
                          value={formData.email} onChange={handleChange}
                          className={`block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}
                          placeholder="john.doe@example.com"
                        />
                        {errors.email && <p className="mt-0.5 text-xs text-red-600">{errors.email}</p>}
                      </div>

                      {/* Mobile */}
                      <div>
                        <label htmlFor="mobile" className="block text-xs font-semibold text-gray-600 mb-1">Mobile *</label>
                        <input
                          id="mobile" name="mobile" type="tel" required
                          value={formData.mobile} onChange={handleChange}
                          className={`block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all ${errors.mobile ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}
                          placeholder="+971 50 123 4567"
                        />
                        {errors.mobile && <p className="mt-0.5 text-xs text-red-600">{errors.mobile}</p>}
                      </div>

                      {/* Attached CV */}
                      <div>
                        <label htmlFor="attachedCv" className="block text-xs font-semibold text-gray-600 mb-1">Attach CV *</label>
                        <input
                          id="attachedCv" name="attachedCv" type="file"
                          accept=".pdf,.doc,.docx" required onChange={handleChange}
                          className={`block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 border rounded-lg p-1 transition-all ${errors.attachedCv ? 'border-red-300' : 'border-gray-200 bg-gray-50'}`}
                        />
                        {formData.attachedCv && (
                          <p className="mt-0.5 text-xs text-emerald-600">
                            <i className="fas fa-file-pdf mr-1"></i>{formData.attachedCv.name}
                          </p>
                        )}
                        {errors.attachedCv && <p className="mt-0.5 text-xs text-red-600">{errors.attachedCv}</p>}
                      </div>

                      {/* Nationality & Location row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="nationality" className="block text-xs font-semibold text-gray-600 mb-1">Nationality *</label>
                          <input
                            id="nationality" name="nationality" type="text" required
                            value={formData.nationality} onChange={handleChange}
                            className={`block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all ${errors.nationality ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}
                            placeholder="e.g. Indian"
                          />
                          {errors.nationality && <p className="mt-0.5 text-xs text-red-600">{errors.nationality}</p>}
                        </div>
                        <div>
                          <label htmlFor="currentlyLocated" className="block text-xs font-semibold text-gray-600 mb-1">Currently Located *</label>
                          <select
                            id="currentlyLocated" name="currentlyLocated" required
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
                            className={`block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all ${errors.currentlyLocated ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}
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
                          <label htmlFor="visaStatus" className="block text-xs font-semibold text-gray-600 mb-1">Visa Status *</label>
                          <select
                            id="visaStatus" name="visaStatus" required
                            value={formData.visaStatus} onChange={handleChange}
                            className={`block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all ${errors.visaStatus ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}
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
                        <label htmlFor="industry" className="block text-xs font-semibold text-gray-600 mb-1">Industry *</label>
                        <select
                          id="industry" name="industry" required
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
                          className={`block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all ${errors.industry ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}
                        >
                          <option value=
                            "">Select Industry</option>
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
                          <label htmlFor="otherIndustry" className="block text-xs font-semibold text-gray-600 mb-1">
                            Specify Industry *
                          </label>
                          <input
                            id="otherIndustry"
                            name="otherIndustry"
                            type="text"
                            required
                            value={formData.otherIndustry}
                            onChange={handleChange}
                            className={`block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all ${errors.otherIndustry ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
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
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Captcha Verification *</label>
                        <div className="flex justify-center">
                          <div ref={recaptchaContainerRef} id="register-recaptcha-container"></div>
                        </div>
                        {errors.captcha && <p className="mt-1 text-xs text-red-600 text-center">{errors.captcha}</p>}
                      </div>

                      {/* Submit */}
                      <button
                        type="submit" disabled={isLoading}
                        className="w-full flex justify-center items-center py-2.5 px-4 text-sm font-bold rounded-lg text-white transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(90deg, #023341, #149fc9)' }}
                      >
                        {isLoading ? (
                          <><i className="fas fa-spinner fa-spin mr-2"></i>Verifying...</>
                        ) : (
                          <><i className="fas fa-arrow-right mr-2"></i>Create Account</>
                        )}
                      </button>
                    </form>
                  )}

                  {/* STEP 2: OTP */}
                  {step === 2 && (
                    <form className="space-y-4" onSubmit={handleStep2Submit}>
                      <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-lg text-sm text-blue-800">
                        <p className="font-semibold mb-1 text-xs">
                          <i className="fas fa-paper-plane mr-2"></i>OTP Sent to Email
                        </p>
                        <p className="text-xs">
                          We sent a 6-digit code to <strong>{formData.email}</strong>. Check your inbox.
                        </p>
                      </div>

                      <div>
                        <label htmlFor="otp" className="block text-xs font-semibold text-gray-600 mb-1.5">6-Digit OTP Code *</label>
                        <input
                          id="otp" name="otp" type="text" maxLength={6} required
                          value={otp}
                          onChange={(e) => {
                            setOtp(e.target.value.replace(/\D/g, ''))
                            if (errors.otp) setErrors((prev) => ({ ...prev, otp: '' }))
                          }}
                          className={`block w-full text-center text-2xl tracking-widest font-mono py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all ${errors.otp ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                          placeholder="000000"
                        />
                        {errors.otp && (
                          <p className="mt-1.5 text-xs text-red-600 text-center">
                            <i className="fas fa-exclamation-circle mr-1"></i>{errors.otp}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit" disabled={isLoading || otp.length !== 6}
                        className="w-full flex justify-center items-center py-2.5 px-4 text-sm font-bold rounded-lg text-white transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(90deg, #023341, #149fc9)' }}
                      >
                        {isLoading ? (
                          <><i className="fas fa-spinner fa-spin mr-2"></i>Verifying OTP...</>
                        ) : (
                          <><i className="fas fa-check-circle mr-2"></i>Verify OTP</>
                        )}
                      </button>

                      <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                        <button type="button" onClick={() => setStep(1)} className="hover:text-primary transition-colors">
                          ← Back
                        </button>
                        <button
                          type="button" onClick={handleResendOtp}
                          disabled={otpResendCountdown > 0 || isLoading}
                          className="font-medium hover:underline disabled:opacity-50 disabled:no-underline transition-colors"
                          style={{ color: '#149fc9' }}
                        >
                          {otpResendCountdown > 0 ? `Resend in ${otpResendCountdown}s` : 'Resend OTP'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* STEP 3: PASSWORD */}
                  {step === 3 && (
                    <form className="space-y-4" onSubmit={handleStep3Submit}>
                      <div>
                        <label htmlFor="password" className="block text-xs font-semibold text-gray-600 mb-1.5">Create Password *</label>
                        <div className="relative">
                          <input
                            id="password" name="password"
                            type={showPassword ? 'text' : 'password'} required
                            value={passwordState.password} onChange={handlePasswordChange}
                            className={`block w-full pr-10 py-2.5 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                            placeholder="••••••••"
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary transition-colors">
                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                        </div>
                        {errors.password && <p className="mt-0.5 text-xs text-red-600">{errors.password}</p>}

                        {passwordState.password && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-400">Strength:</span>
                              <span className={`text-xs font-semibold ${getPasswordStrengthColor()}`}>{getPasswordStrengthText()}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1">
                              <div
                                className={`h-1 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                style={{ width: `${(passwordStrength / 6) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm Password *</label>
                        <div className="relative">
                          <input
                            id="confirmPassword" name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'} required
                            value={passwordState.confirmPassword} onChange={handlePasswordChange}
                            className={`block w-full pr-10 py-2.5 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                            placeholder="••••••••"
                          />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary transition-colors">
                            <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="mt-0.5 text-xs text-red-600">{errors.confirmPassword}</p>}
                      </div>

                      <button
                        type="submit" disabled={isLoading}
                        className="w-full flex justify-center items-center py-2.5 px-4 text-sm font-bold rounded-lg text-white transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(90deg, #023341, #149fc9)' }}
                      >
                        {isLoading ? (
                          <><i className="fas fa-spinner fa-spin mr-2"></i>Creating Account...</>
                        ) : (
                          <><i className="fas fa-user-check mr-2"></i>Complete Registration</>
                        )}
                      </button>
                    </form>
                  )}

                  {/* Sign In Link */}
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-400">
                      Already have an account?{' '}
                      <Link to={ROUTES.LOGIN} className="font-semibold transition-colors" style={{ color: '#149fc9' }}>
                        Sign in
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
