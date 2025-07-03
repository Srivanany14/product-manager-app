'use client'
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { 
  Package, TrendingUp, AlertTriangle, DollarSign, Calendar, Download, Upload, Search, Filter, 
  MoreVertical, Eye, Edit, Trash2, Plus, RefreshCw, Bell, Settings, User, Home, BarChart3,Database,
  ShoppingCart, Truck, Warehouse, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Brain,Zap
} from 'lucide-react';
import ERPWarehouseManagement from './erp/ERPWarehouseManagement';
import ERPSupplierManagement from './erp/ERPSupplierManagement';
import ERPOrdersManagement from './erp/ERPOrdersManagement';
import ERPReportsAnalytics from './erp/ERPReportsAnalytics';
import ERPConnectorDashboard from './ERPConnector';
import SupplyChainAnalytics from './SupplyChainAnalytics';
import RealWorkingERPSystem from './RealWorkingERPSystem';

// Mock TimeLLM Forecasting Component
const TimeLLMForecastingComponent = ({ productData, onForecastUpdate }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [forecastResults, setForecastResults] = useState({});

  const runForecast = (product) => {
    setIsTraining(true);
    setSelectedProduct(product);
    
    // Simulate AI training process
    setTimeout(() => {
      const forecast = Array.from({ length: 14 }, (_, i) => ({
        day: i + 1,
        predicted: Math.floor(Math.random() * 100) + 20,
        confidence: Math.random() * 0.3 + 0.7
      }));
      
      setForecastResults(prev => ({ ...prev, [product.id]: forecast }));
      onForecastUpdate(product.id, forecast);
      setIsTraining(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Time-LLM Forecasting</h2>
            <p className="text-purple-100">Generate AI-powered demand predictions using advanced time series analysis</p>
          </div>
          <Brain className="w-16 h-16 text-purple-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Select Product for Forecasting</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {productData.map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">{product.id} • {product.category}</div>
                </div>
                <button
                  onClick={() => runForecast(product)}
                  disabled={isTraining}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {isTraining && selectedProduct?.id === product.id ? 'Training...' : 'Forecast'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Forecast Results</h3>
          {selectedProduct && forecastResults[selectedProduct.id] ? (
            <div>
              <h4 className="font-medium mb-3">{selectedProduct.name}</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={forecastResults[selectedProduct.id]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="predicted" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Select a product to generate AI forecasts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
// Mock Advanced Product Management Component
const AdvancedProductManagement = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Advanced Product Management</h3>
        <p className="text-gray-600">Enhanced product management features coming soon...</p>
      </div>
    </div>
  );
};

// Mock Notification System Component
const NotificationSystem = () => {
  const [notifications] = useState([
    { id: 1, type: 'warning', message: 'Low stock alert for iPhone 15 Pro Max' },
    { id: 2, type: 'info', message: 'New forecast available for Nike Air Max' }
  ]);

  return (
    <div className="relative">
      <button className="p-2 text-gray-400 hover:text-gray-600 relative">
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
        )}
      </button>
    </div>
  );
};

const InventoryApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [forecastData, setForecastData] = useState({});
  const [realTimeData, setRealTimeData] = useState({
    isConnected: true,
    lastUpdate: new Date(),
    systemHealth: 'healthy'
  });

  // Enhanced sample data with real-time features
  const dashboardMetrics = {
    totalProducts: 125840,
    totalValue: 4250000,
    lowStock: 847,
    outOfStock: 23,
    revenueToday: 89400,
    ordersToday: 1247,
    avgOrderValue: 71.75,
    inventoryTurnover: 4.2
  };

  const productData = [
    {
      id: 'SKU001',
      name: 'iPhone 15 Pro Max 256GB',
      category: 'Electronics',
      price: 1199.99,
      stock: 45,
      sold: 234,
      reorderPoint: 20,
      supplier: 'Apple Inc.',
      location: 'A-12-B',
      status: 'In Stock',
      lastUpdated: '2024-07-01',
      forecast: [65, 59, 80, 81, 56, 55, 40],
      trend: 'up',
      velocity: 'fast',
      margin: 22.5
    },
    {
      id: 'SKU002',
      name: 'Samsung Galaxy S24 Ultra',
      category: 'Electronics',
      price: 1299.99,
      stock: 12,
      sold: 189,
      reorderPoint: 25,
      supplier: 'Samsung',
      location: 'A-13-C',
      status: 'Low Stock',
      lastUpdated: '2024-07-01',
      forecast: [45, 49, 60, 71, 46, 35, 30],
      trend: 'down',
      velocity: 'medium',
      margin: 25.3
    },
    {
      id: 'SKU003',
      name: 'Nike Air Max 270',
      category: 'Footwear',
      price: 129.99,
      stock: 0,
      sold: 456,
      reorderPoint: 50,
      supplier: 'Nike Inc.',
      location: 'B-05-A',
      status: 'Out of Stock',
      lastUpdated: '2024-06-30',
      forecast: [85, 79, 90, 101, 86, 75, 70],
      trend: 'up',
      velocity: 'fast',
      margin: 45.2
    },
    {
      id: 'SKU004',
      name: 'Coca-Cola 12 Pack Cans',
      category: 'Beverages',
      price: 4.99,
      stock: 2847,
      sold: 1234,
      reorderPoint: 500,
      supplier: 'Coca-Cola Co.',
      location: 'C-01-D',
      status: 'In Stock',
      lastUpdated: '2024-07-01',
      forecast: [1200, 1150, 1300, 1400, 1250, 1100, 1050],
      trend: 'stable',
      velocity: 'slow',
      margin: 35.8
    },
    {
      id: 'SKU005',
      name: 'MacBook Pro 14" M3',
      category: 'Electronics',
      price: 1999.99,
      stock: 8,
      sold: 67,
      reorderPoint: 15,
      supplier: 'Apple Inc.',
      location: 'A-14-B',
      status: 'Low Stock',
      lastUpdated: '2024-07-01',
      forecast: [25, 29, 35, 31, 26, 22, 20],
      trend: 'down',
      velocity: 'medium',
      margin: 18.9
    }
  ];

  const salesData = [
    { date: '2024-06-25', sales: 45000, orders: 890, items: 2340, forecast: 48000 },
    { date: '2024-06-26', sales: 52000, orders: 1020, items: 2680, forecast: 51000 },
    { date: '2024-06-27', sales: 48000, orders: 940, items: 2510, forecast: 49000 },
    { date: '2024-06-28', sales: 61000, orders: 1180, items: 3020, forecast: 58000 },
    { date: '2024-06-29', sales: 55000, orders: 1080, items: 2890, forecast: 56000 },
    { date: '2024-06-30', sales: 68000, orders: 1320, items: 3450, forecast: 65000 },
    { date: '2024-07-01', sales: 73000, orders: 1420, items: 3780, forecast: 70000 }
  ];

  const categoryData = [
    { name: 'Electronics', value: 45, color: '#3B82F6', growth: 15.2 },
    { name: 'Clothing', value: 25, color: '#10B981', growth: 8.7 },
    { name: 'Home & Garden', value: 15, color: '#F59E0B', growth: 12.3 },
    { name: 'Food & Beverages', value: 10, color: '#EF4444', growth: -2.1 },
    { name: 'Health & Beauty', value: 5, color: '#8B5CF6', growth: 22.1 }
  ];

  useEffect(() => {
    // Setup periodic updates
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        lastUpdate: new Date()
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleForecastUpdate = (productId, forecast) => {
    setForecastData(prev => ({
      ...prev,
      [productId]: forecast
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  const filteredProducts = productData.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Enhanced Dashboard Component
  const Dashboard = () => (
    <div className="space-y-6">
      {/* Real-time Status Bar */}
      <div className={`rounded-lg border p-4 ${
        realTimeData.isConnected 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              realTimeData.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              realTimeData.isConnected ? 'text-green-800' : 'text-red-800'
            }`}>
              {realTimeData.isConnected ? 'System Online' : 'System Offline'}
            </span>
            <span className="text-xs text-gray-500">
              Last updated: {realTimeData.lastUpdate.toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Health: {realTimeData.systemHealth}</span>
            <button
              onClick={() => setRealTimeData(prev => ({ ...prev, lastUpdate: new Date() }))}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardMetrics.totalProducts.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">+2.3% from last month</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inventory Value</p>
              <p className="text-3xl font-bold text-gray-900">${dashboardMetrics.totalValue.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">+12.1% from last month</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-3xl font-bold text-yellow-600">{dashboardMetrics.lowStock}</p>
              <p className="text-xs text-red-600 mt-1">+15 from yesterday</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600">{dashboardMetrics.outOfStock}</p>
              <p className="text-xs text-red-600 mt-1">Needs attention</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Forecasting Highlight */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-900">AI-Powered Insights</h3>
              <p className="text-purple-700">Get intelligent forecasts and recommendations</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('ai-forecasting')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Brain className="w-5 h-5" />
            <span>Explore AI Features</span>
          </button>
        </div>
      </div>

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend with Forecast */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sales Trend & AI Forecast</h3>
            <div className="flex space-x-2">
              <button className="text-sm text-purple-600 hover:text-purple-800">
                View AI Analysis
              </button>
              <button className="text-sm text-blue-600 hover:text-blue-800">
                View Details
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="sales" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} name="Actual Sales" />
              <Area type="monotone" dataKey="forecast" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.1} name="AI Forecast" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Enhanced Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={60}
                dataKey="value"
                label={({ name, value }) => `${value}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {categoryData.map((category, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                  <span>{category.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{category.value}%</span>
                  <span className={`text-xs ${category.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {category.growth >= 0 ? '+' : ''}{category.growth.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions with Enhanced Features */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
            <Plus className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="font-medium">Add Product</div>
              <div className="text-sm text-gray-500">Create new inventory item</div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab('ai-forecasting')}
            className="flex items-center space-x-3 p-4 border border-purple-200 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
          >
            <Brain className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="font-medium text-purple-700">AI Forecast</div>
              <div className="text-sm text-purple-600">Generate predictions</div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab('analytics')}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <BarChart3 className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="font-medium">Analytics</div>
              <div className="text-sm text-gray-500">View detailed reports</div>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
            <RefreshCw className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="font-medium">Sync Data</div>
              <div className="text-sm text-gray-500">Update from sources</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  // Products Component
  const Products = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
        <div className="flex space-x-3">
          <button 
            onClick={() => setActiveTab('ai-forecasting')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Brain className="w-4 h-4" />
            <span>AI Forecast</span>
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="footwear">Footwear</option>
              <option value="beverages">Beverages</option>
              <option value="clothing">Clothing</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Forecast</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.supplier}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {forecastData[product.id] ? (
                      <div className="flex items-center space-x-2">
                        <Brain className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-purple-600">Available</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not trained</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
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

  // Analytics Component

 const Sidebar = () => (
    <div className="bg-white w-64 min-h-screen shadow-lg border-r relative flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">InventoryPro</span>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          AI-Powered ERP Inventory Management
        </div>
      </div>
      
      <nav className="mt-6 flex-1">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Home, badge: null },
          { id: 'products', label: 'Products', icon: Package, badge: null },
          { id: 'ai-forecasting', label: 'AI Forecasting', icon: Brain, badge: 'NEW', special: true },
          { id: 'analytics', label: 'Supply Chain Analytics', icon: BarChart3, badge: null },          { id: 'orders', label: 'ERP Orders', icon: ShoppingCart, badge: null, erpIntegrated: true },
          { id: 'suppliers', label: 'ERP Suppliers', icon: Truck, badge: null, erpIntegrated: true },
          { id: 'warehouses', label: 'ERP Warehouses', icon: Warehouse, badge: null, erpIntegrated: true },
          { id: 'reports', label: 'ERP Reports', icon: TrendingUp, badge: null, erpIntegrated: true },
          { id: 'real-erp', label: 'Real ERP System', icon: Zap, badge: 'LIVE', special: true },
          { id: 'erp-hub', label: 'ERP Integration Hub', icon: Zap, badge: 'LIVE', special: true },
          { id: 'settings', label: 'Settings', icon: Settings, badge: null }
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-6 py-3 text-left hover:bg-blue-50 transition-colors ${
                activeTab === item.id ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
              } ${item.special ? 'bg-gradient-to-r from-purple-50 to-blue-50' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${item.special ? 'text-purple-600' : item.erpIntegrated ? 'text-blue-600' : ''}`} />
                <span className={`font-medium ${item.special ? 'text-purple-700' : item.erpIntegrated ? 'text-blue-700' : ''}`}>
                  {item.label}
                </span>
              </div>
              {item.badge && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.badge === 'NEW' 
                    ? 'bg-purple-100 text-purple-700 font-medium' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.badge}
                </span>
              )}
              {item.erpIntegrated && (
                <div className="flex items-center space-x-1">
                  <Database className="w-3 h-3 text-blue-500" />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* ERP Status at bottom */}
      <div className="p-4">
        <div className="p-3 rounded-lg border bg-green-50 border-green-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium text-green-800">
              ERP Systems Online
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            4 systems connected
          </div>
        </div>
      </div>
    </div>
  );

 const renderContent = () => {
  switch (activeTab) {
    case 'dashboard': 
      return <Dashboard />;
    case 'products': 
      return <Products />;
    case 'ai-forecasting': 
      return <TimeLLMForecastingComponent productData={productData} onForecastUpdate={handleForecastUpdate} />;
    case 'analytics': 
      return <SupplyChainAnalytics />; // Changed from <Analytics /> to <SupplyChainAnalytics />
    case 'orders':
      return <ERPOrdersManagement />;
    case 'suppliers':
      return <ERPSupplierManagement />;
    case 'warehouses':
      return <ERPWarehouseManagement />;
    case 'reports':
      return <ERPReportsAnalytics />;
        case 'real-erp':
      return <RealWorkingERPSystem />;
    case 'erp-hub': 
      return <ERPConnectorDashboard />;
    default: 
      return (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
          <p className="text-gray-600 mb-4">This section is under development.</p>
        </div>
      );
  }
};

 return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1">
        {/* Enhanced Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeTab === 'ai-forecasting' ? 'AI Forecasting' : 
                   activeTab === 'products' ? 'Product Management' :
                  activeTab === 'analytics' ? 'Supply Chain Analytics':
                      activeTab === 'orders' ? 'ERP Order Management' :
                   activeTab === 'suppliers' ? 'ERP Supplier Management' :
                   activeTab === 'warehouses' ? 'ERP Warehouse Management' :
                   activeTab === 'reports' ? 'ERP Reports & Analytics' :
                   activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h1>
                
                {/* Status badges */}
                {activeTab === 'ai-forecasting' && (
                  <div className="flex items-center space-x-2">
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Powered by Time-LLM
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Real-time
                    </span>
                  </div>
                )}
                
                {(['orders', 'suppliers', 'warehouses', 'reports'].includes(activeTab)) && (
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      ERP Integrated
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Real-time Sync
                    </span>
                  </div>
                )}
              </div>
              
              {/* Header controls */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm text-gray-600">ERP Live</span>
                </div>
                
                {/* Your existing header components */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden md:block">Admin User</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <div className="max-w-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default InventoryApp;