// Enhanced AWS Configuration with Real Backend Integration
import { 
  CognitoIdentityProviderClient, 
  InitiateAuthCommand, 
  SignUpCommand, 
  ConfirmSignUpCommand 
} from '@aws-sdk/client-cognito-identity-provider';

import { 
  DynamoDBClient, 
  QueryCommand, 
  PutItemCommand, 
  ScanCommand 
} from '@aws-sdk/client-dynamodb';

import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand 
} from '@aws-sdk/client-s3';

export const awsConfig = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  apiGatewayUrl: process.env.NEXT_PUBLIC_API_GATEWAY_URL,
  userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID,
  userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
  dataBucket: process.env.NEXT_PUBLIC_DATA_BUCKET,
  
  endpoints: {
    auth: '/auth',
    products: '/products',
    forecasting: '/forecasting',
    upload: '/upload',
    analytics: '/analytics',
    notifications: '/notifications',
    orders: '/orders',
        connections: '/erp/connections',
    sync: '/erp/sync',
    orders: '/erp/orders',
    suppliers: '/erp/suppliers',
    warehouses: '/erp/warehouses',
    reports: '/erp/reports',
    webhooks: '/erp/webhooks'
  },
    eventBridge: {
    eventBusName: process.env.NEXT_PUBLIC_ERP_EVENT_BUS || 'erp-inventory-events',
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'
  },

  // SQS configuration
  sqs: {
    queues: {
      erpOrders: process.env.NEXT_PUBLIC_SQS_ERP_ORDERS_QUEUE,
      erpSuppliers: process.env.NEXT_PUBLIC_SQS_ERP_SUPPLIERS_QUEUE,
      erpWarehouses: process.env.NEXT_PUBLIC_SQS_ERP_WAREHOUSES_QUEUE,
      erpSync: process.env.NEXT_PUBLIC_SQS_ERP_SYNC_QUEUE
    }
  },

  // DynamoDB tables
  dynamoTables: {
    erpIntegrations: process.env.NEXT_PUBLIC_DYNAMODB_ERP_INTEGRATIONS_TABLE,
    syncJobs: process.env.NEXT_PUBLIC_DYNAMODB_SYNC_JOBS_TABLE,
    auditLogs: process.env.NEXT_PUBLIC_DYNAMODB_AUDIT_LOGS_TABLE
  }
};

// Enhanced API client with real-time features
export class EnhancedInventoryAPI {
  constructor() {
    this.baseUrl = awsConfig.apiGatewayUrl;
    this.token = null;
    this.refreshToken = null;
    this.eventListeners = new Map();
    
    // Initialize AWS clients
    this.cognitoClient = new CognitoIdentityProviderClient({ 
      region: awsConfig.region 
    });
    this.dynamoClient = new DynamoDBClient({ 
      region: awsConfig.region 
    });
    this.s3Client = new S3Client({ 
      region: awsConfig.region 
    });
  }

