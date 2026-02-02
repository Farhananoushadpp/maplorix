import React from 'react';

const Hero = () => {
  const handleFindJobsClick = () => {
    const element = document.getElementById('jobs');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHireTalentClick = () => {
    const element = document.getElementById('employers');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="bg-primary text-white pt-20 sm:pt-24 pb-16 sm:pb-20 relative overflow-hidden min-h-screen flex items-center">
      {/* Background Logo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <img 
          src="/maplorixlogo.svg" 
          alt="Maplorix Logo Background" 
          className="w-full h-full object-contain"
        />
      </div>
      
      <div className="container relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight px-4">
            Connecting Talent with Opportunity
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 leading-relaxed text-white/90 max-w-3xl mx-auto px-4">
            Maplorix is your trusted partner in career advancement and talent acquisition. 
            We bridge the gap between exceptional professionals and leading companies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <button 
              onClick={handleFindJobsClick}
              className="btn btn-primary text-base sm:text-lg px-6 sm:px-8 lg:px-10 py-3 sm:py-4 w-full sm:w-auto"
            >
              Find Jobs
            </button>
            <button 
              onClick={handleHireTalentClick}
              className="btn btn-secondary text-base sm:text-lg px-6 sm:px-8 lg:px-10 py-3 sm:py-4 w-full sm:w-auto"
            >
              Hire Talent
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
