import * as PIXI from "pixi.js";

export default class Game {
  private stage: PIXI.Container;
  private gameWidth: number;
  private gameHeight: number;

  constructor(stage: PIXI.Container, gameWidth: number, gameHeight: number) {
    this.stage = stage;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.createHero();
  }

  private createHero(): void {
    const hero = PIXI.Sprite.from("birdUp.png");
    hero.anchor.set(0.5, 0.5);
    hero.position.set(this.gameWidth / 2, this.gameHeight * 0.8);

    this.stage.addChild(hero);
  }
}
