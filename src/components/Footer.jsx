import React from 'react';
import { Link } from 'react-router-dom';
import { FOOTER_LINKS } from '../constants';

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-12 sm:py-16">
      <div className="container px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/maplorixlogo.svg" 
                alt="Maplorix Logo" 
                className="h-6 sm:h-7 md:h-8 w-auto"
              />
              <img 
                src="/logo.svg" 
                alt="Maplorix" 
                className="h-6 sm:h-7 md:h-8 w-auto"
              />
            </div>
            <p className="text-white/80 leading-relaxed text-sm sm:text-base">
              Connecting talent with opportunity since 2020. Your trusted partner in career advancement and recruitment.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 uppercase">Quick Links</h4>
            <ul className="space-y-2 sm:space-y-3">
              {FOOTER_LINKS.quick.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-white/80 hover:text-secondary transition-colors duration-300 text-sm sm:text-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 uppercase">For Employers</h4>
            <ul className="space-y-2 sm:space-y-3">
              {FOOTER_LINKS.employers.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-white/80 hover:text-secondary transition-colors duration-300 text-sm sm:text-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Candidates */}
          <div>
            <h4 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 uppercase">For Candidates</h4>
            <ul className="space-y-2 sm:space-y-3">
              {FOOTER_LINKS.candidates.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-white/80 hover:text-secondary transition-colors duration-300 text-sm sm:text-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/10 pt-6 sm:pt-8 text-center">
          <p className="text-white/60 text-sm sm:text-base">
            &copy; 2024 Maplorix. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
