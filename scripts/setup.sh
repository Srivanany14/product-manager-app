#!/bin/bash

# InventoryPro Setup Script
# This script sets up your development environment

set -e

echo "🚀 Setting up InventoryPro Development Environment"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
else
    NODE_VERSION=$(node --version)
    print_status "Node.js found: $NODE_VERSION"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed."
    exit 1
else
    NPM_VERSION=$(npm --version)
    print_status "npm found: $NPM_VERSION"
fi

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    print_warning "AWS CLI not found. Installing..."
    # Install AWS CLI v2
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
        sudo installer -pkg AWSCLIV2.pkg -target /
        rm AWSCLIV2.pkg
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
        unzip awscliv2.zip
        sudo ./aws/install
        rm -rf aws awscliv2.zip
    else
        print_error "Please install AWS CLI manually for your OS"
        exit 1
    fi
    print_status "AWS CLI installed"
else
    AWS_VERSION=$(aws --version)
    print_status "AWS CLI found: $AWS_VERSION"
fi

# Setup project structure
echo ""
echo "📁 Setting up project structure..."

# Create directories
mkdir -p src/app/components
mkdir -p src/lib
mkdir -p cdk/lib
mkdir -p cdk/bin
mkdir -p lambda
mkdir -p scripts
mkdir -p docs

print_status "Project directories created"

# Install Next.js dependencies
echo ""
echo "📦 Installing Next.js dependencies..."

if [ ! -f "package.json" ]; then
    print_info "Initializing Next.js project..."
    npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
fi

# Install additional dependencies
npm install aws-sdk @aws-sdk/client-dynamodb @aws-sdk/client-s3 @aws-sdk/client-cognito-identity-provider
npm install recharts lucide-react @tensorflow/tfjs
npm install --save-dev @types/aws-lambda

print_status "Next.js dependencies installed"

# Setup CDK
echo ""
echo "🏗️  Setting up AWS CDK..."

cd cdk

if [ ! -f "package.json" ]; then
    npm init -y
fi

# Install CDK dependencies
npm install aws-cdk-lib constructs
npm install --save-dev @types/node typescript aws-cdk

# Install CDK CLI globally if not present
if ! command -v cdk &> /dev/null; then
    print_info "Installing CDK CLI globally..."
    npm install -g aws-cdk
fi

print_status "CDK setup complete"

cd ..

# Setup Lambda
echo ""
echo "⚡ Setting up Lambda functions..."

cd lambda

if [ ! -f "package.json" ]; then
    npm init -y
fi

npm install aws-sdk csv-parser uuid

print_status "Lambda dependencies installed"

cd ..

# Create environment file
echo ""
echo "🔧 Creating environment configuration..."

if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
# AWS Configuration for InventoryPro
# Update these values after AWS deployment

NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_API_GATEWAY_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_USER_POOL_ID=us-east-1_xxxxxxxxx
NEXT_PUBLIC_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_DATA_BUCKET=inventory-data-bucket-name

# Development settings
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_DEBUG_API=false
EOF
    print_status "Environment file created (.env.local)"
else
    print_warning "Environment file already exists"
fi

# Create gitignore additions
echo ""
echo "📝 Updating .gitignore..."

cat >> .gitignore << EOF

# InventoryPro specific
.env.local
.env.production
aws-exports.js

# CDK
cdk/cdk.out/
cdk/node_modules/

# Lambda
lambda/node_modules/
lambda/*.zip

# AWS
*.pem
*.key
aws-config.json
EOF

print_status ".gitignore updated"

# AWS Configuration check
echo ""
echo "🔐 Checking AWS configuration..."

if aws sts get-caller-identity &> /dev/null; then
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    REGION=$(aws configure get region)
    print_status "AWS configured - Account: $ACCOUNT_ID, Region: $REGION"
else
    print_warning "AWS not configured. Run 'aws configure' to set up your credentials"
fi

# Bootstrap CDK (if AWS is configured)
if aws sts get-caller-identity &> /dev/null; then
    echo ""
    echo "🏗️  Bootstrapping CDK..."
    cd cdk
    cdk bootstrap
    print_status "CDK bootstrapped"
    cd ..
else
    print_warning "Skipping CDK bootstrap - configure AWS first"
fi

# Create README
echo ""
echo "📚 Creating documentation..."

cat > README.md << EOF
# InventoryPro - AI-Powered Inventory Management

A modern inventory management system with Time-LLM AI forecasting, built with Next.js and AWS.

## Features

- 🤖 AI-powered demand forecasting with Time-LLM
- 📊 Real-time analytics and reporting
- 🔐 Secure authentication with AWS Cognito
- 📱 Responsive Walmart-style interface
- ☁️ Serverless AWS architecture
- 📈 Interactive charts and visualizations

## Quick Start

1. **Setup**: \`./scripts/setup.sh\`
2. **Deploy**: \`./scripts/deploy.sh\`
3. **Develop**: \`npm run dev\`

## Architecture

- **Frontend**: Next.js 14 with Tailwind CSS
- **Backend**: AWS Lambda + API Gateway
- **Database**: DynamoDB
- **Storage**: S3
- **Auth**: Cognito
- **AI**: Time-LLM transformer model

## Documentation

- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Architecture Overview](docs/ARCHITECTURE.md)

## Development

\`\`\`bash
# Start development server
npm run dev

# Deploy to AWS
./scripts/deploy.sh

# Seed sample data
node scripts/seed-data.js
\`\`\`

## Support

For issues and questions, please check the documentation or create an issue.
EOF

print_status "README.md created"

# Final setup completion
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
print_info "Next steps:"
echo "1. Configure AWS credentials: aws configure"
echo "2. Deploy infrastructure: ./scripts/deploy.sh"
echo "3. Start development: npm run dev"
echo ""
print_info "Project structure:"
echo "├── src/app/          # Next.js application"
echo "├── cdk/              # AWS infrastructure"
echo "├── lambda/           # AWS Lambda functions"
echo "├── scripts/          # Deployment scripts"
echo "└── docs/             # Documentation"
echo ""
print_status "InventoryPro setup completed successfully! 🚀"