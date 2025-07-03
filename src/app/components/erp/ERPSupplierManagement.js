'use client'
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { 
  Truck, Users, Globe, Star, MapPin, Phone, Mail, Package, DollarSign,
  TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock, Database, Zap,
  Plus, RefreshCw, Search, Filter, Eye, Edit, Trash2, Download, Upload,
  ArrowUpDown, Activity, BarChart3, Settings, FileText, Calendar
} from 'lucide-react';

// SAP Supplier Integration Service
class ERPSupplierService {
  constructor() {
    this.sapConnection = null;
    this.supplierData = new Map();
    this.syncJobs = new Map();
    this.eventListeners = new Map();
  }

  // Connect to SAP Ariba for supplier data
  async connectSupplierERP(config) {
    const connection = {
      id: 'sap',
      name: 'SAP Ariba',
      status: 'connecting',
      config,
      type: 'supplier',
      lastSync: null,
      endpoints: {
        suppliers: '/api/procurement/suppliers',
        contracts: '/api/procurement/contracts',
        orders: '/api/procurement/orders',
        performance: '/api/procurement/performance'
      },
      connectedAt: null
    };

    this.sapConnection = connection;
    
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (Math.random() > 0.1) {
      connection.status = 'connected';
      connection.connectedAt = new Date();
    } else {
      connection.status = 'error';
      connection.error = 'SAP Ariba API authentication failed';
    }

    this.emit('supplier.connection.updated', connection);
    return connection;
  }

  // Sync supplier data from SAP Ariba
  async syncSupplierData(syncType = 'full') {
    if (!this.sapConnection || this.sapConnection.status !== 'connected') {
      throw new Error('SAP Ariba not connected');
    }

    const syncJob = {
      id: `supplier-sync-${Date.now()}`,
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
          
          this.sapConnection.lastSync = new Date();
          
          clearInterval(interval);
          this.emit('supplier.sync.completed', syncJob);
          resolve(syncJob);
        }
      }, 400);
    });
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
  const [sapConnection, setSapConnection] = useState(null);
  const [syncJobs, setSyncJobs] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showSAPModal, setShowSAPModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  // Sample supplier data from SAP Ariba
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
      name: 'TechComponents Asia',
      category: 'Components',
      type: 'Distributor',
      status: 'active',
      rating: 4.6,
      location: 'Singapore',
      contact: {
        email: 'orders@techcomp-asia.com',
        phone: '+65-6555-0123',
        person: 'Sarah Lim'
      },
      erpSource: 'sap',
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

  useEffect(() => {
    // Setup SAP event listeners
    const handleConnectionUpdate = (connection) => {
      setSapConnection(connection);
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

    // Initialize SAP Ariba connection
    initializeSupplierSAPConnection();

    return () => {
      supplierService.eventListeners.clear();
    };
  }, [supplierService]);

  const initializeSupplierSAPConnection = async () => {
    await supplierService.connectSupplierERP({ host: 'ariba.company.com', realm: 'PROD' });
  };

  const handleSAPConnect = async (config) => {
    try {
      await supplierService.connectSupplierERP(config);
      setShowSAPModal(false);
    } catch (error) {
      console.error('SAP Ariba connection failed:', error);
    }
  };

  const handleSyncSuppliers = async () => {
    try {
      await supplierService.syncSupplierData();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SAP Supplier Management</h2>
          <p className="text-gray-600 mt-1">Integrated supplier operations with SAP Ariba procurement</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSAPModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Database className="w-4 h-4" />
            <span>Configure SAP</span>
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* SAP Ariba Connection Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SAP Ariba Connection</h3>
        {sapConnection ? (
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{sapConnection.name}</h4>
              <span className={`w-3 h-3 rounded-full ${
                sapConnection.status === 'connected' ? 'bg-green-500' :
                sapConnection.status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></span>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              {sapConnection.status === 'connected' ? 'Connected' : 
               sapConnection.status === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </p>
            <button
              onClick={() => handleSyncSuppliers()}
              disabled={sapConnection.status !== 'connected'}
              className="w-full bg-blue-50 text-blue-700 py-2 px-3 rounded text-sm hover:bg-blue-100 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4 inline mr-1" />
              Sync Suppliers
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No SAP Ariba connection established</p>
            <button
              onClick={() => setShowSAPModal(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Connect to SAP Ariba
            </button>
          </div>
        )}
      </div>

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

      {/* Rest of the supplier management interface... */}
      {/* Active Sync Jobs */}
      {syncJobs.filter(job => job.status === 'running').length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active SAP Ariba Sync Jobs</h3>
          <div className="space-y-4">
            {syncJobs.filter(job => job.status === 'running').map(job => (
              <div key={job.id} className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-900">
                    Syncing SAP Ariba suppliers ({job.type})...
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
                  Processed: {job.records.suppliers} suppliers, {job.records.contracts} contracts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ERPSupplierManagement;