// lib/business/RealBusinessEngine.js
import { realAPIClient } from '../api/RealAPIClient';
import { realDatabase } from '../database/RealDatabase';

class RealBusinessEngine {
  constructor() {
    this.isRunning = false;
    this.syncInterval = null;
    this.businessRules = new Map();
    this.alerts = [];
    this.eventListeners = new Map();
    
    this.setupBusinessRules();
  }

  setupBusinessRules() {
    // Low stock auto-reorder rule
    this.businessRules.set('auto-reorder', {
      name: 'Automatic Reorder',
      condition: (product) => product.quantity <= (product.reorderPoint || 10),
      action: async (product) => {
        const reorderQuantity = (product.reorderPoint || 10) * 3;
        await this.createPurchaseOrder(product, reorderQuantity);
        this.createAlert('reorder', `Auto-reorder triggered for ${product.name} (${reorderQuantity} units)`);
      },
      enabled: true
    });

    // Price change alert rule
    this.businessRules.set('price-alert', {
      name: 'Price Change Alert',
      condition: (newProduct, oldProduct) => {
        if (!oldProduct) return false;
        const priceChange = Math.abs(newProduct.price - oldProduct.price);
        return priceChange > 50; // Alert for price changes > $50
      },
      action: async (newProduct, oldProduct) => {
        const change = newProduct.price - oldProduct.price;
        const direction = change > 0 ? 'increased' : 'decreased';
        this.createAlert('price', `Price ${direction} for ${newProduct.name}: $${Math.abs(change).toFixed(2)}`);
      },
      enabled: true
    });

    // Critical stock rule
    this.businessRules.set('critical-stock', {
      name: 'Critical Stock Alert',
      condition: (product) => product.quantity <= 3,
      action: async (product) => {
        this.createAlert('critical', `CRITICAL: ${product.name} has only ${product.quantity} units left!`, 'high');
      },
      enabled: true
    });
  }

  async startRealTimeSync() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🚀 Starting real-time business engine...');
    
    // Initial sync
    await this.performFullSync();
    
    // Set up periodic sync
    this.syncInterval = setInterval(async () => {
      await this.performIncrementalSync();
    }, 300000); // Sync every 5 minutes
    
