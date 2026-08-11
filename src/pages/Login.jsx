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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary shadow-custom">
            <i className="fas fa-briefcase text-accent text-2xl"></i>
          </div>

          <h2 className="mt-6 text-center text-3xl font-bold text-primary font-heading">
            Sign in to Maplorix
          </h2>

          <p className="mt-2 text-center text-sm text-text-light">
            Access your job recruitment dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-6 rounded-lg shadow-custom space-y-4">
            {location.state?.message && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                {location.state.message}
              </div>
            )}

            {(errors.form || error) && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                <i className="fas fa-exclamation-circle mr-2"></i>
                <span>{errors.form || getFriendlyErrorMessage(error)}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-dark mb-2"
              >
                Email Address
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-envelope text-text-light"></i>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none relative block w-full pl-10 pr-3 py-3 border ${
                    errors.email ? 'border-red-300' : 'border-border-color'
                  } placeholder-text-light text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-dark mb-2"
              >
                Password
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-text-light"></i>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`appearance-none relative block w-full pl-10 pr-3 py-3 border ${
                    errors.password ? 'border-red-300' : 'border-border-color'
                  } placeholder-text-light text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-accent focus:ring-accent border-border-color rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-text-light"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-accent hover:text-accent/80 transition-colors"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            {/* reCAPTCHA Verification */}
            <div>
              <div className="flex justify-center">
                <div
                  ref={recaptchaContainerRef}
                  id="login-recaptcha-container"
                ></div>
              </div>
              {errors.captcha && (
                <p className="mt-2 text-sm text-red-600 text-center flex items-center justify-center">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {errors.captcha}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Signing in...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Sign in
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-text-light">
            Don't have an account?{' '}
            <Link
              to={ROUTES.REGISTER}
              className="font-medium text-accent hover:text-accent/80 transition-colors"
            >
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
