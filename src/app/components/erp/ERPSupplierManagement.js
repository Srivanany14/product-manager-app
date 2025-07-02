'use client'
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { 
  Truck, Users, Globe, Star, MapPin, Phone, Mail, Package, DollarSign,
  TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock, Database, Zap,
  Plus, RefreshCw, Search, Filter, Eye, Edit, Trash2, Download, Upload,
  ArrowUpDown, Activity, BarChart3, Settings, FileText, Calendar
} from 'lucide-react';

// ERP Supplier Integration Service
class ERPSupplierService {
  constructor() {
    this.erpConnections = new Map();
    this.supplierData = new Map();
    this.syncJobs = new Map();
    this.eventListeners = new Map();
  }

  // Connect to ERP for supplier data
  async connectSupplierERP(system, config) {
    const connection = {
      id: system,
      name: this.getERPName(system),
      status: 'connecting',
      config,
      type: 'supplier',
      lastSync: null,
      endpoints: this.getSupplierEndpoints(system),
      connectedAt: null
    };

    this.erpConnections.set(system, connection);
    
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (Math.random() > 0.1) {
      connection.status = 'connected';
      connection.connectedAt = new Date();
    } else {
      connection.status = 'error';
      connection.error = 'Supplier API authentication failed';
    }

    this.emit('supplier.connection.updated', connection);
    return connection;
  }

  // Sync supplier data from ERP
  async syncSupplierData(erpSystem, syncType = 'full') {
    const connection = this.erpConnections.get(erpSystem);
    if (!connection || connection.status !== 'connected') {
      throw new Error('ERP system not connected');
    }

    const syncJob = {
      id: `supplier-sync-${Date.now()}`,
      erpSystem,
      type: syncType,
      status: 'running',
      progress: 0,
      startTime: new Date(),
      records: { 
        suppliers: 0, 
        contacts: 0, 
        contracts: 0, 
        catalogs: 0,
        updated: 0,
        created: 0,
        errors: 0
      }
    };

    this.syncJobs.set(syncJob.id, syncJob);

    // Simulate sync process
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        syncJob.progress += Math.random() * 12 + 3;
        
        // Simulate record processing
        syncJob.records.suppliers += Math.floor(Math.random() * 3) + 1;
        syncJob.records.contacts += Math.floor(Math.random() * 5) + 2;
        syncJob.records.contracts += Math.floor(Math.random() * 2);
        syncJob.records.catalogs += Math.floor(Math.random() * 10) + 5;
        
        if (Math.random() > 0.7) syncJob.records.updated++;
        if (Math.random() > 0.8) syncJob.records.created++;
        if (Math.random() > 0.95) syncJob.records.errors++;

        this.emit('supplier.sync.progress', syncJob);

        if (syncJob.progress >= 100) {
          syncJob.status = 'completed';
          syncJob.endTime = new Date();
          syncJob.progress = 100;
          
          connection.lastSync = new Date();
          
          clearInterval(interval);
          this.emit('supplier.sync.completed', syncJob);
          resolve(syncJob);
        }
      }, 400);
    });
  }

  getERPName(system) {
    const names = {
      'sap': 'SAP Ariba',
      'oracle': 'Oracle Procurement Cloud',
      'netsuite': 'NetSuite SRP',
      'dynamics': 'Dynamics 365 SCM'
    };
    return names[system] || system.toUpperCase();
  }

  getSupplierEndpoints(system) {
    const endpoints = {
      'sap': {
        suppliers: '/api/procurement/suppliers',
        contracts: '/api/procurement/contracts',
        orders: '/api/procurement/orders',
        performance: '/api/procurement/performance'
      },
      'oracle': {
        suppliers: '/fscmRestApi/resources/suppliers',
        contracts: '/fscmRestApi/resources/agreements',
        orders: '/fscmRestApi/resources/purchaseOrders',
        performance: '/fscmRestApi/resources/supplierPerformance'
      },
      'netsuite': {
        suppliers: '/rest/vendors',
        contracts: '/rest/vendorContracts',
        orders: '/rest/purchaseOrders',
        performance: '/rest/vendorPerformance'
      }
    };
    return endpoints[system] || {};
  }

  emit(event, data) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => callback(data));
  }

  addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  removeEventListener(event, callback) {
    const listeners = this.eventListeners.get(event) || [];
    this.eventListeners.set(event, listeners.filter(l => l !== callback));
  }
}

