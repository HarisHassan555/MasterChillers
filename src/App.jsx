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
import Loader from "./components/Loader";
import { db } from "./firebase/config";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function AppContent() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');
  const heroRef = useRef(null);
  const sectionARef = useRef(null);
  const sectionBRef = useRef(null);
  const sectionCRef = useRef(null);
  const originalOverflow = useRef({
    body: null,
    html: null
  });

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

  // Show loader until page is fully loaded
  useEffect(() => {
    setIsLoading(true);
    
    const handleLoad = () => {
      setIsLoading(false);
    };

    // Check if page is already loaded
    if (document.readyState === 'complete') {
      setIsLoading(false);
    } else {
      // Wait for page to fully load
      window.addEventListener('load', handleLoad);
    }

    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, [location.pathname]);

  // Track sessions (only on main page, not admin/login)
  useEffect(() => {
    if (location.pathname === '/' && !isLoading) {
      const trackSession = async () => {
        try {
          // Check if we have an active session
          const sessionId = sessionStorage.getItem('sessionId');
          const sessionStart = sessionStorage.getItem('sessionStart');
          const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
          
          const now = Date.now();
          let currentSessionId = sessionId;
          
          // Create new session if:
          // 1. No session exists
          // 2. Session expired (30 minutes of inactivity)
          if (!sessionId || !sessionStart || (now - parseInt(sessionStart)) > SESSION_TIMEOUT) {
            // Generate new session ID
            currentSessionId = `session_${now}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('sessionId', currentSessionId);
            sessionStorage.setItem('sessionStart', now.toString());
            
            // Track new session in Firestore
            await addDoc(collection(db, 'visits'), {
              timestamp: serverTimestamp(),
              sessionId: currentSessionId,
              path: location.pathname,
              userAgent: navigator.userAgent,
              referrer: document.referrer || 'direct',
              type: 'session_start'
            });
          } else {
            // Update session activity time
            sessionStorage.setItem('sessionStart', now.toString());
          }
        } catch (error) {
          console.error('Error tracking session:', error);
          // Silently fail - don't interrupt user experience
        }
      };
      
      // Small delay to ensure page is loaded
      const sessionTimeout = setTimeout(trackSession, 1000);
      return () => clearTimeout(sessionTimeout);
    }
  }, [location.pathname, isLoading]);

  useEffect(() => {
    const bodyStyle = document.body.style;
    const htmlStyle = document.documentElement.style;

    if (originalOverflow.current.body === null) {
      originalOverflow.current.body = bodyStyle.overflow || '';
    }

    if (originalOverflow.current.html === null) {
      originalOverflow.current.html = htmlStyle.overflow || '';
    }

    // Always restore scrollbar - don't hide it during loading
    // The loader overlay will still be visible but users can scroll if needed
    bodyStyle.overflow = originalOverflow.current.body;
    htmlStyle.overflow = originalOverflow.current.html;

    return () => {
      bodyStyle.overflow = originalOverflow.current.body;
      htmlStyle.overflow = originalOverflow.current.html;
    };
  }, []);

  return (
    <>
      {isLoading && <Loader />}
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
              <SectionB sectionBRef={sectionBRef} sectionCRef={sectionCRef} />
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
