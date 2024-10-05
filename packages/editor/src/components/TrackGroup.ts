import { Group } from '@bmates/renderer';

export class TrackGroup extends Group {
  override name = 'TrackGroup';

  constructor() {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override update(_dT: number) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override draw(_ctx: CanvasRenderingContext2D) {}
}
