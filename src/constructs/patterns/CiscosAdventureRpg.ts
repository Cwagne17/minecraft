import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { MinecraftDockerEnv, MinecraftGameVersion, OpPermissionLevel } from '../../shared/types';
import { MinecraftServerBaseProps } from '../MinecraftServerBase';
import { CurseForgePatternBase } from './CurseForgePatternBase';

const CISCOS_ADVENTURE_RPG_ENV: MinecraftDockerEnv = {
  cfPageUrl: 'https://www.curseforge.com/minecraft/modpacks/ciscos-adventure-rpg-ultimate',
  memory: '12G',
  version: MinecraftGameVersion.V1_20_1,
  motd: 'Welcome to Cisco\'s Adventure RPG Ultimate!',
  opPermissionLevel: OpPermissionLevel.LEVEL_4,
};

export class CiscosAdventureRpg extends CurseForgePatternBase {
  constructor(scope: Construct, id: string, props: Omit<MinecraftServerBaseProps, 'dockerEnv' | 'dockerImageTag' | 'volumeGiB' | 'instanceSize'> = {}) {
    super(
      scope,
      id,
      {
        instanceSize: ec2.InstanceSize.XLARGE,
        dockerImageTag: 'java17',
        dockerEnv: CISCOS_ADVENTURE_RPG_ENV,
        ...props,
      },
    );
  }
}
