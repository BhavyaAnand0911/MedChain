import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../layout/DashboardLayout';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="protected-route-loading">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If a specific role is required and user doesn't have it
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  // If authenticated and has correct role, render children inside the dashboard layout
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default ProtectedRoute;