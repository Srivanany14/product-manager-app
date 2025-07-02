const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const FORECASTS_TABLE = process.env.FORECASTS_TABLE;
const SALES_DATA_TABLE = process.env.SALES_DATA_TABLE;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

exports.handler = async (event) => {
  const { httpMethod, pathParameters, body } = event;
  const productId = pathParameters?.productId;

  try {
    switch (httpMethod) {
      case 'GET':
        return await getForecast(productId);
      
      case 'POST':
        return await createForecast(JSON.parse(body));
      
      case 'OPTIONS':
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'OK' }),
        };
      
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
      }),
    };
  }
};

async function getForecast(productId) {
  try {
    const params = {
      TableName: FORECASTS_TABLE,
      KeyConditionExpression: 'productId = :productId',
      ExpressionAttributeValues: {
        ':productId': productId,
      },
      ScanIndexForward: false, // Get latest forecasts first
    };

    const result = await dynamoDB.query(params).promise();
    
    if (result.Items.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'No forecasts found for this product' }),
      };
    }

    // Get the latest forecast
    const latestForecast = result.Items[0];
    
    // Get historical sales data for context
    const salesData = await getSalesData(productId, 30);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        productId,
        forecast: latestForecast,
        historicalData: salesData,
        generatedAt: latestForecast.createdAt,
      }),
    };
  } catch (error) {
    throw error;
  }
}

async function createForecast(forecastData) {
  try {
    const { productId, modelConfig, trainingData } = forecastData;
    
    if (!productId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Product ID is required' }),
      };
    }

    // Get historical sales data
    const salesData = await getSalesData(productId, 60); // 60 days of history
    
    if (salesData.length < 7) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Insufficient data for forecasting. Need at least 7 days of sales data.' 
        }),
      };
    }

    // Generate forecast using simplified model
    const forecast = await generateForecast(salesData, modelConfig);
    
    const timestamp = new Date().toISOString();
    const forecastDate = new Date().toISOString().split('T')[0];

    const forecastRecord = {
      productId,
      forecastDate,
      createdAt: timestamp,
      model: modelConfig?.model || 'SimplifiedTimeLLM',
      horizon: forecast.horizon,
      predictions: forecast.predictions,
      confidence: forecast.confidence,
      accuracy: forecast.accuracy,
      metrics: forecast.metrics,
      historicalDataPoints: salesData.length,
    };

    const params = {
      TableName: FORECASTS_TABLE,
      Item: forecastRecord,
    };

    await dynamoDB.put(params).promise();

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: 'Forecast created successfully',
        forecast: forecastRecord,
      }),
    };
  } catch (error) {
    throw error;
  }
}

async function getSalesData(productId, days = 30) {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

    const params = {
      TableName: SALES_DATA_TABLE,
      KeyConditionExpression: 'productId = :productId AND #date BETWEEN :startDate AND :endDate',
      ExpressionAttributeNames: {
        '#date': 'date',
      },
      ExpressionAttributeValues: {
        ':productId': productId,
        ':startDate': startDate.toISOString().split('T')[0],
        ':endDate': endDate.toISOString().split('T')[0],
      },
      ScanIndexForward: true, // Chronological order
    };

    const result = await dynamoDB.query(params).promise();
    return result.Items || [];
  } catch (error) {
    console.error('Error getting sales data:', error);
    return [];
  }
}

async function generateForecast(salesData, config = {}) {
  try {
    const horizon = config.horizon || 7; // Default 7-day forecast
    const sequence = salesData.map(d => d.quantity || 0);
    
    // Simple forecasting algorithm (can be replaced with actual Time-LLM)
    const forecast = simpleMovingAverageForecast(sequence, horizon);
    
    // Calculate confidence and accuracy metrics
    const confidence = calculateConfidence(sequence);
    const accuracy = estimateAccuracy(sequence);
    
    const predictions = forecast.map((value, index) => ({
      day: index + 1,
      date: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      demand: Math.max(0, Math.round(value)),
      confidence: confidence,
    }));

    return {
      horizon,
      predictions,
      confidence: Math.round(confidence * 100) / 100,
      accuracy: Math.round(accuracy * 100) / 100,
      metrics: {
        mean: calculateMean(sequence),
        variance: calculateVariance(sequence),
        trend: calculateTrend(sequence),
      },
    };
  } catch (error) {
    throw error;
  }
}

