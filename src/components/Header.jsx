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
              </ul>

              {/* Auth Buttons */}
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-white text-sm font-body">
                      Welcome, {user?.firstName || 'User'}
                    </span>
                    <button
                      onClick={logout}
                      className="btn btn-outline text-sm py-2 px-4"
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      to={ROUTES.LOGIN}
                      className="btn btn-outline text-sm py-2 px-4"
                    >
                      <i className="fas fa-sign-in-alt mr-2"></i>
                      Login
                    </Link>
                    <Link
                      to={ROUTES.REGISTER}
                      className="btn btn-primary text-sm py-2 px-4"
                    >
                      <i className="fas fa-user-plus mr-2"></i>
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
                      className="btn btn-outline w-full text-sm py-2"
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to={ROUTES.LOGIN}
                      onClick={handleNavClick}
                      className="btn btn-outline w-full text-sm py-2 block"
                    >
                      <i className="fas fa-sign-in-alt mr-2"></i>
                      Login
                    </Link>
                    <Link
                      to={ROUTES.REGISTER}
                      onClick={handleNavClick}
                      className="btn btn-primary w-full text-sm py-2 block"
                    >
                      <i className="fas fa-user-plus mr-2"></i>
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
