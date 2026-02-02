import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef(null);
  
  const videos = [
    '/job1.mp4',
    '/job2.mp4', 
    '/job3.mp4'
  ];
  
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

  const handleUploadResumeClick = () => {
    navigate('/upload-resume');
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    
    const handleVideoEnd = () => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    };

    if (videoElement) {
      videoElement.addEventListener('ended', handleVideoEnd);
      
      // Auto-play video
      videoElement.play().catch(error => {
        console.log('Auto-play was prevented:', error);
      });
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('ended', handleVideoEnd);
      }
    };
  }, [currentVideoIndex, videos.length]);

  useEffect(() => {
    // Reset video when index changes
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(error => {
        console.log('Auto-play was prevented:', error);
      });
    }
  }, [currentVideoIndex]);

  return (
    <section id="home" className="bg-primary text-white pt-20 sm:pt-24 pb-16 sm:pb-20 relative overflow-hidden min-h-screen flex items-center">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          key={currentVideoIndex}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop={false}
          playsInline
        >
          <source src={videos[currentVideoIndex]} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      <div className="container relative z-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight px-4 drop-shadow-lg">
            Connecting Talent with Opportunity
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 leading-relaxed text-white/95 max-w-3xl mx-auto px-4 drop-shadow-md">
            Maplorix is your trusted partner in career advancement and talent acquisition. 
            We bridge the gap between exceptional professionals and leading companies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <button 
              onClick={handleFindJobsClick}
              className="btn btn-primary text-base sm:text-lg px-6 sm:px-8 lg:px-10 py-3 sm:py-4 w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Find Jobs
            </button>
            <button 
              onClick={handleUploadResumeClick}
              className="btn btn-secondary text-base sm:text-lg px-6 sm:px-8 lg:px-10 py-3 sm:py-4 w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Upload Resume
            </button>
            <button 
              onClick={handleHireTalentClick}
              className="btn btn-accent text-base sm:text-lg px-6 sm:px-8 lg:px-10 py-3 sm:py-4 w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Hire Talent
            </button>
          </div>
          
          {/* Video Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {videos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentVideoIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentVideoIndex 
                    ? 'bg-white w-8' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to video ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
