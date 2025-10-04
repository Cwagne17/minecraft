import { Construct } from 'constructs';
import { CurseForgePatternBase, CurseForgePatternProps } from './CurseForgePatternBase';

export class HomesteadCozy extends CurseForgePatternBase {
  constructor(scope: Construct, id: string, props: CurseForgePatternProps = {}) {
    super(
      scope,
      id,
      {
        cfPageUrl: 'https://www.curseforge.com/minecraft/modpacks/homestead-cozy',
        defaultVolumeGiB: 50,
        defaultMemory: '6G',
      },
      props,
    );
  }
}
