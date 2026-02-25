/**

 * Header Component

 * Main navigation header with mobile menu support

 */

import React, { useState } from 'react'

import { Link, useLocation } from 'react-router-dom'

import { NAVIGATION_ITEMS, ROUTES } from '../constants'

import { useAuth } from '../context/AuthContext'

/**

 * Header component with navigation and mobile menu

 * @returns {JSX.Element} Header component

 */

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen)
  }

  const handleNavClick = () => {
    setIsMobileMenuOpen(false)
    setIsProfileDropdownOpen(false)
  }

  const isActiveRoute = (path) => {
    return location.pathname === path
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 shadow-lg bg-primary">
      <nav className="py-3 sm:py-4">
        <div className="container px-4">
          <div className="flex justify-between items-center">
            {/* Logos - Left Side */}

            <div className="flex items-center space-x-1">
              <Link
                to="/"
                className="flex items-center no-underline"
                onClick={handleNavClick}
              >
                <img
                  src="/maplorixlogo.svg"
                  alt="Maplorix"
                  className="h-8 sm:h-9 md:h-10 w-auto"
                />
              </Link>

              <img
                src="/logo.svg"
                alt="Maplorix"
                className="h-8 sm:h-9 md:h-10 w-auto"
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <ul className="flex items-center space-x-8 list-none m-0 p-0">
                {NAVIGATION_ITEMS.slice(0, 3).map((item) => (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      onClick={handleNavClick}
                      className={`nav-link ${isActiveRoute(item.path) ? 'active' : ''}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                {isAuthenticated && (
                  <li>
                    <Link
                      to="/dashboard"
                      onClick={handleNavClick}
                      className={`nav-link ${isActiveRoute('/dashboard') ? 'active' : ''}`}
                    >
                      Dashboard
                    </Link>
                  </li>
                )}
                {isAuthenticated && user?.role === 'admin' && (
                  <li>
                    <Link
                      to="/admin/posts"
                      onClick={handleNavClick}
                      className={`nav-link ${isActiveRoute('/admin/posts') ? 'active' : ''}`}
                    >
                      Admin Posts
                    </Link>
                  </li>
                )}
                {NAVIGATION_ITEMS.slice(3).map((item) => (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      onClick={handleNavClick}
                      className={`nav-link ${isActiveRoute(item.path) ? 'active' : ''}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-user text-sm"></i>
                  </div>
                  <span className="text-sm font-medium">
                    {user?.firstName || 'User'}
                  </span>
                  <i className="fas fa-chevron-down text-xs"></i>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                    {isAuthenticated ? (
                      // Logged in user options
                      <>
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                          {user?.role === 'admin' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 mt-1">
                              Admin
                            </span>
                          )}
                        </div>

                        <div className="border-t border-gray-200 my-1"></div>

                        <button
                          onClick={() => {
                            logout()
                            handleNavClick()
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <i className="fas fa-sign-out-alt mr-2"></i>
                          Logout
                        </button>
                      </>
                    ) : (
                      // Not logged in options
                      <div className="py-1">
                        <Link
                          to={ROUTES.LOGIN}
                          onClick={handleNavClick}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <i className="fas fa-sign-in-alt mr-2"></i>
                          Login
                        </Link>

                        <Link
                          to={ROUTES.REGISTER}
                          onClick={handleNavClick}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <i className="fas fa-user-plus mr-2"></i>
                          Sign Up
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}

            <button
              onClick={toggleMobileMenu}
              className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1"
              aria-label="Toggle mobile menu"
            >
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}
              />

              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0' : ''
                }`}
              />

              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}
              />
            </button>
          </div>

          {/* Mobile Navigation */}

          <div
            className={`md:hidden transition-all duration-300 ${
              isMobileMenuOpen
                ? 'max-h-screen opacity-100'
                : 'max-h-0 opacity-0 overflow-hidden'
            }`}
          >
            <ul className="space-y-4 py-4 list-none m-0 p-0">
              {NAVIGATION_ITEMS.slice(0, 3).map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    onClick={handleNavClick}
                    className={`nav-link block w-full text-left py-2 ${
                      isActiveRoute(item.path) ? 'active' : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {isAuthenticated && (
                <li>
                  <Link
                    to="/dashboard"
                    onClick={handleNavClick}
                    className={`nav-link block w-full text-left py-2 ${
                      isActiveRoute('/dashboard') ? 'active' : ''
                    }`}
                  >
                    Dashboard
                  </Link>
                </li>
              )}
              {isAuthenticated && user?.role === 'admin' && (
                <li>
                  <Link
                    to="/admin/posts"
                    onClick={handleNavClick}
                    className={`nav-link block w-full text-left py-2 ${
                      isActiveRoute('/admin/posts') ? 'active' : ''
                    }`}
                  >
                    Admin Posts
                  </Link>
                </li>
              )}
              {NAVIGATION_ITEMS.slice(3).map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    onClick={handleNavClick}
                    className={`nav-link block w-full text-left py-2 ${
                      isActiveRoute(item.path) ? 'active' : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
