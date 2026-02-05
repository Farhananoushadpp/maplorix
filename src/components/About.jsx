import React, { useState, useEffect } from 'react';

const About = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: 'fa-handshake',
      title: 'Meaningful Connections',
      description: 'Employer relationships built on purpose and performance.',
      color: 'text-secondary'
    },
    {
      icon: 'fa-users',
      title: 'Expert Team',
      description: 'Professional advisors with 10+ years industry experience',
      color: 'text-accent'
    },
    {
      icon: 'fa-chart-line',
      title: 'Proven Success',
      description: '98% success rate in placing candidates in dream jobs',
      color: 'text-primary'
    },
    {
      icon: 'fa-globe',
      title: 'Expanding Network',
      description: 'Connecting the right talent with opportunities across regions.',
      color: 'text-secondary'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Success Stories' },
    { number: '500+', label: 'Partner Companies' },
    { number: '98%', label: 'Success Rate' },
    { number: '24/7', label: 'Support Available' }
  ];

  return (
    <section id="about" className="py-20 sm:py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 right-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative z-10 px-4">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-primary">
            About Maplorix
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-secondary to-accent mx-auto rounded-full mt-4"></div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 lg:mb-16">
          <div className={`transition-all duration-1200 transform ${
            isVisible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
          }`}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-100">
                <h3 className="text-xl sm:text-2xl font-bold text-primary mb-3 sm:mb-4">
                  <i className="fas fa-quote-left text-secondary mr-3"></i>
                  Our Mission
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                  Maplorix is a premier recruitment company dedicated to creating meaningful connections 
                  between talented professionals and forward-thinking organizations. We don't just fill positions; 
                  we build careers and transform businesses.
                </p>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  Our team of expert advisors works tirelessly to understand your unique needs, ensuring 
                  personalized service that delivers exceptional results. Whether you're seeking your next 
                  career opportunity or looking to build your dream team, Maplorix is here to guide you 
                  every step of the way.
                </p>
              </div>
            </div>
          </div>

          <div className={`transition-all duration-1400 transform ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {features.map((feature, index) => (
                <div key={index} className="group">
                  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
                    <div className="flex items-center mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-full flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-110 transition-transform">
                        <i className={`fas ${feature.icon} ${feature.color} text-sm sm:text-lg`}></i>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-primary">{feature.title}</h4>
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className={`bg-gradient-to-r from-primary to-primary/90 rounded-2xl p-6 sm:p-8 md:p-12 text-white transition-all duration-1600 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Numbers That Speak</h3>
            <p className="text-white/80 text-sm sm:text-base">Our track record of excellence</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">
                  <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                    {stat.number}
                  </span>
                </div>
                <div className="text-white/80 font-medium text-xs sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
