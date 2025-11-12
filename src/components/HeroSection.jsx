import React, { useState, useEffect } from 'react';
import mc1 from '../assets/MC-img/mc1.jpg';
import mc2 from '../assets/MC-img/mc2.jpg';
import mc3 from '../assets/MC-img/mc3.jpg';

const HeroSection = ({ heroRef }) => {
  const images = [mc1, mc2, mc3]; // Array of images
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false); // State to track if the slider is paused

  useEffect(() => {
    let interval;

    // Only set the interval if the slider is not paused
    if (!isPaused) {
      interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000);
    }

    // Clean up the interval on component unmount or when paused
    return () => clearInterval(interval);
  }, [isPaused, images.length]);

  // Function to handle dot click
  const handleDotClick = (index) => {
    setCurrentImageIndex(index);
    setIsPaused(true); // Pause the slider when a dot is clicked
  };

  // Function to handle image click
  const handleImageClick = () => {
    setIsPaused((prev) => !prev); // Toggle pause state on image click
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden bg-slate-900"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(17, 24, 39, 0.5), rgba(17, 24, 39, 0.5)), url(${images[currentImageIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 1, // Ensure the image is visible
        }}
        onClick={handleImageClick} // Pause/resume on image click
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 md:px-8">
        <h1 className="text-4xl sm:text-6xl text-white font-bold mb-4 text-shadow-lg">Welcome to MasterChillers</h1>
        <p className="text-lg sm:text-xl text-white text-shadow">Your Ultimate Destination for Cooling Solutions</p>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              index === currentImageIndex ? 'bg-white' : 'bg-gray-400'
            }`}
            onClick={() => handleDotClick(index)} // Navigate to the clicked slide
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;