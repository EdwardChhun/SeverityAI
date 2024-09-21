import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@propelauth/react';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider authUrl={import.meta.env.VITE_AUTH_URL}>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
