'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter,
  RadialBarChart, RadialBar, ComposedChart
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle, Clock,
  Calendar, Filter, Download, RefreshCw, Target, Zap, Brain, BarChart3,
  Activity, Users, ShoppingCart, Truck
} from 'lucide-react';

const AdvancedAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [forecastMode, setForecastMode] = useState(false);

  // Sample comprehensive analytics data
  const [dashboardData] = useState({
    kpis: {
      totalRevenue: 2456789,
      revenueGrowth: 12.5,
      totalOrders: 15847,
      ordersGrowth: 8.3,
      avgOrderValue: 155.23,
      avgOrderGrowth: 3.8,
      inventoryTurnover: 4.2,
      turnoverGrowth: -2.1,
      grossMargin: 34.7,
      marginGrowth: 1.2,
      customerSatisfaction: 94.3,
      satisfactionGrowth: 2.1
    },
    
    revenueData: [
      { date: '2024-01', revenue: 180000, orders: 1200, customers: 890 },
      { date: '2024-02', revenue: 195000, orders: 1350, customers: 920 },
      { date: '2024-03', revenue: 220000, orders: 1480, customers: 1050 },
      { date: '2024-04', revenue: 210000, orders: 1420, customers: 980 },
      { date: '2024-05', revenue: 245000, orders: 1680, customers: 1180 },
      { date: '2024-06', revenue: 268000, orders: 1820, customers: 1250 }
    ],

    productPerformance: [
      { category: 'Electronics', revenue: 1200000, margin: 28.5, growth: 15.2, items: 234 },
      { category: 'Clothing', revenue: 680000, margin: 42.1, growth: 8.7, items: 156 },
      { category: 'Home & Garden', revenue: 420000, margin: 38.9, growth: 12.3, items: 89 },
      { category: 'Health & Beauty', revenue: 156000, margin: 51.2, growth: 22.1, items: 67 }
    ],

    inventoryMetrics: [
      { month: 'Jan', turnover: 3.8, daysOnHand: 95, stockouts: 12 },
      { month: 'Feb', turnover: 4.1, daysOnHand: 89, stockouts: 8 },
      { month: 'Mar', turnover: 4.3, daysOnHand: 85, stockouts: 6 },
      { month: 'Apr', turnover: 4.0, daysOnHand: 91, stockouts: 10 },
      { month: 'May', turnover: 4.5, daysOnHand: 81, stockouts: 4 },
      { month: 'Jun', turnover: 4.2, daysOnHand: 87, stockouts: 7 }
    ],

    topProducts: [
      { name: 'iPhone 15 Pro', revenue: 340000, units: 284, margin: 22.1 },
      { name: 'Samsung Galaxy S24', revenue: 285000, units: 219, margin: 25.3 },
      { name: 'MacBook Pro M3', revenue: 420000, units: 210, margin: 18.7 },
      { name: 'Nike Air Max', revenue: 156000, units: 1200, margin: 45.2 },
      { name: 'Sony Headphones', revenue: 98000, units: 245, margin: 38.9 }
    ],

    forecastData: [
      { date: '2024-07', predicted: 285000, confidence: 0.89, lower: 265000, upper: 305000 },
      { date: '2024-08', predicted: 295000, confidence: 0.85, lower: 270000, upper: 320000 },
      { date: '2024-09', predicted: 310000, confidence: 0.82, lower: 280000, upper: 340000 },
      { date: '2024-10', predicted: 275000, confidence: 0.78, lower: 245000, upper: 305000 },
      { date: '2024-11', predicted: 320000, confidence: 0.75, lower: 285000, upper: 355000 },
      { date: '2024-12', predicted: 380000, confidence: 0.72, lower: 335000, upper: 425000 }
    ],

    customerSegments: [
      { segment: 'High Value', customers: 1250, revenue: 890000, avgOrder: 712, color: '#3B82F6' },
      { segment: 'Regular', customers: 3200, revenue: 980000, avgOrder: 306, color: '#10B981' },
      { segment: 'Occasional', customers: 2100, revenue: 420000, avgOrder: 200, color: '#F59E0B' },
      { segment: 'New', customers: 890, revenue: 167000, avgOrder: 188, color: '#EF4444' }
    ]
  });

  const colors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#6366F1',
    success: '#10B981'
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // In real app, this would fetch from API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setAnalyticsData(dashboardData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => `$${value.toLocaleString()}`;
  const formatNumber = (value) => value.toLocaleString();
  const formatPercentage = (value) => `${value.toFixed(1)}%`;

  const getGrowthColor = (growth) => growth >= 0 ? 'text-green-600' : 'text-red-600';
  const getGrowthIcon = (growth) => growth >= 0 ? 
    <TrendingUp className="w-4 h-4 text-green-500" /> : 
    <TrendingDown className="w-4 h-4 text-red-500" />;

  // Loading component
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // KPI Cards Component
  const KPICards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {[
        { 
          title: 'Total Revenue', 
          value: formatCurrency(analyticsData.kpis.totalRevenue), 
          growth: analyticsData.kpis.revenueGrowth,
          icon: <DollarSign className="w-6 h-6" />,
          color: 'text-green-600'
        },
        { 
          title: 'Total Orders', 
          value: formatNumber(analyticsData.kpis.totalOrders), 
          growth: analyticsData.kpis.ordersGrowth,
          icon: <ShoppingCart className="w-6 h-6" />,
          color: 'text-blue-600'
        },
        { 
          title: 'Avg Order Value', 
          value: formatCurrency(analyticsData.kpis.avgOrderValue), 
          growth: analyticsData.kpis.avgOrderGrowth,
          icon: <Target className="w-6 h-6" />,
          color: 'text-purple-600'
        },
        { 
          title: 'Inventory Turnover', 
          value: analyticsData.kpis.inventoryTurnover.toFixed(1), 
          growth: analyticsData.kpis.turnoverGrowth,
          icon: <RefreshCw className="w-6 h-6" />,
          color: 'text-orange-600'
        },
        { 
          title: 'Gross Margin', 
          value: formatPercentage(analyticsData.kpis.grossMargin), 
          growth: analyticsData.kpis.marginGrowth,
          icon: <TrendingUp className="w-6 h-6" />,
          color: 'text-indigo-600'
        },
        { 
          title: 'Customer Satisfaction', 
          value: formatPercentage(analyticsData.kpis.customerSatisfaction), 
          growth: analyticsData.kpis.satisfactionGrowth,
          icon: <Users className="w-6 h-6" />,
          color: 'text-pink-600'
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

  // Revenue Trend Chart
  const RevenueTrendChart = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setForecastMode(!forecastMode)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              forecastMode ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Brain className="w-4 h-4 inline mr-1" />
            Forecast
          </button>
          <button
            onClick={() => setComparisonMode(!comparisonMode)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              comparisonMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-1" />
            Compare
          </button>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={[...analyticsData.revenueData, ...(forecastMode ? analyticsData.forecastData : [])]}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => [
              name === 'revenue' || name === 'predicted' ? formatCurrency(value) : value,
              name.charAt(0).toUpperCase() + name.slice(1)
            ]}
          />
          <Legend />
          
          <Area
            type="monotone"
            dataKey="revenue"
            fill={colors.primary}
            fillOpacity={0.1}
            stroke={colors.primary}
            strokeWidth={2}
          />
          
          {comparisonMode && (
            <Bar dataKey="orders" fill={colors.secondary} opacity={0.6} />
          )}
          
          {forecastMode && (
            <>
              <Line
                type="monotone"
                dataKey="predicted"
                stroke={colors.accent}
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={{ fill: colors.accent }}
              />
              <Area
                type="monotone"
                dataKey="upper"
                fill={colors.accent}
                fillOpacity={0.1}
                stroke="none"
              />
              <Area
                type="monotone"
                dataKey="lower"
                fill={colors.accent}
                fillOpacity={0.1}
                stroke="none"
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  // Product Performance Chart
  const ProductPerformanceChart = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 border">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Product Category Performance</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={analyticsData.productPerformance}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => [
              name === 'revenue' ? formatCurrency(value) : 
              name === 'margin' || name === 'growth' ? formatPercentage(value) : value,
              name.charAt(0).toUpperCase() + name.slice(1)
            ]}
          />
          <Legend />
          <Bar dataKey="revenue" fill={colors.primary} />
          <Bar dataKey="margin" fill={colors.secondary} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  // Inventory Metrics Chart
  const InventoryMetricsChart = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 border">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Inventory Performance</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={analyticsData.inventoryMetrics}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          
          <Bar yAxisId="left" dataKey="turnover" fill={colors.primary} />
          <Line yAxisId="right" type="monotone" dataKey="daysOnHand" stroke={colors.secondary} strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey="stockouts" stroke={colors.danger} strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  // Top Products Table
  const TopProductsTable = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 border">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Products</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units Sold</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {analyticsData.topProducts.map((product, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <Package className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="font-medium text-gray-900">{product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-gray-900 font-medium">{formatCurrency(product.revenue)}</td>
                <td className="px-4 py-4 text-gray-600">{formatNumber(product.units)}</td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.margin > 30 ? 'bg-green-100 text-green-800' : 
                    product.margin > 20 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {formatPercentage(product.margin)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Customer Segments Chart
  const CustomerSegmentsChart = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 border">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Segments</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={analyticsData.customerSegments}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="customers"
              label={({ segment, customers }) => `${segment}: ${customers}`}
            >
              {analyticsData.customerSegments.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatNumber(value)} />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="space-y-4">
          {analyticsData.customerSegments.map((segment, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: segment.color }}></div>
                <span className="font-medium">{segment.segment}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{formatCurrency(segment.revenue)}</div>
                <div className="text-xs text-gray-500">{formatCurrency(segment.avgOrder)} avg</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // AI Insights Panel
  const AIInsightsPanel = () => (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Brain className="w-6 h-6 text-purple-600" />
        <h3 className="text-lg font-semibold text-purple-900">AI-Powered Insights</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h4 className="font-medium text-gray-900">Revenue Opportunity</h4>
          </div>
          <p className="text-sm text-gray-600 mb-2">Electronics category shows 15.2% growth. Consider expanding premium product lines.</p>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">High Confidence</span>
        </div>
        
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h4 className="font-medium text-gray-900">Inventory Alert</h4>
          </div>
          <p className="text-sm text-gray-600 mb-2">Inventory turnover declining. Optimize stock levels for slow-moving items.</p>
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Medium Confidence</span>
        </div>
        
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <h4 className="font-medium text-gray-900">Customer Retention</h4>
          </div>
          <p className="text-sm text-gray-600 mb-2">High-value customers driving 36% of revenue. Focus on retention programs.</p>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">High Confidence</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
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
          
          <button
            onClick={loadAnalyticsData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* AI Insights */}
      <AIInsightsPanel />

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="xl:col-span-2">
          <RevenueTrendChart />
        </div>
        
        <ProductPerformanceChart />
        <InventoryMetricsChart />
        
        <TopProductsTable />
        <CustomerSegmentsChart />
      </div>
    </div>
  );
};

export default AdvancedAnalytics;