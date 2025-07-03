// components/erp/core/DataStore.js
class ERPDataStore {
  constructor() {
    this.dbName = 'InventoryERP';
    this.version = 1;
    this.db = null;
    this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('inventory')) {
          const inventoryStore = db.createObjectStore('inventory', { keyPath: 'sku' });
          inventoryStore.createIndex('category', 'category', { unique: false });
          inventoryStore.createIndex('supplier', 'supplier', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('orders')) {
          const ordersStore = db.createObjectStore('orders', { keyPath: 'id' });
          ordersStore.createIndex('status', 'status', { unique: false });
          ordersStore.createIndex('date', 'orderDate', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('suppliers')) {
          db.createObjectStore('suppliers', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('warehouses')) {
          db.createObjectStore('warehouses', { keyPath: 'id' });
        }
      };
    });
  }

  // Real CRUD operations
  async addInventoryItem(item) {
    const transaction = this.db.transaction(['inventory'], 'readwrite');
    const store = transaction.objectStore('inventory');
    return store.add({
      ...item,
      lastUpdated: new Date(),
      createdAt: new Date()
    });
  }

  async updateInventoryQuantity(sku, quantity) {
    const transaction = this.db.transaction(['inventory'], 'readwrite');
    const store = transaction.objectStore('inventory');
    const item = await store.get(sku);
    
    if (item) {
      item.quantity = quantity;
      item.lastUpdated = new Date();
      return store.put(item);
    }
  }

  async getAllInventory() {
    const transaction = this.db.transaction(['inventory'], 'readonly');
    const store = transaction.objectStore('inventory');
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  }

  async addOrder(order) {
    const transaction = this.db.transaction(['orders', 'inventory'], 'readwrite');
    const ordersStore = transaction.objectStore('orders');
    const inventoryStore = transaction.objectStore('inventory');
    
    // Add order
    await ordersStore.add({
      ...order,
      createdAt: new Date(),
      status: 'pending'
    });
    
    // Update inventory
    for (const item of order.items) {
      const inventoryItem = await inventoryStore.get(item.sku);
      if (inventoryItem && inventoryItem.quantity >= item.quantity) {
        inventoryItem.quantity -= item.quantity;
        inventoryItem.lastUpdated = new Date();
        await inventoryStore.put(inventoryItem);
      }
    }
    
    return order;
  }

  async getLowStockItems(threshold = 10) {
    const items = await this.getAllInventory();
    return items.filter(item => item.quantity <= threshold);
  }
}

export const dataStore = new ERPDataStore();