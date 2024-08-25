// import { Graphics } from "pixi.js";

import { Fruit } from "../prefab/fruit";
import { GeometryPrefab } from "@/modules/hex-engine/scene/Prefab";
import GameGenerator from "@/modules/hex-engine/game/index";

// 全部水果
export const FruitBucket = {
  cherry: { name: "cherry", src: "cherry.png", size: 24, next: "strawberry" },
  strawberry: {
    name: "strawberry",
    src: "strawberry.png",
    size: 48,
    next: "grasp",
  },
  grasp: { name: "grasp", src: "grasp.png", size: 96, next: "dragonFruit" },
  dragonFruit: {
    name: "dragonFruit",
    src: "dragonFruit.png",
    size: 192,
    next: "watermelon",
  },
  watermelon: {
    name: "watermelon",
    src: "watermelon.png",
    size: 384,
    next: "watermelon",
  },
};

/**
 * 随机生成一个水果
 */
// const randomFruit = () => {
//   return ALL_FRUITS[Math.floor(Math.random() * ALL_FRUITS.length)];
// };

// 下一个水果
//const nextFruit = randomFruit();

// TO-DO
const followCursor = () => {
  const indicator = null;
  if (indicator) {
    // update indicator location
  } else {
    if (indicator) {
      // 生成图片
    }
  }
};

let GroundPrefab: GeometryPrefab | undefined = undefined;
let WallPrefab: GeometryPrefab | undefined = undefined;
let HitAreaPrefab: GeometryPrefab | undefined = undefined;
let FruitPrefab: Fruit | undefined = undefined;

/**
 * 同步函数，注意会阻塞游戏进行。在期间会放置加载动画。请放置必要且轻量的逻辑
 * @param gameManager
 */
export const onPrepare = async (gameManager: GameGenerator) => {
  const { width, height } = gameManager.size;
  // preload sprite
  // prepare Prefab

  FruitPrefab = new Fruit("cherry", { size: 1 });
  GroundPrefab = new GeometryPrefab("ground", { width, height: 100 });
  WallPrefab = new GeometryPrefab("wall", { width: 100, height });

  HitAreaPrefab = new GeometryPrefab("hitArea", {
    width: gameManager.size.width,
    height: 200,
    onClick: (event) => {
      FruitPrefab &&
        FruitPrefab.generate({
          x: event.global.x,
          y: event.global.y,
          size: FruitBucket.cherry.size,
          label: "cherry",
        }).then((go) => {
          gameManager.add2GameManager(go);
        });
    },
    onPointerout: () => {
      //console.log(event);
    },
    background: "transparent",
  });
};

export const onStart = (gameManager: GameGenerator) => {
  const { width, height } = gameManager.size;

  // 生成测试球
  const MAX = 1;
  const MAXY = 4;

  gameManager.createCollisionDetector("fruit", (collisions) => {
    collisions.forEach((collision) => {
      const nnids = collision.nnid;
      const { bodyA, bodyB } = collision.data;
      const gameObjectA = gameManager.getGameObjectByPhysicsBodyId(bodyA.id);
      const gameObjectB = gameManager.getGameObjectByPhysicsBodyId(bodyB.id);

      const isSameType = gameObjectA?.label === gameObjectB?.label;

      if (isSameType) {
        const curFruit = FruitBucket[gameObjectA?.label];
        const next = FruitBucket[curFruit.next];

        //如果碰撞干掉两对象
        const [x, y] = [
          (bodyA.position.x + bodyB.position.x) / 2,
          (bodyA.position.y + bodyB.position.y) / 2,
        ];
        const size =
          (bodyA.circleRadius ?? 20) + (bodyB.circleRadius ?? 20) / 2;
        gameManager.removeGameObject(nnids.bodyA);
        gameManager.removeGameObject(nnids.bodyB);

        FruitPrefab &&
          FruitPrefab.generate({
            x,
            y,
            size: next.size,
            label: next.name,
          }).then((go) => {
            gameManager.add2GameManager(go);
          });
      }
    });
  });

  for (let i = 0; i < MAX; i++) {
    for (let c = 0; c < MAXY; c++) {
      // Move the sprite to the center of the screen.
      FruitPrefab &&
        FruitPrefab.generate({
          x: 100,
          y: 100,
          size: FruitBucket.cherry.size,
          label: "cherry",
        }).then((go) => {
          gameManager.add2GameManager(go);
        });
    }
  }

  setTimeout(() => {
    FruitPrefab &&
      FruitPrefab.generate({
        x: 100,
        y: 100,
        size: FruitBucket.cherry.size,
        label: "cherry",
      }).then((go) => {
        gameManager.add2GameManager(go);
      });
  }, 2000);
  //     }
  //   }

  if (WallPrefab) {
    WallPrefab.generate({
      x: 0,
      y: height / 2,
    }).then((wall) => {
      gameManager.add2GameManager(wall);
    });
    WallPrefab.generate({
      x: width,
      y: height / 2,
    }).then((wall) => {
      gameManager.add2GameManager(wall);
    });
  }
  if (GroundPrefab) {
    GroundPrefab.generate({
      x: width / 2,
      y: height - 50,
    }).then((ground) => {
      gameManager.add2GameManager(ground);
    });
  }

  if (HitAreaPrefab) {
    // 生成生成区
    HitAreaPrefab.generate({
      x: gameManager.size.width / 2,
      y: 200 / 2,
    }).then((wall) => {
      gameManager.add2GameManager(wall);
    });
  }
};

export const onUpdate = () => {
  // Reach Maxinum line, end game
};
