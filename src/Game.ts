import * as PIXI from "pixi.js";
import Hero from "./Hero";
import Fire from "./Fire";
import Enemy from "./Enemy";
import Background from "./Background";
import TWEEN from "@tweenjs/tween.js";

export default class Game {
  private stage: PIXI.Container;
  private gameWidth: number;
  private gameHeight: number;
  private hero: Hero | undefined;
  private fireArray: Fire[] = [];
  private enemyArray: Enemy[] = [];
  private score = 0;
  private scoreIncrement = 100;
  private readonly enemyRows = 5;
  private readonly enemyColumns = 11;
  private readonly enemyPaddingX = 40;
  private readonly enemyPaddingY = 30;
  private enemySpeed = 1000;
  private enemyContainer = new PIXI.Container();
  private enemyMovementInfo = {
    canMoveRight: true,
    canMoveDown: false,
  };
  private enemiesInterval: number | undefined;
  private enemiesTween: any;
  private bigEnemyTween: any;
  private bigEnemy: Enemy | null = null;
  private gameOverTextConfig = {
    fontFamily: "Menlo-Bold",
    fontSize: 24,
    fill: 0xde2b63,
    align: "center",
  };
  private onKeyDownStartGame = false;
  private gameOverContainer = new PIXI.Container();
  private gameOverHighScoreText: PIXI.Text | undefined;
  private scoreText: PIXI.Text | undefined;
  private createBigEnemyTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor(stage: PIXI.Container, gameWidth: number, gameHeight: number) {
    this.stage = stage;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.setupBackground();
    this.setupGameOverPanel();
    this.setupScore();
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
    this.enemyContainer.y = this.enemyPaddingY;
    this.stage.addChild(this.enemyContainer);
    this.createListeners();
    this.createEnemies();
    this.moveEnemies();
    this.enemyShoot();
    this.createBigEnemy();
    this.onKeyDownStartGame = false;
    this.stage.removeChild(this.gameOverContainer);
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
    this.scoreText = new PIXI.Text(`SCORE: ${this.score}`, this.gameOverTextConfig);
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
            console.log("englbert down!");
          }
        }
      });
    }
    tween.start(performance.now());
  }

  private enemyHit(fire: Fire, enemy: Enemy): void {
    this.destroySprite(this.enemyContainer, enemy, this.enemyArray);
    this.destroySprite(this.stage, fire, this.fireArray);
    this.score += this.scoreIncrement;
    if (this.scoreText) {
      this.scoreText.text = `SCORE: ${this.score}`;
    }
    if (this.enemyArray.length === 0) {
      this.levelComplete();
    }
  }

  private heroHit(fire: Fire): void {
    this.destroySprite(this.stage, fire, this.fireArray);
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

  private setupGameOverPanel(): void {
    const gameOverLabel = new PIXI.Text("GAME OVER, LOSER", this.gameOverTextConfig);
    gameOverLabel.anchor.set(0.5, 0.5);
    gameOverLabel.x = this.gameWidth / 2;
    gameOverLabel.y = this.gameHeight * 0.25;
    this.gameOverContainer.addChild(gameOverLabel);

    this.gameOverHighScoreText = new PIXI.Text(`SCORE ${this.score}`, this.gameOverTextConfig);
    this.gameOverHighScoreText.anchor.set(0.5, 0.5);
    this.gameOverHighScoreText.x = this.gameWidth / 2;
    this.gameOverHighScoreText.y = gameOverLabel.y + 50;
    this.gameOverContainer.addChild(this.gameOverHighScoreText);

    const playAgain = new PIXI.Text(`PRESS ANY KEY TO PLAY AGAIN 😊`, this.gameOverTextConfig);
    playAgain.anchor.set(0.5, 0.5);
    playAgain.x = this.gameWidth / 2;
    playAgain.y = this.gameOverHighScoreText.y + 150;
    this.gameOverContainer.addChild(playAgain);
  }

  private gameOver(): void {
    this.resetBigEnemy(false, false);
    if (this.createBigEnemyTimeout) {
      clearTimeout(this.createBigEnemyTimeout);
    }
    if (this.gameOverHighScoreText) {
      this.gameOverHighScoreText.text = `SCORE ${this.score}`;
    }
    this.stage.addChild(this.gameOverContainer);
    this.onKeyDownStartGame = true;
    if (this.scoreText) {
      this.scoreText.visible = false;
    }
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
    this.scoreIncrement *= 2;
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
