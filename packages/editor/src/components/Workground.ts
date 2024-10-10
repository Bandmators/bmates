import { EventData, Layer, setCursor } from '@bmates/renderer';

import AudioPlayer from '../AudioPlayer';
import { EditorStyleType, SongDataType, TrackDataType } from '../types';
import { generateUniqueId } from '../utils';
import { Timeline, Track, TrackGroup, Wave } from './';
import { Playhead } from './Playhead';
import { Snapping } from './Snapping';
import { TimeIndicator } from './TimeIndicator';

export class Workground extends Layer {
  override name = 'Workground';

  private timeline!: Timeline;
  private playhead!: Playhead;
  private timeIndicator!: TimeIndicator;
  private snapping!: Snapping;
  _trackGroup: TrackGroup;

  private _minScrollX = 0;

  constructor(
    protected canvas: HTMLCanvasElement,
    protected style: EditorStyleType,
    public data: TrackDataType[],
    private audioPlayer: AudioPlayer,
    private scroll = { x: 0, y: 0 },
  ) {
    super({ listening: true });

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

  private _initLayout(data: TrackDataType[]) {
    // this.addTrackGroup(data);
    this._trackGroup = new TrackGroup(this.style);
    this.add(this._trackGroup);
    data.forEach(d => this.addTrack(d));

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
    let isWaveOver = false;

    this.on('mousedown', (evt: EventData) => {
      if (evt.target.name === 'Wave') {
        return;
      }
      startX = evt.originalEvent!.clientX;

      if (evt.originalEvent!.button !== 1) return;
      setCursor('all-scroll');

      isDragging = true;
      moveX = evt.originalEvent!.clientX;
    });

    this.on('mousemove', (evt: EventData) => {
      if (evt.target.name === 'Wave') {
        if (!isWaveOver) {
          setCursor('pointer');
          isWaveOver = true;
        }
      } else if (isWaveOver) {
        setCursor('default');
        isWaveOver = false;
      }

      if (isDragging) {
        const deltaX = moveX - evt.originalEvent!.clientX;
        this.setScrollX(this.scroll.x + deltaX);
        moveX = evt.originalEvent!.clientX;
      }
    });

    this.on('mouseup', (evt: EventData) => {
      if (evt.originalEvent!.button === 1) setCursor('default');

      isDragging = false;

      const endX = evt.originalEvent!.clientX;
      if (startX === endX && this.playhead && evt.originalEvent!.button === 0) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = evt.originalEvent!.clientX - rect.left + this.scroll.x;
        this.playhead.x = clickX - this.x;

        if (this.isPlaying()) {
          this.audioPlayer.play(this.getCurrentTime());
        }
      }
    });

    this.on('mouseleave', () => {
      isDragging = false;
    });

    this.on('playhead-move', (evt: EventData) => {
      const playheadPosition = evt.data;
      const canvasWidth = this.canvas.width;

      if (playheadPosition < this.scroll.x || playheadPosition > this.scroll.x + canvasWidth) {
        this.scroll.x = Math.max(this._minScrollX, Math.min(playheadPosition, this.width - canvasWidth));
      }
      if (this.audioPlayer.getDuration() < this.getCurrentTime()) {
        this.pause();
        this.audioPlayer.pause();
        //@ts-ignore
        this.playhead.call('pause', false);
      }
    });
  }

  private _initWaveEvent() {
    let snappingClientX = -1;
    const SNAPPING_THRESHOLD = 10;

    const checkSnapping = (evt: EventData) => {
      const wave = evt.target as Wave;
      const otherWaves = this.getWaves().filter(child => child !== evt.target && child.data.group !== wave.data.group);
      const curX = wave.x;

      const snappingPosX = otherWaves.reduce((acc, wave) => {
        const waveStart = wave.x;
        const waveEnd = waveStart + wave.width;

        if (Math.abs(curX - waveStart) < SNAPPING_THRESHOLD) {
          return waveStart;
        } else if (Math.abs(curX - waveEnd) < SNAPPING_THRESHOLD) {
          return waveEnd;
        }
        return acc;
      }, -1);

      if (snappingPosX > 0 && snappingClientX < 0) {
        snappingClientX = evt.originalEvent!.clientX;
      }

      if (snappingPosX > 0) {
        if (Math.abs(snappingClientX - evt.originalEvent!.clientX) < SNAPPING_THRESHOLD) {
          wave.setX(snappingPosX);
          this.snapping.visible = true;
          this.snapping.x = wave.x;
        } else {
          wave.x -= snappingClientX - evt.originalEvent!.clientX;
          snappingClientX = -1;
        }
      } else {
        this.snapping.visible = false;
      }
    };

    let isPlayingDragStart = false;
    this.on('wave-dragstart', (evt: EventData) => {
      this.timeIndicator.visible = true;
      if (evt.target instanceof Wave) {
        this.timeIndicator.setTime(evt.target.data.start);
        this.timeIndicator.x = evt.target.x;
        this.timeIndicator.y = evt.target.y + evt.target.height;
      }
      snappingClientX = -1;
      if (!evt.originalEvent.shiftKey) checkSnapping(evt);
      isPlayingDragStart = this.isPlaying();
      if (isPlayingDragStart) {
        this.pause();
        this.audioPlayer.pause();
      }
    });
    this.on('wave-draging', (evt: EventData) => {
      if (evt.target instanceof Wave) {
        this.timeIndicator.setTime(evt.target.data.start);
        this.timeIndicator.x = evt.target.x;
        this.timeIndicator.y = evt.target.y + evt.target.height;
      }
      if (!evt.originalEvent.shiftKey) checkSnapping(evt);
    });
    this.on('wave-dragend', () => {
      this.timeIndicator.visible = false;
      this.snapping.visible = false;
      if (isPlayingDragStart) {
        this.play();
        this.audioPlayer.play(this.getCurrentTime());
        isPlayingDragStart = false;
      }
    });
  }

  setScrollX(x: number) {
    this.scroll.x = Math.max(x, this._minScrollX);
  }

  addTrack(
    data: TrackDataType = {
      id: generateUniqueId(),
      category: 'New Category',
      group: this.getTracks().length,
      songs: [],
    },
  ) {
    const track = new Track(data);
    this._trackGroup.add(track);
    data.songs.forEach(song => this.addWave(track, song));
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

  getTracks() {
    return this._trackGroup.getTracks();
  }

  getWaves() {
    return this._trackGroup.getWaves();
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  override update(dT: number) {}

  override draw(ctx: CanvasRenderingContext2D) {
    ctx.translate(this.x - this.scroll.x, this.y);
  }
}
