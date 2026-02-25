// Login Page Component

import React, { useState } from 'react'

import { useAuth } from '../context/AuthContext'

import { Link, useNavigate } from 'react-router-dom'

import { ROUTES } from '../constants'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',

    password: '',
  })

  const [errors, setErrors] = useState({})

  const { login, isLoading, error, clearError } = useAuth()

  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,

      [name]: value,
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

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await login(formData.email, formData.password)

      navigate(ROUTES.DASHBOARD)
    } catch (error) {
      // Error is handled by the auth context
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
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
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
                  } placeholder-text-light text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors`}
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
                  } placeholder-text-light text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors`}
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

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-color"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-text-light">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-border-color rounded-lg shadow-sm bg-white text-sm font-medium text-text-dark hover:bg-gray-50 transition-colors"
            >
              <i className="fab fa-google text-red-500 mr-2"></i>
              Google
            </button>

            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-border-color rounded-lg shadow-sm bg-white text-sm font-medium text-text-dark hover:bg-gray-50 transition-colors"
            >
              <i className="fab fa-linkedin text-blue-600 mr-2"></i>
              LinkedIn
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
