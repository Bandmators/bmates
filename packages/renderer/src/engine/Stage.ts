import { EVENT_LIST } from '../constants/event';
import { EventType } from '../types';
import { getRelativeMousePosition } from '../utils';
import { dispatchEventData } from '../utils/event';
import { Container } from './Container';
import { Layer } from './Layer';
import { Node } from './Node';

export abstract class Stage extends Container<Layer> {
  override name = 'Stage';
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  scroll = {
    x: 0,
    y: 0,
  };

  private _raf: number | null = null;

  protected dT = 0;
  protected prevTime = performance.now();

  constructor(element: HTMLCanvasElement) {
    super({ listening: true });

    this.canvas = element;
    this.ctx = this.canvas.getContext('2d')!;
    this.prevTime = performance.now();

    this._initListener();
    this._startLoop();

    this.x = 0;
    this.y = 0;
    this.width = this.canvas.width * 1000;
    this.height = this.canvas.height * 1000;
  }

  protected _initListener() {
    EVENT_LIST.forEach(event => this.canvas.addEventListener(event, this));
    this.canvas.addEventListener('contextmenu', (evt: MouseEvent) => {
      evt.preventDefault();
    });
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

  private _dispatchEvent(eventType: EventType, e: Event): void {
    const point = getRelativeMousePosition(e, this.canvas, this.scroll);

    const target = this.hitTest(point, e);
    if (target) dispatchEventData(eventType, target, point, e);
  }

  handleEvent(e: Event) {
    const eventMap: { [key: string]: EventType } = {
      touchstart: 'touchstart',
      touchmove: 'touchmove',
      touchend: 'touchend',
      click: 'click',
      mousedown: 'mousedown',
      mousemove: 'mousemove',
      mouseup: 'mouseup',
      mouseleave: 'mouseup',
    };
    const eventType = eventMap[e.type];
    if (eventType) this._dispatchEvent(eventType, e);
    if (e.type === 'mouseleave' || e.type === 'mouseout') {
      const point = getRelativeMousePosition(e, this.canvas, this.scroll);
      this._dispatchEventToAll(eventType, point, e);
    }
    if (eventType === 'mousedown' && e instanceof MouseEvent && e.button === 1) {
      e.preventDefault();
    }
  }

  private _dispatchEventToAll(eventType: EventType, point: { x: number; y: number }, e: Event) {
    const dispatchToNode = (node: Node) => {
      dispatchEventData(eventType, node, point, e, false);
      if (node instanceof Container) {
        node.children.forEach(dispatchToNode);
      }
    };
    this.children.forEach(dispatchToNode);
  }

  destroy() {
    EVENT_LIST.forEach(event => this.canvas.removeEventListener(event, this));

    if (this._raf) cancelAnimationFrame(this._raf);
  }
}
