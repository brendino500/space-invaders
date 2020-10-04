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

  constructor(stage: PIXI.Container, gameWidth: number, gameHeight: number) {
    this.stage = stage;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.hero = new Hero(PIXI.Texture.from("birdUp.png"), gameWidth, gameHeight);
    this.stage.addChild(this.hero);
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
      this.destroySprite(fire, this.fireArray);
      console.log(this.fireArray.length);
    });
    tween.onUpdate(() => {
      this.enemyArray.forEach((enemy) => {
        const yOverlap =
          fire.y - fire.height / 2 < enemy.y + enemy.height / 2 &&
          fire.y + fire.height / 2 > enemy.y - enemy.height / 2;
        const xOverlap =
          fire.x - fire.width / 2 < enemy.x + enemy.width / 2 && fire.x + fire.width / 2 > enemy.x - enemy.width / 2;
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
    this.destroySprite(enemy, this.enemyArray);
    this.destroySprite(fire, this.fireArray);
    this.score += 100;
    console.log(this.fireArray, this.enemyArray, this.score);
  }

  private destroySprite(sprite: PIXI.Sprite, spriteArray: PIXI.Sprite[]): void {
    this.stage.removeChild(sprite);
    const index = spriteArray.indexOf(sprite);
    spriteArray.splice(index, 1);
  }

  private createEnemies(): void {
    const enemy = new Enemy(
      PIXI.Texture.from("birdUp.png"),
      this.gameWidth,
      this.gameHeight,
      this.gameWidth / 2,
      this.gameHeight / 4
    );
    this.stage.addChild(enemy);
    this.enemyArray.push(enemy);
  }
}
