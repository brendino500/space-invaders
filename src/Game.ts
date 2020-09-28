import * as PIXI from "pixi.js";
import Hero from "./Hero";

export default class Game {
  private stage: PIXI.Container;
  private gameWidth: number;
  private gameHeight: number;
  private hero: Hero;

  constructor(stage: PIXI.Container, gameWidth: number, gameHeight: number) {
    this.stage = stage;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.hero = new Hero(PIXI.Texture.from("birdUp.png"), gameWidth, gameHeight);
    this.stage.addChild(this.hero);
  }
}
