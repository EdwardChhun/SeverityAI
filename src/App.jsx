import React, { useState, useEffect } from 'react';
import { useAuthInfo, useLogoutFunction, useRedirectFunctions } from '@propelauth/react';
import EmergencyRoomForm from './components/EmergencyRoomForm';
import './App.css';

function App() {
  const { isLoggedIn, user, isLoading } = useAuthInfo(); // Assuming `isLoading` is part of the auth info
  const logout = useLogoutFunction();
  const { redirectToLoginPage } = useRedirectFunctions();

  // Optionally, handle loading state
  if (isLoading) {
    return <div>Loading...</div>; // Simple loading indicator
  }

  return (
    <div className="App">
      <header>
        {isLoggedIn ? (
          <>
            <h1>Welcome, {user?.name}!</h1>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <button onClick={redirectToLoginPage}>Login</button>
        )}
      </header>
      {isLoggedIn ? (
        <EmergencyRoomForm />
      ) : (
        <div>Please log in to access the Emergency Room Form.</div>
      )}
    </div>
  );
}

export default App;
