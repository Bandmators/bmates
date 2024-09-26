import { EventData, Layer, setCursor } from '@bmates/renderer';

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

    this.listening = false;
    this.x = 0;
    this.y = 0;
    this.width = this.canvas.width * 1000;
    this.height = this.canvas.height * 1000;

    this._initLayout();
    this._initEvent();
  }

  private _initLayout() {
    this._contextMenu = new ContextMenu(this.style);
    this.add(this._contextMenu);
  }

  private _initEvent() {
    this.on('mousemove', (evt: EventData) => {
      const isHoverItem = this._contextMenu.handleHover(evt.point.x, evt.point.y);
      setCursor(isHoverItem ? 'pointer' : 'default');
    });
    this.on('mousedown', (evt: EventData) => {
      const selectedMenuItem = this._contextMenu.handleClick(evt.point.x, evt.point.y);
      this.closeContextMenu();
      evt.data = { item: selectedMenuItem };
      if (selectedMenuItem) this.parent.call(`contextmenu-select`, evt);
    });
  }

  openContextMenu(evt: EventData) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = evt.originalEvent.clientX - rect.left + this.scroll.x;
    const clickY = evt.originalEvent.clientY - rect.top + this.scroll.y;

    this._contextMenu.openMenu(clickX, clickY, evt.target);
    // setCursor('default');
    this.listening = true;
  }

  closeContextMenu() {
    this._contextMenu.closeMenu();
    this.listening = false;
    setCursor('default');
  }

  isOpenContextMenu() {
    return this._contextMenu.isOpen();
  }
}