function simpleMovingAverageForecast(data, horizon, window = 7) {
  if (data.length < window) {
    window = Math.max(1, data.length);
  }
  
  const forecast = [];
  const lastValues = data.slice(-window);
  const average = lastValues.reduce((sum, val) => sum + val, 0) / lastValues.length;
  
  // Add trend component
  const trend = calculateTrend(data);
  
  for (let i = 0; i < horizon; i++) {
    // Simple forecast with trend and seasonal component
    const seasonal = Math.sin((i * 2 * Math.PI) / 7) * (average * 0.1); // Weekly seasonality
    const trendComponent = trend * (i + 1);
    const noise = (Math.random() - 0.5) * (average * 0.05); // Small noise
    
    forecast.push(average + trendComponent + seasonal + noise);
  }
  
  return forecast;
}

function calculateTrend(data) {
  if (data.length < 2) return 0;
  
  const n = data.length;
  const sumX = (n * (n - 1)) / 2; // Sum of indices
  const sumY = data.reduce((sum, val) => sum + val, 0);
  const sumXY = data.reduce((sum, val, index) => sum + (val * index), 0);
  const sumX2 = data.reduce((sum, val, index) => sum + (index * index), 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return slope || 0;
}

function calculateMean(data) {
  return data.reduce((sum, val) => sum + val, 0) / data.length;
}

function calculateVariance(data) {
  const mean = calculateMean(data);
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  return variance;
}

function calculateConfidence(data) {
  const variance = calculateVariance(data);
  const mean = calculateMean(data);
  const cv = variance / (mean || 1); // Coefficient of variation
  
  // Higher variance relative to mean = lower confidence
  const confidence = Math.max(0.5, Math.min(0.95, 1 - (cv / 10)));
  return confidence;
}

function estimateAccuracy(data) {
  // Simple accuracy estimation based on data consistency
  const variance = calculateVariance(data);
  const mean = calculateMean(data);
  
  if (mean === 0) return 0.5;
  
  const stability = 1 / (1 + (variance / mean));
  return Math.max(0.6, Math.min(0.95, 0.7 + (stability * 0.25)));
}

// Function to seed sample sales data
async function seedSalesData() {
  const productIds = ['SKU001', 'SKU002', 'SKU003', 'SKU004', 'SKU005'];
  
  for (const productId of productIds) {
    // Generate 60 days of sample sales data
    for (let i = 60; i >= 0; i--) {
      const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
      const dateString = date.toISOString().split('T')[0];
      
      // Generate realistic sales data with patterns
      const baseQuantity = getBaseQuantity(productId);
      const weeklyPattern = getWeeklyPattern(date.getDay());
      const seasonalPattern = getSeasonalPattern(date.getMonth());
      const randomVariation = 0.8 + (Math.random() * 0.4); // 80-120% variation
      
      const quantity = Math.round(baseQuantity * weeklyPattern * seasonalPattern * randomVariation);
      
      const salesRecord = {
        productId,
        date: dateString,
        quantity: Math.max(0, quantity),
        revenue: quantity * getProductPrice(productId),
        timestamp: date.toISOString(),
      };

      const params = {
        TableName: SALES_DATA_TABLE,
        Item: salesRecord,
      };

      try {
        await dynamoDB.put(params).promise();
      } catch (error) {
        console.error(`Error seeding data for ${productId} on ${dateString}:`, error);
      }
    }
  }
}

function getBaseQuantity(productId) {
  const baseQuantities = {
    'SKU001': 25, // iPhone
    'SKU002': 18, // Samsung
    'SKU003': 45, // Nike shoes
    'SKU004': 120, // Coca-Cola
    'SKU005': 8,  // MacBook
  };
  return baseQuantities[productId] || 20;
}

function getWeeklyPattern(dayOfWeek) {
  // Monday=1, Sunday=0
  const patterns = [0.7, 1.2, 1.1, 1.0, 1.3, 1.5, 1.4]; // Weekend higher
  return patterns[dayOfWeek] || 1.0;
}

function getSeasonalPattern(month) {
  // Seasonal variations throughout the year
  const patterns = [0.8, 0.9, 1.0, 1.1, 1.2, 1.1, 1.0, 0.9, 1.0, 1.1, 1.3, 1.4];
  return patterns[month] || 1.0;
}

function getProductPrice(productId) {
  const prices = {
    'SKU001': 1199.99,
    'SKU002': 1299.99,
    'SKU003': 129.99,
    'SKU004': 4.99,
    'SKU005': 1999.99,
  };
  return prices[productId] || 100.0;
}