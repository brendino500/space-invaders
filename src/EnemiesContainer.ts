import * as PIXI from "pixi.js";
import Enemy from "./Enemy";
import Hero from "./Hero";
import TWEEN from "@tweenjs/tween.js";

export default class EnemiesContainer extends PIXI.Container {
  public enemyArray: Enemy[] = [];
  private readonly enemyRows = 5;
  private readonly enemyColumns = 11;
  private readonly enemyPaddingX: number;
  private readonly enemyPaddingY: number;
  private maxEnemyContainerWidth: number | undefined;
  private enemySpeed = 1000;
  private enemyMovementInfo = {
    canMoveRight: true,
    canMoveDown: false,
  };
  private enemiesInterval: number | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private enemiesTween: any;
  private gameWidth: number;
  private gameHeight: number;
  public readonly HERO_HIT_EVENT = "HERO_HIT_EVENT";

  constructor(gameWidth: number, gameHeight: number, enemyPaddingX: number, enemyPaddingY: number) {
    super();
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.enemyPaddingX = enemyPaddingX;
    this.enemyPaddingY = enemyPaddingY;
    this.y = this.enemyPaddingY;
  }

  public create(): void {
    const enemyTexturesArray = [
      [
        "duck00.png",
        "duck01.png",
        "duck02.png",
        "duck03.png",
        "duck04.png",
        "duck05.png",
        "duck06.png",
        "duck07.png",
        "duck08.png",
        "duck09.png",
      ].map((e) => {
        return PIXI.Texture.from(e);
      }),
      [
        "bunny00.png",
        "bunny01.png",
        "bunny02.png",
        "bunny03.png",
        "bunny04.png",
        "bunny05.png",
        "bunny06.png",
        "bunny07.png",
      ].map((e) => {
        return PIXI.Texture.from(e);
      }),
      [
        "angry_pig00.png",
        "angry_pig01.png",
        "angry_pig02.png",
        "angry_pig03.png",
        "angry_pig04.png",
        "angry_pig05.png",
        "angry_pig06.png",
        "angry_pig07.png",
        "angry_pig08.png",
      ].map((e) => {
        return PIXI.Texture.from(e);
      }),
    ];
    for (let i = 0; i < this.enemyColumns; i++) {
      for (let j = 0; j < this.enemyRows; j++) {
        const enemyLayout = [0, 1, 1, 2, 2];
        const enemyTextures = enemyTexturesArray[enemyLayout[j]];
        const enemy = new Enemy(
          enemyTextures,
          this.gameWidth,
          this.gameHeight,
          this.enemyPaddingX + this.enemyPaddingX * i,
          this.enemyPaddingY + this.enemyPaddingY * j
        );
        this.addChild(enemy);
        this.enemyArray.push(enemy);
      }
    }
    this.maxEnemyContainerWidth = this.width;
  }

  public destroy(): void {
    this.enemyArray.forEach((enemy: Enemy) => {
      this.removeChild(enemy);
    });
    this.enemyArray = [];
    this.resetEnemiesTween();
  }

  public getRandomEnemyPosition(): { x: number; y: number } {
    const randomEnemy = this.enemyArray[Math.floor(Math.random() * this.enemyArray.length)];
    return { x: this.x + randomEnemy.x, y: this.y + randomEnemy.y };
  }

  public move(hero: Hero | undefined): void {
    this.enemiesInterval = (setInterval(() => {
      const enemyTweenData = {
        moveRight: { x: this.x + this.enemyPaddingX },
        moveLeft: { x: this.x - this.enemyPaddingX },
        moveDown: { y: this.y + this.enemyPaddingY },
      };
      let tweenData = {};
      if (this.enemyMovementInfo.canMoveRight && !this.enemyMovementInfo.canMoveDown) {
        tweenData = enemyTweenData.moveRight;
        if (this.x + this.getRightMostEnemyX() + this.enemyPaddingX * 2.5 > this.gameWidth) {
          this.enemyMovementInfo.canMoveDown = true;
        }
      } else if (this.enemyMovementInfo.canMoveDown) {
        if (hero && hero.y <= this.y + this.getBottomMostEnemyY() + this.enemyPaddingY) {
          // this.heroHit(null)
          this.emit(this.HERO_HIT_EVENT);
          return;
        }
        tweenData = enemyTweenData.moveDown;
        this.enemyMovementInfo.canMoveDown = false;
        this.enemyMovementInfo.canMoveRight = !this.enemyMovementInfo.canMoveRight;
      } else {
        tweenData = enemyTweenData.moveLeft;
        if (this.x + this.getLeftMostEnemyX() - this.enemyPaddingX * 2.5 < 0) {
          this.enemyMovementInfo.canMoveDown = true;
        }
      }

      this.enemiesTween = new TWEEN.Tween({ enemiesContainer: this })
        .to({ enemiesContainer: tweenData }, this.enemySpeed / 2)
        .easing(TWEEN.Easing.Sinusoidal.InOut);
      this.enemiesTween.start(performance.now());
    }, this.enemySpeed) as unknown) as number;
  }

  private getLeftMostEnemyX(): number {
    let leftX = this.maxEnemyContainerWidth || 0;
    this.children.forEach((child) => {
      if (child.x < leftX) {
        leftX = child.x;
      }
    });
    return leftX;
  }

  private getRightMostEnemyX(): number {
    let rightX = 0;
    this.children.forEach((child) => {
      if (child.x > rightX) {
        rightX = child.x;
      }
    });
    return rightX;
  }

  private getBottomMostEnemyY(): number {
    let bottomY = 0;
    this.children.forEach((child) => {
      if (child.y > bottomY) {
        bottomY = child.y;
      }
    });
    return bottomY;
  }

  public resetEnemiesTween(): void {
    clearInterval(this.enemiesInterval);
    this.enemiesTween.stop();
    this.position.set(0, this.enemyPaddingY);
    this.enemyMovementInfo.canMoveDown = false;
    this.enemyMovementInfo.canMoveRight = true;
  }

  public levelComplete(): void {
    this.enemySpeed *= 0.9;
    this.resetEnemiesTween();
    this.create();
    this.move(undefined);
  }
}
