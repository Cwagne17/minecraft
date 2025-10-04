import * as cdk from 'aws-cdk-lib';
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

    // Create the pipeline
    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      pipelineName: 'MinecraftPipeline',
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.gitHub('Cwagne17/minecraft', 'main'),
        commands: [
          'npm ci',
          'npx projen',
          'npm run build',
          'npx cdk synth',
        ],
      }),
      dockerEnabledForSynth: true,
    });

    // Deploys to the same account and region as the pipeline stack
    const prodStage = new MinecraftAppStage(this, 'Prod', props);
    pipeline.addStage(prodStage);
  }
}