  // Event system for real-time updates
  addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  removeEventListener(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => callback(data));
    }
  }

  setAuthToken(token) {
    this.token = token;
    localStorage.setItem('accessToken', token);
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Try to refresh token
        await this.refreshAccessToken();
        // Retry request
        headers.Authorization = `Bearer ${this.token}`;
        const retryResponse = await fetch(url, {
          ...options,
          headers,
        });
        
        if (!retryResponse.ok) {
          throw new Error('Authentication failed');
        }
        return retryResponse.json();
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      this.emit('error', { endpoint, error: error.message });
      throw error;
    }
  }

  // Enhanced Authentication Methods
  async signUp(email, password, fullName) {
    try {
      const response = await this.makeRequest(awsConfig.endpoints.auth, {
        method: 'POST',
        body: JSON.stringify({
          action: 'signup',
          email,
          password,
          fullName,
        }),
      });

      this.emit('userSignedUp', { email, response });
      return response;
    } catch (error) {
      this.emit('authError', { action: 'signup', error: error.message });
      throw error;
    }
  }

  async signIn(email, password) {
    try {
      const response = await this.makeRequest(awsConfig.endpoints.auth, {
        method: 'POST',
        body: JSON.stringify({
          action: 'signin',
          email,
          password,
        }),
      });

      if (response.tokens) {
        this.setAuthToken(response.tokens.accessToken);
        this.refreshToken = response.tokens.refreshToken;
        localStorage.setItem('refreshToken', response.tokens.refreshToken);
        localStorage.setItem('idToken', response.tokens.idToken);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        
        this.emit('userSignedIn', { user: response.user });
      }

      return response;
    } catch (error) {
      this.emit('authError', { action: 'signin', error: error.message });
      throw error;
    }
  }

  async refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.makeRequest(awsConfig.endpoints.auth, {
        method: 'POST',
        body: JSON.stringify({
          action: 'refreshToken',
          refreshToken,
        }),
      });

      if (response.tokens) {
        this.setAuthToken(response.tokens.accessToken);
        localStorage.setItem('idToken', response.tokens.idToken);
      }

      return response;
    } catch (error) {
      // If refresh fails, clear all tokens
      this.signOut();
      throw error;
    }
  }

  async signOut() {
    try {
      if (this.token) {
        await this.makeRequest(awsConfig.endpoints.auth, {
          method: 'POST',
          body: JSON.stringify({
            action: 'signout',
            accessToken: this.token,
          }),
        });
      }
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      // Clear all local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('currentUser');
      this.token = null;
      this.refreshToken = null;
      
      this.emit('userSignedOut');
    }
  }

  // Enhanced Product Methods with Real-time Updates
  async getProducts(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams ? `${awsConfig.endpoints.products}?${queryParams}` : awsConfig.endpoints.products;
      
      const response = await this.makeRequest(url, { method: 'GET' });
      
      this.emit('productsLoaded', response);
      return response;
    } catch (error) {
      this.emit('productsError', { action: 'load', error: error.message });
      throw error;
    }
  }

  async createProduct(productData) {
    try {
      const response = await this.makeRequest(awsConfig.endpoints.products, {
        method: 'POST',
        body: JSON.stringify(productData),
      });

      this.emit('productCreated', response);
      this.emit('inventoryChanged', { action: 'create', product: response });
      return response;
    } catch (error) {
      this.emit('productsError', { action: 'create', error: error.message });
      throw error;
    }
  }

  async updateProduct(productId, updates) {
    try {
      const response = await this.makeRequest(`${awsConfig.endpoints.products}/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      this.emit('productUpdated', response);
      this.emit('inventoryChanged', { action: 'update', product: response });
      
      // Check for low stock alerts
      if (response.stock <= response.reorderPoint) {
        this.emit('lowStockAlert', response);
      }
      
      return response;
    } catch (error) {
      this.emit('productsError', { action: 'update', error: error.message });
      throw error;
    }
  }

  async deleteProduct(productId) {
    try {
      const response = await this.makeRequest(`${awsConfig.endpoints.products}/${productId}`, {
        method: 'DELETE',
      });

      this.emit('productDeleted', { productId });
      this.emit('inventoryChanged', { action: 'delete', productId });
      return response;
    } catch (error) {
      this.emit('productsError', { action: 'delete', error: error.message });
      throw error;
    }
  }

  // Enhanced Forecasting with Real-time Updates
  async createForecast(productId, modelConfig = {}) {
    try {
      this.emit('forecastStarted', { productId });
      
      const response = await this.makeRequest(awsConfig.endpoints.forecasting, {
        method: 'POST',
        body: JSON.stringify({
          productId,
          modelConfig: {
            model: 'TimeLLM',
            horizon: 7,
            confidence: 0.85,
            ...modelConfig
          },
        }),
      });

      this.emit('forecastCompleted', { productId, forecast: response });
      return response;
    } catch (error) {
      this.emit('forecastError', { productId, error: error.message });
      throw error;
    }
  }

  async getForecast(productId) {
    try {
      const response = await this.makeRequest(`${awsConfig.endpoints.forecasting}/${productId}`, {
        method: 'GET',
      });

      this.emit('forecastLoaded', { productId, forecast: response });
      return response;
    } catch (error) {
      this.emit('forecastError', { productId, error: error.message });
      throw error;
    }
  }

  // Advanced Analytics Methods
  async getAnalytics(timeRange = '30d') {
    try {
      const response = await this.makeRequest(`${awsConfig.endpoints.analytics}?range=${timeRange}`, {
        method: 'GET',
      });

      this.emit('analyticsLoaded', response);
      return response;
    } catch (error) {
      this.emit('analyticsError', { error: error.message });
      throw error;
    }
  }

  async getInventoryMetrics() {
    try {
      const response = await this.makeRequest(`${awsConfig.endpoints.analytics}/inventory`, {
        method: 'GET',
      });

      this.emit('inventoryMetricsLoaded', response);
      return response;
    } catch (error) {
      this.emit('analyticsError', { error: error.message });
      throw error;
    }
  }

  // File Upload with Progress Tracking
  async uploadFile(file, userId, onProgress = null) {
    try {
      this.emit('uploadStarted', { fileName: file.name, size: file.size });

      // Get signed URL
      const { signedUrl, key } = await this.getUploadUrl(file.name, file.type, userId);

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            this.emit('uploadProgress', { fileName: file.name, progress });
            if (onProgress) onProgress(progress);
          }
        });

        xhr.addEventListener('load', async () => {
          if (xhr.status === 200) {
            try {
              // Process the uploaded file
              const processResult = await this.processUploadedFile(key, file.type, userId);
              
              this.emit('uploadCompleted', { 
                fileName: file.name, 
                key, 
                processResult 
              });
              
              resolve({ key, processResult });
            } catch (processError) {
              this.emit('uploadError', { 
                fileName: file.name, 
                error: processError.message 
              });
              reject(processError);
            }
          } else {
            const error = new Error(`Upload failed with status: ${xhr.status}`);
            this.emit('uploadError', { fileName: file.name, error: error.message });
            reject(error);
          }
        });

        xhr.addEventListener('error', () => {
          const error = new Error('Upload failed');
          this.emit('uploadError', { fileName: file.name, error: error.message });
          reject(error);
        });

        xhr.open('PUT', signedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });
    } catch (error) {
      this.emit('uploadError', { fileName: file.name, error: error.message });
      throw error;
    }
  }

  async getUploadUrl(fileName, fileType, userId) {
    return this.makeRequest(awsConfig.endpoints.upload, {
      method: 'POST',
      body: JSON.stringify({
        action: 'getSignedUrl',
        fileName,
        fileType,
        userId,
      }),
    });
  }

  async processUploadedFile(key, fileType, userId) {
    return this.makeRequest(awsConfig.endpoints.upload, {
      method: 'POST',
      body: JSON.stringify({
        action: 'processFile',
        key,
        fileType,
        userId,
      }),
    });
  }
async connectERP(erpSystem, credentials) {
  try {
    this.emit('erpConnectionStarted', { erpSystem });
    
    const response = await this.makeRequest(awsConfig.erpEndpoints.connections, {
      method: 'POST',
      body: JSON.stringify({
        action: 'connect',
        erpSystem,
        credentials,
        timestamp: new Date().toISOString()
      }),
    });

    this.emit('erpConnectionCompleted', { erpSystem, status: response.status });
    return response;
  } catch (error) {
    this.emit('erpConnectionError', { erpSystem, error: error.message });
    throw error;
  }
}

async disconnectERP(erpSystem) {
  try {
    const response = await this.makeRequest(`${awsConfig.erpEndpoints.connections}/${erpSystem}`, {
      method: 'DELETE',
    });

    this.emit('erpDisconnected', { erpSystem });
    return response;
  } catch (error) {
    this.emit('erpConnectionError', { erpSystem, error: error.message });
    throw error;
  }
}

async getERPConnections() {
  try {
    const response = await this.makeRequest(awsConfig.erpEndpoints.connections, {
      method: 'GET',
    });

    this.emit('erpConnectionsLoaded', response);
    return response;
  } catch (error) {
    this.emit('erpConnectionError', { error: error.message });
    throw error;
  }
}

// ERP Synchronization
async syncERPData(erpSystem, dataType, syncOptions = {}) {
  try {
    this.emit('erpSyncStarted', { erpSystem, dataType });

    const response = await this.makeRequest(awsConfig.erpEndpoints.sync, {
      method: 'POST',
      body: JSON.stringify({
        erpSystem,
        dataType, // 'orders', 'suppliers', 'warehouses', 'products'
        syncType: syncOptions.syncType || 'incremental',
        dateRange: syncOptions.dateRange,
        filters: syncOptions.filters || {}
      }),
    });

    this.emit('erpSyncCompleted', { 
      erpSystem, 
      dataType, 
      jobId: response.jobId,
      status: response.status 
    });
    
    return response;
  } catch (error) {
    this.emit('erpSyncError', { erpSystem, dataType, error: error.message });
    throw error;
  }
}

async getSyncStatus(jobId) {
  try {
    const response = await this.makeRequest(`${awsConfig.erpEndpoints.sync}/${jobId}`, {
      method: 'GET',
    });

    this.emit('syncStatusUpdated', response);
    return response;
  } catch (error) {
    this.emit('erpSyncError', { jobId, error: error.message });
    throw error;
  }
}

// ERP Orders Management
async getERPOrders(erpSystem, filters = {}) {
  try {
    const queryParams = new URLSearchParams({ 
      erpSystem, 
      ...filters 
    }).toString();
    
    const response = await this.makeRequest(`${awsConfig.erpEndpoints.orders}?${queryParams}`, {
      method: 'GET',
    });

    this.emit('erpOrdersLoaded', { erpSystem, orders: response });
    return response;
  } catch (error) {
    this.emit('erpOrdersError', { erpSystem, error: error.message });
    throw error;
  }
}

async createERPOrder(erpSystem, orderData) {
  try {
    const response = await this.makeRequest(awsConfig.erpEndpoints.orders, {
      method: 'POST',
      body: JSON.stringify({
        erpSystem,
        orderData,
        source: 'inventory-system'
      }),
    });

    this.emit('erpOrderCreated', { erpSystem, order: response });
    return response;
  } catch (error) {
    this.emit('erpOrdersError', { erpSystem, action: 'create', error: error.message });
    throw error;
  }
}

async updateERPOrderStatus(erpSystem, orderId, status) {
  try {
    const response = await this.makeRequest(`${awsConfig.erpEndpoints.orders}/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({
        erpSystem,
        status,
        updatedAt: new Date().toISOString()
      }),
    });

    this.emit('erpOrderUpdated', { erpSystem, orderId, status });
    return response;
  } catch (error) {
    this.emit('erpOrdersError', { erpSystem, action: 'update', error: error.message });
    throw error;
  }
}

