'use client';

import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../lib/aws-config';
import { 
  Settings, Plus, RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock,
  Zap, Database, ShoppingCart, DollarSign, Truck, Globe, Link,
  Activity, BarChart3, Users, Package, ArrowRight, Edit, Trash2,
  Upload, Download, PlayCircle, PauseCircle, Eye, Key
} from 'lucide-react';

const IntegrationHub = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connectionTests, setConnectionTests] = useState({});
  const [syncStatus, setSyncStatus] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  // Integration Categories
  const integrationCategories = {
    erp: {
      name: 'ERP Systems',
      icon: <Database className="w-6 h-6" />,
      color: 'blue',
      description: 'Connect with enterprise resource planning systems'
    },
    ecommerce: {
      name: 'E-commerce Platforms',
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'green',
      description: 'Sync with online stores and marketplaces'
    },
    accounting: {
      name: 'Accounting Software',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'yellow',
      description: 'Financial data and reporting integration'
    },
    suppliers: {
      name: 'Supplier Networks',
      icon: <Truck className="w-6 h-6" />,
      color: 'purple',
      description: 'Connect with supplier APIs and EDI systems'
    }
  };

  // Sample integrations data
  const [availableIntegrations] = useState([
    // ERP Systems
    {
      id: 'sap-hana',
      name: 'SAP HANA',
      category: 'erp',
      provider: 'SAP',
      type: 'Database',
      status: 'connected',
      version: '2.0',
      lastSync: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
      features: ['Real-time sync', 'Bi-directional', 'Automated mapping'],
      endpoints: {
        inventory: '/api/inventory',
        orders: '/api/sales-orders',
        suppliers: '/api/vendors'
      },
      config: {
        host: 'sap-server.company.com',
        database: 'PROD',
        username: 'inv_user',
        syncInterval: 15
      }
    },
    {
      id: 'oracle-erp',
      name: 'Oracle ERP Cloud',
      category: 'erp',
      provider: 'Oracle',
      type: 'Cloud API',
      status: 'connected',
      version: '23C',
      lastSync: new Date(Date.now() - 8 * 60 * 1000),
      features: ['REST API', 'Webhook support', 'Bulk operations'],
      endpoints: {
        inventory: '/fscmRestApi/resources/11.13.18.05/items',
        orders: '/fscmRestApi/resources/11.13.18.05/purchaseOrders'
      }
    },
    {
      id: 'netsuite',
      name: 'NetSuite',
      category: 'erp',
      provider: 'Oracle',
      type: 'SuiteTalk API',
      status: 'error',
      version: '2023.2',
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
      error: 'Authentication token expired',
      features: ['RESTlets', 'SuiteScript', 'Real-time updates']
    },

    // E-commerce Platforms  
    {
      id: 'shopify',
      name: 'Shopify',
      category: 'ecommerce',
      provider: 'Shopify Inc.',
      type: 'REST API',
      status: 'connected',
      version: '2023-10',
      lastSync: new Date(Date.now() - 5 * 60 * 1000),
      features: ['Product sync', 'Order management', 'Inventory tracking'],
      metrics: {
        products: 1247,
        orders: 89,
        revenue: 15640
      }
    },
    {
      id: 'woocommerce',
      name: 'WooCommerce',
      category: 'ecommerce',
      provider: 'Automattic',
      type: 'REST API',
      status: 'connected',
      version: '7.1',
      lastSync: new Date(Date.now() - 12 * 60 * 1000),
      features: ['Product catalog', 'Stock levels', 'Order processing']
    },
    {
      id: 'amazon-seller',
      name: 'Amazon Seller Central',
      category: 'ecommerce',
      provider: 'Amazon',
      type: 'SP-API',
      status: 'pending',
      version: 'v0',
      features: ['FBA inventory', 'Order fulfillment', 'Reporting']
    },

    // Accounting Software
    {
      id: 'quickbooks',
      name: 'QuickBooks Online',
      category: 'accounting',
      provider: 'Intuit',
      type: 'REST API',
      status: 'connected',
      version: 'v3',
      lastSync: new Date(Date.now() - 30 * 60 * 1000),
      features: ['Invoice sync', 'Expense tracking', 'Financial reporting'],
      metrics: {
        invoices: 156,
        expenses: 89,
        revenue: 45230
      }
    },
    {
      id: 'xero',
      name: 'Xero',
      category: 'accounting',
      provider: 'Xero Limited',
      type: 'REST API',
      status: 'disconnected',
      version: '2.0',
      features: ['Bank reconciliation', 'Tax reporting', 'Multi-currency']
    },

    // Supplier Networks
    {
      id: 'supplier-api-1',
      name: 'Global Parts Supplier',
      category: 'suppliers',
      provider: 'GPS Inc.',
      type: 'REST API',
      status: 'connected',
      version: '1.2',
      lastSync: new Date(Date.now() - 45 * 60 * 1000),
      features: ['Catalog sync', 'Pricing updates', 'Availability check']
    },
    {
      id: 'edi-supplier',
      name: 'Manufacturing EDI Network',
      category: 'suppliers',
      provider: 'MFG Network',
      type: 'EDI',
      status: 'connected',
      version: 'X12 4010',
      lastSync: new Date(Date.now() - 20 * 60 * 1000),
      features: ['EDI 850 (PO)', 'EDI 856 (ASN)', 'EDI 810 (Invoice)']
    }
  ]);

  useEffect(() => {
    loadIntegrations();
    startSyncMonitoring();
  }, []);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      // In real app, this would fetch from API
      setIntegrations(availableIntegrations);
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSyncMonitoring = () => {
    // Monitor sync status in real-time
    const interval = setInterval(() => {
      availableIntegrations.forEach(integration => {
        if (integration.status === 'connected') {
          // Simulate sync updates
          setSyncStatus(prev => ({
            ...prev,
            [integration.id]: {
              lastSync: new Date(),
              status: 'syncing',
              progress: Math.floor(Math.random() * 100)
            }
          }));
        }
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  };

  const testConnection = async (integrationId) => {
    setConnectionTests(prev => ({ ...prev, [integrationId]: 'testing' }));
    
    // Simulate connection test
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate
      setConnectionTests(prev => ({ 
        ...prev, 
        [integrationId]: success ? 'success' : 'failed' 
      }));
    }, 2000);
  };

  const syncNow = async (integrationId) => {
    setSyncStatus(prev => ({
      ...prev,
      [integrationId]: { status: 'syncing', progress: 0 }
    }));

    // Simulate sync progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        setSyncStatus(prev => ({
          ...prev,
          [integrationId]: { 
            status: 'completed', 
            progress: 100, 
            lastSync: new Date() 
          }
        }));
        clearInterval(interval);
      } else {
        setSyncStatus(prev => ({
          ...prev,
          [integrationId]: { status: 'syncing', progress }
        }));
      }
    }, 500);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'disconnected': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />;
      case 'disconnected': return <XCircle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      erp: 'blue',
      ecommerce: 'green', 
      accounting: 'yellow',
      suppliers: 'purple'
    };
    return colors[category] || 'gray';
  };

  // Dashboard Overview
  const IntegrationDashboard = () => {
    const connected = integrations.filter(i => i.status === 'connected').length;
    const errors = integrations.filter(i => i.status === 'error').length;
    const pending = integrations.filter(i => i.status === 'pending').length;

    return (
      <div className="space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Integrations</p>
                <p className="text-3xl font-bold text-gray-900">{integrations.length}</p>
              </div>
              <Database className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connected</p>
                <p className="text-3xl font-bold text-green-600">{connected}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Errors</p>
                <p className="text-3xl font-bold text-red-600">{errors}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Integration Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(integrationCategories).map(([key, category]) => {
            const categoryIntegrations = integrations.filter(i => i.category === key);
            const connectedCount = categoryIntegrations.filter(i => i.status === 'connected').length;
            
            return (
              <div key={key} className="bg-white rounded-lg shadow-sm p-6 border hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-3 rounded-lg bg-${category.color}-100`}>
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{connectedCount}/{categoryIntegrations.length} connected</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                <button 
                  onClick={() => setActiveTab(key)}
                  className={`w-full bg-${category.color}-50 text-${category.color}-700 py-2 px-4 rounded-lg hover:bg-${category.color}-100 transition-colors`}
                >
                  Manage
                </button>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {integrations.slice(0, 5).map(integration => (
              <div key={integration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    integration.status === 'connected' ? 'bg-green-500' : 
                    integration.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{integration.name}</p>
                    <p className="text-sm text-gray-500">
                      Last sync: {integration.lastSync ? integration.lastSync.toLocaleTimeString() : 'Never'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {syncStatus[integration.id]?.status === 'syncing' && (
                    <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                  )}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(integration.status)}`}>
                    {integration.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Integration List by Category
  const IntegrationList = ({ category }) => {
    const categoryIntegrations = integrations.filter(i => i.category === category);
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {integrationCategories[category]?.name}
            </h2>
            <p className="text-gray-600">{integrationCategories[category]?.description}</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Integration</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categoryIntegrations.map(integration => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>
      </div>
    );
  };

  // Individual Integration Card
  const IntegrationCard = ({ integration }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-${getCategoryColor(integration.category)}-100`}>
            {integrationCategories[integration.category]?.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{integration.name}</h3>
            <p className="text-sm text-gray-500">{integration.provider} • {integration.type}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(integration.status)}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(integration.status)}`}>
            {integration.status}
          </span>
        </div>
      </div>

      {/* Features */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Features:</p>
        <div className="flex flex-wrap gap-1">
          {integration.features?.map((feature, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Metrics (if available) */}
      {integration.metrics && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">Recent Metrics:</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {Object.entries(integration.metrics).map(([key, value]) => (
              <div key={key}>
                <p className="text-lg font-bold text-gray-900">{value.toLocaleString()}</p>
                <p className="text-xs text-gray-500 capitalize">{key}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sync Status */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Last sync:</span>
          <span className="text-gray-900">
            {integration.lastSync ? integration.lastSync.toLocaleString() : 'Never'}
          </span>
        </div>
        {syncStatus[integration.id] && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Sync progress:</span>
              <span className="text-gray-900">{Math.round(syncStatus[integration.id].progress || 0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${syncStatus[integration.id].progress || 0}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {integration.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{integration.error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => testConnection(integration.id)}
          disabled={connectionTests[integration.id] === 'testing'}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {connectionTests[integration.id] === 'testing' ? (
            <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
          ) : (
            'Test Connection'
          )}
        </button>
        
        <button
          onClick={() => syncNow(integration.id)}
          disabled={integration.status !== 'connected'}
          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          Sync Now
        </button>
        
        <button
          onClick={() => setSelectedIntegration(integration)}
          className="p-2 text-gray-600 hover:text-gray-900"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enterprise Integrations</h1>
          <p className="text-gray-600 mt-1">Connect with ERP, E-commerce, Accounting, and Supplier systems</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={loadIntegrations}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Integration</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'erp', name: 'ERP Systems', icon: <Database className="w-4 h-4" /> },
            { id: 'ecommerce', name: 'E-commerce', icon: <ShoppingCart className="w-4 h-4" /> },
            { id: 'accounting', name: 'Accounting', icon: <DollarSign className="w-4 h-4" /> },
            { id: 'suppliers', name: 'Suppliers', icon: <Truck className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
              {tab.id !== 'dashboard' && (
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {integrations.filter(i => i.category === tab.id).length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'dashboard' && <IntegrationDashboard />}
        {activeTab !== 'dashboard' && <IntegrationList category={activeTab} />}
      </div>
    </div>
  );
};

export default IntegrationHub;