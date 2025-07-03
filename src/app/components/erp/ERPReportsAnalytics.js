'use client'
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { 
  BarChart3, TrendingUp, Download, Calendar, Filter, RefreshCw, Eye, Share2,
  FileText, Activity, Clock, DollarSign, Package,
  Users, Truck, Database, Zap, Settings, Plus, Search, ArrowUpDown,
  AlertTriangle, CheckCircle, XCircle, Mail, Printer, Globe
} from 'lucide-react';

// SAP Reports Service
class ERPReportsService {
  constructor() {
    this.sapConnection = null;
    this.reportCache = new Map();
    this.scheduledReports = new Map();
    this.eventListeners = new Map();
  }

  // Connect to SAP Analytics Cloud
  async connectReportingERP(config) {
    const connection = {
      id: 'sap',
      name: 'SAP Analytics Cloud',
      status: 'connecting',
      config,
      type: 'reporting',
      lastSync: null,
      endpoints: {
        reports: '/api/analytics/reports',
        data: '/api/analytics/data',
        export: '/api/analytics/export'
      },
      connectedAt: null,
      reportingCapabilities: ['Real-time analytics', 'Predictive insights', 'Custom dashboards', 'AI recommendations']
    };

    this.sapConnection = connection;
    
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (Math.random() > 0.1) {
      connection.status = 'connected';
      connection.connectedAt = new Date();
    } else {
      connection.status = 'error';
      connection.error = 'SAP Analytics API authentication failed';
    }

    this.emit('reports.connection.updated', connection);
    return connection;
  }

