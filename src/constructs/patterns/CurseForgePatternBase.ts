import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { CURSEFORGE_API_PARAMETER_NAME } from '../../constants';
import { Bool, MinecraftDockerEnv, ServerType } from '../../shared/types';
import { MinecraftServerBase, MinecraftServerBaseProps } from '../MinecraftServerBase';

export interface CurseForgePatternProps extends Omit<MinecraftServerBaseProps, 'dockerEnv' | 'dockerImageTag' | 'volumeGiB' | 'instanceSize'> {
  /**
   * Size of the data volume in GiB.
   */
  readonly volumeGiB?: number;

  /**
   * Instance size for the Minecraft server.
   */
  readonly instanceSize: ec2.InstanceSize;

  /**
   * Docker image tag to use (e.g., 'java17', 'java21').
   */
  readonly dockerImageTag: string;

  /**
   * Docker environment variables specific to this pattern.
   */
  readonly dockerEnv: MinecraftDockerEnv;
}

export class CurseForgePatternBase extends MinecraftServerBase {
  constructor(
    scope: Construct,
    id: string,
    props: CurseForgePatternProps,
  ) {
    const baseDockerEnv: MinecraftDockerEnv = {
      type: ServerType.AUTO_CURSEFORGE,
      useAikarFlags: Bool.TRUE,
    };

    super(scope, id, {
      ...props,
      cfApiParameterName: CURSEFORGE_API_PARAMETER_NAME,
      dockerEnv: {
        ...baseDockerEnv,
        ...props.dockerEnv,
      },
    });
  }
}
