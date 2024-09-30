import { Group } from '@bmates/renderer';

import { SongDataType } from '../types';

export class Track extends Group {
  override name = 'Track';

  constructor(private data: SongDataType[]) {
    super();
    // this.data.forEach(child => this.add(new Wave(child)));
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  override update(_dT: number) {}

  override draw(_ctx: CanvasRenderingContext2D) {}
}
