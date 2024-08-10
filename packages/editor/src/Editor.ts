import { Stage } from '@bmates/render';

import { Sidebar } from './';
import { Workground } from './Workground';
import { EditorDataType, EditorStyleType } from './types/editor';

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

  constructor(element: HTMLCanvasElement, data: EditorDataType[]) {
    super(element);
    this.data = data;

    this._initLayout();

    /* eslint-disable @typescript-eslint/no-explicit-any */
    (window as any).editor = this;
  }

  private _initLayout = () => {
    this._workground = new Workground(this.canvas, this.style, this.data);
    this.add(this._workground);

    const sidebar = new Sidebar(this.style, this.data);
    this.add(sidebar);
  };

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
}
