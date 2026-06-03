import React from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css';
import './App.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { PublicAuthProvider } from "./auth/PublicAuthContext";
// 🚀 1. Import the new Google Provider
import { GoogleOAuthProvider } from '@react-oauth/google';

// 🚀 2. Safely grab the Google Client ID
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

const root = ReactDOM.createRoot(document.getElementById("root"));

// 🚀 3. Wrap your App. GoogleOAuthProvider goes on the outside.
root.render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <PublicAuthProvider>
      <App />
    </PublicAuthProvider>
  </GoogleOAuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();