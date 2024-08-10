/* eslint-disable @typescript-eslint/no-unused-vars */
import { Container } from './';

export class Group extends Container {
  override name = 'Group';

  update(dT: number): void {}
  draw(ctx: CanvasRenderingContext2D): void {}
}
