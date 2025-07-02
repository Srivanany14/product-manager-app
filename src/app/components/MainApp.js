'use client';

import React, { useState, useEffect } from 'react';
import { inventoryAPI, AuthContext } from '../lib/aws-config';
import AuthComponent from './AuthComponent';
import InventoryApp from './InventoryApp';
import { User, LogOut, Settings } from 'lucide-react';

const MainApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize API from storage
    inventoryAPI.initializeFromStorage();
    
    // Check authentication status
    const checkAuth = () => {
      const authenticated = AuthContext.isAuthenticated();
      const user = AuthContext.getCurrentUser();
      
      setIsAuthenticated(authenticated);
      setCurrentUser(user);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = () => {
    const user = AuthContext.getCurrentUser();
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await AuthContext.logout();
      setIsAuthenticated(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading InventoryPro...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthComponent onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar with user info */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-lg"></div>
              <span className="text-sm font-medium text-gray-900">
                Welcome back, {currentUser?.name || 'User'}!
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{currentUser?.email}</span>
              </div>
              
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Settings className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main inventory app */}
      <InventoryApp />
    </div>
  );
};

export default MainApp;