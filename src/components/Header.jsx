/**
 * Header Component
 * Main navigation header with mobile menu support
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../constants';

/**
 * Header component with navigation and mobile menu
 * @returns {JSX.Element} Header component
 */
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 shadow-lg bg-primary">
      <nav className="py-3 sm:py-4">
        <div className="container px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="nav-brand">
              <Link 
                to="/" 
                className="flex items-center no-underline"
                onClick={handleNavClick}
              >
                <img 
                  src="/maplorix.svg" 
                  alt="Maplorix" 
                  className="h-8 sm:h-9 md:h-10 w-auto"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <ul className="hidden md:flex space-x-8">
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
          <div className={`md:hidden transition-all duration-300 ${
            isMobileMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 overflow-hidden'
          }`}>
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
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