// ERP Suppliers Management
async getERPSuppliers(erpSystem, filters = {}) {
  try {
    const queryParams = new URLSearchParams({ 
      erpSystem, 
      ...filters 
    }).toString();
    
    const response = await this.makeRequest(`${awsConfig.erpEndpoints.suppliers}?${queryParams}`, {
      method: 'GET',
    });

    this.emit('erpSuppliersLoaded', { erpSystem, suppliers: response });
    return response;
  } catch (error) {
    this.emit('erpSuppliersError', { erpSystem, error: error.message });
    throw error;
  }
}

async getSupplierPerformance(erpSystem, supplierId) {
  try {
    const response = await this.makeRequest(`${awsConfig.erpEndpoints.suppliers}/${supplierId}/performance`, {
      method: 'GET',
    });

    this.emit('supplierPerformanceLoaded', { erpSystem, supplierId, performance: response });
    return response;
  } catch (error) {
    this.emit('erpSuppliersError', { erpSystem, supplierId, error: error.message });
    throw error;
  }
}

// ERP Warehouses Management
async getERPWarehouses(erpSystem, filters = {}) {
  try {
    const queryParams = new URLSearchParams({ 
      erpSystem, 
      ...filters 
    }).toString();
    
    const response = await this.makeRequest(`${awsConfig.erpEndpoints.warehouses}?${queryParams}`, {
      method: 'GET',
    });

    this.emit('erpWarehousesLoaded', { erpSystem, warehouses: response });
    return response;
  } catch (error) {
    this.emit('erpWarehousesError', { erpSystem, error: error.message });
    throw error;
  }
}

