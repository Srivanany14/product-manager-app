const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({ 
  region: process.env.AWS_REGION || 'us-east-1',
  profile: process.env.AWS_PROFILE || 'default'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

const PRODUCTS_TABLE = 'inventory-products';
const SALES_DATA_TABLE = 'inventory-sales-data';

// Sample products data
const sampleProducts = [
  {
    productId: 'SKU001',
    name: 'iPhone 15 Pro Max 256GB',
    category: 'Electronics',
    price: 1199.99,
    stock: 45,
    reorderPoint: 20,
    supplier: 'Apple Inc.',
    location: 'A-12-B',
    description: 'Latest iPhone with advanced camera system',
    weight: 0.221,
    dimensions: '6.33 x 3.05 x 0.32 inches',
  },
  {
    productId: 'SKU002',
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Electronics',
    price: 1299.99,
    stock: 12,
    reorderPoint: 25,
    supplier: 'Samsung',
    location: 'A-13-C',
    description: 'Premium Android smartphone with S Pen',
    weight: 0.232,
    dimensions: '6.40 x 3.11 x 0.34 inches',
  },
  {
    productId: 'SKU003',
    name: 'Nike Air Max 270',
    category: 'Footwear',
    price: 129.99,
    stock: 0,
    reorderPoint: 50,
    supplier: 'Nike Inc.',
    location: 'B-05-A',
    description: 'Comfortable running shoes with Air Max technology',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['Black', 'White', 'Red', 'Blue'],
  },
  {
    productId: 'SKU004',
    name: 'Coca-Cola 12 Pack Cans',
    category: 'Beverages',
    price: 4.99,
    stock: 2847,
    reorderPoint: 500,
    supplier: 'Coca-Cola Co.',
    location: 'C-01-D',
    description: 'Classic Coca-Cola 12oz cans, pack of 12',
    expiryMonths: 12,
    volume: '12 fl oz per can',
  },
  {
    productId: 'SKU005',
    name: 'MacBook Pro 14" M3',
    category: 'Electronics',
    price: 1999.99,
    stock: 8,
    reorderPoint: 15,
    supplier: 'Apple Inc.',
    location: 'A-14-B',
    description: 'Professional laptop with M3 chip',
    specs: {
      processor: 'Apple M3',
      memory: '16GB',
      storage: '512GB SSD',
      display: '14.2-inch Liquid Retina XDR'
    },
  },
  {
    productId: 'SKU006',
    name: 'Sony WH-1000XM5 Headphones',
    category: 'Electronics',
    price: 399.99,
    stock: 23,
    reorderPoint: 30,
    supplier: 'Sony Corporation',
    location: 'A-15-A',
    description: 'Wireless noise-canceling headphones',
    batteryLife: '30 hours',
    features: ['Active Noise Canceling', 'Touch Controls', 'Quick Charge'],
  },
  {
    productId: 'SKU007',
    name: 'Adidas Ultraboost 22',
    category: 'Footwear',
    price: 189.99,
    stock: 67,
    reorderPoint: 40,
    supplier: 'Adidas AG',
    location: 'B-06-C',
    description: 'High-performance running shoes with Boost technology',
    sizes: ['6', '7', '8', '9', '10', '11', '12', '13'],
    colors: ['Core Black', 'Cloud White', 'Solar Red'],
  },
  {
    productId: 'SKU008',
    name: 'KitchenAid Stand Mixer',
    category: 'Home & Kitchen',
    price: 449.99,
    stock: 15,
    reorderPoint: 20,
    supplier: 'KitchenAid',
    location: 'D-02-B',
    description: 'Professional 5-quart stand mixer',
    capacity: '5 quarts',
    warranty: '1 year',
    colors: ['Empire Red', 'Onyx Black', 'Silver'],
  },
  {
    productId: 'SKU009',
    name: 'Levi\'s 501 Original Jeans',
    category: 'Clothing',
    price: 89.99,
    stock: 134,
    reorderPoint: 75,
    supplier: 'Levi Strauss & Co.',
    location: 'E-01-A',
    description: 'Classic straight-leg jeans',
    sizes: ['28', '30', '32', '34', '36', '38', '40'],
    material: '100% Cotton',
    fit: 'Regular',
  },
  {
    productId: 'SKU010',
    name: 'Nintendo Switch OLED',
    category: 'Electronics',
    price: 349.99,
    stock: 29,
    reorderPoint: 35,
    supplier: 'Nintendo',
    location: 'A-16-D',
    description: 'Gaming console with OLED screen',
    screenSize: '7-inch OLED',
    storage: '64GB',
    batteryLife: '4.5-9 hours',
  }
];

// Function to determine product status
function determineStatus(stock, reorderPoint) {
  if (stock <= 0) return 'Out of Stock';
  if (stock <= reorderPoint) return 'Low Stock';
  return 'In Stock';
}

// Function to seed products
async function seedProducts() {
  console.log('🌱 Seeding product data...');
  
  for (const product of sampleProducts) {
    try {
      const timestamp = new Date().toISOString();
      
      const productRecord = {
        ...product,
        timestamp,
        status: determineStatus(product.stock, product.reorderPoint),
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const params = {
        TableName: PRODUCTS_TABLE,
        Item: productRecord,
      };

      await dynamodb.put(params).promise();
      console.log(`✅ Added product: ${product.name}`);
      
      // Small delay to avoid throttling
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Error adding product ${product.name}:`, error.message);
    }
  }
}

// Function to generate realistic sales data
function generateSalesData(productId, days = 60) {
  const salesData = [];
  const baseQuantities = {
    'SKU001': 25,  // iPhone
    'SKU002': 18,  // Samsung
    'SKU003': 45,  // Nike shoes
    'SKU004': 120, // Coca-Cola
    'SKU005': 8,   // MacBook
    'SKU006': 12,  // Sony headphones
    'SKU007': 35,  // Adidas shoes
    'SKU008': 5,   // KitchenAid mixer
    'SKU009': 40,  // Levi's jeans
    'SKU010': 15,  // Nintendo Switch
  };

  const baseQuantity = baseQuantities[productId] || 20;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
    const dateString = date.toISOString().split('T')[0];
    
    // Add patterns based on day of week and seasonal trends
    const dayOfWeek = date.getDay();
    const month = date.getMonth();
    
    // Weekend boost for retail items
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0;
    
    // Holiday season boost (November-December)
    const seasonalMultiplier = (month >= 10) ? 1.4 : 1.0;
    
    // Random daily variation
    const randomVariation = 0.7 + (Math.random() * 0.6); // 70% to 130%
    
    // Special events (simulate flash sales, etc.)
    const isSpecialEvent = Math.random() < 0.05; // 5% chance
    const eventMultiplier = isSpecialEvent ? 2.0 : 1.0;
    
    const quantity = Math.round(
      baseQuantity * 
      weekendMultiplier * 
      seasonalMultiplier * 
      randomVariation * 
      eventMultiplier
    );
    
    const productPrices = {
      'SKU001': 1199.99,
      'SKU002': 1299.99,
      'SKU003': 129.99,
      'SKU004': 4.99,
      'SKU005': 1999.99,
      'SKU006': 399.99,
      'SKU007': 189.99,
      'SKU008': 449.99,
      'SKU009': 89.99,
      'SKU010': 349.99,
    };
    
    const price = productPrices[productId] || 100.0;
    
    salesData.push({
      productId,
      date: dateString,
      quantity: Math.max(0, quantity),
      revenue: quantity * price,
      timestamp: date.toISOString(),
    });
  }
  
  return salesData;
}

// Function to seed sales data
async function seedSalesData() {
  console.log('📊 Seeding sales data...');
  
  const productIds = sampleProducts.map(p => p.productId);
  
  for (const productId of productIds) {
    try {
      const salesData = generateSalesData(productId, 60);
      
      console.log(`📈 Generating ${salesData.length} sales records for ${productId}`);
      
      // Batch write for better performance
      const batchSize = 25; // DynamoDB batch write limit
      for (let i = 0; i < salesData.length; i += batchSize) {
        const batch = salesData.slice(i, i + batchSize);
        
        const batchParams = {
          RequestItems: {
            [SALES_DATA_TABLE]: batch.map(sale => ({
              PutRequest: {
                Item: sale
              }
            }))
          }
        };
        
        await dynamodb.batchWrite(batchParams).promise();
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      console.log(`✅ Added sales data for ${productId}`);
      
    } catch (error) {
      console.error(`❌ Error adding sales data for ${productId}:`, error.message);
    }
  }
}

// Function to generate sample forecasts
async function seedForecastData() {
  console.log('🔮 Seeding forecast data...');
  
  const FORECASTS_TABLE = 'inventory-forecasts';
  const productIds = sampleProducts.map(p => p.productId);
  
  for (const productId of productIds) {
    try {
      const today = new Date();
      const forecastDate = today.toISOString().split('T')[0];
      
      // Generate 7-day forecast
      const predictions = [];
      for (let i = 1; i <= 7; i++) {
        const futureDate = new Date(today.getTime() + (i * 24 * 60 * 60 * 1000));
        const dateString = futureDate.toISOString().split('T')[0];
        
        // Base prediction on historical averages with some variation
        const baseQuantities = {
          'SKU001': 25, 'SKU002': 18, 'SKU003': 45, 'SKU004': 120, 'SKU005': 8,
          'SKU006': 12, 'SKU007': 35, 'SKU008': 5, 'SKU009': 40, 'SKU010': 15,
        };
        
        const baseQuantity = baseQuantities[productId] || 20;
        const variation = 0.8 + (Math.random() * 0.4); // 80% to 120%
        const predictedDemand = Math.round(baseQuantity * variation);
        
        predictions.push({
          day: i,
          date: dateString,
          demand: Math.max(0, predictedDemand),
          confidence: 0.85 + (Math.random() * 0.1), // 85% to 95%
        });
      }
      
      const forecastRecord = {
        productId,
        forecastDate,
        createdAt: today.toISOString(),
        model: 'SimplifiedTimeLLM',
        horizon: 7,
        predictions,
        confidence: 0.88,
        accuracy: 0.85,
        metrics: {
          mean: predictions.reduce((sum, p) => sum + p.demand, 0) / predictions.length,
          variance: 15.2,
          trend: 0.1,
        },
        historicalDataPoints: 60,
      };
      
      const params = {
        TableName: FORECASTS_TABLE,
        Item: forecastRecord,
      };
      
      await dynamodb.put(params).promise();
      console.log(`✅ Added forecast for ${productId}`);
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Error adding forecast for ${productId}:`, error.message);
    }
  }
}

// Main seeding function
async function seedAll() {
  try {
    console.log('🚀 Starting data seeding process...');
    console.log('');
    
    await seedProducts();
    console.log('');
    
    await seedSalesData();
    console.log('');
    
    await seedForecastData();
    console.log('');
    
    console.log('🎉 All sample data seeded successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   • ${sampleProducts.length} products added`);
    console.log(`   • ${sampleProducts.length * 61} sales records added (61 days each)`);
    console.log(`   • ${sampleProducts.length} forecasts generated`);
    console.log('');
    console.log('✅ Your inventory system is ready to use!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Export functions for individual use
module.exports = {
  seedProducts,
  seedSalesData,
  seedForecastData,
  seedAll,
};

// Run if called directly
if (require.main === module) {
  seedAll();
}