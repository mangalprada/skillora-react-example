import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { SkilloraAuthProvider } from '../lib/context/SkilloraAuthContext.jsx';
import { AuthProvider } from '../lib/context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SkilloraAuthProvider>
          <App />
        </SkilloraAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
