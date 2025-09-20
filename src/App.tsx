import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TranslationProvider } from './contexts/TranslationContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import OrderForm from './pages/OrderForm';
import Clients from './pages/Clients';
import Users from './pages/Users';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import PasswordChangeModal from './components/PasswordChangeModal';
import { GlobalStyles } from './styles/GlobalStyles';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  // Check if user needs to reset password
  React.useEffect(() => {
    if (user?.mustResetPassword) {
      setShowPasswordChange(true);
    }
  }, [user]);

  const handlePasswordChangeSuccess = () => {
    setShowPasswordChange(false);
    // Refresh user data to clear mustResetPassword flag
    window.location.reload();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <TranslationProvider>
      <ThemeProvider>
        <GlobalStyles />
        {showPasswordChange && (
          <PasswordChangeModal onSuccess={handlePasswordChangeSuccess} />
        )}
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/users" element={<Users />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/new" element={<OrderForm />} />
            <Route path="/orders/:id/edit" element={<OrderForm />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </ThemeProvider>
    </TranslationProvider>
  );
};

export default App;

