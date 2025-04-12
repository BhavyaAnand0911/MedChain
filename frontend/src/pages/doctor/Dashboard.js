import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientList from '../../components/doctor/PatientList';
import { getDoctorDashboard } from '../../api/doctor';
import Loader from '../../components/common/Loader';
import './Dashboard.css';

const DoctorDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalPatients: 0,
    recentConsultations: 0,
    pendingReviews: 0,
    recentActivities: [],
    patients: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getDoctorDashboard();
        setDashboardData(prev => ({
          ...prev,
          ...data,
          // Ensure arrays are never null
          recentActivities: data.recentActivities || [],
          patients: data.patients || []
        }));
      } catch (err) {
        console.error('Error fetching doctor dashboard:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handlePatientClick = (patientId) => {
    navigate(`/doctor/patients/${patientId}`);
  };

  if (loading) {
    return (
        <div className="loading-container">
          <Loader />
        </div>
    );
  }

  if (error) {
    return (
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button 
            className="retry-button" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
    );
  }

  return (
      <div className="doctor-dashboard">
        <h1>{dashboardData.message || 'Doctor Dashboard'}</h1>
        <div className="dashboard-content">
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Patients</h3>
              <p className="stat-number">{dashboardData.totalPatients}</p>
            </div>
            <div className="stat-card">
              <h3>Recent Consultations</h3>
              <p className="stat-number">{dashboardData.recentConsultations}</p>
            </div>
            <div className="stat-card">
              <h3>Pending Reviews</h3>
              <p className="stat-number">{dashboardData.pendingReviews}</p>
            </div>
          </div>

          <section className="recent-activity">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {dashboardData.recentActivities.length > 0 ? (
                dashboardData.recentActivities.map((activity, index) => (
                  <div className="activity-card" key={index}>
                    <div className="activity-icon">
                      {activity.type === 'consultation' ? '👨‍⚕️' : '📝'}
                    </div>
                    <div className="activity-details">
                      <h4>{activity.title}</h4>
                      <p>{activity.description}</p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No recent activities to display</p>
              )}
            </div>
          </section>

          <section className="patients-section">
            <h2>Your Patients</h2>
            <PatientList 
              patients={dashboardData.patients} 
              onPatientClick={handlePatientClick}
            />
          </section>
        </div>
      </div>
  );
};

export default DoctorDashboard;