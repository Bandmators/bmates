import { Node } from '@bmates/renderer';

import { EditorStyleType, SongDataType } from '@/types';

export class Wave extends Node {
  override name = 'Wave';

  constructor(
    private data: SongDataType,
    private style: EditorStyleType,
  ) {
    super();

    this.x = 1 * this.style.timeline.gapWidth * (this.data.start * 10);
    this.y =
      this.style.timeline.height +
      (this.style.wave.height + this.style.wave.margin) * this.data.group +
      this.style.wave.margin;
    this.width = 1 * this.style.timeline.gapWidth * (this.data.long * 10);
    this.height = this.style.wave.height;

    this.on('mousemove', () => {});
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  override update(_dT: number) {}

  override draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    ctx.roundRect(this.x, this.y, this.width, this.height, this.style.wave.borderRadius);
    ctx.fillStyle = '#c3c3c3';
    ctx.fill();

    ctx.restore();
  }
}
