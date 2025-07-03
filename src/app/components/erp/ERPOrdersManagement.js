'use client'
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { 
  ShoppingCart, Package, Truck, Calendar, Clock, CheckCircle, XCircle, 
  AlertTriangle, DollarSign, TrendingUp, Users, MapPin, Phone, Mail,
  Database, Zap, Plus, RefreshCw, Search, Filter, Eye, Edit, Trash2,
  Download, Upload, ArrowUpDown, Activity, BarChart3, Settings, FileText,
  PlayCircle, PauseCircle, RotateCcw, Send, Archive
} from 'lucide-react';

// SAP Orders Integration Service
class ERPOrdersService {
  constructor() {
    this.sapConnection = null;
    this.orderSyncJobs = new Map();
    this.eventListeners = new Map();
    this.realTimeUpdates = null;
  }

  // Connect to SAP S/4HANA for order management
  async connectOrderERP(config) {
    const connection = {
      id: 'sap',
      name: 'SAP S/4HANA',
      status: 'connecting',
      config,
      type: 'orders',
      lastSync: null,
      endpoints: {
        orders: '/api/sales/orders',
        customers: '/api/sales/customers',
        products: '/api/sales/products',
        fulfillment: '/api/sales/fulfillment'
      },
      connectedAt: null,
      capabilities: ['Real-time sync', 'Workflow automation', 'Advanced pricing', 'Multi-currency']
    };

    this.sapConnection = connection;
    
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (Math.random() > 0.1) {
      connection.status = 'connected';
      connection.connectedAt = new Date();
      this.setupRealTimeUpdates();
    } else {
      connection.status = 'error';
      connection.error = 'SAP Order API authentication failed';
    }

    this.emit('orders.connection.updated', connection);
    return connection;
  }

