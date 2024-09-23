import { Node } from '@bmates/renderer';

export class ContextMenu extends Node {
  private show = false;
  private menuItems = ['Add Track', 'Mute Track', 'Paste'];
  private additionalMenuItems = ['Mute', 'Lock', 'Duplicate', 'Cut', 'Copy', 'Delete'];
  private _menus;
  private position = { x: 0, y: 0 };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_dT: number) {}

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.show) return;

    ctx.save();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.roundRect(this.position.x, this.position.y, 150, this._menus.length * 20 + 20, 10);
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();

    ctx.fillStyle = 'black';
    this._menus.forEach((item, index) => {
      ctx.fillText(item, this.position.x + 10, this.position.y + 20 + index * 20);
    });

    ctx.restore();
  }

  handleClick(x: number, y: number) {
    const menuIndex = Math.floor((y - this.position.y) / 20);
    if (menuIndex >= 0 && menuIndex < this._menus.length) {
      const selectedItem = this._menus[menuIndex];
      console.log(`Selected menu item: ${selectedItem}`);
    }
  }

  showMenu(x: number, y: number, target: { name: string }) {
    this.position = { x, y };
    this._menus = target.name === 'Wave' ? [...this.menuItems, ...this.additionalMenuItems] : this.menuItems;
    console.log(target);
    this.show = true;
  }

  closeMenu() {
    this.show = false;
  }
}
