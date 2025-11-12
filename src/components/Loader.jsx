import React from 'react';
import mclogo from '../assets/mclogo.png';

const Loader = ({ isVisible = false }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="landing-gradient fixed top-0 left-0 right-0 bottom-0 h-screen w-screen z-[1000] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 backdrop-blur-md pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center">
        <img
          src={mclogo}
          alt="Master Chillers Logo"
          className="w-28 h-28 object-contain animate-logo-blink drop-shadow-[0_20px_35px_rgba(15,23,42,0.45)]"
        />
      </div>
    </div>
  );
};

export default Loader;
 