import { EventData, Node, getCursor, setCursor } from '@bmates/renderer';

import { EditorStyleType, SongDataType } from '@/types';

export class Wave extends Node {
  override name = 'Wave';

  private waveform: Float32Array;

  private _isDragging = false;

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

    if (this._isDragging) this._waveSanpping(ctx);

    if (this._isDragging) this._timeIndicator(ctx);

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

  private _waveSanpping(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.style.wave.snapping;
    ctx.beginPath();
    ctx.moveTo(this.x, 0);
    ctx.lineTo(this.x, ctx.canvas.height);
    ctx.lineWidth = 1;
    ctx.setLineDash([10]);
    ctx.stroke();
  }

  private _timeIndicator(ctx) {
    const timeString = this.formatTime(this.data.start);
    ctx.fillStyle = '#000'; // 텍스트 색상
    ctx.font = '12px Arial'; // 텍스트 폰트
    ctx.fillText(timeString, this.x, this.y + this.height + 15); // 텍스트 위치
  }

  private formatTime(start: number): string {
    const totalMilliseconds = Math.floor(start * 1000);
    const minutes = Math.floor(totalMilliseconds / 60000);
    const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
    const milliseconds = totalMilliseconds % 1000;

    return `${minutes}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
  }

  private _initEvent() {
    let moveX = 0;

    this.on('mouseover', () => {
      if (getCursor() === 'default' || getCursor() === '') setCursor('pointer');
    });
    this.on('mouseout', (evt: EventData) => {
      if (getCursor() === 'pointer') setCursor('default');
      if (this._isDragging) {
        evt.bubble = false;
        this._isDragging = false;
      }
    });

    this.on('mousedown', (evt: EventData) => {
      if (evt.originalEvent.button !== 0) return;

      this._isDragging = true;
      moveX = evt.originalEvent.clientX;
      evt.bubble = false;
    });

    // this.on('mousemove', (evt: EventData) => {
    //   if (this._isDragging) {
    //     evt.bubble = false;
    //     const deltaX = evt.originalEvent.clientX - moveX;
    //     this.x = this.x + deltaX;
    //     this.data.start = this.x / (this.style.timeline.gapWidth * 10);
    //     moveX = evt.originalEvent.clientX;
    //   }
    // });
    this.on('mousemove', (evt: EventData) => {
      if (this._isDragging) {
        evt.bubble = false;
        const deltaX = evt.originalEvent.clientX - moveX;
        const newX = this.x + deltaX;

        // 다른 Wave와의 충돌 확인
        const isColliding = this.checkCollision(newX);
        if (!isColliding) {
          this.x = newX;
          this.data.start = this.x / (this.style.timeline.gapWidth * 10);
        }
        moveX = evt.originalEvent.clientX;
      }
    });

    this.on('mouseup', (evt: EventData) => {
      if (this._isDragging) {
        evt.bubble = false;
        this._isDragging = false;
      }
    });

    this.on('mouseleave', (evt: EventData) => {
      if (this._isDragging) {
        evt.bubble = false;
        this._isDragging = false;
      }
    });
  }

  // private checkCollision(newX: number): boolean {
  //   const otherWaves = this.parent.children.filter(child => child instanceof Wave && child !== this);

  //   for (const wave of otherWaves) {
  //     const waveEnd = wave.data.start + wave.data.long; // 다른 Wave의 끝 위치
  //     const newWaveEnd = newX / (this.style.timeline.gapWidth * 10) + this.data.long; // 현재 Wave의 끝 위치

  //     // 좌우 충돌 확인
  //     if (newX / (this.style.timeline.gapWidth * 10) < waveEnd && newWaveEnd > wave.data.start) {
  //       return true; // 충돌 발생
  //     }
  //   }
  //   return false; // 충돌 없음
  // }
  private checkCollision(newX: number): boolean {
    // 다른 Wave 객체들을 가져오는 로직 (예: this.parent.children)
    const otherWaves = this.parent.children.filter(child => child instanceof Wave && child !== this);

    for (const wave of otherWaves) {
      if (newX < wave.x + wave.width && newX + this.width > wave.x) {
        return true; // 충돌 발생
      }
    }
    return false; // 충돌 없음
  }
}
