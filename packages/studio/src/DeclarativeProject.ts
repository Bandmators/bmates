import { SongDataType, TrackDataType } from '@bmates/editor';

export type TrackToken = symbol;
export type EntityToken = symbol;

export type DeclarativeTrackData = Omit<TrackDataType, 'group' | 'songs'> & { group?: number };
export type DeclarativeClipData = Pick<
  SongDataType,
  'id' | 'instrument' | 'lock' | 'long' | 'mute' | 'src' | 'start' | 'user'
>;

interface RegisteredTrack {
  data: DeclarativeTrackData;
  order: number;
}

interface RegisteredClip {
  data: DeclarativeClipData;
  order: number;
  track: TrackToken;
}

export class DeclarativeProjectRegistry {
  private clips = new Map<EntityToken, RegisteredClip>();
  private dirty = false;
  private flushing = false;
  private nextOrder = 0;
  private scheduled = false;
  private tracks = new Map<TrackToken, RegisteredTrack>();

  constructor(
    private onChange: (data: TrackDataType[]) => Promise<void>,
    private onError: (error: unknown) => void,
  ) {}

  setTrack(token: TrackToken, data: DeclarativeTrackData) {
    const current = this.tracks.get(token);
    this.tracks.set(token, { data, order: current?.order ?? this.nextOrder++ });
    this.schedule();
  }

  removeTrack(token: TrackToken) {
    this.tracks.delete(token);
    for (const [clipToken, clip] of this.clips) {
      if (clip.track === token) this.clips.delete(clipToken);
    }
    this.schedule();
  }

  setClip(token: EntityToken, track: TrackToken, data: DeclarativeClipData) {
    const current = this.clips.get(token);
    this.clips.set(token, { data, track, order: current?.order ?? this.nextOrder++ });
    this.schedule();
  }

  removeClip(token: EntityToken) {
    this.clips.delete(token);
    this.schedule();
  }

  toProject(): TrackDataType[] {
    const ids = new Set<string>();
    const clipIds = new Set<string>();
    const tracks = [...this.tracks.entries()].sort(([, a], [, b]) => {
      if (a.data.group !== undefined || b.data.group !== undefined) {
        return (a.data.group ?? a.order) - (b.data.group ?? b.order);
      }
      return a.order - b.order;
    });

    return tracks.map(([token, track], group) => {
      if (ids.has(track.data.id)) throw new Error(`Duplicate declarative track id: ${track.data.id}`);
      ids.add(track.data.id);

      const songs = [...this.clips.values()]
        .filter(clip => clip.track === token)
        .sort((a, b) => a.order - b.order)
        .map(clip => {
          if (clipIds.has(clip.data.id)) throw new Error(`Duplicate declarative clip id: ${clip.data.id}`);
          clipIds.add(clip.data.id);
          return { ...clip.data, group };
        });

      return { ...track.data, group, songs };
    });
  }

  private schedule() {
    this.dirty = true;
    if (this.scheduled || this.flushing) return;
    this.scheduled = true;
    queueMicrotask(() => {
      this.scheduled = false;
      void this.flush();
    });
  }

  private async flush() {
    if (this.flushing) return;
    this.flushing = true;
    try {
      while (this.dirty) {
        this.dirty = false;
        await this.onChange(this.toProject());
      }
    } catch (error) {
      this.onError(error);
    } finally {
      this.flushing = false;
      if (this.dirty) this.schedule();
    }
  }
}
