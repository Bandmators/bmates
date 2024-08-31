import { Node } from '@bmates/renderer';

import { EditorStyleType, SongDataType } from '@/types';

export class Wave extends Node {
  override name = 'Wave';

  private waveform: Float32Array;

  constructor(
    private data: SongDataType,
    private style: EditorStyleType,
  ) {
    super();

    this.x = this.style.timeline.gapWidth * (this.data.start * 10);
    this.y =
      this.style.timeline.height +
      (this.style.wave.height + this.style.wave.margin) * this.data.group +
      this.style.wave.margin;
    this.width = this.style.timeline.gapWidth * (this.data.long * 10);
    this.height = this.style.wave.height;

    this.waveform = this.extractWaveform(this.data.buffer);
  }

  private extractWaveform(buffer: AudioBuffer): Float32Array {
    if (!buffer || !buffer.length) return;

    const channelData = buffer.getChannelData(0);
    const step = Math.ceil(channelData.length / this.width);
    const waveform = new Float32Array(this.width);

    for (let i = 0; i < this.width; i++) {
      waveform[i] = channelData[i * step];
    }

    return waveform;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override update(_dT: number) {}

  override draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    ctx.roundRect(this.x, this.y, this.width, this.height, this.style.wave.borderRadius);
    ctx.fillStyle = '#c3c3c3';
    ctx.fill();

    ctx.fillText(JSON.stringify(this.data), this.x, this.y);
    if (this.waveform) this.drawWaveform(ctx);

    ctx.restore();
  }

  private drawWaveform(ctx: CanvasRenderingContext2D) {
    const midY = this.y + this.height / 2;
    const halfHeight = this.height / 2;

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#c3c3c3';
    ctx.beginPath();

    // 상단 파형 그리기
    let prevX = this.x;
    let prevY = midY;

    for (let i = 0; i < this.width; i++) {
      const x = this.x + i;
      const value = this.waveform[i];
      const y = midY - value * halfHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const ctrlX = (prevX + x) / 2;
        const ctrlY = prevY;
        ctx.quadraticCurveTo(ctrlX, ctrlY, x, y);
      }

      prevX = x;
      prevY = y;
    }

    ctx.lineTo(this.x + this.width, midY);

    prevX = this.x + this.width;
    prevY = midY;

    for (let i = this.width - 1; i >= 0; i--) {
      const x = this.x + i;
      const value = this.waveform[i];
      const y = midY + value * halfHeight;

      if (i === this.width - 1) {
        ctx.lineTo(x, y);
      } else {
        const ctrlX = (prevX + x) / 2;
        const ctrlY = prevY;
        ctx.quadraticCurveTo(ctrlX, ctrlY, x, y);
      }

      prevX = x;
      prevY = y;
    }

    ctx.lineTo(this.x, midY);
    ctx.fillStyle = '#ff0000';
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}
