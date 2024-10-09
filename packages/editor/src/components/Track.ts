import { Container } from '@bmates/renderer';

import { TrackDataType } from '../types';
import { TrackGroup } from './TrackGroup';
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

  snapshot() {
    (this.parent as TrackGroup).snapshot();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setAttrs(attrs: any) {
    this.name = attrs.name;
    this.data = attrs.data;
  }

  override toObject(): object {
    return JSON.parse(
      JSON.stringify({
        name: this.name,
        data: this.data,
        children: this.children.map(child => child.toObject()),
      }),
    );
  }
}
