import { Construct } from 'constructs';
import { CurseForgePatternBase, CurseForgePatternProps } from './CurseForgePatternBase';

export class CiscosAdventureRpg extends CurseForgePatternBase {
  constructor(scope: Construct, id: string, props: CurseForgePatternProps = {}) {
    super(
      scope,
      id,
      {
        cfPageUrl: 'https://www.curseforge.com/minecraft/modpacks/ciscos-adventure-rpg-ultimate',
        defaultVolumeGiB: 60,
        defaultMemory: '8G',
      },
      props,
    );
  }
}
