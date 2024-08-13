import { EventData, Group } from '@bmates/renderer';

import { EditorDataType, EditorStyleType, SongDataType, TrackDataType } from '@/types';

import { Timeline, Track, TrackGroup, Wave } from './';

export class Workground extends Group {
  override name = 'Workground';

  private timeline: Timeline | undefined;
  private scrollX = 0;

  constructor(
    protected canvas: HTMLCanvasElement,
    protected style: EditorStyleType,
    data: EditorDataType[],
  ) {
    super();

    this.x = 0;
    this.y = 0;
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this._initLayout(data);
    this._initEvent();
  }

  private _initLayout = (data: EditorDataType[]) => {
    data.forEach(tGroup => {
      this.addTrackGroup(tGroup.tracks);
    });

    this.timeline = new Timeline(this.style, 100, 0);
    this.add(this.timeline);
  };

  private _initEvent = () => {
    let isDragging = false;
    let startX = 0;
    let moveX = 0;

    this.on('mousedown', (evt: EventData) => {
      isDragging = true;
      startX = evt.originalEvent.clientX;
      moveX = evt.originalEvent.clientX;
    });

    this.on('mousemove', (evt: EventData) => {
      if (isDragging) {
        const deltaX = moveX - evt.originalEvent.clientX;
        this.scrollX = Math.max(this.scrollX + deltaX, 0);
        moveX = evt.originalEvent.clientX;
      }
    });

    this.on('mouseup', (evt: EventData) => {
      isDragging = false;

      const endX = evt.originalEvent.clientX;

      if (startX === endX && this.timeline) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = evt.originalEvent.clientX - rect.left + this.scrollX;
        this.timeline.setRedLinePos(clickX - this.x);
      }
    });

    this.on('mouseleave', () => {
      isDragging = false;
    });
  };

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
    return this.timeline?.isPlaying();
  }

  play() {
    this.timeline?.play();
  }

  pause() {
    this.timeline?.pause();
  }

  stop() {
    this.timeline?.stop();
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  override update(dT: number) {}

  override draw(ctx: CanvasRenderingContext2D) {
    ctx.translate(-this.scrollX + this.x, this.y);
  }
}
