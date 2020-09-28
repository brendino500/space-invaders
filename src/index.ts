import * as PIXI from "pixi.js";
import Game from "./Game";
import "./style.css";

const gameWidth = 800;
const gameHeight = 600;

const app = new PIXI.Application({
  backgroundColor: 0xd3d3d3,
  width: gameWidth,
  height: gameHeight,
});

const stage = app.stage;

window.onload = async (): Promise<void> => {
  await loadGameAssets();

  document.body.appendChild(app.view);

  // resizeCanvas();
  new Game(stage, gameWidth, gameHeight);
};

async function loadGameAssets(): Promise<void> {
  return new Promise((res, rej) => {
    const loader = PIXI.Loader.shared;
    loader.add("rabbit", "./assets/simpleSpriteSheet.json");

    loader.onComplete.once(() => {
      res();
    });

    loader.onError.once(() => {
      rej();
    });

    loader.load();
  });
}

function resizeCanvas(): void {
  const resize = () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    app.stage.scale.x = window.innerWidth / gameWidth;
    app.stage.scale.y = window.innerHeight / gameHeight;
  };

  resize();

  window.addEventListener("resize", resize);
}
