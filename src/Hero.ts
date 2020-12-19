import TWEEN from "@tweenjs/tween.js";
import * as PIXI from "pixi.js";

export default class Hero extends PIXI.AnimatedSprite {
  private gameWidth: number;
  private gameHeight: number;
  private isInteractive = true;
  private heroScale = 1.25;

  constructor(texture: PIXI.Texture[], gameWidth: number, gameHeight: number) {
    super(texture);
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.anchor.set(0.5, 0.5);
    this.position.set(this.gameWidth / 2, this.gameHeight * 0.8);
    this.scale.set(this.heroScale, this.heroScale);
    this.addInteractivity();
    this.play();
    this.animationSpeed = 0.4;
  }

  private addInteractivity(): void {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  public removeInteractivity(): void {
    this.isInteractive = false;
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.isInteractive) {
      switch (e.code) {
        case "ArrowLeft":
          this.moveLeft();
          this.scale.x = -this.heroScale;
          break;
        case "ArrowRight":
          this.moveRight();
          this.scale.x = this.heroScale;
          break;
        case "Space":
          this.shoot();
          break;
        default:
          console.log("Press the right keys, idiot");
          break;
      }
    }
  }

  private moveLeft(): void {
    if (this.x - this.width > 0) {
      this.move(-this.width);
    }
  }

  private moveRight(): void {
    if (this.x + this.width < this.gameWidth) {
      this.move(this.width);
    }
  }

  private move(offsetX: number): void {
    new TWEEN.Tween({ hero: this }).to({ hero: { x: this.x + offsetX } }, 150).start(performance.now());
  }

  private shoot(): void {
    this.emit("shoot", this.x, this.y);
  }
}
