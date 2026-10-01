import { createProjectStore } from '@bmates/core';

import { describe, expect, it, vi } from 'vitest';

import { createBMatesStore } from './BMatesStore';

const project = [
  {
    id: 'track-1',
    name: 'Drums',
    group: 0,
    songs: [],
  },
];

describe('BMatesStore', () => {
  it('owns an isolated project snapshot', () => {
    const store = createBMatesStore({ data: project });

    project[0].name = 'Changed outside';

    expect(store.getSnapshot().data[0].name).toBe('Drums');
    expect(store.getSnapshot().status).toBe('idle');
  });

  it('keeps media commands canvas-bound while history works headlessly', async () => {
    const store = createBMatesStore();

    expect(() => store.stop()).toThrow('BMatesCanvas must be mounted');
    await store.setProject(project);
    await store.muteTrack('track-1', true);
    await store.undo();

    expect(store.getSnapshot().data[0].mute).toBeUndefined();
    expect(store.exportProject()).toEqual(project);
  });

  it('unsubscribes listeners cleanly', () => {
    const store = createBMatesStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.unmount();
    expect(listener).toHaveBeenCalledOnce();

    unsubscribe();
    store.unmount();
    expect(listener).toHaveBeenCalledOnce();
  });

  it('serializes project updates and keeps the latest snapshot', async () => {
    const store = createBMatesStore();
    const first = [{ id: 'first', name: 'First', group: 0, songs: [] }];
    const second = [{ id: 'second', name: 'Second', group: 0, songs: [] }];

    await Promise.all([store.setProject(first), store.setProject(second)]);

    expect(store.getSnapshot().data).toEqual(second);
  });

  it('adapts an external headless project store without a second source of truth', () => {
    const projectStore = createProjectStore(project);
    const store = createBMatesStore({ projectStore });

    projectStore.setTrackMute('track-1', true, { source: 'plugin' });

    expect(store.getSnapshot()).toMatchObject({ canUndo: true, revision: 1 });
    expect(store.getSnapshot().data[0].mute).toBe(true);
    expect(store.getProjectStore()).toBe(projectStore);
  });
});