    this.emit('engine.started');
  }

  async performFullSync() {
    try {
      console.log('📊 Performing full sync with external systems...');
      
      // Sync Shopify products
      const shopifyProducts = await realAPIClient.getShopifyProducts();
      console.log(`Found ${shopifyProducts.length} products from Shopify`);
      
      for (const product of shopifyProducts) {
        const existingProduct = await realDatabase.getProduct(product.sku);
        
        // Apply business rules
        await this.applyBusinessRules(product, existingProduct);
        
        // Save to database
        await realDatabase.saveProduct(product);
      }
      
      // Sync QuickBooks financial data
      const qbItems = await realAPIClient.getQuickBooksItems();
      console.log(`Found ${qbItems.length} items from QuickBooks`);
      
      for (const item of qbItems) {
        await realDatabase.saveProduct(item);
      }
      
      // Generate business insights
      await this.generateBusinessInsights();
      
      this.createAlert('sync', `Full sync completed: ${shopifyProducts.length + qbItems.length} items synced`, 'success');
      this.emit('sync.completed', { type: 'full', itemCount: shopifyProducts.length + qbItems.length });
      
    } catch (error) {
      console.error('Full sync failed:', error);
      this.createAlert('error', `Sync failed: ${error.message}`, 'high');
    }
  }

  async performIncrementalSync() {
    try {
      console.log('🔄 Performing incremental sync...');
      
      // Get products that haven't been synced recently
      const products = await realDatabase.getAllProducts();
      const staleProducts = products.filter(product => {
        const lastSync = new Date(product.lastSync);
        const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
       return hoursSinceSync > 1; // Sync products older than 1 hour
     });

     if (staleProducts.length === 0) {
       console.log('✅ All products are up to date');
       return;
     }

     console.log(`🔄 Syncing ${staleProducts.length} stale products...`);

     // Update inventory levels in Shopify
     for (const product of staleProducts) {
       if (product.source === 'shopify' && product.variants) {
         for (const variant of product.variants) {
           const result = await realAPIClient.updateShopifyInventory(variant.id, product.quantity);
           if (result.success) {
             product.lastSync = new Date();
             await realDatabase.saveProduct(product);
           }
         }
       }
     }

     this.emit('sync.completed', { type: 'incremental', itemCount: staleProducts.length });
     
   } catch (error) {
     console.error('Incremental sync failed:', error);
     this.createAlert('error', `Incremental sync failed: ${error.message}`, 'medium');
   }
 }

 async applyBusinessRules(product, oldProduct = null) {
   for (const [ruleId, rule] of this.businessRules) {
     if (!rule.enabled) continue;
     
     try {
       if (rule.condition(product, oldProduct)) {
         await rule.action(product, oldProduct);
       }
     } catch (error) {
       console.error(`Business rule ${ruleId} failed:`, error);
       this.createAlert('error', `Business rule "${rule.name}" failed: ${error.message}`, 'medium');
     }
   }
 }

 async processRealOrder(orderData) {
   try {
     console.log('📦 Processing real order:', orderData);
     
     // Validate inventory availability
     for (const item of orderData.items) {
       const product = await realDatabase.getProduct(item.sku);
       if (!product) {
         throw new Error(`Product ${item.sku} not found`);
       }
       if (product.quantity < item.quantity) {
         throw new Error(`Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`);
       }
     }
     
     // Create order in external system (Shopify)
     const externalOrder = await realAPIClient.createShopifyOrder(orderData);
     
     // Save order locally and update inventory
     const localOrder = {
       ...orderData,
       id: externalOrder.id || `ORD-${Date.now()}`,
       externalOrderNumber: externalOrder.orderNumber,
       total: externalOrder.total,
       status: externalOrder.status || 'pending',
       source: 'manual'
     };
     
     const savedOrder = await realDatabase.saveOrder(localOrder);
     
     // Apply business rules to updated products
     for (const item of orderData.items) {
       const updatedProduct = await realDatabase.getProduct(item.sku);
       await this.applyBusinessRules(updatedProduct);
     }
     
     this.createAlert('order', `Order processed successfully: ${savedOrder.id} ($${savedOrder.total})`, 'success');
     this.emit('order.processed', savedOrder);
     
     return savedOrder;
     
   } catch (error) {
     console.error('Order processing failed:', error);
     this.createAlert('error', `Order failed: ${error.message}`, 'high');
     throw error;
   }
 }

 async createPurchaseOrder(product, quantity) {
   const po = {
     id: `PO-${Date.now()}`,
     sku: product.sku,
     productName: product.name,
     quantity,
     supplier: product.vendor || 'Unknown Supplier',
     unitCost: product.price * 0.6, // Assume 60% cost ratio
     totalCost: product.price * 0.6 * quantity,
     status: 'pending',
     createdAt: new Date(),
     expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
   };
   
   // In a real system, this would integrate with supplier APIs
   console.log('📋 Created purchase order:', po);
   
   // Save to analytics for tracking
   await realDatabase.saveAnalytics({
     type: 'purchase_order',
     data: po
   });
   
   return po;
 }

 async generateBusinessInsights() {
   try {
     const insights = {
       timestamp: new Date(),
       inventoryValue: await realDatabase.getInventoryValue(),
       lowStockItems: await realDatabase.getLowStockProducts(),
       topSellingProducts: await realDatabase.getTopSellingProducts(),
       orderStats: await this.getOrderStatistics(),
       recommendations: await this.generateRecommendations()
     };
     
     await realDatabase.saveAnalytics({
       type: 'business_insights',
       data: insights
     });
     
     this.emit('insights.generated', insights);
     return insights;
     
   } catch (error) {
     console.error('Failed to generate insights:', error);
     return null;
   }
 }

 async getOrderStatistics() {
   const orders = await realDatabase.getOrders(100);
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   
   const todayOrders = orders.filter(order => 
     new Date(order.createdAt) >= today
   );
   
   const thisMonth = new Date();
   thisMonth.setDate(1);
   thisMonth.setHours(0, 0, 0, 0);
   
   const monthOrders = orders.filter(order => 
     new Date(order.createdAt) >= thisMonth
   );
   
   return {
     todayCount: todayOrders.length,
     todayRevenue: todayOrders.reduce((sum, order) => sum + order.total, 0),
     monthCount: monthOrders.length,
     monthRevenue: monthOrders.reduce((sum, order) => sum + order.total, 0),
     averageOrderValue: orders.length > 0 ? 
       orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0
   };
 }

 async generateRecommendations() {
   const lowStock = await realDatabase.getLowStockProducts();
   const topSelling = await realDatabase.getTopSellingProducts();
   
   const recommendations = [];
   
   // Low stock recommendations
   lowStock.forEach(product => {
     recommendations.push({
       type: 'reorder',
       priority: product.quantity === 0 ? 'critical' : 'high',
       message: `Reorder ${product.name} - Current stock: ${product.quantity}`,
       action: 'Create purchase order',
       product: product.sku
     });
   });
   
   // Top selling product recommendations
   topSelling.slice(0, 3).forEach(item => {
     recommendations.push({
       type: 'inventory',
       priority: 'medium',
       message: `Consider increasing stock for top seller: ${item.sku}`,
       action: 'Review inventory levels',
       product: item.sku
     });
   });
   
   return recommendations;
 }

 async generateAIForecast(productSku) {
   try {
     const product = await realDatabase.getProduct(productSku);
     if (!product) {
       throw new Error('Product not found');
     }
     
     // Get historical data
     const movements = await realDatabase.getInventoryMovements(productSku, 30);
     const salesData = movements
       .filter(m => m.type === 'sale')
       .map(m => ({
         date: m.timestamp,
         quantity: Math.abs(m.quantityChange)
       }));
     
     // Add sales context to product data
     const productWithHistory = {
       ...product,
       recentSales: salesData.slice(0, 7).reduce((sum, sale) => sum + sale.quantity, 0),
       salesTrend: this.calculateSalesTrend(salesData)
     };
     
     const forecast = await realAPIClient.generateAIDemandForecast(productWithHistory);
     
     // Save forecast for future reference
     await realDatabase.saveAnalytics({
       type: 'ai_forecast',
       productSku,
       data: {
         forecast,
         generatedAt: new Date(),
         baseData: productWithHistory
       }
     });
     
     this.createAlert('ai', `AI forecast generated for ${product.name}`, 'info');
     this.emit('forecast.generated', { productSku, forecast });
     
     return forecast;
     
   } catch (error) {
     console.error('AI forecast generation failed:', error);
     throw error;
   }
 }

 calculateSalesTrend(salesData) {
   if (salesData.length < 2) return 'stable';
   
   const recent = salesData.slice(0, 3).reduce((sum, sale) => sum + sale.quantity, 0);
   const older = salesData.slice(3, 6).reduce((sum, sale) => sum + sale.quantity, 0);
   
   if (recent > older * 1.2) return 'increasing';
   if (recent < older * 0.8) return 'decreasing';
   return 'stable';
 }

 createAlert(type, message, severity = 'info') {
   const alert = {
     id: `ALERT-${Date.now()}`,
     type,
     message,
     severity,
     timestamp: new Date(),
     read: false
   };
   
   this.alerts.unshift(alert);
   this.alerts = this.alerts.slice(0, 100); // Keep last 100 alerts
   
   this.emit('alert.created', alert);
   return alert;
 }

 getAlerts(unreadOnly = false) {
   return unreadOnly ? this.alerts.filter(alert => !alert.read) : this.alerts;
 }

 markAlertRead(alertId) {
   const alert = this.alerts.find(a => a.id === alertId);
   if (alert) {
     alert.read = true;
     this.emit('alert.read', alert);
   }
 }

 // Event system
 emit(event, data) {
   const listeners = this.eventListeners.get(event) || [];
   listeners.forEach(callback => {
     try {
       callback(data);
     } catch (error) {
       console.error(`Event listener error for ${event}:`, error);
     }
   });
 }

 on(event, callback) {
   if (!this.eventListeners.has(event)) {
     this.eventListeners.set(event, []);
   }
   this.eventListeners.get(event).push(callback);
 }

 off(event, callback) {
   const listeners = this.eventListeners.get(event) || [];
   this.eventListeners.set(event, listeners.filter(l => l !== callback));
 }

 async stop() {
   this.isRunning = false;
   if (this.syncInterval) {
     clearInterval(this.syncInterval);
     this.syncInterval = null;
   }
   this.emit('engine.stopped');
 }

 // Get real-time status
 getStatus() {
   return {
     isRunning: this.isRunning,
     lastSync: this.lastSyncTime,
     alertCount: this.alerts.filter(a => !a.read).length,
     rulesEnabled: Array.from(this.businessRules.values()).filter(r => r.enabled).length,
     totalRules: this.businessRules.size
   };
 }
}

export const realBusinessEngine = new RealBusinessEngine();