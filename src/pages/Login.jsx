import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../constants'
import { getFriendlyErrorMessage } from '../utils/errorUtils'

const Login = () => {
  const location = useLocation()

  // Google reCAPTCHA site key from environment variable
  const RECAPTCHA_SITE_KEY =
    import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
    '6LeIxAcTAAAAAJcZVRqyHh71UMIEbQjQ5y3FkT_y' // Google's official test key for development

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    captchaToken: '', // For Google reCAPTCHA
  })

  const [errors, setErrors] = useState({})
  const [recaptchaWidgetId, setRecaptchaWidgetId] = useState(null)
  const recaptchaContainerRef = useRef(null)

  const { login, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()

  // Pre-fill email if redirected from register page (e.g. duplicate user popup)
  useEffect(() => {
    if (location.state?.email) {
      setFormData((prev) => ({
        ...prev,
        email: location.state.email,
      }))
    }
  }, [location.state])

  // Render reCAPTCHA explicitly when component mounts
  useEffect(() => {
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
                setFormData((prev) => ({ ...prev, captchaToken: token }))
                setErrors((prev) => ({ ...prev, captcha: '' }))
              },
              'expired-callback': () => {
                setFormData((prev) => ({ ...prev, captchaToken: '' }))
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
  }, [RECAPTCHA_SITE_KEY])

  // Reset reCAPTCHA helper
  const resetRecaptcha = useCallback(() => {
    if (recaptchaWidgetId !== null && window.grecaptcha) {
      try {
        window.grecaptcha.reset(recaptchaWidgetId)
        setFormData((prev) => ({ ...prev, captchaToken: '' }))
      } catch (err) {
        console.error('Error resetting reCAPTCHA:', err)
      }
    }
  }, [recaptchaWidgetId])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }

    if (error) {
      clearError()
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.captchaToken) {
      newErrors.captcha = 'Please complete the CAPTCHA verification.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isLoading) return // Prevent double click

    if (!validateForm()) {
      return
    }

    try {
      const loginResponse = await login(
        formData.email.trim().toLowerCase(),
        formData.password,
        formData.captchaToken
      )

      // Reset form and reCAPTCHA after successful login
      setFormData({
        email: '',
        password: '',
        captchaToken: '',
      })

      resetRecaptcha()

      // Redirect based on role
      const user = loginResponse?.user || loginResponse?.data?.user
      if (user?.role === 'admin') {
        navigate(ROUTES.DASHBOARD)
      } else {
        const returnURL = location.state?.returnUrl || ROUTES.HOME
        navigate(returnURL)
      }
    } catch (err) {
      resetRecaptcha()
      const friendlyMsg = getFriendlyErrorMessage(err)
      setErrors({ form: friendlyMsg })
    }
  }

  const [showPassword, setShowPassword] = useState(false)

  return (
    <div
      className="min-h-screen flex items-center justify-center pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-12 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #010f14 0%, #012530 50%, #01303f 100%)',
      }}
    >
      {/* Subtle background glow */}
      <div
        className="absolute top-0 left-0 w-72 sm:w-96 h-72 sm:h-96 rounded-full opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #4cbd99 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      ></div>
      <div
        className="absolute bottom-0 right-0 w-72 sm:w-96 h-72 sm:h-96 rounded-full opacity-8 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #149fc9 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      ></div>

      {/* Main Container */}
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto relative z-10 w-full">
        {/* Mobile Header (visible only on mobile/tablet < lg) */}
        <div className="lg:hidden text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            Discover Your <span style={{ color: '#4cbd99' }}>Next Career</span> Move
          </h1>
          <p className="text-white/60 text-xs sm:text-sm mt-1.5 max-w-sm mx-auto">
            Connect with top hiring companies across Dubai &amp; the UAE.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 md:gap-12 lg:gap-14 xl:gap-20">
          {/* ── LEFT PANEL — Headline & Features (Desktop/Laptop >= lg) ── */}
          <div className="hidden lg:block lg:w-1/2 max-w-lg">
            {/* Headline */}
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black leading-tight mb-4 text-white">
              Discover Your<br />
              <span style={{ color: '#4cbd99' }}>Next Career</span> Move
            </h1>

            {/* Divider */}
            <div
              className="w-14 h-1 rounded-full mb-5"
              style={{
                background: 'linear-gradient(90deg, #4cbd99, #149fc9)',
              }}
            ></div>

            {/* Description */}
            <p className="text-white/70 text-sm xl:text-base leading-relaxed mb-6 xl:mb-8 max-w-md">
              Connecting talented professionals with top hiring companies across
              Dubai &amp; the UAE. Unlock premium job vacancies and accelerate
              your career with Maplorix.
            </p>

            {/* Feature bullets */}
            <div className="space-y-3.5">
              {[
                'Verified UAE Job Opportunities & Employers',
                'Seamless Application & Recruitment Process',
                'Personalized Career Matching & Resume Insights',
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      background: 'rgba(76,189,153,0.15)',
                      border: '1.5px solid #4cbd99',
                    }}
                  >
                    <i
                      className="fas fa-check text-xs"
                      style={{ color: '#4cbd99' }}
                    ></i>
                  </div>
                  <span className="text-xs xl:text-sm font-semibold text-white/90">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT PANEL — Form Card (Responsive on all screens) ── */}
          <div className="w-full lg:w-auto flex justify-center">
            <div className="w-full max-w-sm sm:max-w-md">
              {/* Card */}
              <div
                className="rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="p-5 sm:p-7 md:p-8">
                  {/* Card header */}
                  <div className="text-center mb-5 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
                      Welcome back
                    </h2>
                    <p className="text-xs text-white/50">
                      Enter your credentials to access your account
                    </p>
                  </div>

                  {/* Location state message */}
                  {location.state?.message && (
                    <div
                      className="mb-4 px-3 py-2.5 rounded-lg text-xs text-cyan-300"
                      style={{
                        background: 'rgba(20,159,201,0.1)',
                        border: '1px solid rgba(20,159,201,0.2)',
                      }}
                    >
                      {location.state.message}
                    </div>
                  )}

                  {/* Error banner */}
                  {(errors.form || error) && (
                    <div
                      className="mb-4 px-3 py-2.5 rounded-lg text-xs text-red-300 flex items-center gap-2"
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                      }}
                    >
                      <i className="fas fa-exclamation-circle flex-shrink-0"></i>
                      <span>
                        {errors.form || getFriendlyErrorMessage(error)}
                      </span>
                    </div>
                  )}

                  <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-semibold mb-1.5"
                        style={{ color: 'rgba(255,255,255,0.75)' }}
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i
                            className="fas fa-envelope text-xs"
                            style={{ color: 'rgba(255,255,255,0.35)' }}
                          ></i>
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="block w-full pl-9 pr-3 py-2.5 text-sm text-white rounded-lg focus:outline-none focus:ring-1 transition-all placeholder-white/25"
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: errors.email
                              ? '1px solid rgba(239,68,68,0.6)'
                              : '1px solid rgba(255,255,255,0.12)',
                          }}
                          placeholder="name@example.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-400">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="password"
                          className="text-xs font-semibold"
                          style={{ color: 'rgba(255,255,255,0.75)' }}
                        >
                          Password
                        </label>
                        <a
                          href="#"
                          className="text-xs transition-colors"
                          style={{ color: 'rgba(255,255,255,0.45)' }}
                          onMouseEnter={(e) =>
                            (e.target.style.color = '#4cbd99')
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.color = 'rgba(255,255,255,0.45)')
                          }
                        >
                          Forgot password?
                        </a>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i
                            className="fas fa-lock text-xs"
                            style={{ color: 'rgba(255,255,255,0.35)' }}
                          ></i>
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="block w-full pl-9 pr-9 py-2.5 text-sm text-white rounded-lg focus:outline-none focus:ring-1 transition-all placeholder-white/25"
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: errors.password
                              ? '1px solid rgba(239,68,68,0.6)'
                              : '1px solid rgba(255,255,255,0.12)',
                          }}
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
                          style={{ color: 'rgba(255,255,255,0.4)' }}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          <i
                            className={`fas ${
                              showPassword ? 'fa-eye-slash' : 'fa-eye'
                            } text-xs`}
                          ></i>
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-xs text-red-400">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    {/* Remember me */}
                    <div className="flex items-center gap-2">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded cursor-pointer"
                        style={{ accentColor: '#4cbd99' }}
                      />
                      <label
                        htmlFor="remember-me"
                        className="text-xs cursor-pointer select-none"
                        style={{ color: 'rgba(255,255,255,0.55)' }}
                      >
                        Remember me for 30 days
                      </label>
                    </div>

                    {/* reCAPTCHA (Responsive Scaling) */}
                    <div className="w-full flex justify-center overflow-hidden py-1">
                      <div className="transform scale-[0.82] sm:scale-90 md:scale-95 origin-center max-w-full">
                        <div
                          ref={recaptchaContainerRef}
                          id="login-recaptcha-container"
                        ></div>
                      </div>
                    </div>
                    {errors.captcha && (
                      <p className="mt-0.5 text-xs text-red-400 text-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.captcha}
                      </p>
                    )}

                    {/* Sign In button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex justify-center items-center gap-2 py-2.5 sm:py-3 px-4 text-sm font-bold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: '#ffffff', color: '#012530' }}
                      onMouseEnter={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.background = '#4cbd99'
                          e.currentTarget.style.color = '#012530'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ffffff'
                        e.currentTarget.style.color = '#012530'
                      }}
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> Signing
                          in...
                        </>
                      ) : (
                        <>
                          Sign in <i className="fas fa-arrow-right text-xs"></i>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Sign up link */}
                  <div className="mt-5 text-center">
                    <p
                      className="text-xs"
                      style={{ color: 'rgba(255,255,255,0.5)' }}
                    >
                      Don't have an account?{' '}
                      <Link
                        to={ROUTES.REGISTER}
                        className="font-bold transition-colors ml-1"
                        style={{ color: '#ffffff' }}
                        onMouseEnter={(e) => (e.target.style.color = '#4cbd99')}
                        onMouseLeave={(e) => (e.target.style.color = '#ffffff')}
                      >
                        Create an account
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
