import React from 'react';
import { motion } from 'framer-motion';
import lepardsLogo from '../assets/lepardsLogo.jpg';
import outfittersLogo from '../assets/outfittersLogo.png';
import sazgarLogo from '../assets/sazgarLogo.jpg';
import tcsLogo from '../assets/tcsLogo.jpg';
import nishatLogo from '../assets/nishatLogo.png';
import sapphireLogo from '../assets/sapphireLogo.png';
import highnoonLogo from '../assets/highnoonLogo.png';
import dhlLogo from '../assets/dhlLogo.png';
import ClientReviewSection from './ClientReviewSection';

const SectionB = ({ sectionBRef, sectionCRef }) => {
  const logos = [
    { src: outfittersLogo, alt: 'Outfitters Logo' },
    { src: sazgarLogo, alt: 'Sazgar Logo' },
    { src: tcsLogo, alt: 'TCS Logo' },
    { src: nishatLogo, alt: 'Nishat Logo' },
    { src: lepardsLogo, alt: 'Lepards Logo' },
    { src: sapphireLogo, alt: 'Sapphire Logo' },
    { src: highnoonLogo, alt: 'Highnoon Logo' },
    { src: dhlLogo, alt: 'DHL Logo' },
  ];

  // Calculate total width for animation
  const totalWidth = logos.length * (160 + 32); // 160px (w-40) + 32px (gap-8)

  const handlePartnerClick = () => {
    sectionCRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionBRef}
      className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 py-16"
    >
      <div className="text-center mb-16">
        <h2 className="text-4xl text-white font-bold mb-4">Our Trusted Partners</h2>
        <p className="text-xl text-gray-300">Working with the best in the industry</p>
      </div>

      <div className="w-full max-w-6xl overflow-hidden relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-900 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-900 to-transparent z-10"></div>

        {/* Logo Slider Container */}
        <div className="relative flex overflow-hidden">
          {/* First row of logos */}
          <motion.div
            className="flex gap-8 items-center"
            animate={{
              x: [-totalWidth, 0]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
              repeatType: "loop"
            }}
          >
            {logos.map((logo, index) => (
              <motion.div
                key={`row1-${index}`}
                className="flex-shrink-0 bg-white rounded-lg p-4 w-40 h-28 flex items-center justify-center hover:shadow-lg transform hover:scale-105 transition-transform duration-300"
                whileHover={{ y: -5 }}
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="max-w-full max-h-full object-contain"
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Second row of logos (for seamless loop) */}
          <motion.div
            className="flex gap-8 items-center absolute left-0"
            animate={{
              x: [0, totalWidth]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
              repeatType: "loop"
            }}
          >
            {logos.map((logo, index) => (
              <motion.div
                key={`row2-${index}`}
                className="flex-shrink-0 bg-white rounded-lg p-4 w-40 h-28 flex items-center justify-center hover:shadow-lg transform hover:scale-105 transition-transform duration-300"
                whileHover={{ y: -5 }}
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="max-w-full max-h-full object-contain"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Additional Content */}
      <div className="text-center mt-16 max-w-2xl mx-auto px-4">
        <h3 className="text-2xl text-white font-semibold mb-4">Join Our Network</h3>
        <p className="text-gray-300 mb-8">
          Partner with us and become part of our growing network of industry leaders.
          We collaborate with businesses that share our commitment to excellence.
        </p>
        <div className="flex justify-center">
          <button 
            onClick={handlePartnerClick}
            className="btn-primary"
          >
            Become a Partner
          </button>
        </div>
      </div>

      {/* Client Reviews Section */}
      <ClientReviewSection />
    </section>
  );
};

export default SectionB; 