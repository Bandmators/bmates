/* eslint-disable @typescript-eslint/no-unused-vars */
import { EventData, Node } from '@bmates/renderer';

import { generateUniqueId } from 'src/utils';

import { EditorStyleType, SongDataType } from '../types';
import { Editor } from './Editor';
import { Track } from './Track';
import { Workground } from './Workground';

export class Wave extends Node {
  override name = 'Wave';

  private waveform: Float32Array;
  private _selected = false;
  private _snappingY: number | null = null; // 스내핑될 y 위치를 저장하는 변수 추가

  constructor(
    public data: SongDataType,
    private style: EditorStyleType,
  ) {
    super({ draggable: true, listening: true });

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

    // 드래그 중일 때 스내핑될 공간 표시
    if (this.isDragging && this._snappingY !== null) {
      ctx.beginPath();

      ctx.fillStyle = '#c3c3c388'; // 회색으로 설정
      ctx.roundRect(this.x, this._snappingY, this.width, this.height, this.style.wave.borderRadius); // 스내핑될 위치에 사각형 그리기
      ctx.fill();
      ctx.closePath();
    }

    if (this.data.mute) {
      ctx.globalAlpha = 0.5;
    }

    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, this.style.wave.borderRadius);
    ctx.fillStyle = '#c3c3c3';
    ctx.fill();
    ctx.closePath();

    if (this._selected) {
      ctx.strokeStyle = 'rgba(123, 123, 123, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

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
    this.on('dragstart', (evt: EventData) => {
      this.zIndex = 1000;
      this.parent.zIndex = 1000;
      this.parent.call('wave-dragstart', evt);
    });
    this.on('draging', (evt: EventData) => {
      if (evt.data) {
        // block vertical move
        if (this.x < 0) {
          this.x = 0;
          return;
        }

        if (this.data.lock) {
          // block horizontal move, if collision
          // this.x = evt.data.prevX;
        } else {
          this.data.start = this.x / (this.style.timeline.gapWidth * 10);
          this.parent.call('wave-draging', evt);

          const newGroup = Math.max(
            0,
            Math.floor((this.y - this.style.wave.margin) / (this.style.wave.height + this.style.wave.margin)),
          );
          this.data.group = newGroup;
          this._snappingY =
            this.style.timeline.height +
            this.style.wave.margin +
            newGroup * (this.style.wave.height + this.style.wave.margin);
        }
      }
    });
    this.on('dragend', (evt: EventData) => {
      if (this._snappingY) {
        this.zIndex = 0;
        this.parent.zIndex = 0;

        this.y = this._snappingY;
        this._snappingY = null;

        const parentTrack = this.parent as Track;
        const parentWorkground = parentTrack.parent.parent as Workground;
        const editor = parentWorkground.parent as Editor;
        let newParent = parentWorkground.getTracks()[this.data.group] as Track;

        const index = parentTrack.children.indexOf(this);
        if (index !== -1) {
          parentTrack.children.splice(index, 1);
        }

        if (!newParent) {
          newParent = parentWorkground.addTrack({
            id: generateUniqueId(),
            category: 'New Category',
            songs: [],
          });
          editor.call('data-change', { data: this.data, target: this }, false);
        }
        newParent.add(this);
      }
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

  setX(x: number) {
    this.x = x;
    this.data.start = x / (this.style.timeline.gapWidth * 10);
  }

  setSelected(selected: boolean) {
    this._selected = selected;
  }

  export() {
    return this.data;
  }
}
