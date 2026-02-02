import React from 'react';
import { Link } from 'react-router-dom';

const Services = () => {
  const candidateServices = [
    {
      icon: 'fa-search',
      image: '/jobsearch.jpg',
      title: 'Job Search Assistance',
      description: 'Personalized job matching based on your skills, experience, and career goals. We connect you with opportunities that align with your aspirations.'
    },
    {
      icon: 'fa-file-alt',
      image: '/resumebuilder.jpg',
      title: 'Resume Building',
      description: 'Professional resume optimization to highlight your strengths and stand out to employers. Our experts help you create compelling resumes.'
    },
    {
      icon: 'fa-user-tie',
      image: '/interviewpreparation.jpg',
      title: 'Interview Preparation',
      description: 'Comprehensive interview coaching including mock interviews, feedback sessions, and confidence-building techniques to ace your interviews.'
    },
    {
      icon: 'fa-chart-line',
      image: '/careercunseling.jpg',
      title: 'Career Counseling',
      description: 'Expert guidance on career path planning, skill development, and professional growth strategies to advance your career effectively.'
    }
  ];

  const employerServices = [
    {
      icon: 'fa-users',
      title: 'Talent Acquisition',
      description: 'End-to-end recruitment solutions to find, attract, and hire the best talent for your organization. We handle the entire hiring process.'
    },
    {
      icon: 'fa-filter',
      title: 'Candidate Screening',
      description: 'Thorough screening and evaluation processes to ensure you get qualified, pre-vetted candidates who match your requirements perfectly.'
    },
    {
      icon: 'fa-handshake',
      title: 'Staffing Solutions',
      description: 'Flexible staffing options including temporary, permanent, and contract placements to meet your dynamic business needs.'
    },
    {
      icon: 'fa-briefcase',
      title: 'Executive Search',
      description: 'Specialized executive recruitment for senior-level positions and leadership roles with confidentiality and precision.'
    }
  ];

  return (
    <section id="services" className="py-16 sm:py-20 bg-gray-50">
      <div className="container px-4">
        <div className="section-header">
          <h2 className="section-title">Our Services</h2>
          <div className="divider"></div>
        </div>

        {/* Services for Candidates */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-primary mb-4">Services for Candidates</h3>
            <p className="text-text-light max-w-2xl mx-auto text-base sm:text-lg">
              We empower job seekers with comprehensive support to find their dream job and advance their careers.
            </p>
          </div>
          
          <div className="space-y-8">
            {candidateServices.map((service, index) => (
              <div key={index} className="card p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Service Image */}
                  <div className="w-full md:w-1/3 overflow-hidden rounded-lg">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-48 md:h-40 object-cover transition-transform duration-300 hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-service.jpg'; // Fallback image
                      }}
                    />
                  </div>
                  
                  {/* Service Content */}
                  <div className="w-full md:w-2/3 text-center md:text-left">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mr-4">
                        <i className={`fas ${service.icon} text-secondary text-xl`}></i>
                      </div>
                      <h4 className="text-xl sm:text-2xl font-bold text-primary">{service.title}</h4>
                    </div>
                    <p className="text-text-light text-base sm:text-lg leading-relaxed">{service.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services for Employers */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-primary mb-4">Services for Employers</h3>
            <p className="text-text-light max-w-2xl mx-auto text-base sm:text-lg">
              We help businesses build exceptional teams with our strategic recruitment and staffing solutions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {employerServices.map((service, index) => (
              <div key={index} className="card p-6 sm:p-8 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className={`fas ${service.icon} text-accent text-2xl`}></i>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-primary mb-4">{service.title}</h4>
                <p className="text-text-light text-sm sm:text-base leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-primary rounded-2xl p-8 sm:p-12 text-white">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto text-base sm:text-lg">
              Whether you're looking for your next career opportunity or seeking top talent for your organization, 
              we're here to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/upload-resume" className="btn btn-secondary text-lg px-8 py-3 text-center no-underline">
                Upload Resume
              </Link>
              <Link to="/contact" className="btn btn-outline text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-primary text-center no-underline">
                Hire Talent
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
