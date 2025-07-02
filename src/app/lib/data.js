// Sample data for the inventory management system

export const dashboardMetrics = {
  totalProducts: 125840,
  totalValue: 4250000,
  lowStock: 847,
  outOfStock: 23,
  revenueToday: 89400,
  ordersToday: 1247,
  avgOrderValue: 71.73,
  inventoryTurnover: 8.4
};

export const productData = [
  {
    id: 'SKU001',
    name: 'iPhone 15 Pro Max 256GB',
    category: 'Electronics',
    price: 1199.99,
    stock: 45,
    sold: 234,
    reorderPoint: 20,
    supplier: 'Apple Inc.',
    location: 'A-12-B',
    status: 'In Stock',
    lastUpdated: '2024-07-01',
    forecast: [65, 59, 80, 81, 56, 55, 40],
    trend: 'up',
    margin: 15.2,
    velocity: 'Fast'
  },
  {
    id: 'SKU002',
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Electronics',
    price: 1299.99,
    stock: 12,
    sold: 189,
    reorderPoint: 25,
    supplier: 'Samsung',
    location: 'A-13-C',
    status: 'Low Stock',
    lastUpdated: '2024-07-01',
    forecast: [45, 49, 60, 71, 46, 35, 30],
    trend: 'down',
    margin: 12.8,
    velocity: 'Medium'
  },
  {
    id: 'SKU003',
    name: 'Nike Air Max 270',
    category: 'Footwear',
    price: 129.99,
    stock: 0,
    sold: 456,
    reorderPoint: 50,
    supplier: 'Nike Inc.',
    location: 'B-05-A',
    status: 'Out of Stock',
    lastUpdated: '2024-06-30',
    forecast: [85, 79, 90, 101, 86, 75, 70],
    trend: 'up',
    margin: 45.3,
    velocity: 'Fast'
  },
  {
    id: 'SKU004',
    name: 'Coca-Cola 12 Pack Cans',
    category: 'Beverages',
    price: 4.99,
    stock: 2847,
    sold: 1234,
    reorderPoint: 500,
    supplier: 'Coca-Cola Co.',
    location: 'C-01-D',
    status: 'In Stock',
    lastUpdated: '2024-07-01',
    forecast: [1200, 1150, 1300, 1400, 1250, 1100, 1050],
    trend: 'stable',
    margin: 35.7,
    velocity: 'Fast'
  },
  {
    id: 'SKU005',
    name: 'MacBook Pro 14" M3',
    category: 'Electronics',
    price: 1999.99,
    stock: 8,
    sold: 67,
    reorderPoint: 15,
    supplier: 'Apple Inc.',
    location: 'A-14-B',
    status: 'Low Stock',
    lastUpdated: '2024-07-01',
    forecast: [25, 29, 35, 31, 26, 22, 20],
    trend: 'down',
    margin: 18.5,
    velocity: 'Slow'
  }
];

export const salesData = [
  { date: '2024-06-25', sales: 45000, orders: 890, items: 2340, profit: 6750 },
  { date: '2024-06-26', sales: 52000, orders: 1020, items: 2680, profit: 7800 },
  { date: '2024-06-27', sales: 48000, orders: 940, items: 2510, profit: 7200 },
  { date: '2024-06-28', sales: 61000, orders: 1180, items: 3020, profit: 9150 },
  { date: '2024-06-29', sales: 55000, orders: 1080, items: 2890, profit: 8250 },
  { date: '2024-06-30', sales: 68000, orders: 1320, items: 3450, profit: 10200 },
  { date: '2024-07-01', sales: 73000, orders: 1420, items: 3780, profit: 10950 }
];

export const categoryData = [
  { name: 'Electronics', value: 45, revenue: 1950000, growth: 12.5, color: '#3B82F6' },
  { name: 'Clothing', value: 25, revenue: 1087500, growth: 8.3, color: '#10B981' },
  { name: 'Home & Garden', value: 15, revenue: 652500, growth: -2.1, color: '#F59E0B' },
  { name: 'Food & Beverages', value: 10, revenue: 435000, growth: 15.7, color: '#EF4444' },
  { name: 'Health & Beauty', value: 5, revenue: 217500, growth: 6.9, color: '#8B5CF6' }
];

export const supplierData = [
  {
    id: 'SUP001',
    name: 'Apple Inc.',
    location: 'Cupertino, CA',
    rating: 4.8,
    productsCount: 156,
    totalValue: 875000,
    paymentTerms: 'Net 30',
    leadTime: 14,
    reliability: 98.5
  },
  {
    id: 'SUP002',
    name: 'Samsung Electronics',
    location: 'Seoul, Korea',
    rating: 4.6,
    productsCount: 143,
    totalValue: 692000,
    paymentTerms: 'Net 45',
    leadTime: 21,
    reliability: 96.2
  },
  {
    id: 'SUP003',
    name: 'Nike Inc.',
    location: 'Beaverton, OR',
    rating: 4.7,
    productsCount: 287,
    totalValue: 543000,
    paymentTerms: 'Net 30',
    leadTime: 18,
    reliability: 97.8
  }
];

export const warehouseData = [
  {
    id: 'WH001',
    name: 'Main Distribution Center',
    location: 'Dallas, TX',
    capacity: 100000,
    utilization: 78,
    temperature: 'Ambient',
    products: 8420,
    value: 2350000
  },
  {
    id: 'WH002',
    name: 'West Coast Hub',
    location: 'Los Angeles, CA',
    capacity: 75000,
    utilization: 82,
    temperature: 'Multi-zone',
    products: 6150,
    value: 1850000
  },
  {
    id: 'WH003',
    name: 'Cold Storage Facility',
    location: 'Chicago, IL',
    capacity: 25000,
    utilization: 65,
    temperature: 'Refrigerated',
    products: 1240,
    value: 420000
  }
];

export const orderData = [
  {
    id: 'ORD001',
    customer: 'Walmart Store #1234',
    date: '2024-07-01',
    status: 'Processing',
    items: 45,
    total: 12450.00,
    priority: 'High',
    warehouse: 'WH001'
  },
  {
    id: 'ORD002',
    customer: 'Target Store #5678',
    date: '2024-07-01',
    status: 'Shipped',
    items: 23,
    total: 8920.00,
    priority: 'Medium',
    warehouse: 'WH002'
  },
  {
    id: 'ORD003',
    customer: 'Best Buy #9012',
    date: '2024-06-30',
    status: 'Delivered',
    items: 12,
    total: 15670.00,
    priority: 'Low',
    warehouse: 'WH001'
  }
];

// Utility functions
export const getStatusColor = (status) => {
  const colors = {
    'In Stock': 'bg-green-100 text-green-800',
    'Low Stock': 'bg-yellow-100 text-yellow-800',
    'Out of Stock': 'bg-red-100 text-red-800',
    'Processing': 'bg-blue-100 text-blue-800',
    'Shipped': 'bg-purple-100 text-purple-800',
    'Delivered': 'bg-green-100 text-green-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getPriorityColor = (priority) => {
  const colors = {
    'High': 'bg-red-100 text-red-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'Low': 'bg-green-100 text-green-800'
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US').format(number);
};