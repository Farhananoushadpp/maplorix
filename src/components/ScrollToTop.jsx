/**
 * Scroll to Top Component
 * Floating button that scrolls to top of page
 */

import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scroll to top button component
 * @returns {JSX.Element} Scroll to top button
 */
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)
  const location = useLocation()

  // Auto-scroll to top when route changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }, [location.pathname])

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 bg-accent text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 z-40 ${
        isVisible
          ? 'opacity-100 visible translate-y-0'
          : 'opacity-0 invisible translate-y-4'
      } hover:bg-secondary hover:transform hover:-translate-y-1`}
      aria-label="Scroll to top"
    >
      <i className="fas fa-arrow-up"></i>
    </button>
  )
}

export default ScrollToTop
