import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { MinecraftDockerEnv } from '../../shared/types';
import { MinecraftServerBaseProps } from '../MinecraftServerBase';
import { CurseForgePatternBase } from './CurseForgePatternBase';

const HOMESTEAD_COZY_ENV: MinecraftDockerEnv = {
  cfPageUrl: 'https://www.curseforge.com/minecraft/modpacks/homestead-cozy',
  memory: '6G',
};

export class HomesteadCozy extends CurseForgePatternBase {
  constructor(scope: Construct, id: string, props: Omit<MinecraftServerBaseProps, 'dockerEnv' | 'dockerImageTag' | 'volumeGiB' | 'instanceSize'> = {}) {
    super(
      scope,
      id,
      {
        volumeGiB: 50,
        instanceSize: ec2.InstanceSize.MEDIUM,
        dockerImageTag: 'java17',
        dockerEnv: HOMESTEAD_COZY_ENV,
        ...props,
      },
    );
  }
}
