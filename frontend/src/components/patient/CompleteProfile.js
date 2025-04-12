import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createPatientProfile } from '../../api/patient';
import './CompleteProfile.css';

const CompleteProfile = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await createPatientProfile(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="complete-profile-container">
      <div className="complete-profile-card">
        <h2 className="complete-profile-title">Complete Your Profile</h2>
        <p className="complete-profile-subtitle">Please provide your basic information to continue</p>
        
        {error && (
          <div className="error-message">
            <span className="material-icons">error</span>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="complete-profile-form">
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              {...register("first_name", { 
                required: "First name is required",
                minLength: {
                  value: 2,
                  message: "Minimum 2 characters required"
                }
              })}
              className={`form-input ${errors.first_name ? 'input-error' : ''}`}
              placeholder="Enter your first name"
            />
            {errors.first_name && (
              <p className="error-text">
                <span className="material-icons">info</span>
                {errors.first_name.message}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input
              {...register("last_name", { 
                required: "Last name is required",
                minLength: {
                  value: 2,
                  message: "Minimum 2 characters required"
                }
              })}
              className={`form-input ${errors.last_name ? 'input-error' : ''}`}
              placeholder="Enter your last name"
            />
            {errors.last_name && (
              <p className="error-text">
                <span className="material-icons">info</span>
                {errors.last_name.message}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              {...register("date_of_birth", { 
                required: "Date of birth is required",
                validate: {
                  validDate: (value) => {
                    const selectedDate = new Date(value);
                    const currentDate = new Date();
                    return selectedDate < currentDate || "Date must be in the past";
                  }
                }
              })}
              className={`form-input ${errors.date_of_birth ? 'input-error' : ''}`}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.date_of_birth && (
              <p className="error-text">
                <span className="material-icons">info</span>
                {errors.date_of_birth.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="material-icons spin">autorenew</span>
                Processing...
              </>
            ) : (
              'Save Profile'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;