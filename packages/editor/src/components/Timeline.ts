import { Node } from '@bmates/renderer';

import { EditorStyleType } from '../types';

export class Timeline extends Node {
  override name = 'Timeline';

  constructor(
    private style: EditorStyleType,
    private _timeEnd: number,
    private _scrollX: number,
    private posY: number = 30,
  ) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override update(_dT: number) {}

  override draw(ctx: CanvasRenderingContext2D) {
    this._drawTime(ctx);
  }

  _drawTime(ctx: CanvasRenderingContext2D) {
    ctx.save();

    ctx.lineWidth = 1;

    const divide = this.style.timeline.timeDivde;
    for (let i = 0; i < this._timeEnd + 30; i++) {
      const begin = this.style.timeline.gapWidth * divide * i;

      ctx.strokeStyle = this.style.theme.strokeLineColor;
      ctx.beginPath();
      ctx.moveTo(begin, this.posY);
      ctx.lineTo(begin, this.posY + this.style.timeline.gapHeight);
      ctx.stroke();

      ctx.strokeStyle = this.style.theme.lineColor;
      ctx.moveTo(begin, this.posY + this.style.timeline.gapHeight);
      ctx.lineTo(begin, this.posY + this.style.timeline.gapHeight + ctx.canvas.height);
      ctx.stroke();

      ctx.strokeStyle = this.style.theme.lineColor;
      ctx.textAlign = 'center';
      ctx.fillText(`${i}s`, begin, this.posY + this.style.timeline.textY);

      for (let j = 1; j < divide; j++) {
        ctx.beginPath();
        ctx.moveTo(begin + j * this.style.timeline.gapWidth, this.posY);
        ctx.lineTo(begin + j * this.style.timeline.gapWidth, this.posY + this.style.timeline.gapHeight / 2);
        ctx.stroke();
      }
    }

    ctx.strokeStyle = this.style.theme.lineColor;
    ctx.beginPath();
    ctx.moveTo(0, this.posY);
    ctx.lineTo(this.style.timeline.gapWidth * divide * this._timeEnd, this.posY);
    ctx.stroke();

    ctx.restore();
  }

  set scrollX(value: number) {
    this._scrollX = value;
  }

  get scrollX() {
    return this._scrollX;
  }

  setTimeEnd(timeEnd: number) {
    this._timeEnd = timeEnd;
  }
}
