import { Node } from '@bmates/renderer';

import { EditorStyleType } from '@/types';

export class Playhead extends Node {
  override name = 'Playhead';

  private _position: number = 0;
  private _isPlaying = false;

  constructor(
    private style: EditorStyleType,
    private _dT: number = 0,
  ) {
    super();
  }

  override update(dT: number) {
    this._dT = dT;
    if (this._isPlaying) {
      this._position += this.style.timeline.gapWidth * this.style.timeline.timeDivde * this._dT;
    }
  }

  override draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(this._position - 6, 0);
    ctx.lineTo(this._position - 6, this.style.timeline.height / 2);
    ctx.lineTo(this._position, this.style.timeline.height / 2 + 10);
    ctx.lineTo(this._position + 6, this.style.timeline.height / 2);
    ctx.lineTo(this._position + 6, 0);
    ctx.fill();

    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(this._position, 0);
    ctx.lineTo(this._position, ctx.canvas.height);
    ctx.stroke();

    ctx.restore();
  }

  setPosition(x: number) {
    this._position = x;
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
    this._position = 0;
  }

  getCurrentTime(): number {
    return this._position / (this.style.timeline.gapWidth * this.style.timeline.timeDivde);
  }
}
