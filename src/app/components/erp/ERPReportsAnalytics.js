'use client'
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { 
  BarChart3, TrendingUp, Download, Calendar, Filter, RefreshCw, Eye, Share2,
  FileText, Activity, Clock, DollarSign, Package,
  Users, Truck, Database, Zap, Settings, Plus, Search, ArrowUpDown,
  AlertTriangle, CheckCircle, XCircle, Mail, Printer, Globe
} from 'lucide-react';

// ERP Reports Service
class ERPReportsService {
  constructor() {
    this.erpConnections = new Map();
    this.reportCache = new Map();
    this.scheduledReports = new Map();
    this.eventListeners = new Map();
  }

  // Connect to ERP for reporting
  async connectReportingERP(system, config) {
    const connection = {
      id: system,
      name: this.getERPName(system),
      status: 'connecting',
      config,
      type: 'reporting',
      lastSync: null,
      endpoints: this.getReportingEndpoints(system),
      connectedAt: null,
      reportingCapabilities: this.getReportingCapabilities(system)
    };

    this.erpConnections.set(system, connection);
    
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (Math.random() > 0.1) {
      connection.status = 'connected';
      connection.connectedAt = new Date();
    } else {
      connection.status = 'error';
      connection.error = 'Reporting API authentication failed';
    }

    this.emit('reports.connection.updated', connection);
    return connection;
  }

