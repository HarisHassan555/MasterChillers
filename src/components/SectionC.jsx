import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const SuccessModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-slate-800 rounded-xl p-8 shadow-2xl border border-slate-700/50">
                <div className="text-center mb-6">
                  <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Thank You!</h3>
                  <p className="text-gray-300">
                    Your request has been submitted successfully. We'll get back to you within 24 hours.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="btn-primary w-full"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const SectionC = ({ sectionCRef }) => {
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    designation: '',
    email: '',
    phone: '',
    service: 'chiller',
    message: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Add basic validation
    if (!formData.name || !formData.phone) {
      setError('Name and Phone are required fields');
      setIsSubmitting(false);
      return;
    }

    try {
      const submissionData = {
        ...formData,
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, 'submissions'), submissionData);
      setShowModal(true);
      setFormData({
        name: '',
        companyName: '',
        designation: '',
        email: '',
        phone: '',
        service: 'chiller',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('There was an error submitting your form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SuccessModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
      
      <section
        ref={sectionCRef}
        className="section-padding bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
      >
        <div className="container-width">
          {/* Two Column CTA Layout */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            {/* Left Column - Text Content */}
            <div className="text-left">
              <span className="text-sky-400 font-semibold text-lg mb-4 block">Free Consultation & Estimate</span>
              <h2 className="heading-primary">Get Your Free Cost Estimate Today</h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Schedule a no-obligation consultation with our experts and receive a detailed cost estimate for your cooling needs. Our transparent pricing ensures no hidden costs.
              </p>
              <div className="card bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
                <h3 className="text-2xl text-white font-semibold mb-6">What You'll Get:</h3>
                <div className="space-y-4">
                  {['Detailed Cost Breakdown', 'Expert Recommendations', 'Energy Savings Analysis'].map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3 text-gray-300">
                      <span className="text-sky-500 flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="card border border-slate-700/50 p-6">
              <div className="mb-6">
                <h3 className="text-2xl text-white font-bold mb-2">Schedule Your Free Consultation</h3>
                <p className="text-gray-400">Fill out the form below and we'll get back to you within 24 hours</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name and Phone Row */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-gray-300 text-sm mb-1">Full Name*</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field text-sm py-2"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-gray-300 text-sm mb-1">Phone Number*</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field text-sm py-2"
                      required
                    />
                  </div>
                </div>

                {/* Company Name and Designation Row */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="companyName" className="block text-gray-300 text-sm mb-1">Company Name</label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="input-field text-sm py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="designation" className="block text-gray-300 text-sm mb-1">Designation</label>
                    <input
                      type="text"
                      id="designation"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="input-field text-sm py-2"
                    />
                  </div>
                </div>

                {/* Email and Service Row */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-gray-300 text-sm mb-1">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field text-sm py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="service" className="block text-gray-300 text-sm mb-1">Service Interested In*</label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="input-field text-sm py-2"
                      required
                    >
                      <option value="chiller">Chiller Rental</option>
                      <option value="generator">Soundless Generator</option>
                      <option value="marquee">Outdoor Marquee</option>
                    </select>
                  </div>
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-gray-300 text-sm mb-1">Additional Details</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Tell us about your requirements..."
                    className="input-field text-sm py-2"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary w-full text-sm py-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>Get Free Estimate</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
              {error && (
                <p className="text-red-500 mt-2 text-sm">{error}</p>
              )}
            </div>
          </div>

          {/* Contact Information with Map */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Map Section */}
            <div className="card overflow-hidden p-0">
              <div className="w-full h-[400px] rounded-lg overflow-hidden">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1281.5928531504799!2d74.36821441167491!3d31.44011458187072!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190466158ca4a7%3A0xa91e38835cd741ca!2sMaster%20Chiller!5e0!3m2!1sen!2s!4v1738698602155!5m2!1sen!2s" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Master Chiller Location"
                  className="rounded-lg"
                />
              </div>
            </div>

            {/* Contact Details */}
            <div className="card flex flex-col pb-2">
              <h3 className="heading-secondary">Contact Information</h3>
              
              <div className="flex-1 flex flex-col justify-between">
                {['Address', 'Phone', 'Email', 'Hours'].map((type, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="text-sky-500 mt-1">
                      <ContactIcon type={type} />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">{getContactTitle(type)}</h4>
                      <ContactContent type={type} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const ContactIcon = ({ type }) => {
  const icons = {
    Address: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
    Phone: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
    Email: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    Hours: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
  };

  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[type]} />
    </svg>
  );
};

const getContactTitle = (type) => {
  const titles = {
    Address: "Our Location",
    Phone: "Phone",
    Email: "Email",
    Hours: "Business Hours"
  };
  return titles[type];
};

const ContactContent = ({ type }) => {
  switch (type) {
    case 'Address':
      return <p className="text-gray-300">Bank Stop, Street # 3 Umar Park, Hakim Chock, Lahore – Kasur Rd, Lahore, Pakistan</p>;
    case 'Phone':
      return (
        <div className=" flex flex-col gap-2">
        
        <a href="tel:+923214260222" className="text-gray-300 hover:text-sky-400 transition-colors duration-300">
          +92 3214849700
        </a>
         <a href="tel:+923394849700" className="text-gray-300 hover:text-sky-400 transition-colors duration-300">
         +92 3394849700
       </a>
       </div>
        
      );
    case 'Email':
      return (
        <a href="mailto:masterchiller2001@gmail.com" className="text-gray-300 hover:text-sky-400 transition-colors duration-300">
          masterchiller2001@gmail.com
        </a>
      );
    case 'Hours':
      return (
        <>
          <p className="text-gray-300">24 hours open</p>
          
        </>
      );
    default:
      return null;
  }
};

export default SectionC;