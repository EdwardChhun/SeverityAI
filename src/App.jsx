import React from 'react';
import { useAuthInfo, useLogoutFunction } from '@propelauth/react';
import { useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import AppRoutes from './routes';

function App() {
  const { isLoggedIn } = useAuthInfo(); // Check if the user is logged in
  const logout = useLogoutFunction(); // Logout function from PropelAuth
  const location = useLocation(); // Access current route
  const navigate = useNavigate(); // For client-side navigation

  // Handle logout and redirect to "/home"
  const handleLogout = () => {
    logout(); // Log the user out
    navigate('/home'); // Redirect to the home page after logout
  };

  // Handle redirect to "/" (login page) for doctors
  const handleDoctorLogin = () => {
    navigate('/'); // Navigate to "/" where sign-in will happen
  };

  return (
    <div className="App">
      <header>
        {/* Render routes */}
        <AppRoutes />

        {/* Show the doctor login button on /home */}
        {!isLoggedIn && location.pathname === '/home' && (
          <button 
            className="doctor-login-button" 
            onClick={handleDoctorLogin} // Manual navigation to "/" for sign-in
          >
            Sign in as Doctor
          </button>
        )}

        {/* Show logout button only when logged in and on /doctor-portal */}
        {isLoggedIn && location.pathname === '/doctor-portal' && (
          <button onClick={handleLogout}>Logout</button>
        )}
      </header>
    </div>
  );
}

export default App;
