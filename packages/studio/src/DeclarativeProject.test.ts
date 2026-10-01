import { describe, expect, it, vi } from 'vitest';

import { DeclarativeProjectRegistry } from './DeclarativeProject';

const createRegistry = () =>
  new DeclarativeProjectRegistry(
    vi.fn(async () => undefined),
    vi.fn(),
  );

describe('DeclarativeProjectRegistry', () => {
  it('composes tracks and clips with contiguous groups', () => {
    const registry = createRegistry();
    const vocals = Symbol('vocals');
    const drums = Symbol('drums');

    registry.setTrack(vocals, { id: 'vocals', name: 'Vocals', group: 10 });
    registry.setTrack(drums, { id: 'drums', name: 'Drums', group: 0 });
    registry.setClip(Symbol('voice'), vocals, {
      id: 'voice',
      instrument: 'Voice',
      src: '/voice.wav',
      start: 2,
      user: '',
    });
    registry.setClip(Symbol('kick'), drums, {
      id: 'kick',
      instrument: 'Drum',
      src: '/kick.wav',
      start: 0,
      user: '',
    });

    expect(registry.toProject()).toEqual([
      {
        id: 'drums',
        name: 'Drums',
        group: 0,
        songs: [expect.objectContaining({ id: 'kick', group: 0 })],
      },
      {
        id: 'vocals',
        name: 'Vocals',
        group: 1,
        songs: [expect.objectContaining({ id: 'voice', group: 1 })],
      },
    ]);
  });

  it('rejects duplicate public ids', () => {
    const registry = createRegistry();
    registry.setTrack(Symbol('first'), { id: 'duplicate', name: 'First' });
    registry.setTrack(Symbol('second'), { id: 'duplicate', name: 'Second' });

    expect(() => registry.toProject()).toThrow('Duplicate declarative track id: duplicate');
  });
});
