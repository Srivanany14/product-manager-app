#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InventoryManagementStack } from '../lib/inventory-stack';

const app = new cdk.App();

new InventoryManagementStack(app, 'InventoryManagementStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});
