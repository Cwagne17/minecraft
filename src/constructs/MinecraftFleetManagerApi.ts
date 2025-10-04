import * as cdk from 'aws-cdk-lib';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface ServerInfo {
  readonly id: string;
  readonly instance: ec2.Instance;
  readonly dataDeviceName: string;
}

export interface MinecraftFleetManagerApiProps {
  /**
   * List of servers to manage.
   */
  readonly servers: ServerInfo[];

  /**
   * API token for authentication. If not provided, a random one will be generated.
   */
  readonly token?: string;
}

export class MinecraftFleetManagerApi extends Construct {
  public readonly api: apigatewayv2.CfnApi;
  public readonly token: string;
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: MinecraftFleetManagerApiProps) {
    super(scope, id);

    // Generate or use provided token
    this.token = props.token ?? this.generateToken();

    // Build route table for Lambda
    const routeTable: Record<string, { instanceId: string; dataDeviceName: string }> = {};
    props.servers.forEach(server => {
      routeTable[server.id] = {
        instanceId: server.instance.instanceId,
        dataDeviceName: server.dataDeviceName,
      };
    });

    // Create Lambda execution role
    const lambdaRole = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Grant EC2 permissions
    lambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          'ec2:StartInstances',
          'ec2:StopInstances',
          'ec2:DescribeInstances',
          'ec2:DescribeInstanceStatus',
          'ec2:CreateSnapshot',
          'ec2:CreateTags',
          'ec2:DescribeVolumes',
        ],
        resources: ['*'],
      }),
    );

    // Create Lambda function
    const handler = new lambda.Function(this, 'Handler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(this.getLambdaCode()),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      environment: {
        TOKEN: this.token,
        ROUTE_TABLE: JSON.stringify(routeTable),
      },
    });

    // Create HTTP API
    this.api = new apigatewayv2.CfnApi(this, 'HttpApi', {
      name: 'MinecraftFleetManagerApi',
      protocolType: 'HTTP',
      description: 'Fleet Manager API for Minecraft servers',
    });

    // Create Lambda integration
    const integration = new apigatewayv2.CfnIntegration(this, 'Integration', {
      apiId: this.api.ref,
      integrationType: 'AWS_PROXY',
      integrationUri: handler.functionArn,
      payloadFormatVersion: '2.0',
    });

    // Create routes
    const routes = [
      { path: '/servers', method: 'GET' },
      { path: '/servers/{id}/metadata', method: 'GET' },
      { path: '/servers/{id}/health', method: 'GET' },
      { path: '/servers/{id}/start', method: 'POST' },
      { path: '/servers/{id}/stop', method: 'POST' },
      { path: '/servers/{id}/backup', method: 'POST' },
    ];

    routes.forEach((route, index) => {
      new apigatewayv2.CfnRoute(this, `Route${index}`, {
        apiId: this.api.ref,
        routeKey: `${route.method} ${route.path}`,
        target: `integrations/${integration.ref}`,
      });
    });

    // Create default stage
    const stage = new apigatewayv2.CfnStage(this, 'Stage', {
      apiId: this.api.ref,
      stageName: '$default',
      autoDeploy: true,
    });

    // Grant API Gateway permission to invoke Lambda
    handler.addPermission('ApiGatewayInvoke', {
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: `arn:aws:execute-api:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:${this.api.ref}/*/*`,
    });

    this.apiUrl = `https://${this.api.ref}.execute-api.${cdk.Stack.of(this).region}.amazonaws.com`;

    // Outputs
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: this.apiUrl,
      description: 'Fleet Manager API endpoint',
    });

    new cdk.CfnOutput(this, 'ApiToken', {
      value: this.token,
      description: 'API authentication token',
    });
  }

  private generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  private getLambdaCode(): string {
    return `
const AWS = require('aws-sdk');
const ec2 = new AWS.EC2();
const net = require('net');

const TOKEN = process.env.TOKEN;
const ROUTE_TABLE = JSON.parse(process.env.ROUTE_TABLE);

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Check token
  const token = event.headers['x-token'];
  if (token !== TOKEN) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  const method = event.requestContext.http.method;
  const path = event.requestContext.http.path;
  const pathParams = event.pathParameters || {};

  try {
    // Route: GET /servers
    if (method === 'GET' && path === '/servers') {
      return {
        statusCode: 200,
        body: JSON.stringify({ servers: Object.keys(ROUTE_TABLE) }),
      };
    }

    // Extract server ID
    const serverId = pathParams.id;
    if (!serverId || !ROUTE_TABLE[serverId]) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Server not found' }),
      };
    }

    const serverInfo = ROUTE_TABLE[serverId];
    const instanceId = serverInfo.instanceId;

    // Route: GET /servers/{id}/metadata
    if (method === 'GET' && path.includes('/metadata')) {
      const data = await ec2.describeInstances({ InstanceIds: [instanceId] }).promise();
      const instance = data.Reservations[0]?.Instances[0];
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          id: serverId,
          instanceId,
          state: instance?.State?.Name,
          publicIp: instance?.PublicIpAddress,
          privateIp: instance?.PrivateIpAddress,
          launchTime: instance?.LaunchTime,
        }),
      };
    }

    // Route: GET /servers/{id}/health
    if (method === 'GET' && path.includes('/health')) {
      const data = await ec2.describeInstances({ InstanceIds: [instanceId] }).promise();
      const instance = data.Reservations[0]?.Instances[0];
      const state = instance?.State?.Name;
      
      let minecraftHealthy = false;
      if (state === 'running' && instance?.PublicIpAddress) {
        minecraftHealthy = await checkMinecraftPort(instance.PublicIpAddress, 25565);
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          id: serverId,
          instanceState: state,
          minecraftPort: minecraftHealthy ? 'open' : 'closed',
          healthy: state === 'running' && minecraftHealthy,
        }),
      };
    }

    // Route: POST /servers/{id}/start
    if (method === 'POST' && path.includes('/start')) {
      await ec2.startInstances({ InstanceIds: [instanceId] }).promise();
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Server starting', id: serverId }),
      };
    }

    // Route: POST /servers/{id}/stop
    if (method === 'POST' && path.includes('/stop')) {
      await ec2.stopInstances({ InstanceIds: [instanceId] }).promise();
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Server stopping', id: serverId }),
      };
    }

    // Route: POST /servers/{id}/backup
    if (method === 'POST' && path.includes('/backup')) {
      // Find the data volume
      const volumes = await ec2.describeVolumes({
        Filters: [
          { Name: 'attachment.instance-id', Values: [instanceId] },
          { Name: 'attachment.device', Values: [serverInfo.dataDeviceName] },
        ],
      }).promise();

      if (!volumes.Volumes || volumes.Volumes.length === 0) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Data volume not found' }),
        };
      }

      const volumeId = volumes.Volumes[0].VolumeId;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      const snapshot = await ec2.createSnapshot({
        VolumeId: volumeId,
        Description: \`Minecraft backup for \${serverId}\`,
      }).promise();

      await ec2.createTags({
        Resources: [snapshot.SnapshotId],
        Tags: [
          { Key: 'Name', Value: \`mc-backup-\${timestamp}\` },
          { Key: 'InstanceId', Value: instanceId },
          { Key: 'ServerId', Value: serverId },
        ],
      }).promise();

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Backup initiated',
          snapshotId: snapshot.SnapshotId,
          volumeId,
        }),
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Route not found' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

function checkMinecraftPort(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(2000);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}
`;
  }
}
