import { EventData, Layer, setCursor } from '@bmates/renderer';

import { EditorDataType, EditorStyleType, SongDataType, TrackDataType } from '@/types';

import { Timeline, Track, TrackGroup, Wave } from './';
import { Playhead } from './Playhead';
import { Snapping } from './Snapping';
import { TimeIndicator } from './TimeIndicator';

export class Workground extends Layer {
  override name = 'Workground';

  private timeline: Timeline;
  private playhead: Playhead;
  private timeIndicator: TimeIndicator;
  private snapping: Snapping;

  private _minScrollX = 0;

  constructor(
    protected canvas: HTMLCanvasElement,
    protected style: EditorStyleType,
    data: EditorDataType[],
    private scroll = { x: 0, y: 0 },
  ) {
    super();

    this.x = 0;
    this.y = 0;
    this.width = this.canvas.width * 1000;
    this.height = this.canvas.height * 1000;

    this._minScrollX = -this.style.timeline.gapWidth;
    this.scroll.x = this._minScrollX;

    this._initLayout(data);
    this._initEvent();
    this._initWaveEvent();
  }

  private _initLayout(data: EditorDataType[]) {
    data.forEach(tGroup => {
      this.addTrackGroup(tGroup.tracks);
    });

    this.timeline = new Timeline(this.style, 100, 0);
    this.timeline.zIndex = -1;
    this.add(this.timeline);

    this.playhead = new Playhead(this.style);
    this.playhead.zIndex = 100;
    this.add(this.playhead);

    this.timeIndicator = new TimeIndicator(this.style);
    this.add(this.timeIndicator);

    this.snapping = new Snapping(this.style);
    this.add(this.snapping);
  }

  private _initEvent() {
    let isDragging = false;
    let startX = 0;
    let moveX = 0;

    this.on('mousedown', (evt: EventData) => {
      if (evt.target.name === 'Wave') return;

      startX = evt.originalEvent.clientX;

      if (evt.originalEvent.button !== 1) return;
      setCursor('all-scroll');

      isDragging = true;
      moveX = evt.originalEvent.clientX;
    });

    this.on('mousemove', (evt: EventData) => {
      if (isDragging) {
        const deltaX = moveX - evt.originalEvent.clientX;
        this.scroll.x = Math.max(this.scroll.x + deltaX, this._minScrollX);
        moveX = evt.originalEvent.clientX;
      }
    });

    this.on('mouseup', (evt: EventData) => {
      if (evt.originalEvent.button === 1) setCursor('default');

      isDragging = false;

      const endX = evt.originalEvent.clientX;
      if (startX === endX && this.playhead && evt.originalEvent.button === 0) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = evt.originalEvent.clientX - rect.left + this.scroll.x;
        this.playhead.setPosition(clickX - this.x);
      }
    });

    this.on('mouseleave', () => {
      isDragging = false;
    });
  }

  private _initWaveEvent() {
    this.on('wave-dragstart', (evt: EventData) => {
      this.timeIndicator.visible = true;
      this.timeIndicator.setTime(evt.target.data.start);
      this.timeIndicator.x = evt.target.x;
      this.timeIndicator.y = evt.target.y + evt.target.height;

      this.snapping.visible = true;
      this.snapping.x = evt.target.x;
      this.snapping.y = evt.target.y + evt.target.height;
    });
    this.on('wave-draging', (evt: EventData) => {
      this.timeIndicator.setTime(evt.target.data.start);
      this.timeIndicator.x = evt.target.x;
      this.timeIndicator.y = evt.target.y + evt.target.height;

      this.snapping.x = evt.target.x;
      this.snapping.y = evt.target.y + evt.target.height;
    });
    this.on('wave-dragend', () => {
      this.timeIndicator.visible = false;
      this.snapping.visible = false;
    });
  }

  addTrackGroup(data: TrackDataType[]) {
    const group = new TrackGroup(data);
    this.add(group);
    data.forEach(d => this.addTrack(group, d.songs));
    return group;
  }

  addTrack(parent: TrackGroup, data: SongDataType[]) {
    const track = new Track(data);
    parent.add(track);
    data.forEach(d => this.addWave(track, d));
    return track;
  }

  addWave(parent: Track, data: SongDataType) {
    const wave = new Wave(data, this.style);
    parent.add(wave);
    return wave;
  }

  isPlaying() {
    return this.playhead?.isPlaying();
  }

  play() {
    this.playhead?.play();
  }

  pause() {
    this.playhead?.pause();
  }

  stop() {
    this.playhead?.stop();
  }

  getCurrentTime() {
    return this.playhead?.getCurrentTime() || 0;
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  override update(dT: number) {}

  override draw(ctx: CanvasRenderingContext2D) {
    ctx.translate(this.x - this.scroll.x, this.y);
  }
}
