import TWEEN from "@tweenjs/tween.js";
import * as PIXI from "pixi.js";

export default class Background extends PIXI.Container {
  private gameWidth: number;
  private gameHeight: number;

  constructor(gameWidth: number, gameHeight: number) {
    super();
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.setup();
  }

  private setup(): void {
    const tileTexture = PIXI.Texture.from("./assets/background-tile.png");
    console.log(tileTexture);
    const tilesX = Math.ceil(this.gameWidth / tileTexture.width);
    const tilesY = Math.ceil(this.gameHeight / tileTexture.height) + 1;

    for (let i = 0; i < tilesX; i++) {
      for (let j = 0; j < tilesY; j++) {
        const tileSprite = new PIXI.Sprite(tileTexture);
        tileSprite.position.set(tileSprite.width * i, tileSprite.height * j);
        this.addChild(tileSprite);
      }
    }

    this.y -= tileTexture.height;

    new TWEEN.Tween({ background: this })
      .to({ background: { y: 0 } }, 3000)
      .repeat(Infinity)
      .start(performance.now());
  }
}
