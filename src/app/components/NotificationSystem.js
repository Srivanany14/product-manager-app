'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { inventoryAPI } from '../lib/aws-config';
import { 
  Bell, CheckCircle, AlertTriangle, XCircle, Info, X, Clock, 
  Package, TrendingDown, TrendingUp, Zap, Settings, Volume2, VolumeX
} from 'lucide-react';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoMarkRead, setAutoMarkRead] = useState(true);
  const [notificationSettings, setNotificationSettings] = useState({
    lowStock: true,
    outOfStock: true,
    forecastAlerts: true,
    systemUpdates: true,
    reorderSuggestions: true
  });

  // Audio for notifications
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && typeof window !== 'undefined') {
      // Create a simple notification sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  }, [soundEnabled]);

  // Add notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep max 50 notifications
    setUnreadCount(prev => prev + 1);
    
    // Play sound for important notifications
    if (notification.priority === 'high' || notification.type === 'error') {
      playNotificationSound();
    }

    // Auto-remove non-critical notifications after delay
    if (notification.autoRemove !== false) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, notification.duration || 5000);
    }

    return newNotification.id;
  }, [playNotificationSound]);

  // Remove notification
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => prev.map(notification => {
      if (notification.id === notificationId && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
        return { ...notification, read: true };
      }
      return notification;
    }));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Setup event listeners for inventory events
  useEffect(() => {
    // Low stock alerts
    const handleLowStockAlert = (product) => {
      if (!notificationSettings.lowStock) return;
      
      addNotification({
        type: 'warning',
        priority: 'high',
        title: 'Low Stock Alert',
        message: `${product.name} is running low (${product.stock} remaining)`,
        icon: <AlertTriangle className="w-5 h-5" />,
        actions: [
          {
            label: 'Reorder Now',
            action: () => console.log('Reorder:', product.productId),
            primary: true
          },
          {
            label: 'View Product',
            action: () => console.log('View:', product.productId)
          }
        ],
        autoRemove: false
      });
    };

    // Out of stock alerts
    const handleOutOfStockAlert = (product) => {
      if (!notificationSettings.outOfStock) return;
      
      addNotification({
        type: 'error',
        priority: 'critical',
        title: 'Out of Stock',
        message: `${product.name} is completely out of stock!`,
        icon: <XCircle className="w-5 h-5" />,
        actions: [
          {
            label: 'Emergency Reorder',
            action: () => console.log('Emergency reorder:', product.productId),
            primary: true
          }
        ],
        autoRemove: false
      });
    };

    // Forecast completion
    const handleForecastCompleted = ({ productId, forecast }) => {
      if (!notificationSettings.forecastAlerts) return;
      
      const trend = forecast.predictions && forecast.predictions[0]?.demand > forecast.predictions[forecast.predictions.length - 1]?.demand ? 'decreasing' : 'increasing';
      
      addNotification({
        type: 'success',
        priority: 'medium',
        title: 'Forecast Updated',
        message: `AI forecast completed for product ${productId}. Demand trend: ${trend}`,
        icon: <TrendingUp className="w-5 h-5" />,
        actions: [
          {
            label: 'View Forecast',
            action: () => console.log('View forecast:', productId)
          }
        ]
      });
    };

    // Product created
    const handleProductCreated = (product) => {
      addNotification({
        type: 'success',
        priority: 'low',
        title: 'Product Added',
        message: `${product.name} has been added to inventory`,
        icon: <Package className="w-5 h-5" />
      });
    };

    // Product updated
    const handleProductUpdated = (product) => {
      addNotification({
        type: 'info',
        priority: 'low',
        title: 'Product Updated',
        message: `${product.name} has been updated`,
        icon: <CheckCircle className="w-5 h-5" />
      });
    };

    // Inventory changed
    const handleInventoryChanged = ({ action, product }) => {
      if (action === 'update' && product.stock <= product.reorderPoint && notificationSettings.reorderSuggestions) {
        addNotification({
          type: 'warning',
          priority: 'medium',
          title: 'Reorder Suggested',
          message: `Consider reordering ${product.name} (${product.stock} remaining)`,
          icon: <AlertTriangle className="w-5 h-5" />,
          actions: [
            {
              label: 'Create Order',
              action: () => console.log('Create order for:', product.productId),
              primary: true
            }
          ]
        });
      }
    };

    // System events
    const handleError = ({ endpoint, error }) => {
      addNotification({
        type: 'error',
        priority: 'high',
        title: 'System Error',
        message: `Error in ${endpoint}: ${error}`,
        icon: <XCircle className="w-5 h-5" />,
        autoRemove: false
      });
    };

    const handleHealthCheck = ({ healthy, error }) => {
      if (!healthy && notificationSettings.systemUpdates) {
        addNotification({
          type: 'error',
          priority: 'critical',
          title: 'System Offline',
          message: 'Unable to connect to backend services',
          icon: <XCircle className="w-5 h-5" />,
          autoRemove: false
        });
      }
    };

    // Subscribe to events
    inventoryAPI.addEventListener('lowStockAlert', handleLowStockAlert);
    inventoryAPI.addEventListener('outOfStockAlert', handleOutOfStockAlert);
    inventoryAPI.addEventListener('forecastCompleted', handleForecastCompleted);
    inventoryAPI.addEventListener('productCreated', handleProductCreated);
    inventoryAPI.addEventListener('productUpdated', handleProductUpdated);
    inventoryAPI.addEventListener('inventoryChanged', handleInventoryChanged);
    inventoryAPI.addEventListener('error', handleError);
    inventoryAPI.addEventListener('healthCheck', handleHealthCheck);

    return () => {
      inventoryAPI.removeEventListener('lowStockAlert', handleLowStockAlert);
      inventoryAPI.removeEventListener('outOfStockAlert', handleOutOfStockAlert);
      inventoryAPI.removeEventListener('forecastCompleted', handleForecastCompleted);
      inventoryAPI.removeEventListener('productCreated', handleProductCreated);
      inventoryAPI.removeEventListener('productUpdated', handleProductUpdated);
      inventoryAPI.removeEventListener('inventoryChanged', handleInventoryChanged);
      inventoryAPI.removeEventListener('error', handleError);
      inventoryAPI.removeEventListener('healthCheck', handleHealthCheck);
    };
  }, [addNotification, notificationSettings]);

  // Auto-mark as read when panel is opened
  useEffect(() => {
    if (showPanel && autoMarkRead) {
      const timer = setTimeout(() => {
        markAllAsRead();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showPanel, autoMarkRead, markAllAsRead]);

  // Get notification icon and colors
  const getNotificationStyle = (type, priority) => {
    const baseClasses = "p-4 rounded-lg border-l-4 shadow-sm";
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50 border-green-500 text-green-800`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border-yellow-500 text-yellow-800`;
      case 'error':
        return `${baseClasses} bg-red-50 border-red-500 text-red-800`;
      case 'info':
      default:
        return `${baseClasses} bg-blue-50 border-blue-500 text-blue-800`;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'info': 
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  // Render notification item
  const renderNotification = (notification) => (
    <div
      key={notification.id}
      className={`${getNotificationStyle(notification.type, notification.priority)} ${
        !notification.read ? 'ring-2 ring-blue-200' : ''
      } transition-all duration-200 hover:shadow-md`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {notification.icon || getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium">{notification.title}</h4>
              <p className="text-sm mt-1 opacity-90">{notification.message}</p>
              
              {notification.actions && (
                <div className="flex space-x-2 mt-3">
                  {notification.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`text-xs px-3 py-1 rounded transition-colors ${
                        action.primary
                          ? 'bg-white bg-opacity-20 hover:bg-opacity-30 font-medium'
                          : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2 ml-2">
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs opacity-75">
              {notification.timestamp.toLocaleTimeString()}
            </span>
            {notification.priority === 'critical' && (
              <span className="text-xs font-medium bg-red-200 text-red-800 px-2 py-0.5 rounded">
                Critical
              </span>
            )}
            {notification.priority === 'high' && (
              <span className="text-xs font-medium bg-orange-200 text-orange-800 px-2 py-0.5 rounded">
                High
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render settings panel
  const renderSettings = () => (
    <div className="p-4 border-t border-gray-200 bg-gray-50">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Notification Settings</h3>
      
      <div className="space-y-3">
        {Object.entries(notificationSettings).map(([key, enabled]) => (
          <label key={key} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setNotificationSettings(prev => ({
                ...prev,
                [key]: e.target.checked
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 capitalize">
              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </span>
          </label>
        ))}
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Sound notifications</span>
          </label>
          
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={autoMarkRead}
            onChange={(e) => setAutoMarkRead(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Auto-mark as read</span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Notification Bell Button */}
      <div className="relative">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Panel */}
        {showPanel && (
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white sticky top-0">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                <div className="flex items-center space-x-2">
                  {notifications.length > 0 && (
                    <>
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Mark all read
                      </button>
                      <button
                        onClick={clearAll}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Clear all
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowPanel(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-64">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {notifications.map(renderNotification)}
                </div>
              )}
            </div>

            {/* Settings */}
            {renderSettings()}
          </div>
        )}
      </div>

      {/* Floating Notifications (for critical alerts) */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications
          .filter(n => n.priority === 'critical' && !n.read)
          .slice(0, 3)
          .map(notification => (
            <div
              key={`floating-${notification.id}`}
              className={`transform transition-all duration-300 translate-x-0 ${getNotificationStyle(notification.type, notification.priority)} min-w-80 max-w-96 shadow-lg`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {notification.icon || getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{notification.title}</h4>
                  <p className="text-sm mt-1 opacity-90">{notification.message}</p>
                  {notification.actions && (
                    <div className="flex space-x-2 mt-2">
                      {notification.actions.slice(0, 2).map((action, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            action.action();
                            markAsRead(notification.id);
                          }}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            action.primary
                              ? 'bg-white bg-opacity-20 hover:bg-opacity-30 font-medium'
                              : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Click outside to close */}
      {showPanel && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPanel(false)}
        />
      )}
    </>
  );
};

export default NotificationSystem;