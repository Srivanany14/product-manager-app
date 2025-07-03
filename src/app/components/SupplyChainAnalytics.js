'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ComposedChart
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle, Clock,
  Calendar, Filter, Download, RefreshCw, Target, Zap, Brain, BarChart3,
  Activity, Users, ShoppingCart, Truck, MessageSquare, Sparkles, Settings,
  Play, Pause, FastForward, Database, Bot, ChevronRight, MapPin, Warehouse,
  Route, Bell, CheckCircle, XCircle, AlertCircle, Send
} from 'lucide-react';

const SupplyChainAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(false);
  const [genieQuery, setGenieQuery] = useState('');
  const [genieResponse, setGenieResponse] = useState(null);
  const [genieLoading, setGenieLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data for supply chain analytics
  const dashboardData = {
    kpis: {
      totalRevenue: 2456789,
      revenueGrowth: 12.5,
      totalOrders: 15847,
      ordersGrowth: 8.3,
      supplyChainEfficiency: 87.3,
      efficiencyGrowth: 5.2,
      onTimeDelivery: 92.1,
      deliveryGrowth: 3.1,
      inventoryTurnover: 4.2,
      turnoverGrowth: -2.1,
      avgOrderValue: 155.23,
      avgOrderGrowth: 3.8
    },
    
    supplyChainMetrics: [
      { date: 'Jan', efficiency: 82.1, onTime: 88.5, costs: 125000, disruptions: 12 },
      { date: 'Feb', efficiency: 84.3, onTime: 89.2, costs: 118000, disruptions: 8 },
      { date: 'Mar', efficiency: 86.7, onTime: 91.1, costs: 115000, disruptions: 6 },
      { date: 'Apr', efficiency: 85.2, onTime: 90.3, costs: 120000, disruptions: 9 },
      { date: 'May', efficiency: 88.1, onTime: 92.8, costs: 112000, disruptions: 4 },
      { date: 'Jun', efficiency: 87.3, onTime: 92.1, costs: 114000, disruptions: 5 }
    ],

    inventoryOptimization: [
      { location: 'Warehouse A', current: 85000, optimal: 78000, savings: 7000, status: 'over' },
      { location: 'Warehouse B', current: 62000, optimal: 65000, savings: -3000, status: 'under' },
      { location: 'Warehouse C', current: 94000, optimal: 92000, savings: 2000, status: 'optimal' },
      { location: 'Distribution Hub', current: 156000, optimal: 148000, savings: 8000, status: 'over' }
    ],

    timeLLMForecasts: [
      { date: 'Jul', actual: null, predicted: 285000, confidence: 0.94, lower: 265000, upper: 305000 },
      { date: 'Aug', actual: null, predicted: 295000, confidence: 0.91, lower: 270000, upper: 320000 },
      { date: 'Sep', actual: null, predicted: 310000, confidence: 0.89, lower: 280000, upper: 340000 },
      { date: 'Oct', actual: null, predicted: 275000, confidence: 0.85, lower: 245000, upper: 305000 },
      { date: 'Nov', actual: null, predicted: 320000, confidence: 0.88, lower: 285000, upper: 355000 },
      { date: 'Dec', actual: null, predicted: 380000, confidence: 0.92, lower: 335000, upper: 425000 }
    ],

    historicalData: [
      { date: 'Jan', actual: 180000, predicted: null },
      { date: 'Feb', actual: 195000, predicted: null },
      { date: 'Mar', actual: 220000, predicted: null },
      { date: 'Apr', actual: 210000, predicted: null },
      { date: 'May', actual: 245000, predicted: null },
      { date: 'Jun', actual: 268000, predicted: null }
    ],

    supplierPerformance: [
      { name: 'Supplier Alpha', onTime: 94.2, quality: 97.1, cost: 85000, risk: 'low' },
      { name: 'Supplier Beta', onTime: 87.5, quality: 92.3, cost: 72000, risk: 'medium' },
      { name: 'Supplier Gamma', onTime: 91.8, quality: 95.7, cost: 94000, risk: 'low' },
      { name: 'Supplier Delta', onTime: 78.2, quality: 88.9, cost: 58000, risk: 'high' }
    ],

    routeOptimization: [
      { route: 'Route A-1', current: 245, optimized: 198, savings: 47, efficiency: 80.8 },
      { route: 'Route B-2', current: 189, optimized: 156, savings: 33, efficiency: 82.5 },
      { route: 'Route C-3', current: 312, optimized: 278, savings: 34, efficiency: 89.1 },
      { route: 'Route D-4', current: 198, optimized: 167, savings: 31, efficiency: 84.3 }
    ]
  };

  const colors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#6366F1',
    success: '#10B981',
    purple: '#8B5CF6'
  };

  // Simulate Databricks Genie AI responses
  const handleGenieQuery = async () => {
    if (!genieQuery.trim()) return;
    
    setGenieLoading(true);
    
    // Simulate API call to Databricks Genie
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const responses = {
      'inventory': {
        insight: "Current inventory levels show 15% excess in electronics and 8% shortage in home goods. TimeLLM predicts seasonal surge in Q4. Recommend rebalancing stock between warehouses A and B.",
        confidence: 0.91,
        actionable: true,
        recommendations: [
          "Transfer 12,000 units from Warehouse A to B",
          "Increase home goods procurement by 25%",
          "Launch electronics promotion to clear excess stock"
        ]
      },
      'demand': {
        insight: "TimeLLM analysis shows 23% demand increase for December with 94% confidence. Current capacity will be exceeded. Supply chain bottleneck identified in logistics.",
        confidence: 0.94,
        actionable: true,
        recommendations: [
          "Scale logistics capacity by 30% before November",
          "Negotiate flexible contracts with 2 backup suppliers",
          "Implement dynamic pricing for peak demand periods"
        ]
      },
      'efficiency': {
        insight: "Route optimization algorithms suggest 18% cost reduction possible. Current supplier Delta shows declining performance (78.2% on-time delivery).",
        confidence: 0.87,
        actionable: true,
        recommendations: [
          "Implement AI-optimized routing for all delivery trucks",
          "Review contract with Supplier Delta or find alternative",
          "Consolidate shipments from same geographic regions"
        ]
      },
      'default': {
        insight: "Supply chain efficiency is at 87.3% with opportunities for improvement in inventory management and route optimization. TimeLLM forecasts show strong Q4 demand requiring capacity planning.",
        confidence: 0.85,
        actionable: true,
        recommendations: [
          "Focus on inventory optimization initiatives",
          "Prepare for Q4 capacity scaling",
          "Review supplier performance metrics"
        ]
      }
    };

    // Determine response based on query content
    let responseKey = 'default';
    if (genieQuery.toLowerCase().includes('inventory')) responseKey = 'inventory';
    else if (genieQuery.toLowerCase().includes('demand') || genieQuery.toLowerCase().includes('forecast')) responseKey = 'demand';
    else if (genieQuery.toLowerCase().includes('efficiency') || genieQuery.toLowerCase().includes('optimize')) responseKey = 'efficiency';

    setGenieResponse(responses[responseKey]);
    setGenieLoading(false);
  };

  const formatCurrency = (value) => `$${value.toLocaleString()}`;
  const formatNumber = (value) => value.toLocaleString();
  const formatPercentage = (value) => `${value.toFixed(1)}%`;

  const getGrowthColor = (growth) => growth >= 0 ? 'text-green-600' : 'text-red-600';
  const getGrowthIcon = (growth) => growth >= 0 ? 
    <TrendingUp className="w-4 h-4 text-green-500" /> : 
    <TrendingDown className="w-4 h-4 text-red-500" />;

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal': return 'bg-green-100 text-green-800';
      case 'over': return 'bg-red-100 text-red-800';
      case 'under': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Combined chart data for TimeLLM predictions
  const combinedForecastData = [
    ...dashboardData.historicalData,
    ...dashboardData.timeLLMForecasts
  ];

  // KPI Cards Component
  const KPICards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[
        { 
          title: 'Supply Chain Efficiency', 
          value: formatPercentage(dashboardData.kpis.supplyChainEfficiency), 
          growth: dashboardData.kpis.efficiencyGrowth,
          icon: <Activity className="w-6 h-6" />,
          color: 'text-blue-600'
        },
        { 
          title: 'On-Time Delivery', 
          value: formatPercentage(dashboardData.kpis.onTimeDelivery), 
          growth: dashboardData.kpis.deliveryGrowth,
          icon: <Truck className="w-6 h-6" />,
          color: 'text-green-600'
        },
        { 
          title: 'Inventory Turnover', 
          value: dashboardData.kpis.inventoryTurnover.toFixed(1), 
          growth: dashboardData.kpis.turnoverGrowth,
          icon: <Package className="w-6 h-6" />,
          color: 'text-purple-600'
        },
        { 
          title: 'Total Revenue', 
          value: formatCurrency(dashboardData.kpis.totalRevenue), 
          growth: dashboardData.kpis.revenueGrowth,
          icon: <DollarSign className="w-6 h-6" />,
          color: 'text-indigo-600'
        }
      ].map((kpi, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-6 border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg bg-gray-50 ${kpi.color}`}>
              {kpi.icon}
            </div>
            <div className="flex items-center space-x-1">
              {getGrowthIcon(kpi.growth)}
              <span className={`text-sm font-medium ${getGrowthColor(kpi.growth)}`}>
                {kpi.growth > 0 ? '+' : ''}{formatPercentage(kpi.growth)}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">{kpi.title}</p>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
          </div>
        </div>
      ))}
    </div>
  );

  // Databricks Genie AI Chat Interface
  const GenieInterface = () => (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6 mb-8">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Brain className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-purple-900">Databricks AI/BI Genie</h3>
          <p className="text-sm text-purple-700">Ask questions about your supply chain in natural language</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={genieQuery}
            onChange={(e) => setGenieQuery(e.target.value)}
            placeholder="e.g., 'How can I optimize inventory levels?' or 'Predict demand for next quarter'"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleGenieQuery()}
          />
          <button
            onClick={handleGenieQuery}
            disabled={genieLoading || !genieQuery.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {genieLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Ask Genie</span>
          </button>
        </div>
      </div>

      {genieResponse && (
        <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
          <div className="flex items-start space-x-3">
            <Bot className="w-5 h-5 text-purple-600 mt-1" />
            <div className="flex-1">
              <p className="text-gray-900 mb-3">{genieResponse.insight}</p>
              
              <div className="flex items-center space-x-4 mb-3">
                <span className="text-sm text-gray-600">
                  Confidence: <span className="font-medium">{formatPercentage(genieResponse.confidence * 100)}</span>
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  genieResponse.actionable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {genieResponse.actionable ? 'Actionable' : 'Informational'}
                </span>
              </div>

              {genieResponse.recommendations && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recommended Actions:</h4>
                  <ul className="space-y-1">
                    {genieResponse.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <ChevronRight className="w-4 h-4 text-purple-500 mt-0.5" />
                        <span className="text-sm text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        {[
          'Optimize inventory levels',
          'Predict Q4 demand',
          'Improve supply chain efficiency',
          'Analyze supplier performance'
        ].map((suggestion, index) => (
          <button
            key={index}
            onClick={() => setGenieQuery(suggestion)}
            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );

  // TimeLLM Forecast Chart
  const TimeLLMForecastChart = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 border">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">TimeLLM Demand Forecasting</h3>
          <p className="text-sm text-gray-600">AI-powered time series predictions with confidence intervals</p>
        </div>
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <span className="text-sm font-medium text-gray-700">TimeLLM Active</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={combinedForecastData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => [
              formatCurrency(value),
              name === 'actual' ? 'Historical' : name === 'predicted' ? 'TimeLLM Forecast' : name
            ]}
          />
          <Legend />
          
          <Area
            type="monotone"
            dataKey="upper"
            fill={colors.info}
            fillOpacity={0.1}
            stroke="none"
          />
          <Area
            type="monotone"
            dataKey="lower"
            fill={colors.info}
            fillOpacity={0.1}
            stroke="none"
          />
          
          <Line
            type="monotone"
            dataKey="actual"
            stroke={colors.primary}
            strokeWidth={3}
            dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
          />
          
          <Line
            type="monotone"
            dataKey="predicted"
            stroke={colors.info}
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={{ fill: colors.info, strokeWidth: 2, r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Peak Forecast</span>
          </div>
          <p className="text-lg font-bold text-blue-900">$380K</p>
          <p className="text-xs text-blue-700">December 2024</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Target className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">Avg Confidence</span>
          </div>
          <p className="text-lg font-bold text-green-900">89.5%</p>
          <p className="text-xs text-green-700">High accuracy</p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Anomaly Alert</span>
          </div>
          <p className="text-lg font-bold text-purple-900">Oct 2024</p>
          <p className="text-xs text-purple-700">Demand dip predicted</p>
        </div>
      </div>
    </div>
  );

  // Supply Chain Metrics Chart
  const SupplyChainMetricsChart = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 border">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Supply Chain Performance</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={dashboardData.supplyChainMetrics}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip 
            formatter={(value, name) => [
              name === 'costs' ? formatCurrency(value) : 
              name === 'efficiency' || name === 'onTime' ? formatPercentage(value) : value,
              name.charAt(0).toUpperCase() + name.slice(1)
            ]}
          />
          <Legend />
          
          <Bar yAxisId="left" dataKey="efficiency" fill={colors.primary} name="Efficiency %" />
          <Bar yAxisId="left" dataKey="onTime" fill={colors.secondary} name="On-Time %" />
          <Line yAxisId="right" type="monotone" dataKey="disruptions" stroke={colors.danger} strokeWidth={2} name="Disruptions" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  // Inventory Optimization Table
  const InventoryOptimizationTable = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 border">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Inventory Optimization</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Optimal</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Savings</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {dashboardData.inventoryOptimization.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <Warehouse className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="font-medium text-gray-900">{item.location}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-gray-900">{formatCurrency(item.current)}</td>
                <td className="px-4 py-4 text-gray-900">{formatCurrency(item.optimal)}</td>
                <td className="px-4 py-4">
                  <span className={`font-medium ${item.savings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.savings > 0 ? '+' : ''}{formatCurrency(Math.abs(item.savings))}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Supplier Performance Chart
  const SupplierPerformanceChart = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 border">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Supplier Performance Analysis</h3>
      
      <div className="space-y-4">
        {dashboardData.supplierPerformance.map((supplier, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{supplier.name}</h4>
                <p className="text-sm text-gray-600">Monthly Cost: {formatCurrency(supplier.cost)}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(supplier.risk)}`}>
                {supplier.risk.toUpperCase()} RISK
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">On-Time Delivery</span>
                  <span className="text-sm font-medium">{formatPercentage(supplier.onTime)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${supplier.onTime}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Quality Score</span>
                  <span className="text-sm font-medium">{formatPercentage(supplier.quality)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${supplier.quality}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supply Chain Analytics</h1>
          <p className="text-gray-600">Powered by Databricks AI/BI Genie & TimeLLM</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span>Sync Data</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Databricks Genie Interface */}
      <GenieInterface />

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="xl:col-span-2">
          <TimeLLMForecastChart />
        </div>
        
        <SupplyChainMetricsChart />
        <InventoryOptimizationTable />
        
        <div className="xl:col-span-2">
          <SupplierPerformanceChart />
        </div>
      </div>

      {/* Route Optimization Summary */}
     <div className="bg-white rounded-lg shadow-sm p-6 border">
       <h3 className="text-lg font-semibold text-gray-900 mb-6">Route Optimization Results</h3>
       
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {dashboardData.routeOptimization.map((route, index) => (
           <div key={index} className="p-4 bg-gray-50 rounded-lg">
             <div className="flex items-center justify-between mb-3">
               <div className="flex items-center space-x-2">
                 <Route className="w-5 h-5 text-blue-600" />
                 <span className="font-medium text-gray-900">{route.route}</span>
               </div>
               <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                 route.efficiency > 85 ? 'bg-green-100 text-green-800' : 
                 route.efficiency > 75 ? 'bg-yellow-100 text-yellow-800' : 
                 'bg-red-100 text-red-800'
               }`}>
                 {formatPercentage(route.efficiency)}
               </span>
             </div>
             
             <div className="space-y-2">
               <div className="flex justify-between text-sm">
                 <span className="text-gray-600">Current Cost:</span>
                 <span className="font-medium">{formatCurrency(route.current)}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-gray-600">Optimized:</span>
                 <span className="font-medium text-green-600">{formatCurrency(route.optimized)}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-gray-600">Savings:</span>
                 <span className="font-medium text-green-600">+{formatCurrency(route.savings)}</span>
               </div>
             </div>
           </div>
         ))}
       </div>
       
       <div className="mt-6 p-4 bg-blue-50 rounded-lg">
         <div className="flex items-center space-x-3">
           <Zap className="w-6 h-6 text-blue-600" />
           <div>
             <h4 className="font-medium text-blue-900">Total Optimization Impact</h4>
             <p className="text-sm text-blue-700">
               Combined route optimization can save <span className="font-bold">{formatCurrency(145000)}</span> annually 
               and improve average efficiency to <span className="font-bold">84.2%</span>
             </p>
           </div>
         </div>
       </div>
     </div>

     {/* Real-time Alerts */}
     <div className="bg-white rounded-lg shadow-sm p-6 border">
       <h3 className="text-lg font-semibold text-gray-900 mb-6">Real-time Supply Chain Alerts</h3>
       
       <div className="space-y-4">
         <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
           <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
           <div className="flex-1">
             <h4 className="font-medium text-red-900">High Priority: Supplier Delta Performance</h4>
             <p className="text-sm text-red-700 mt-1">
               On-time delivery dropped to 78.2% (below 85% threshold). Quality scores also declining. 
               Recommend immediate supplier review.
             </p>
             <div className="flex space-x-2 mt-2">
               <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">
                 Contact Supplier
               </button>
               <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">
                 Find Alternatives
               </button>
             </div>
           </div>
         </div>
         
         <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
           <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
           <div className="flex-1">
             <h4 className="font-medium text-yellow-900">Medium Priority: Inventory Imbalance</h4>
             <p className="text-sm text-yellow-700 mt-1">
               Warehouse A has 15% excess electronics inventory while Warehouse B shows shortages. 
               TimeLLM suggests rebalancing within 2 weeks.
             </p>
             <div className="flex space-x-2 mt-2">
               <button className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200">
                 Schedule Transfer
               </button>
               <button className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200">
                 View Details
               </button>
             </div>
           </div>
         </div>
         
         <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
           <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
           <div className="flex-1">
             <h4 className="font-medium text-green-900">Success: Route Optimization Deployed</h4>
             <p className="text-sm text-green-700 mt-1">
               AI-optimized routing for Routes A-1 and C-3 successfully implemented. 
               Early results show 12% cost reduction and improved delivery times.
             </p>
             <div className="flex space-x-2 mt-2">
               <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200">
                 View Metrics
               </button>
             </div>
           </div>
         </div>
       </div>
     </div>

     {/* Footer with Model Information */}
     <div className="bg-white rounded-lg shadow-sm p-6 border">
       <div className="flex items-center justify-between">
         <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-2">
             <Database className="w-5 h-5 text-blue-600" />
             <span className="text-sm font-medium text-gray-900">Databricks AI/BI Genie</span>
             <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Active</span>
           </div>
           
           <div className="flex items-center space-x-2">
             <Brain className="w-5 h-5 text-purple-600" />
             <span className="text-sm font-medium text-gray-900">TimeLLM Model</span>
             <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">v2.1</span>
           </div>
         </div>
         
         <div className="flex items-center space-x-4 text-sm text-gray-600">
           <span>Last Updated: {new Date().toLocaleString()}</span>
           <span>•</span>
           <span>Data Sources: 12 Active</span>
           <span>•</span>
           <span>Model Accuracy: 89.5%</span>
         </div>
       </div>
     </div>
   </div>
 );
};

export default SupplyChainAnalytics;