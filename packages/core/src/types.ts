export type SongDataType<T extends string = string> = {
  id: string;
  start: number;
  long?: number;
  src: string;
  user: string;
  group: number;
  instrument: T;
  mute?: boolean;
  lock?: boolean;
  [key: string]: unknown;
};

export type TrackDataType<T extends string = string> = {
  id: string;
  name: string;
  mute?: boolean;
  group: number;
  songs: SongDataType<T>[];
};

export type ProjectData = TrackDataType[];

export interface ProjectSnapshot {
  canRedo: boolean;
  canUndo: boolean;
  project: ProjectData;
  revision: number;
}

export interface ProjectMutationOptions {
  history?: boolean;
  source?: string;
}

export interface MoveClipOptions {
  allowOverlap?: boolean;
  start: number;
  trackId: string;
}

export interface ProjectChange {
  source: string;
  type: string;
}

export type ProjectListener = (snapshot: ProjectSnapshot, change: ProjectChange) => void;
