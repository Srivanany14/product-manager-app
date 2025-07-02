'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Globe, Zap, RefreshCw, CheckCircle, XCircle, AlertTriangle,
  TrendingUp, Package, DollarSign, Users, BarChart3, Settings, Play, Pause,
  ArrowUpDown, Download, Upload, Eye, Edit, Link, Activity, Clock
} from 'lucide-react';

// E-commerce Integration Service
class EcommerceIntegrationService {
  constructor() {
    this.platforms = new Map();
    this.syncSchedules = new Map();
    this.webhookHandlers = new Map();
    this.eventListeners = new Map();
  }

  // Shopify Integration
  async connectShopify(config) {
    try {
      const platform = {
        type: 'SHOPIFY',
        shopName: config.shopName,
        accessToken: config.accessToken,
        apiVersion: config.apiVersion || '2023-10',
        baseUrl: `https://${config.shopName}.myshopify.com/admin/api/${config.apiVersion || '2023-10'}`,
        status: 'connecting',
        features: ['Product sync', 'Order management', 'Inventory tracking', 'Customer data']
      };

      await this.simulateConnection(platform);

      // Setup Shopify API endpoints
      platform.endpoints = {
        products: '/products.json',
        variants: '/variants.json',
        inventory_levels: '/inventory_levels.json',
        orders: '/orders.json',
        customers: '/customers.json',
        webhooks: '/webhooks.json'
      };

      platform.headers = {
        'X-Shopify-Access-Token': config.accessToken,
        'Content-Type': 'application/json'
      };

      // Setup real-time sync capabilities
      await this.setupShopifyWebhooks(platform);

      this.platforms.set('shopify', platform);
      return { success: true, platform };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // WooCommerce Integration
  async connectWooCommerce(config) {
    try {
      const platform = {
        type: 'WOOCOMMERCE',
        siteUrl: config.siteUrl,
        consumerKey: config.consumerKey,
        consumerSecret: config.consumerSecret,
        baseUrl: `${config.siteUrl}/wp-json/wc/v3`,
        status: 'connecting',
        features: ['Product catalog', 'Stock levels', 'Order processing', 'Customer management']
      };

      await this.simulateConnection(platform);

      // Setup WooCommerce REST API endpoints
      platform.endpoints = {
        products: '/products',
        orders: '/orders',
        customers: '/customers',
        inventory: '/products?status=publish',
        categories: '/products/categories'
      };

      // Basic Auth for WooCommerce
      platform.auth = btoa(`${config.consumerKey}:${config.consumerSecret}`);
      platform.headers = {
        'Authorization': `Basic ${platform.auth}`,
        'Content-Type': 'application/json'
      };

      this.platforms.set('woocommerce', platform);
      return { success: true, platform };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Amazon Seller Central Integration
  async connectAmazon(config) {
    try {
      const platform = {
        type: 'AMAZON_SP',
        sellerId: config.sellerId,
        marketplaceId: config.marketplaceId,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        refreshToken: config.refreshToken,
        region: config.region || 'us-east-1',
        baseUrl: 'https://sellingpartnerapi-na.amazon.com',
        status: 'connecting',
        features: ['FBA inventory', 'Order fulfillment', 'Reporting', 'Advertising data']
      };

      await this.simulateConnection(platform);

      // Setup Amazon SP-API endpoints
      platform.endpoints = {
        inventory: '/fba/inventory/v1/summaries',
        orders: '/orders/v0/orders',
        products: '/catalog/v0/items',
        fulfillment: '/fba/inventory/v1/summaries',
        reports: '/reports/2021-06-30/reports',
        feeds: '/feeds/2021-06-30/feeds'
      };

      // OAuth 2.0 for Amazon SP-API
      platform.accessToken = await this.getAmazonAccessToken(config);

      this.platforms.set('amazon', platform);
      return { success: true, platform };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Magento Integration
  async connectMagento(config) {
    try {
      const platform = {
        type: 'MAGENTO',
        baseUrl: config.baseUrl,
        accessToken: config.accessToken,
        version: config.version || '2.4',
        apiPath: '/rest/V1',
        status: 'connecting',
        features: ['Multi-store', 'Advanced inventory', 'B2B features', 'Custom attributes']
      };

      await this.simulateConnection(platform);

      // Setup Magento REST API endpoints
      platform.endpoints = {
        products: '/products',
        orders: '/orders',
        customers: '/customers',
        inventory: '/stockItems',
        categories: '/categories'
      };

      platform.headers = {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      };

      this.platforms.set('magento', platform);
      return { success: true, platform };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // eBay Integration
  async connectEBay(config) {
    try {
      const platform = {
        type: 'EBAY',
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        accessToken: config.accessToken,
        environment: config.environment || 'production',
        baseUrl: config.environment === 'sandbox' 
          ? 'https://api.sandbox.ebay.com' 
          : 'https://api.ebay.com',
        status: 'connecting',
        features: ['Listing management', 'Order sync', 'Inventory tracking', 'Store integration']
      };

      await this.simulateConnection(platform);

      // Setup eBay API endpoints
      platform.endpoints = {
        inventory: '/sell/inventory/v1/inventory_item',
        orders: '/sell/fulfillment/v1/order',
        listings: '/sell/inventory/v1/listing',
        offers: '/sell/inventory/v1/offer'
      };

      this.platforms.set('ebay', platform);
      return { success: true, platform };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // BigCommerce Integration
  async connectBigCommerce(config) {
    try {
      const platform = {
        type: 'BIGCOMMERCE',
        storeHash: config.storeHash,
        accessToken: config.accessToken,
        clientId: config.clientId,
        baseUrl: `https://api.bigcommerce.com/stores/${config.storeHash}/v3`,
        status: 'connecting',
        features: ['Headless commerce', 'Multi-channel', 'Advanced SEO', 'B2B edition']
      };

      await this.simulateConnection(platform);

      platform.endpoints = {
        products: '/catalog/products',
        orders: '/orders',
        customers: '/customers',
        inventory: '/catalog/products?include=inventory_level'
      };

      platform.headers = {
        'X-Auth-Token': config.accessToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      this.platforms.set('bigcommerce', platform);
      return { success: true, platform };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Product Synchronization Methods
  async syncProducts(platformId, direction = 'bidirectional') {
    const platform = this.platforms.get(platformId);
    if (!platform) throw new Error('Platform not connected');

    const syncProcess = {
      id: `sync-${Date.now()}`,
      platformId,
      type: 'products',
      direction,
      status: 'running',
      progress: 0,
      startTime: new Date(),
      stats: {
        total: 0,
        processed: 0,
        created: 0,
        updated: 0,
        errors: 0
      }
    };

    try {
      switch (platformId) {
        case 'shopify':
          return await this.syncShopifyProducts(platform, syncProcess);
        case 'woocommerce':
          return await this.syncWooCommerceProducts(platform, syncProcess);
        case 'amazon':
          return await this.syncAmazonProducts(platform, syncProcess);
        case 'magento':
          return await this.syncMagentoProducts(platform, syncProcess);
        case 'ebay':
          return await this.syncEBayProducts(platform, syncProcess);
        case 'bigcommerce':
          return await this.syncBigCommerceProducts(platform, syncProcess);
        default:
          throw new Error('Unsupported platform');
      }
    } catch (error) {
      syncProcess.status = 'failed';
      syncProcess.error = error.message;
      throw error;
    }
  }

  async syncShopifyProducts(platform, syncProcess) {
    // Shopify product sync with pagination
    let page = 1;
    const limit = 250; // Shopify limit
    
    // Get total count first
    const countResponse = await this.makeRequest(
      platform,
      `${platform.endpoints.products}?limit=1&fields=id`
    );
    
    syncProcess.stats.total = 1500; // Simulated total

    return this.simulateSyncProcess(syncProcess);
  }

  async syncWooCommerceProducts(platform, syncProcess) {
    // WooCommerce product sync with batch processing
    syncProcess.stats.total = 890;
    return this.simulateSyncProcess(syncProcess);
  }

  async syncAmazonProducts(platform, syncProcess) {
    // Amazon SP-API inventory sync
    syncProcess.stats.total = 2340;
    return this.simulateSyncProcess(syncProcess);
  }

  async syncMagentoProducts(platform, syncProcess) {
    syncProcess.stats.total = 1200;
    return this.simulateSyncProcess(syncProcess);
  }

  async syncEBayProducts(platform, syncProcess) {
    syncProcess.stats.total = 650;
    return this.simulateSyncProcess(syncProcess);
  }

  async syncBigCommerceProducts(platform, syncProcess) {
    syncProcess.stats.total = 750;
    return this.simulateSyncProcess(syncProcess);
  }

  // Order Synchronization
  async syncOrders(platformId, dateFrom) {
    const platform = this.platforms.get(platformId);
    if (!platform) throw new Error('Platform not connected');

    const syncProcess = {
      id: `orders-sync-${Date.now()}`,
      platformId,
      type: 'orders',
      status: 'running',
      progress: 0,
      startTime: new Date(),
      stats: { total: 0, processed: 0, errors: 0 }
    };

    switch (platformId) {
      case 'shopify':
        syncProcess.stats.total = 234;
        break;
      case 'woocommerce':
        syncProcess.stats.total = 156;
        break;
      case 'amazon':
        syncProcess.stats.total = 567;
        break;
      default:
        syncProcess.stats.total = 100;
    }

    return this.simulateSyncProcess(syncProcess);
  }

  // Webhook Management
  async setupShopifyWebhooks(platform) {
    const webhooks = [
      { topic: 'products/create', address: `${process.env.WEBHOOK_URL || 'https://example.com'}/shopify/products/create` },
      { topic: 'products/update', address: `${process.env.WEBHOOK_URL || 'https://example.com'}/shopify/products/update` },
      { topic: 'orders/create', address: `${process.env.WEBHOOK_URL || 'https://example.com'}/shopify/orders/create` },
      { topic: 'orders/updated', address: `${process.env.WEBHOOK_URL || 'https://example.com'}/shopify/orders/update` }
    ];

    for (const webhook of webhooks) {
      await this.createWebhook(platform, webhook);
    }
  }

  async createWebhook(platform, webhook) {
    // Simulate webhook creation
    await new Promise(resolve => setTimeout(resolve, 100));
    return { 
      id: Math.random().toString(36).substring(7),
      topic: webhook.topic,
      address: webhook.address,
      created_at: new Date().toISOString()
    };
  }

  // Real-time Inventory Updates
  async updateInventoryLevel(platformId, productId, quantity) {
    const platform = this.platforms.get(platformId);
    if (!platform) throw new Error('Platform not connected');

    switch (platformId) {
      case 'shopify':
        return await this.updateShopifyInventory(platform, productId, quantity);
      case 'woocommerce':
        return await this.updateWooCommerceInventory(platform, productId, quantity);
      default:
        throw new Error('Inventory update not supported for this platform');
    }
  }

  async updateShopifyInventory(platform, variantId, quantity) {
    // Simulate inventory update
    await new Promise(resolve => setTimeout(resolve, 200));
    return { success: true, variantId, newQuantity: quantity };
  }

  async updateWooCommerceInventory(platform, productId, quantity) {
    // Simulate inventory update
    await new Promise(resolve => setTimeout(resolve, 200));
    return { success: true, productId, newQuantity: quantity };
  }

  // Utility Methods
  async makeRequest(platform, endpoint, options = {}) {
    const url = `${platform.baseUrl}${endpoint}`;
    const headers = { ...platform.headers, ...options.headers };

    const config = {
      method: options.method || 'GET',
      headers,
      ...options
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return mock response based on endpoint
    return this.getMockResponse(endpoint, platform.type);
  }

  getMockResponse(endpoint, platformType) {
    if (endpoint.includes('products')) {
      return {
        products: Array.from({ length: 50 }, (_, i) => ({
          id: i + 1,
          title: `Product ${i + 1}`,
          vendor: 'Test Vendor',
          product_type: 'Physical',
          variants: [{ id: (i + 1) * 10, inventory_quantity: Math.floor(Math.random() * 100) }]
        }))
      };
    }
    
    if (endpoint.includes('orders')) {
      return {
        orders: Array.from({ length: 25 }, (_, i) => ({
          id: i + 1,
          order_number: `#100${i + 1}`,
          total_price: (Math.random() * 500 + 50).toFixed(2),
          created_at: new Date().toISOString()
        }))
      };
    }

    return { success: true };
  }

  async getAmazonAccessToken(config) {
    // Simulate OAuth token generation
    return 'Bearer ' + Math.random().toString(36).substring(2, 32);
  }

  async simulateConnection(platform) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (Math.random() < 0.9) {
      platform.status = 'connected';
      platform.connectedAt = new Date();
    } else {
      platform.status = 'failed';
      throw new Error('Connection failed: Invalid credentials');
    }
  }

  async simulateSyncProcess(syncProcess) {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        syncProcess.stats.processed += Math.floor(Math.random() * 30) + 10;
        syncProcess.progress = Math.min(100, (syncProcess.stats.processed / syncProcess.stats.total) * 100);
        
        // Random operations
        if (Math.random() < 0.6) {
          syncProcess.stats.updated += Math.floor(Math.random() * 5) + 1;
        } else {
          syncProcess.stats.created += Math.floor(Math.random() * 3) + 1;
        }
        
        // Random errors
        if (Math.random() < 0.05) {
          syncProcess.stats.errors += 1;
        }

        this.emit('sync.progress', syncProcess);

        if (syncProcess.stats.processed >= syncProcess.stats.total) {
          syncProcess.status = 'completed';
          syncProcess.endTime = new Date();
          clearInterval(interval);
          this.emit('sync.completed', syncProcess);
          resolve(syncProcess);
        }
      }, 200);
    });
  }

  completeSyncProcess(syncProcess) {
    syncProcess.status = 'completed';
    syncProcess.endTime = new Date();
    syncProcess.progress = 100;
    this.emit('sync.completed', syncProcess);
    return syncProcess;
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

// React Component
const EcommerceIntegration = () => {
  const [ecommerceService] = useState(() => new EcommerceIntegrationService());
  const [connectedPlatforms, setConnectedPlatforms] = useState(new Map());
  const [syncProcesses, setSyncProcesses] = useState([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({});
  const [metrics, setMetrics] = useState({});

  // E-commerce platform configurations
  const platforms = [
    {
      id: 'shopify',
      name: 'Shopify',
      provider: 'Shopify Inc.',
      logo: '🛍️',
      description: 'Connect to your Shopify store for seamless product and order sync',
      features: ['Product sync', 'Order management', 'Inventory tracking', 'Customer data'],
      popularity: 'Very High',
      marketShare: '23%',
      configFields: [
        { name: 'shopName', label: 'Shop Name', type: 'text', required: true, placeholder: 'mystore' },
        { name: 'accessToken', label: 'Private App Access Token', type: 'password', required: true },
        { name: 'apiVersion', label: 'API Version', type: 'select', options: ['2023-10', '2023-07', '2023-04'], defaultValue: '2023-10' }
      ]
    },
    {
      id: 'woocommerce',
      name: 'WooCommerce',
      provider: 'Automattic',
      logo: '🏪',
      description: 'Integrate with your WordPress WooCommerce store',
      features: ['Product catalog', 'Stock levels', 'Order processing', 'Customer management'],
      popularity: 'High',
      marketShare: '28%',
      configFields: [
        { name: 'siteUrl', label: 'Site URL', type: 'text', required: true, placeholder: 'https://mystore.com' },
        { name: 'consumerKey', label: 'Consumer Key', type: 'text', required: true },
        { name: 'consumerSecret', label: 'Consumer Secret', type: 'password', required: true }
      ]
    },
    {
      id: 'amazon',
      name: 'Amazon Seller Central',
      provider: 'Amazon',
      logo: '📦',
      description: 'Connect to Amazon SP-API for FBA and seller operations',
      features: ['FBA inventory', 'Order fulfillment', 'Reporting', 'Advertising data'],
      popularity: 'Very High',
      marketShare: '45%',
      configFields: [
        { name: 'sellerId', label: 'Seller ID', type: 'text', required: true },
        { name: 'marketplaceId', label: 'Marketplace ID', type: 'text', required: true, defaultValue: 'ATVPDKIKX0DER' },
        { name: 'clientId', label: 'Client ID', type: 'text', required: true },
        { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
        { name: 'refreshToken', label: 'Refresh Token', type: 'password', required: true }
      ]
    },
    {
      id: 'magento',
      name: 'Magento',
      provider: 'Adobe',
      logo: '🎯',
      description: 'Enterprise-grade integration with Magento Commerce',
      features: ['Multi-store', 'Advanced inventory', 'B2B features', 'Custom attributes'],
      popularity: 'Medium',
      marketShare: '7%',
      configFields: [
        { name: 'baseUrl', label: 'Base URL', type: 'text', required: true, placeholder: 'https://mystore.com' },
        { name: 'accessToken', label: 'Access Token', type: 'password', required: true },
        { name: 'version', label: 'Version', type: 'select', options: ['2.4', '2.3'], defaultValue: '2.4' }
      ]
    },
    {
      id: 'ebay',
      name: 'eBay',
      provider: 'eBay Inc.',
      logo: '🏷️',
      description: 'Manage your eBay listings and inventory',
      features: ['Listing management', 'Order sync', 'Inventory tracking', 'Store integration'],
      popularity: 'Medium',
      marketShare: '12%',
      configFields: [
        { name: 'clientId', label: 'Client ID', type: 'text', required: true },
        { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
        { name: 'accessToken', label: 'Access Token', type: 'password', required: true },
        { name: 'environment', label: 'Environment', type: 'select', options: ['production', 'sandbox'], defaultValue: 'production' }
      ]
    },
    {
      id: 'bigcommerce',
      name: 'BigCommerce',
      provider: 'BigCommerce Inc.',
      logo: '🛒',
      description: 'Connect to BigCommerce for omnichannel commerce',
      features: ['Headless commerce', 'Multi-channel', 'Advanced SEO', 'B2B edition'],
      popularity: 'Medium',
      marketShare: '8%',
      configFields: [
        { name: 'storeHash', label: 'Store Hash', type: 'text', required: true },
        { name: 'accessToken', label: 'Access Token', type: 'password', required: true },
        { name: 'clientId', label: 'Client ID', type: 'text', required: true }
      ]
    }
  ];

  useEffect(() => {
    // Setup event listeners
    const handleSyncProgress = (syncProcess) => {
      setSyncProcesses(prev => {
        const existing = prev.find(s => s.id === syncProcess.id);
        if (existing) {
          return prev.map(s => s.id === syncProcess.id ? syncProcess : s);
        } else {
          return [...prev, syncProcess];
        }
      });
    };

    const handleSyncCompleted = (syncProcess) => {
      setSyncProcesses(prev => prev.map(s => 
        s.id === syncProcess.id ? syncProcess : s
      ));
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        [syncProcess.platformId]: {
          ...prev[syncProcess.platformId],
          lastSync: syncProcess.endTime,
          productsProcessed: syncProcess.stats.processed,
          errors: syncProcess.stats.errors
        }
      }));
    };

    ecommerceService.addEventListener('sync.progress', handleSyncProgress);
    ecommerceService.addEventListener('sync.completed', handleSyncCompleted);

    // Load sample metrics
    setMetrics({
      shopify: { products: 1247, orders: 89, revenue: 15640, lastSync: new Date() },
      woocommerce: { products: 856, orders: 67, revenue: 12340, lastSync: new Date() },
      amazon: { products: 2134, orders: 156, revenue: 28950, lastSync: new Date() }
    });

    // Cleanup
    return () => {
      ecommerceService.removeEventListener('sync.progress', handleSyncProgress);
      ecommerceService.removeEventListener('sync.completed', handleSyncCompleted);
    };
  }, [ecommerceService]);

  const handleConnect = async (platformId, config) => {
    setConnectionStatus(prev => ({ ...prev, [platformId]: 'connecting' }));
    
    try {
      let result;
      switch (platformId) {
        case 'shopify':
          result = await ecommerceService.connectShopify(config);
          break;
        case 'woocommerce':
          result = await ecommerceService.connectWooCommerce(config);
          break;
        case 'amazon':
          result = await ecommerceService.connectAmazon(config);
          break;
        case 'magento':
          result = await ecommerceService.connectMagento(config);
          break;
        case 'ebay':
          result = await ecommerceService.connectEBay(config);
          break;
        case 'bigcommerce':
          result = await ecommerceService.connectBigCommerce(config);
          break;
      }

      if (result.success) {
        setConnectedPlatforms(prev => new Map(prev.set(platformId, result.platform)));
        setConnectionStatus(prev => ({ ...prev, [platformId]: 'connected' }));
      } else {
        setConnectionStatus(prev => ({ ...prev, [platformId]: 'failed' }));
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [platformId]: 'failed' }));
      console.error('Connection failed:', error);
    }
  };

  const handleSync = async (platformId, syncType = 'products') => {
    try {
      if (syncType === 'products') {
        await ecommerceService.syncProducts(platformId);
      } else if (syncType === 'orders') {
        await ecommerceService.syncOrders(platformId);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const handleDisconnect = (platformId) => {
    setConnectedPlatforms(prev => {
      const newMap = new Map(prev);
      newMap.delete(platformId);
      return newMap;
    });
    setConnectionStatus(prev => ({ ...prev, [platformId]: 'disconnected' }));
    ecommerceService.platforms.delete(platformId);
  };

  const PlatformCard = ({ platform }) => {
    const connection = connectedPlatforms.get(platform.id);
    const status = connectionStatus[platform.id] || 'disconnected';
    const platformMetrics = metrics[platform.id];
    const activeSyncProcess = syncProcesses.find(s => 
      s.platformId === platform.id && s.status === 'running'
    );

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{platform.logo}</div>
            <div>
              <h3 className="font-semibold text-gray-900">{platform.name}</h3>
              <p className="text-sm text-gray-500">{platform.provider}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-400">Market Share: {platform.marketShare}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  platform.popularity === 'Very High' ? 'bg-green-100 text-green-700' :
                  platform.popularity === 'High' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {platform.popularity}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {status === 'connected' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {status === 'connecting' && <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />}
            {status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
            {status === 'disconnected' && <XCircle className="w-5 h-5 text-gray-400" />}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              status === 'connected' ? 'bg-green-100 text-green-800' :
              status === 'connecting' ? 'bg-blue-100 text-blue-800' :
              status === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {status}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">{platform.description}</p>

        {/* Features */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-900 mb-2">Features:</p>
          <div className="flex flex-wrap gap-1">
            {platform.features.map((feature, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Connection Details */}
        {status === 'connected' && connection && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-900 mb-1">Connected</p>
            <p className="text-xs text-green-700">
              Since: {connection.connectedAt?.toLocaleString()}
            </p>
          </div>
        )}

        {/* Metrics (if connected) */}
        {platformMetrics && status === 'connected' && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900 mb-2">Recent Activity:</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-gray-900">{platformMetrics.products?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-500">Products</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{platformMetrics.orders?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-500">Orders</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">${platformMetrics.revenue?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
            </div>
            {platformMetrics.lastSync && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Last sync: {platformMetrics.lastSync.toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Sync Progress */}
        {activeSyncProcess && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-blue-900">Syncing {activeSyncProcess.type}...</span>
              <span className="text-blue-700">{Math.round(activeSyncProcess.progress)}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${activeSyncProcess.progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-blue-700">
              {activeSyncProcess.stats.processed} / {activeSyncProcess.stats.total} items
              {activeSyncProcess.stats.errors > 0 && (
                <span className="text-red-600 ml-2">
                  ({activeSyncProcess.stats.errors} errors)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          {status === 'connected' ? (
            <>
              <button
                onClick={() => handleSync(platform.id, 'products')}
                disabled={!!activeSyncProcess}
                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 inline mr-1 ${activeSyncProcess ? 'animate-spin' : ''}`} />
                {activeSyncProcess && activeSyncProcess.type === 'products' ? 'Syncing...' : 'Sync Products'}
              </button>
              <button
                onClick={() => handleSync(platform.id, 'orders')}
                disabled={!!activeSyncProcess}
                className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4 inline mr-1" />
                {activeSyncProcess && activeSyncProcess.type === 'orders' ? 'Syncing...' : 'Sync Orders'}
              </button>
              <button 
                onClick={() => handleDisconnect(platform.id)}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                title="Disconnect"
              >
                <XCircle className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                <Settings className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setSelectedPlatform(platform);
                setShowConfigModal(true);
              }}
              disabled={status === 'connecting'}
              className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'connecting' ? (
                <>
                  <RefreshCw className="w-4 h-4 inline mr-1 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect'
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  // Configuration Modal Component
  const ConfigurationModal = () => {
    const [config, setConfig] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    if (!selectedPlatform) return null;

    const handleSave = async () => {
      setIsLoading(true);
      try {
        await handleConnect(selectedPlatform.id, config);
        setShowConfigModal(false);
        setConfig({});
      } finally {
        setIsLoading(false);
      }
    };

    return showConfigModal ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Configure {selectedPlatform.name}
            </h3>
            <button
              onClick={() => setShowConfigModal(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {selectedPlatform.configFields.map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === 'select' ? (
                  <select
                    defaultValue={field.defaultValue}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      [field.name]: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={field.required}
                  >
                    {field.options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    defaultValue={field.defaultValue}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      [field.name]: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => setShowConfigModal(false)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 inline mr-1 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect'
              )}
            </button>
          </div>
        </div>
      </div>
    ) : null;
  };

  // Sync History Component
  const SyncHistory = () => {
    const completedSyncs = syncProcesses.filter(s => s.status === 'completed' || s.status === 'failed');
    
    if (completedSyncs.length === 0) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sync History</h3>
        <div className="space-y-3">
          {completedSyncs.slice(-5).reverse().map(sync => (
            <div key={sync.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  sync.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {sync.platformId} - {sync.type} sync {sync.status}
                  </p>
                  <p className="text-xs text-gray-500">
                    {sync.stats.processed} items processed
                    {sync.stats.created > 0 && ` (${sync.stats.created} created)`}
                    {sync.stats.updated > 0 && ` (${sync.stats.updated} updated)`}
                    {sync.stats.errors > 0 && ` (${sync.stats.errors} errors)`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  {sync.endTime?.toLocaleTimeString()}
                </p>
                <p className="text-xs text-gray-400">
                  {Math.round((sync.endTime - sync.startTime) / 1000)}s
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Statistics Component
  const PlatformStats = () => {
    const connectedCount = connectedPlatforms.size;
    const totalSyncs = syncProcesses.filter(s => s.status === 'completed').length;
    const totalProducts = Object.values(metrics).reduce((sum, m) => sum + (m.products || 0), 0);
    const totalRevenue = Object.values(metrics).reduce((sum, m) => sum + (m.revenue || 0), 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">Connected Platforms</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{connectedCount}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600">Total Syncs</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalSyncs}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-600">Total Products</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalProducts.toLocaleString()}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">${totalRevenue.toLocaleString()}</p>
        </div>
      </div>
    );
  };

  // Quick Actions Component
  const QuickActions = () => {
    const connectedPlatformIds = Array.from(connectedPlatforms.keys());
    
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              connectedPlatformIds.forEach(id => handleSync(id, 'products'));
            }}
            disabled={connectedPlatformIds.length === 0}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-blue-900">Sync All Products</p>
            <p className="text-xs text-blue-700">Update product data across all platforms</p>
          </button>
          
          <button
            onClick={() => {
              connectedPlatformIds.forEach(id => handleSync(id, 'orders'));
            }}
            disabled={connectedPlatformIds.length === 0}
            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-900">Sync All Orders</p>
            <p className="text-xs text-green-700">Fetch latest orders from all platforms</p>
          </button>
          
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <BarChart3 className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-purple-900">Generate Report</p>
            <p className="text-xs text-purple-700">Create comprehensive analytics report</p>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">E-commerce Platform Integration</h2>
          <p className="text-gray-600 mt-1">Connect and sync with leading e-commerce platforms for unified inventory management</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Activity className="w-4 h-4" />
            <span>{connectedPlatforms.size} active connections</span>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Link className="w-4 h-4" />
            <span>Webhooks</span>
          </button>
        </div>
      </div>

      <PlatformStats />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map(platform => (
          <PlatformCard key={platform.id} platform={platform} />
        ))}
      </div>

      <QuickActions />

      <SyncHistory />

      {/* Platform Comparison */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Platform</th>
                <th className="text-left py-2">Market Share</th>
                <th className="text-left py-2">Popularity</th>
                <th className="text-left py-2">Features</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {platforms.map(platform => (
                <tr key={platform.id} className="border-b">
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{platform.logo}</span>
                      <span className="font-medium">{platform.name}</span>
                    </div>
                  </td>
                  <td className="py-3">{platform.marketShare}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      platform.popularity === 'Very High' ? 'bg-green-100 text-green-700' :
                      platform.popularity === 'High' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {platform.popularity}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {platform.features.slice(0, 2).map((feature, index) => (
                        <span key={index} className="px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {feature}
                        </span>
                      ))}
                      {platform.features.length > 2 && (
                        <span className="text-xs text-gray-400">+{platform.features.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      connectionStatus[platform.id] === 'connected' ? 'bg-green-100 text-green-800' :
                      connectionStatus[platform.id] === 'connecting' ? 'bg-blue-100 text-blue-800' :
                      connectionStatus[platform.id] === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {connectionStatus[platform.id] || 'disconnected'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfigurationModal />
    </div>
  );
};

export default EcommerceIntegration;