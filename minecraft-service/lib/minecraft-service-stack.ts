import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class MinecraftServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // Create a Fargate Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'MinecraftTaskDef', {
      family: 'minecraft-task',
      cpu: 1024,
      memoryLimitMiB: 6144,
    });
    taskDefinition.addVolume({
      name: 'minecraft-data',
      efsVolumeConfiguration: {
        fileSystemId: 'fs-12345678',
      }
    });
    
    const container = taskDefinition.addContainer('MinecraftContainer', {
      image: ecs.ContainerImage.fromRegistry('itzg/minecraft-server'),
      environment: {
        USE_AIKAR_FLAGS: 'true',
        MEMORY: '6G',
        EULA: 'TRUE',
        VERSION: '1.20.1',
        ALLOW_FLIGHT: 'true',
        MOD_PLATFORM: 'AUTO_CURSEFORGE',
        CF_FORCE_SYNCHRONIZE: 'true',
        CF_SLUG: 'valhelsia-6',
      },
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'minecraft' }),
      memoryLimitMiB: 6144,
      cpu: 1024,
      essential: true,
    });

  }
}
