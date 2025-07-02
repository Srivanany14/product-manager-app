#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InventoryManagementStack } from '../lib/inventory-stack';

const app = new cdk.App();

// Get environment variables or use defaults
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION || 'us-east-1';

new InventoryManagementStack(app, 'InventoryManagementStack', {
  env: {
    account,
    region,
  },
  description: 'Inventory Management System with Time-LLM AI Forecasting',
  tags: {
    Project: 'InventoryManagement',
    Environment: process.env.ENVIRONMENT || 'development',
    Owner: process.env.OWNER || 'InventoryTeam',
  },
});

// Add stack tags
cdk.Tags.of(app).add('Project', 'InventoryManagement');
cdk.Tags.of(app).add('ManagedBy', 'AWS-CDK');