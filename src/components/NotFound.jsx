import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
        <Link 
          to="/"
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 