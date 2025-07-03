// components/RealWorkingDashboard.js
import React, { useState, useEffect } from 'react';
import { dataStore } from './erp/core/DataStore';
import { apiService } from './erp/core/APIService';
import { businessLogic } from './erp/core/BusinessLogic';

const RealWorkingDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    initializeRealData();
  }, []);

  const initializeRealData = async () => {
    setIsLoading(true);
    
    try {
      // Try to sync real data from APIs
      const [shopifyData, quickbooksData] = await Promise.all([
        apiService.syncShopifyProducts(),
        apiService.syncQuickBooksItems()
      ]);

      // Merge and store real data
      const allProducts = [...shopifyData, ...quickbooksData];
      
      for (const product of allProducts) {
        try {
          await dataStore.addInventoryItem(product);
        } catch (error) {
          // Item might already exist, update instead
          await dataStore.updateInventoryQuantity(product.sku, product.quantity);
        }
      }

      // Load data from storage
      const inventoryData = await dataStore.getAllInventory();
      setInventory(inventoryData);

      // Generate real business insights
      const businessInsights = await businessLogic.generateInsights();
      setInsights(businessInsights);

      setAlerts(businessLogic.alerts);

    } catch (error) {
      console.error('Error initializing real data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      await dataStore.addInventoryItem(productData);
      const updatedInventory = await dataStore.getAllInventory();
      setInventory(updatedInventory);
      
      businessLogic.createAlert({
        type: 'success',
        message: `New product added: ${productData.name}`,
        severity: 'info'
      });
      
      setAlerts([...businessLogic.alerts]);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleProcessOrder = async (orderData) => {
    try {
      await businessLogic.processNewOrder(orderData);
      const updatedInventory = await dataStore.getAllInventory();
      setInventory(updatedInventory);
      setAlerts([...businessLogic.alerts]);
    } catch (error) {
      alert(`Order failed: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading real data from APIs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real Metrics */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <h3 className="text-sm font-medium text-gray-500">Total Inventory Value</h3>
            <p className="text-3xl font-bold text-blue-600">
              ${insights.totalValue.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
            <p className="text-3xl font-bold text-green-600">{insights.totalItems}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
            <p className="text-3xl font-bold text-red-600">{insights.lowStockCount}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <h3 className="text-sm font-medium text-gray-500">Reorder Suggestions</h3>
            <p className="text-3xl font-bold text-yellow-600">{insights.reorderSuggestions.length}</p>
          </div>
        </div>
      )}

      {/* Working Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Product Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
          <ProductForm onSubmit={handleAddProduct} />
        </div>

        {/* Process Order Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Process Order</h3>
          <OrderForm inventory={inventory} onSubmit={handleProcessOrder} />
        </div>
      </div>

      {/* Real Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Live Inventory</h3>
        <InventoryTable inventory={inventory} />
      </div>

      {/* Real Alerts */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Business Alerts</h3>
        <AlertsList alerts={alerts} />
      </div>
    </div>
  );
};

// Working forms components
const ProductForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    sku: '', name: '', price: '', quantity: '', category: '', reorderPoint: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      reorderPoint: parseInt(formData.reorderPoint)
    });
    setFormData({ sku: '', name: '', price: '', quantity: '', category: '', reorderPoint: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="SKU"
        value={formData.sku}
        onChange={(e) => setFormData({...formData, sku: e.target.value})}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="text"
        placeholder="Product Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        className="w-full p-2 border rounded"
        required
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={(e) => setFormData({...formData, price: e.target.value})}
          className="p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={(e) => setFormData({...formData, quantity: e.target.value})}
          className="p-2 border rounded"
          required
        />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
        Add Product
      </button>
    </form>
  );
};

const OrderForm = ({ inventory, onSubmit }) => {
  const [orderItems, setOrderItems] = useState([{ sku: '', quantity: 1 }]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      customer: 'Walk-in Customer',
      items: orderItems.filter(item => item.sku)
    });
    setOrderItems([{ sku: '', quantity: 1 }]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {orderItems.map((item, index) => (
        <div key={index} className="grid grid-cols-3 gap-2">
          <select
            value={item.sku}
            onChange={(e) => {
              const newItems = [...orderItems];
              newItems[index].sku = e.target.value;
              setOrderItems(newItems);
            }}
            className="p-2 border rounded"
            required
          >
            <option value="">Select Product</option>
            {inventory.map(product => (
              <option key={product.sku} value={product.sku}>
                {product.name} (Stock: {product.quantity})
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Qty"
            value={item.quantity}
            min="1"
            onChange={(e) => {
              const newItems = [...orderItems];
              newItems[index].quantity = parseInt(e.target.value);
              setOrderItems(newItems);
            }}
            className="p-2 border rounded"
            required
          />
          <button
            type="button"
            onClick={() => setOrderItems([...orderItems, { sku: '', quantity: 1 }])}
            className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            +
          </button>
        </div>
      ))}
      <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
        Process Order
      </button>
    </form>
  );
};

export default RealWorkingDashboard;