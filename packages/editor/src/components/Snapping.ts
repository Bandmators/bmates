import { Node } from '@bmates/renderer';

import { EditorStyleType } from '../types';

export class Snapping extends Node {
  override name = 'Snapping';

  constructor(private style: EditorStyleType) {
    super({
      visible: false,
    });
  }

  override draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = this.style.wave.snapping;
    ctx.beginPath();
    ctx.moveTo(this.x, 0);
    ctx.lineTo(this.x, ctx.canvas.height);
    ctx.lineWidth = 1;
    ctx.setLineDash([10]);
    ctx.stroke();
    ctx.restore();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_dT: number): void {}
}
