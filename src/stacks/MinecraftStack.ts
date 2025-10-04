import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { MinecraftDlmBackups } from '../constructs/MinecraftDlmBackups';
import { MinecraftFleetManagerApi } from '../constructs/MinecraftFleetManagerApi';
import { BetterMcForgeBmc4 } from '../constructs/patterns/BetterMcForgeBmc4';
import { CiscosAdventureRpg } from '../constructs/patterns/CiscosAdventureRpg';
import { DungeonsAndColoniesRpg } from '../constructs/patterns/DungeonsAndColoniesRpg';
import { HomesteadCozy } from '../constructs/patterns/HomesteadCozy';

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

    // Create the four Minecraft servers
    const ciscosServer = new CiscosAdventureRpg(this, 'CiscosAdventureRpg', {
      vpc,
      allocateElasticIp: true,
      cfApiParameterName,
    });

    const betterMcServer = new BetterMcForgeBmc4(this, 'BetterMcForgeBmc4', {
      vpc,
      allocateElasticIp: true,
      cfApiParameterName,
    });

    const homesteadServer = new HomesteadCozy(this, 'HomesteadCozy', {
      vpc,
      allocateElasticIp: true,
      cfApiParameterName,
    });

    const dungeonsServer = new DungeonsAndColoniesRpg(this, 'DungeonsAndColoniesRpg', {
      vpc,
      allocateElasticIp: true,
      cfApiParameterName,
    });

    // Tag instances for DLM backups
    cdk.Tags.of(ciscosServer).add('MinecraftData', 'true');
    cdk.Tags.of(betterMcServer).add('MinecraftData', 'true');
    cdk.Tags.of(homesteadServer).add('MinecraftData', 'true');
    cdk.Tags.of(dungeonsServer).add('MinecraftData', 'true');

    // Optional DLM backups
    if (props.enableDlmBackups ?? true) {
      new MinecraftDlmBackups(this, 'DlmBackups', {
        tagKey: 'MinecraftData',
        tagValue: 'true',
        retentionCount: 7,
      });
    }

    // Create Fleet Manager API
    const fleetApi = new MinecraftFleetManagerApi(this, 'FleetManagerApi', {
      servers: [
        {
          id: 'ciscos-adventure-rpg',
          instance: ciscosServer.instance,
          dataDeviceName: ciscosServer.dataDeviceName,
        },
        {
          id: 'better-mc-forge-bmc4',
          instance: betterMcServer.instance,
          dataDeviceName: betterMcServer.dataDeviceName,
        },
        {
          id: 'homestead-cozy',
          instance: homesteadServer.instance,
          dataDeviceName: homesteadServer.dataDeviceName,
        },
        {
          id: 'dungeons-and-colonies-rpg',
          instance: dungeonsServer.instance,
          dataDeviceName: dungeonsServer.dataDeviceName,
        },
      ],
    });

    // Outputs for each server
    new cdk.CfnOutput(this, 'CiscosAdventureRpgEIP', {
      value: ciscosServer.eip?.ref ?? ciscosServer.instance.instancePublicDnsName,
      description: 'Cisco\'s Adventure RPG server address',
    });

    new cdk.CfnOutput(this, 'BetterMcForgeBmc4EIP', {
      value: betterMcServer.eip?.ref ?? betterMcServer.instance.instancePublicDnsName,
      description: 'Better MC [FORGE] BMC4 server address',
    });

    new cdk.CfnOutput(this, 'HomesteadCozyEIP', {
      value: homesteadServer.eip?.ref ?? homesteadServer.instance.instancePublicDnsName,
      description: 'Homestead – Cozy server address',
    });

    new cdk.CfnOutput(this, 'DungeonsAndColoniesRpgEIP', {
      value: dungeonsServer.eip?.ref ?? dungeonsServer.instance.instancePublicDnsName,
      description: 'Dungeons & Colonies RPG server address',
    });

    new cdk.CfnOutput(this, 'FleetApiBase', {
      value: fleetApi.apiUrl,
      description: 'Fleet Manager API base URL',
    });

    new cdk.CfnOutput(this, 'FleetApiToken', {
      value: fleetApi.token,
      description: 'Fleet Manager API authentication token',
    });
  }
}
