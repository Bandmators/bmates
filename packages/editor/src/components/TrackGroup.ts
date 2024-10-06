import { Container } from '@bmates/renderer';

import { Track } from './Track';

export class TrackGroup extends Container<Track> {
  override name = 'TrackGroup';

  constructor() {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override update(_dT: number) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override draw(_ctx: CanvasRenderingContext2D) {}

  getTracks() {
    return this.children;
  }

  getWaves() {
    return this.getTracks().flatMap(track => track.children);
  }
}
