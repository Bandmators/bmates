import { Container, Group } from '.';
import { EventData, EventType } from './types';
import { getRelativeMousePosition } from './utils/position';

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
    this._onResize();
    this._startLoop();

    this.x = 0;
    this.y = 0;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  private _initListener = () => {
    this.canvas.addEventListener('click', this._onClick);
    this.canvas.addEventListener('mousedown', this._onMouseDown);
    this.canvas.addEventListener('mousemove', this._onMouseMove);
    this.canvas.addEventListener('mouseup', this._onMouseUp);
    this.canvas.addEventListener('mouseleave', this._onMouseUp);
    window.addEventListener('resize', this._onResize);
  };

  private _startLoop() {
    const ticker = (currentTime: number) => {
      this._raf = requestAnimationFrame(ticker);

      this.dT = (currentTime - this.prevTime) / 1000;
      this.prevTime = currentTime;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.save();
      this._tick(this.dT, this.ctx);
      this.ctx.restore();
    };
    this._raf = requestAnimationFrame(ticker);
  }

  private dispatchEventToChildren(eventType: EventType, e: MouseEvent): void {
    const { x, y } = getRelativeMousePosition(e, this.canvas);
    const target = this.hitTest(x, y);

    const eventData: EventData = { type: eventType, target: this, point: { x, y }, originalEvent: e };
    this.call(eventType, eventData, false);

    if (target) {
      const eventData: EventData = { type: eventType, target: target, point: { x, y }, originalEvent: e };
      target.call(eventType, eventData, true);
    }
  }

  private handleMouseEvent = (event: EventType, mouseEvent: MouseEvent) => {
    this.dispatchEventToChildren(event, mouseEvent);
  };

  private _onClick = (event: MouseEvent) => {
    this.handleMouseEvent('click', event);
  };

  private _onMouseDown = (event: MouseEvent) => {
    this.handleMouseEvent('mousedown', event);
  };

  private _onMouseMove = (event: MouseEvent) => {
    this.handleMouseEvent('mousemove', event);
  };

  private _onMouseUp = (event: MouseEvent) => {
    this.handleMouseEvent('mouseup', event);
  };

  private _onResize = () => {
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;

    const dpr = window.devicePixelRatio || 2;
    const displayWidth = document.body.clientWidth;
    const displayHeight = document.body.clientHeight;

    this.canvas.width = displayWidth * dpr;
    this.canvas.height = displayHeight * dpr;

    this.canvas.style.width = `${displayWidth}px`;
    this.canvas.style.height = `${displayHeight}px`;

    this.ctx.scale(dpr, dpr);
  };

  destroy = () => {
    this.canvas.removeEventListener('click', this._onClick);
    this.canvas.removeEventListener('mousedown', this._onMouseDown);
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    this.canvas.removeEventListener('mouseup', this._onMouseUp);
    this.canvas.removeEventListener('mouseleave', this._onMouseUp);
    window.removeEventListener('resize', this._onResize);
    if (this._raf) cancelAnimationFrame(this._raf);
  };
}
