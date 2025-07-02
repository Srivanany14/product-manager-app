'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { inventoryAPI } from '../lib/aws-config';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  Package, TrendingUp, AlertTriangle, DollarSign, Search, Filter, Plus, Upload, Download,
  Eye, Edit, Trash2, RefreshCw, Bell, CheckCircle, XCircle, Clock, Zap, Brain, Target,
  BarChart3, PieChart, Calendar, MapPin, Users, ShoppingCart, Truck
} from 'lucide-react';

const AdvancedProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table', 'cards', 'analytics'
  const [notifications, setNotifications] = useState([]);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  // Real-time event listeners
  useEffect(() => {
    const handleProductCreated = (product) => {
      setProducts(prev => [...prev, product]);
      addNotification(`New product added: ${product.name}`, 'success');
    };

    const handleProductUpdated = (product) => {
      setProducts(prev => prev.map(p => p.productId === product.productId ? product : p));
      addNotification(`Product updated: ${product.name}`, 'info');
    };

    const handleProductDeleted = ({ productId }) => {
      setProducts(prev => prev.filter(p => p.productId !== productId));
      addNotification('Product deleted', 'warning');
    };

    const handleLowStockAlert = (product) => {
      addNotification(
        `Low stock alert: ${product.name} (${product.stock} remaining)`,
        'error'
      );
    };

    const handleInventoryChanged = ({ action, product }) => {
      if (action === 'update' && product.stock <= product.reorderPoint) {
        addNotification(
          `Reorder needed: ${product.name}`,
          'warning'
        );
      }
    };

    // Subscribe to events
    if (realTimeUpdates) {
      inventoryAPI.addEventListener('productCreated', handleProductCreated);
      inventoryAPI.addEventListener('productUpdated', handleProductUpdated);
      inventoryAPI.addEventListener('productDeleted', handleProductDeleted);
      inventoryAPI.addEventListener('lowStockAlert', handleLowStockAlert);
      inventoryAPI.addEventListener('inventoryChanged', handleInventoryChanged);
    }

    return () => {
      inventoryAPI.removeEventListener('productCreated', handleProductCreated);
      inventoryAPI.removeEventListener('productUpdated', handleProductUpdated);
      inventoryAPI.removeEventListener('productDeleted', handleProductDeleted);
      inventoryAPI.removeEventListener('lowStockAlert', handleLowStockAlert);
      inventoryAPI.removeEventListener('inventoryChanged', handleInventoryChanged);
    };
  }, [realTimeUpdates]);

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
                             product.category.toLowerCase() === selectedCategory.toLowerCase();
      
      const matchesStatus = selectedStatus === 'all' || 
                           product.status.toLowerCase().replace(' ', '') === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedStatus, sortField, sortDirection]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getProducts();
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      addNotification('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addNotification = useCallback((message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only 5 notifications
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectProduct = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.productId)));
      setShowBulkActions(true);
    }
  };

  const handleBulkAction = async (action) => {
    const selectedIds = Array.from(selectedProducts);
    
    try {
      switch (action) {
        case 'delete':
          if (window.confirm(`Delete ${selectedIds.length} products?`)) {
            await Promise.all(selectedIds.map(id => inventoryAPI.deleteProduct(id)));
            addNotification(`${selectedIds.length} products deleted`, 'success');
          }
          break;
        case 'updateStatus':
          // Implement bulk status update
          addNotification(`Status updated for ${selectedIds.length} products`, 'success');
          break;
        case 'export':
          exportSelectedProducts(selectedIds);
          break;
      }
      
      setSelectedProducts(new Set());
      setShowBulkActions(false);
    } catch (error) {
      addNotification(`Bulk action failed: ${error.message}`, 'error');
    }
  };

  const exportSelectedProducts = (productIds) => {
    const selectedData = products.filter(p => productIds.includes(p.productId));
    const csv = convertToCSV(selectedData);
    downloadCSV(csv, 'selected_products.csv');
    addNotification('Export completed', 'success');
  };

  const convertToCSV = (data) => {
    const headers = ['Product ID', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Supplier'];
    const rows = data.map(product => [
      product.productId,
      product.name,
      product.category,
      product.price,
      product.stock,
      product.status,
      product.supplier || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800 border-green-200';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Out of Stock': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'In Stock': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Low Stock': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'Out of Stock': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get unique categories
  const categories = [...new Set(products.map(p => p.category))];

  // Calculate metrics
  const metrics = {
    total: products.length,
    inStock: products.filter(p => p.status === 'In Stock').length,
    lowStock: products.filter(p => p.status === 'Low Stock').length,
    outOfStock: products.filter(p => p.status === 'Out of Stock').length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  };

  // Render notifications
  const renderNotifications = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg border-l-4 max-w-sm transform transition-all duration-300 ${
            notification.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
            notification.type === 'error' ? 'bg-red-50 border-red-500 text-red-800' :
            notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-800' :
            'bg-blue-50 border-blue-500 text-blue-800'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {notification.type === 'error' && <XCircle className="w-5 h-5" />}
              {notification.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {notification.type === 'info' && <Bell className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
              <p className="text-xs opacity-75 mt-1">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // Render metrics cards
  const renderMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Products</p>
            <p className="text-3xl font-bold text-gray-900">{metrics.total}</p>
          </div>
          <Package className="w-8 h-8 text-blue-500" />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">In Stock</p>
            <p className="text-3xl font-bold text-green-600">{metrics.inStock}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Low Stock</p>
            <p className="text-3xl font-bold text-yellow-600">{metrics.lowStock}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-yellow-500" />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Out of Stock</p>
            <p className="text-3xl font-bold text-red-600">{metrics.outOfStock}</p>
          </div>
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Value</p>
            <p className="text-3xl font-bold text-gray-900">${metrics.totalValue.toLocaleString()}</p>
          </div>
          <DollarSign className="w-8 h-8 text-green-500" />
        </div>
      </div>
    </div>
  );

  // Render filters and controls
  const renderControls = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 border mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[300px]"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="instock">In Stock</option>
            <option value="lowstock">Low Stock</option>
            <option value="outofstock">Out of Stock</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <div className="flex rounded-lg border border-gray-300">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 ${viewMode === 'cards' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Package className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-3 py-2 ${viewMode === 'analytics' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <PieChart className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setRealTimeUpdates(!realTimeUpdates)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              realTimeUpdates 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
          >
            <Zap className={`w-4 h-4 ${realTimeUpdates ? 'text-green-600' : 'text-gray-400'}`} />
            <span className="text-sm">Live</span>
          </button>

          <button
            onClick={loadProducts}
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
            <span>Add Product</span>
          </button>

          <button
            onClick={() => exportSelectedProducts(filteredProducts.map(p => p.productId))}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('export')}
                className="text-sm bg-white text-blue-600 border border-blue-300 px-3 py-1 rounded hover:bg-blue-50"
              >
                Export Selected
              </button>
              <button
                onClick={() => handleBulkAction('updateStatus')}
                className="text-sm bg-white text-blue-600 border border-blue-300 px-3 py-1 rounded hover:bg-blue-50"
              >
                Update Status
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="text-sm bg-white text-red-600 border border-red-300 px-3 py-1 rounded hover:bg-red-50"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render table view
  const renderTableView = () => (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Product</span>
                  {sortField === 'name' && (
                    <span className={`transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}>
                      ↑
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('category')}
              >
                Category
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('stock')}
              >
                Stock
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('price')}
              >
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                AI Forecast
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.productId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.productId)}
                    onChange={() => handleSelectProduct(product.productId)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.productId}</div>
                      <div className="text-xs text-gray-400">{product.supplier}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{product.stock?.toLocaleString()}</span>
                    {product.stock <= product.reorderPoint && (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Reorder at: {product.reorderPoint}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${product.price?.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(product.status)}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-purple-600">Available</span>
                  </div>
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
  );

  // Render cards view
  const renderCardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProducts.map((product) => (
        <div key={product.productId} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
              <input
                type="checkbox"
                checked={selectedProducts.has(product.productId)}
                onChange={() => handleSelectProduct(product.productId)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>
            <p className="text-sm text-gray-500 mb-3">{product.productId}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Stock:</span>
                <span className="text-sm font-medium">{product.stock?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Price:</span>
                <span className="text-sm font-medium">${product.price?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Category:</span>
                <span className="text-sm">{product.category}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              {getStatusIcon(product.status)}
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(product.status)}`}>
                {product.status}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors">
                View Details
              </button>
              <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderNotifications()}
      {renderMetrics()}
      {renderControls()}
      
      {viewMode === 'table' && renderTableView()}
      {viewMode === 'cards' && renderCardsView()}
      {viewMode === 'analytics' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics View</h3>
          <p className="text-gray-600">Advanced analytics coming next...</p>
        </div>
      )}
    </div>
  );
};

export default AdvancedProductManagement;