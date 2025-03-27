import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('submissions'); // 'submissions' or 'analytics'
  const [analyticsData, setAnalyticsData] = useState(null);
  const navigate = useNavigate();

  const fetchSubmissions = async () => {
    try {
      const q = query(
        collection(db, 'submissions'),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const submissionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toLocaleString() || 'N/A'
      }));
      
      setSubmissions(submissionsData);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions');
    }
  };

  const fetchAnalytics = useCallback(async () => {
    try {
      // Basic analytics metrics we can track ourselves
      const basicMetrics = {
        totalSubmissions: submissions.length,
        submissionsToday: submissions.filter(sub => {
          const today = new Date()
          const subDate = new Date(sub.timestamp)
          return (
            subDate.getDate() === today.getDate() &&
            subDate.getMonth() === today.getMonth() &&
            subDate.getFullYear() === today.getFullYear()
          )
        }).length,
        popularServices: Object.entries(
          submissions.reduce((acc, sub) => {
            acc[sub.service] = (acc[sub.service] || 0) + 1
            return acc
          }, {})
        ).sort((a, b) => b[1] - a[1])
      }

      setAnalyticsData({
        ...basicMetrics,
        message: 'For detailed analytics, please visit your Vercel dashboard.',
        url: 'https://vercel.com/dashboard'
      })
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data')
    }
  }, [submissions])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (activeTab === 'submissions') {
        await fetchSubmissions();
      } else {
        await fetchAnalytics();
      }
      setLoading(false);
    };

    loadData();
  }, [activeTab, fetchAnalytics]);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-white">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              activeTab === 'submissions'
                ? 'bg-red-500 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            Form Submissions
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              activeTab === 'analytics'
                ? 'bg-red-500 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            Analytics
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {/* Content Area */}
        {activeTab === 'submissions' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs uppercase bg-slate-800">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Service</th>
                  <th className="px-6 py-3">Message</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr 
                    key={submission.id} 
                    className="border-b border-slate-700 bg-slate-800/50 hover:bg-slate-800"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">{submission.timestamp}</td>
                    <td className="px-6 py-4">{submission.name}</td>
                    <td className="px-6 py-4">{submission.companyName}</td>
                    <td className="px-6 py-4">{submission.email}</td>
                    <td className="px-6 py-4">{submission.phone}</td>
                    <td className="px-6 py-4">{submission.service}</td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate">{submission.message}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {submissions.length === 0 && (
              <div className="text-center text-gray-400 mt-8">
                No submissions found
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Submissions</h3>
              <p className="text-3xl font-bold text-white">{analyticsData?.totalSubmissions || 0}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Today's Submissions</h3>
              <p className="text-3xl font-bold text-white">{analyticsData?.submissionsToday || 0}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Popular Services</h3>
              <div className="space-y-2">
                {analyticsData?.popularServices?.slice(0, 3).map(([service, count]) => (
                  <div key={service} className="flex justify-between items-center">
                    <span className="text-gray-300">{service}</span>
                    <span className="text-white font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="col-span-full bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Detailed Analytics</h2>
              <p className="text-gray-300 mb-4">{analyticsData?.message}</p>
              <a 
                href={analyticsData?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-red-500 hover:text-red-400"
              >
                <span>View Full Analytics Dashboard</span>
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                  />
                </svg>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin; 