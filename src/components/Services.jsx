import React from 'react';

const Services = () => {
  const services = [
    {
      icon: 'fa-briefcase',
      title: 'Job Placement',
      description: 'We connect skilled professionals with their ideal positions, ensuring perfect matches for long-term success.'
    },
    {
      icon: 'fa-users',
      title: 'Recruitment Solutions',
      description: 'Comprehensive recruitment services tailored to your company\'s specific needs and culture.'
    },
    {
      icon: 'fa-compass',
      title: 'Career Guidance',
      description: 'Expert career counseling and guidance to help you navigate your professional journey.'
    },
    {
      icon: 'fa-handshake',
      title: 'Employer Hiring Support',
      description: 'End-to-end hiring support from job posting to candidate onboarding and beyond.'
    }
  ];

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Our Services</h2>
          <div className="divider"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="card p-8 text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className={`fas ${service.icon} text-3xl text-accent`}></i>
              </div>
              <h3 className="text-xl font-bold text-primary mb-4 uppercase">
                {service.title}
              </h3>
              <p className="text-text-light leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
