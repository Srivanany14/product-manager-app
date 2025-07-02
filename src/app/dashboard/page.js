'use client';

import Link from 'next/link';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Package, DollarSign, AlertTriangle, XCircle, TrendingUp, Upload, Brain, RefreshCw, Plus } from 'lucide-react';
import { dashboardMetrics, salesData, categoryData } from '../lib/data';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardMetrics.totalProducts.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">↗ 2.4% from last month</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inventory Value</p>
              <p className="text-3xl font-bold text-gray-900">${dashboardMetrics.totalValue.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">↗ 8.2% from last month</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-3xl font-bold text-yellow-600">{dashboardMetrics.lowStock}</p>
              <p className="text-sm text-yellow-600 mt-1">⚠ Needs attention</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600">{dashboardMetrics.outOfStock}</p>
              <p className="text-sm text-red-600 mt-1">🚨 Critical</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Forecasting Promotion */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">AI-Powered Demand Forecasting</h3>
              <p className="text-purple-100 mt-1">
                Use Time-LLM to predict demand with 90%+ accuracy and optimize your inventory levels
              </p>
            </div>
          </div>
          <Link 
            href="/ai-forecasting"
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Try AI Forecasting
          </Link>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sales Performance</h3>
              <p className="text-sm text-gray-600">7-day sales and order trends</p>
            </div>
            <Link href="/analytics" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Details →
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'sales' ? `${value.toLocaleString()}` : value.toLocaleString(),
                  name === 'sales' ? 'Sales' : 'Orders'
                ]}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.1} 
                strokeWidth={3}
              />
              <Area 
                type="monotone" 
                dataKey="orders" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.1} 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sales by Category</h3>
              <p className="text-sm text-gray-600">Revenue distribution</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${value}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {categoryData.map((category, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-gray-700">{category.name}</span>
                </div>
                <span className="font-medium text-gray-900">{category.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            href="/products"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span className="font-medium text-gray-900 block">Add Product</span>
              <span className="text-sm text-gray-500">Create new product</span>
            </div>
          </Link>

          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all group">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Upload className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <span className="font-medium text-gray-900 block">Bulk Import</span>
              <span className="text-sm text-gray-500">Upload CSV/Excel</span>
            </div>
          </button>

          <Link 
            href="/ai-forecasting"
            className="flex items-center space-x-3 p-4 border border-purple-200 bg-purple-50 rounded-lg hover:bg-purple-100 hover:border-purple-300 transition-all group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <span className="font-medium text-purple-900 block">AI Forecast</span>
              <span className="text-sm text-purple-600">Predict demand</span>
            </div>
          </Link>

          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all group">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <RefreshCw className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <span className="font-medium text-gray-900 block">Sync Data</span>
              <span className="text-sm text-gray-500">Update inventory</span>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
              <XCircle className="w-5 h-5 text-red-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Nike Air Max 270 is out of stock</p>
                <p className="text-xs text-red-600">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">MacBook Pro M3 running low (8 units)</p>
                <p className="text-xs text-yellow-600">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">iPhone 15 Pro Max demand spike detected</p>
                <p className="text-xs text-blue-600">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Products</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">iPhone 15 Pro Max</p>
                  <p className="text-xs text-gray-500">234 units sold</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-600">$279,766</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Samsung Galaxy S24</p>
                  <p className="text-xs text-gray-500">189 units sold</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-600">$245,699</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Nike Air Max 270</p>
                  <p className="text-xs text-gray-500">456 units sold</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-600">$59,275</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}