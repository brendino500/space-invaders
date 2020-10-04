import * as PIXI from "pixi.js";

export default class Enemy extends PIXI.Sprite {
  private gameWidth: number;
  private gameHeight: number;

  constructor(texture: PIXI.Texture, gameWidth: number, gameHeight: number, x: number, y: number) {
    super(texture);
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.anchor.set(0.5, 0.5);
    this.x = x;
    this.y = y;
  }
}
