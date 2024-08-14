import { EventType } from '@/types';
import { getRelativeMousePosition } from '@/utils';

import { dispatchEventData } from '@/utils/event';

import { Container, Group } from './';

export abstract class Stage extends Container<Group> {
  override name = 'Stage';
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  private _raf: number | null = null;

  protected dT = 0;
  protected prevTime = performance.now();

  constructor(element: HTMLCanvasElement) {
    super();

    this.canvas = element;
    this.ctx = this.canvas.getContext('2d')!;
    this.prevTime = performance.now();

    this._initListener();
    this._startLoop();

    this.x = 0;
    this.y = 0;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  protected _initListener() {
    const events: EventType[] = ['click', 'mousedown', 'mousemove', 'mouseup', 'mouseleave'];
    events.forEach(event => this.canvas.addEventListener(event, this));
  }

  private _startLoop() {
    const ticker = (currentTime: number) => {
      this._raf = requestAnimationFrame(ticker);
      this._updateTime(currentTime);
      this._render();
    };
    this._raf = requestAnimationFrame(ticker);
  }

  private _updateTime(currentTime: number) {
    this.dT = (currentTime - this.prevTime) / 1000;
    this.prevTime = currentTime;
  }

  private _render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this._tick(this.dT, this.ctx);
    this.ctx.restore();
  }

  private _dispatchEvent(eventType: EventType, e: MouseEvent): void {
    const point = getRelativeMousePosition(e, this.canvas);
    const target = this.hitTest(point.x, point.y);

    dispatchEventData(eventType, this, point, e);
    if (target) dispatchEventData(eventType, target, point, e);
  }

  handleEvent(e: MouseEvent) {
    const eventMap: { [key: string]: EventType } = {
      click: 'click',
      mousedown: 'mousedown',
      mousemove: 'mousemove',
      mouseup: 'mouseup',
      mouseleave: 'mouseup',
    };
    const eventType = eventMap[e.type];
    if (eventType) this._dispatchEvent(eventType, e);
  }

  destroy() {
    const events: EventType[] = ['click', 'mousedown', 'mousemove', 'mouseup', 'mouseleave'];
    events.forEach(event => this.canvas.removeEventListener(event, this));

    if (this._raf) cancelAnimationFrame(this._raf);
  }
}
