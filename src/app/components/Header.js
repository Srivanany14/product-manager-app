'use client';

import { usePathname } from 'next/navigation';
import { Bell, Menu, Search, User, ChevronDown } from 'lucide-react';

const pageSettings = {
  '/': { title: 'Dashboard', subtitle: 'Overview of your inventory performance' },
  '/products': { title: 'Products', subtitle: 'Manage your product catalog and inventory' },
  '/ai-forecasting': { title: 'AI Forecasting', subtitle: 'Powered by Time-LLM transformer model' },
  '/analytics': { title: 'Analytics', subtitle: 'Data insights and performance metrics' },
  '/orders': { title: 'Orders', subtitle: 'Manage customer orders and fulfillment' },
  '/suppliers': { title: 'Suppliers', subtitle: 'Supplier relationships and procurement' },
  '/warehouses': { title: 'Warehouses', subtitle: 'Warehouse locations and inventory' },
  '/settings': { title: 'Settings', subtitle: 'System configuration and preferences' }
};

export default function Header({ onMenuClick = () => {} }) {
  const pathname = usePathname();
  const currentPage = pageSettings[pathname] || { title: 'InventoryPro', subtitle: '' };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                {currentPage.title}
                {pathname === '/ai-forecasting' && (
                  <span className="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    Powered by Time-LLM
                  </span>
                )}
              </h1>
              {currentPage.subtitle && (
                <p className="text-sm text-gray-600 mt-1">{currentPage.subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-700">John Doe</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}