import React from 'react';
import ReactDOM from 'react-dom/client'; 
import App from './App';
import { AuthProvider } from './contexts/authContext';
import { BrowserRouter } from 'react-router-dom';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')); 

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
