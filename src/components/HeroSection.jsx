import React from 'react';
import mc1 from '../assets/MC-img/mc1.jpg';

const HeroSection = ({ heroRef }) => {
  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center pt-16"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(17, 24, 39, 0.5), rgba(17, 24, 39, 0.5)), url(${mc1})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 md:px-8">
        <h1 className="text-4xl sm:text-6xl text-white font-bold mb-4 text-shadow-lg">Welcome to MasterChillers</h1>
        <p className="text-lg sm:text-xl text-white text-shadow">Your Ultimate Destination for Cooling Solutions</p>
      </div>
    </section>
  );
};

export default HeroSection;