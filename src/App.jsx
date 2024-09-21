import React from 'react';
import { useAuthInfo, useLogoutFunction, useRedirectFunctions } from '@propelauth/react';
import { useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import AppRoutes from './routes';

function App() {

  const { isLoggedIn, loading } = useAuthInfo();
  const logout = useLogoutFunction();
  const { redirectToLoginPage } = useRedirectFunctions();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      // After successful logout, navigate to home
      navigate('/home');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDoctorLogin = () => {
    redirectToLoginPage({ returnTo: '/doctor-portal' });
  };

  if (loading) {
    return <div>Loading...</div>; // Or any loading indicator
  }

  return (
    <div className="App">
      <header>
        <AppRoutes />

        {!isLoggedIn && location.pathname === '/home' && (
          <button 
            className="doctor-login-button" 
            onClick={handleDoctorLogin}
          >
            Sign in as Doctor
          </button>
        )}

        {isLoggedIn && location.pathname === '/doctor-portal' && (
          <button onClick={handleLogout}>Logout</button>
        )}
      </header>
    </div>
  );
}

export default App;