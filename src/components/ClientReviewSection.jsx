import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ClientReviewSection = () => {
  const reviews = [
    {
      id: 1,
      name: "Imran Hanif",
      rating: 5,
      review: "I needed chiller services on an urgent basis and I searched them online. I asked for chiller services the very next day without pre-booking, and they arranged chillers at very short notice and saved my day. I recommend Master Chiller Lahore."
    },
    {
      id: 2,
      name: "Abdul Moin",
      rating: 4,
      review: "Very big warehouse. Great service and support from Master Chillers."
    },
    {
      id: 3,
      name: "Life with Gadgets",
      rating: 5,
      review: "Good service 👍 keep it up. Nice job…"
    },
    {
      id: 4,
      name: "Bazil Khan",
      rating: 5,
      review: "We have been in the loop with Master Chillers for the past few years, and they provide top-notch services in Lahore and Islamabad. We are very satisfied with their product and round-the-clock services."
    },
    {
      id: 5,
      name: "Ahmed Saad",
      rating: 5,
      review: "Great dealing and overall a pleasant experience working with them."
    }
  ];

  // Divide reviews into chunks of 3
  const chunkedReviews = [
    reviews.slice(0, 3), // First group of 3 reviews
    reviews.slice(3) // Remaining 2 reviews
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
      setCurrentIndex((prev) => (prev + 1) % chunkedReviews.length);
    }, 5000); // Switch groups every 5 seconds

    return () => clearInterval(interval);
  }, [chunkedReviews.length]);

  return (
    <div className="w-full max-w-7xl mt-16">
      <h2 className="text-4xl text-white font-bold mb-8 text-center">Client Reviews</h2>
      
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {isMobile ? (
            // Mobile view - single review with smooth transition
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
                  <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-slate-700 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg text-white font-semibold">{reviews[currentIndex].name}</h3>
                </motion.div>

                <motion.div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < reviews[currentIndex].rating ? 'text-yellow-400' : 'text-gray-600'}`}
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
            // Desktop view - chunks of 3 reviews with smooth transitions (moving from down to up)
            <div className="flex justify-center gap-8">
              <AnimatePresence mode="wait">
                {chunkedReviews[currentIndex].map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 50 }} // Starting from below
                    animate={{ opacity: 1, y: 0 }}  // Move to normal position
                    exit={{ opacity: 0, y: -50 }}   // Exit to top
                    transition={{ duration: 0.5 }}
                    className="bg-gray-800 rounded-xl p-5 w-[280px] min-h-[380px] flex flex-col items-center"
                  >
                    <motion.div className="mb-4 text-center">
                      <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-slate-700 flex items-center justify-center">
                        <svg
                          className="w-10 h-10 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg text-white font-semibold">{review.name}</h3>
                    </motion.div>

                    <motion.div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </motion.div>

                    <motion.p className="text-gray-300 text-center italic text-sm leading-relaxed">
                      "{review.review}"
                    </motion.p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClientReviewSection;
