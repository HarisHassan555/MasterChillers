import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mc7 from '../assets/MC-img/mc7.jpg';
import mc1 from '../assets/MC-img/mc1.jpg';
import mc8 from '../assets/MC-img/mc8.jpg';
import mc11 from '../assets/MC-img/mc11.jpg';
import mc12 from '../assets/MC-img/mc12.jpg';
import mc13 from '../assets/MC-img/mc13.jpg';
import Stats from './Stats';

const ServiceCard = ({ title, description, features, images, isReversed }) => {
  const containerClass = `flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 mb-20`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={containerClass}
    >
      <div className="w-full md:w-1/2">
        <h3 className="heading-secondary">{title}</h3>
        <p className="text-gray-300 leading-relaxed mb-6">
          {description}
        </p>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-gray-300">
              <span className="text-sky-500 mr-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
      {Array.isArray(images) ? (
        <div className="w-full md:w-1/2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <img 
                src={images[0]} 
                alt={`${title} Main`}
                className="w-full h-64 object-cover rounded-lg shadow-xl hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
            <div>
              <img 
                src={images[1]} 
                alt={`${title} Secondary`}
                className="w-full h-40 object-cover rounded-lg shadow-xl hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
            <div>
              <img 
                src={images[2]} 
                alt={`${title} Tertiary`}
                className="w-full h-40 object-cover rounded-lg shadow-xl hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full md:w-1/2">
          <img 
            src={images} 
            alt={title}
            className="w-full h-[350px] object-cover rounded-lg shadow-xl hover:scale-[1.02] transition-transform duration-300"
          />
        </div>
      )}
    </motion.div>
  );
};

const SectionA = ({ sectionARef }) => {
  const [currentMarqueeIndex, setCurrentMarqueeIndex] = useState(0);
  
  const marqueeImages = [
    { src: mc11, alt: 'Outdoor Marquee Setup' },
    { src: mc12, alt: 'Marquee Installation' },
    { src: mc13, alt: 'Event Marquee' }
  ];

  useEffect(() => {
    const marqueeInterval = setInterval(() => {
      setCurrentMarqueeIndex((prevIndex) => (prevIndex + 1) % marqueeImages.length);
    }, 3000);

    return () => clearInterval(marqueeInterval);
  }, []);

  const services = [
    {
      title: "Rental Chiller Cabinet",
      description: "Our premium rental chiller cabinets provide the perfect solution for your temporary cooling needs. Whether you're hosting an event or need backup cooling solutions, our cabinets offer:",
      features: [
        "Temperature range from -5°C to +10°C",
        "Energy-efficient operation",
        "Multiple size options available",
        "24/7 technical support"
      ],
      images: [mc7, mc1, mc8]
    },
    {
      title: "Soundless Generator",
      description: "Experience uninterrupted power supply without the noise. Our soundless generators are perfect for residential areas, events, and commercial applications where noise control is crucial.",
      features: [
        "Ultra-quiet operation (less than 60dB)",
        "Fuel-efficient performance",
        "Available in various power outputs",
        "Automatic voltage regulation"
      ],
      images: mc1
    },
    {
      title: "Portable Outdoor Marquees",
      description: "Transform any outdoor space into a comfortable venue with our portable marquees. Perfect for events, exhibitions, and temporary outdoor setups.",
      features: [
        "Quick and easy setup",
        "Weather-resistant materials",
        "Customizable sizes and configurations",
        "Professional installation available"
      ],
      images: marqueeImages[currentMarqueeIndex].src
    }
  ];

  return (
    <section ref={sectionARef} className="section-padding bg-slate-900">
      <div className="container-width">
        <div className="text-center mb-16">
          <h2 className="heading-primary text-gradient">Our Services</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover our range of professional cooling and power solutions designed to meet your specific needs
          </p>
        </div>

        {services.map((service, index) => (
          <ServiceCard 
            key={index}
            {...service}
            isReversed={index % 2 !== 0}
          />
        ))}

        <Stats />
      </div>
    </section>
  );
};

export default SectionA; 