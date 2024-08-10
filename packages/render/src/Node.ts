import { Statable } from './State';

export abstract class Node extends Statable {
  name = 'node';
  x = 0;
  y = 0;
  width = 0;
  height = 0;

  eventEnabled = true;

  abstract update(dT: number): void;
  abstract draw(ctx: CanvasRenderingContext2D): void;

  _tick(dT: number, ctx: CanvasRenderingContext2D) {
    this.update(dT);
    this.draw(ctx);
  }

  isIntersection(x: number, y: number) {
    return this.x <= x && x <= this.x + this.width && this.y <= y && y <= this.y + this.height;
  }

  hitTest(x: number, y: number): Node | null {
    if (this.isIntersection(x, y)) return this;
    return null;
  }
}
