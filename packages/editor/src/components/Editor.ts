import { normalizeProject } from '@bmates/core';
import { EventData, Stage } from '@bmates/renderer';

import AudioPlayer from '../AudioPlayer';
import { Caretaker } from '../HistoryManager';
import {
  DEFAULT_EDITOR_STYLE,
  EditorHistoryController,
  EditorStyleType,
  ResolvedEditorStyleType,
  SongDataType,
  TrackDataType,
} from '../types';
import { clone, deepMerge, generateUniqueId } from '../utils';
import { Overlay } from './Overlay';
import { Track } from './Track';
import { Wave } from './Wave';
import { Workground } from './Workground';

export class Editor extends Stage {
  override name = 'BEditor';
  data: TrackDataType[] = [];
  style: ResolvedEditorStyleType;
  private _workground: Workground;
  private _overlay: Overlay;
  _audioPlayer: AudioPlayer;
  private _resizeListener: (e) => void;
  private _selectedNodes: Wave[] = [];
  private _clipboard: SongDataType[] = [];
  private _caretaker: Caretaker;
  private _historyController?: EditorHistoryController;
  readonly ready: Promise<void>;
  private _keyboardListener: (event: KeyboardEvent) => void;
  private _ownedObjectUrls = new Set<string>();
  private _destroyed = false;

  constructor(element: HTMLCanvasElement, data: TrackDataType[], style: EditorStyleType = {}) {
    super(element);

    this._caretaker = new Caretaker();

    this.data = clone(data);
    this.style = deepMerge(clone(DEFAULT_EDITOR_STYLE), style) as ResolvedEditorStyleType;
    this._onResize(null);

    this.ready = this.init();

    this._resizeListener = e => this._onResize(e);
    window.addEventListener('resize', this._resizeListener);
  }

  private async init() {
    this._initLayout();
    this._initEvent();
    await this._loadTrackBuffers();
    if (this._destroyed) return;
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
    this.on('mousedown', evt => {
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
      this._audioPlayer.refreshDuration();
      this._workground.refreshDurationTime();
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

    this._keyboardListener = e => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      const shortcut = `${ctrl ? 'ctrl+' : ''}${shift ? 'shift+' : ''}${key}`;

      if (keyboardShortcuts[shortcut]) {
        e.preventDefault();
        keyboardShortcuts[shortcut]();
      }
    };
    this.canvas.addEventListener('keydown', this._keyboardListener);
  }

  private _onResize(e) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const w = e ? e.target : window;

    const sidebarWidth =
      w.innerWidth <= this.style.sidebar.mobileViewport ? this.style.sidebar.mobileWidth : this.style.sidebar.width;

    const parent = this.canvas.parentElement;
    if (!parent) return;
    const displayWidth = Math.max(0, parent.clientWidth - sidebarWidth);
    const displayHeight = Math.max(0, parent.clientHeight);

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
    await this.ready;
    if (this._destroyed || this._audioPlayer.getWaves().length === 0) return;
    let currentTime = this._workground?.getCurrentTime();

    if (this._audioPlayer.getDuration() < currentTime) {
      this.stop();
      currentTime = this._workground.getCurrentTime();
    }

    this._workground?.play();
    await this._audioPlayer?.play(currentTime);
  }

  select(nodes: Wave[]) {
    this.unselect();
    this._selectedNodes = [...new Set(nodes)];
    this._selectedNodes.forEach(node => {
      node.setSelected(true);
    });
  }

  unselect() {
    this._selectedNodes.forEach(node => {
      node.setSelected(false);
    });
    this._selectedNodes = [];
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
    this.saveState();
  }

  removeTrack(trackId: string) {
    const isPlaying = this.isPlaying();
    if (isPlaying) {
      this.pause();
    }
    this._audioPlayer.removeTrack(trackId);
    this.saveState();
    if (isPlaying) {
      this.play();
    }
  }

  mute(songId: string, isMuted: boolean | undefined = undefined) {
    this._audioPlayer.mute(songId, isMuted);
    this.saveState();
  }

  isMuted(trackId: string) {
    return this._audioPlayer.isMuted(trackId);
  }

  async addWave(song: SongDataType, audioBuffer?: AudioBuffer) {
    await this.ready;
    const trackId = generateUniqueId();
    const group = this._workground.getTracks().length;
    const normalizedSong = { ...song, group };
    const newTrack = {
      id: trackId,
      name: 'New Track',
      mute: false,
      group,
      songs: [normalizedSong],
    };

    const track = this._workground.addTrack(newTrack);
    if (track.children.length) await this._audioPlayer.prepareWave(track.children[0], audioBuffer);
    this.saveState();
  }

  async addWaveBuffer(file: File, audioBuffer: AudioBuffer) {
    const isPlaying = this.isPlaying();
    if (isPlaying) {
      this.pause();
    }
    const objectUrl = URL.createObjectURL(file);
    this._ownedObjectUrls.add(objectUrl);
    const newSong: SongDataType = {
      id: generateUniqueId(),
      src: objectUrl,
      user: 'BMates',
      start: 0,
      long: audioBuffer.duration,
      group: this._workground.getTracks().length,
      instrument: file.name,
    };
    await this.addWave(newSong, audioBuffer);
    if (isPlaying) {
      this.play();
    }
  }

