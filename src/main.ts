#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import 'source-map-support/register';
import { MINECRAFT_ACCOUNT_ID, MINECRAFT_REGION } from './constants';
import { PipelineStack } from './stacks/PipelineStack';
// import { MinecraftStack } from './stacks/MinecraftStack';

const app = new cdk.App();

// Add cdk-nag checks (with suppressions for known acceptable patterns)
Aspects.of(app).add(new AwsSolutionsChecks({ verbose: false }));

// Deploy via pipeline (recommended for production)
const pipelineStack = new PipelineStack(app, 'MinecraftPipeline', {
  env: {
    account: MINECRAFT_ACCOUNT_ID,
    region: MINECRAFT_REGION,
  },
});

// Suppress cdk-nag findings for pipeline infrastructure (these are AWS best practices from CDK)
NagSuppressions.addStackSuppressions(pipelineStack, [
  {
    id: 'AwsSolutions-IAM5',
    reason: 'CDK Pipeline requires wildcard permissions for managing pipeline resources and cross-account deployments',
  },
  {
    id: 'AwsSolutions-KMS5',
    reason: 'CDK Pipeline encryption key does not require rotation for pipeline artifacts',
  },
  {
    id: 'AwsSolutions-S1',
    reason: 'Pipeline artifacts bucket does not require access logging',
  },
  {
    id: 'AwsSolutions-CB3',
    reason: 'CodeBuild project uses privileged mode for Docker builds as required by CDK Pipelines',
  },
  {
    id: 'AwsSolutions-CB4',
    reason: 'CodeBuild project uses managed KMS encryption for artifacts',
  },
], true);

// Optionally deploy stack directly for local testing
// Uncomment the following to deploy directly:
// new MinecraftStack(app, 'MinecraftStack', {
//   env: {
//     account: MINECRAFT_ACCOUNT_ID,
//     region: MINECRAFT_REGION,
//   },
// });

app.synth();
