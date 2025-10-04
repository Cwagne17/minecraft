import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { MinecraftStack } from '../src/stacks/MinecraftStack';

describe('MinecraftStack', () => {
  test('synthesizes successfully', () => {
    const app = new cdk.App();
    const stack = new MinecraftStack(app, 'TestMinecraftStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });

    // Verify the stack synthesizes without errors
    const template = Template.fromStack(stack);
    expect(template.toJSON()).toBeDefined();
  });

  test('creates four EC2 instances', () => {
    const app = new cdk.App();
    const stack = new MinecraftStack(app, 'TestMinecraftStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });

    const template = Template.fromStack(stack);

    // Should have 4 EC2 instances (one for each server)
    template.resourceCountIs('AWS::EC2::Instance', 4);
  });

  test('creates Fleet Manager API', () => {
    const app = new cdk.App();
    const stack = new MinecraftStack(app, 'TestMinecraftStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });

    const template = Template.fromStack(stack);

    // Should have API Gateway HTTP API
    template.resourceCountIs('AWS::ApiGatewayV2::Api', 1);

    // Should have Lambda function for the API
    template.resourceCountIs('AWS::Lambda::Function', 1);
  });

  test('creates DLM backup policy when enabled', () => {
    const app = new cdk.App();
    const stack = new MinecraftStack(app, 'TestMinecraftStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
      enableDlmBackups: true,
    });

    const template = Template.fromStack(stack);

    // Should have DLM lifecycle policy
    template.resourceCountIs('AWS::DLM::LifecyclePolicy', 1);
  });

  test('creates EBS volumes for each server', () => {
    const app = new cdk.App();
    const stack = new MinecraftStack(app, 'TestMinecraftStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });

    const template = Template.fromStack(stack);

    // Should have 4 EBS volumes (one for each server)
    template.resourceCountIs('AWS::EC2::Volume', 4);
  });

  test('creates security groups for servers', () => {
    const app = new cdk.App();
    const stack = new MinecraftStack(app, 'TestMinecraftStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });

    const template = Template.fromStack(stack);

    // Should have security groups for each server
    const securityGroups = template.findResources('AWS::EC2::SecurityGroup');
    expect(Object.keys(securityGroups).length).toBeGreaterThanOrEqual(4);
  });

  test('snapshot test', () => {
    const app = new cdk.App();
    const stack = new MinecraftStack(app, 'TestMinecraftStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });

    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });
});
