// lib/database/RealDatabase.js
class RealInventoryDatabase {
  constructor() {
    this.dbName = 'InventoryERP_Production';
    this.version = 2;
    this.db = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => {
        console.error('Database failed to open:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('Database opened successfully');
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Products store
        if (!db.objectStoreNames.contains('products')) {
          const productsStore = db.createObjectStore('products', { keyPath: 'sku' });
          productsStore.createIndex('category', 'category', { unique: false });
          productsStore.createIndex('vendor', 'vendor', { unique: false });
          productsStore.createIndex('source', 'source', { unique: false });
          productsStore.createIndex('lastSync', 'lastSync', { unique: false });
        }
        
        // Orders store
        if (!db.objectStoreNames.contains('orders')) {
          const ordersStore = db.createObjectStore('orders', { keyPath: 'id' });
          ordersStore.createIndex('status', 'status', { unique: false });
          ordersStore.createIndex('createdAt', 'createdAt', { unique: false });
          ordersStore.createIndex('customer', 'customer.email', { unique: false });
          ordersStore.createIndex('total', 'total', { unique: false });
        }
        
        // Suppliers store
        if (!db.objectStoreNames.contains('suppliers')) {
          const suppliersStore = db.createObjectStore('suppliers', { keyPath: 'id' });
          suppliersStore.createIndex('status', 'status', { unique: false });
          suppliersStore.createIndex('rating', 'rating', { unique: false });
        }
        
        // Inventory movements store
        if (!db.objectStoreNames.contains('inventory_movements')) {
          const movementsStore = db.createObjectStore('inventory_movements', { keyPath: 'id' });
          movementsStore.createIndex('sku', 'sku', { unique: false });
          movementsStore.createIndex('type', 'type', { unique: false });
          movementsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Business analytics store
        if (!db.objectStoreNames.contains('analytics')) {
          const analyticsStore = db.createObjectStore('analytics', { keyPath: 'id' });
          analyticsStore.createIndex('type', 'type', { unique: false });
          analyticsStore.createIndex('date', 'date', { unique: false });
        }
      };
    });
  }

  // Product operations
  async saveProduct(product) {
    await this.initialize();
    
    const transaction = this.db.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');
    
    const productWithMetadata = {
      ...product,
      lastUpdated: new Date(),
      syncStatus: 'synced'
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(productWithMetadata);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getProduct(sku) {
    await this.initialize();
    
    const transaction = this.db.transaction(['products'], 'readonly');
    const store = transaction.objectStore('products');
    
    return new Promise((resolve, reject) => {
      const request = store.get(sku);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllProducts() {
    await this.initialize();
    
    const transaction = this.db.transaction(['products'], 'readonly');
    const store = transaction.objectStore('products');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateProductQuantity(sku, newQuantity, movementType = 'adjustment') {
    await this.initialize();
    
    const transaction = this.db.transaction(['products', 'inventory_movements'], 'readwrite');
    const productsStore = transaction.objectStore('products');
    const movementsStore = transaction.objectStore('inventory_movements');
    
    // Get current product
    const product = await new Promise((resolve, reject) => {
      const request = productsStore.get(sku);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    if (!product) {
      throw new Error(`Product ${sku} not found`);
    }
    
    const oldQuantity = product.quantity;
    const quantityChange = newQuantity - oldQuantity;
    
    // Update product
    product.quantity = newQuantity;
    product.lastUpdated = new Date();
    
    await new Promise((resolve, reject) => {
      const request = productsStore.put(product);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    // Record movement
    const movement = {
      id: `MOV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sku,
      type: movementType,
      quantityChange,
      oldQuantity,
      newQuantity,
      timestamp: new Date(),
      reason: `${movementType} - quantity changed from ${oldQuantity} to ${newQuantity}`
    };
    
    await new Promise((resolve, reject) => {
      const request = movementsStore.add(movement);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    return { product, movement };
  }

  // Order operations
  async saveOrder(order) {
    await this.initialize();
    
    const transaction = this.db.transaction(['orders', 'products', 'inventory_movements'], 'readwrite');
    const ordersStore = transaction.objectStore('orders');
    const productsStore = transaction.objectStore('products');
    const movementsStore = transaction.objectStore('inventory_movements');
    
    // Save order
    const orderWithMetadata = {
      ...order,
      id: order.id || `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      status: order.status || 'pending'
    };
    
    await new Promise((resolve, reject) => {
      const request = ordersStore.add(orderWithMetadata);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    // Update inventory for each item
    for (const item of order.items) {
      const product = await new Promise((resolve, reject) => {
        const request = productsStore.get(item.sku);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      if (product && product.quantity >= item.quantity) {
        const oldQuantity = product.quantity;
        product.quantity -= item.quantity;
        product.lastUpdated = new Date();
        
        await new Promise((resolve, reject) => {
          const request = productsStore.put(product);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        
        // Record movement
        const movement = {
          id: `MOV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sku: item.sku,
          type: 'sale',
          quantityChange: -item.quantity,
          oldQuantity,
          newQuantity: product.quantity,
          timestamp: new Date(),
          orderId: orderWithMetadata.id,
          reason: `Sale - Order ${orderWithMetadata.id}`
        };
        
        await new Promise((resolve, reject) => {
          const request = movementsStore.add(movement);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }
    }
    
    return orderWithMetadata;
  }

  async getOrders(limit = 100) {
    await this.initialize();
    
    const transaction = this.db.transaction(['orders'], 'readonly');
    const store = transaction.objectStore('orders');
    const index = store.index('createdAt');
    
    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, 'prev'); // Newest first
      const orders = [];
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && orders.length < limit) {
          orders.push(cursor.value);
          cursor.continue();
        } else {
          resolve(orders);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Analytics operations
  async saveAnalytics(analyticsData) {
    await this.initialize();
    
    const transaction = this.db.transaction(['analytics'], 'readwrite');
    const store = transaction.objectStore('analytics');
    
    const analyticsWithMetadata = {
      ...analyticsData,
      id: `ANALYTICS-${Date.now()}`,
      date: new Date(),
      type: analyticsData.type || 'general'
    };
    
    return new Promise((resolve, reject) => {
      const request = store.add(analyticsWithMetadata);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getInventoryMovements(sku, limit = 50) {
    await this.initialize();
    
    const transaction = this.db.transaction(['inventory_movements'], 'readonly');
    const store = transaction.objectStore('inventory_movements');
    const index = store.index('sku');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(sku);
      request.onsuccess = () => {
        const movements = request.result
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, limit);
        resolve(movements);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Business intelligence queries
  async getLowStockProducts(threshold = 10) {
    const products = await this.getAllProducts();
    return products.filter(product => product.quantity <= threshold);
  }

  async getTopSellingProducts(days = 30) {
    await this.initialize();
    
    const transaction = this.db.transaction(['inventory_movements'], 'readonly');
    const store = transaction.objectStore('inventory_movements');
    const index = store.index('type');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll('sale');
      request.onsuccess = () => {
        const sales = request.result;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const salesBySku = {};
        
        sales
          .filter(sale => new Date(sale.timestamp) >= cutoffDate)
          .forEach(sale => {
            if (!salesBySku[sale.sku]) {
              salesBySku[sale.sku] = 0;
            }
            salesBySku[sale.sku] += Math.abs(sale.quantityChange);
          });
        
        const topSelling = Object.entries(salesBySku)
          .map(([sku, quantity]) => ({ sku, quantity }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 10);
        
        resolve(topSelling);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getInventoryValue() {
    const products = await this.getAllProducts();
    return products.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
  }
}

export const realDatabase = new RealInventoryDatabase();