import { useState, useEffect } from 'react';
import mclogo from '../assets/mclogo.png';

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Target date: November 12, 2025 at 00:00:00 Pakistan/Islamabad time (UTC+5)
    const targetDate = new Date('2025-11-12T00:00:00+05:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  // Don't render if countdown has expired
  if (isExpired) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="mb-8 flex justify-center">
          <img 
            src={mclogo} 
            alt="Master Chiller Logo" 
            className="h-24 md:h-32 w-auto animate-float"
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 animate-pulse">
          Coming Soon
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-2xl">
            <div className="text-5xl md:text-7xl font-bold text-sky-400 mb-2">
              {String(timeLeft.days).padStart(2, '0')}
            </div>
            <div className="text-gray-300 text-sm md:text-base uppercase tracking-wider">
              Days
            </div>
          </div>
          
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-2xl">
            <div className="text-5xl md:text-7xl font-bold text-sky-400 mb-2">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <div className="text-gray-300 text-sm md:text-base uppercase tracking-wider">
              Hours
            </div>
          </div>
          
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-2xl">
            <div className="text-5xl md:text-7xl font-bold text-sky-400 mb-2">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <div className="text-gray-300 text-sm md:text-base uppercase tracking-wider">
              Minutes
            </div>
          </div>
          
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-2xl">
            <div className="text-5xl md:text-7xl font-bold text-sky-400 mb-2">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <div className="text-gray-300 text-sm md:text-base uppercase tracking-wider">
              Seconds
            </div>
          </div>
        </div>
        
        <p className="text-gray-400 text-lg md:text-xl">
          We'll be back on November 12, 2025
        </p>
      </div>
    </div>
  );
};

export default Countdown;

