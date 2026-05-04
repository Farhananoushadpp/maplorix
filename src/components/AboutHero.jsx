import React, { useState, useEffect } from 'react'

const AboutHero = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])
  return (
    <section className="relative min-h-[60vh] bg-gradient-to-br from-primary via-primary/95 to-primary/90 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute top-20 left-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        ></div>
        <div
          className={`absolute top-40 right-20 w-48 h-48 bg-accent/20 rounded-full blur-3xl transition-all duration-1200 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        ></div>
        <div
          className={`absolute bottom-20 left-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl transition-all duration-1400 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center justify-center py-20">
        <div className="text-center text-white max-w-4xl mx-auto">
          {/* Main Title */}
          <div
            className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight pt-8">
              About
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent mt-2">
                Maplorix
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <div
            className={`transition-all duration-1200 transform delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
          >
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 leading-relaxed font-light">
              Connecting Talent with Opportunity Since 2020
            </p>
          </div>

          {/* Description */}
          <div
            className={`transition-all duration-1400 transform delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
          >
            <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed mb-12">
              We are a premier recruitment company dedicated to creating
              meaningful connections between talented professionals and
              forward-thinking organizations. Your success is our mission.
            </p>
          </div>

          {/* Call to Action Buttons */}
          <div
            className={`transition-all duration-1600 transform delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/jobs"
                className="px-8 py-4 bg-gradient-to-r from-secondary to-accent text-white font-bold rounded-full hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-center"
              >
                <i className="fas fa-search mr-2"></i>
                Find Jobs
              </a>
              <a
                href="/contact"
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-full border border-white/30 hover:bg-white/30 transform hover:scale-105 transition-all duration-300 text-center"
              >
                <i className="fas fa-phone mr-2"></i>
                Contact Us
              </a>
            </div>
          </div>

          {/* Quick Stats */}
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-16 transition-all duration-1800 transform delay-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-black text-secondary mb-2">
                15K+
              </div>
              <div className="text-white/70 text-sm md:text-base">
                Success Stories
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-black text-accent mb-2">
                1000+
              </div>
              <div className="text-white/70 text-sm md:text-base">
                Partner Companies
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-black text-secondary mb-2">
                98%
              </div>
              <div className="text-white/70 text-sm md:text-base">
                Success Rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-black text-accent mb-2">
                24/7
              </div>
              <div className="text-white/70 text-sm md:text-base">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-2000 delay-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
      >
        <div className="animate-bounce">
          <i className="fas fa-chevron-down text-white/60 text-2xl"></i>
        </div>
      </div>
    </section>
  )
}

export default AboutHero
