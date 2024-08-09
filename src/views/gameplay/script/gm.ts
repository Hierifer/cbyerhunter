// import { Graphics } from "pixi.js";

import { Fruit } from "../prefab/fruit";
import { GeometryPrefab } from "@/modules/hex-engine/scene/Prefab";
import GameGenerator from "@/modules/hex-engine/game/index";

const FruitPrefab = new Fruit("bunny", { size: 1 });
const WallPrefab = new GeometryPrefab("wall", { width: 1000, height: 100 });

export const onStart = (gameManager: GameGenerator) => {
  // 生成测试球
  const MAX = 1;
  const MAXY = 1;

  for (let i = 0; i < MAX; i++) {
    for (let c = 0; c < MAXY; c++) {
      // Move the sprite to the center of the screen.
      FruitPrefab.generate({
        x: 100 + i * 10,
        y: 100 + c * 10,
      }).then((go) => {
        gameManager.add2GameManager(go);
      });
    }
  }
  WallPrefab.generate({
    x: 500,
    y: 500,
  }).then((wall) => {
    gameManager.add2GameManager(wall);
  });

  const HitAreaPrefab = new GeometryPrefab("hitArea", {
    width: gameManager.size.width,
    height: 200,
    onClick: (event) => {
      //   console.log(event);
      FruitPrefab.generate({
        x: event.global.x,
        y: event.global.y,
      }).then((go) => {
        gameManager.add2GameManager(go);
      });
    },
    background: "transparent",
  });
  // 生成生成区
  HitAreaPrefab.generate({
    x: gameManager.size.width / 2,
    y: 200 / 2,
  }).then((wall) => {
    gameManager.add2GameManager(wall);
  });

  //   const app = gameManager.app;
  //   app.stage.eventMode = "static";
  //   app.stage.hitArea = app.screen;
};

export const onUpdate = () => {};
