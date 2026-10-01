import {
  ProjectValidationError,
  clipsOverlap,
  cloneProject,
  findClip,
  freezeProject,
  normalizeProject,
} from './project';
import {
  MoveClipOptions,
  ProjectChange,
  ProjectData,
  ProjectListener,
  ProjectMutationOptions,
  ProjectSnapshot,
  SongDataType,
  TrackDataType,
} from './types';

const DEFAULT_CHANGE: ProjectChange = { source: 'api', type: 'replace-project' };

export interface ProjectStoreOptions {
  historyLimit?: number;
}

export class ProjectStore {
  private future: ProjectData[] = [];
  private listeners = new Set<ProjectListener>();
  private past: ProjectData[] = [];
  private readonly historyLimit: number;
  private snapshot: ProjectSnapshot;

  constructor(project: ProjectData = [], options: ProjectStoreOptions = {}) {
    this.historyLimit = options.historyLimit ?? 100;
    this.snapshot = {
      canRedo: false,
      canUndo: false,
      project: freezeProject(normalizeProject(project)),
      revision: 0,
    };
  }

  getSnapshot = () => this.snapshot;

  getProject = () => cloneProject(this.snapshot.project);

  subscribe = (listener: ProjectListener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  replaceProject(project: ProjectData, options: ProjectMutationOptions = {}) {
    return this.commit(project, { ...DEFAULT_CHANGE, source: options.source ?? DEFAULT_CHANGE.source }, options);
  }

  addTrack(track: TrackDataType, options: ProjectMutationOptions = {}) {
    return this.mutate('add-track', options, project => {
      project.push(track);
    });
  }

  updateTrack(
    trackId: string,
    patch: Partial<Omit<TrackDataType, 'id' | 'songs'>>,
    options: ProjectMutationOptions = {},
  ) {
    return this.mutate('update-track', options, project => {
      const track = project.find(candidate => candidate.id === trackId);
      if (!track) throw new ProjectValidationError(`Unknown track id: ${trackId}`, 'TRACK_NOT_FOUND');
      Object.assign(track, patch);
    });
  }

  removeTrack(trackId: string, options: ProjectMutationOptions = {}) {
    return this.mutate('remove-track', options, project => {
      const index = project.findIndex(track => track.id === trackId);
      if (index < 0) throw new ProjectValidationError(`Unknown track id: ${trackId}`, 'TRACK_NOT_FOUND');
      project.splice(index, 1);
    });
  }

  setTrackMute(trackId: string, muted?: boolean, options: ProjectMutationOptions = {}) {
    return this.mutate('set-track-mute', options, project => {
      const track = project.find(candidate => candidate.id === trackId);
      if (!track) throw new ProjectValidationError(`Unknown track id: ${trackId}`, 'TRACK_NOT_FOUND');
      const nextMuted = muted ?? !track.mute;
      if ((track.mute ?? false) !== nextMuted) track.mute = nextMuted;
    });
  }

  addClip(trackId: string, clip: SongDataType, options: ProjectMutationOptions = {}) {
    return this.mutate('add-clip', options, project => {
      const track = project.find(candidate => candidate.id === trackId);
      if (!track) throw new ProjectValidationError(`Unknown track id: ${trackId}`, 'TRACK_NOT_FOUND');
      track.songs.push({ ...clip, group: track.group });
    });
  }

  updateClip(clipId: string, patch: Partial<Omit<SongDataType, 'id' | 'group'>>, options: ProjectMutationOptions = {}) {
    return this.mutate('update-clip', options, project => {
      const result = findClip(project, clipId);
      if (!result) throw new ProjectValidationError(`Unknown clip id: ${clipId}`, 'CLIP_NOT_FOUND');
      Object.assign(result.clip, patch);
    });
  }

  removeClip(clipId: string, options: ProjectMutationOptions = {}) {
    return this.mutate('remove-clip', options, project => {
      const result = findClip(project, clipId);
      if (!result) throw new ProjectValidationError(`Unknown clip id: ${clipId}`, 'CLIP_NOT_FOUND');
      result.track.songs = result.track.songs.filter(clip => clip.id !== clipId);
    });
  }

  setClipMute(clipId: string, muted?: boolean, options: ProjectMutationOptions = {}) {
    return this.mutate('set-clip-mute', options, project => {
      const result = findClip(project, clipId);
      if (!result) throw new ProjectValidationError(`Unknown clip id: ${clipId}`, 'CLIP_NOT_FOUND');
      const nextMuted = muted ?? !result.clip.mute;
      if ((result.clip.mute ?? false) !== nextMuted) result.clip.mute = nextMuted;
    });
  }

  moveClip(clipId: string, move: MoveClipOptions, options: ProjectMutationOptions = {}) {
    return this.mutate('move-clip', options, project => {
      const result = findClip(project, clipId);
      if (!result) throw new ProjectValidationError(`Unknown clip id: ${clipId}`, 'CLIP_NOT_FOUND');
      if (result.clip.lock) throw new ProjectValidationError(`Clip is locked: ${clipId}`, 'CLIP_LOCKED');
      const target = project.find(track => track.id === move.trackId);
      if (!target) throw new ProjectValidationError(`Unknown track id: ${move.trackId}`, 'TRACK_NOT_FOUND');
      if (!Number.isFinite(move.start) || move.start < 0) {
        throw new ProjectValidationError(`Invalid clip start: ${move.start}`, 'INVALID_TIME');
      }

      const moved = { ...result.clip, start: move.start, group: target.group };
      if (!move.allowOverlap && target.songs.some(clip => clip.id !== clipId && clipsOverlap(moved, clip))) {
        throw new ProjectValidationError(`Clip collision on track ${target.id}.`, 'CLIP_COLLISION');
      }

      result.track.songs = result.track.songs.filter(clip => clip.id !== clipId);
      target.songs.push(moved);
    });
  }

  undo(source = 'history') {
    const previous = this.past.pop();
    if (!previous) return this.snapshot;
    this.future.push(cloneProject(this.snapshot.project));
    return this.publish(previous, { source, type: 'undo' });
  }

  redo(source = 'history') {
    const next = this.future.pop();
    if (!next) return this.snapshot;
    this.pushPast(this.snapshot.project);
    return this.publish(next, { source, type: 'redo' });
  }

  private mutate(type: string, options: ProjectMutationOptions, mutation: (project: ProjectData) => void) {
    const project = this.getProject();
    mutation(project);
    return this.commit(project, { source: options.source ?? 'api', type }, options);
  }

  private commit(project: ProjectData, change: ProjectChange, options: ProjectMutationOptions) {
    const normalized = normalizeProject(project);
    if (JSON.stringify(normalized) === JSON.stringify(this.snapshot.project)) return this.snapshot;
    if (options.history !== false) {
      this.pushPast(this.snapshot.project);
      this.future = [];
    }
    return this.publish(normalized, change);
  }

  private pushPast(project: ProjectData) {
    this.past.push(cloneProject(project));
    if (this.past.length > this.historyLimit) this.past.shift();
  }

  private publish(project: ProjectData, change: ProjectChange) {
    this.snapshot = {
      canRedo: this.future.length > 0,
      canUndo: this.past.length > 0,
      project: freezeProject(normalizeProject(project)),
      revision: this.snapshot.revision + 1,
    };
    this.listeners.forEach(listener => listener(this.snapshot, change));
    return this.snapshot;
  }
}

export const createProjectStore = (project: ProjectData = [], options: ProjectStoreOptions = {}) =>
  new ProjectStore(project, options);
