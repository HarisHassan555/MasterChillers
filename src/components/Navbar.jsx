import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mclogo from '../assets/mclogo.png';

const Navbar = ({ activeSection, scrollToSection, refs }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (ref, id) => {
    // Close menu first
    setIsOpen(false);
    // Small delay to allow menu close animation to complete
    setTimeout(() => {
      scrollToSection(ref, id);
    }, 100);
  };

  const navItems = [
    { id: 'sectionA', label: 'Services', ref: refs.sectionARef },
    { id: 'sectionB', label: 'Partners', ref: refs.sectionBRef },
    { id: 'sectionC', label: 'Contact', ref: refs.sectionCRef },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
      <div className="container-width">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <img 
            src={mclogo}
            alt="Master Chillers Logo"
            onClick={() => handleNavClick(refs.heroRef, 'hero')}
            className="cursor-pointer hover:opacity-75 transition-opacity duration-300 w-14 h-14"
          />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(({ id, label, ref }) => (
              <button
                key={id}
                onClick={() => handleNavClick(ref, id)}
                className={`text-sm font-medium transition-colors duration-300 ${
                  activeSection === id 
                    ? 'text-red-500'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-slate-800 border-t border-slate-700"
          >
            <div className="container-width px-4 py-2">
              {navItems.map(({ id, label, ref }) => (
                <button
                  key={id}
                  onClick={() => handleNavClick(ref, id)}
                  className={`block w-full text-left py-3 text-sm font-medium transition-colors duration-300 ${
                    activeSection === id ? 'text-sky-400' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar; 