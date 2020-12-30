import * as PIXI from "pixi.js";

export default class GameOverPanel extends PIXI.Container {
  private textConfig: PIXI.TextStyle;
  private gameWidth: number;
  private gameHeight: number;
  private scoreText: PIXI.Text | undefined;
  private highScoreText: PIXI.Text | undefined;

  constructor(textConfig: PIXI.TextStyle, gameWidth: number, gameHeight: number) {
    super();
    this.textConfig = textConfig;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.setup();
  }

  private setup(): void {
    const gameOverLabel = new PIXI.Text("GAME OVER, LOSER", this.textConfig);
    gameOverLabel.anchor.set(0.5, 0.5);
    gameOverLabel.x = this.gameWidth / 2;
    gameOverLabel.y = this.gameHeight * 0.25;
    this.addChild(gameOverLabel);

    this.scoreText = new PIXI.Text(`SCORE 0`, this.textConfig);
    this.scoreText.anchor.set(0.5, 0.5);
    this.scoreText.x = this.gameWidth / 2;
    this.scoreText.y = gameOverLabel.y + 50;
    this.addChild(this.scoreText);
    this.highScoreText = new PIXI.Text(`HIGHSCORE 0`, this.textConfig);
    this.highScoreText.anchor.set(0.5, 0.5);
    this.highScoreText.x = this.gameWidth / 2;
    this.highScoreText.y = this.scoreText.y + 50;
    this.addChild(this.highScoreText);

    const playAgain = new PIXI.Text(`PRESS ANY KEY TO PLAY AGAIN 😊`, this.textConfig);
    playAgain.anchor.set(0.5, 0.5);
    playAgain.x = this.gameWidth / 2;
    playAgain.y = this.scoreText.y + 150;
    this.addChild(playAgain);

    this.visible = false;
  }

  public show(score: number, highScore: number): void {
    if (this.scoreText) {
      this.scoreText.text = `SCORE ${score}`;
    }
    if (this.highScoreText) {
      this.highScoreText.text = `HIGHSCORE ${highScore}`;
    }

    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
  }
}
