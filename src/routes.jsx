import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import EmergencyRoomForm from './components/EmergencyRoomForm';
import DoctorsDashboard from './components/DoctorsDashboard';
import { useAuthInfo, useRedirectFunctions } from '@propelauth/react';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuthInfo();
  const { redirectToLoginPage } = useRedirectFunctions();

  if (!isLoggedIn) {
    redirectToLoginPage({ returnTo: '/doctor-portal' });
    return null;
  }
  return children;
};

const AppRoutes = () => {
  const { isLoggedIn } = useAuthInfo();

  return (
    <Routes>
      {/* Public route: Home page with the emergency room form */}
      <Route path="/home" element={<EmergencyRoomForm />} />
      
      {/* Protected route: Doctor's portal */}
      <Route 
        path="/doctor-portal" 
        element={
          <ProtectedRoute>
            <DoctorsDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Root path now redirects to /home instead of triggering login */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Catch-all: redirect any unknown routes to /home */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

export default AppRoutes;