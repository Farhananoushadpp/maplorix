import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FOOTER_LINKS } from '../constants';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

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
              Get career tips and exclusive opportunities delivered to your inbox
            </p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Company Info */}
          <div className="lg:col-span-1 sm:col-span-2">
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <img 
                src="/maplorix.svg" 
                alt="Maplorix" 
                className="h-8 sm:h-10 w-auto"
              />
            </div>
            <p className="text-white/80 leading-relaxed mb-4 text-xs sm:text-sm">
              Connecting talent with opportunity since 2020. Your trusted career partner.
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-2 sm:space-x-3">
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-300 transform hover:scale-110">
                <i className="fab fa-facebook-f text-xs sm:text-sm"></i>
              </a>
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-300 transform hover:scale-110">
                <i className="fab fa-twitter text-xs sm:text-sm"></i>
              </a>
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-300 transform hover:scale-110">
                <i className="fab fa-linkedin-in text-xs sm:text-sm"></i>
              </a>
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-300 transform hover:scale-110">
                <i className="fab fa-instagram text-xs sm:text-sm"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Quick Links</h4>
            <ul className="space-y-1 sm:space-y-2">
              {FOOTER_LINKS.quick.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-white/80 hover:text-secondary transition-colors duration-300 text-xs sm:text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">For Employers</h4>
            <ul className="space-y-1 sm:space-y-2">
              {FOOTER_LINKS.employers.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-white/80 hover:text-accent transition-colors duration-300 text-xs sm:text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-1 sm:col-span-2">
            <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Contact Us</h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center text-white/80 text-xs sm:text-sm">
                <i className="fas fa-phone text-secondary mr-3 w-4"></i>
                +1 (555) 123-4567
              </div>
              <div className="flex items-center text-white/80 text-xs sm:text-sm">
                <i className="fas fa-envelope text-accent mr-3 w-4"></i>
                info@maplorix.com
              </div>
              <div className="flex items-center text-white/80 text-xs sm:text-sm">
                <i className="fas fa-map-marker-alt text-secondary mr-3 w-4"></i>
                New York, NY
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/20 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-white/60 text-xs sm:text-sm mb-3 sm:mb-0 text-center sm:text-left">
              &copy; 2024 Maplorix. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end gap-3 sm:gap-4 text-xs sm:text-sm">
              <a href="#" className="text-white/60 hover:text-secondary transition-colors">Privacy Policy</a>
              <a href="#" className="text-white/60 hover:text-secondary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
