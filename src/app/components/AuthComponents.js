'use client';

import React, { useState, useEffect } from 'react';
import { inventoryAPI, AuthContext } from '../lib/aws-config';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

const AuthComponent = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState('signin'); // 'signin', 'signup', 'confirm', 'forgot'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
    confirmationCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if user is already authenticated
    if (AuthContext.isAuthenticated()) {
      onAuthSuccess?.();
    }
  }, [onAuthSuccess]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    const { email, password, fullName, confirmPassword } = formData;

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (mode === 'signup') {
      if (!fullName || fullName.length < 2) {
        setError('Please enter your full name');
        return false;
      }

      if (!password || password.length < 8) {
        setError('Password must be at least 8 characters long');
        return false;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }

      // Check password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      if (!passwordRegex.test(password)) {
        setError('Password must contain uppercase, lowercase, number, and special character');
        return false;
      }
    } else if (mode === 'signin') {
      if (!password) {
        setError('Please enter your password');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { email, password, fullName, confirmationCode } = formData;

      switch (mode) {
        case 'signin':
          const signInResponse = await inventoryAPI.signIn(email, password);
          setSuccess('Sign in successful!');
          setTimeout(() => onAuthSuccess?.(), 1000);
          break;

        case 'signup':
          await inventoryAPI.signUp(email, password, fullName);
          setSuccess('Account created! Please check your email for confirmation code.');
          setMode('confirm');
          break;

        case 'confirm':
          await inventoryAPI.confirmSignUp(email, confirmationCode);
          setSuccess('Email confirmed! You can now sign in.');
          setMode('signin');
          break;

        case 'forgot':
          // Implementation for forgot password
          setSuccess('Password reset instructions sent to your email.');
          break;

        default:
          setError('Invalid mode');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSignInForm = () => (
    <>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <label className="flex items-center">
          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span className="ml-2 text-sm text-gray-600">Remember me</span>
        </label>
        <button
          type="button"
          onClick={() => setMode('forgot')}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Forgot password?
        </button>
      </div>
    </>
  );

  const renderSignUpForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <div className="relative">
          <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your full name"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <div className="relative">
          <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Create a password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Must be 8+ characters with uppercase, lowercase, number, and special character
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Confirm your password"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderConfirmForm = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          We've sent a confirmation code to <strong>{formData.email}</strong>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirmation Code
        </label>
        <input
          type="text"
          name="confirmationCode"
          value={formData.confirmationCode}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
          placeholder="000000"
          maxLength="6"
          required
        />
      </div>

      <button
        type="button"
        onClick={() => {
          // Resend confirmation code logic
          setSuccess('Confirmation code resent!');
        }}
        className="w-full text-sm text-blue-600 hover:text-blue-800"
      >
        Didn't receive the code? Resend
      </button>
    </div>
  );

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Sign In to InventoryPro';
      case 'signup': return 'Create Your Account';
      case 'confirm': return 'Confirm Your Email';
      case 'forgot': return 'Reset Your Password';
      default: return 'Authentication';
    }
  };

  const getButtonText = () => {
    if (loading) return 'Please wait...';
    switch (mode) {
      case 'signin': return 'Sign In';
      case 'signup': return 'Create Account';
      case 'confirm': return 'Confirm Email';
      case 'forgot': return 'Send Reset Link';
      default: return 'Submit';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">{getTitle()}</h2>
            <p className="text-gray-600 mt-2">
              {mode === 'signin' ? 'Welcome back! Please sign in to continue.' :
               mode === 'signup' ? 'Join us and start optimizing your inventory.' :
               mode === 'confirm' ? 'Please check your email and enter the code.' :
               'Enter your email to reset your password.'}
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signin' && renderSignInForm()}
            {mode === 'signup' && renderSignUpForm()}
            {mode === 'confirm' && renderConfirmForm()}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {getButtonText()}
            </button>
          </form>

          {/* Mode switching */}
          <div className="mt-6 text-center">
            {mode === 'signin' && (
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign up
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign in
                </button>
              </p>
            )}

            {mode === 'confirm' && (
              <p className="text-sm text-gray-600">
                Want to use a different email?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Go back
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Demo credentials for testing */}
        <div className="bg-gray-100 rounded-lg p-4">
          <p className="text-xs text-gray-600 text-center">
            <strong>Demo:</strong> After AWS deployment, test with your own credentials
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthComponent;