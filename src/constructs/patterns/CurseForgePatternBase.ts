import { Construct } from 'constructs';
import { MinecraftServerBase, MinecraftServerBaseProps } from '../MinecraftServerBase';

export interface CurseForgePatternProps extends Omit<MinecraftServerBaseProps, 'dockerEnv'> {
  /**
   * Memory allocation for the server.
   * @default from pattern
   */
  readonly memory?: string;
}

export interface CurseForgePatternConfig {
  readonly cfPageUrl: string;
  readonly defaultVolumeGiB: number;
  readonly defaultMemory: string;
}

export class CurseForgePatternBase extends MinecraftServerBase {
  constructor(
    scope: Construct,
    id: string,
    config: CurseForgePatternConfig,
    props: CurseForgePatternProps = {},
  ) {
    const memory = props.memory ?? config.defaultMemory;
    const volumeGiB = props.volumeGiB ?? config.defaultVolumeGiB;

    super(scope, id, {
      ...props,
      volumeGiB,
      dockerEnv: {
        TYPE: 'AUTO_CURSEFORGE',
        EULA: 'TRUE',
        MEMORY: memory,
        CF_PAGE_URL: config.cfPageUrl,
      },
    });
  }
}
