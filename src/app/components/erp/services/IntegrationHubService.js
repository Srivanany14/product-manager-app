'use client'
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { 
  Package, TrendingUp, AlertTriangle, DollarSign, Calendar, Download, Upload, Search, Filter, 
  MoreVertical, Eye, Edit, Trash2, Plus, RefreshCw, Bell, Settings, User, Home, BarChart3,
  ShoppingCart, Truck, Warehouse, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Brain,
  Database, Globe, Zap, Link, Activity, Users, Key, PlayCircle, PauseCircle, ArrowRight
} from 'lucide-react';

// AWS EventBridge Integration Service
class EventBridgeService {
  constructor() {
    this.eventBus = new Map();
    this.subscribers = new Map();
    this.eventHistory = [];
  }

  // Publish event to EventBridge
  async publishEvent(source, detailType, detail) {
    const event = {
      id: `event-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      source,
      detailType,
      detail,
      timestamp: new Date(),
      region: 'us-east-1'
    };

    this.eventHistory.unshift(event);
    if (this.eventHistory.length > 100) {
      this.eventHistory = this.eventHistory.slice(0, 100);
    }

    // Notify subscribers
    const subscribers = this.subscribers.get(detailType) || [];
    subscribers.forEach(callback => callback(event));

    return event;
  }

  // Subscribe to events
  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType).push(callback);
  }

  // Get event history
  getEventHistory(limit = 50) {
    return this.eventHistory.slice(0, limit);
  }
}

// Integration Hub Service
class IntegrationHubService {
  constructor() {
    this.eventBridge = new EventBridgeService();
    this.integrations = new Map();
    this.syncJobs = new Map();
    this.webhooks = new Map();
  }

  // Register integration
  async registerIntegration(config) {
    const integration = {
      id: config.id || `int-${Date.now()}`,
      name: config.name,
      type: config.type,
      category: config.category,
      status: 'disconnected',
      config: config.settings,
      endpoints: config.endpoints || {},
      lastSync: null,
      metrics: {
        totalSyncs: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        lastSyncDuration: 0
      },
      createdAt: new Date()
    };

    this.integrations.set(integration.id, integration);
    
    await this.eventBridge.publishEvent(
      'inventory.integration-hub',
      'Integration Registered',
      { integrationId: integration.id, name: integration.name }
    );

    return integration;
  }

  // Connect integration
  async connectIntegration(integrationId) {
    const integration = this.integrations.get(integrationId);
    if (!integration) throw new Error('Integration not found');

    // Simulate connection process
    integration.status = 'connecting';
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 90% success rate
    if (Math.random() > 0.1) {
      integration.status = 'connected';
      integration.connectedAt = new Date();
      
      await this.eventBridge.publishEvent(
        'inventory.integration-hub',
        'Integration Connected',
        { integrationId, name: integration.name }
      );
    } else {
      integration.status = 'error';
      integration.error = 'Authentication failed';
    }

    return integration;
  }

  // Sync data
  async syncIntegration(integrationId, syncType = 'full') {
    const integration = this.integrations.get(integrationId);
    if (!integration || integration.status !== 'connected') {
      throw new Error('Integration not connected');
    }

    const syncJob = {
      id: `sync-${Date.now()}`,
      integrationId,
      type: syncType,
      status: 'running',
      progress: 0,
      startTime: new Date(),
      records: { processed: 0, created: 0, updated: 0, errors: 0 }
    };

    this.syncJobs.set(syncJob.id, syncJob);

    // Simulate sync process
    const interval = setInterval(() => {
      syncJob.progress += Math.random() * 15 + 5;
      syncJob.records.processed += Math.floor(Math.random() * 10) + 1;
      
      if (Math.random() > 0.7) syncJob.records.updated++;
      if (Math.random() > 0.8) syncJob.records.created++;
      if (Math.random() > 0.95) syncJob.records.errors++;

      if (syncJob.progress >= 100) {
        syncJob.status = 'completed';
        syncJob.endTime = new Date();
        syncJob.progress = 100;
        
        integration.lastSync = new Date();
        integration.metrics.totalSyncs++;
        integration.metrics.successfulSyncs++;
        integration.metrics.lastSyncDuration = syncJob.endTime - syncJob.startTime;

        this.eventBridge.publishEvent(
          'inventory.integration-hub',
          'Sync Completed',
          { integrationId, syncJobId: syncJob.id, records: syncJob.records }
        );

        clearInterval(interval);
      }
    }, 500);

    return syncJob;
  }
}

// ERP Integration Component
const ERPIntegrations = () => {
  const [erpSystems, setERPSystems] = useState([
    {
      id: 'sap-hana',
      name: 'SAP HANA',
      provider: 'SAP',
      type: 'Database',
      status: 'connected',
      version: '2.0',
      lastSync: new Date(Date.now() - 15 * 60 * 1000),
      features: ['Real-time sync', 'Bi-directional', 'Automated mapping'],
      metrics: { tables: 156, records: 45000, uptime: '99.9%' }
    },
    {
      id: 'oracle-erp',
      name: 'Oracle ERP Cloud',
      provider: 'Oracle',
      type: 'Cloud API',
      status: 'connected',
      version: '23C',
      lastSync: new Date(Date.now() - 8 * 60 * 1000),
      features: ['REST API', 'Webhook support', 'Bulk operations'],
      metrics: { modules: 12, users: 240, transactions: 1500 }
    },
    {
      id: 'netsuite',
      name: 'NetSuite',
      provider: 'Oracle',
      type: 'SuiteTalk API',
      status: 'error',
      version: '2023.2',
      error: 'Authentication token expired',
      features: ['RESTlets', 'SuiteScript', 'Real-time updates']
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">ERP System Integrations</h2>
        <p className="text-blue-100">Connect with enterprise resource planning systems for unified data management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {erpSystems.map(system => (
          <div key={system.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{system.name}</h3>
                  <p className="text-sm text-gray-500">{system.provider} • {system.type}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                system.status === 'connected' ? 'bg-green-100 text-green-800' :
                system.status === 'error' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {system.status}
              </span>
            </div>

            {system.features && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Features:</p>
                <div className="flex flex-wrap gap-1">
                  {system.features.map((feature, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {system.metrics && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">System Metrics:</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {Object.entries(system.metrics).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-lg font-bold text-gray-900">{value}</p>
                      <p className="text-xs text-gray-500 capitalize">{key}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {system.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{system.error}</p>
              </div>
            )}

            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors">
                Sync Now
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// E-commerce Integration Component
const EcommerceIntegrations = () => {
  const [platforms] = useState([
    {
      id: 'shopify',
      name: 'Shopify',
      provider: 'Shopify Inc.',
      status: 'connected',
      metrics: { products: 1247, orders: 89, revenue: 15640 }
    },
    {
      id: 'woocommerce',
      name: 'WooCommerce',
      provider: 'Automattic',
      status: 'connected',
      metrics: { products: 856, orders: 67, revenue: 12340 }
    },
    {
      id: 'amazon',
      name: 'Amazon Seller Central',
      provider: 'Amazon',
      status: 'pending'
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">E-commerce Platform Integration</h2>
        <p className="text-green-100">Connect with online stores and marketplaces for automated inventory sync</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {platforms.map(platform => (
          <div key={platform.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                  <p className="text-sm text-gray-500">{platform.provider}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                platform.status === 'connected' ? 'bg-green-100 text-green-800' :
                platform.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {platform.status}
              </span>
            </div>

            {platform.metrics && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">Platform Metrics:</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{platform.metrics.products}</p>
                    <p className="text-xs text-gray-500">Products</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{platform.metrics.orders}</p>
                    <p className="text-xs text-gray-500">Orders</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">${platform.metrics.revenue}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors">
                Sync Products
              </button>
              <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors">
                Sync Orders
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Accounting Integration Component
const AccountingIntegrations = () => {
  const [accountingSystems] = useState([
    {
      id: 'quickbooks',
      name: 'QuickBooks Online',
      provider: 'Intuit',
      status: 'connected',
      metrics: { invoices: 156, expenses: 89, revenue: 45230 }
    },
    {
      id: 'xero',
      name: 'Xero',
      provider: 'Xero Limited',
      status: 'disconnected'
    },
    {
      id: 'sage',
      name: 'Sage 50cloud',
      provider: 'Sage Group',
      status: 'connected',
      metrics: { accounts: 245, transactions: 1890, balance: 125000 }
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Accounting System Integration</h2>
        <p className="text-yellow-100">Connect with accounting software for financial data synchronization</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {accountingSystems.map(system => (
          <div key={system.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{system.name}</h3>
                  <p className="text-sm text-gray-500">{system.provider}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                system.status === 'connected' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {system.status}
              </span>
            </div>

            {system.metrics && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">Financial Metrics:</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {Object.entries(system.metrics).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-lg font-bold text-gray-900">
                        {typeof value === 'number' && value > 1000 ? value.toLocaleString() : value}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{key}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <button className="flex-1 bg-yellow-600 text-white py-2 px-3 rounded text-sm hover:bg-yellow-700 transition-colors">
                Sync Financials
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Supplier Integration Component
const SupplierIntegrations = () => {
  const [suppliers] = useState([
    {
      id: 'supplier-api-1',
      name: 'Global Parts Supplier',
      provider: 'GPS Inc.',
      type: 'REST API',
      status: 'connected',
      metrics: { catalogs: 5, products: 12500, orders: 89 }
    },
    {
      id: 'edi-supplier',
      name: 'Manufacturing EDI Network',
      provider: 'MFG Network',
      type: 'EDI',
      status: 'connected',
      metrics: { partners: 12, documents: 1890, volume: '250GB' }
    },
    {
      id: 'custom-supplier',
      name: 'Regional Supplier Network',
      provider: 'RSN Corp',
      type: 'Custom API',
      status: 'pending'
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Supplier Network Integration</h2>
        <p className="text-purple-100">Connect with supplier APIs and EDI systems for procurement automation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {suppliers.map(supplier => (
          <div key={supplier.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Truck className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                  <p className="text-sm text-gray-500">{supplier.provider} • {supplier.type}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                supplier.status === 'connected' ? 'bg-green-100 text-green-800' :
                supplier.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {supplier.status}
              </span>
            </div>

            {supplier.metrics && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">Supplier Metrics:</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {Object.entries(supplier.metrics).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-lg font-bold text-gray-900">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{key}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <button className="flex-1 bg-purple-600 text-white py-2 px-3 rounded text-sm hover:bg-purple-700 transition-colors">
                Sync Catalog
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview = () => {
  const [systemMetrics] = useState({
    totalIntegrations: 12,
    activeConnections: 9,
    failedConnections: 1,
    pendingSetup: 2,
    todaysSyncs: 45,
    dataVolume: '2.3TB',
    avgSyncTime: '4.2s',
    uptime: '99.8%'
  });

  const [recentActivity] = useState([
    {
      id: 1,
      type: 'sync_completed',
      integration: 'Shopify',
      message: 'Product sync completed successfully',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: 'success'
    },
    {
      id: 2,
      type: 'connection_error',
      integration: 'NetSuite',
      message: 'Authentication token expired',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: 'error'
    },
    {
      id: 3,
      type: 'sync_started',
      integration: 'QuickBooks',
      message: 'Financial data sync initiated',
      timestamp: new Date(Date.now() - 22 * 60 * 1000),
      status: 'info'
    },
    {
      id: 4,
      type: 'integration_added',
      integration: 'Oracle ERP',
      message: 'New integration successfully configured',
      timestamp: new Date(Date.now() - 35 * 60 * 1000),
      status: 'success'
    }
  ]);

  const syncPerformanceData = [
    { time: '00:00', syncs: 12, errors: 0 },
    { time: '04:00', syncs: 8, errors: 1 },
    { time: '08:00', syncs: 25, errors: 0 },
    { time: '12:00', syncs: 18, errors: 2 },
    { time: '16:00', syncs: 22, errors: 1 },
    { time: '20:00', syncs: 15, errors: 0 }
  ];

  const integrationStatusData = [
    { name: 'Connected', value: 9, color: '#10B981' },
    { name: 'Failed', value: 1, color: '#EF4444' },
    { name: 'Pending', value: 2, color: '#F59E0B' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Integration Hub Dashboard</h2>
        <p className="text-indigo-100">Centralized control center for all your system integrations</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Link className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+2 this week</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900">{systemMetrics.totalIntegrations}</h3>
            <p className="text-gray-600">Total Integrations</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">{systemMetrics.uptime}</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900">{systemMetrics.activeConnections}</h3>
            <p className="text-gray-600">Active Connections</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-blue-600 font-medium">{systemMetrics.avgSyncTime}</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900">{systemMetrics.todaysSyncs}</h3>
            <p className="text-gray-600">Today's Syncs</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Database className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-600 font-medium">Last 24h</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900">{systemMetrics.dataVolume}</h3>
            <p className="text-gray-600">Data Processed</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync Performance (24h)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={syncPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="syncs" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Successful Syncs" />
              <Area type="monotone" dataKey="errors" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Errors" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={integrationStatusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {integrationStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-100' :
                  activity.status === 'error' ? 'bg-red-100' :
                  'bg-blue-100'
                }`}>
                  {activity.status === 'success' ? (
                    <CheckCircle className={`w-4 h-4 text-green-600`} />
                  ) : activity.status === 'error' ? (
                    <XCircle className={`w-4 h-4 text-red-600`} />
                  ) : (
                    <Activity className={`w-4 h-4 text-blue-600`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{activity.integration}</p>
                    <p className="text-xs text-gray-500">
                      {activity.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">{activity.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Event Stream Component
const EventStream = () => {
  const [events] = useState([
    {
      id: 'evt-001',
      source: 'inventory.integration-hub',
      detailType: 'Sync Completed',
      detail: { integrationId: 'shopify-001', recordsProcessed: 1247 },
      timestamp: new Date(Date.now() - 2 * 60 * 1000)
    },
    {
      id: 'evt-002',
      source: 'inventory.warehouse',
      detailType: 'Stock Level Alert',
      detail: { productId: 'SKU-12345', currentStock: 5, threshold: 10 },
      timestamp: new Date(Date.now() - 8 * 60 * 1000)
    },
    {
      id: 'evt-003',
      source: 'inventory.orders',
      detailType: 'Order Created',
      detail: { orderId: 'ORD-67890', customerId: 'CUST-456', amount: 234.56 },
      timestamp: new Date(Date.now() - 15 * 60 * 1000)
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">EventBridge Stream</h2>
        <p className="text-green-100">Real-time events from all connected systems</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Live Event Stream</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {events.map(event => (
              <div key={event.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      {event.source}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{event.detailType}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                  <pre>{JSON.stringify(event.detail, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Integration Hub Main Component
const IntegrationHub = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [integrationService] = useState(() => new IntegrationHubService());
  const [eventHistory, setEventHistory] = useState([]);
  const [syncJobs, setSyncJobs] = useState([]);

  useEffect(() => {
    // Subscribe to events
    integrationService.eventBridge.subscribe('Integration Connected', (event) => {
      setEventHistory(prev => [event, ...prev.slice(0, 49)]);
    });

    integrationService.eventBridge.subscribe('Sync Completed', (event) => {
      setEventHistory(prev => [event, ...prev.slice(0, 49)]);
    });

    // Initialize some demo events
    const initEvents = async () => {
      await integrationService.eventBridge.publishEvent(
        'inventory.integration-hub',
        'System Started',
        { timestamp: new Date(), version: '1.0.0' }
      );
    };

    initEvents();
  }, [integrationService]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Integration Hub</h1>
            <p className="text-gray-600 mt-1">Centralized management for all system integrations</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Integration</span>
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Sync All</span>
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
              { id: 'suppliers', name: 'Suppliers', icon: <Truck className="w-4 h-4" /> },
              { id: 'events', name: 'Event Stream', icon: <Activity className="w-4 h-4" /> }
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
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'erp' && <ERPIntegrations />}
          {activeTab === 'ecommerce' && <EcommerceIntegrations />}
          {activeTab === 'accounting' && <AccountingIntegrations />}
          {activeTab === 'suppliers' && <SupplierIntegrations />}
          {activeTab === 'events' && <EventStream />}
        </div>

        {/* Active Sync Jobs */}
        {syncJobs.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sync Jobs</h3>
            <div className="space-y-4">
              {syncJobs.map(job => (
                <div key={job.id} className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-900">
                      Syncing {job.integrationId}...
                    </span>
                    <span className="text-blue-700">{Math.round(job.progress)}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${job.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-blue-700 mt-2">
                    Processed: {job.records.processed} records
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions Footer */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Database className="w-6 h-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Test Connections</h4>
              <p className="text-sm text-gray-600">Verify all integration connections</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <RefreshCw className="w-6 h-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Force Sync</h4>
              <p className="text-sm text-gray-600">Initiate manual data synchronization</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Settings className="w-6 h-6 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Configure Webhooks</h4>
              <p className="text-sm text-gray-600">Set up real-time event notifications</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <BarChart3 className="w-6 h-6 text-yellow-600 mb-2" />
              <h4 className="font-medium text-gray-900">View Analytics</h4>
              <p className="text-sm text-gray-600">Check integration performance metrics</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationHub;