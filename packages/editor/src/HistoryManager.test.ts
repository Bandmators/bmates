import { describe, expect, it } from 'vitest';

import { Caretaker, Memento } from './HistoryManager';

describe('Caretaker', () => {
  it('restores independent snapshots through undo and redo', () => {
    const caretaker = new Caretaker();
    const first = [{ id: 'first', value: 1 }];
    const second = [{ id: 'second', value: 2 }];

    caretaker.save(new Memento(first));
    caretaker.save(new Memento(second));
    first[0].value = 99;

    expect(caretaker.canUndo()).toBe(true);
    expect(caretaker.undo()?.restore()).toEqual([{ id: 'first', value: 1 }]);
    expect(caretaker.canRedo()).toBe(true);
    expect(caretaker.redo()?.restore()).toEqual(second);
  });

  it('bounds retained history for long editing sessions', () => {
    const caretaker = new Caretaker(1);
    caretaker.save(new Memento([{ id: 'first' }]));
    caretaker.save(new Memento([{ id: 'second' }]));
    caretaker.save(new Memento([{ id: 'third' }]));

    expect(caretaker.undo()?.restore()).toEqual([{ id: 'second' }]);
    expect(caretaker.canUndo()).toBe(false);
  });
});