async updateWarehouseCapacity(erpSystem, warehouseId, capacity) {
  try {
    const response = await this.makeRequest(`${awsConfig.erpEndpoints.warehouses}/${warehouseId}`, {
      method: 'PUT',
      body: JSON.stringify({
        erpSystem,
        capacity,
        updatedAt: new Date().toISOString()
      }),
    });

    this.emit('warehouseUpdated', { erpSystem, warehouseId, capacity });
    return response;
  } catch (error) {
    this.emit('erpWarehousesError', { erpSystem, action: 'update', error: error.message });
    throw error;
  }
}

// ERP Reports Generation
async generateERPReport(reportType, erpSystems, parameters = {}) {
  try {
    this.emit('reportGenerationStarted', { reportType, erpSystems });

    const response = await this.makeRequest(awsConfig.erpEndpoints.reports, {
      method: 'POST',
      body: JSON.stringify({
        reportType, // 'inventory', 'orders', 'suppliers', 'financial'
        erpSystems, // array of ERP systems to include
        parameters: {
          dateRange: parameters.dateRange || { start: new Date(Date.now() - 30*24*60*60*1000), end: new Date() },
          format: parameters.format || 'json',
          includeCharts: parameters.includeCharts || true,
          ...parameters
        }
      }),
    });

    this.emit('reportGenerationCompleted', { 
      reportType, 
      reportId: response.reportId,
      status: response.status 
    });
    
    return response;
  } catch (error) {
    this.emit('reportGenerationError', { reportType, error: error.message });
    throw error;
  }
}