const ERPSupplierManagement = () => {
  const [supplierService] = useState(() => new ERPSupplierService());
  const [erpConnections, setERPConnections] = useState(new Map());
  const [syncJobs, setSyncJobs] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showERPModal, setShowERPModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  // Sample supplier data
  const [suppliers, setSuppliers] = useState([
    {
      id: 'SUP001',
      name: 'Global Manufacturing Corp',
      category: 'Electronics',
      type: 'Manufacturer',
      status: 'active',
      rating: 4.8,
      location: 'Shenzhen, China',
      contact: {
        email: 'procurement@globalmanuf.com',
        phone: '+86-755-1234567',
        person: 'Li Wei'
      },
      erpSource: 'sap',
      performance: {
        onTime: 94.5,
        quality: 98.2,
        totalOrders: 156,
        totalValue: 890000
      },
      lastSync: new Date(Date.now() - 10 * 60 * 1000),
      contractExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      paymentTerms: 'Net 30',
      leadTime: 14
    },
    {
      id: 'SUP002',
      name: 'TechComponents USA',
      category: 'Components',
      type: 'Distributor',
      status: 'active',
      rating: 4.6,
      location: 'Austin, TX',
      contact: {
        email: 'orders@techcomp.com',
        phone: '+1-512-555-0123',
        person: 'Sarah Johnson'
      },
      erpSource: 'oracle',
      performance: {
        onTime: 97.8,
        quality: 96.5,
        totalOrders: 89,
        totalValue: 567000
      },
      lastSync: new Date(Date.now() - 25 * 60 * 1000),
      contractExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      paymentTerms: 'Net 15',
      leadTime: 7
    }
  ]);

  // Available ERP systems for supplier integration
  const availableERPSystems = [
    { id: 'sap', name: 'SAP Ariba', provider: 'SAP', icon: '🏢', specialty: 'Procurement' },
    { id: 'oracle', name: 'Oracle Procurement Cloud', provider: 'Oracle', icon: '☁️', specialty: 'Supply Chain' },
    { id: 'netsuite', name: 'NetSuite SRP', provider: 'Oracle', icon: '🌐', specialty: 'Vendor Management' },
    { id: 'dynamics', name: 'Dynamics 365 SCM', provider: 'Microsoft', icon: '🔷', specialty: 'Supply Chain' }
  ];

  useEffect(() => {
    // Setup ERP event listeners
    const handleConnectionUpdate = (connection) => {
      setERPConnections(prev => new Map(prev.set(connection.id, connection)));
    };

    const handleSyncProgress = (syncJob) => {
      setSyncJobs(prev => {
        const existing = prev.find(job => job.id === syncJob.id);
        if (existing) {
          return prev.map(job => job.id === syncJob.id ? syncJob : job);
        } else {
          return [...prev, syncJob];
        }
      });
    };

    supplierService.addEventListener('supplier.connection.updated', handleConnectionUpdate);
    supplierService.addEventListener('supplier.sync.progress', handleSyncProgress);
    supplierService.addEventListener('supplier.sync.completed', handleSyncProgress);

    // Initialize with some connected systems
    initializeSupplierERPConnections();

    return () => {
      supplierService.eventListeners.clear();
    };
  }, [supplierService]);

  const initializeSupplierERPConnections = async () => {
    // Simulate some pre-connected ERP systems
    await supplierService.connectSupplierERP('sap', { host: 'ariba.company.com', realm: 'PROD' });
    await supplierService.connectSupplierERP('oracle', { baseUrl: 'https://procurement.company.com', tenant: 'PROD' });
  };

  const handleERPConnect = async (erpId, config) => {
    try {
      await supplierService.connectSupplierERP(erpId, config);
      setShowERPModal(false);
    } catch (error) {
      console.error('Supplier ERP connection failed:', error);
    }
  };

  const handleSyncSuppliers = async (erpSystem) => {
    try {
      await supplierService.syncSupplierData(erpSystem);
    } catch (error) {
      console.error('Supplier sync failed:', error);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Supplier Dashboard View
  const SupplierDashboard = () => (
    <div className="space-y-6">
      {/* Supplier Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Suppliers</p>
              <p className="text-3xl font-bold text-gray-900">{suppliers.length}</p>
            </div>
            <Truck className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Suppliers</p>
              <p className="text-3xl font-bold text-green-600">
                {suppliers.filter(s => s.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Performance</p>
              <p className="text-3xl font-bold text-yellow-600">
                {Math.round(suppliers.reduce((sum, s) => sum + s.performance.onTime, 0) / suppliers.length)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-3xl font-bold text-purple-600">
                ${(suppliers.reduce((sum, s) => sum + s.performance.totalValue, 0) / 1000000).toFixed(1)}M
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );

  // Supplier List View
  const SupplierList = () => (
    <div className="space-y-6">
      {/* Supplier Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Supplier Directory</h3>
            <div className="flex space-x-2">
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              <button onClick={() => setShowSupplierModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Supplier</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ERP Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Truck className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {supplier.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {supplier.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className={`w-4 h-4 mr-1 ${getRatingColor(supplier.rating)}`} fill="currentColor" />
                      <span className={`text-sm font-medium ${getRatingColor(supplier.rating)}`}>
                        {supplier.rating.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className={`font-medium ${getPerformanceColor(supplier.performance.onTime)}`}>
                        {supplier.performance.onTime.toFixed(1)}% On-Time
                      </div>
                      <div className={`text-xs ${getPerformanceColor(supplier.performance.quality)}`}>
                        {supplier.performance.quality.toFixed(1)}% Quality
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{supplier.performance.totalOrders}</div>
                      <div className="text-xs text-gray-500">${(supplier.performance.totalValue / 1000).toFixed(0)}K</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{supplier.erpSource.toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(supplier.status)}`}>
                      {supplier.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSelectedSupplier(supplier)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleSyncSuppliers(supplier.erpSource)}
                        className="text-green-600 hover:text-green-900" 
                        title="Sync with ERP"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button className="text-purple-600 hover:text-purple-900" title="View Contract">
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ERP Supplier Management</h2>
          <p className="text-gray-600 mt-1">Integrated supplier operations with ERP procurement systems</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowERPModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Database className="w-4 h-4" />
            <span>Connect ERP</span>
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* ERP Connection Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ERP Procurement Connections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from(erpConnections.values()).map(connection => (
            <div key={connection.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{connection.name}</h4>
                <span className={`w-3 h-3 rounded-full ${
                  connection.status === 'connected' ? 'bg-green-500' :
                  connection.status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></span>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {connection.status === 'connected' ? 'Connected' : 
                 connection.status === 'connecting' ? 'Connecting...' : 'Disconnected'}
              </p>
              <button
                onClick={() => handleSyncSuppliers(connection.id)}
                disabled={connection.status !== 'connected'}
                className="w-full bg-blue-50 text-blue-700 py-2 px-3 rounded text-sm hover:bg-blue-100 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4 inline mr-1" />
                Sync Suppliers
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'list', name: 'Supplier List', icon: <Users className="w-4 h-4" /> },
            { id: 'performance', name: 'Performance', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'contracts', name: 'Contracts', icon: <FileText className="w-4 h-4" /> }
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

      {/* Content based on active tab */}
      <div>
        {activeTab === 'dashboard' && <SupplierDashboard />}
        {activeTab === 'list' && <SupplierList />}
        {activeTab === 'performance' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Performance Analytics</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={suppliers.map(s => ({
                name: s.name.split(' ')[0],
                onTime: s.performance.onTime,
                quality: s.performance.quality,
                orders: s.performance.totalOrders
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="onTime" fill="#10B981" name="On-Time %" />
                <Bar dataKey="quality" fill="#3B82F6" name="Quality %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {activeTab === 'contracts' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Contracts</h3>
            <div className="space-y-4">
              {suppliers.map(supplier => (
                <div key={supplier.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{supplier.name}</h4>
                      <p className="text-sm text-gray-500">
                        Expires: {supplier.contractExpiry.toLocaleDateString()} • 
                        Terms: {supplier.paymentTerms} • 
                        Lead Time: {supplier.leadTime} days
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        new Date(supplier.contractExpiry) - new Date() < 90 * 24 * 60 * 60 * 1000 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {new Date(supplier.contractExpiry) - new Date() < 90 * 24 * 60 * 60 * 1000 
                          ? 'Expiring Soon' 
                          : 'Active'
                        }
                      </span>
                      <button className="text-blue-600 hover:text-blue-900">
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Supplier Detail Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Supplier Details</h3>
              <button onClick={() => setSelectedSupplier(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{selectedSupplier.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
<p className="text-gray-900">{selectedSupplier.location}</p>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700">Rating</label>
                 <div className="flex items-center">
                   <Star className={`w-4 h-4 mr-1 ${getRatingColor(selectedSupplier.rating)}`} fill="currentColor" />
                   <span className="text-gray-900">{selectedSupplier.rating.toFixed(1)}</span>
                 </div>
               </div>
             </div>

             {/* Contact Info */}
             <div>
               <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                   <p className="text-gray-900">{selectedSupplier.contact.person}</p>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700">Email</label>
                   <p className="text-gray-900">{selectedSupplier.contact.email}</p>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700">Phone</label>
                   <p className="text-gray-900">{selectedSupplier.contact.phone}</p>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
                   <p className="text-gray-900">{selectedSupplier.paymentTerms}</p>
                 </div>
               </div>
             </div>

             {/* Performance Metrics */}
             <div>
               <h4 className="font-medium text-gray-900 mb-2">Performance Metrics</h4>
               <div className="grid grid-cols-4 gap-4">
                 <div className="text-center p-3 bg-gray-50 rounded-lg">
                   <p className="text-2xl font-bold text-green-600">{selectedSupplier.performance.onTime.toFixed(1)}%</p>
                   <p className="text-sm text-gray-600">On-Time Delivery</p>
                 </div>
                 <div className="text-center p-3 bg-gray-50 rounded-lg">
                   <p className="text-2xl font-bold text-blue-600">{selectedSupplier.performance.quality.toFixed(1)}%</p>
                   <p className="text-sm text-gray-600">Quality Score</p>
                 </div>
                 <div className="text-center p-3 bg-gray-50 rounded-lg">
                   <p className="text-2xl font-bold text-purple-600">{selectedSupplier.performance.totalOrders}</p>
                   <p className="text-sm text-gray-600">Total Orders</p>
                 </div>
                 <div className="text-center p-3 bg-gray-50 rounded-lg">
                   <p className="text-2xl font-bold text-yellow-600">${(selectedSupplier.performance.totalValue / 1000).toFixed(0)}K</p>
                   <p className="text-sm text-gray-600">Total Value</p>
                 </div>
               </div>
             </div>
           </div>

           <div className="flex space-x-3 mt-6">
             <button
               onClick={() => setSelectedSupplier(null)}
               className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
             >
               Close
             </button>
             <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
               Edit Supplier
             </button>
           </div>
         </div>
       </div>
     )}
   </div>
 );
};

export default ERPSupplierManagement;