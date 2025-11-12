import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase/config';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Admin = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('submissions'); // 'submissions' or 'analytics'
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [timePeriod, setTimePeriod] = useState('month'); // 'today', 'week', 'month'
  const navigate = useNavigate();

  const fetchSubmissions = async () => {
    try {
      setError(null);
      const q = query(
        collection(db, 'submissions'),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const submissionsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        let timestamp = 'N/A';
        try {
          if (data.timestamp?.toDate) {
            timestamp = data.timestamp.toDate().toLocaleString();
          } else if (data.timestamp) {
            timestamp = new Date(data.timestamp).toLocaleString();
          }
        } catch (e) {
          console.error('Error parsing timestamp:', e);
        }
        return {
        id: doc.id,
          ...data,
          timestamp
        };
      });
      
      setSubmissions(submissionsData);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions. Please check your connection and try again.');
    }
  };

  const fetchAnalytics = async () => {
    try {
      setError(null);
      
      // Fetch submissions
      const submissionsQuery = query(collection(db, 'submissions'), orderBy('timestamp', 'desc'));
      const submissionsSnapshot = await getDocs(submissionsQuery);
      const currentSubmissions = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Fetch visits (with error handling in case permissions aren't set up yet)
      let visits = [];
      try {
        const visitsQuery = query(collection(db, 'visits'), orderBy('timestamp', 'desc'));
        const visitsSnapshot = await getDocs(visitsQuery);
        visits = visitsSnapshot.docs.map(doc => {
          const data = doc.data();
          let date;
          try {
            if (data.timestamp?.toDate) {
              date = data.timestamp.toDate();
            } else if (data.timestamp) {
              date = new Date(data.timestamp);
            } else {
              return null;
            }
          } catch (e) {
            return null;
          }
          return { id: doc.id, ...data, date };
        }).filter(v => v !== null);
      } catch (visitsError) {
        console.warn('Could not fetch visits (permissions may need to be configured):', visitsError);
        // Continue without visit data - submissions analytics will still work
      }
      
      // Calculate date ranges
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      monthAgo.setHours(0, 0, 0, 0);
      
      // Calculate visit statistics
      const visitsToday = visits.filter(v => {
        const visitDate = new Date(v.date);
        visitDate.setHours(0, 0, 0, 0);
        return visitDate.getTime() === today.getTime();
      }).length;
      
      const visitsThisWeek = visits.filter(v => {
        const visitDate = new Date(v.date);
        visitDate.setHours(0, 0, 0, 0);
        return visitDate.getTime() >= weekAgo.getTime();
      }).length;
      
      const visitsThisMonth = visits.filter(v => {
        const visitDate = new Date(v.date);
        visitDate.setHours(0, 0, 0, 0);
        return visitDate.getTime() >= monthAgo.getTime();
      }).length;
      
      // Calculate submission statistics
      const submissionsToday = currentSubmissions.filter(sub => {
        try {
          let subDate;
          if (sub.timestamp?.toDate) {
            subDate = sub.timestamp.toDate();
          } else if (sub.timestamp) {
            subDate = new Date(sub.timestamp);
          } else {
            return false;
          }
          subDate.setHours(0, 0, 0, 0);
          return subDate.getTime() === today.getTime();
        } catch (e) {
          return false;
        }
      }).length;
      
      const submissionsThisWeek = currentSubmissions.filter(sub => {
        try {
          let subDate;
          if (sub.timestamp?.toDate) {
            subDate = sub.timestamp.toDate();
          } else if (sub.timestamp) {
            subDate = new Date(sub.timestamp);
          } else {
            return false;
          }
          subDate.setHours(0, 0, 0, 0);
          return subDate.getTime() >= weekAgo.getTime();
        } catch (e) {
          return false;
        }
      }).length;
      
      const submissionsThisMonth = currentSubmissions.filter(sub => {
        try {
          let subDate;
          if (sub.timestamp?.toDate) {
            subDate = sub.timestamp.toDate();
          } else if (sub.timestamp) {
            subDate = new Date(sub.timestamp);
          } else {
            return false;
          }
          subDate.setHours(0, 0, 0, 0);
          return subDate.getTime() >= monthAgo.getTime();
        } catch (e) {
          return false;
        }
      }).length;
      
      const popularServices = Object.entries(
        currentSubmissions.reduce((acc, sub) => {
          const service = sub.service || 'Unknown';
          acc[service] = (acc[service] || 0) + 1;
          return acc;
          }, {})
      ).sort((a, b) => b[1] - a[1]);

      // Calculate chart data for different time periods
      const getChartData = (period) => {
        let startDate, labels, visitsData, submissionsData;
        const now = new Date();

        if (period === 'today') {
          // Hourly data for today
          labels = Array.from({ length: 24 }, (_, i) => {
            const hour = new Date(now);
            hour.setHours(i, 0, 0, 0);
            return hour.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
          });
          
          visitsData = Array(24).fill(0);
          visits.forEach(v => {
            const visitDate = new Date(v.date);
            const hour = visitDate.getHours();
            if (visitDate.toDateString() === now.toDateString()) {
              visitsData[hour]++;
            }
          });

          submissionsData = Array(24).fill(0);
          currentSubmissions.forEach(sub => {
            try {
              let subDate;
              if (sub.timestamp?.toDate) {
                subDate = sub.timestamp.toDate();
              } else if (sub.timestamp) {
                subDate = new Date(sub.timestamp);
              } else return;
              if (subDate.toDateString() === now.toDateString()) {
                submissionsData[subDate.getHours()]++;
              }
            } catch (e) {}
          });
        } else if (period === 'week') {
          // Daily data for last 7 days
          labels = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (6 - i));
            return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
          });
          
          visitsData = Array(7).fill(0);
          visits.forEach(v => {
            const visitDate = new Date(v.date);
            visitDate.setHours(0, 0, 0, 0);
            const daysDiff = Math.floor((now - visitDate) / (1000 * 60 * 60 * 24));
            if (daysDiff >= 0 && daysDiff < 7) {
              visitsData[6 - daysDiff]++;
            }
          });

          submissionsData = Array(7).fill(0);
          currentSubmissions.forEach(sub => {
            try {
              let subDate;
              if (sub.timestamp?.toDate) {
                subDate = sub.timestamp.toDate();
              } else if (sub.timestamp) {
                subDate = new Date(sub.timestamp);
              } else return;
              subDate.setHours(0, 0, 0, 0);
              const daysDiff = Math.floor((now - subDate) / (1000 * 60 * 60 * 24));
              if (daysDiff >= 0 && daysDiff < 7) {
                submissionsData[6 - daysDiff]++;
              }
            } catch (e) {}
          });
        } else {
          // Daily data for last 30 days
          labels = Array.from({ length: 30 }, (_, i) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (29 - i));
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          });
          
          visitsData = Array(30).fill(0);
          visits.forEach(v => {
            const visitDate = new Date(v.date);
            visitDate.setHours(0, 0, 0, 0);
            const daysDiff = Math.floor((now - visitDate) / (1000 * 60 * 60 * 24));
            if (daysDiff >= 0 && daysDiff < 30) {
              visitsData[29 - daysDiff]++;
            }
          });

          submissionsData = Array(30).fill(0);
          currentSubmissions.forEach(sub => {
            try {
              let subDate;
              if (sub.timestamp?.toDate) {
                subDate = sub.timestamp.toDate();
              } else if (sub.timestamp) {
                subDate = new Date(sub.timestamp);
              } else return;
              subDate.setHours(0, 0, 0, 0);
              const daysDiff = Math.floor((now - subDate) / (1000 * 60 * 60 * 24));
              if (daysDiff >= 0 && daysDiff < 30) {
                submissionsData[29 - daysDiff]++;
              }
            } catch (e) {}
          });
        }

        return { labels, visitsData, submissionsData };
      };

      const chartData = getChartData(timePeriod);

      setAnalyticsData({
        // Visit statistics
        totalVisits: visits.length,
        visitsToday,
        visitsThisWeek,
        visitsThisMonth,
        // Submission statistics
        totalSubmissions: currentSubmissions.length,
        submissionsToday,
        submissionsThisWeek,
        submissionsThisMonth,
        popularServices,
        // Chart data
        chartData
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
      if (activeTab === 'submissions') {
        await fetchSubmissions();
      } else {
        await fetchAnalytics();
      }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
      setLoading(false);
      }
    };

    loadData();
  }, [activeTab, timePeriod]);

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
      {/* Submission Detail Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSubmission(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-2xl bg-slate-800 rounded-xl shadow-2xl border border-slate-700/50 max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Submission Details</h2>
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Date & Time</label>
                      <p className="text-white mt-1">{selectedSubmission.timestamp}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Full Name</label>
                        <p className="text-white mt-1">{selectedSubmission.name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Phone</label>
                        <p className="text-white mt-1">{selectedSubmission.phone || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Company Name</label>
                        <p className="text-white mt-1">{selectedSubmission.companyName || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Designation</label>
                        <p className="text-white mt-1">{selectedSubmission.designation || 'N/A'}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Email Address</label>
                      <p className="text-white mt-1">
                        {selectedSubmission.email ? (
                          <a href={`mailto:${selectedSubmission.email}`} className="text-red-500 hover:text-red-400 transition-colors">
                            {selectedSubmission.email}
                          </a>
                        ) : 'N/A'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Service Interested In</label>
                      <p className="text-white mt-1 capitalize">{selectedSubmission.service || 'N/A'}</p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Additional Details / Message</label>
                      <div className="mt-1 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                          {selectedSubmission.message || 'No message provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                    onClick={() => setSelectedSubmission(submission)}
                    className="border-b border-slate-700 bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">{submission.timestamp}</td>
                    <td className="px-6 py-4">{submission.name}</td>
                    <td className="px-6 py-4">{submission.companyName}</td>
                    <td className="px-6 py-4">{submission.email}</td>
                    <td className="px-6 py-4">{submission.phone}</td>
                    <td className="px-6 py-4">{submission.service}</td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate">{submission.message || 'N/A'}</div>
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
          <div className="space-y-6">
            {/* Time Period Toggle */}
            <div className="flex justify-center mb-6">
              <div className="bg-slate-800 rounded-lg p-1 inline-flex gap-1">
                {['today', 'week', 'month'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimePeriod(period)}
                    className={`px-6 py-2 rounded-md font-semibold text-sm transition-all duration-200 ${
                      timePeriod === period
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {period === 'today' ? 'Today' : period === 'week' ? 'This Week' : 'This Month'}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Total Visits</h3>
                <p className="text-3xl font-bold text-white">{analyticsData?.totalVisits || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {timePeriod === 'today' && `${analyticsData?.visitsToday || 0} today`}
                  {timePeriod === 'week' && `${analyticsData?.visitsThisWeek || 0} this week`}
                  {timePeriod === 'month' && `${analyticsData?.visitsThisMonth || 0} this month`}
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Total Submissions</h3>
                <p className="text-3xl font-bold text-red-500">{analyticsData?.totalSubmissions || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {timePeriod === 'today' && `${analyticsData?.submissionsToday || 0} today`}
                  {timePeriod === 'week' && `${analyticsData?.submissionsThisWeek || 0} this week`}
                  {timePeriod === 'month' && `${analyticsData?.submissionsThisMonth || 0} this month`}
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Conversion Rate</h3>
                <p className="text-3xl font-bold text-blue-500">
                  {analyticsData?.totalVisits > 0
                    ? ((analyticsData?.totalSubmissions / analyticsData?.totalVisits) * 100).toFixed(1)
                    : 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Submissions per visit</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Popular Service</h3>
                <p className="text-2xl font-bold text-green-500 capitalize">
                  {analyticsData?.popularServices?.[0]?.[0] || 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {analyticsData?.popularServices?.[0]?.[1] || 0} requests
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Visits Chart */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">Page Visits</h3>
                {analyticsData?.chartData ? (
                  <Line
                    data={{
                      labels: analyticsData.chartData.labels,
                      datasets: [
                        {
                          label: 'Visits',
                          data: analyticsData.chartData.visitsData,
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          fill: true,
                          tension: 0.4,
                          pointRadius: 4,
                          pointHoverRadius: 6,
                          pointBackgroundColor: 'rgb(59, 130, 246)',
                          pointBorderColor: '#fff',
                          pointBorderWidth: 2
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          titleColor: '#fff',
                          bodyColor: '#fff',
                          borderColor: 'rgb(59, 130, 246)',
                          borderWidth: 1,
                          padding: 12
                        }
                      },
                      scales: {
                        x: {
                          grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                          },
                          ticks: {
                            color: '#94a3b8',
                            maxRotation: timePeriod === 'month' ? 45 : 0
                          }
                        },
                        y: {
                          grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                          },
                          ticks: {
                            color: '#94a3b8',
                            beginAtZero: true,
                            stepSize: 1
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
                )}
              </div>

              {/* Submissions Chart */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">Form Submissions</h3>
                {analyticsData?.chartData ? (
                  <Bar
                    data={{
                      labels: analyticsData.chartData.labels,
                      datasets: [
                        {
                          label: 'Submissions',
                          data: analyticsData.chartData.submissionsData,
                          backgroundColor: 'rgba(239, 68, 68, 0.8)',
                          borderColor: 'rgb(239, 68, 68)',
                          borderWidth: 2,
                          borderRadius: 4,
                          borderSkipped: false
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          titleColor: '#fff',
                          bodyColor: '#fff',
                          borderColor: 'rgb(239, 68, 68)',
                          borderWidth: 1,
                          padding: 12
                        }
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false
                          },
                          ticks: {
                            color: '#94a3b8',
                            maxRotation: timePeriod === 'month' ? 45 : 0
                          }
                        },
                        y: {
                          grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                          },
                          ticks: {
                            color: '#94a3b8',
                            beginAtZero: true,
                            stepSize: 1
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
                )}
              </div>
            </div>

            {/* Popular Services Doughnut Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">Service Distribution</h3>
                {analyticsData?.popularServices?.length > 0 ? (
                  <Doughnut
                    data={{
                      labels: analyticsData.popularServices.map(([service]) => service.charAt(0).toUpperCase() + service.slice(1)),
                      datasets: [
                        {
                          data: analyticsData.popularServices.map(([, count]) => count),
                          backgroundColor: [
                            'rgba(239, 68, 68, 0.8)',
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(34, 197, 94, 0.8)',
                            'rgba(251, 191, 36, 0.8)',
                            'rgba(168, 85, 247, 0.8)',
                            'rgba(236, 72, 153, 0.8)'
                          ],
                          borderColor: [
                            'rgb(239, 68, 68)',
                            'rgb(59, 130, 246)',
                            'rgb(34, 197, 94)',
                            'rgb(251, 191, 36)',
                            'rgb(168, 85, 247)',
                            'rgb(236, 72, 153)'
                          ],
                          borderWidth: 2
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            color: '#94a3b8',
                            padding: 15,
                            font: {
                              size: 12
                            }
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          titleColor: '#fff',
                          bodyColor: '#fff',
                          borderColor: 'rgb(239, 68, 68)',
                          borderWidth: 1,
                          padding: 12
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">No service data available</div>
                )}
              </div>

              {/* Service List */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">Service Breakdown</h3>
                <div className="space-y-3">
                  {analyticsData?.popularServices?.length > 0 ? (
                    analyticsData.popularServices.map(([service, count], index) => (
                      <div key={service} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{
                              backgroundColor: [
                                'rgb(239, 68, 68)',
                                'rgb(59, 130, 246)',
                                'rgb(34, 197, 94)',
                                'rgb(251, 191, 36)',
                                'rgb(168, 85, 247)',
                                'rgb(236, 72, 153)'
                              ][index % 6]
                            }}
                          />
                          <span className="text-gray-300 capitalize font-medium">{service}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-32 bg-slate-700 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${(count / analyticsData.totalSubmissions) * 100}%`,
                                backgroundColor: [
                                  'rgb(239, 68, 68)',
                                  'rgb(59, 130, 246)',
                                  'rgb(34, 197, 94)',
                                  'rgb(251, 191, 36)',
                                  'rgb(168, 85, 247)',
                                  'rgb(236, 72, 153)'
                                ][index % 6]
                              }}
                            />
                          </div>
                          <span className="text-white font-bold text-lg w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">No service data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin; 