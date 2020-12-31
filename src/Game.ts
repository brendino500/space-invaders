import * as PIXI from "pixi.js";
import Hero from "./Hero";
import Fire from "./Fire";
import GameOverPanel from "./GameOverPanel";
import Enemy from "./Enemy";
import EnemiesContainer from "./EnemiesContainer";
import Background from "./Background";
import TWEEN from "@tweenjs/tween.js";

export default class Game {
  private stage: PIXI.Container;
  private gameWidth: number;
  private gameHeight: number;
  private hero: Hero | undefined;
  private fireArray: Fire[] = [];
  private score = 0;
  private scoreIncrement = 100;
  private readonly enemyPaddingX = 40;
  private readonly enemyPaddingY = 30;
  private enemiesContainer: EnemiesContainer;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private bigEnemyTween: any;
  private bigEnemy: Enemy | null = null;
  private textConfig = {
    fontFamily: "Menlo-Bold",
    fontSize: 24,
    fill: 0xde2b63,
    align: "center",
  } as PIXI.TextStyle;
  private onKeyDownStartGame = false;
  private gameOverPanel: GameOverPanel;
  private scoreText: PIXI.Text | undefined;
  private createBigEnemyTimeout: ReturnType<typeof setTimeout> | undefined;
  private readonly localStorageKey = "High Score";

  constructor(stage: PIXI.Container, gameWidth: number, gameHeight: number) {
    this.stage = stage;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.setupBackground();
    this.gameOverPanel = new GameOverPanel(this.textConfig, this.gameWidth, this.gameHeight);
    this.stage.addChild(this.gameOverPanel);
    this.setupScore();
    this.enemiesContainer = new EnemiesContainer(gameWidth, gameHeight, this.enemyPaddingX, this.enemyPaddingY);
    this.enemiesContainer.on(this.enemiesContainer.HERO_HIT_EVENT, () => {
      this.heroHit(null);
    });
    this.stage.addChild(this.enemiesContainer);
    this.startGame();
  }

  private handleKeyDown(): void {
    if (this.onKeyDownStartGame) {
      this.startGame();
    }
  }

  private startGame(): void {
    const heroTextures = [
      "ninja_frog_run00.png",
      "ninja_frog_run01.png",
      "ninja_frog_run02.png",
      "ninja_frog_run03.png",
      "ninja_frog_run04.png",
      "ninja_frog_run05.png",
      "ninja_frog_run06.png",
      "ninja_frog_run07.png",
      "ninja_frog_run08.png",
      "ninja_frog_run09.png",
      "ninja_frog_run10.png",
      "ninja_frog_run11.png",
    ].map((e) => {
      return PIXI.Texture.from(e);
    });
    this.hero = new Hero(heroTextures, this.gameWidth, this.gameHeight);
    this.stage.addChild(this.hero);
    this.createListeners();
    this.enemiesContainer.create();
    this.enemiesContainer.move(this.hero);
    this.enemyShoot();
    this.createBigEnemy();
    this.onKeyDownStartGame = false;
    this.gameOverPanel.hide();
    this.score = 0;
    this.scoreIncrement = 100;
    if (this.scoreText) {
      this.scoreText.text = `SCORE: ${this.score}`;
      this.scoreText.visible = true;
    }
  }

  private setupBackground(): void {
    const background = new Background(this.gameWidth, this.gameHeight);
    this.stage.addChild(background);
  }

  private setupScore(): void {
    this.scoreText = new PIXI.Text(`SCORE: ${this.score}`, this.textConfig);
    this.stage.addChild(this.scoreText);
    this.scoreText.visible = false;
  }

  private createListeners(): void {
    if (this.hero) {
      this.hero.on("shoot", this.handleShoot.bind(this));
    }
  }

