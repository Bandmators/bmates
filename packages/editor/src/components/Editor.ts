import { EventData, Stage } from '@bmates/renderer';

import AudioPlayer from '../AudioPlayer';
import { EditorDataType, EditorStyleType, SongDataType, _EditorStyleType } from '../types';
import { deepMerge, generateUniqueId } from '../utils';
import { Overlay } from './Overlay';
import { Wave } from './Wave';
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
    context: {
      menuWidth: 200,
      menuPadding: 10,
      itemHeight: 40,
      itemPadding: 10,
    },
  };
  private _workground: Workground;
  private _overlay: Overlay;
  private _audioPlayer: AudioPlayer = new AudioPlayer();
  private _resizeListener: () => void;
  private _selectedNodes: Wave[] = [];
  private _clipboard: SongDataType[] = [];

  constructor(element: HTMLCanvasElement, data: EditorDataType[], style: _EditorStyleType = {}) {
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
    this._initEvent();
  }

  private async _loadTrackBuffers(): Promise<void> {
    const loadPromises = this.data.flatMap(item =>
      item.tracks.flatMap(track => {
        return track.songs.map(song => {
          return this._audioPlayer.prepareTrack(song, track.id);
        });
      }),
    );
    await Promise.all(loadPromises);
  }

  private _initLayout() {
    this._workground = new Workground(this.canvas, this.style, this.data, this._audioPlayer, this.scroll);
    this.add(this._workground);

    this._overlay = new Overlay(this.canvas, this.style, this.scroll);
    this.add(this._overlay);
  }

  private _initEvent() {
    this.on('mousedown', (evt: EventData) => {
      if (evt.originalEvent.button === 0) {
        if (evt.target instanceof Wave) {
          if (evt.originalEvent.shiftKey) {
            this.select([...this._selectedNodes, evt.target]);
          } else {
            this.select([evt.target]);
          }
        } else {
          this.unselect();
        }
      }
      if (evt.originalEvent.button === 2 && !this._overlay.isOpenContextMenu()) {
        if (evt.target instanceof Wave) {
          this.select([evt.target]);
          this._overlay.openContextMenu(evt);
        } else {
          this.unselect();
          this._overlay.openContextMenu(evt);
        }
      }
    });

    this.on('contextmenu-select', (evt: EventData) => {
      const { item } = evt.data;
      this._act(item);
    });

    this._initKeyboardEvents();
  }

  private _initKeyboardEvents() {
    this.canvas.tabIndex = 0;
    this.canvas.style.outline = 'none';

    const keyboardShortcuts = {
      // 'ctrl+z': () => this._act('Undo'),
      // 'ctrl+shift+z': () => this._act('Redo'),
      // 'ctrl+y': () => this._act('Redo'),
      'ctrl+c': () => this._act('Copy'),
      'ctrl+v': () => this.paste(),
      // 'ctrl+a': () => this.selectAll(),
      'ctrl+d': () => this.duplicate(),
      delete: () => this._act('Delete'),
      backspace: () => this._act('Delete'),
      'ctrl+x': () => this._act('Cut'),
      arrowleft: () => this._act('ArrowLeft'),
      arrowright: () => this._act('ArrowRight'),
    };

    this.canvas.addEventListener('keydown', e => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      const shortcut = `${ctrl ? 'ctrl+' : ''}${shift ? 'shift+' : ''}${key}`;

      if (keyboardShortcuts[shortcut]) {
        e.preventDefault();
        keyboardShortcuts[shortcut]();
      }
    });
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
    let currentTime = this._workground?.getCurrentTime();

    if (this._audioPlayer.getDuration() < currentTime) {
      this.stop();
      currentTime = this._workground.getCurrentTime();
    }

    this._workground?.play();
    this._audioPlayer?.play(currentTime);
  }

  select(nodes: Wave[]) {
    this.unselect();
    this._selectedNodes = nodes;
    this._selectedNodes.forEach(node => {
      node.setSelected(true);
    });
  }

  unselect() {
    this._selectedNodes.forEach(node => {
      node.setSelected(false);
    });
  }

  pause() {
    this._workground?.pause();
    this._audioPlayer?.pause();
  }

  stop() {
    this._workground?.stop();
    this._audioPlayer?.stop();
  }

  mute(trackId: string, isMuted: boolean | undefined = undefined) {
    this._audioPlayer.mute(trackId, isMuted);
  }

  isMuted(trackId: string) {
    return this._audioPlayer.isMuted(trackId);
  }

  async addWave(song: SongDataType) {
    const trackId = generateUniqueId();
    const audioId = generateUniqueId();
    await this._audioPlayer.prepareTrack(song, trackId);

    const newTrackGroup = {
      id: trackId,
      category: 'New Category',
      songs: [song],
    };

    this._workground.addTrackGroup([newTrackGroup]);
    this.data.push({
      name: 'New Track',
      tracks: [newTrackGroup],
    });
    // const trackGroup = this._workground.children[0] as TrackGroup;
    // const track = trackGroup.children[0] as Track;
    // const wave = new Wave(song, this.style);
    // track.add(wave);
  }

  override destroy() {
    this.stop();
    super.destroy();

    window.removeEventListener('resize', this._resizeListener);
  }

  private async _act(act: string) {
    switch (act) {
      case 'ArrowLeft':
        this._workground.setScrollX(this.scroll.x - this.style.timeline.timeDivde);
        break;
      case 'ArrowRight':
        this._workground.setScrollX(this.scroll.x + this.style.timeline.timeDivde);
        break;
      case 'Mute':
        this._selectedNodes.forEach(node => {
          node.data.mute = true;
        });
        break;
      case 'Unmute':
        this._selectedNodes.forEach(node => {
          node.data.mute = false;
        });
        break;
      case 'Lock':
        this._selectedNodes.forEach(node => {
          node.data.lock = true;
        });
        break;
      case 'Unlock':
        this._selectedNodes.forEach(node => {
          node.data.lock = false;
        });
        break;
      case 'Delete':
        this._selectedNodes.forEach(node => {
          this.data = this.data
            .map(editorData => ({
              ...editorData,
              tracks: editorData.tracks
                .map(track => ({
                  ...track,
                  songs: track.songs.filter(song => song.id !== node.data.id),
                }))
                .filter(track => track.songs.length > 0),
            }))
            .filter(editorData => editorData.tracks.length > 0);
          node.destroy();
        });
        break;
      case 'Copy':
        this._clipboard = this._selectedNodes.map(node => ({ ...node.data }));
        break;
      case 'Paste':
        this.paste();
        break;
      case 'Duplicate':
        this.duplicate();
        break;
      case 'Cut':
        this._clipboard = this._selectedNodes.map(node => ({ ...node.data }));
        this._selectedNodes.forEach(node => {
          node.destroy();
        });
        break;
    }
  }

  addEditorData(data: EditorDataType) {
    this.data.push(data);
  }

  async paste(nodes: SongDataType[] = this._clipboard) {
    if (nodes.length > 0) {
      await Promise.all(
        nodes.map(async node => {
          const newData: SongDataType = { ...node, start: node.start, group: this.data.length };
          return this.addWave(newData);
        }),
      );
      this.call('data-change', { data: this.data, target: this }, false);
    }
  }

  async duplicate() {
    await this.paste(this._selectedNodes.map(node => ({ ...node.data })));
  }

  export() {
    return this.data;
  }

  tree() {
    return this.children;
  }
}
