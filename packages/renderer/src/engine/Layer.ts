/* eslint-disable @typescript-eslint/no-unused-vars */
import { Container } from './';

export class Layer extends Container {
  override name = 'Layer';

  update(dT: number): void {}
  draw(ctx: CanvasRenderingContext2D): void {}
}