  // Sync orders from SAP
  async syncOrders(syncType = 'incremental', dateRange = null) {
    if (!this.sapConnection || this.sapConnection.status !== 'connected') {
      throw new Error('SAP system not connected');
    }

    const syncJob = {
      id: `orders-sync-${Date.now()}`,
      type: syncType,
      status: 'running',
      progress: 0,
      startTime: new Date(),
      dateRange,
      records: { 
        orders: 0, 
        lineItems: 0, 
        customers: 0,
        updated: 0,
        created: 0,
        errors: 0
      }
    };

    this.orderSyncJobs.set(syncJob.id, syncJob);

    // Simulate sync process
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        syncJob.progress += Math.random() * 10 + 5;
        
        syncJob.records.orders += Math.floor(Math.random() * 8) + 2;
        syncJob.records.lineItems += Math.floor(Math.random() * 20) + 10;
        syncJob.records.customers += Math.floor(Math.random() * 3) + 1;
        
        if (Math.random() > 0.6) syncJob.records.updated++;
        if (Math.random() > 0.8) syncJob.records.created++;
        if (Math.random() > 0.95) syncJob.records.errors++;

        this.emit('orders.sync.progress', syncJob);

        if (syncJob.progress >= 100) {
          syncJob.status = 'completed';
          syncJob.endTime = new Date();
          syncJob.progress = 100;
          
          this.sapConnection.lastSync = new Date();
          
          clearInterval(interval);
          this.emit('orders.sync.completed', syncJob);
          resolve(syncJob);
        }
      }, 300);
    });
  }

  // Create order in SAP
  async createOrder(orderData) {
    if (!this.sapConnection || this.sapConnection.status !== 'connected') {
      throw new Error('SAP system not connected');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newOrder = {
      id: `ORD-${Date.now()}`,
      sapId: `SAP-${Math.random().toString(36).substring(7).toUpperCase()}`,
      ...orderData,
      status: 'pending',
      createdAt: new Date(),
      erpSystem: 'sap'
    };

    this.emit('orders.created', newOrder);
    return newOrder;
  }

  // Update order status in SAP
  async updateOrderStatus(orderId, newStatus) {
    if (!this.sapConnection || this.sapConnection.status !== 'connected') {
      throw new Error('SAP system not connected');
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.emit('orders.status.updated', { orderId, newStatus, erpSystem: 'sap' });
    return { success: true, orderId, newStatus };
  }

  // Setup real-time order updates
  setupRealTimeUpdates() {
    this.realTimeUpdates = setInterval(() => {
      const updates = [
        { type: 'status_change', orderId: `ORD-${Math.random().toString(36).substring(7)}`, newStatus: 'shipped' },
        { type: 'payment_received', orderId: `ORD-${Math.random().toString(36).substring(7)}`, amount: Math.floor(Math.random() * 10000) },
        { type: 'delivery_confirmation', orderId: `ORD-${Math.random().toString(36).substring(7)}`, deliveredAt: new Date() }
      ];
      
      const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
      this.emit('orders.realtime.update', { erpSystem: 'sap', ...randomUpdate });
    }, 30000);
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

const ERPOrdersManagement = () => {
  const [ordersService] = useState(() => new ERPOrdersService());
  const [sapConnection, setSapConnection] = useState(null);
  const [syncJobs, setSyncJobs] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showSAPModal, setShowSAPModal] = useState(false);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [realTimeUpdates, setRealTimeUpdates] = useState([]);

  // Sample orders data from SAP
  const [orders, setOrders] = useState([
    {
      id: 'ORD-2024-001',
      sapId: 'SAP-SO-789456',
      customerName: 'Acme Corp',
      customerEmail: 'purchasing@acme.com',
      status: 'processing',
      priority: 'high',
      orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      shipDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      totalAmount: 125000,
      currency: 'USD',
      items: 12,
      erpSource: 'sap',
      lastSync: new Date(Date.now() - 10 * 60 * 1000),
      paymentStatus: 'paid',
      shippingAddress: 'New York, NY',
      orderType: 'Standard'
    },
    {
      id: 'ORD-2024-002',
      sapId: 'SAP-SO-456123',
      customerName: 'TechStart Inc',
      customerEmail: 'orders@techstart.com',
      status: 'shipped',
      priority: 'medium',
      orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      shipDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      totalAmount: 67500,
      currency: 'USD',
      items: 8,
      erpSource: 'sap',
      lastSync: new Date(Date.now() - 25 * 60 * 1000),
      paymentStatus: 'pending',
      shippingAddress: 'San Francisco, CA',
      orderType: 'Express'
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

    const handleRealTimeUpdate = (update) => {
      setRealTimeUpdates(prev => [update, ...prev.slice(0, 9)]);
    };

    ordersService.addEventListener('orders.connection.updated', handleConnectionUpdate);
    ordersService.addEventListener('orders.sync.progress', handleSyncProgress);
    ordersService.addEventListener('orders.sync.completed', handleSyncProgress);
    ordersService.addEventListener('orders.realtime.update', handleRealTimeUpdate);

    // Initialize SAP connection
    initializeSAPConnection();

    return () => {
      ordersService.eventListeners.clear();
    };
  }, [ordersService]);

  const initializeSAPConnection = async () => {
    await ordersService.connectOrderERP({ host: 's4hana.company.com', client: '100' });
  };

  const handleSAPConnect = async (config) => {
    try {
      await ordersService.connectOrderERP(config);
      setShowSAPModal(false);
    } catch (error) {
      console.error('SAP connection failed:', error);
    }
  };

  const handleSyncOrders = async (syncType = 'incremental') => {
    try {
      await ordersService.syncOrders(syncType);
    } catch (error) {
      console.error('Orders sync failed:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      try {
        await ordersService.updateOrderStatus(orderId, newStatus);
        setOrders(prev => prev.map(o => 
          o.id === orderId ? { ...o, status: newStatus } : o
        ));
      } catch (error) {
        console.error('Order status update failed:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SAP Order Management</h2>
          <p className="text-gray-600 mt-1">Integrated order processing with SAP S/4HANA</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSAPModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Database className="w-4 h-4" />
            <span>Configure SAP</span>
          </button>
          <button 
            onClick={() => setShowCreateOrderModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Order</span>
          </button>
        </div>
      </div>

      {/* SAP Connection Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SAP S/4HANA Connection</h3>
        {sapConnection ? (
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{sapConnection.name}</h4>
              <span className={`w-3 h-3 rounded-full ${
                sapConnection.status === 'connected' ? 'bg-green-500' :
                sapConnection.status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></span>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              {sapConnection.status === 'connected' ? 'Connected' : 
               sapConnection.status === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </p>
            <div className="flex space-x-1">
              <button
                onClick={() => handleSyncOrders('incremental')}
                disabled={sapConnection.status !== 'connected'}
                className="flex-1 bg-blue-50 text-blue-700 py-1 px-2 rounded text-xs hover:bg-blue-100 disabled:opacity-50"
              >
                <RefreshCw className="w-3 h-3 inline mr-1" />
                Sync Orders
              </button>
              <button
                onClick={() => handleSyncOrders('full')}
                disabled={sapConnection.status !== 'connected'}
                className="flex-1 bg-green-50 text-green-700 py-1 px-2 rounded text-xs hover:bg-green-100 disabled:opacity-50"
              >
                Full Sync
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No SAP connection established</p>
            <button
              onClick={() => setShowSAPModal(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Connect to SAP
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">SAP Order Management</h3>
            <div className="flex space-x-2">
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SAP ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <ShoppingCart className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{order.id}</div>
                        <div className="text-sm text-gray-500">{order.sapId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                    <div className="text-sm text-gray-500">{order.shippingAddress}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                      {order.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${order.totalAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">{order.currency}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900 font-mono">{order.sapId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleSyncOrders()}
                        className="text-green-600 hover:text-green-900" 
                        title="Sync with SAP"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Sync Jobs */}
      {syncJobs.filter(job => job.status === 'running').length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active SAP Sync Jobs</h3>
          <div className="space-y-4">
            {syncJobs.filter(job => job.status === 'running').map(job => (
              <div key={job.id} className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-900">
                    Syncing SAP orders ({job.type})...
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
                  Processed: {job.records.orders} orders, {job.records.lineItems} line items
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ERPOrdersManagement;