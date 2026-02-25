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
                {isAuthenticated && user?.role === 'admin' && (
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
                  className="flex items-center space-x-3 text-white hover:text-white/90 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <i className="fas fa-user text-white text-sm"></i>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold">
                      {user?.firstName || 'User'}
                    </span>
                    <span className="text-xs text-white/80">
                      {user?.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </div>
                  <i className="fas fa-chevron-down text-xs transition-transform duration-300 group-hover:translate-y-0.5"></i>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl py-4 z-50 border border-gray-100">
                    {isAuthenticated ? (
                      // Logged in user options
                      <>
                        <div className="px-6 py-4 bg-gradient-to-br from-primary/5 to-secondary/10 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center shadow-lg">
                              <i className="fas fa-user text-white text-lg"></i>
                            </div>
                            <div className="flex-1">
                              <p className="text-base font-bold text-primary">
                                {user?.firstName} {user?.lastName}
                              </p>
                              <p className="text-sm text-text-light truncate">
                                {user?.email}
                              </p>
                              {user?.role === 'admin' && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary/20 text-secondary mt-2">
                                  <i className="fas fa-crown mr-1"></i>
                                  Admin
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          <button
                            onClick={() => {
                              logout()
                              handleNavClick()
                            }}
                            className="w-full flex items-center px-6 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors group"
                          >
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-red-200 transition-colors">
                              <i className="fas fa-sign-out-alt text-red-600 text-sm"></i>
                            </div>
                            <span>Logout</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      // Not logged in options
                      <div className="py-1 space-y-2 px-2">
                        <Link
                          to={ROUTES.LOGIN}
                          onClick={handleNavClick}
                          className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-secondary to-accent rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                        >
                          <i className="fas fa-sign-in-alt mr-2"></i>
                          Login
                        </Link>

                        <Link
                          to={ROUTES.REGISTER}
                          onClick={handleNavClick}
                          className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-primary bg-white border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-300"
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
              {isAuthenticated && user?.role === 'admin' && (
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
              {!isAuthenticated && (
                <li className="pt-4 border-t border-white/20">
                  <div className="space-y-3 px-4">
                    <Link
                      to={ROUTES.LOGIN}
                      onClick={handleNavClick}
                      className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-secondary to-accent rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      <i className="fas fa-sign-in-alt mr-2"></i>
                      Login
                    </Link>

                    <Link
                      to={ROUTES.REGISTER}
                      onClick={handleNavClick}
                      className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-primary bg-white border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-300"
                    >
                      <i className="fas fa-user-plus mr-2"></i>
                      Sign Up
                    </Link>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
