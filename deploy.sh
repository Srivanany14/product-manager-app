#!/bin/bash

# AWS Inventory Management System Deployment Script
# Run this script to deploy your complete infrastructure

echo "🚀 Starting AWS Inventory Management System Deployment..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if CDK is installed
if ! command -v cdk &> /dev/null; then
    echo "❌ AWS CDK is not installed. Installing now..."
    npm install -g aws-cdk
fi

# Set variables
STACK_NAME="inventory-management-stack"
REGION="us-east-1"
PROFILE="default"

echo "📋 Configuration:"
echo "  Stack Name: $STACK_NAME"
echo "  Region: $REGION"
echo "  Profile: $PROFILE"
echo ""

# Create CDK directory structure
echo "📁 Setting up CDK project structure..."
mkdir -p cdk lambda

# Initialize CDK project
cd cdk
if [ ! -f "cdk.json" ]; then
    echo "🔧 Initializing CDK project..."
    cdk init app --language=typescript
fi

# Install dependencies
echo "📦 Installing CDK dependencies..."
npm install @aws-cdk/aws-lambda @aws-cdk/aws-apigateway @aws-cdk/aws-dynamodb @aws-cdk/aws-s3 @aws-cdk/aws-cognito @aws-cdk/aws-iam

# Copy lambda functions
echo "📄 Copying Lambda functions..."
cd ../lambda
npm init -y
npm install aws-sdk csv-parser

# Create package.json for lambda
cat > package.json << EOF
{
  "name": "inventory-lambda-functions",
  "version": "1.0.0",
  "description": "Lambda functions for inventory management",
  "main": "index.js",
  "dependencies": {
    "aws-sdk": "^2.1400.0",
    "csv-parser": "^3.0.0"
  }
}
EOF

# Bootstrap CDK (if not already done)
echo "🏗️  Bootstrapping CDK..."
cd ../cdk
cdk bootstrap --profile $PROFILE

# Deploy the stack
echo "🚀 Deploying infrastructure..."
cdk deploy $STACK_NAME --profile $PROFILE --require-approval never

# Get outputs
echo "📤 Getting deployment outputs..."
OUTPUTS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs' --output json --profile $PROFILE)

API_URL=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="ApiGatewayUrl") | .OutputValue')
USER_POOL_ID=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="UserPoolId") | .OutputValue')
USER_POOL_CLIENT_ID=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="UserPoolClientId") | .OutputValue')
DATA_BUCKET=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="DataBucketName") | .OutputValue')

# Create environment file for Next.js
echo "📝 Creating environment configuration..."
cd ..

cat > .env.local << EOF
# AWS Configuration for InventoryPro
NEXT_PUBLIC_AWS_REGION=$REGION
NEXT_PUBLIC_API_GATEWAY_URL=$API_URL
NEXT_PUBLIC_USER_POOL_ID=$USER_POOL_ID
NEXT_PUBLIC_USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID
NEXT_PUBLIC_DATA_BUCKET=$DATA_BUCKET
EOF

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Your AWS Resources:"
echo "  API Gateway URL: $API_URL"
echo "  User Pool ID: $USER_POOL_ID"
echo "  User Pool Client ID: $USER_POOL_CLIENT_ID"
echo "  S3 Data Bucket: $DATA_BUCKET"
echo ""
echo "🔧 Next Steps:"
echo "1. Update your Next.js app with the new environment variables"
echo "2. Test authentication with a new user signup"
echo "3. Upload sample data to test the system"
echo ""
echo "🚀 Start your Next.js app:"
echo "  npm run dev"
echo ""

# Optional: Seed sample data
read -p "🌱 Would you like to seed sample data? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding sample data..."
    
    # Create a simple script to seed data
    cat > seed-data.js << EOF
const AWS = require('aws-sdk');
AWS.config.update({ region: '$REGION' });

const dynamodb = new AWS.DynamoDB.DocumentClient();

const sampleProducts = [
  {
    productId: 'SKU001',
    timestamp: new Date().toISOString(),
    name: 'iPhone 15 Pro Max 256GB',
    category: 'Electronics',
    price: 1199.99,
    stock: 12,
    reorderPoint: 25,
    supplier: 'Samsung',
    location: 'A-13-C',
    status: 'Low Stock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    productId: 'SKU003',
    timestamp: new Date().toISOString(),
    name: 'Nike Air Max 270',
    category: 'Footwear',
    price: 129.99,
    stock: 0,
    reorderPoint: 50,
    supplier: 'Nike Inc.',
    location: 'B-05-A',
    status: 'Out of Stock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    productId: 'SKU004',
    timestamp: new Date().toISOString(),
    name: 'Coca-Cola 12 Pack Cans',
    category: 'Beverages',
    price: 4.99,
    stock: 2847,
    reorderPoint: 500,
    supplier: 'Coca-Cola Co.',
    location: 'C-01-D',
    status: 'In Stock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

async function seedData() {
  try {
    for (const product of sampleProducts) {
      const params = {
        TableName: 'inventory-products',
        Item: product
      };
      
      await dynamodb.put(params).promise();
      console.log(\`✅ Added product: \${product.name}\`);
    }
    
    // Seed sample sales data
    const salesData = [];
    const productIds = ['SKU001', 'SKU002', 'SKU003', 'SKU004'];
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
      const dateString = date.toISOString().split('T')[0];
      
      productIds.forEach(productId => {
        const baseQuantity = productId === 'SKU004' ? 120 : 25;
        const randomVariation = 0.7 + (Math.random() * 0.6);
        const quantity = Math.round(baseQuantity * randomVariation);
        
        salesData.push({
          productId,
          date: dateString,
          quantity,
          timestamp: date.toISOString()
        });
      });
    }
    
    for (const sale of salesData) {
      const params = {
        TableName: 'inventory-sales-data',
        Item: sale
      };
      
      await dynamodb.put(params).promise();
    }
    
    console.log(\`✅ Added \${salesData.length} sales records\`);
    console.log('🎉 Sample data seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

seedData();
EOF

    node seed-data.js
    rm seed-data.js
fi

echo ""
echo "🎉 Deployment and setup complete!"
echo "Your inventory management system is ready to use." 45,
    reorderPoint: 20,
    supplier: 'Apple Inc.',
    location: 'A-12-B',
    status: 'In Stock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    productId: 'SKU002',
    timestamp: new Date().toISOString(),
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Electronics',
    price: 1299.99,
    stock: