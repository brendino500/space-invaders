import * as PIXI from "pixi.js";

export default class Hero extends PIXI.Sprite {
  private gameWidth: number;
  private gameHeight: number;

  constructor(texture: PIXI.Texture, gameWidth: number, gameHeight: number) {
    super(texture);
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.anchor.set(0.5, 0.5);
    this.position.set(this.gameWidth / 2, this.gameHeight * 0.8);
    this.addInteractivity();
  }

  private addInteractivity(): void {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    console.log(e.code);
    switch (e.code) {
      case "ArrowLeft":
        this.moveLeft();
        break;
      case "ArrowRight":
        this.moveRight();
        break;
      case "Space":
        this.shoot();
        break;
      default:
        console.log("Press the right keys, idiot");
        break;
    }
  }

  private moveLeft(): void {
    this.x -= this.width;
  }

  private moveRight(): void {
    this.x += this.width;
  }

  private shoot(): void {
    console.log("deal with you in a minute");
  }
}
