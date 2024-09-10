import { Node } from '@bmates/renderer';

import { EditorStyleType } from '@/types';

export class Timeline extends Node {
  override name = 'Timeline';

  private _dT: number = 0;
  private _timeRedLinePosX: number = 0;
  private _isPlaying = false;

  constructor(
    private style: EditorStyleType,
    private _timeEnd: number,
    private _scrollX: number,
    private posY: number = 30,
  ) {
    super();
  }

  override update(_dT: number) {
    this._dT = _dT;
  }

  override draw(ctx: CanvasRenderingContext2D) {
    this.drawTime(ctx);
    this.drawRedLine(ctx);
  }

  drawTime(ctx: CanvasRenderingContext2D) {
    ctx.save();

    ctx.lineWidth = 1;

    const divide = this.style.timeline.timeDivde;
    for (let i = 0; i < this._timeEnd; i++) {
      const begin = this.style.timeline.gapWidth * divide * i;

      ctx.strokeStyle = this.style.theme.strokeLineColor;
      ctx.beginPath();
      ctx.moveTo(begin, this.posY);
      ctx.lineTo(begin, this.posY + this.style.timeline.gapHeight);
      ctx.stroke();

      ctx.strokeStyle = this.style.theme.lineColor;
      ctx.textAlign = 'center';
      ctx.fillText(`${i}s`, begin, this.posY - 3);

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

  c = 0;
  drawRedLine(ctx: CanvasRenderingContext2D) {
    if (this.isPlaying()) {
      this._timeRedLinePosX += this.style.timeline.gapWidth * this.style.timeline.timeDivde * this._dT;
      this.c += this._dT;
      // console.log(this.c);
    }
    // if (this._timeRedLinePosX > ctx.canvas.width) this._timeRedLinePosX = 0;

    ctx.save();

    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(this._timeRedLinePosX - 6, 0);
    ctx.lineTo(this._timeRedLinePosX - 6, this.posY / 2);
    ctx.lineTo(this._timeRedLinePosX, this.posY / 2 + 10);
    ctx.lineTo(this._timeRedLinePosX + 6, this.posY / 2);
    ctx.lineTo(this._timeRedLinePosX + 6, 0);
    ctx.fill();

    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(this._timeRedLinePosX, 0);
    ctx.lineTo(this._timeRedLinePosX, ctx.canvas.height);
    ctx.stroke();

    ctx.restore();
  }

  setRedLinePos(x: number) {
    this._timeRedLinePosX = x;
  }

  set scrollX(value: number) {
    this._scrollX = value;
  }

  get scrollX() {
    return this._scrollX;
  }

  isPlaying() {
    return this._isPlaying;
  }

  play() {
    this._isPlaying = true;
  }

  pause() {
    this._isPlaying = false;
  }

  stop() {
    this.pause();
    this._timeRedLinePosX = 0;
  }

  getCurrentTime(): number {
    return this._timeRedLinePosX / (this.style.timeline.gapWidth * this.style.timeline.timeDivde);
  }
}
