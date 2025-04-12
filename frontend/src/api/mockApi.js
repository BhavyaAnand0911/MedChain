import {
    mockSignup,
    mockLogin,
    mockLogout,
    mockGetCurrentUser
  } from '../mocks/authMock';
  import {
    mockGetRecords,
    mockAddRecord
  } from '../mocks/medicalRecords';
  import {
    mockGetDoctors,
    mockGetDoctor
  } from '../mocks/doctors';
  
  export default {
    // Auth
    signupUser: mockSignup,
    loginUser: mockLogin,
    logoutUser: mockLogout,
    getCurrentUser: mockGetCurrentUser,
  
    // Medical Records
    getMedicalRecords: mockGetRecords,
    addMedicalRecord: mockAddRecord,
  
    // Doctors
    getDoctors: mockGetDoctors,
    getDoctor: mockGetDoctor,
  
  };