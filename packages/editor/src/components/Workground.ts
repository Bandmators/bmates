import { EventData, Layer, setCursor } from '@bmates/renderer';

import { EditorDataType, EditorStyleType, SongDataType, TrackDataType } from '@/types';

import { Timeline, Track, TrackGroup, Wave } from './';
import { TimeIndicator } from './TimeIndicator';

export class Workground extends Layer {
  override name = 'Workground';

  private timeline: Timeline | undefined;
  private timeIndicator: TimeIndicator;
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
  }

  private _initLayout(data: EditorDataType[]) {
    data.forEach(tGroup => {
      this.addTrackGroup(tGroup.tracks);
    });

    this.timeline = new Timeline(this.style, 100, 0);
    this.timeline.zIndex = -1;
    this.add(this.timeline);
    this.timeIndicator = new TimeIndicator(this.style);
    this.timeIndicator.zIndex = 100;
    this.add(this.timeIndicator);
  }

  private _initEvent() {
    let isDragging = false;
    let startX = 0;
    let moveX = 0;

    this.on('mousedown', (evt: EventData) => {
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
      setCursor('default');

      isDragging = false;

      const endX = evt.originalEvent.clientX;
      if (startX === endX && this.timeIndicator && evt.originalEvent.button === 0) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = evt.originalEvent.clientX - rect.left + this.scroll.x;
        this.timeIndicator.setPosition(clickX - this.x);
      }
    });

    this.on('mouseleave', () => {
      isDragging = false;
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
    return this.timeIndicator?.isPlaying();
  }

  play() {
    this.timeIndicator?.play();
  }

  pause() {
    this.timeIndicator?.pause();
  }

  stop() {
    this.timeIndicator?.stop();
  }

  getCurrentTime() {
    return this.timeIndicator?.getCurrentTime() || 0;
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  override update(dT: number) {}

  override draw(ctx: CanvasRenderingContext2D) {
    ctx.translate(this.x - this.scroll.x, this.y);
  }
}
