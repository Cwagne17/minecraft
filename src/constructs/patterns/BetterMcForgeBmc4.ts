import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { MinecraftDockerEnv } from '../../shared/types';
import { MinecraftServerBaseProps } from '../MinecraftServerBase';
import { CurseForgePatternBase } from './CurseForgePatternBase';

const BETTER_MC_FORGE_BMC4_ENV: MinecraftDockerEnv = {
  cfPageUrl: 'https://www.curseforge.com/minecraft/modpacks/better-mc-forge-bmc4',
  memory: '8G',
};

export class BetterMcForgeBmc4 extends CurseForgePatternBase {
  constructor(scope: Construct, id: string, props: Omit<MinecraftServerBaseProps, 'dockerEnv' | 'dockerImageTag' | 'volumeGiB' | 'instanceSize'> = {}) {
    super(
      scope,
      id,
      {
        volumeGiB: 60,
        instanceSize: ec2.InstanceSize.LARGE,
        dockerImageTag: 'java17',
        dockerEnv: BETTER_MC_FORGE_BMC4_ENV,
        ...props,
      },
    );
  }
}
