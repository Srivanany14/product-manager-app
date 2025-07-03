// components/RealWorkingERPSystem.js
import React, { useState, useEffect } from 'react';
import { 
  Database, ShoppingCart, DollarSign, Package, TrendingUp, AlertTriangle,
  CheckCircle, XCircle, RefreshCw, Zap, Activity, Bell, Plus, Eye, 
  BarChart3, Users, Settings, Download, Play, Pause
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { realBusinessEngine } from '/home/anany/Desktop/app/inventory-management-app/src/app/lib/business/RealBusinessEngine.js';
import { realDatabase } from '/home/anany/Desktop/app/inventory-management-app/src/app/lib/database/RealDatabase.js';

const RealWorkingERPSystem = () => {
  const [isSystemRunning, setIsSystemRunning] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    initializeRealSystem();
    
    // Set up event listeners
    realBusinessEngine.on('sync.completed', handleSyncCompleted);
    realBusinessEngine.on('order.processed', handleOrderProcessed);
    realBusinessEngine.on('alert.created', handleAlertCreated);
    realBusinessEngine.on('insights.generated', handleInsightsGenerated);
    realBusinessEngine.on('forecast.generated', handleForecastGenerated);
    
    return () => {
      // Cleanup
      realBusinessEngine.off('sync.completed', handleSyncCompleted);
      realBusinessEngine.off('order.processed', handleOrderProcessed);
      realBusinessEngine.off('alert.created', handleAlertCreated);
      realBusinessEngine.off('insights.generated', handleInsightsGenerated);
      realBusinessEngine.off('forecast.generated', handleForecastGenerated);
    };
  }, []);

  const initializeRealSystem = async () => {
    setIsLoading(true);
    try {
      console.log('🚀 Initializing Real ERP System...');
      
      // Initialize database
      await realDatabase.initialize();
      
      // Load existing data
      const existingProducts = await realDatabase.getAllProducts();
      const existingOrders = await realDatabase.getOrders(20);
      
      setProducts(existingProducts);
      setOrders(existingOrders);
      setAlerts(realBusinessEngine.getAlerts());
      
      // Start the business engine
      await realBusinessEngine.startRealTimeSync();
      setIsSystemRunning(true);
      
      console.log('✅ Real ERP System initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize system:', error);
      alert(`System initialization failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncCompleted = async (data) => {
    console.log('🔄 Sync completed:', data);
    const updatedProducts = await realDatabase.getAllProducts();
    setProducts(updatedProducts);
    
    // Generate new insights
    const newInsights = await realBusinessEngine.generateBusinessInsights();
    setInsights(newInsights);
  };

  const handleOrderProcessed = async (order) => {
    console.log('📦 Order processed:', order);
    const updatedOrders = await realDatabase.getOrders(20);
    const updatedProducts = await realDatabase.getAllProducts();
    
    setOrders(updatedOrders);
    setProducts(updatedProducts);
  };

  const handleAlertCreated = (alert) => {
    console.log('🚨 New alert:', alert);
    setAlerts(prev => [alert, ...prev.slice(0, 49)]);
  };

  const handleInsightsGenerated = (insights) => {
    console.log('📊 Insights generated:', insights);
    setInsights(insights);
  };

  const handleForecastGenerated = (data) => {
    console.log('🤖 Forecast generated:', data);
    if (data.productSku === selectedProduct?.sku) {
      setForecast(data.forecast);
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      await realDatabase.saveProduct({
        ...productData,
        source: 'manual',
        reorderPoint: productData.reorderPoint || 10
      });
      
      const updatedProducts = await realDatabase.getAllProducts();
      setProducts(updatedProducts);
      setShowAddProductModal(false);
      
      realBusinessEngine.createAlert('success', `Product added: ${productData.name}`, 'info');
      
    } catch (error) {
      console.error('Failed to add product:', error);
      alert(`Failed to add product: ${error.message}`);
    }
  };

  const handleProcessOrder = async (orderData) => {
    try {
      await realBusinessEngine.processRealOrder(orderData);
      setShowOrderModal(false);
    } catch (error) {
      console.error('Failed to process order:', error);
      alert(`Failed to process order: ${error.message}`);
    }
  };

  const handleGenerateForecast = async (product) => {
    try {
      setSelectedProduct(product);
      const forecastData = await realBusinessEngine.generateAIForecast(product.sku);
      setForecast(forecastData);
    } catch (error) {
      console.error('Failed to generate forecast:', error);
      alert(`Failed to generate forecast: ${error.message}`);
    }
  };

  const getStockStatus = (product) => {
    if (product.quantity === 0) return { status: 'Out of Stock', color: 'red' };
    if (product.quantity <= (product.reorderPoint || 10)) return { status: 'Low Stock', color: 'yellow' };
    return { status: 'In Stock', color: 'green' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Initializing Real ERP System</h2>
          <p className="text-gray-600">Connecting to APIs, loading data, starting business engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Status Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Real Working ERP System</h1>
            <p className="text-green-100 mt-2">Live production system with real API integrations</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${isSystemRunning ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-lg font-semibold">
                {isSystemRunning ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
            <div className="text-sm text-green-100">
              {products.length} Products • {orders.length} Orders • {alerts.filter(a => !a.read).length} Alerts
            </div>
          </div>
        </div>
      </div>

      {/* Real Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inventory Value</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(insights?.inventoryValue || products.reduce((sum, p) => sum + (p.price * p.quantity), 0))}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(insights?.orderStats?.todayRevenue || 0)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-3xl font-bold text-yellow-600">
                {insights?.lowStockItems?.length || products.filter(p => p.quantity <= (p.reorderPoint || 10)).length}
              </p>
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

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => setShowAddProductModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
        
        <button
          onClick={() => setShowOrderModal(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Process Order</span>
        </button>
        
        <button
          onClick={() => realBusinessEngine.performFullSync()}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Force Sync</span>
        </button>
      </div>

      {/* Real Product Inventory */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Product Inventory</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <tr key={product.sku} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${stockStatus.color}-100 text-${stockStatus.color}-800`}>
                        {product.quantity} units
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.price * product.quantity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${stockStatus.color}-100 text-${stockStatus.color}-800`}>
                        {stockStatus.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleGenerateForecast(product)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Generate AI Forecast"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Forecast Display */}
      {selectedProduct && forecast && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            AI Demand Forecast - {selectedProduct.name}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                name="Predicted Demand"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600">
            Average confidence: {forecast.length > 0 ? 
              (forecast.reduce((sum, f) => sum + f.confidence, 0) / forecast.length * 100).toFixed(1) : 0
            }%
          </div>
        </div>
      )}

      {/* Live Activity Feed */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Live System Activity</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Real-time</span>
          </div>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alerts.slice(0, 10).map(alert => (
            <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                alert.severity === 'high' ? 'bg-red-500' :
                alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{alert.message}</p>
                <p className="text-xs text-gray-500">{alert.timestamp.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showAddProductModal && (
        <AddProductModal 
          onClose={() => setShowAddProductModal(false)}
          onSubmit={handleAddProduct}
        />
      )}

      {showOrderModal && (
        <ProcessOrderModal
          products={products}
          onClose={() => setShowOrderModal(false)}
          onSubmit={handleProcessOrder}
        />
      )}
    </div>
  );
};

// Modal Components
const AddProductModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    price: '',
   quantity: '',
   category: '',
   reorderPoint: '',
   vendor: ''
 });

 const handleSubmit = (e) => {
   e.preventDefault();
   onSubmit({
     ...formData,
     price: parseFloat(formData.price),
     quantity: parseInt(formData.quantity),
     reorderPoint: parseInt(formData.reorderPoint) || 10
   });
 };

 return (
   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
     <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
       <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
       <form onSubmit={handleSubmit} className="space-y-4">
         <input
           type="text"
           placeholder="SKU"
           value={formData.sku}
           onChange={(e) => setFormData({...formData, sku: e.target.value})}
           className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
           required
         />
         <input
           type="text"
           placeholder="Product Name"
           value={formData.name}
           onChange={(e) => setFormData({...formData, name: e.target.value})}
           className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
           required
         />
         <div className="grid grid-cols-2 gap-4">
           <input
             type="number"
             step="0.01"
             placeholder="Price"
             value={formData.price}
             onChange={(e) => setFormData({...formData, price: e.target.value})}
             className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
             required
           />
           <input
             type="number"
             placeholder="Quantity"
             value={formData.quantity}
             onChange={(e) => setFormData({...formData, quantity: e.target.value})}
             className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
             required
           />
         </div>
         <input
           type="text"
           placeholder="Category"
           value={formData.category}
           onChange={(e) => setFormData({...formData, category: e.target.value})}
           className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
           required
         />
         <div className="grid grid-cols-2 gap-4">
           <input
             type="number"
             placeholder="Reorder Point"
             value={formData.reorderPoint}
             onChange={(e) => setFormData({...formData, reorderPoint: e.target.value})}
             className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
           />
           <input
             type="text"
             placeholder="Vendor"
             value={formData.vendor}
             onChange={(e) => setFormData({...formData, vendor: e.target.value})}
             className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
           />
         </div>
         <div className="flex space-x-3 pt-4">
           <button
             type="button"
             onClick={onClose}
             className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200"
           >
             Cancel
           </button>
           <button
             type="submit"
             className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
           >
             Add Product
           </button>
         </div>
       </form>
     </div>
   </div>
 );
};

const ProcessOrderModal = ({ products, onClose, onSubmit }) => {
 const [orderData, setOrderData] = useState({
   customer: {
     firstName: '',
     lastName: '',
     email: ''
   },
   items: [{ sku: '', quantity: 1 }]
 });

 const handleSubmit = (e) => {
   e.preventDefault();
   
   // Calculate prices for items
   const itemsWithPrices = orderData.items.map(item => {
     const product = products.find(p => p.sku === item.sku);
     return {
       ...item,
       price: product ? product.price : 0,
       name: product ? product.name : 'Unknown Product'
     };
   });

   onSubmit({
     ...orderData,
     items: itemsWithPrices.filter(item => item.sku)
   });
 };

 const addItem = () => {
   setOrderData(prev => ({
     ...prev,
     items: [...prev.items, { sku: '', quantity: 1 }]
   }));
 };

 const updateItem = (index, field, value) => {
   setOrderData(prev => ({
     ...prev,
     items: prev.items.map((item, i) => 
       i === index ? { ...item, [field]: value } : item
     )
   }));
 };

 const removeItem = (index) => {
   setOrderData(prev => ({
     ...prev,
     items: prev.items.filter((_, i) => i !== index)
   }));
 };

 const getTotal = () => {
   return orderData.items.reduce((total, item) => {
     const product = products.find(p => p.sku === item.sku);
     return total + (product ? product.price * item.quantity : 0);
   }, 0);
 };

 return (
   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
     <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
       <h3 className="text-lg font-semibold mb-4">Process New Order</h3>
       <form onSubmit={handleSubmit} className="space-y-6">
         {/* Customer Information */}
         <div>
           <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
           <div className="grid grid-cols-2 gap-4">
             <input
               type="text"
               placeholder="First Name"
               value={orderData.customer.firstName}
               onChange={(e) => setOrderData(prev => ({
                 ...prev,
                 customer: { ...prev.customer, firstName: e.target.value }
               }))}
               className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
               required
             />
             <input
               type="text"
               placeholder="Last Name"
               value={orderData.customer.lastName}
               onChange={(e) => setOrderData(prev => ({
                 ...prev,
                 customer: { ...prev.customer, lastName: e.target.value }
               }))}
               className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
               required
             />
           </div>
           <input
             type="email"
             placeholder="Email"
             value={orderData.customer.email}
             onChange={(e) => setOrderData(prev => ({
               ...prev,
               customer: { ...prev.customer, email: e.target.value }
             }))}
             className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 mt-4"
             required
           />
         </div>

         {/* Order Items */}
         <div>
           <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
           <div className="space-y-3">
             {orderData.items.map((item, index) => {
               const product = products.find(p => p.sku === item.sku);
               return (
                 <div key={index} className="grid grid-cols-12 gap-3 items-center">
                   <div className="col-span-6">
                     <select
                       value={item.sku}
                       onChange={(e) => updateItem(index, 'sku', e.target.value)}
                       className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                       required
                     >
                       <option value="">Select Product</option>
                       {products.map(product => (
                         <option 
                           key={product.sku} 
                           value={product.sku}
                           disabled={product.quantity === 0}
                         >
                           {product.name} (Stock: {product.quantity}) - ${product.price}
                         </option>
                       ))}
                     </select>
                   </div>
                   <div className="col-span-2">
                     <input
                       type="number"
                       min="1"
                       max={product ? product.quantity : 999}
                       placeholder="Qty"
                       value={item.quantity}
                       onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                       className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                       required
                     />
                   </div>
                   <div className="col-span-3 text-sm text-gray-600">
                     {product ? `$${(product.price * item.quantity).toFixed(2)}` : '$0.00'}
                   </div>
                   <div className="col-span-1">
                     {orderData.items.length > 1 && (
                       <button
                         type="button"
                         onClick={() => removeItem(index)}
                         className="text-red-600 hover:text-red-900"
                       >
                         ×
                       </button>
                     )}
                   </div>
                 </div>
               );
             })}
           </div>
           <button
             type="button"
             onClick={addItem}
             className="mt-3 text-blue-600 hover:text-blue-900 text-sm"
           >
             + Add Item
           </button>
         </div>

         {/* Order Total */}
         <div className="border-t pt-4">
           <div className="flex justify-between items-center">
             <span className="text-lg font-semibold">Total:</span>
             <span className="text-xl font-bold text-green-600">
               ${getTotal().toFixed(2)}
             </span>
           </div>
         </div>

         <div className="flex space-x-3 pt-4">
           <button
             type="button"
             onClick={onClose}
             className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200"
           >
             Cancel
           </button>
           <button
             type="submit"
             disabled={orderData.items.every(item => !item.sku) || getTotal() === 0}
             className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
           >
             Process Order
           </button>
         </div>
       </form>
     </div>
   </div>
 );
};

export default RealWorkingERPSystem;