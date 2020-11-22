import * as PIXI from "pixi.js";

export default class Hero extends PIXI.AnimatedSprite {
  private gameWidth: number;
  private gameHeight: number;
  private isInteractive = true;

  constructor(texture: PIXI.Texture[], gameWidth: number, gameHeight: number) {
    super(texture);
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.anchor.set(0.5, 0.5);
    this.position.set(this.gameWidth / 2, this.gameHeight * 0.8);
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
          this.scale.x = -1;
          break;
        case "ArrowRight":
          this.moveRight();
          this.scale.x = 1;
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
      this.x -= this.width;
    }
  }

  private moveRight(): void {
    if (this.x + this.width < this.gameWidth) {
      this.x += this.width;
    }
  }

  private shoot(): void {
    this.emit("shoot", this.x, this.y);
  }
}
