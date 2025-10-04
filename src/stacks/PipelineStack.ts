import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { MinecraftStack } from './MinecraftStack';

/**
 * Stage for deploying Minecraft infrastructure
 */
class MinecraftAppStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    new MinecraftStack(this, 'MinecraftStack', {
      enableDlmBackups: true,
    });
  }
}

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create or reference a CodeCommit repository
    // In production, you'd use your actual source repository (GitHub, CodeCommit, etc.)
    const repository = new codecommit.Repository(this, 'MinecraftRepo', {
      repositoryName: 'minecraft-infrastructure',
      description: 'Minecraft server infrastructure repository',
    });

    // Create the pipeline
    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      pipelineName: 'MinecraftPipeline',
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.codeCommit(repository, 'main'),
        commands: [
          'npm ci',
          'npx projen',
          'npm run build',
          'npx cdk synth',
        ],
      }),
      crossAccountKeys: true,
      dockerEnabledForSynth: true,
    });

    // Add Dev stage
    // Note: Update these account IDs with your actual AWS accounts
    const devAccount = process.env.DEV_ACCOUNT_ID || '111111111111';
    const prodAccount = process.env.PROD_ACCOUNT_ID || '222222222222';

    const devStage = new MinecraftAppStage(this, 'Dev', {
      env: {
        account: devAccount,
        region: 'us-east-1',
      },
    });
    pipeline.addStage(devStage);

    // Add manual approval before Prod
    const prodStage = new MinecraftAppStage(this, 'Prod', {
      env: {
        account: prodAccount,
        region: 'us-east-1',
      },
    });

    pipeline.addStage(prodStage, {
      pre: [new pipelines.ManualApprovalStep('PromoteToProd')],
    });

    // Note: After first deployment, you need to:
    // 1. Push your code to the CodeCommit repository
    // 2. The pipeline will automatically trigger on new commits
  }
}
