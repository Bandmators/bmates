import { describe, expect, it } from 'vitest';

import { getClientPosition } from './position';

describe('getClientPosition', () => {
  it('reads mouse coordinates without depending on the current window realm', () => {
    const foreignWindowMouseEvent = { clientX: 128, clientY: 64 } as MouseEvent;

    expect(getClientPosition(foreignWindowMouseEvent)).toEqual({ x: 128, y: 64 });
  });

  it('reads the first active touch coordinate', () => {
    const touchEvent = { touches: [{ clientX: 24, clientY: 48 }] } as unknown as TouchEvent;

    expect(getClientPosition(touchEvent)).toEqual({ x: 24, y: 48 });
  });
});
