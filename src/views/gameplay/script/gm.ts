// import { Graphics } from "pixi.js";

import { Fruit } from "../prefab/fruit";
import { GeometryPrefab } from "@/modules/hex-engine/scene/Prefab";
import GameGenerator from "@/modules/hex-engine/game/index";

const FruitPrefab = new Fruit("bunny", { size: 1 });
const WallPrefab = new GeometryPrefab("wall", { width: 100, height: 100 });

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
    x: 100,
    y: 200,
  }).then((wall) => {
    gameManager.add2GameManager(wall);
  });

  // const g = new Graphics();
  // g.rect(0, 0, width, height);
  // g.fill(0xde3249);

  // this.app.stage.addChild(g);
};

export const onUpdate = () => {};
