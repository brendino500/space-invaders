import * as PIXI from "pixi.js";

export default class Fire extends PIXI.Sprite {
  private gameWidth: number;
  private gameHeight: number;

  constructor(texture: PIXI.Texture, gameWidth: number, gameHeight: number, x: number, y: number) {
    super(texture);
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.x = x;
    this.y = y;
    this.anchor.set(0.5, 0.5);
    this.scale.set(0.5, 0.5);
  }
}
