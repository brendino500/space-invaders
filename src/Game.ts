import * as PIXI from "pixi.js";
import Hero from "./Hero";
import Fire from "./Fire";
import Enemy from "./Enemy";
import TWEEN from "@tweenjs/tween.js";

export default class Game {
  private stage: PIXI.Container;
  private gameWidth: number;
  private gameHeight: number;
  private hero: Hero;
  private fireArray: Fire[] = [];
  private enemyArray: Enemy[] = [];
  private score = 0;
  private readonly enemyRows = 11;
  private readonly enemyColumns = 5;
  private readonly enemyPadding = 20;
  private speed = 1000;
  private enemyContainer = new PIXI.Container();

  constructor(stage: PIXI.Container, gameWidth: number, gameHeight: number) {
    this.stage = stage;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.hero = new Hero(PIXI.Texture.from("birdUp.png"), gameWidth, gameHeight);
    this.stage.addChild(this.hero);
    this.stage.addChild(this.enemyContainer);
    this.createListeners();
    this.createEnemies();
  }

  private createListeners(): void {
    this.hero.on("shoot", this.handleShoot.bind(this));
  }

  private handleShoot(x: number, y: number): void {
    const fire = new Fire(PIXI.Texture.from("goldMedal.png"), this.gameWidth, this.gameHeight, x, y);
    this.stage.addChild(fire);
    this.fireArray.push(fire);

    const tween = new TWEEN.Tween({ fire }).to({ fire: { y: -fire.height } }, 1000);
    tween.onStart(() => {
      console.log("start");
    });
    tween.onComplete(() => {
      this.destroySprite(this.stage, fire, this.fireArray);
      console.log(this.fireArray.length);
    });
    tween.onUpdate(() => {
      this.enemyArray.forEach((enemy) => {
        const yOverlap =
          fire.y - fire.height / 2 < enemy.y + this.enemyContainer.y + enemy.height / 2 &&
          fire.y + fire.height / 2 > enemy.y + this.enemyContainer.y - enemy.height / 2;
        const xOverlap =
          fire.x - fire.width / 2 < enemy.x + this.enemyContainer.x + enemy.width / 2 &&
          fire.x + fire.width / 2 > enemy.x + this.enemyContainer.x - enemy.width / 2;
        const hit: boolean = yOverlap && xOverlap;
        if (hit) {
          tween.stop();
          this.enemyHit(fire, enemy);
        }
      });
    });
    tween.start(performance.now());
    console.log("engelbert", tween);
  }

  private enemyHit(fire: Fire, enemy: Enemy): void {
    console.log("enemyHit");
    this.destroySprite(this.enemyContainer, enemy, this.enemyArray);
    this.destroySprite(this.stage, fire, this.fireArray);
    this.score += 100;
    console.log(this.fireArray, this.enemyArray, this.score);
  }

  private destroySprite(parent: PIXI.Container, sprite: PIXI.Sprite, spriteArray: PIXI.Sprite[]): void {
    parent.removeChild(sprite);
    const index = spriteArray.indexOf(sprite);
    spriteArray.splice(index, 1);
  }

  private createEnemies(): void {
    for (let i = 0; i < this.enemyColumns; i++) {
      for (let j = 0; j < this.enemyRows; j++) {
        const enemy = new Enemy(
          PIXI.Texture.from("birdUp.png"),
          this.gameWidth,
          this.gameHeight,
          this.enemyPadding + this.enemyPadding * i,
          this.enemyPadding + this.enemyPadding * j
        );
        this.enemyContainer.addChild(enemy);
        this.enemyArray.push(enemy);
      }
    }
  }
}
