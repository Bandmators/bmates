import { describe, expect, it } from 'vitest';

import { DEFAULT_EDITOR_STYLE } from '../types';
import { clone, deepMerge } from './object';

describe('style merging', () => {
  it('fills partial styles without mutating shared defaults', () => {
    const custom = { wave: { height: 80 } };
    const resolved = deepMerge(clone(DEFAULT_EDITOR_STYLE), custom);

    expect(resolved.wave.height).toBe(80);
    expect(resolved.wave.margin).toBe(DEFAULT_EDITOR_STYLE.wave.margin);
    expect(DEFAULT_EDITOR_STYLE.wave.height).toBe(45);
    expect(custom).toEqual({ wave: { height: 80 } });
  });
});
