import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import havalLogo from '../assets/havalLogo.jpg';

const ClientReviewSection = () => {
  const reviews = [
    {
      id: 1,
      name: "Sarah Thompson",
      image: havalLogo,
      rating: 5,
      review: "Master Chillers has transformed our cold storage operations. Their expertise and dedication to quality service have made a significant impact on our business efficiency."
    },
    {
      id: 2,
      name: "Michael Chen",
      image: havalLogo,
      rating: 4,
      review: "Exceptional service and technical support. The team's responsiveness and professional approach to maintenance have kept our systems running smoothly."
    },
    {
      id: 3,
      name: "Aisha Malik",
      image: havalLogo,
      rating: 5,
      review: "We've been working with Master Chillers for over 2 years now, and their consistent quality and reliability have exceeded our expectations every time."
    },
    {
      id: 4,
      name: "James Wilson",
      image: havalLogo,
      rating: 4,
      review: "Their innovative solutions and energy-efficient systems have helped us reduce costs while maintaining optimal temperature control. Highly recommended!"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [reviews.length]);

  return (
    <div className="w-full max-w-7xl mt-16">
      <h2 className="text-4xl text-white font-bold mb-8 text-center">Client Reviews</h2>
      
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {isMobile ? (
            // Mobile view - single review
            <motion.div
              key={reviews[currentIndex].id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center"
            >
              <div className="bg-gray-800 rounded-xl p-5 w-[280px] min-h-[380px] flex flex-col items-center">
                <motion.div className="mb-4 text-center">
                  <img
                    src={reviews[currentIndex].image}
                    alt={reviews[currentIndex].name}
                    className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                  />
                  <h3 className="text-lg text-white font-semibold">{reviews[currentIndex].name}</h3>
                </motion.div>

                <motion.div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < reviews[currentIndex].rating ? 'text-yellow-400' : 'text-gray-600'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </motion.div>

                <motion.p className="text-gray-300 text-center italic text-sm leading-relaxed">
                  "{reviews[currentIndex].review}"
                </motion.p>
              </div>
            </motion.div>
          ) : (
            // Desktop view - three reviews
            <div className="flex justify-center gap-8">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={reviews[index].id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gray-800 rounded-xl p-5 w-[280px] min-h-[380px] flex flex-col items-center"
                >
                  {/* Review content remains the same */}
                  <motion.div className="mb-4 text-center">
                    <img
                      src={reviews[index].image}
                      alt={reviews[index].name}
                      className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                    />
                    <h3 className="text-lg text-white font-semibold">{reviews[index].name}</h3>
                  </motion.div>

                  <motion.div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < reviews[index].rating ? 'text-yellow-400' : 'text-gray-600'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </motion.div>

                  <motion.p className="text-gray-300 text-center italic text-sm leading-relaxed">
                    "{reviews[index].review}"
                  </motion.p>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClientReviewSection; 