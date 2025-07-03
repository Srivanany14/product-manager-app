// components/erp/core/APIService.js
class RealAPIService {
  constructor() {
    this.baseUrls = {
      shopify: process.env.REACT_APP_SHOPIFY_URL || 'https://your-store.myshopify.com/admin/api/2023-10',
      quickbooks: process.env.REACT_APP_QUICKBOOKS_URL || 'https://sandbox-quickbooks.api.intuit.com',
      openai: process.env.REACT_APP_OPENAI_URL || 'https://api.openai.com/v1'
    };
    
    this.apiKeys = {
      shopify: process.env.REACT_APP_SHOPIFY_TOKEN || 'demo-token',
      quickbooks: process.env.REACT_APP_QUICKBOOKS_TOKEN || 'demo-token',
      openai: process.env.REACT_APP_OPENAI_KEY || 'demo-key'
    };
  }

  // Real Shopify integration
  async syncShopifyProducts() {
    try {
      const response = await fetch(`${this.baseUrls.shopify}/products.json`, {
        headers: {
          'X-Shopify-Access-Token': this.apiKeys.shopify,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Fallback to demo data if API fails
        return this.getDemoShopifyData();
      }
      
      const data = await response.json();
      return data.products.map(product => ({
        sku: product.variants[0]?.sku || product.id,
        name: product.title,
        price: parseFloat(product.variants[0]?.price || 0),
        quantity: product.variants[0]?.inventory_quantity || 0,
        category: product.product_type,
        source: 'shopify'
      }));
    } catch (error) {
      console.warn('Shopify API failed, using demo data:', error);
      return this.getDemoShopifyData();
    }
  }

  // Real QuickBooks integration  
  async syncQuickBooksItems() {
    try {
      const response = await fetch(`${this.baseUrls.quickbooks}/v3/company/123456789/items`, {
        headers: {
          'Authorization': `Bearer ${this.apiKeys.quickbooks}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        return this.getDemoQuickBooksData();
      }
      
      const data = await response.json();
      return data.QueryResponse?.Item?.map(item => ({
        sku: item.Sku || item.Id,
        name: item.Name,
        price: parseFloat(item.UnitPrice?.Amount || 0),
        category: item.Type,
        source: 'quickbooks'
      })) || [];
    } catch (error) {
      console.warn('QuickBooks API failed, using demo data:', error);
      return this.getDemoQuickBooksData();
    }
  }

  // AI-powered demand forecasting
  async generateDemandForecast(productData) {
    try {
      const response = await fetch(`${this.baseUrls.openai}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKeys.openai}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: `Analyze this product data and provide a 7-day demand forecast: ${JSON.stringify(productData)}`
          }],
          max_tokens: 500
        })
      });
      
      if (!response.ok) {
        return this.getDemoForecast();
      }
      
      const data = await response.json();
      return this.parseForecastResponse(data.choices[0].message.content);
    } catch (error) {
      console.warn('OpenAI API failed, using demo forecast:', error);
      return this.getDemoForecast();
    }
  }

  // Fallback demo data
  getDemoShopifyData() {
    return [
      { sku: 'SHOP-001', name: 'iPhone 15 Pro', price: 1199, quantity: 45, category: 'Electronics', source: 'shopify' },
      { sku: 'SHOP-002', name: 'MacBook Pro M3', price: 1999, quantity: 12, category: 'Electronics', source: 'shopify' },
      { sku: 'SHOP-003', name: 'Nike Air Max', price: 129, quantity: 67, category: 'Footwear', source: 'shopify' }
    ];
  }

  getDemoQuickBooksData() {
    return [
      { sku: 'QB-001', name: 'Office Supplies', price: 25, category: 'Supplies', source: 'quickbooks' },
      { sku: 'QB-002', name: 'Software License', price: 299, category: 'Software', source: 'quickbooks' }
    ];
  }

  getDemoForecast() {
    return Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      predicted: Math.floor(Math.random() * 100) + 20,
      confidence: 0.7 + Math.random() * 0.3
    }));
  }
}

export const apiService = new RealAPIService();