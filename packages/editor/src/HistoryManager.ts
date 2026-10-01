export class Memento {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly state: any[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(state: any[]) {
    this.state = JSON.parse(JSON.stringify(state));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  restore(): any[] {
    return JSON.parse(JSON.stringify(this.state));
  }
}

export class Caretaker {
  private _undoStack: Memento[] = [];
  private _redoStack: Memento[] = [];
  private current: Memento = null;

  constructor(private readonly maxEntries = 100) {}

  save(memento: Memento) {
    if (this.current) {
      this.pushUndo(this.current);
    }
    this.current = memento;
    this._redoStack = [];
  }

  undo() {
    const lastMemento = this._undoStack.pop();
    if (lastMemento) {
      this.pushRedo(this.current);
      this.current = lastMemento;
    }
    return lastMemento;
  }

  canUndo() {
    return this._undoStack.length > 0;
  }

  pushUndo(memento: Memento) {
    this._undoStack.push(memento);
    if (this._undoStack.length > this.maxEntries) this._undoStack.shift();
  }

  redo(): Memento | undefined {
    const nextMemento = this._redoStack.pop();
    if (nextMemento) {
      this._undoStack.push(this.current);
      this.current = nextMemento;
    }
    return nextMemento;
  }

  canRedo() {
    return this._redoStack.length > 0;
  }

  pushRedo(memento: Memento) {
    this._redoStack.push(memento);
    if (this._redoStack.length > this.maxEntries) this._redoStack.shift();
  }
}
