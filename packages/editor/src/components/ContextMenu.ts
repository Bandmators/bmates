import { Node } from '@bmates/renderer';

import { EditorStyleType } from '../types';
import { Wave } from './Wave';

export class ContextMenu extends Node {
  private open = false;
  private menuItems = ['Paste'];
  private additionalMenuItems = ['Duplicate', 'Cut', 'Copy', 'Delete'];
  private _menus: string[] = [];
  private position = { x: 0, y: 0 };
  private hoveredIndex = -1;

  constructor(protected style: EditorStyleType) {
    super({ listening: true });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_dT: number) {}

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.open) return;

    const { itemHeight, itemPadding, menuWidth, menuPadding } = this.style.context;

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(
      this.position.x,
      this.position.y,
      menuWidth + menuPadding * 2,
      this._menus.length * itemHeight + menuPadding * 2,
      10,
    );
    ctx.fill();
    ctx.strokeStyle = '#cccccc';
    ctx.stroke();

    this._menus.forEach((item, index) => {
      if (this.hoveredIndex === index) {
        ctx.fillStyle = '#f0f0f0';
        ctx.beginPath();
        ctx.roundRect(
          this.position.x + menuPadding,
          this.position.y + menuPadding + index * itemHeight,
          menuWidth,
          itemHeight,
          5,
        );
        ctx.fill();
      }

      ctx.fillStyle = '#333333';
      ctx.font = '11px Arial';
      ctx.fillText(
        item,
        this.position.x + menuPadding + itemPadding,
        this.position.y + menuPadding + index * itemHeight + itemHeight / 2 + 5,
      );
    });

    ctx.restore();
  }

  handleHover(x: number, y: number) {
    const { itemHeight, menuWidth, menuPadding } = this.style.context;

    if (x >= this.position.x + menuPadding && x <= this.position.x + menuWidth + menuPadding) {
      // x 좌표 검사
      const menuIndex = Math.floor((y - this.position.y - menuPadding) / itemHeight);
      if (menuIndex >= 0 && menuIndex < this._menus.length) {
        this.hoveredIndex = menuIndex;
        return true;
      }
    }
    this.hoveredIndex = -1;
    return false;
  }

  handleClick(x: number, y: number) {
    const { itemHeight, menuWidth, menuPadding } = this.style.context;

    if (x >= this.position.x + menuPadding && x <= this.position.x + menuWidth + menuPadding) {
      const menuIndex = Math.floor((y - this.position.y - menuPadding) / itemHeight);
      if (menuIndex >= 0 && menuIndex < this._menus.length) {
        const selectedItem = this._menus[menuIndex];

        console.log(`Selected menu item: ${selectedItem}`);
        return selectedItem;
      }
    }
    return null;
  }

  openMenu(x: number, y: number, target: Node) {
    this.position = { x, y };
    this._menus =
      target instanceof Wave
        ? [
            ...this.menuItems,
            ...this.additionalMenuItems,
            target.data.mute ? 'Unmute' : 'Mute',
            target.data.lock ? 'Unlock' : 'Lock',
          ]
        : this.menuItems;
    this.open = true;
  }

  closeMenu() {
    this.open = false;
  }

  isOpen() {
    return this.open;
  }
}
