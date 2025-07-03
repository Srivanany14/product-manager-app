// components/erp/core/ERPConnector.js
import React, { useState, useEffect } from 'react';
import { 
  Database, ShoppingCart, DollarSign, Truck, Package, CheckCircle, 
  XCircle, AlertTriangle, RefreshCw, Zap, Activity, Bell
} from 'lucide-react';

class ERPIntegrationEngine {
  constructor() {
    this.systems = new Map();
    this.inventory = new Map();
    this.orders = [];
    this.activities = [];
    this.isRunning = false;
    this.eventListeners = new Map();
    
    this.loadDemoData();
  }

  loadDemoData() {
    // Initialize inventory
    const items = [
      { sku: 'IP15-256', name: 'iPhone 15 Pro 256GB', quantity: 45, price: 1199, reorderPoint: 20 },
      { sku: 'S24-512', name: 'Samsung Galaxy S24 Ultra', quantity: 12, price: 1299, reorderPoint: 25 },
      { sku: 'MB-M3-14', name: 'MacBook Pro M3 14"', quantity: 8, price: 1999, reorderPoint: 15 },
      { sku: 'NK-AM270', name: 'Nike Air Max 270', quantity: 0, price: 129, reorderPoint: 50 }
    ];

    items.forEach(item => {
      this.inventory.set(item.sku, { ...item, lastUpdated: new Date() });
    });
  }

  async connectSystem(systemId, config) {
    const system = {
      id: systemId,
      name: config.name,
      status: 'connecting',
      connectedAt: null,
      lastSync: null
    };

    this.systems.set(systemId, system);
    this.emit('system.connecting', system);

    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    system.status = 'connected';
    system.connectedAt = new Date();
    
    this.emit('system.connected', system);
    this.addActivity(`✅ ${system.name} connected successfully`, 'success');
    
    // Start system-specific simulation
    if (systemId === 'shopify') this.startShopifySimulation();
    if (systemId === 'quickbooks') this.startQuickBooksSimulation();
    if (systemId === 'suppliers') this.startSupplierSimulation();
  }

  startShopifySimulation() {
    setInterval(() => {
      this.simulateShopifyOrder();
    }, 8000);
  }

  startQuickBooksSimulation() {
    setInterval(() => {
      this.simulateQuickBooksSync();
    }, 15000);
  }

  startSupplierSimulation() {
    setInterval(() => {
      this.simulateSupplierUpdate();
    }, 20000);
  }

  simulateShopifyOrder() {
    const skus = Array.from(this.inventory.keys());
    const sku = skus[Math.floor(Math.random() * skus.length)];
    const item = this.inventory.get(sku);
    
    if (!item || item.quantity <= 0) return;

    const order = {
      id: `SHOP-${Date.now()}`,
      sku,
      quantity: Math.floor(Math.random() * 3) + 1,
      customer: ['John Doe', 'Jane Smith', 'Mike Johnson'][Math.floor(Math.random() * 3)],
      value: item.price,
      timestamp: new Date()
    };

    // Update inventory
    if (item.quantity >= order.quantity) {
      item.quantity -= order.quantity;
      item.lastUpdated = new Date();

      this.addActivity(`🛒 Shopify order: ${item.name} (${order.quantity} units)`, 'order');
      this.addActivity(`📦 Inventory: ${item.name} now ${item.quantity} units`, 'inventory');

      if (item.quantity <= item.reorderPoint) {
        this.addActivity(`⚠️ Low stock: ${item.name} (${item.quantity} left)`, 'warning');
      }
    }

    this.orders.unshift(order);
    this.emit('inventory.updated', item);
    this.emit('order.created', order);
  }

  simulateQuickBooksSync() {
    const recentOrders = this.orders.slice(0, 3);
    const totalValue = recentOrders.reduce((sum, order) => sum + order.value, 0);
    
    this.addActivity(`💰 QuickBooks: Synced ${recentOrders.length} invoices ($${totalValue.toLocaleString()})`, 'accounting');
    this.emit('quickbooks.synced', { orders: recentOrders.length, value: totalValue });
  }

  simulateSupplierUpdate() {
    const suppliers = ['Apple Inc.', 'Samsung Corp', 'Nike Inc.'];
    const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
    const updates = [
      `📋 ${supplier}: Updated catalog with 25 new items`,
      `🚚 ${supplier}: Shipment delayed by 2 days`,
      `💝 ${supplier}: Special pricing available until end of month`,
      `✅ ${supplier}: Order confirmed, delivery in 5 days`
    ];
    
    const update = updates[Math.floor(Math.random() * updates.length)];
    this.addActivity(update, 'supplier');
    this.emit('supplier.updated', { supplier, message: update });
  }

  addActivity(message, type) {
    this.activities.unshift({
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    });
    
    // Keep only last 20 activities
    if (this.activities.length > 20) {
      this.activities = this.activities.slice(0, 20);
    }
    
    this.emit('activity.added', this.activities[0]);
  }

