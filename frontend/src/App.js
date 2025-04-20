import React from "react";
import { useEffect } from "react";
import { checkProfileExists } from "./api/patient";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./App.css";

// Auth pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// Patient pages
import PatientDashboard from "./pages/patient/Dashboard";
import MedicalRecords from "./pages/patient/MedicalRecords";
import Chatbot from "./pages/patient/Chatbot";
import DiseasePrediction from "./pages/patient/DiseasePrediction";
import UploadMedicalRecord from "./components/patient/uploadMedicalRecord";

// Doctor pages
import DoctorDashboard from "./pages/doctor/Dashboard";
import PatientDetails from "./pages/doctor/PatientDetails";

// Other pages
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

// Components
import ProtectedRoute from "./components/common/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import CompleteProfile from "./components/patient/CompleteProfile";

function App() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
  
    const checkProfile = async () => {
      try {
        const { exists } = await checkProfileExists();
        if (
          !exists &&
          window.location.pathname !== "/complete-profile" &&
          user?.role === "patient"
        ) {
          navigate("/complete-profile");
        }
      } catch (err) {
        console.error("Profile check failed:", err);
      }
    };
    
    checkProfile();
  }, [navigate, user]); // Add user as dependency
  if (loading) {
    return <div className="app-loading">Loading...</div>;
  }

  return (
    <div className="app">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/signup"
          element={!user ? <Signup /> : <Navigate to="/dashboard" />}
        />

        {/* Protected routes based on user role */}
        {/* Patient routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {user?.role === "patient" && <PatientDashboard />}
              {user?.role === "doctor" && <DoctorDashboard />}
            </ProtectedRoute>
          }
        />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route
          path="/medical-records"
          element={
            <ProtectedRoute requiredRole="patient">
              <MedicalRecords />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medical-records/upload"
          element={
            <ProtectedRoute requiredRole="patient">
              <UploadMedicalRecord />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatbot/:recordId?"
          element={
            <ProtectedRoute requiredRole="patient">
              <Chatbot />
            </ProtectedRoute>
          }
        />
        <Route
          path="/disease-prediction"
          element={
            <ProtectedRoute requiredRole="patient">
              <DiseasePrediction />
            </ProtectedRoute>
          }
        />

        {/* Doctor routes */}
        <Route
          path="/patients/:id"
          element={
            <ProtectedRoute requiredRole="doctor">
              <PatientDetails />
            </ProtectedRoute>
          }
        />

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
