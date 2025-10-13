import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { MinecraftDockerEnv, MinecraftGameVersion, OpPermissionLevel } from '../../shared/types';
import { MinecraftServerBaseProps } from '../MinecraftServerBase';
import { CurseForgePatternBase } from './CurseForgePatternBase';

const ALL_THE_MODS_10_ENV: MinecraftDockerEnv = {
    cfPageUrl: 'https://www.curseforge.com/minecraft/modpacks/all-the-mods-10',
    memory: '12G',
    version: MinecraftGameVersion.V1_20_1,
    motd: 'Welcome to All the Mods 10!',
    opPermissionLevel: OpPermissionLevel.LEVEL_4,
};

export class AllTheMods10 extends CurseForgePatternBase {
    constructor(scope: Construct, id: string, props: Omit<MinecraftServerBaseProps, 'dockerEnv' | 'dockerImageTag' | 'volumeGiB' | 'instanceSize'> = {}) {
        super(
            scope,
            id,
            {
                instanceSize: ec2.InstanceSize.XLARGE,
                dockerImageTag: 'java17',
                dockerEnv: ALL_THE_MODS_10_ENV,
                allocateElasticIp: false,
                ...props,
            },
        );
    }
}