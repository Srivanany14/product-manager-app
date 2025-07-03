'use client'
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  Warehouse, Package, MapPin, Truck, Users, Settings, Plus, RefreshCw, 
 AlertTriangle, CheckCircle, XCircle, Clock, Database, Zap, ArrowUpDown,
 Eye, Edit, Trash2, Search, Filter, Download, Upload, Activity, BarChart3
} from 'lucide-react';

// SAP Warehouse Integration Service
class ERPWarehouseService {
 constructor() {
   this.sapConnection = null;
   this.syncStatus = new Map();
   this.eventListeners = new Map();
 }

 // Connect to SAP HANA
 async connectERP(config) {
   const connection = {
     id: 'sap',
     name: 'SAP HANA',
     status: 'connecting',
     config,
     lastSync: null,
     endpoints: {
       warehouses: '/api/warehouse/locations',
       inventory: '/api/warehouse/inventory',
       movements: '/api/warehouse/movements'
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
     connection.error = 'SAP HANA authentication failed';
   }

   this.emit('connection.updated', connection);
   return connection;
 }

 // Sync warehouse data from SAP HANA
 async syncWarehouseData() {
   if (!this.sapConnection || this.sapConnection.status !== 'connected') {
     throw new Error('SAP HANA not connected');
   }

   const syncJob = {
     id: `sap-sync-${Date.now()}`,
     type: 'warehouse',
     status: 'running',
     progress: 0,
     startTime: new Date(),
     records: { warehouses: 0, locations: 0, capacity: 0, staff: 0 }
   };

   this.syncStatus.set(syncJob.id, syncJob);

   // Simulate sync process
   return new Promise((resolve) => {
     const interval = setInterval(() => {
       syncJob.progress += Math.random() * 15 + 5;
       syncJob.records.warehouses += Math.floor(Math.random() * 2);
       syncJob.records.locations += Math.floor(Math.random() * 10) + 5;
       syncJob.records.capacity += Math.floor(Math.random() * 1000) + 500;
       syncJob.records.staff += Math.floor(Math.random() * 3) + 1;

       this.emit('sync.progress', syncJob);

       if (syncJob.progress >= 100) {
         syncJob.status = 'completed';
         syncJob.endTime = new Date();
         syncJob.progress = 100;
         
         this.sapConnection.lastSync = new Date();
         
         clearInterval(interval);
         this.emit('sync.completed', syncJob);
         resolve(syncJob);
       }
     }, 500);
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
}

const ERPWarehouseManagement = () => {
 const [erpService] = useState(() => new ERPWarehouseService());
 const [sapConnection, setSapConnection] = useState(null);
 const [syncJobs, setSyncJobs] = useState([]);
 const [selectedWarehouse, setSelectedWarehouse] = useState(null);
 const [showSAPModal, setShowSAPModal] = useState(false);

 // Sample warehouse data from SAP HANA
 const [warehouses, setWarehouses] = useState([
   {
     id: 'WH001',
     name: 'Main Distribution Center',
     location: 'New York, NY',
     type: 'Distribution',
     status: 'active',
     capacity: 50000,
     utilized: 35000,
     zones: 12,
     staff: 45,
     erpSource: 'sap',
     lastSyncTime: new Date(Date.now() - 10 * 60 * 1000),
     coordinates: { lat: 40.7128, lng: -74.0060 }
   },
   {
     id: 'WH002', 
     name: 'West Coast Facility',
     location: 'Los Angeles, CA',
     type: 'Fulfillment',
     status: 'active',
     capacity: 75000,
     utilized: 62000,
     zones: 18,
     staff: 67,
     erpSource: 'sap',
     lastSyncTime: new Date(Date.now() - 25 * 60 * 1000),
     coordinates: { lat: 34.0522, lng: -118.2437 }
   },
   {
     id: 'WH003',
     name: 'Regional Storage',
     location: 'Chicago, IL', 
     type: 'Storage',
     status: 'maintenance',
     capacity: 30000,
     utilized: 18000,
     zones: 8,
     staff: 28,
     erpSource: 'sap',
     lastSyncTime: new Date(Date.now() - 45 * 60 * 1000),
     coordinates: { lat: 41.8781, lng: -87.6298 }
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

   erpService.addEventListener('connection.updated', handleConnectionUpdate);
   erpService.addEventListener('sync.progress', handleSyncProgress);
   erpService.addEventListener('sync.completed', handleSyncProgress);

   // Initialize SAP HANA connection
   initializeSAPConnection();

   return () => {
     erpService.eventListeners.clear();
   };
 }, [erpService]);

 const initializeSAPConnection = async () => {
   await erpService.connectERP({ host: 'sap.company.com', database: 'PROD' });
 };

 const handleSAPConnect = async (config) => {
   try {
     await erpService.connectERP(config);
     setShowSAPModal(false);
   } catch (error) {
     console.error('SAP HANA connection failed:', error);
   }
 };

 const handleSyncWarehouse = async () => {
   try {
     await erpService.syncWarehouseData();
   } catch (error) {
     console.error('Warehouse sync failed:', error);
   }
 };

 const getUtilizationColor = (utilized, capacity) => {
   const percentage = (utilized / capacity) * 100;
   if (percentage >= 90) return 'text-red-600 bg-red-100';
   if (percentage >= 75) return 'text-yellow-600 bg-yellow-100';
   return 'text-green-600 bg-green-100';
 };

 const getStatusColor = (status) => {
   switch (status) {
     case 'active': return 'text-green-600 bg-green-100';
     case 'maintenance': return 'text-yellow-600 bg-yellow-100';
     case 'inactive': return 'text-red-600 bg-red-100';
     default: return 'text-gray-600 bg-gray-100';
   }
 };

 // SAP Connection Modal
 const SAPConnectionModal = () => {
   const [config, setConfig] = useState({});
   const [connecting, setConnecting] = useState(false);

   const handleConnect = async () => {
     setConnecting(true);
     try {
       await handleSAPConnect(config);
     } finally {
       setConnecting(false);
     }
   };

   return showSAPModal ? (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
       <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
         <div className="flex items-center justify-between mb-4">
           <h3 className="text-lg font-semibold">Connect SAP HANA</h3>
           <button onClick={() => setShowSAPModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
         </div>

         <div className="space-y-4">
           <div className="p-3 border rounded-lg bg-blue-50">
             <div className="flex items-center space-x-3">
               <span className="text-2xl">🏢</span>
               <div>
                 <div className="font-medium">SAP HANA</div>
                 <div className="text-sm text-gray-500">SAP</div>
               </div>
             </div>
           </div>

           <div className="space-y-3">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Server URL</label>
               <input
                 type="text"
                 placeholder="https://sap.company.com"
                 onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value }))}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Database</label>
               <input
                 type="text"
                 placeholder="PROD"
                 onChange={(e) => setConfig(prev => ({ ...prev, database: e.target.value }))}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">API Key/Token</label>
               <input
                 type="password"
                 placeholder="Enter API key or token"
                 onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
               />
             </div>
           </div>
         </div>

         <div className="flex space-x-3 mt-6">
           <button
             onClick={() => setShowSAPModal(false)}
             className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
           >
             Cancel
           </button>
           <button
             onClick={handleConnect}
             disabled={connecting}
             className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
           >
             {connecting ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Connect'}
           </button>
         </div>
       </div>
     </div>
   ) : null;
 };

 // Warehouse capacity chart data
 const capacityData = warehouses.map(wh => ({
   name: wh.name.split(' ')[0],
   capacity: wh.capacity,
   utilized: wh.utilized,
   available: wh.capacity - wh.utilized
 }));

 return (
   <div className="space-y-6">
     {/* Header */}
     <div className="flex justify-between items-center">
       <div>
         <h2 className="text-2xl font-bold text-gray-900">SAP Warehouse Management</h2>
         <p className="text-gray-600 mt-1">Integrated warehouse operations with SAP HANA</p>
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
           <span>Add Warehouse</span>
         </button>
       </div>
     </div>

     {/* SAP HANA Connection Status */}
     <div className="bg-white rounded-lg shadow-sm border p-6">
       <h3 className="text-lg font-semibold text-gray-900 mb-4">SAP HANA Connection</h3>
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
             onClick={() => handleSyncWarehouse()}
             disabled={sapConnection.status !== 'connected'}
             className="w-full bg-blue-50 text-blue-700 py-2 px-3 rounded text-sm hover:bg-blue-100 disabled:opacity-50"
           >
             <RefreshCw className="w-4 h-4 inline mr-1" />
             Sync Data
           </button>
         </div>
       ) : (
         <div className="text-center py-8">
           <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
           <p className="text-gray-500">No SAP HANA connection established</p>
           <button
             onClick={() => setShowSAPModal(true)}
             className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
           >
             Connect to SAP HANA
           </button>
         </div>
       )}
     </div>

     {/* Warehouse Overview */}
     <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
       <div className="bg-white rounded-lg shadow-sm p-6 border">
         <div className="flex items-center justify-between">
           <div>
             <p className="text-sm text-gray-600">Total Warehouses</p>
             <p className="text-3xl font-bold text-gray-900">{warehouses.length}</p>
           </div>
           <Warehouse className="w-8 h-8 text-blue-500" />
         </div>
       </div>

       <div className="bg-white rounded-lg shadow-sm p-6 border">
         <div className="flex items-center justify-between">
           <div>
             <p className="text-sm text-gray-600">Total Capacity</p>
             <p className="text-3xl font-bold text-gray-900">
               {warehouses.reduce((sum, wh) => sum + wh.capacity, 0).toLocaleString()}
             </p>
           </div>
           <Package className="w-8 h-8 text-green-500" />
         </div>
       </div>

       <div className="bg-white rounded-lg shadow-sm p-6 border">
         <div className="flex items-center justify-between">
           <div>
             <p className="text-sm text-gray-600">Space Utilized</p>
             <p className="text-3xl font-bold text-gray-900">
               {Math.round((warehouses.reduce((sum, wh) => sum + wh.utilized, 0) / 
               warehouses.reduce((sum, wh) => sum + wh.capacity, 0)) * 100)}%
             </p>
           </div>
           <BarChart3 className="w-8 h-8 text-yellow-500" />
         </div>
       </div>

       <div className="bg-white rounded-lg shadow-sm p-6 border">
         <div className="flex items-center justify-between">
           <div>
             <p className="text-sm text-gray-600">Total Staff</p>
             <p className="text-3xl font-bold text-gray-900">
               {warehouses.reduce((sum, wh) => sum + wh.staff, 0)}
             </p>
           </div>
           <Users className="w-8 h-8 text-purple-500" />
         </div>
       </div>
     </div>

     {/* Capacity Utilization Chart */}
     <div className="bg-white rounded-lg shadow-sm border p-6">
       <h3 className="text-lg font-semibold text-gray-900 mb-4">SAP Warehouse Capacity Analysis</h3>
       <ResponsiveContainer width="100%" height={300}>
         <BarChart data={capacityData}>
           <CartesianGrid strokeDasharray="3 3" />
           <XAxis dataKey="name" />
           <YAxis />
           <Tooltip />
           <Legend />
           <Bar dataKey="utilized" stackId="a" fill="#3B82F6" name="Utilized" />
           <Bar dataKey="available" stackId="a" fill="#E5E7EB" name="Available" />
         </BarChart>
       </ResponsiveContainer>
     </div>

     {/* Warehouse List */}
     <div className="bg-white rounded-lg shadow-sm border">
       <div className="p-6 border-b border-gray-200">
         <div className="flex items-center justify-between">
           <h3 className="text-lg font-semibold text-gray-900">SAP Warehouse Facilities</h3>
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
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SAP Sync</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
             </tr>
           </thead>
           <tbody className="bg-white divide-y divide-gray-200">
             {warehouses.map((warehouse) => (
               <tr key={warehouse.id} className="hover:bg-gray-50">
                 <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex items-center">
                     <div className="flex-shrink-0 h-10 w-10">
                       <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                         <Warehouse className="h-6 w-6 text-blue-600" />
                       </div>
                     </div>
                     <div className="ml-4">
                       <div className="text-sm font-medium text-gray-900">{warehouse.name}</div>
                       <div className="text-sm text-gray-500 flex items-center">
                         <MapPin className="w-3 h-3 mr-1" />
                         {warehouse.location}
                       </div>
                     </div>
                   </div>
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{warehouse.type}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                   {warehouse.capacity.toLocaleString()} sq ft
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex items-center">
                     <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                       <div 
                         className="bg-blue-600 h-2 rounded-full" 
                         style={{ width: `${(warehouse.utilized / warehouse.capacity) * 100}%` }}
                       ></div>
                     </div>
                     <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                       getUtilizationColor(warehouse.utilized, warehouse.capacity)
                     }`}>
                       {Math.round((warehouse.utilized / warehouse.capacity) * 100)}%
                     </span>
                   </div>
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{warehouse.staff}</td>
                 <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex items-center space-x-2">
                     <Database className="w-4 h-4 text-gray-400" />
                     <span className="text-sm text-gray-900">SAP HANA</span>
                   </div>
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap">
                   <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(warehouse.status)}`}>
                     {warehouse.status}
                   </span>
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                   <div className="flex space-x-2">
                     <button className="text-blue-600 hover:text-blue-900">
                       <Eye className="w-4 h-4" />
                     </button>
                     <button className="text-gray-600 hover:text-gray-900">
                       <Edit className="w-4 h-4" />
                     </button>
                     <button 
                       onClick={() => handleSyncWarehouse()}
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
                   Syncing SAP HANA warehouse data...
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
                 Processed: {job.records.warehouses} warehouses, {job.records.locations} locations
               </div>
             </div>
           ))}
         </div>
       </div>
     )}

     <SAPConnectionModal />
   </div>
 );
};

export default ERPWarehouseManagement;