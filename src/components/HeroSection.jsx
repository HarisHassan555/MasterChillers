import React from 'react';
import mc6 from '../assets/MC-img/mc6.jpg';

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
          backgroundImage: `linear-gradient(to bottom, rgba(17, 24, 39, 0.5), rgba(17, 24, 39, 0.5)), url(${mc6})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center">
        <h1 className="text-6xl text-white font-bold mb-4 text-shadow-lg">Welcome to MasterChillers</h1>
        <p className="text-xl text-white text-shadow">Your Ultimate Destination for Cooling Solutions</p>
      </div>
    </section>
  );
};

export default HeroSection; 