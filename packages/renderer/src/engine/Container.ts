import { Node } from './Node';

export abstract class Container<ChildType extends Node = Node> extends Node {
  override name = 'container';
  children: ChildType[] = [];

  add(child: ChildType): void {
    this.children.push(child);
    child.parent = this;
  }

  remove(child: ChildType): void {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      child.parent = null;
    }
  }

  hitTest(x: number, y: number): Node | null {
    for (let i = this.children.length - 1; i >= 0; i--) {
      const hitChild = this.children[i].hitTest(x, y);
      if (hitChild) return hitChild;
    }
    if (this.isIntersection(x, y)) return this;
    return null;
  }

  override _tick(dT: number, ctx: CanvasRenderingContext2D) {
    super._tick(dT, ctx);
    this.children.forEach(child => child._tick(dT, ctx));
  }
}
