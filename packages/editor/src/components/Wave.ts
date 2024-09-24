/* eslint-disable @typescript-eslint/no-unused-vars */
import { EventData, Node, getCursor, setCursor } from '@bmates/renderer';

import { EditorStyleType, SongDataType } from '@/types';

export class Wave extends Node {
  override name = 'Wave';

  private waveform: Float32Array;

  constructor(
    public data: SongDataType,
    private style: EditorStyleType,
  ) {
    super({ draggable: true });

    this.x = this.style.timeline.gapWidth * (this.data.start * 10);
    this.y =
      this.style.timeline.height +
      (this.style.wave.height + this.style.wave.margin) * this.data.group +
      this.style.wave.margin;
    this.width = this.style.timeline.gapWidth * (this.data.long * 10);
    this.height = this.style.wave.height;

    this.waveform = this.extractWaveform(this.data.source.buffer);

    // this._initEvent();
    this._initDrag();
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

  private _initDrag() {
    this.on('mouseover', () => {
      if (getCursor() === 'default' || getCursor() === '') setCursor('pointer');
    });
    this.on('mouseout', (evt: EventData) => {
      if (getCursor() === 'pointer') setCursor('default');
    });

    this.on('dragstart', (evt: EventData) => {
      this.parent.call('wave-dragstart', evt);
    });
    this.on('draging', (evt: EventData) => {
      if (evt.data) {
        // block vertical move
        this.y = evt.data.prevY;

        const isCollision = this.checkCollision(evt.data.newX);
        if (isCollision) {
          // block horizontal move, if collision
          this.x = evt.data.prevX;
        } else {
          this.data.start = this.x / (this.style.timeline.gapWidth * 10);
          this.parent.call('wave-draging', evt);
        }
      }
    });
    this.on('dragend', (evt: EventData) => {
      this.parent.call('wave-dragend', evt);
    });
  }

  private checkCollision(newX: number): boolean {
    const otherWaves = this.parent.children.filter(child => child instanceof Wave && child !== this);

    for (const wave of otherWaves) {
      if (newX < wave.x + wave.width && newX + this.width > wave.x) {
        return true;
      }
    }
    return false;
  }
}
