import React from 'react';

const About = () => {
  return (
    <section id="about" className="py-16 sm:py-20 bg-white">
      <div className="container px-4">
        <div className="section-header">
          <h2 className="section-title">About Maplorix</h2>
          <div className="divider"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-base sm:text-lg leading-relaxed mb-6 text-text-light px-4">
            Maplorix is a premier job consultancy firm dedicated to creating meaningful connections 
            between talented professionals and forward-thinking organizations. With years of industry 
            experience and a deep understanding of the job market, we provide comprehensive recruitment 
            solutions that drive success for both candidates and employers.
          </p>
          <p className="text-base sm:text-lg leading-relaxed text-text-light px-4">
            Our team of expert consultants works tirelessly to understand your unique needs, ensuring 
            personalized service that delivers exceptional results. Whether you're seeking your next 
            career opportunity or looking to build your dream team, Maplorix is here to guide you 
            every step of the way.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
