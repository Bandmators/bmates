import { Node } from '@bmates/renderer';

import { EditorStyleType } from '../types';
import { formatTime } from '../utils';

export class TimeIndicator extends Node {
  override name = 'TimeIndicator';

  private _time: number = 0;

  constructor(private style: EditorStyleType) {
    super({
      visible: false,
    });
  }

  override draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const timeString = formatTime(this._time);
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.fillText(timeString, this.x, this.y + this.height + 15);
    ctx.restore();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_dT: number): void {}

  setTime(time: number) {
    this._time = time;
  }
}
