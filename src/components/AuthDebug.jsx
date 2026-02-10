// Auth Debug Component for testing
import React from 'react';
import { useAuth } from '../context/AuthContext';

const AuthDebug = () => {
  const { user, isAuthenticated, isLoading, error, login, register, logout } = useAuth();

  const handleTestLogin = async () => {
    try {
      await login('john.doe@company.com', 'password123');
      console.log('Test login successful');
    } catch (error) {
      console.error('Test login failed:', error);
    }
  };

  return (
    <div className="fixed top-20 right-4 bg-white p-4 rounded-lg shadow-lg z-50 max-w-xs">
      <h3 className="font-bold text-sm mb-2">Auth Debug</h3>
      <div className="text-xs space-y-1">
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        <p>Error: {error || 'None'}</p>
        <p>User: {user ? user.email : 'None'}</p>
      </div>
      <button
        onClick={handleTestLogin}
        className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded"
      >
        Test Login
      </button>
      {isAuthenticated && (
        <button
          onClick={logout}
          className="mt-1 ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded"
        >
          Logout
        </button>
      )}
    </div>
  );
};

export default AuthDebug;
