import { Stage } from '@bmates/renderer';

import { EditorDataType, EditorStyleType } from '@/types';
import { deepMerge } from '@/utils';

// import { Sidebar } from './Sidebar';
import { Workground } from './Workground';

export class Editor extends Stage {
  override name = 'BEditor';

  data: EditorDataType[] = [];
  _workground: Workground | undefined;

  style: EditorStyleType = {
    theme: {
      background: 'white',
      lineColor: '#e3e3e3',
      strokeLineColor: '#999999',
    },
    timeline: {
      gapHeight: 10,
      gapWidth: 10,
      timeDivde: 10,
    },
    sidebar: {
      width: 300,
    },
    wave: {
      height: 45,
      borderRadius: 8,
    },
  };

  private _resizeListener: () => void;

  constructor(element: HTMLCanvasElement, data: EditorDataType[], style: Partial<EditorStyleType> = {}) {
    super(element);
    this.data = data;
    this.style = deepMerge(this.style, style) as EditorStyleType;

    this._onResize();
    this._initLayout();

    /* eslint-disable @typescript-eslint/no-explicit-any */
    (window as any).editor = this;

    this._resizeListener = () => this._onResize();
    window.addEventListener('resize', this._resizeListener);
  }

  private _initLayout() {
    this._workground = new Workground(this.canvas, this.style, this.data);
    this.add(this._workground);

    // const sidebar = new Sidebar(this.style, this.data);
    // this.add(sidebar);
  }

  private _onResize() {
    const dpr = window.devicePixelRatio || 2;
    const displayWidth = document.body.clientWidth - this.style.sidebar.width;
    const displayHeight = document.body.clientHeight;

    this.canvas.width = displayWidth * dpr;
    this.canvas.height = displayHeight * dpr;

    this.canvas.style.width = `${displayWidth}px`;
    this.canvas.style.height = `${displayHeight}px`;

    this.ctx.scale(dpr, dpr);
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  override update(dT: number) {}

  /* eslint-disable @typescript-eslint/no-unused-vars */
  override draw(ctx: CanvasRenderingContext2D) {}

  isPlaying() {
    return this._workground?.isPlaying();
  }

  play() {
    this._workground?.play();
  }

  pause() {
    this._workground?.pause();
  }

  stop() {
    this._workground?.stop();
  }

  override destroy() {
    super.destroy();

    window.removeEventListener('resize', this._resizeListener);
  }
}
