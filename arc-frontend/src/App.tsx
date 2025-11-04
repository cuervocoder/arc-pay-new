import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Preferences } from './pages/Preferences';
import { Agent } from './pages/Agent';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { useAuthStore } from './services/store';
import { apiService } from './services/api';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/signin" replace />;
};

function App() {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    // Recover session from token if exists
    const token = localStorage.getItem('auth_token');
    if (token && !user) {
      apiService.setToken(token);
      // Try to fetch user profile
      apiService.getProfile().then(response => {
        if (response.data) {
          setUser(response.data);
        }
      });
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Private Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/history"
          element={
            <PrivateRoute>
              <Layout>
                <History />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/preferences"
          element={
            <PrivateRoute>
              <Layout>
                <Preferences />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/agent"
          element={
            <PrivateRoute>
              <Layout>
                <Agent />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