  // Generate report from SAP data
  async generateReport(reportType, parameters = {}) {
    if (!this.sapConnection || this.sapConnection.status !== 'connected') {
      throw new Error('SAP Analytics Cloud not connected');
    }

    const reportJob = {
      id: `report-${Date.now()}`,
      erpSystem: 'sap',
      type: reportType,
      status: 'generating',
      progress: 0,
      startTime: new Date(),
      parameters,
      recordsProcessed: 0
    };

    // Simulate report generation
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        reportJob.progress += Math.random() * 15 + 5;
        reportJob.recordsProcessed += Math.floor(Math.random() * 1000) + 500;

        this.emit('reports.generation.progress', reportJob);

        if (reportJob.progress >= 100) {
          reportJob.status = 'completed';
          reportJob.endTime = new Date();
          reportJob.progress = 100;
          
          const reportData = this.generateMockReportData(reportType, parameters);
          reportJob.data = reportData;
          
          this.reportCache.set(reportJob.id, reportJob);
          
          clearInterval(interval);
          this.emit('reports.generation.completed', reportJob);
          resolve(reportJob);
        }
      }, 300);
    });
  }

  // Generate mock report data based on type
  generateMockReportData(reportType, parameters) {
    switch (reportType) {
      case 'inventory_summary':
        return {
          summary: {
            totalProducts: 15847,
            totalValue: 4250000,
            lowStockItems: 156,
            outOfStockItems: 23,
            fastMovingItems: 89,
            slowMovingItems: 234
          },
          categories: [
            { name: 'Electronics', value: 6250000, percentage: 42.3, items: 3456 },
            { name: 'Clothing', value: 2890000, percentage: 19.6, items: 2134 },
            { name: 'Home & Garden', value: 1950000, percentage: 13.2, items: 1678 },
            { name: 'Sports', value: 1450000, percentage: 9.8, items: 1234 },
            { name: 'Books', value: 890000, percentage: 6.0, items: 2345 },
            { name: 'Other', value: 1320000, percentage: 9.1, items: 5000 }
          ],
          trends: Array.from({ length: 12 }, (_, i) => ({
            month: new Date(2024, i).toLocaleDateString('en', { month: 'short' }),
            value: Math.floor(Math.random() * 500000) + 3500000,
            items: Math.floor(Math.random() * 2000) + 14000
          }))
        };

      case 'sales_performance':
        return {
          summary: {
            totalRevenue: 8950000,
            totalOrders: 12456,
            avgOrderValue: 718.45,
            topCustomers: 156,
            newCustomers: 890,
            returningCustomers: 11566
          },
          monthly: Array.from({ length: 12 }, (_, i) => ({
            month: new Date(2024, i).toLocaleDateString('en', { month: 'short' }),
            revenue: Math.floor(Math.random() * 300000) + 600000,
            orders: Math.floor(Math.random() * 500) + 800,
            customers: Math.floor(Math.random() * 200) + 400
          })),
          topProducts: [
            { name: 'iPhone 15 Pro', revenue: 450000, units: 234, growth: 15.2 },
            { name: 'Samsung Galaxy S24', revenue: 380000, units: 189, growth: 8.7 },
            { name: 'MacBook Pro M3', revenue: 340000, units: 156, growth: 22.1 },
            { name: 'Dell XPS 13', revenue: 290000, units: 178, growth: -3.2 },
            { name: 'iPad Air', revenue: 250000, units: 201, growth: 11.8 }
          ]
        };

      case 'supplier_performance':
        return {
         summary: {
           totalSuppliers: 234,
           activeSuppliers: 189,
           avgDeliveryTime: 12.3,
           onTimeDeliveryRate: 94.2,
           qualityScore: 96.8,
           totalPurchaseValue: 5670000
         },
         suppliers: [
           { name: 'Global Manufacturing Corp', onTime: 97.8, quality: 98.2, value: 890000, orders: 156 },
           { name: 'TechComponents USA', onTime: 95.4, quality: 97.1, value: 567000, orders: 89 },
           { name: 'European Materials Ltd', onTime: 92.1, quality: 95.8, value: 445000, orders: 67 },
           { name: 'Pacific Logistics', onTime: 99.2, quality: 98.9, value: 1250000, orders: 234 },
           { name: 'Regional Supplier Co', onTime: 89.7, quality: 94.2, value: 334000, orders: 45 }
         ],
         trends: Array.from({ length: 6 }, (_, i) => ({
           month: new Date(2024, i + 6).toLocaleDateString('en', { month: 'short' }),
           onTime: Math.floor(Math.random() * 10) + 90,
           quality: Math.floor(Math.random() * 8) + 92,
           cost: Math.floor(Math.random() * 15) + 85
         }))
       };

     case 'financial_summary':
       return {
         summary: {
           totalRevenue: 8950000,
           totalCosts: 6340000,
           grossProfit: 2610000,
           netProfit: 1890000,
           profitMargin: 21.1,
           cashFlow: 456000
         },
         quarterly: [
           { quarter: 'Q1 2024', revenue: 2100000, costs: 1450000, profit: 650000 },
           { quarter: 'Q2 2024', revenue: 2250000, costs: 1580000, profit: 670000 },
           { quarter: 'Q3 2024', revenue: 2300000, costs: 1620000, profit: 680000 },
           { quarter: 'Q4 2024', revenue: 2300000, costs: 1690000, profit: 610000 }
         ],
         expenses: [
           { category: 'Materials', amount: 3200000, percentage: 50.5 },
           { category: 'Labor', amount: 1800000, percentage: 28.4 },
           { category: 'Overhead', amount: 890000, percentage: 14.0 },
           { category: 'Marketing', amount: 450000, percentage: 7.1 }
         ]
       };

     default:
       return { error: 'Unknown report type' };
   }
 }

 // Schedule automated report
 async scheduleReport(reportConfig) {
   const scheduledReport = {
     id: `scheduled-${Date.now()}`,
     ...reportConfig,
     createdAt: new Date(),
     nextRun: this.calculateNextRun(reportConfig.schedule),
     status: 'active'
   };

   this.scheduledReports.set(scheduledReport.id, scheduledReport);
   this.emit('reports.scheduled', scheduledReport);
   
   return scheduledReport;
 }

 calculateNextRun(schedule) {
   const now = new Date();
   switch (schedule.frequency) {
     case 'daily':
       return new Date(now.getTime() + 24 * 60 * 60 * 1000);
     case 'weekly':
       return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
     case 'monthly':
       return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
     default:
       return new Date(now.getTime() + 24 * 60 * 60 * 1000);
   }
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

const ERPReportsAnalytics = () => {
 const [reportsService] = useState(() => new ERPReportsService());
 const [sapConnection, setSapConnection] = useState(null);
 const [reports, setReports] = useState([]);
 const [selectedReport, setSelectedReport] = useState(null);
 const [activeTab, setActiveTab] = useState('dashboard');
 const [generatingReports, setGeneratingReports] = useState([]);
 const [showGenerateModal, setShowGenerateModal] = useState(false);
 const [showScheduleModal, setShowScheduleModal] = useState(false);

 // Available report types
 const reportTypes = [
   {
     id: 'inventory_summary',
     name: 'Inventory Summary',
     description: 'Comprehensive inventory analysis and trends',
     icon: <Package className="w-6 h-6" />,
     color: 'blue',
     estimatedTime: '2-3 minutes'
   },
   {
     id: 'sales_performance',
     name: 'Sales Performance',
     description: 'Sales metrics, trends, and customer analysis',
     icon: <TrendingUp className="w-6 h-6" />,
     color: 'green',
     estimatedTime: '3-4 minutes'
   },
   {
     id: 'supplier_performance',
     name: 'Supplier Performance',
     description: 'Supplier metrics and delivery performance',
     icon: <Truck className="w-6 h-6" />,
     color: 'purple',
     estimatedTime: '2-3 minutes'
   },
   {
     id: 'financial_summary',
     name: 'Financial Summary',
     description: 'Financial performance and cost analysis',
     icon: <DollarSign className="w-6 h-6" />,
     color: 'yellow',
     estimatedTime: '4-5 minutes'
   }
 ];

 useEffect(() => {
   // Initialize SAP Analytics connection
   const initializeConnection = async () => {
     try {
       const connection = await reportsService.connectReportingERP({
         apiUrl: 'https://analytics.sap.company.com',
         apiKey: 'demo-key',
         version: '2024.1'
       });
       setSapConnection(connection);
     } catch (error) {
       console.error('Failed to connect to SAP Analytics:', error);
     }
   };

   initializeConnection();

   // Set up event listeners
   const handleConnectionUpdate = (connection) => {
     setSapConnection(connection);
   };

   const handleGenerationProgress = (job) => {
     setGeneratingReports(prev => {
       const updated = prev.filter(r => r.id !== job.id);
       return [...updated, job];
     });
   };

   const handleGenerationCompleted = (job) => {
     setGeneratingReports(prev => prev.filter(r => r.id !== job.id));
     setReports(prev => [job, ...prev]);
   };

   reportsService.addEventListener('reports.connection.updated', handleConnectionUpdate);
   reportsService.addEventListener('reports.generation.progress', handleGenerationProgress);
   reportsService.addEventListener('reports.generation.completed', handleGenerationCompleted);

   return () => {
     reportsService.removeEventListener('reports.connection.updated', handleConnectionUpdate);
     reportsService.removeEventListener('reports.generation.progress', handleGenerationProgress);
     reportsService.removeEventListener('reports.generation.completed', handleGenerationCompleted);
   };
 }, [reportsService]);

 const handleGenerateReport = async (reportType) => {
   try {
     const reportJob = await reportsService.generateReport(reportType, {
       dateRange: 'last_30_days',
       format: 'dashboard'
     });
     
     setShowGenerateModal(false);
   } catch (error) {
     console.error('Failed to generate report:', error);
   }
 };

 return (
   <div className="space-y-6">
     {/* Header */}
     <div className="flex justify-between items-center">
       <div>
         <h2 className="text-2xl font-bold text-gray-900">SAP Analytics & Reports</h2>
         <p className="text-gray-600 mt-1">Comprehensive reporting and business intelligence from SAP Analytics Cloud</p>
       </div>
       <div className="flex space-x-3">
         <button
           onClick={() => setShowScheduleModal(true)}
           className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
         >
           <Calendar className="w-4 h-4" />
           <span>Schedule Report</span>
         </button>
         <button 
           onClick={() => setShowGenerateModal(true)}
           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
         >
           <Plus className="w-4 h-4" />
           <span>Generate Report</span>
         </button>
       </div>
     </div>

     {/* SAP Analytics Connection Status */}
     <div className="bg-white rounded-lg shadow-sm border p-6">
       <h3 className="text-lg font-semibold text-gray-900 mb-4">SAP Analytics Cloud Connection</h3>
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
           {sapConnection.reportingCapabilities && (
             <div className="mb-3">
               <p className="text-xs text-gray-600 mb-1">Capabilities:</p>
               <div className="flex flex-wrap gap-1">
                 {sapConnection.reportingCapabilities.slice(0, 2).map((cap, index) => (
                   <span key={index} className="px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                     {cap}
                   </span>
                 ))}
               </div>
             </div>
           )}
           <button
             disabled={sapConnection.status !== 'connected'}
             onClick={() => handleGenerateReport('inventory_summary')}
             className="w-full bg-blue-50 text-blue-700 py-2 px-3 rounded text-sm hover:bg-blue-100 disabled:opacity-50"
           >
             <BarChart3 className="w-4 h-4 inline mr-1" />
             Generate Report
           </button>
         </div>
       ) : (
         <div className="text-center py-8">
           <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
           <p className="text-gray-500">Connecting to SAP Analytics Cloud...</p>
         </div>
       )}
     </div>

     {/* Rest of the component remains the same with tabs and content... */}
     {/* Active Report Generation Jobs */}
     {generatingReports.length > 0 && (
       <div className="bg-white rounded-lg shadow-sm border p-6">
         <h3 className="text-lg font-semibold text-gray-900 mb-4">Generating SAP Reports</h3>
         <div className="space-y-4">
           {generatingReports.map(job => (
             <div key={job.id} className="p-4 bg-blue-50 rounded-lg">
               <div className="flex items-center justify-between mb-2">
                 <span className="font-medium text-blue-900">
                   Generating {job.type.replace('_', ' ').toUpperCase()} from SAP Analytics...
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
                 Processed: {job.recordsProcessed.toLocaleString()} records
               </div>
             </div>
           ))}
         </div>
       </div>
     )}
   </div>
 );
};

export default ERPReportsAnalytics;