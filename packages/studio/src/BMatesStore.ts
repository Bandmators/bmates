import { ProjectStore, createProjectStore } from '@bmates/core';
import { Editor, EditorStyleType, SongDataType, TrackDataType, clone } from '@bmates/editor';

export type BMatesStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface BMatesSnapshot {
  canRedo: boolean;
  canUndo: boolean;
  data: TrackDataType[];
  editor: Editor | null;
  error: Error | null;
  isPlaying: boolean;
  revision: number;
  status: BMatesStatus;
}

export interface CreateBMatesStoreOptions {
  data?: TrackDataType[];
  onDataChange?: (data: TrackDataType[]) => void;
  onError?: (error: Error) => void;
  projectStore?: ProjectStore;
  style?: EditorStyleType;
}

export class BMatesStore {
  private applyingProjectToEditor = false;
  private editor: Editor | null = null;
  private listeners = new Set<() => void>();
  private mountedCanvas: HTMLCanvasElement | null = null;
  private options: CreateBMatesStoreOptions;
  private lastProjectUpdate: Promise<void> = Promise.resolve();
  private projectUpdate: Promise<void> = Promise.resolve();
  private snapshot: BMatesSnapshot;
  private readonly projectStore: ProjectStore;
  private readonly unsubscribeProjectStore: () => void;
  private version = 0;

  constructor(options: CreateBMatesStoreOptions = {}) {
    this.options = { ...options };
    this.projectStore = options.projectStore ?? createProjectStore(options.data ?? []);
    const projectSnapshot = this.projectStore.getSnapshot();
    this.snapshot = {
      canRedo: projectSnapshot.canRedo,
      canUndo: projectSnapshot.canUndo,
      data: clone(projectSnapshot.project),
      editor: null,
      error: null,
      isPlaying: false,
      revision: projectSnapshot.revision,
      status: 'idle',
    };
    this.unsubscribeProjectStore = this.projectStore.subscribe((next, change) => {
      const data = clone(next.project);
      this.setSnapshot({
        canRedo: next.canRedo,
        canUndo: next.canUndo,
        data,
        error: null,
        revision: next.revision,
      });
      this.options.onDataChange?.(clone(data));
      if (change.source !== 'editor') this.queueEditorSync(data);
    });
  }

  getSnapshot = () => this.snapshot;

  getProjectStore = () => this.projectStore;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  setCallbacks(callbacks: Pick<CreateBMatesStoreOptions, 'onDataChange' | 'onError'>) {
    this.options = { ...this.options, ...callbacks };
  }

  reportError(reason: unknown) {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    this.setSnapshot({ error });
    this.options.onError?.(error);
  }

  async setProject(data: TrackDataType[]) {
    try {
      this.projectStore.replaceProject(data, { source: 'react' });
      await this.lastProjectUpdate;
    } catch (reason) {
      this.reportError(reason);
      throw reason;
    }
  }

  mount(canvas: HTMLCanvasElement) {
    if (this.mountedCanvas === canvas && this.editor) return this.editor;
    this.unmount();

    const version = ++this.version;
    this.mountedCanvas = canvas;
    this.setSnapshot({ error: null, status: 'loading' });

    try {
      const editor = new Editor(canvas, this.projectStore.getProject(), this.options.style);
      this.editor = editor;
      editor.setHistoryController({
        redo: () => this.redo(),
        undo: () => this.undo(),
      });
      this.setSnapshot({ editor });

      editor.on('data-change', event => {
        if (this.editor !== editor || this.applyingProjectToEditor) return;
        try {
          this.projectStore.replaceProject(event.data as TrackDataType[], { source: 'editor' });
        } catch (reason) {
          this.reportError(reason);
        }
      });
      editor.on('pause', event => {
        if (this.editor === editor) this.setSnapshot({ isPlaying: Boolean(event.data) });
      });

      void editor.ready
        .then(() => {
          if (this.editor === editor && version === this.version) this.setSnapshot({ status: 'ready' });
        })
        .catch(reason => {
          if (this.editor !== editor || version !== this.version) return;
          const error = reason instanceof Error ? reason : new Error(String(reason));
          this.setSnapshot({ error, status: 'error' });
          this.options.onError?.(error);
        });

      return editor;
    } catch (reason) {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      this.mountedCanvas = null;
      this.setSnapshot({ editor: null, error, status: 'error' });
      this.options.onError?.(error);
      throw error;
    }
  }

  unmount(canvas?: HTMLCanvasElement) {
    if (canvas && canvas !== this.mountedCanvas) return;
    this.version += 1;
    this.editor?.destroy();
    this.editor = null;
    this.mountedCanvas = null;
    this.setSnapshot({ editor: null, isPlaying: false, status: 'idle' });
  }

  destroy() {
    this.unmount();
    this.unsubscribeProjectStore();
    this.listeners.clear();
  }

  async play() {
    const editor = this.requireEditor();
    await editor.play();
    if (this.editor === editor) this.setSnapshot({ isPlaying: editor.isPlaying() });
  }

  pause() {
    this.requireEditor().pause();
    this.setSnapshot({ isPlaying: false });
  }

  stop() {
    this.requireEditor().stop();
    this.setSnapshot({ isPlaying: false });
  }

  async togglePlayback() {
    if (this.snapshot.isPlaying) this.pause();
    else await this.play();
  }

  async muteTrack(trackId: string, muted?: boolean) {
    this.projectStore.setTrackMute(trackId, muted, { source: 'react' });
    await this.lastProjectUpdate;
  }

  async removeTrack(trackId: string) {
    this.projectStore.removeTrack(trackId, { source: 'react' });
    await this.lastProjectUpdate;
  }

  async muteClip(clipId: string, muted?: boolean) {
    this.projectStore.setClipMute(clipId, muted, { source: 'react' });
    await this.lastProjectUpdate;
  }

  async addClip(clip: SongDataType, audioBuffer?: AudioBuffer) {
    await this.requireEditor().addWave(clip, audioBuffer);
  }

  async addFile(file: File) {
    const audioContext = new AudioContext();
    try {
      const audioBuffer = await audioContext.decodeAudioData(await file.arrayBuffer());
      await this.requireEditor().addWaveBuffer(file, audioBuffer);
    } finally {
      await audioContext.close();
    }
  }

  async undo() {
    this.projectStore.undo('react');
    await this.lastProjectUpdate;
  }

  async redo() {
    this.projectStore.redo('react');
    await this.lastProjectUpdate;
  }

  exportProject() {
    return this.projectStore.getProject();
  }

  async exportAudio() {
    return this.requireEditor().exportTracks();
  }

  async download(filename = 'bmates_audio.wav') {
    await this.requireEditor().downloadBlob(filename);
  }

  private queueEditorSync(data: TrackDataType[]) {
    if (!this.editor) return;
    const update = this.projectUpdate.then(() => this.applyProjectToEditor(data));
    this.lastProjectUpdate = update;
    this.projectUpdate = update.catch(reason => {
      this.reportError(reason);
    });
  }

  private async applyProjectToEditor(data: TrackDataType[]) {
    const editor = this.editor;
    if (!editor) return;
    this.applyingProjectToEditor = true;
    try {
      await editor.replaceData(data);
    } finally {
      this.applyingProjectToEditor = false;
    }
  }

  private requireEditor() {
    if (!this.editor) throw new Error('BMatesCanvas must be mounted before calling editor commands.');
    return this.editor;
  }

  private setSnapshot(patch: Partial<BMatesSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach(listener => listener());
  }
}

export const createBMatesStore = (options: CreateBMatesStoreOptions = {}) => new BMatesStore(options);
