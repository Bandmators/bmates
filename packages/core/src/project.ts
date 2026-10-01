import { ProjectData, SongDataType, TrackDataType } from './types';

export class ProjectValidationError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = 'ProjectValidationError';
  }
}

export const cloneProject = (project: ProjectData): ProjectData => JSON.parse(JSON.stringify(project));

export const freezeProject = (project: ProjectData): ProjectData => {
  project.forEach(track => {
    track.songs.forEach(song => Object.freeze(song));
    Object.freeze(track.songs);
    Object.freeze(track);
  });
  Object.freeze(project);
  return project;
};

const assertFiniteNonNegative = (value: number, field: string, id: string) => {
  if (!Number.isFinite(value) || value < 0) {
    throw new ProjectValidationError(`${field} must be a finite non-negative number for ${id}.`, 'INVALID_TIME');
  }
};

export const normalizeProject = (project: ProjectData): ProjectData => {
  const trackIds = new Set<string>();
  const clipIds = new Set<string>();

  return cloneProject(project)
    .sort((a, b) => a.group - b.group)
    .map((track, group) => {
      if (!track.id) throw new ProjectValidationError('Track id is required.', 'INVALID_TRACK_ID');
      if (trackIds.has(track.id)) {
        throw new ProjectValidationError(`Duplicate track id: ${track.id}`, 'DUPLICATE_TRACK_ID');
      }
      trackIds.add(track.id);

      const songs = track.songs.map(song => {
        if (!song.id) throw new ProjectValidationError('Clip id is required.', 'INVALID_CLIP_ID');
        if (clipIds.has(song.id)) {
          throw new ProjectValidationError(`Duplicate clip id: ${song.id}`, 'DUPLICATE_CLIP_ID');
        }
        clipIds.add(song.id);
        if (!song.src) throw new ProjectValidationError(`Clip src is required for ${song.id}.`, 'INVALID_CLIP_SRC');
        assertFiniteNonNegative(song.start, 'start', song.id);
        if (song.long !== undefined) assertFiniteNonNegative(song.long, 'long', song.id);
        return { ...song, group };
      });

      return { ...track, group, songs };
    });
};

export const findClip = (project: ProjectData, clipId: string) => {
  for (const track of project) {
    const clip = track.songs.find(song => song.id === clipId);
    if (clip) return { clip, track };
  }
  return undefined;
};

export const clipsOverlap = (left: SongDataType, right: SongDataType) => {
  const leftEnd = left.start + (left.long ?? 0);
  const rightEnd = right.start + (right.long ?? 0);
  return left.start < rightEnd && leftEnd > right.start;
};

export const createTrack = (data: TrackDataType): TrackDataType => ({ ...data, songs: [...data.songs] });