  private handleShoot(x: number, y: number, shotByHero = true): void {
    const fire = new Fire(PIXI.Texture.from("goldMedal.png"), this.gameWidth, this.gameHeight, x, y - 15);
    this.stage.addChild(fire);
    this.fireArray.push(fire);
    const yTarget = shotByHero ? -fire.height : this.gameHeight + fire.height;
    const tween = new TWEEN.Tween({ fire }).to({ fire: { y: yTarget } }, 1000);
    tween.onComplete(() => {
      this.destroySprite(this.stage, fire, this.fireArray);
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
        this.enemiesContainer.enemyArray.forEach((enemy) => {
          const yOverlap =
            fire.y - fire.height / 2 < enemy.y + this.enemiesContainer.y + enemy.height / 2 &&
            fire.y + fire.height / 2 > enemy.y + this.enemiesContainer.y - enemy.height / 2;
          const xOverlap =
            fire.x - fire.width / 2 < enemy.x + this.enemiesContainer.x + enemy.width / 2 &&
            fire.x + fire.width / 2 > enemy.x + this.enemiesContainer.x - enemy.width / 2;
          const hit: boolean = yOverlap && xOverlap;
          if (hit) {
            tween.stop();
            this.enemyHit(fire, enemy);
          }
        });
      });
    } else {
      tween.onUpdate(() => {
        if (this.hero) {
          const yOverlap =
            fire.y - fire.height / 2 < this.hero.y + this.hero.height / 2 &&
            fire.y + fire.height / 2 > this.hero.y - this.hero.height / 2;
          const xOverlap =
            fire.x - fire.width / 2 < this.hero.x + this.hero.width / 2 &&
            fire.x + fire.width / 2 > this.hero.x - this.hero.width / 2;
          if (yOverlap && xOverlap) {
            tween.stop();
            this.heroHit(fire);
          }
        }
      });
    }
    tween.start(performance.now());
  }

  private enemyHit(fire: Fire, enemy: Enemy): void {
    this.destroySprite(this.enemiesContainer, enemy, this.enemiesContainer.enemyArray);
    this.destroySprite(this.stage, fire, this.fireArray);
    this.score += this.scoreIncrement;
    if (this.scoreText) {
      this.scoreText.text = `SCORE: ${this.score}`;
    }
    if (this.enemiesContainer.enemyArray.length === 0) {
      this.levelComplete();
    }
  }

  private heroHit(fire: Fire | null): void {
    if (fire) {
      this.destroySprite(this.stage, fire, this.fireArray);
    }
    if (this.hero) {
      this.hero.removeInteractivity();

      new TWEEN.Tween({ hero: this.hero })
        .to({ hero: { y: this.gameHeight + this.hero.height, rotation: 180 / (180 / Math.PI) } }, 800)
        .easing(TWEEN.Easing.Back.In)
        .onComplete(() => {
          if (this.hero) {
            this.stage.removeChild(this.hero);
          }
          this.gameOver();
        })
        .start(performance.now());
    }
    this.destroyAllEnemies();
  }

  private destroyAllEnemies(): void {
    this.enemiesContainer.destroy();
    this.resetBigEnemy(false, false);
  }

  private gameOver(): void {
    this.resetBigEnemy(false, false);
    if (this.createBigEnemyTimeout) {
      clearTimeout(this.createBigEnemyTimeout);
    }
    let highScore = Number(localStorage.getItem(this.localStorageKey));
    if (!highScore || this.score > highScore) {
      highScore = this.score;
      localStorage.setItem(this.localStorageKey, String(this.score));
    }

    this.gameOverPanel.show(this.score, highScore);
    this.onKeyDownStartGame = true;
    if (this.scoreText) {
      this.scoreText.visible = false;
    }
  }

  private enemyShoot(): void {
    const randomEnemyPosition = this.enemiesContainer.getRandomEnemyPosition();
    this.handleShoot(randomEnemyPosition.x, randomEnemyPosition.y, false);
  }

  private levelComplete(): void {
    this.enemiesContainer.levelComplete();
    this.scoreIncrement *= 2;
  }

  private destroySprite(parent: PIXI.Container, sprite: PIXI.Sprite, spriteArray: PIXI.Sprite[]): void {
    parent.removeChild(sprite);
    const index = spriteArray.indexOf(sprite);
    spriteArray.splice(index, 1);
  }

  private createBigEnemy(): void {
    const bigEnemyTextures = [
      "ghost00.png",
      "ghost01.png",
      "ghost02.png",
      "ghost03.png",
      "ghost04.png",
      "ghost05.png",
      "ghost06.png",
      "ghost07.png",
      "ghost08.png",
      "ghost09.png",
    ].map((e) => {
      return PIXI.Texture.from(e);
    });
    this.bigEnemy = new Enemy(
      bigEnemyTextures,
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
        this.createBigEnemyTimeout = setTimeout(() => {
          console.log("create from timeout");
          this.createBigEnemy();
        }, 5000);
      }
      if (isShot) {
        this.score += 1000;
        if (this.scoreText) {
          this.scoreText.text = `SCORE: ${this.score}`;
        }
      }
    }
  }
}
