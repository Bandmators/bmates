import { EventData, Node } from '@bmates/renderer';

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

    this.waveform = this.extractWaveform(this.data.source.buffer);

    this._initEvent();
  }

  private extractWaveform(buffer: AudioBuffer) {
    if (!buffer || !buffer.length) return new Float32Array();
    const channelData = buffer.getChannelData(0);
    const sampleMount = Math.min(channelData.length, 100);
    const blockSize = Math.floor(channelData.length / sampleMount);
    const waveform = new Float32Array(sampleMount);

    for (let i = 0; i < sampleMount; i++) {
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(channelData[i * blockSize + j]);
      }
      waveform[i] = sum / blockSize;
    }

    const maxAmplitude = Math.max(...waveform);
    for (let i = 0; i < sampleMount; i++) {
      waveform[i] /= maxAmplitude;
    }

    return waveform;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override update(_dT: number) {}

  override draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, this.style.wave.borderRadius);
    ctx.fillStyle = '#c3c3c3';
    ctx.fill();
    ctx.closePath();

    // ctx.clip();
    if (this.waveform) this.drawSmoothWave(ctx);

    ctx.restore();
  }

  private drawSmoothWave(ctx: CanvasRenderingContext2D) {
    const marginHeight = 8;
    const middleY = this.y + this.height / 2;
    const scaleY = this.height / 2 - marginHeight;

    ctx.beginPath();
    ctx.moveTo(this.x, middleY);

    let prevX = this.x;
    let prevY = middleY;
    for (let i = 0; i < this.waveform.length; i++) {
      const x = this.x + (i / this.waveform.length) * this.width;
      const y = middleY - this.waveform[i] * scaleY;

      const midX = (prevX + x) / 2;
      const midY = (prevY + y) / 2;

      ctx.quadraticCurveTo(prevX, prevY, midX, midY);

      prevX = x;
      prevY = y;
    }
    ctx.lineTo(this.x + this.width, middleY);

    prevX = this.x + this.width;
    prevY = middleY;
    for (let i = this.waveform.length - 1; i >= 0; i--) {
      const x = this.x + (i / this.waveform.length) * this.width;
      const y = middleY + this.waveform[i] * scaleY;

      const midX = (prevX + x) / 2;
      const midY = (prevY + y) / 2;

      ctx.quadraticCurveTo(prevX, prevY, midX, midY);

      prevX = x;
      prevY = y;
    }
    ctx.closePath();

    const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = 'rgb(0, 0, 0, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  private setCursor(cursorStyle: string) {
    document.body.style.cursor = cursorStyle;
  }

  private _initEvent() {
    let isDragging = false;
    // let startX = 0;
    let moveX = 0;

    this.on('mouseover', () => {
      this.setCursor('pointer');
    });
    this.on('mouseout', () => {
      this.setCursor('default');
    });

    this.on('mousedown', (evt: EventData) => {
      isDragging = true;
      // startX = evt.originalEvent.clientX;
      moveX = evt.originalEvent.clientX;
      evt.bubble = false;
    });

    this.on('mousemove', (evt: EventData) => {
      evt.bubble = false;
      if (isDragging) {
        const deltaX = evt.originalEvent.clientX - moveX;
        this.x = this.x + deltaX;
        this.data.start = this.x / (this.style.timeline.gapWidth * 10);
        moveX = evt.originalEvent.clientX;
      }
    });

    this.on('mouseup', (evt: EventData) => {
      evt.bubble = false;
      isDragging = false;
    });

    this.on('mouseleave', (evt: EventData) => {
      evt.bubble = false;
      isDragging = false;
    });
  }
}
