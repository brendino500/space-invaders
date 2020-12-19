import * as PIXI from "pixi.js";
import TWEEN from "@tweenjs/tween.js";
import Game from "./Game";
import "./style.css";
window.PIXI = PIXI;
const gameWidth = 800;
const gameHeight = 600;

const app = new PIXI.Application({
  backgroundColor: 0xd3d3d3,
  width: gameWidth,
  height: gameHeight,
});

function animate(time: number) {
  requestAnimationFrame(animate);
  TWEEN.update(time);
}
requestAnimationFrame(animate);

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
    loader.add("simple", "./assets/simpleSpriteSheet.json");
    loader.add("piggy", "./assets/angry_pig.json");
    loader.add("bunny", "./assets/bunny.json");
    loader.add("duck", "./assets/duck.json");
    loader.add("ghost", "./assets/ghost.json");
    loader.add("mask", "./assets/mask_run.json");
    loader.add("frog", "./assets/ninja_frog_run.json");
    loader.add("rock", "./assets/rock.json");
    loader.add("background-tile", "./assets/background-tile.png");

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
