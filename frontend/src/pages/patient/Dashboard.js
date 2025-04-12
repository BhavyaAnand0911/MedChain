import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getPatientDashboard } from '../../api/patient';
import MedicalRecordsList from '../../components/patient/MedicalRecordsList';
import PageHeader from '../../components/common/PageHeader';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import './Dashboard.css';
import { Navigate, useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPatientDashboard();
        console.log('Received data:', data);
        
        setDashboardData({
          ...data,
          // Ensure we have a fallback for all fields
          username: data.username || 'Patient',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          full_name: [data.first_name, data.last_name].filter(Boolean).join(' ') || data.username
        });
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError(err.message || 'Failed to load dashboard data');
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        await getPatientDashboard();
      } catch (err) {
        if (err.response?.status === 404 && err.response?.data?.action_required) {
          navigate(err.response.data.redirect_to);
        }
      }
    };
    loadDashboard();
  }, [navigate]);


  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="patient-dashboard">
      <PageHeader 
  title={`Welcome, ${
    (dashboardData?.first_name && dashboardData?.last_name) 
      ? `${dashboardData.first_name} ${dashboardData.last_name}`
      : dashboardData?.username || 'Patient'
  }`}
/>
      
      <div className="dashboard-grid">
        <div className="dashboard-card summary-card">
          <h2 className="card-title">Health Summary</h2>
          <div className="summary-content">
            <div className="summary-item">
              <p className="summary-label">Total Records:</p>
              <h3 className="summary-value">{dashboardData?.total_records || 0}</h3>
            </div>
            <div className="summary-item">
              <p className="summary-label">Last Upload:</p>
              <p className="summary-value">
                {dashboardData?.last_upload ? new Date(dashboardData.last_upload).toLocaleDateString() : 'No uploads yet'}
              </p>
            </div>
            <div className="summary-item">
              <p className="summary-label">Verified Records:</p>
              <h3 className="summary-value">
                {dashboardData?.verified_records || 0} / {dashboardData?.total_records || 0}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card blockchain-card">
          <h2 className="card-title">Blockchain Verification</h2>
          <div className="blockchain-content">
            <div className="verification-status">
              <div className={`status-icon ${dashboardData?.verified_records > 0 ? 'verified' : 'pending'}`}></div>
              <p>
                {dashboardData?.verified_records > 0 
                  ? "Your medical records are secured with blockchain technology" 
                  : "Verification pending for your records"}
              </p>
            </div>
            <p className="blockchain-info">
              All uploads are verified and encrypted. Each document receives a unique hash stored on the blockchain.
            </p>
          </div>
        </div>
        
        <div className="dashboard-card records-card">
          <h2 className="card-title">Recent Medical Records</h2>
          <MedicalRecordsList 
            records={dashboardData?.recent_records || []} 
            limit={5}
          />
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;