  async replaceData(data: TrackDataType[]) {
    await this.ready;
    if (this._destroyed) return;

    const wasPlaying = this.isPlaying();
    if (wasPlaying) this.pause();
    this.unselect();

    const normalized = normalizeProject(data);

    await this._workground._trackGroup.reconcile(normalized);
    this.saveState();

    if (wasPlaying) await this.play();
  }

  override destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this.stop();
    this.canvas.removeEventListener('keydown', this._keyboardListener);
    this._ownedObjectUrls.forEach(url => URL.revokeObjectURL(url));
    this._ownedObjectUrls.clear();
    void this._audioPlayer.destroy().catch(() => undefined);
    super.destroy();

    window.removeEventListener('resize', this._resizeListener);
  }

  private async _act(act: string) {
    const isPlaying = this.isPlaying();
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
          this._audioPlayer.mute(node.data.id, true);
        });
        this.saveState();
        break;
      case 'Unmute':
        this._selectedNodes.forEach(node => {
          this._audioPlayer.mute(node.data.id, false);
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
        this._removeSelectedNodes();
        this.saveState();
        break;
      case 'Copy':
        this._clipboard = this._selectedNodes.map(node => ({ ...node.data }));
        break;
      case 'Paste':
        await this.paste();
        break;
      case 'Duplicate':
        await this.duplicate();
        break;
      case 'Cut':
        this._clipboard = this._selectedNodes.map(node => ({ ...node.data }));
        this._removeSelectedNodes();
        this.saveState();
        break;
      case 'Redo':
        await this.redo();
        break;
      case 'Undo':
        await this.undo();
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
      const newNodes = [...nodes]
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
          let targetTrack = this._workground.getTracks()[newNode.group];
          if (!targetTrack) {
            targetTrack = this._workground.addTrack({
              id: generateUniqueId(),
              name: 'New Track',
              group: this._workground.getTracks().length,
              songs: [],
            });
            newNode.group = targetTrack.data.group;
            newWave.data.group = targetTrack.data.group;
            newWave.repositioning();
          }
          targetTrack.add(newWave);
          newWaves.push(newWave);
          createdWaveIds.add(newNode.id);
          continue;
        }

        const newGroupIdx = this._workground.getTracks().length;
        const friends = newNodes
          .filter(node => node.group === newNode.group && !createdWaveIds.has(node.id))
          .map(node => {
            createdWaveIds.add(node.id);
            return { ...node, group: newGroupIdx };
          });
        const track = this._workground.addTrack({
          id: generateUniqueId(),
          name: 'New Track',
          group: newGroupIdx,
          songs: friends,
        });
        newWaves.push(...track.children);
      }

      await this._audioPlayer.prepareTrackAll(newWaves);
      this.select(newWaves);
      this.saveState();
    }
  }

  async duplicate() {
    await this.paste(this._selectedNodes.map(node => ({ ...node.data })));
  }

  getCurrentTime() {
    return this._workground.getCurrentTime();
  }

  export() {
    const exported = this._workground
      .getTracks()
      .map(child => {
        if (child instanceof Track) {
          return child.export();
        }
        return null;
      })
      .filter(track => track !== null);
    return clone(exported) as TrackDataType[];
  }

  tree() {
    return this.children;
  }

  async exportTracks() {
    await this.ready;
    return this._audioPlayer.toBlob();
  }

  async downloadBlob(filename: string) {
    await this.ready;
    await this._audioPlayer.downloadBlob(filename);
  }

  saveState() {
    this._workground.normalizeStructure();
    this.data = this.export();
    this._workground.data = this.data;
    this._caretaker.save(this._workground._trackGroup.createMemento());
    this.call('data-change', { data: this.data, target: this });
  }

  setHistoryController(controller?: EditorHistoryController) {
    this._historyController = controller;
  }

  async undo() {
    if (this._historyController) {
      await this._historyController.undo();
      return;
    }
    const lastMemento = this._caretaker.undo();
    if (lastMemento) {
      this.unselect();
      await this._workground._trackGroup.restore(lastMemento);
      this._workground.normalizeStructure();
      this.data = this.export();
      this._workground.data = this.data;
      this.call('data-change', { data: this.data, target: this });
    }
  }

  async redo() {
    if (this._historyController) {
      await this._historyController.redo();
      return;
    }
    const nextMemento = this._caretaker.redo();
    if (nextMemento) {
      this.unselect();
      await this._workground._trackGroup.restore(nextMemento);
      this._workground.normalizeStructure();
      this.data = this.export();
      this._workground.data = this.data;
      this.call('data-change', { data: this.data, target: this });
    }
  }

  private _removeSelectedNodes() {
    const selected = [...this._selectedNodes];
    const affectedTracks = [...new Set(selected.map(node => node.parent as Track))];
    this.unselect();
    selected.forEach(node => {
      this._audioPlayer.releaseWave(node);
      node.destroy();
    });
    this._workground.removeEmptyTracks(affectedTracks);
  }
}
