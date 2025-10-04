import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { MinecraftDockerEnv } from '../../shared/types';
import { MinecraftServerBaseProps } from '../MinecraftServerBase';
import { CurseForgePatternBase } from './CurseForgePatternBase';

const DUNGEONS_AND_COLONIES_RPG_ENV: MinecraftDockerEnv = {
  cfPageUrl: 'https://www.curseforge.com/minecraft/modpacks/dungeons-and-colonies-rpg',
  memory: '6G',
};

export class DungeonsAndColoniesRpg extends CurseForgePatternBase {
  constructor(scope: Construct, id: string, props: Omit<MinecraftServerBaseProps, 'dockerEnv' | 'dockerImageTag' | 'volumeGiB' | 'instanceSize'> = {}) {
    super(
      scope,
      id,
      {
        volumeGiB: 50,
        instanceSize: ec2.InstanceSize.MEDIUM,
        dockerImageTag: 'java17',
        dockerEnv: DUNGEONS_AND_COLONIES_RPG_ENV,
        ...props,
      },
    );
  }
}
