// Signup Page Component
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants'

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'candidate', // candidate or employer
    phone: '',
    company: '', // only for employers
  })
  const [errors, setErrors] = useState({})

  const { register, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'radio' ? value : value,
    }))

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }

    // Clear general error when user starts typing
    if (error) {
      clearError()
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid'
    }

    if (formData.userType === 'employer' && !formData.company.trim()) {
      newErrors.company = 'Company name is required for employers'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        userType: formData.userType,
        ...(formData.userType === 'employer' && { company: formData.company }),
      }

      await register(userData)
      navigate('/dashboard')
    } catch (error) {
      // Error is handled by the auth context
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-teal-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-custom-hover p-8 space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-secondary">
            <i className="fas fa-user-plus text-white text-2xl"></i>
          </div>
          <h2 className="mt-6 text-center text-3xl font-heading text-primary font-bold uppercase tracking-wide">
            Join Maplorix
          </h2>
          <p className="mt-2 text-center text-sm text-text-light font-body">
            Create your account and start your journey
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* User Type Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-heading text-primary font-semibold uppercase tracking-wide mb-2">
              I am a:
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="candidate"
                  checked={formData.userType === 'candidate'}
                  onChange={handleChange}
                  className="mr-2 text-secondary focus:ring-secondary"
                />
                <span className="text-sm font-body text-primary">
                  Job Seeker
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="employer"
                  checked={formData.userType === 'employer'}
                  onChange={handleChange}
                  className="mr-2 text-secondary focus:ring-secondary"
                />
                <span className="text-sm font-body text-primary">Employer</span>
              </label>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-heading text-primary font-semibold uppercase tracking-wide mb-2"
              >
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className={`appearance-none relative block w-full px-4 py-3 border-2 ${
                  errors.firstName ? 'border-red-500' : 'border-border-color'
                } placeholder-text-light text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300 font-body`}
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600 font-body">
                  {errors.firstName}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-heading text-primary font-semibold uppercase tracking-wide mb-2"
              >
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className={`appearance-none relative block w-full px-4 py-3 border-2 ${
                  errors.lastName ? 'border-red-500' : 'border-border-color'
                } placeholder-text-light text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300 font-body`}
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600 font-body">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Company Name (only for employers) */}
          {formData.userType === 'employer' && (
            <div>
              <label
                htmlFor="company"
                className="block text-sm font-heading text-primary font-semibold uppercase tracking-wide mb-2"
              >
                Company Name
              </label>
              <input
                id="company"
                name="company"
                type="text"
                required={formData.userType === 'employer'}
                className={`appearance-none relative block w-full px-4 py-3 border-2 ${
                  errors.company ? 'border-red-500' : 'border-border-color'
                } placeholder-text-light text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300 font-body`}
                placeholder="Company name"
                value={formData.company}
                onChange={handleChange}
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-600 font-body">
                  {errors.company}
                </p>
              )}
            </div>
          )}

          {/* Email and Phone */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-heading text-primary font-semibold uppercase tracking-wide mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none relative block w-full px-4 py-3 border-2 ${
                  errors.email ? 'border-red-500' : 'border-border-color'
                } placeholder-text-light text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300 font-body`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 font-body">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-heading text-primary font-semibold uppercase tracking-wide mb-2"
              >
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className={`appearance-none relative block w-full px-4 py-3 border-2 ${
                  errors.phone ? 'border-red-500' : 'border-border-color'
                } placeholder-text-light text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300 font-body`}
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 font-body">
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* Password Fields */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-heading text-primary font-semibold uppercase tracking-wide mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`appearance-none relative block w-full px-4 py-3 border-2 ${
                  errors.password ? 'border-red-500' : 'border-border-color'
                } placeholder-text-light text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300 font-body`}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 font-body">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-heading text-primary font-semibold uppercase tracking-wide mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`appearance-none relative block w-full px-4 py-3 border-2 ${
                  errors.confirmPassword
                    ? 'border-red-500'
                    : 'border-border-color'
                } placeholder-text-light text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300 font-body`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 font-body">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <i className="fas fa-exclamation-circle text-red-400"></i>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-heading text-red-800 font-semibold uppercase">
                    Registration failed
                  </h3>
                  <div className="mt-2 text-sm text-red-700 font-body">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-6 border border-transparent text-base font-heading font-semibold text-white bg-secondary hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed rounded-full uppercase tracking-wide transition-all duration-300 transform hover:-translate-y-0.5 shadow-custom hover:shadow-custom-hover"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Creating account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus mr-2"></i>
                  Create Account
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-text-light font-body">
              Already have an account?{' '}
              <Link
                to={ROUTES.LOGIN}
                className="font-semibold text-accent hover:text-blue-700 font-heading uppercase tracking-wide transition-colors duration-300"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-text-light font-body">
              By creating an account, you agree to our Terms of Service and
              Privacy Policy
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Signup
