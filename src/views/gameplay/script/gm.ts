// import { Graphics } from "pixi.js";

import { Fruit } from "../prefab/fruit";
import GameGenerator from "@/modules/hex-engine/game/index";

const FruitPrefab = new Fruit("bunny", { size: 1 });

export const onStart = (gameManager: GameGenerator) => {
  // 生成测试球
  const MAX = 2;
  const MAXY = 2;

  for (let i = 0; i < MAX; i++) {
    for (let c = 0; c < MAXY; c++) {
      // Move the sprite to the center of the screen.
      const go = FruitPrefab.generate({
        x: 100 + i * 10,
        y: 100 + c * 10,
      });
      if (go) {
        gameManager.add2GameManager(go);
      }
    }
  }

  // const g = new Graphics();
  // g.rect(0, 0, width, height);
  // g.fill(0xde3249);

  // this.app.stage.addChild(g);
};

export const onUpdate = () => {};
