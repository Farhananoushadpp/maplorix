import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FOOTER_LINKS } from '../constants'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setTimeout(() => {
        setIsSubscribed(false)
        setEmail('')
      }, 3000)
    }
  }

  return (
    <footer className="bg-gradient-to-r from-primary to-primary/90 text-white py-8 sm:py-10 md:py-12">
      <div className="container px-4 sm:px-6">
        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-secondary/20 to-accent/20 rounded-xl p-4 sm:p-6 mb-8 sm:mb-12 border border-white/10 backdrop-blur-sm">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3">
              Stay Updated with Latest Jobs
            </h3>
            <p className="text-white/80 mb-4 sm:mb-6 text-sm sm:text-base">
              Get career tips and exclusive opportunities delivered to your
              inbox
            </p>

            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-sm sm:text-base"
                required
              />
              <button
                type="submit"
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-secondary to-accent text-primary font-bold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-sm sm:text-base"
              >
                {isSubscribed ? (
                  <>
                    <i className="fas fa-check mr-2"></i>
                    Subscribed!
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    Subscribe
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 px-2 sm:px-0">
          {/* Company Info */}
          <div className="lg:col-span-1 sm:col-span-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 mb-3 sm:mb-4">
              <img
                src="/maplorixlogo.svg"
                alt="Maplorix"
                className="h-7 sm:h-8 md:h-10 w-auto"
              />
              <img
                src="/logo.svg"
                alt="Maplorix"
                className="h-7 sm:h-8 md:h-10 w-auto"
              />
            </div>
            <p className="text-white/80 leading-relaxed mb-4 text-xs sm:text-sm max-w-xs sm:max-w-none mx-auto sm:mx-0">
              Connecting talent with opportunity since 2020. Your trusted career
              partner.
            </p>

            {/* Social Media */}
            <div className="flex justify-center sm:justify-start space-x-2 sm:space-x-3">
              <a
                href="https://www.facebook.com/JobsinDubaiuaeall/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-300 transform hover:scale-110"
              >
                <i className="fab fa-facebook-f text-xs sm:text-sm"></i>
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-300 transform hover:scale-110"
              >
                <i className="fab fa-twitter text-xs sm:text-sm"></i>
              </a>
              <a
                href="https://www.linkedin.com/company/maplorix/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-300 transform hover:scale-110"
              >
                <i className="fab fa-linkedin-in text-xs sm:text-sm"></i>
              </a>
              <a
                href="https://www.instagram.com/maplorix?igsh=MXR4ajMzb25zbzgyaw=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-300 transform hover:scale-110"
              >
                <i className="fab fa-instagram text-xs sm:text-sm"></i>
              </a>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4">
              Why Choose Us
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 sm:space-y-3">
              <li className="flex items-start sm:items-center justify-center sm:justify-start text-white/80 text-xs sm:text-sm">
                <i className="fas fa-check-circle text-secondary mr-2 mt-0.5 sm:mt-0 flex-shrink-0"></i>
                <span class="text-center sm:text-left">
                  Professional Career Guidance
                </span>
              </li>
              <li className="flex items-start sm:items-center justify-center sm:justify-start text-white/80 text-xs sm:text-sm">
                <i className="fas fa-check-circle text-secondary mr-2 mt-0.5 sm:mt-0 flex-shrink-0"></i>
                <span class="text-center sm:text-left">
                  5000+ Successful Placements
                </span>
              </li>
              <li className="flex items-start sm:items-center justify-center sm:justify-start text-white/80 text-xs sm:text-sm">
                <i className="fas fa-check-circle text-secondary mr-2 mt-0.5 sm:mt-0 flex-shrink-0"></i>
                <span class="text-center sm:text-left">
                  98% Client Satisfaction Rate
                </span>
              </li>
              <li className="flex items-start sm:items-center justify-center sm:justify-start text-white/80 text-xs sm:text-sm">
                <i className="fas fa-check-circle text-secondary mr-2 mt-0.5 sm:mt-0 flex-shrink-0"></i>
                <span class="text-center sm:text-left">
                  24/7 Support Available
                </span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4">
              Quick Links
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 sm:space-y-3">
              <li className="flex items-center justify-center sm:justify-start text-white/80 text-xs sm:text-sm hover:text-secondary transition-colors duration-300">
                <i className="fas fa-search mr-2 text-secondary"></i>
                <Link
                  to={FOOTER_LINKS.quick[0].href}
                  className="hover:text-secondary transition-colors duration-300"
                >
                  {FOOTER_LINKS.quick[0].label}
                </Link>
              </li>
              <li className="flex items-center justify-center sm:justify-start text-white/80 text-xs sm:text-sm hover:text-secondary transition-colors duration-300">
                <i className="fas fa-briefcase mr-2 text-accent"></i>
                <Link
                  to={FOOTER_LINKS.quick[1].href}
                  className="hover:text-secondary transition-colors duration-300"
                >
                  {FOOTER_LINKS.quick[1].label}
                </Link>
              </li>
              <li className="flex items-center justify-center sm:justify-start text-white/80 text-xs sm:text-sm hover:text-secondary transition-colors duration-300">
                <i className="fas fa-info-circle mr-2 text-secondary"></i>
                <Link
                  to={FOOTER_LINKS.quick[2].href}
                  className="hover:text-secondary transition-colors duration-300"
                >
                  {FOOTER_LINKS.quick[2].label}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-1 sm:col-span-2 text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4">
              Contact Us
            </h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-center sm:justify-start text-white/80 text-xs sm:text-sm">
                <i className="fas fa-phone text-secondary mr-2 sm:mr-3 w-4"></i>
                <span class="break-all">044538999, +971581929900</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start text-white/80 text-xs sm:text-sm">
                <i className="fas fa-envelope text-accent mr-2 sm:mr-3 w-4"></i>
                <span class="break-all">info@maplorix.ae</span>
              </div>
              <div className="flex items-start justify-center sm:justify-start text-white/80 text-xs sm:text-sm">
                <i className="fas fa-map-marker-alt text-secondary mr-2 sm:mr-3 w-4 mt-0.5"></i>
                <span className="leading-relaxed text-center sm:text-left max-w-xs">
                  A5 Block, Office No:45, Xavier Business Center, Burj Nahar
                  Mall, Al Muteena, Dubai
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/20 pt-4 sm:pt-6">
          <div className="flex justify-center items-center">
            <div className="text-white/60 text-xs sm:text-sm text-center">
              &copy; 2024{' '}
              <a
                href="https://tarah.ae/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-secondary transition-colors"
              >
                Tarah advertising
              </a>
              . All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
