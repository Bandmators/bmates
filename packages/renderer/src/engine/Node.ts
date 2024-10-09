import { EventData, Vector2 } from '../types';
import { appendDataAtEventData, dispatchEventData, replaceEventDataType } from '../utils/event';
import { Statable } from './State';

interface NodeAttributes {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  draggable: boolean;
  listening: boolean;
  zIndex: number;
  visible: boolean;
}

export abstract class Node extends Statable {
  name = 'node';
  x = 0;
  y = 0;
  width = 0;
  height = 0;

  listening = false;
  visible = true;
  eventEnabled = true;
  draggable = false;
  isDragging = false;
  isOver = false;
  dragStartX = 0;
  dragStartY = 0;
  zIndex = 0;

  constructor(attrs: Partial<NodeAttributes> = {}) {
    super();
    if (attrs) {
      this.listening = attrs.listening ?? false;
      this.draggable = attrs.draggable ?? false;
      this.visible = attrs.visible ?? true;
    }
    if (this.draggable) this._initDragEvent();
  }

  abstract update(dT: number): void;
  abstract draw(ctx: CanvasRenderingContext2D): void;

  _tick(dT: number, ctx: CanvasRenderingContext2D) {
    if (!this.visible) return;
    this.update(dT);
    this.draw(ctx);
  }

  isIntersection(x: number, y: number) {
    return this.x <= x && x <= this.x + this.width && this.y <= y && y <= this.y + this.height;
  }

  hitTest(point: Vector2, e: MouseEvent): Node | null {
    if (!this.listening) return null;

    const isIntersection = this.isIntersection(point.x, point.y);
    if (isIntersection) {
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

  private _initDragEvent() {
    let moveX = 0;
    let moveY = 0;

    this.on('mouseout', (evt: EventData) => {
      if (this.isDragging) {
        this.isDragging = false;
        this.getStage().isDragging = false;
        this.call('dragend', replaceEventDataType('dragend', evt), false);
      }
    });

    this.on('mousedown', (evt: EventData) => {
      if (evt.originalEvent?.button !== 0) return;
      const stage = this.getStage();
      if (stage.isDragging) return;

      this.isDragging = true;
      stage.isDragging = true;
      moveX = evt.originalEvent?.clientX;
      moveY = evt.originalEvent?.clientY;
      this.call('dragstart', replaceEventDataType('dragstart', evt), false);
    });

    this.on('mousemove', (evt: EventData) => {
      if (this.isDragging) {
        const prevX = this.x;
        const prevY = this.y;
        const newX = this.x + (evt.originalEvent?.clientX || 0) - moveX;
        const newY = this.y + (evt.originalEvent?.clientY || 0) - moveY;

        this.x = newX;
        this.y = newY;

        moveX = evt.originalEvent?.clientX ?? 0;
        moveY = evt.originalEvent?.clientY ?? 0;

        this.call(
          'draging',
          appendDataAtEventData(replaceEventDataType('draging', evt), {
            prevX,
            prevY,
            newX,
            newY,
          }),
          false,
        );
      }
    });

    this.on('mouseup', (evt: EventData) => {
      if (this.isDragging) {
        this.isDragging = false;
        this.getStage().isDragging = false;
        this.call('dragend', replaceEventDataType('dragend', evt));
      }
    });

    this.on('mouseleave', (evt: EventData) => {
      if (this.isDragging) {
        this.isDragging = false;
        this.getStage().isDragging = false;
        this.call('dragend', replaceEventDataType('dragend', evt));
      }
    });
  }

  destroy() {
    if (this.parent) {
      this.parent.remove(this);
    }
  }

  getStage() {
    let current = this.parent;
    while (current && current.parent) {
      current = current.parent;
    }
    return current;
  }

  toObject(): object {
    return {
      name: this.name,
      x: this.x,
      y: this.y,
      width: this.width,
      zIndex: this.zIndex,
      height: this.height,
      listening: this.listening,
      draggable: this.draggable,
      visible: this.visible,
    };
  }
}
