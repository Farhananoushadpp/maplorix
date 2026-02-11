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

  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleNavClick = () => {
    setIsMobileMenuOpen(false)
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
              <ul className="flex space-x-8">
                {NAVIGATION_ITEMS.map((item) => (
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
                <li>
                  <Link
                    to="/apply"
                    onClick={handleNavClick}
                    className={`nav-link ${isActiveRoute('/apply') ? 'active' : ''}`}
                  >
                    Apply
                  </Link>
                </li>
              </ul>

              {/* Auth Buttons */}
              <div className="flex items-center space-x-3">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-white text-sm font-body">
                      Welcome, {user?.firstName || 'User'}
                    </span>
                    <button
                      onClick={logout}
                      className="header-auth-btn header-auth-btn-outline"
                    >
                      <i className="fas fa-sign-out-alt mr-1"></i>
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link
                      to={ROUTES.LOGIN}
                      className="header-auth-btn header-auth-btn-outline"
                    >
                      <i className="fas fa-sign-in-alt mr-1"></i>
                      Login
                    </Link>
                    <Link
                      to={ROUTES.REGISTER}
                      className="header-auth-btn header-auth-btn-primary"
                    >
                      <i className="fas fa-user-plus mr-1"></i>
                      Sign Up
                    </Link>
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
                ? 'max-h-96 opacity-100 mt-4'
                : 'max-h-0 opacity-0 overflow-hidden'
            }`}
          >
            <ul className="space-y-4 py-4">
              {NAVIGATION_ITEMS.map((item) => (
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

              {/* Mobile Auth Section */}
              <li className="border-t border-white/20 pt-4 mt-4">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="text-white text-sm font-body py-2">
                      Welcome, {user?.firstName || 'User'}
                    </div>
                    <button
                      onClick={() => {
                        logout()
                        handleNavClick()
                      }}
                      className="header-auth-btn header-auth-btn-outline w-full"
                    >
                      <i className="fas fa-sign-out-alt mr-1"></i>
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to={ROUTES.LOGIN}
                      onClick={handleNavClick}
                      className="header-auth-btn header-auth-btn-outline w-full block text-center"
                    >
                      <i className="fas fa-sign-in-alt mr-1"></i>
                      Login
                    </Link>
                    <Link
                      to={ROUTES.REGISTER}
                      onClick={handleNavClick}
                      className="header-auth-btn header-auth-btn-primary w-full block text-center"
                    >
                      <i className="fas fa-user-plus mr-1"></i>
                      Sign Up
                    </Link>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
