import { Stage } from '@bmates/renderer';

import AudioPlayer from '@/AudioPlayer';
import { EditorDataType, EditorStyleType, SongDataType } from '@/types';
import { deepMerge } from '@/utils';

import { Track } from './Track';
import { TrackGroup } from './TrackGroup';
import { Wave } from './Wave';
// import { Sidebar } from './Sidebar';
import { Workground } from './Workground';

export class Editor extends Stage {
  override name = 'BEditor';
  data: EditorDataType[] = [];
  style: EditorStyleType = {
    theme: {
      background: 'white',
      lineColor: '#e3e3e3',
      strokeLineColor: '#999999',
    },
    timeline: {
      gapHeight: 10,
      gapWidth: 10,
      timeDivde: 10,
      height: 45,
    },
    sidebar: {
      width: 300,
    },
    wave: {
      height: 45,
      borderRadius: 8,
      margin: 10,
      snapping: 'rgb(0, 0, 0, 0.6)',
    },
  };
  private _workground: Workground;
  private _audioPlayer: AudioPlayer = new AudioPlayer();
  private _resizeListener: () => void;

  constructor(element: HTMLCanvasElement, data: EditorDataType[], style: Partial<EditorStyleType> = {}) {
    super(element);
    this.data = data;
    this.style = deepMerge(this.style, style) as EditorStyleType;
    this._onResize();

    this.init();

    /* eslint-disable @typescript-eslint/no-explicit-any */
    (window as any).editor = this;
    (window as any).style = style;

    this._resizeListener = () => this._onResize();
    window.addEventListener('resize', this._resizeListener);
  }

  private async init(): Promise<void> {
    await this._loadTrackBuffers();
    this._initLayout();
  }

  private async _loadTrackBuffers(): Promise<void> {
    const loadPromises = this.data.flatMap(item =>
      item.tracks.flatMap(track =>
        track.songs.map(song => {
          const trackId = `${song.group}-${song.instrument}`;
          return this._audioPlayer.prepareTrack(song, trackId);
        }),
      ),
    );
    await Promise.all(loadPromises);
  }

  private _initLayout() {
    this._workground = new Workground(this.canvas, this.style, this.data, this.scroll);
    this.add(this._workground);
  }

  private _onResize() {
    const dpr = 1; // || window.devicePixelRatio || 2;

    const displayWidth = this.canvas.parentElement.clientWidth - this.style.sidebar.width;
    const displayHeight = this.canvas.parentElement.clientHeight;

    this.canvas.width = displayWidth * dpr;
    this.canvas.height = displayHeight * dpr;

    this.canvas.style.width = `${displayWidth}px`;
    this.canvas.style.height = `${displayHeight}px`;

    this.ctx.scale(dpr, dpr);
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  override update(dT: number) {}

  /* eslint-disable @typescript-eslint/no-unused-vars */
  override draw(ctx: CanvasRenderingContext2D) {}

  isPlaying() {
    return this._workground.isPlaying();
  }

  async play() {
    const currentTime = this._workground.getCurrentTime();
    this._workground.play();
    this._audioPlayer.play(currentTime);
  }

  pause() {
    this._workground.pause();
    this._audioPlayer.play();
  }

  stop() {
    this._workground.stop();
    this._audioPlayer.stop();
  }

  async addWave(song: SongDataType) {
    const trackId = `${song.group}-${song.instrument}`;
    await this._audioPlayer.prepareTrack(song, trackId);

    const trackGroup = this._workground.children[0] as TrackGroup;
    const track = trackGroup.children[0] as Track;
    const wave = new Wave(song, this.style);
    track.add(wave);
  }

  override destroy() {
    this.stop();
    super.destroy();

    window.removeEventListener('resize', this._resizeListener);
  }

  addEditorData(data: EditorDataType) {
    this.data.push(data);
  }

  export() {
    return this.data;
  }
}
