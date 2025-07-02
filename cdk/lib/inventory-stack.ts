import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class InventoryManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket
    const dataBucket = new s3.Bucket(this, 'InventoryDataBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.POST, s3.HttpMethods.PUT],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      }],
    });

    // DynamoDB Tables
    const productsTable = new dynamodb.Table(this, 'ProductsTable', {
      tableName: 'inventory-products',
      partitionKey: { name: 'productId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const salesDataTable = new dynamodb.Table(this, 'SalesDataTable', {
      tableName: 'inventory-sales-data',
      partitionKey: { name: 'productId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'date', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const forecastsTable = new dynamodb.Table(this, 'ForecastsTable', {
      tableName: 'inventory-forecasts',
      partitionKey: { name: 'productId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'forecastDate', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Cognito User Pool
    const userPool = new cognito.UserPool(this, 'InventoryUserPool', {
      userPoolName: 'inventory-users',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'InventoryUserPoolClient', {
      userPool,
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        userSrp: true,
      },
    });

    // Lambda Role
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
      inlinePolicies: {
        DynamoDBPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['dynamodb:*'],
              resources: [
                productsTable.tableArn,
                salesDataTable.tableArn,
                forecastsTable.tableArn,
              ],
            }),
          ],
        }),
        S3Policy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['s3:*'],
              resources: [dataBucket.bucketArn, `${dataBucket.bucketArn}/*`],
            }),
          ],
        }),
      },
    });

    // Lambda Functions
    const productsFunction = new lambda.Function(this, 'ProductsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'products.handler',
      code: lambda.Code.fromAsset('../lambda'),
      role: lambdaRole,
      environment: {
        PRODUCTS_TABLE: productsTable.tableName,
        SALES_DATA_TABLE: salesDataTable.tableName,
      },
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'InventoryApi', {
      restApiName: 'Inventory Management API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET', new apigateway.LambdaIntegration(productsFunction));
    productsResource.addMethod('POST', new apigateway.LambdaIntegration(productsFunction));

    // Outputs
    new cdk.CfnOutput(this, 'ApiGatewayUrl', { value: api.url });
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });
    new cdk.CfnOutput(this, 'DataBucketName', { value: dataBucket.bucketName });
  }
}