import { EventData, Layer } from '@bmates/renderer';

import { EditorStyleType } from '@/types';

import { ContextMenu } from './ContextMenu';

export class Overlay extends Layer {
  override name = 'Overlay';
  private _contextMenu: ContextMenu;

  constructor(
    protected canvas: HTMLCanvasElement,
    protected style: EditorStyleType,
    private scroll = { x: 0, y: 0 },
  ) {
    super();

    this.x = 0;
    this.y = 0;
    this.width = this.canvas.width * 1000;
    this.height = this.canvas.height * 1000;

    this._initLayout();
    this._initEvent();
  }

  private _initLayout() {
    this._contextMenu = new ContextMenu();
    this.add(this._contextMenu);
  }

  private _initEvent() {
    this.on('mousedown', (evt: EventData) => {
      if (evt.originalEvent.button === 2) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = evt.originalEvent.clientX - rect.left + this.scroll.x;
        const clickY = evt.originalEvent.clientY - rect.top + this.scroll.y;

        this._contextMenu.showMenu(clickX, clickY, evt.target);
      } else {
        this._contextMenu.closeMenu();
      }
    });
  }
}