  emit(event, data) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => callback(data));
  }

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  getSystemStatus(systemId) {
    return this.systems.get(systemId) || { status: 'disconnected' };
  }

  getAllInventory() {
    return Array.from(this.inventory.values());
  }

  getRecentOrders() {
    return this.orders.slice(0, 10);
  }

  getActivities() {
    return this.activities;
  }
}

const ERPConnectorDashboard = () => {
  const [engine] = useState(() => new ERPIntegrationEngine());
  const [systems, setSystems] = useState(new Map());
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activities, setActivities] = useState([]);
  const [metrics, setMetrics] = useState({
    totalValue: 4250000,
    connectedSystems: 0,
    todayOrders: 1247,
    lowStockItems: 0
  });

  const systemConfigs = [
    { id: 'sap', name: 'SAP ERP', icon: Database, color: 'blue', description: 'Enterprise Resource Planning' },
    { id: 'shopify', name: 'Shopify Store', icon: ShoppingCart, color: 'green', description: 'E-commerce Platform' },
    { id: 'quickbooks', name: 'QuickBooks', icon: DollarSign, color: 'yellow', description: 'Accounting Software' },
    { id: 'suppliers', name: 'Supplier Network', icon: Truck, color: 'purple', description: 'Supply Chain Management' }
  ];

  useEffect(() => {
    // Set up event listeners
    engine.on('system.connected', (system) => {
      setSystems(prev => new Map(prev.set(system.id, system)));
      setMetrics(prev => ({ ...prev, connectedSystems: prev.connectedSystems + 1 }));
    });

    engine.on('inventory.updated', () => {
      setInventory(engine.getAllInventory());
      const lowStock = engine.getAllInventory().filter(item => item.quantity <= item.reorderPoint).length;
      setMetrics(prev => ({ ...prev, lowStockItems: lowStock }));
    });

    engine.on('order.created', () => {
      setOrders(engine.getRecentOrders());
      setMetrics(prev => ({ ...prev, todayOrders: prev.todayOrders + 1 }));
    });

    engine.on('activity.added', () => {
      setActivities(engine.getActivities());
    });

    // Initialize data
    setInventory(engine.getAllInventory());
    setActivities(engine.getActivities());

    // Auto-connect systems for demo
    setTimeout(() => connectAllSystems(), 1000);
  }, [engine]);

  const connectAllSystems = async () => {
    for (const config of systemConfigs) {
      await engine.connectSystem(config.id, config);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const connectSystem = async (systemId) => {
    const config = systemConfigs.find(s => s.id === systemId);
    await engine.connectSystem(systemId, config);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'connecting': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'order': return '🛒';
      case 'inventory': return '📦';
      case 'accounting': return '💰';
      case 'supplier': return '🚚';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">ERP Integration Hub</h1>
            <p className="text-blue-100 mt-2">Unified Inventory Management Platform</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${metrics.totalValue.toLocaleString()}</div>
            <div className="text-blue-100">Total Inventory Value</div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Connected Systems</p>
              <p className="text-3xl font-bold text-blue-600">{metrics.connectedSystems}/4</p>
            </div>
            <Database className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Orders</p>
              <p className="text-3xl font-bold text-green-600">{metrics.todayOrders}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-3xl font-bold text-yellow-600">{metrics.lowStockItems}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Health</p>
              <p className="text-3xl font-bold text-green-600">98%</p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Systems</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemConfigs.map(config => {
            const Icon = config.icon;
            const system = systems.get(config.id) || { status: 'disconnected' };
            
            return (
              <div key={config.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-5 h-5 text-${config.color}-500`} />
                    <span className="font-medium">{config.name}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(system.status)}`}>
                    {system.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{config.description}</p>
                {system.status === 'connected' ? (
                  <div className="text-xs text-green-600">
                    ✅ Connected {system.connectedAt && `at ${system.connectedAt.toLocaleTimeString()}`}
                  </div>
                ) : (
                  <button 
                    onClick={() => connectSystem(config.id)}
                    className={`w-full bg-${config.color}-50 text-${config.color}-600 py-1 px-2 rounded text-sm hover:bg-${config.color}-100`}
                  >
                    Connect
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Inventory */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Inventory</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.quantity === 0 ? 'bg-red-100 text-red-800' :
                      item.quantity <= item.reorderPoint ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.quantity} units
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${item.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.quantity === 0 ? 'bg-red-100 text-red-800' :
                      item.quantity <= item.reorderPoint ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.quantity === 0 ? 'Out of Stock' :
                       item.quantity <= item.reorderPoint ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.lastUpdated.toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Live Activity Feed</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live</span>
          </div>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map(activity => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-lg">{getActivityIcon(activity.type)}</span>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500">{activity.timestamp.toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Activity feed will appear here in real-time</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ERPConnectorDashboard;