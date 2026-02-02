import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Contact from '../components/Contact';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <main>
        <Hero />
        <About />
        <Contact />
      </main>
    </div>
  );
};

export default Home;
