import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import SectionA from "./components/SectionA";
import SectionB from "./components/SectionB";
import SectionC from "./components/SectionC";
import Footer from "./components/Footer";
import Admin from "./components/Admin";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from './components/NotFound';
import Countdown from './components/Countdown';

function AppContent() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('hero');
  const heroRef = useRef(null);
  const sectionARef = useRef(null);
  const sectionBRef = useRef(null);
  const sectionCRef = useRef(null);

  const refs = {
    heroRef,
    sectionARef,
    sectionBRef,
    sectionCRef
  };

  const scrollToSection = (ref, section) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(section);
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { ref: heroRef, id: 'hero' },
        { ref: sectionARef, id: 'sectionA' },
        { ref: sectionBRef, id: 'sectionB' },
        { ref: sectionCRef, id: 'sectionC' }
      ];

      const currentSection = sections.find(section => {
        if (section.ref.current) {
          const rect = section.ref.current.getBoundingClientRect();
          return rect.top >= -100 && rect.top <= 150;
        }
        return false;
      });

      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show countdown only on main route
  const showCountdown = location.pathname === '/';

  return (
    <>
      {showCountdown && <Countdown />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <>
              <Navbar
                activeSection={activeSection}
                refs={refs}
                scrollToSection={scrollToSection}
              />
              <HeroSection heroRef={heroRef} />
              <SectionA sectionARef={sectionARef} />
              <SectionB sectionBRef={sectionBRef} />
              <SectionC sectionCRef={sectionCRef} />
              <Footer />
            </>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
