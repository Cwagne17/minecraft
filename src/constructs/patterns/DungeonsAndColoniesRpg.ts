import { Construct } from 'constructs';
import { CurseForgePatternBase, CurseForgePatternProps } from './CurseForgePatternBase';

export class DungeonsAndColoniesRpg extends CurseForgePatternBase {
  constructor(scope: Construct, id: string, props: CurseForgePatternProps = {}) {
    super(
      scope,
      id,
      {
        cfPageUrl: 'https://www.curseforge.com/minecraft/modpacks/dungeons-and-colonies-rpg',
        defaultVolumeGiB: 50,
        defaultMemory: '6G',
      },
      props,
    );
  }
}
