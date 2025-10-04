import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { DLM_TAG_KEY, DLM_TAG_VALUE } from '../constants';
import { MinecraftDlmBackups } from '../constructs/MinecraftDlmBackups';
import { CiscosAdventureRpg } from '../constructs/patterns/CiscosAdventureRpg';

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

    const ciscos = new CiscosAdventureRpg(this, 'CiscosAdventureRpg', { vpc });

    // Optional DLM backups
    if (props.enableDlmBackups ?? true) {
      new MinecraftDlmBackups(this, 'DlmBackups', {
        tagKey: DLM_TAG_KEY,
        tagValue: DLM_TAG_VALUE,
        retentionCount: 7,
      });
    }

    // Create Fleet Manager API
    // const fleetApi = new MinecraftFleetManagerApi(this, 'FleetManagerApi', {
    //   servers: [
    //     {
    //       id: 'dungeons-and-colonies-rpg',
    //       instance: dungeonsServer.instance,
    //       dataDeviceName: dungeonsServer.dataDeviceName,
    //     },
    //   ],
    // });


    new cdk.CfnOutput(this, 'CiscosAdventureRpgEIP', {
      value: ciscos.eip?.ref ?? ciscos.instance.instancePublicDnsName,
      description: 'Ciscos Adventure RPG server address',
    });

    // new cdk.CfnOutput(this, 'FleetApiBase', {
    //   value: fleetApi.apiUrl,
    //   description: 'Fleet Manager API base URL',
    // });

    // new cdk.CfnOutput(this, 'FleetApiToken', {
    //   value: fleetApi.token,
    //   description: 'Fleet Manager API authentication token',
    // });
  }
}
