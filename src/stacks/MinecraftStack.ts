import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { DLM_TAG_KEY, DLM_TAG_VALUE } from '../constants';
import { MinecraftDlmBackups } from '../constructs/MinecraftDlmBackups';
import { DungeonsAndColoniesRpg } from '../constructs/patterns/DungeonsAndColoniesRpg';

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

    const cfApiParameterName = '/minecraft/curseforge/apiKey';

    const dungeonsServer = new DungeonsAndColoniesRpg(this, 'DungeonsAndColoniesRpg', {
      vpc,
      allocateElasticIp: true,
      cfApiParameterName,
    });

    // Tag instances for DLM backups
    cdk.Tags.of(dungeonsServer).add(DLM_TAG_KEY, DLM_TAG_VALUE);

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


    new cdk.CfnOutput(this, 'DungeonsAndColoniesRpgEIP', {
      value: dungeonsServer.eip?.ref ?? dungeonsServer.instance.instancePublicDnsName,
      description: 'Dungeons & Colonies RPG server address',
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
