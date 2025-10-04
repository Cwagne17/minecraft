import { Construct } from 'constructs';
import { CurseForgePatternBase, CurseForgePatternProps } from './CurseForgePatternBase';

export class BetterMcForgeBmc4 extends CurseForgePatternBase {
  constructor(scope: Construct, id: string, props: CurseForgePatternProps = {}) {
    super(
      scope,
      id,
      {
        cfPageUrl: 'https://www.curseforge.com/minecraft/modpacks/better-mc-forge-bmc4',
        defaultVolumeGiB: 60,
        defaultMemory: '8G',
      },
      props,
    );
  }
}
