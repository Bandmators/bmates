import { Group, Node } from '@bmates/renderer';

import { EditorStyleType, TrackDataType } from '../types';

class SideTrack extends Node {
  constructor(
    x: number,
    y: number,
    protected data: TrackDataType,
    protected style: EditorStyleType,
  ) {
    super();

    this.x = x;
    this.y = y;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(dT: number): void {}

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'black';
    ctx.font = '24px Barlow';
    ctx.textBaseline = 'top';
    ctx.fillText(this.data.category, this.x, this.y);

    ctx.restore();
  }
}

export class Sidebar extends Group {
  override name = 'Sidebar';

  constructor(
    protected style: EditorStyleType,
    data: TrackDataType[],
  ) {
    super();

    let y = 50;
    data.forEach(track => {
      this.add(new SideTrack(0, y, track, this.style));
      y += this.style.wave.height;
    });
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  override update(_dT: number) {}

  override draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // layout
    ctx.fillStyle = this.style.theme.background;
    ctx.fillRect(0, 0, this.style.sidebar.width - this.style.timeline.gapWidth, ctx.canvas.height);

    // right border line
    ctx.strokeStyle = this.style.theme.lineColor;
    ctx.beginPath();
    ctx.moveTo(this.style.sidebar.width - this.style.timeline.gapWidth, 0);
    ctx.lineTo(this.style.sidebar.width - this.style.timeline.gapWidth, ctx.canvas.height);
    ctx.stroke();

    ctx.restore();
  }
}