  // Generate report from ERP data
  async generateReport(erpSystem, reportType, parameters = {}) {
    const connection = this.erpConnections.get(erpSystem);
    if (!connection || connection.status !== 'connected') {
      throw new Error('ERP system not connected');
    }

    const reportJob = {
      id: `report-${Date.now()}`,
      erpSystem,
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
          
          // Cache the report
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

  getERPName(system) {
    const names = {
      'sap': 'SAP Analytics Cloud',
      'oracle': 'Oracle Analytics',
      'netsuite': 'NetSuite Analytics',
      'dynamics': 'Power BI / Dynamics'
    };
    return names[system] || system.toUpperCase();
  }

  getReportingEndpoints(system) {
    const endpoints = {
      'sap': {
        reports: '/api/analytics/reports',
        data: '/api/analytics/data',
        export: '/api/analytics/export'
      },
      'oracle': {
        reports: '/fscmRestApi/analytics/reports',
        data: '/fscmRestApi/analytics/data',
        export: '/fscmRestApi/analytics/export'
      },
      'netsuite': {
        reports: '/rest/analytics/reports',
        data: '/rest/analytics/data',
        export: '/rest/analytics/export'
      }
    };
    return endpoints[system] || {};
  }

  getReportingCapabilities(system) {
    const capabilities = {
      'sap': ['Real-time analytics', 'Predictive insights', 'Custom dashboards', 'AI recommendations'],
      'oracle': ['Cloud analytics', 'Machine learning', 'Advanced visualizations', 'Data storytelling'],
      'netsuite': ['Financial reporting', 'Operational analytics', 'KPI dashboards', 'Drill-down analysis'],
      'dynamics': ['Power BI integration', 'AI insights', 'Natural language queries', 'Mobile analytics']
    };
    return capabilities[system] || ['Basic reporting'];
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

// Dashboard Component
const ReportsDashboard = () => {
  const mockMetrics = [
    { title: 'Total Revenue', value: '$8.95M', change: '+12%', icon: <DollarSign className="w-6 h-6" />, color: 'green' },
    { title: 'Active Orders', value: '2,847', change: '+8%', icon: <Package className="w-6 h-6" />, color: 'blue' },
    { title: 'Suppliers', value: '189', change: '+3%', icon: <Truck className="w-6 h-6" />, color: 'purple' },
    { title: 'Report Accuracy', value: '98.7%', change: '+0.5%', icon: <CheckCircle className="w-6 h-6" />, color: 'green' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockMetrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg bg-${metric.color}-50`}>
                <div className={`text-${metric.color}-600`}>{metric.icon}</div>
              </div>
              <span className={`text-sm font-medium text-${metric.change.startsWith('+') ? 'green' : 'red'}-600`}>
                {metric.change}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
              <p className="text-gray-600">{metric.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Report Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Inventory Summary completed</p>
                <p className="text-sm text-gray-600">SAP Analytics • 2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 mr-3" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Sales Performance generating</p>
                <p className="text-sm text-gray-600">Oracle Analytics • 75% complete</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-purple-50 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600 mr-3" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Weekly Report scheduled</p>
                <p className="text-sm text-gray-600">NetSuite • Next run: Tomorrow 9:00 AM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={[
              { time: '00:00', reports: 12 },
              { time: '04:00', reports: 8 },
              { time: '08:00', reports: 24 },
              { time: '12:00', reports: 35 },
              { time: '16:00', reports: 28 },
              { time: '20:00', reports: 15 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="reports" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Reports List Component
const ReportsList = () => {
  const mockReports = [
    {
      id: 1,
      name: 'Q4 2024 Inventory Analysis',
      type: 'Inventory',
      source: 'SAP',
      date: '2024-12-28',
      status: 'completed',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: 'December Sales Performance',
      type: 'Sales',
      source: 'Oracle',
      date: '2024-12-27',
      status: 'completed',
      size: '1.8 MB'
    },
    {
      id: 3,
      name: 'Supplier Performance Review',
      type: 'Procurement',
      source: 'NetSuite',
      date: '2024-12-26',
      status: 'completed',
      size: '950 KB'
    },
    {
      id: 4,
      name: 'Financial Summary - December',
      type: 'Finance',
      source: 'Dynamics',
      date: '2024-12-25',
      status: 'completed',
      size: '3.1 MB'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Generated Reports</h3>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Report Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockReports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{report.name}</div>
                      <div className="text-sm text-gray-500">{report.size}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {report.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {report.source}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(report.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="text-purple-600 hover:text-purple-900">
                      <Share2 className="w-4 h-4" />
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
};

const ERPReportsAnalytics = () => {
  const [reportsService] = useState(() => new ERPReportsService());
  const [erpConnections, setERPConnections] = useState(new Map());
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
    // Initialize ERP connections
    const initializeConnections = async () => {
      const systems = ['sap', 'oracle', 'netsuite', 'dynamics'];
      
      for (const system of systems) {
        try {
          const connection = await reportsService.connectReportingERP(system, {
            apiUrl: `https://api.${system}.com`,
            apiKey: 'demo-key',
            version: '2024.1'
          });
          setERPConnections(prev => new Map(prev.set(system, connection)));
        } catch (error) {
          console.error(`Failed to connect to ${system}:`, error);
        }
      }
    };

    initializeConnections();

    // Set up event listeners
    const handleConnectionUpdate = (connection) => {
      setERPConnections(prev => new Map(prev.set(connection.id, connection)));
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

  const handleGenerateReport = async (reportType, erpSystem) => {
    try {
      const reportJob = await reportsService.generateReport(erpSystem, reportType, {
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
          <h2 className="text-2xl font-bold text-gray-900">ERP Reports & Analytics</h2>
          <p className="text-gray-600 mt-1">Comprehensive reporting and business intelligence from ERP systems</p>
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

      {/* ERP Connection Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ERP Analytics Connections</h3>
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
              <p className="text-sm text-gray-500 mb-2">
                {connection.status === 'connected' ? 'Connected' : 
                 connection.status === 'connecting' ? 'Connecting...' : 'Disconnected'}
              </p>
              {connection.reportingCapabilities && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-1">Capabilities:</p>
                  <div className="flex flex-wrap gap-1">
                    {connection.reportingCapabilities.slice(0, 2).map((cap, index) => (
                      <span key={index} className="px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <button
                disabled={connection.status !== 'connected'}
                onClick={() => handleGenerateReport('inventory_summary', connection.id)}
                className="w-full bg-blue-50 text-blue-700 py-2 px-3 rounded text-sm hover:bg-blue-100 disabled:opacity-50"
              >
                <BarChart3 className="w-4 h-4 inline mr-1" />
                Generate Report
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
            { id: 'reports', name: 'Report Library', icon: <FileText className="w-4 h-4" /> },
            { id: 'analytics', name: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'scheduled', name: 'Scheduled Reports', icon: <Calendar className="w-4 h-4" /> }
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
        {activeTab === 'dashboard' && <ReportsDashboard />}
        {activeTab === 'reports' && <ReportsList />}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Analytics</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Revenue Trends</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={[
                    { month: 'Jan', revenue: 120000, forecast: 115000 },
                    { month: 'Feb', revenue: 145000, forecast: 140000 },
                    { month: 'Mar', revenue: 135000, forecast: 138000 },
                    { month: 'Apr', revenue: 175000, forecast: 165000 },
                    { month: 'May', revenue: 165000, forecast: 170000 },
                    { month: 'Jun', revenue: 195000, forecast: 185000 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Actual" />
                    <Area type="monotone" dataKey="forecast" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Forecast" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Key Performance Indicators</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-900">Inventory Turnover</span>
                      <span className="text-2xl font-bold text-blue-600">4.2x</span>
                    </div>
                    <div className="mt-2 text-sm text-blue-700">+12% vs last quarter</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-900">Order Fulfillment</span>
                      <span className="text-2xl font-bold text-green-600">96.8%</span>
                    </div>
                    <div className="mt-2 text-sm text-green-700">+2.1% vs last quarter</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-purple-900">Customer Satisfaction</span>
                      <span className="text-2xl font-bold text-purple-600">4.7/5</span>
                    </div>
                    <div className="mt-2 text-sm text-purple-700">+0.3 vs last quarter</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'scheduled' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Reports</h3>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Monthly Inventory Summary</h4>
                    <p className="text-sm text-gray-500">Every 1st of the month at 9:00 AM</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>
                    <button className="text-gray-600 hover:text-gray-900">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Weekly Sales Performance</h4>
                    <p className="text-sm text-gray-500">Every Monday at 8:00 AM</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>
                    <button className="text-gray-600 hover:text-gray-900">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Report Generation Jobs */}
      {generatingReports.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generating Reports</h3>
          <div className="space-y-4">
            {generatingReports.map(job => (
              <div key={job.id} className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-900">
                    Generating {job.type.replace('_', ' ').toUpperCase()} from {job.erpSystem.toUpperCase()}...
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

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Report Details - {selectedReport.name}</h3>
              <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            {/* Report Preview */}
            {selectedReport.data && (
              <div className="space-y-6">
                {selectedReport.type === 'inventory_summary' && selectedReport.data.summary && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Inventory Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{selectedReport.data.summary.totalProducts.toLocaleString()}</p>
                        <p className="text-sm text-blue-700">Total Products</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">${(selectedReport.data.summary.totalValue / 1000000).toFixed(1)}M</p>
                        <p className="text-sm text-green-700">Total Value</p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{selectedReport.data.summary.lowStockItems}</p>
                        <p className="text-sm text-yellow-700">Low Stock Items</p>
                      </div>
                    </div>
                    
                    {selectedReport.data.categories && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">Category Breakdown</h5>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={selectedReport.data.categories}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="percentage"
                              label={({ name, percentage }) => `${name}: ${percentage}%`}
                            >
                              {selectedReport.data.categories.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 60%)`} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}

                {selectedReport.type === 'sales_performance' && selectedReport.data.summary && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Sales Performance</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">${(selectedReport.data.summary.totalRevenue / 1000000).toFixed(1)}M</p>
                        <p className="text-sm text-green-700">Total Revenue</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{selectedReport.data.summary.totalOrders.toLocaleString()}</p>
                        <p className="text-sm text-blue-700">Total Orders</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">${selectedReport.data.summary.avgOrderValue.toFixed(0)}</p>
                        <p className="text-sm text-purple-700">Avg Order Value</p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{selectedReport.data.summary.newCustomers}</p>
                        <p className="text-sm text-yellow-700">New Customers</p>
                      </div>
                    </div>

                    {selectedReport.data.monthly && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">Monthly Trends</h5>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={selectedReport.data.monthly}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue ($)" />
                            <Line type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} name="Orders" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}

                {selectedReport.type === 'supplier_performance' && selectedReport.data.summary && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Supplier Performance</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{selectedReport.data.summary.totalSuppliers}</p>
                        <p className="text-sm text-blue-700">Total Suppliers</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{selectedReport.data.summary.onTimeDeliveryRate.toFixed(1)}%</p>
                        <p className="text-sm text-green-700">On-Time Delivery</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{selectedReport.data.summary.qualityScore.toFixed(1)}%</p>
                        <p className="text-sm text-purple-700">Quality Score</p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{selectedReport.data.summary.avgDeliveryTime.toFixed(1)}</p>
                        <p className="text-sm text-yellow-700">Avg Delivery (days)</p>
                      </div>
                    </div>

                    {selectedReport.data.suppliers && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">Top Suppliers</h5>
                        <div className="space-y-3">
                          {selectedReport.data.suppliers.slice(0, 5).map((supplier, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium text-gray-900">{supplier.name}</span>
                              <div className="flex space-x-4 text-sm">
                                <span className="text-green-600">{supplier.onTime.toFixed(1)}% On-Time</span>
                                <span className="text-blue-600">{supplier.quality.toFixed(1)}% Quality</span>
                                <span className="text-purple-600">${(supplier.value / 1000).toFixed(0)}K Value</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedReport.type === 'financial_summary' && selectedReport.data.summary && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Financial Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">${(selectedReport.data.summary.totalRevenue / 1000000).toFixed(1)}M</p>
                        <p className="text-sm text-green-700">Total Revenue</p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">${(selectedReport.data.summary.totalCosts / 1000000).toFixed(1)}M</p>
                        <p className="text-sm text-red-700">Total Costs</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">${(selectedReport.data.summary.netProfit / 1000000).toFixed(1)}M</p>
                        <p className="text-sm text-blue-700">Net Profit</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{selectedReport.data.summary.profitMargin.toFixed(1)}%</p>
                        <p className="text-sm text-purple-700">Profit Margin</p>
                      </div>
                    </div>

                    {selectedReport.data.quarterly && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">Quarterly Performance</h5>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={selectedReport.data.quarterly}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="quarter" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                            <Bar dataKey="costs" fill="#EF4444" name="Costs" />
                            <Bar dataKey="profit" fill="#3B82F6" name="Profit" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setSelectedReport(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Generate New Report</h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  {reportTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ERP Source</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  {Array.from(erpConnections.values()).filter(conn => conn.status === 'connected').map(conn => (
                    <option key={conn.id} value={conn.id}>{conn.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="last_30_days">Last 30 Days</option>
                  <option value="last_quarter">Last Quarter</option>
                  <option value="last_year">Last Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="dashboard">Interactive Dashboard</option>
                  <option value="pdf">PDF Report</option>
                  <option value="excel">Excel Spreadsheet</option>
                  <option value="csv">CSV Data</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleGenerateReport('inventory_summary', 'sap')}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Report Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Schedule Automated Report</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                <input
                  type="text"
                  placeholder="e.g., Monthly Sales Summary"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  {reportTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ERP Source</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  {Array.from(erpConnections.values()).filter(conn => conn.status === 'connected').map(conn => (
                    <option key={conn.id} value={conn.id}>{conn.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  defaultValue="09:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Recipients</label>
                <input
                  type="email"
                  placeholder="email@company.com, team@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
              >
                Schedule Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ERPReportsAnalytics;