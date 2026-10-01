import { describe, expect, it, vi } from 'vitest';

import { ProjectStore, ProjectValidationError } from './index';

const project = [
  {
    id: 'drums',
    name: 'Drums',
    group: 4,
    songs: [
      {
        id: 'kick',
        src: '/kick.wav',
        start: 0,
        long: 1,
        user: '',
        group: 4,
        instrument: 'Kick',
      },
    ],
  },
  {
    id: 'vocals',
    name: 'Vocals',
    group: 8,
    songs: [
      {
        id: 'voice',
        src: '/voice.wav',
        start: 2,
        long: 2,
        user: '',
        group: 8,
        instrument: 'Voice',
      },
    ],
  },
];

describe('ProjectStore', () => {
  it('normalizes groups and isolates input data', () => {
    const store = new ProjectStore(project);
    project[0].name = 'Changed outside';

    expect(store.getSnapshot().project.map(track => track.group)).toEqual([0, 1]);
    expect(store.getSnapshot().project[0].songs[0].group).toBe(0);
    expect(store.getSnapshot().project[0].name).toBe('Drums');
    expect(() => {
      store.getSnapshot().project[0].name = 'Mutated snapshot';
    }).toThrow(TypeError);
    expect(store.getProject()[0].name).toBe('Drums');
  });

  it('runs commands and exposes undo/redo state', () => {
    const store = new ProjectStore(project);

    store.setTrackMute('drums', true);
    store.setClipMute('kick', true);
    expect(store.getSnapshot()).toMatchObject({ canUndo: true, canRedo: false });
    expect(store.getSnapshot().project[0]).toMatchObject({ mute: true });
    expect(store.getSnapshot().project[0].songs[0]).toMatchObject({ mute: true });

    store.undo();
    expect(store.getSnapshot().project[0].songs[0].mute).toBeUndefined();
    expect(store.getSnapshot().canRedo).toBe(true);

    store.redo();
    expect(store.getSnapshot().project[0].songs[0].mute).toBe(true);
  });

  it('moves clips between tracks and rejects collisions', () => {
    const store = new ProjectStore(project);
    store.addClip('vocals', {
      id: 'backing',
      src: '/backing.wav',
      start: 4,
      long: 2,
      user: '',
      group: 1,
      instrument: 'Voice',
    });

    expect(() => store.moveClip('kick', { start: 4.5, trackId: 'vocals' })).toThrowError(
      expect.objectContaining<ProjectValidationError>({ code: 'CLIP_COLLISION' }),
    );

    store.moveClip('kick', { start: 7, trackId: 'vocals' });
    expect(store.getSnapshot().project[1].songs.map(clip => clip.id)).toContain('kick');
    expect(store.getSnapshot().project[1].songs.find(clip => clip.id === 'kick')?.group).toBe(1);
  });

  it('rejects duplicate ids and locked clip movement', () => {
    const store = new ProjectStore(project);
    expect(() => store.addTrack({ ...project[0], group: 2 })).toThrowError(
      expect.objectContaining<ProjectValidationError>({ code: 'DUPLICATE_TRACK_ID' }),
    );

    store.updateClip('kick', { lock: true });
    expect(() => store.moveClip('kick', { start: 3, trackId: 'drums' })).toThrowError(
      expect.objectContaining<ProjectValidationError>({ code: 'CLIP_LOCKED' }),
    );
  });

  it('emits one typed change per committed mutation', () => {
    const store = new ProjectStore(project);
    const listener = vi.fn();
    store.subscribe(listener);

    store.setTrackMute('drums', false, { source: 'test' });
    store.setTrackMute('drums', true, { source: 'test' });

    expect(listener).toHaveBeenCalledOnce();
    expect(listener.mock.calls[0][1]).toEqual({ source: 'test', type: 'set-track-mute' });
  });
});
