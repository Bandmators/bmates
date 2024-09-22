import { Vector2 } from '@/types';

import { dispatchEventData } from '@/utils/event';

import { Statable } from './State';

export abstract class Node extends Statable {
  name = 'node';
  x = 0;
  y = 0;
  width = 0;
  height = 0;

  eventEnabled = true;
  draggable = false;
  isDragging = false;
  isOver = false;
  dragStartX = 0;
  dragStartY = 0;
  zIndex = 0;

  _lastHoveredTarget: Node[] = [];

  abstract update(dT: number): void;
  abstract draw(ctx: CanvasRenderingContext2D): void;

  _tick(dT: number, ctx: CanvasRenderingContext2D) {
    this.update(dT);
    this.draw(ctx);
  }

  isIntersection(x: number, y: number) {
    return this.x <= x && x <= this.x + this.width && this.y <= y && y <= this.y + this.height;
  }

  hitTest(point: Vector2, e: MouseEvent): Node | null {
    if (this.isIntersection(point.x, point.y)) {
      if (!this.isOver) {
        dispatchEventData('mouseover', this, point, e);
        this.isOver = true;
      }
      return this;
    }
    if (this.isOver) {
      dispatchEventData('mouseout', this, point, e);
      this.isOver = false;
    }
    return null;
  }

  startDrag(x: number, y: number) {
    if (this.draggable) {
      this.isDragging = true;
      this.dragStartX = x - this.x;
      this.dragStartY = y - this.y;
    }
  }

  drag(x: number, y: number) {
    if (this.isDragging) {
      this.x = x - this.dragStartX;
      this.y = y - this.dragStartY;
    }
  }

  endDrag() {
    this.isDragging = false;
  }
}
