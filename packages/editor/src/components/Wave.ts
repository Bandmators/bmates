/* eslint-disable @typescript-eslint/no-unused-vars */
import { EventData, Node } from '@bmates/renderer';

import { generateUniqueId } from 'src/utils';

import { EditorStyleType, SongDataType, TrackDataType } from '../types';
import { Editor } from './Editor';
import { Track } from './Track';
import { Workground } from './Workground';

export class Wave extends Node {
  override name = 'Wave';

  gain: GainNode;
  private _source: AudioBufferSourceNode;
  private waveform: Float32Array;
  private _selected = false;
  private _snappingY: number | null = null;
  private _isCollision = false;

  set source(val) {
    this._source = val;
    this.waveform = this._extractWaveform(this.source.buffer);
    this.width = this.style.timeline.gapWidth * (this.data.long * 10);
  }
  get source() {
    return this._source;
  }

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

    // this._initEvent();
    this._initDrag();
  }

  private _extractWaveform(buffer: AudioBuffer) {
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

    if (this.isDragging) this._drawPrediction(ctx);

    if (this.data.mute || (this.parent as Track).data.mute) {
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
    if (this.waveform) this._drawSmoothWave(ctx);

    ctx.restore();
  }

  private _drawPrediction(ctx: CanvasRenderingContext2D) {
    if (this._isCollision || this.data.group < 0) {
      ctx.beginPath();
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      const lineY =
        this.style.timeline.height +
        (this.style.wave.height + this.style.wave.margin) * (this.data.group + 1) +
        this.style.wave.margin / 2;
      ctx.moveTo(0, lineY);
      ctx.lineTo(this.x + ctx.canvas.width, lineY);
      ctx.stroke();
      ctx.closePath();
    } else if (this._snappingY !== null) {
      ctx.beginPath();

      ctx.fillStyle = '#c3c3c388';
      ctx.roundRect(this.x, this._snappingY, this.width, this.height, this.style.wave.borderRadius);
      ctx.fill();
      ctx.closePath();
    }
  }

  private _drawSmoothWave(ctx: CanvasRenderingContext2D) {
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
    ctx.fillStyle = 'rgb(122, 122, 122)';
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
        if (this.data.lock) {
          this.x = evt.data.prevX;
          this.y = evt.data.prevY;
          return;
        }
        if (this.x < 0) {
          this.x = 0;
          return;
        }
        if (evt.originalEvent.shiftKey) {
          this.x = evt.data.prevX;
        }

        const parentTrack = this.parent as Track;
        const parentWorkground = parentTrack.parent.parent as Workground;

        this.data.start = this.x / (this.style.timeline.gapWidth * 10);
        parentTrack.call('wave-draging', evt);

        const newGroup = Math.min(
          Math.max(
            -1,
            Math.floor((this.y - this.style.wave.margin) / (this.style.wave.height + this.style.wave.margin)),
          ),
          parentWorkground.getTracks().length,
        );
        this.data.group = newGroup;
        this._snappingY =
          this.style.timeline.height +
          this.style.wave.margin +
          newGroup * (this.style.wave.height + this.style.wave.margin);

        const otherWaves = parentWorkground
          .getWaves()
          .filter(child => child !== evt.target && child.data.group === newGroup);
        this._isCollision = otherWaves.some(wave => {
          return this.x < wave.x + wave.width && this.x + this.width > wave.x;
        });
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
        const audioPlayer = editor._audioPlayer;
        const index = parentTrack.children.indexOf(this);
        if (index !== -1) {
          parentTrack.children.splice(index, 1);
        }

        if (this._isCollision || this.data.group < 0) {
          const otherWaves = parentWorkground.getWaves();
          otherWaves.forEach(wave => {
            if (wave.data.group > this.data.group) {
              wave.data.group++;
              wave.repositioning();
            }
          });
          this.data.group++;
          this.repositioning();

          const newParent = parentWorkground.addTrack();
          editor.call('data-change', { data: this.data, target: this }, false);
          newParent.add(this);
          audioPlayer.moveAudioTrack(this.data.id, newParent.data);
        } else {
          let newParent = parentWorkground.getTracks()[this.data.group] as Track;
          if (!newParent) {
            newParent = parentWorkground.addTrack();
            editor.call('data-change', { data: this.data, target: this }, false);
          }
          newParent.add(this);

          audioPlayer.moveAudioTrack(this.data.id, newParent.data);
        }
      }
      this._isCollision = false;
      this.parent.call('wave-dragend', evt);
      this.snapshot();
    });
  }

  setX(x: number) {
    this.x = x;
    this.data.start = x / (this.style.timeline.gapWidth * 10);
  }

  repositioning() {
    this.y =
      this.style.timeline.height +
      (this.style.wave.height + this.style.wave.margin) * this.data.group +
      this.style.wave.margin;
  }

  setSelected(selected: boolean) {
    this._selected = selected;
  }

  export() {
    return this.data;
  }

  snapshot() {
    (this.parent as Track).snapshot();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setAttrs(attrs: any) {
    this.name = attrs.name;
    this.x = attrs.x;
    this.y = attrs.y;
    this.width = attrs.width;
    this.height = attrs.height;
    this.data = attrs.data;
  }

  override toObject(): object {
    return JSON.parse(
      JSON.stringify({
        name: this.name,
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        data: this.data,
      }),
    );
  }
}
