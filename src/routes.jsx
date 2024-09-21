import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import EmergencyRoomForm from './components/EmergencyRoomForm';
import DoctorsDashboard from './components/DoctorsDashboard';
import { useAuthInfo, useRedirectFunctions } from '@propelauth/react';

const AppRoutes = () => {
  const { isLoggedIn } = useAuthInfo(); // Check if the user is logged in
  const { redirectToLoginPage } = useRedirectFunctions(); // Redirect to login page

  return (
    <Routes>
      {/* Home page with the form (public route, accessible to everyone) */}
      <Route path="/home" element={<EmergencyRoomForm />} />
      
      {/* Login page at "/", after login, redirect to /doctor-portal */}
      <Route 
        path="/" 
        element={isLoggedIn ? <Navigate to="/doctor-portal" replace /> : <div>Sign In Page</div>} 
      />

      {/* Doctor's portal (protected) */}
      <Route 
        path="/doctor-portal" 
        element={isLoggedIn ? <DoctorsDashboard /> : redirectToLoginPage({ returnTo: '/doctor-portal' })} 
      />
      
      {/* Redirect any unknown routes to /home */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

export default AppRoutes;
