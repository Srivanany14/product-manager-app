'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Package, Home, BarChart3, Brain, ShoppingCart, Truck, 
  Warehouse, TrendingUp, Settings, X 
} from 'lucide-react';

const navigationItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/ai-forecasting', label: 'AI Forecasting', icon: Brain, featured: true },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/suppliers', label: 'Suppliers', icon: Truck },
  { href: '/warehouses', label: 'Warehouses', icon: Warehouse },
  { href: '/settings', label: 'Settings', icon: Settings }
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">InventoryPro</span>
          </div>
          
          {/* Mobile close button */}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="mt-6 px-3">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center space-x-3 px-3 py-3 mx-1 rounded-lg text-left transition-all duration-200 mb-1
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                  ${item.featured ? 'bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100' : ''}
                `}
              >
                <Icon className={`w-5 h-5 ${item.featured ? 'text-purple-600' : isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className={`font-medium ${item.featured ? 'text-purple-700' : ''}`}>
                  {item.label}
                </span>
                {item.featured && (
                  <span className="ml-auto bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <div className="text-center text-xs text-gray-500">
            <p>InventoryPro v2.0</p>
            <p className="mt-1">Powered by Time-LLM & AWS</p>
          </div>
        </div>
      </div>
    </>
  );
}