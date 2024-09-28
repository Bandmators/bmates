import { Node } from '@bmates/renderer';

import { EditorStyleType } from '@/types';

export class Playhead extends Node {
  override name = 'Playhead';

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
      this.x += this.style.timeline.gapWidth * this.style.timeline.timeDivde * this._dT;
      this.parent.call('playhead-move', {
        target: this,
        data: this.x,
      });
    }
  }

  override draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(this.x - 6, 0);
    ctx.lineTo(this.x - 6, this.style.timeline.height / 2);
    ctx.lineTo(this.x, this.style.timeline.height / 2 + 10);
    ctx.lineTo(this.x + 6, this.style.timeline.height / 2);
    ctx.lineTo(this.x + 6, 0);
    ctx.fill();

    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(this.x, 0);
    ctx.lineTo(this.x, ctx.canvas.height);
    ctx.stroke();

    ctx.restore();
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
    this.x = 0;
  }

  getCurrentTime(): number {
    return this.x / (this.style.timeline.gapWidth * this.style.timeline.timeDivde);
  }
}
