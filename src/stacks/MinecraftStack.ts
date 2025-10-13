import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { DLM_TAG_KEY, DLM_TAG_VALUE } from '../constants';
import { MinecraftDlmBackups } from '../constructs/MinecraftDlmBackups';
import { AllTheMods10 } from '../constructs/patterns/AllTheMods10';

export interface MinecraftStackProps extends cdk.StackProps {
  /**
   * Whether to enable DLM backups.
   * @default true
   */
  readonly enableDlmBackups?: boolean;
}

export class MinecraftStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MinecraftStackProps = {}) {
    super(scope, id, props);

    // Create shared VPC
    const vpc = new ec2.Vpc(this, 'MinecraftVpc', {
      maxAzs: 1,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // Suppress VPC7 - Flow logs are cost-prohibitive for this use case
    NagSuppressions.addResourceSuppressions(vpc, [
      {
        id: 'AwsSolutions-VPC7',
        reason: 'VPC Flow Logs are cost-prohibitive for this Minecraft server deployment.',
      },
    ], true);

    // const ciscos = new CiscosAdventureRpg(this, 'CiscosAdventureRpg', { vpc });

    const allthemods10 = new AllTheMods10(this, 'AllTheMods10', { vpc });

    // Optional DLM backups
    if (props.enableDlmBackups ?? true) {
      new MinecraftDlmBackups(this, 'DlmBackups', {
        tagKey: DLM_TAG_KEY,
        tagValue: DLM_TAG_VALUE,
        retentionCount: 3,
      });
    }
  }
}
