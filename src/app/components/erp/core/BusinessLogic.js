// components/erp/core/BusinessLogic.js
import { dataStore } from './DataStore';
import { apiService } from './APIService';

class BusinessLogicEngine {
  constructor() {
    this.rules = new Map();
    this.alerts = [];
    this.setupBusinessRules();
  }

  setupBusinessRules() {
    // Auto-reorder rule
    this.rules.set('auto-reorder', {
      condition: (item) => item.quantity <= item.reorderPoint,
      action: (item) => this.triggerReorder(item)
    });

    // Price alert rule
    this.rules.set('price-change', {
      condition: (item, oldItem) => Math.abs(item.price - oldItem.price) > 50,
      action: (item) => this.createPriceAlert(item)
    });

    // Low stock rule
    this.rules.set('low-stock', {
      condition: (item) => item.quantity < 5,
      action: (item) => this.createLowStockAlert(item)
    });
  }

  async processInventoryUpdate(item, oldItem = null) {
    // Apply business rules
    for (const [ruleId, rule] of this.rules) {
      if (rule.condition(item, oldItem)) {
        await rule.action(item);
      }
    }

    // Update database
    await dataStore.updateInventoryQuantity(item.sku, item.quantity);
    
    return item;
  }

  async triggerReorder(item) {
    const reorderQuantity = item.reorderPoint * 3; // Order 3x reorder point
    
    const purchaseOrder = {
      id: `PO-${Date.now()}`,
      sku: item.sku,
      quantity: reorderQuantity,
      supplier: item.supplier,
      estimatedCost: item.price * reorderQuantity * 0.6, // 60% of retail
      status: 'pending',
      createdAt: new Date()
    };

    // In real app, this would call supplier API
    console.log('Creating purchase order:', purchaseOrder);
    
    this.createAlert({
      type: 'reorder',
      message: `Auto-reorder triggered for ${item.name} (${reorderQuantity} units)`,
      item: item.sku,
      severity: 'info'
    });

    return purchaseOrder;
  }

  async processNewOrder(orderData) {
    const order = {
      id: `ORD-${Date.now()}`,
      ...orderData,
      total: 0,
      status: 'processing'
    };

    // Calculate total and check inventory
    for (const item of order.items) {
      const inventoryItem = await dataStore.db.transaction(['inventory'], 'readonly')
        .objectStore('inventory').get(item.sku);
      
      if (!inventoryItem) {
        throw new Error(`Product ${item.sku} not found`);
      }
      
      if (inventoryItem.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${inventoryItem.name}`);
      }
      
      item.price = inventoryItem.price;
      order.total += item.price * item.quantity;
    }

    // Process the order
    await dataStore.addOrder(order);
    
    this.createAlert({
      type: 'order',
      message: `New order processed: ${order.id} ($${order.total})`,
      severity: 'success'
    });

    return order;
  }

  async generateInsights() {
    const inventory = await dataStore.getAllInventory();
    const lowStock = await dataStore.getLowStockItems();
    
    const insights = {
      totalValue: inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      totalItems: inventory.length,
      lowStockCount: lowStock.length,
      topCategories: this.getTopCategories(inventory),
      reorderSuggestions: lowStock.map(item => ({
        sku: item.sku,
        name: item.name,
        currentStock: item.quantity,
        suggestedOrder: item.reorderPoint * 2
      }))
    };

    return insights;
  }

  getTopCategories(inventory) {
    const categories = {};
    inventory.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });
    
    return Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));
  }

  createAlert(alert) {
    this.alerts.unshift({
      ...alert,
      id: Date.now(),
      timestamp: new Date()
    });
    
    // Keep only last 50 alerts
    this.alerts = this.alerts.slice(0, 50);
  }

  createLowStockAlert(item) {
    this.createAlert({
      type: 'warning',
      message: `Critical stock level: ${item.name} has only ${item.quantity} units`,
      item: item.sku,
      severity: 'high'
    });
  }

  createPriceAlert(item) {
    this.createAlert({
      type: 'price',
      message: `Significant price change detected for ${item.name}`,
      item: item.sku,
      severity: 'medium'
    });
  }
}

export const businessLogic = new BusinessLogicEngine();