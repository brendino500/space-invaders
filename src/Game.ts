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
  private readonly enemyRows = 5;
  private readonly enemyColumns = 11;
  private readonly enemyPaddingX = 30;
  private readonly enemyPaddingY = 25;
  private enemySpeed = 800;
  private enemyContainer = new PIXI.Container();
  private enemyMovementInfo = {
    canMoveRight: true,
    canMoveDown: false,
  };
  private enemiesInterval: number | undefined;
  private enemiesTween: any;
  private bigEnemyTween: any;
  private bigEnemy: Enemy | null = null;

  constructor(stage: PIXI.Container, gameWidth: number, gameHeight: number) {
    this.stage = stage;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.hero = new Hero(PIXI.Texture.from("birdUp.png"), gameWidth, gameHeight);
    this.stage.addChild(this.hero);
    this.enemyContainer.y = this.enemyPaddingY;
    this.stage.addChild(this.enemyContainer);
    this.createListeners();
    this.createEnemies();
    this.moveEnemies();
    this.enemyShoot();
    this.createBigEnemy();
  }

  private createListeners(): void {
    this.hero.on("shoot", this.handleShoot.bind(this));
  }

  private handleShoot(x: number, y: number, shotByHero = true): void {
    const fire = new Fire(PIXI.Texture.from("goldMedal.png"), this.gameWidth, this.gameHeight, x, y);
    this.stage.addChild(fire);
    this.fireArray.push(fire);
    const yTarget = shotByHero ? -fire.height : this.gameHeight + fire.height;
    const tween = new TWEEN.Tween({ fire }).to({ fire: { y: yTarget } }, 1000);
    tween.onStart(() => {
      console.log("start");
    });
    tween.onComplete(() => {
      this.destroySprite(this.stage, fire, this.fireArray);
      console.log(this.fireArray.length);
      if (!shotByHero) {
        this.enemyShoot();
      }
    });
    if (shotByHero) {
      tween.onUpdate(() => {
        if (this.bigEnemy) {
          const bigEnemyYOverlap =
            fire.y - fire.height / 2 < this.bigEnemy.y + this.bigEnemy.height / 2 &&
            fire.y + fire.height / 2 > this.bigEnemy.y - this.bigEnemy.height / 2;
          const bigEnemyXOverlap =
            fire.x - fire.width / 2 < this.bigEnemy.x + this.bigEnemy.width / 2 &&
            fire.x + fire.width / 2 > this.bigEnemy.x - this.bigEnemy.width / 2;
          if (bigEnemyXOverlap && bigEnemyYOverlap) {
            this.resetBigEnemy(true);
          }
        }
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
    } else {
      tween.onUpdate(() => {
        const yOverlap =
          fire.y - fire.height / 2 < this.hero.y + this.hero.height / 2 &&
          fire.y + fire.height / 2 > this.hero.y - this.hero.height / 2;
        const xOverlap =
          fire.x - fire.width / 2 < this.hero.x + this.hero.width / 2 &&
          fire.x + fire.width / 2 > this.hero.x - this.hero.width / 2;
        if (yOverlap && xOverlap) {
          tween.stop();
          this.heroHit(fire);
          console.log("englbert down!");
        }
      });
    }
    tween.start(performance.now());
    console.log("engelbert", tween);
  }

  private enemyHit(fire: Fire, enemy: Enemy): void {
    this.destroySprite(this.enemyContainer, enemy, this.enemyArray);
    this.destroySprite(this.stage, fire, this.fireArray);
    this.score += 100;
    if (this.enemyArray.length === 0) {
      this.levelComplete();
    }
  }

  private heroHit(fire: Fire): void {
    this.destroySprite(this.stage, fire, this.fireArray);
    this.hero.removeInteractivity();
    new TWEEN.Tween({ hero: this.hero })
      .to({ hero: { y: this.gameHeight + this.hero.height, rotation: 180 / (180 / Math.PI) } }, 800)
      .easing(TWEEN.Easing.Back.In)
      .onComplete(() => {
        this.stage.removeChild(this.hero);
        this.gameOver();
      })
      .start(performance.now());
    this.destroyAllEnemies();
  }

  private gameOver(): void {
    const gameOverLabel = new PIXI.Text("GAME OVER, LOSER", {
      fontFamily: "Arial",
      fontSize: 24,
      fill: 0xff1010,
      align: "center",
    });
    gameOverLabel.anchor.set(0.5, 0.5);
    gameOverLabel.x = this.gameWidth / 2;
    gameOverLabel.y = this.gameHeight * 0.25;
    this.stage.addChild(gameOverLabel);
  }

  private destroyAllEnemies(): void {
    this.destroyEnemies();
    this.resetEnemiesTween();
    this.resetBigEnemy(false, false);
  }

  private enemyShoot(): void {
    const randomEnemy = this.enemyArray[Math.floor(Math.random() * this.enemyArray.length)];
    this.handleShoot(this.enemyContainer.x + randomEnemy.x, this.enemyContainer.y + randomEnemy.y, false);
  }

  private levelComplete(): void {
    this.enemySpeed *= 0.9;
    this.resetEnemiesTween();
    this.createEnemies();
    this.moveEnemies();
  }

  private resetEnemiesTween(): void {
    clearInterval(this.enemiesInterval);
    this.enemiesTween.stop();
    this.enemyContainer.position.set(0, this.enemyPaddingY);
    this.enemyMovementInfo.canMoveDown = false;
    this.enemyMovementInfo.canMoveRight = true;
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
          this.enemyPaddingX + this.enemyPaddingX * i,
          this.enemyPaddingY + this.enemyPaddingY * j
        );
        this.enemyContainer.addChild(enemy);
        this.enemyArray.push(enemy);
      }
    }
  }

  private destroyEnemies(): void {
    this.enemyArray.forEach((enemy: Enemy) => {
      this.enemyContainer.removeChild(enemy);
    });
    this.enemyArray = [];
  }

  private createBigEnemy(): void {
    this.bigEnemy = new Enemy(
      PIXI.Texture.from("silverMedal.png"),
      this.gameWidth,
      this.gameHeight,
      this.enemyPaddingX + this.gameWidth,
      this.enemyPaddingY
    );
    this.stage.addChild(this.bigEnemy);
    this.bigEnemyTween = new TWEEN.Tween({ bigEnemy: this.bigEnemy })
      .to({ bigEnemy: { x: -this.enemyPaddingX } }, 8000)
      .onComplete(() => {
        this.resetBigEnemy(false);
      })
      .start(performance.now());
  }

  private resetBigEnemy(isShot: boolean, startTimer = true): void {
    if (this.bigEnemyTween) {
      this.bigEnemyTween.stop();
    }
    if (this.bigEnemy) {
      this.stage.removeChild(this.bigEnemy);
      this.bigEnemy = null;
      if (startTimer) {
        setTimeout(() => {
          this.createBigEnemy();
        }, 5000);
      }
      if (isShot) {
        this.score += 1000;
      }
    }
  }

  private moveEnemies(): void {
    this.enemiesInterval = (setInterval(() => {
      const enemyTweenData = {
        moveRight: { x: this.enemyContainer.x + this.enemyPaddingX },
        moveLeft: { x: this.enemyContainer.x - this.enemyPaddingX },
        moveDown: { y: this.enemyContainer.y + this.enemyPaddingY },
      };
      let tweenData = {};
      if (this.enemyMovementInfo.canMoveRight && !this.enemyMovementInfo.canMoveDown) {
        tweenData = enemyTweenData.moveRight;
        if (this.enemyContainer.x + this.enemyContainer.width + this.enemyPaddingX * 2.5 > this.gameWidth) {
          this.enemyMovementInfo.canMoveDown = true;
        }
      } else if (this.enemyMovementInfo.canMoveDown) {
        tweenData = enemyTweenData.moveDown;
        this.enemyMovementInfo.canMoveDown = false;
        this.enemyMovementInfo.canMoveRight = !this.enemyMovementInfo.canMoveRight;
      } else {
        tweenData = enemyTweenData.moveLeft;
        if (this.enemyContainer.x - this.enemyPaddingX * 1.5 < 0) {
          this.enemyMovementInfo.canMoveDown = true;
        }
      }

      this.enemiesTween = new TWEEN.Tween({ enemiesContainer: this.enemyContainer })
        .to({ enemiesContainer: tweenData }, this.enemySpeed / 2)
        .easing(TWEEN.Easing.Sinusoidal.InOut);
      this.enemiesTween.start(performance.now());
    }, this.enemySpeed) as unknown) as number;
  }
}
