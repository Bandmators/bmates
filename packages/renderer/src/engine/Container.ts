import { Vector2 } from '../types';
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

  hitTest(point: Vector2, e: MouseEvent) {
    let hitChild = null;
    for (let i = this.children.length - 1; i >= 0; i--) {
      const hit = this.children[i].hitTest(point, e);
      if ((hit && !hitChild) || (hit && hit.isDragging)) hitChild = hit;
    }
    if (hitChild) return hitChild;
    return super.hitTest(point, e);
  }

  override _tick(dT: number, ctx: CanvasRenderingContext2D) {
    super._tick(dT, ctx);
    // this.children.forEach(child => child._tick(dT, ctx));

    const sortedChildren = [...this.children].sort((a, b) => a.zIndex - b.zIndex);
    sortedChildren.forEach(child => child._tick(dT, ctx));
  }
}
