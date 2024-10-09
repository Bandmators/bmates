import { EventData, Stage } from '@bmates/renderer';

import { Caretaker } from 'src/HistoryManager';

import AudioPlayer from '../AudioPlayer';
import { EditorStyleType, SongDataType, TrackDataType, _EditorStyleType } from '../types';
import { deepMerge, generateUniqueId } from '../utils';
import { Overlay } from './Overlay';
import { Track } from './Track';
import { Wave } from './Wave';
import { Workground } from './Workground';

export class Editor extends Stage {
  override name = 'BEditor';
  data: TrackDataType[] = [];
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
  _audioPlayer: AudioPlayer;
  private _resizeListener: () => void;
  private _selectedNodes: Wave[] = [];
  private _clipboard: SongDataType[] = [];
  private _caretaker: Caretaker;

  constructor(element: HTMLCanvasElement, data: TrackDataType[], style: _EditorStyleType = {}) {
    super(element);

    this._caretaker = new Caretaker();

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

  private async init() {
    this._initLayout();
    this._initEvent();
    await this._loadTrackBuffers();
    this.saveState();
  }

  private async _loadTrackBuffers() {
    await this._audioPlayer.prepareTrackAll(this._workground.getWaves());
  }

  private _initLayout() {
    this._audioPlayer = new AudioPlayer();
    this._workground = new Workground(this.canvas, this.style, this.data, this._audioPlayer, this.scroll);
    this.add(this._workground);
    this._audioPlayer.setTrackGroup(this._workground._trackGroup);

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

    this.on('data-change', () => {
      // this.saveState();
    });

    this._initKeyboardEvents();
  }

  private _initKeyboardEvents() {
    this.canvas.tabIndex = 0;
    this.canvas.style.outline = 'none';

    const keyboardShortcuts = {
      'ctrl+z': () => this._act('Undo'),
      'ctrl+shift+z': () => this._act('Redo'),
      'ctrl+y': () => this._act('Redo'),
      'ctrl+c': () => this._act('Copy'),
      'ctrl+v': () => this._act('Paste'),
      // 'ctrl+a': () => this.selectAll(),
      'ctrl+d': () => this._act('Duplicate'),
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

  muteTrack(trackId: string, isMuted: boolean | undefined = undefined) {
    this._audioPlayer.muteTrack(trackId, isMuted);
  }

  mute(songId: string, isMuted: boolean | undefined = undefined) {
    this._audioPlayer.mute(songId, isMuted);
  }

  isMuted(trackId: string) {
    return this._audioPlayer.isMuted(trackId);
  }

  async addWave(song: SongDataType) {
    const trackId = generateUniqueId();
    const newTrack = {
      id: trackId,
      category: 'New Category',
      mute: false,
      songs: [song],
    };

    const track = this._workground.addTrack(newTrack);
    this.data.push(newTrack);
    if (track.children.length) await this._audioPlayer.prepareWave(track.children[0]);

    this.call('data-change', { data: this.data, target: this });
  }

  override destroy() {
    this.stop();
    super.destroy();

    window.removeEventListener('resize', this._resizeListener);
  }

  private async _act(act: string) {
    const isPlaying = this.isPlaying();
    console.log(this.isPlaying());
    if (isPlaying) {
      this.pause();
    }
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
          this.mute(node.data.id, true);
        });
        this.saveState();
        break;
      case 'Unmute':
        this._selectedNodes.forEach(node => {
          node.data.mute = false;
          this.mute(node.data.id, false);
        });
        this.saveState();
        break;
      case 'Lock':
        this._selectedNodes.forEach(node => {
          node.data.lock = true;
        });
        this.saveState();
        break;
      case 'Unlock':
        this._selectedNodes.forEach(node => {
          node.data.lock = false;
        });
        this.saveState();
        break;
      case 'Delete':
        this._selectedNodes.forEach(node => {
          this.data = this.data
            .map(track => ({
              ...track,
              songs: track.songs.filter(song => song.id !== node.data.id),
            }))
            .filter(track => track.songs.length > 0);
          node.destroy();
        });
        this.saveState();
        break;
      case 'Copy':
        this._clipboard = this._selectedNodes.map(node => ({ ...node.data }));
        break;
      case 'Paste':
        await this.paste();
        this.saveState();
        break;
      case 'Duplicate':
        await this.duplicate();
        this.saveState();
        break;
      case 'Cut':
        this._clipboard = this._selectedNodes.map(node => ({ ...node.data }));
        this._selectedNodes.forEach(node => {
          node.destroy();
        });
        this.saveState();
        break;
      case 'Redo':
        this.redo();
        break;
      case 'Undo':
        this.undo();
        break;
    }
    if (isPlaying) {
      this.play();
    }
  }

  async paste(nodes: SongDataType[] = this._clipboard) {
    const newWaves = [];
    const createdWaveIds = new Set();

    if (nodes.length > 0) {
      const currentTime = this._workground.getCurrentTime();
      const minStartTime = Math.min(...nodes.map(node => node.start));
      const newNodes = nodes
        .sort((a, b) => a.group - b.group)
        .map(node => {
          const start = currentTime + node.start - minStartTime;
          return {
            ...node,
            id: generateUniqueId(),
            start,
            x: this.style.timeline.gapWidth * (start * 10),
          };
        });

      for (const newNode of newNodes) {
        if (createdWaveIds.has(newNode.id)) continue;

        const otherWaves = this._workground
          .getWaves()
          .filter(child => child.data.id !== newNode.id && child.data.group === newNode.group);
        const isCollision = otherWaves.some(wave => {
          const newNodeWidth = this.style.timeline.gapWidth * (newNode.long * 10);
          return newNode.x < wave.x + wave.width && newNode.x + newNodeWidth > wave.x;
        });

        if (!isCollision) {
          const newWave = new Wave(newNode, this.style);
          otherWaves[0].parent.add(newWave);
          newWaves.push(newWave);
          createdWaveIds.add(newNode.id);
          continue;
        }

        this._workground.getWaves().forEach(wave => {
          if (wave.data.group > newNode.group) {
            wave.data.group++;
            wave.repositioning();
          }
        });

        const friends = newNodes
          .filter(node => node.group === newNode.group && !createdWaveIds.has(node.id))
          .map(node => {
            createdWaveIds.add(node.id);
            return { ...node, group: node.group + 1 };
          });
        const track = this._workground.addTrack({
          id: generateUniqueId(),
          category: 'New Category',
          songs: friends,
        });
        newWaves.push(...track.children);
      }

      await this._audioPlayer.prepareTrackAll(newWaves);
      this.call('data-change', { data: this.data, target: this });
    }
  }

  async duplicate() {
    await this.paste(this._selectedNodes.map(node => ({ ...node.data })));
  }

  getCurrentTime() {
    return this._workground.getCurrentTime();
  }

  export() {
    return this._workground
      .getTracks()
      .map(child => {
        if (child instanceof Track) {
          return child.export();
        }
        return null;
      })
      .filter(track => track !== null);
  }

  oldExport() {
    return this.data;
  }

  tree() {
    return this.children;
  }

  exportTracks() {
    return this._audioPlayer.toBlob();
  }

  async downloadBlob(filename: string) {
    await this._audioPlayer.downloadBlob(filename);
  }

  saveState() {
    this._caretaker.save(this._workground._trackGroup.createMemento());
  }

  undo() {
    const lastMemento = this._caretaker.undo();
    if (lastMemento) this._workground._trackGroup.restore(lastMemento);
  }

  redo() {
    const nextMemento = this._caretaker.redo();
    if (nextMemento) this._workground._trackGroup.restore(nextMemento);
  }
}
