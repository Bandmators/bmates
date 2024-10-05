import { Container } from '@bmates/renderer';

import { TrackDataType } from '../types';
import { Wave } from './Wave';

export class Track extends Container<Wave> {
  override name = 'Track';

  constructor(public data: TrackDataType) {
    super();
    // this.data.forEach(child => this.add(new Wave(child)));
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  override update(_dT: number) {}

  override draw(_ctx: CanvasRenderingContext2D) {}

  export() {
    return {
      ...this.data,
      songs: this.children.map(wave => wave.export()),
    };
  }
}
