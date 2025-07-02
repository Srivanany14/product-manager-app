const AWS = require('aws-sdk');
const csv = require('csv-parser');
const { Readable } = require('stream');

const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const DATA_BUCKET = process.env.DATA_BUCKET;
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

exports.handler = async (event) => {
  const { httpMethod, body } = event;

  try {
    if (httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'OK' }),
      };
    }

    if (httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }

    const { action, ...params } = JSON.parse(body);

    switch (action) {
      case 'getSignedUrl':
        return await getSignedUploadUrl(params);
      
      case 'processFile':
        return await processUploadedFile(params);
      
      case 'validateData':
        return await validateUploadedData(params);
      
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' }),
        };
    }
  } catch (error) {
    console.error('File upload error:', error);
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

async function getSignedUploadUrl({ fileName, fileType, userId }) {
  try {
    const key = `uploads/${userId}/${Date.now()}-${fileName}`;
    
    const params = {
      Bucket: DATA_BUCKET,
      Key: key,
      ContentType: fileType,
      Expires: 3600, // 1 hour
    };

    const signedUrl = await s3.getSignedUrlPromise('putObject', params);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        signedUrl,
        key,
        bucket: DATA_BUCKET,
      }),
    };
  } catch (error) {
    throw error;
  }
}

async function processUploadedFile({ key, fileType, userId }) {
  try {
    // Download file from S3
    const params = {
      Bucket: DATA_BUCKET,
      Key: key,
    };

    const fileData = await s3.getObject(params).promise();
    const fileContent = fileData.Body.toString('utf-8');

    let processedData;
    
    if (fileType.includes('csv') || fileType.includes('text')) {
      processedData = await processCSVData(fileContent);
    } else if (fileType.includes('json')) {
      processedData = await processJSONData(fileContent);
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Unsupported file type' }),
      };
    }

    // Validate the processed data
    const validation = validateProductData(processedData);
    
    if (!validation.isValid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Data validation failed',
          issues: validation.issues,
          sampleData: processedData.slice(0, 5),
        }),
      };
    }

    // Store processed data
    const processingResult = await storeProcessedData(processedData, userId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'File processed successfully',
        totalRecords: processedData.length,
        successfulImports: processingResult.successful,
        errors: processingResult.errors,
        preview: processedData.slice(0, 10),
      }),
    };
  } catch (error) {
    throw error;
  }
}

async function processCSVData(csvContent) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from([csvContent]);
    
    stream
      .pipe(csv({
        skipEmptyLines: true,
        headers: true,
      }))
      .on('data', (data) => {
        // Clean and normalize the data
        const cleanedData = {};
        Object.keys(data).forEach(key => {
          const cleanKey = key.trim().toLowerCase();
          cleanedData[cleanKey] = data[key]?.trim();
        });
        results.push(cleanedData);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function processJSONData(jsonContent) {
  try {
    const data = JSON.parse(jsonContent);
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
}

function validateProductData(data) {
  const issues = [];
  const requiredFields = ['name', 'category', 'price', 'stock'];
  
  if (!Array.isArray(data) || data.length === 0) {
    return {
      isValid: false,
      issues: ['No data found or invalid format'],
    };
  }

  data.forEach((row, index) => {
    // Check required fields
    requiredFields.forEach(field => {
      if (!row[field] && !row[field.toLowerCase()]) {
        issues.push(`Row ${index + 1}: Missing required field '${field}'`);
      }
    });

    // Validate data types
    const price = parseFloat(row.price || row.Price);
    const stock = parseInt(row.stock || row.Stock);

    if (isNaN(price) || price < 0) {
      issues.push(`Row ${index + 1}: Invalid price value`);
    }

    if (isNaN(stock) || stock < 0) {
      issues.push(`Row ${index + 1}: Invalid stock value`);
    }
  });

  return {
    isValid: issues.length === 0,
    issues: issues.slice(0, 10), // Limit to first 10 issues
  };
}

async function storeProcessedData(data, userId) {
  const results = {
    successful: 0,
    errors: [],
  };

  for (let i = 0; i < data.length; i++) {
    try {
      const row = data[i];
      const timestamp = new Date().toISOString();
      
      // Normalize field names
      const product = {
        productId: row.productid || row.sku || row.id || `IMPORT-${Date.now()}-${i}`,
        timestamp,
        name: row.name || row.productname,
        category: row.category,
        price: parseFloat(row.price),
        stock: parseInt(row.stock || row.inventory),
        reorderPoint: parseInt(row.reorderpoint || row.reorder_point || 10),
        supplier: row.supplier || row.vendor || 'Unknown',
        location: row.location || row.warehouse || '',
        status: determineStatus(
          parseInt(row.stock || row.inventory),
          parseInt(row.reorderpoint || row.reorder_point || 10)
        ),
        importedBy: userId,
        importedAt: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const params = {
        TableName: PRODUCTS_TABLE,
        Item: product,
      };

      await dynamoDB.put(params).promise();
      results.successful++;

    } catch (error) {
      results.errors.push({
        row: i + 1,
        error: error.message,
        data: data[i],
      });
    }
  }

  return results;
}

function determineStatus(stock, reorderPoint) {
  if (stock <= 0) return 'Out of Stock';
  if (stock <= reorderPoint) return 'Low Stock';
  return 'In Stock';
}

async function validateUploadedData({ key }) {
  try {
    const params = {
      Bucket: DATA_BUCKET,
      Key: key,
    };

    const fileData = await s3.getObject(params).promise();
    const fileContent = fileData.Body.toString('utf-8');

    // Quick validation without processing
    const lines = fileContent.split('\n').filter(line => line.trim());
    const header = lines[0];
    const sampleRows = lines.slice(1, 6); // First 5 data rows

    const headerColumns = header.split(',').map(col => col.trim().toLowerCase());
    const requiredColumns = ['name', 'category', 'price', 'stock'];
    const missingColumns = requiredColumns.filter(col => 
      !headerColumns.includes(col) && !headerColumns.includes(col.replace(/\s+/g, ''))
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        isValid: missingColumns.length === 0,
        totalRows: lines.length - 1,
        columns: headerColumns,
        missingColumns,
        sampleData: sampleRows.slice(0, 3),
        suggestions: generateColumnSuggestions(headerColumns, requiredColumns),
      }),
    };
  } catch (error) {
    throw error;
  }
}

function generateColumnSuggestions(actualColumns, requiredColumns) {
  const suggestions = {};
  
  requiredColumns.forEach(required => {
    const matches = actualColumns.filter(actual => 
      actual.includes(required) || 
      required.includes(actual) ||
      getColumnSimilarity(actual, required) > 0.7
    );
    
    if (matches.length > 0) {
      suggestions[required] = matches[0];
    }
  });

  return suggestions;
}

function getColumnSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}