async getReport(reportId) {
  try {
    const response = await this.makeRequest(`${awsConfig.erpEndpoints.reports}/${reportId}`, {
      method: 'GET',
    });

    this.emit('reportLoaded', response);
    return response;
  } catch (error) {
    this.emit('reportGenerationError', { reportId, error: error.message });
    throw error;
  }
}

// WebSocket for Real-time Updates
initializeWebSocket() {
  if (typeof window === 'undefined') return;

  const wsUrl = `${awsConfig.apiGatewayUrl.replace('https://', 'wss://').replace('http://', 'ws://')}/ws`;
  
  this.ws = new WebSocket(wsUrl);
  
  this.ws.onopen = () => {
    console.log('WebSocket connected');
    this.emit('websocketConnected');
    
    // Send authentication
    if (this.token) {
      this.ws.send(JSON.stringify({
        action: 'authenticate',
        token: this.token
      }));
    }
  };

  this.ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      // Handle different types of real-time updates
      switch (data.type) {
        case 'erp_sync_progress':
          this.emit('erpSyncProgress', data.payload);
          break;
        case 'erp_order_update':
          this.emit('erpOrderRealTimeUpdate', data.payload);
          break;
        case 'erp_connection_status':
          this.emit('erpConnectionStatusUpdate', data.payload);
          break;
        case 'low_stock_alert':
          this.emit('lowStockAlert', data.payload);
          break;
        case 'system_notification':
          this.emit('systemNotification', data.payload);
          break;
        default:
          this.emit('websocketMessage', data);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  this.ws.onclose = () => {
    console.log('WebSocket disconnected');
    this.emit('websocketDisconnected');
    
    // Attempt to reconnect after 5 seconds
    setTimeout(() => {
      if (this.token) {
        this.initializeWebSocket();
      }
    }, 5000);
  };

  this.ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    this.emit('websocketError', error);
  };
}

// Close WebSocket connection
closeWebSocket() {
  if (this.ws) {
    this.ws.close();
    this.ws = null;
  }
}
  // Real-time Notifications
  async getNotifications() {
    try {
      const response = await this.makeRequest(awsConfig.endpoints.notifications, {
        method: 'GET',
      });

      this.emit('notificationsLoaded', response);
      return response;
    } catch (error) {
      this.emit('notificationsError', { error: error.message });
      throw error;
    }
  }

  async markNotificationRead(notificationId) {
    try {
      const response = await this.makeRequest(`${awsConfig.endpoints.notifications}/${notificationId}`, {
        method: 'PUT',
        body: JSON.stringify({ read: true }),
      });

      this.emit('notificationUpdated', { notificationId, read: true });
      return response;
    } catch (error) {
      this.emit('notificationsError', { error: error.message });
      throw error;
    }
  }

  // Initialize from stored tokens
  initializeFromStorage() {
    const accessToken = localStorage.getItem('accessToken');
    const currentUser = localStorage.getItem('currentUser');
    
    if (accessToken) {
      this.setAuthToken(accessToken);
    }
    
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        this.emit('userRestored', { user });
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const isHealthy = response.ok;
      
      this.emit('healthCheck', { healthy: isHealthy, timestamp: new Date() });
      return isHealthy;
    } catch (error) {
      this.emit('healthCheck', { healthy: false, error: error.message, timestamp: new Date() });
      return false;
    }
  }
}

// Singleton instance
export const inventoryAPI = new EnhancedInventoryAPI();

// Enhanced Auth Context
export const AuthContext = {
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;
    
    // Check if token is expired (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      return !isExpired;
    } catch {
      return false;
    }
  },

  getCurrentUser: () => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return null;

    try {
      return JSON.parse(currentUser);
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  },

  logout: async () => {
    await inventoryAPI.signOut();
  },
};

// Auto-initialize on load
if (typeof window !== 'undefined') {
  inventoryAPI.initializeFromStorage();
  
  // Periodic health checks
  setInterval(() => {
    inventoryAPI.healthCheck();
  }, 60000); // Every minute
}