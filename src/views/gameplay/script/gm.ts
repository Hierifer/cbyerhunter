// import { Graphics } from "pixi.js";

import { Fruit } from "../prefab/fruit";
import { Playboy } from "../prefab/playboy";
import { GeometryPrefab } from "@/modules/hex-engine/scene/Prefab";
import GameGenerator from "@/modules/hex-engine/game/index";
import { intersect } from "@/modules/hex-engine/utils/math";
import { GameObject } from "@/modules/hex-engine/scene/GameObject";
import { Ticker } from "pixi.js";
import Controller from "./playController";
import {
  SpineAnimatorComponent,
  AudioComponent,
} from "@/modules/hex-engine/scene/Component";
import Matter from "matter-js";

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

// hit area 参数
const HIT_AREA_HEIGHT = 200;

let GroundPrefab: GeometryPrefab | undefined = undefined;
let WallPrefab: GeometryPrefab | undefined = undefined;
let HitAreaPrefab: GeometryPrefab | undefined = undefined;
let FruitPrefab = new Fruit("cherry", { size: 1 });
let PlayboyPrefab: Playboy | undefined = undefined;
const controller = new Controller();
let player: GameObject | undefined = undefined;

/**
 * 同步函数，注意会阻塞游戏进行。在期间会放置加载动画。请放置必要且轻量的逻辑
 * @param gameManager
 */
export const onPrepare = async (gameManager: GameGenerator) => {
  const { width, height } = gameManager.size;
  // preload sprite
  // prepare Prefab
  PlayboyPrefab = new Playboy("playboy", { size: 1 });
  GroundPrefab = new GeometryPrefab("ground", { width, height: 100 });
  WallPrefab = new GeometryPrefab("wall", { width: 100, height });

  HitAreaPrefab = new GeometryPrefab("hitArea", {
    width: gameManager.size.width,
    height: HIT_AREA_HEIGHT,
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

  gameManager.createCollisionDetector("fruit", (collisions) => {
    collisions.forEach((collision) => {
      const nnids = collision.nnid;
      const { bodyA, bodyB } = collision.data;
      const gameObjectA = gameManager.getGameObjectByPhysicsBodyId(bodyA.id);
      const gameObjectB = gameManager.getGameObjectByPhysicsBodyId(bodyB.id);

      const isSameType = gameObjectA?.label === gameObjectB?.label;

      if (isSameType) {
        // @ts-expect-error check here
        const curFruit = FruitBucket[gameObjectA?.label];
        // @ts-expect-error check here
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

  setTimeout(() => {
    PlayboyPrefab &&
      PlayboyPrefab.generate({
        x: 300,
        y: 100,
        size: FruitBucket.cherry.size,
        label: "playboy",
      }).then((go) => {
        gameManager.add2GameManager(go);
        player = go;
        player.phySetStatic(true);
        const audio = player.findComponent("audio") as AudioComponent;
        audio.play("spawn");
        const track = player
          .getAnimator()
          ?.spawn()
          .then(() => {
            //player?.phySetStatic(false);
            player?.getAnimator()?.playAnimation({ name: "idle", loop: true });
          });
        setTimeout(() => {
          player?.phySetStatic(false);
        }, 100);
      });
  }, 2000);

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
      y: HIT_AREA_HEIGHT / 2,
      hasPhysics: false,
    }).then((wall) => {
      gameManager.add2GameManager(wall);
    });
  }
};

let lastOverpass: GameObject[] = [];
const endCheck = (gameManager: GameGenerator) => {
  // for everything is fruit

  const curOverpass = gameManager.getGameObjectByPrefab("fruit").filter((g) => {
    return g.getGeoTop() < HIT_AREA_HEIGHT;
  });

  const sameOverpass = intersect(lastOverpass, curOverpass, {
    oget: (go) => go.id,
  });
  lastOverpass = curOverpass;

  return sameOverpass.some(([l, c]) => {
    // console.log("found", l.geo, c.geo, GameObject.quick_distance(l,c))
    return GameObject.quick_distance(l, c) < 1;
  });
};

let lastGameCheck = 0;

// onUpdate 阻塞的
export const onUpdate = async (gameManager: GameGenerator, time?: Ticker) => {
  const spineBoy: SpineAnimatorComponent =
    player?.getAnimator() as SpineAnimatorComponent;
  if (spineBoy) {
    //const spineBoy = gameManager.getGameObjectByLabel("playboy")[0] as GameObject;
    // Update character's state based on the controller's input.
    spineBoy.state.walk =
      controller.keys.left.pressed || controller.keys.right.pressed;
    if (spineBoy.state.run && spineBoy.state.walk) {
      spineBoy.state.run = true;
    } else {
      spineBoy.state.run =
        controller.keys.left.doubleTap || controller.keys.right.doubleTap;
      spineBoy.state.hover = controller.keys.down.pressed;
    }

    if (controller.keys.left.pressed) spineBoy.direction = -1;
    else if (controller.keys.right.pressed) spineBoy.direction = 1;
    if (controller.keys.space.pressed) {
      if (spineBoy.state.jump === false) {
        spineBoy.state.jump = true;
        spineBoy
          .playAnimationAsync({ name: "jump", loop: false, timeScale: 1.5 })
          .then(() => {
            spineBoy.state.jump = false;
          });
      }
    }

    // Update character's animation based on the latest state.
    spineBoy.update();
  }
  const pcomp = player?.getPhysics2DComponent();
  const phybody = pcomp?.getBody();

  if (player && phybody) {
    const setVelocity = (velo: number) => {
      Matter.Body.setVelocity(phybody, {
        x: velo * spineBoy.direction,
        y: phybody.velocity.y,
      });
    };

    // Play the jump animation if not already playing.
    if (spineBoy.state.jump) {
      pcomp?.setLockY(true);

      const { x, y } = spineBoy.spine.position;
      let offset = 0;
      const bone = spineBoy.spine.getBonePosition("front-foot");
      if (bone) {
        offset = bone.y / 4;
      }
      Matter.Body.setPosition(phybody, {
        x,
        y: y - spineBoy.spine.height / 2 + offset,
      });
    } else {
      pcomp?.setLockY(false);
    }

    // Handle the character animation based on the latest state and in the priority order.
    if (spineBoy.state.hover) setVelocity(10);
    else if (spineBoy.state.run) setVelocity(5);
    else if (spineBoy.state.walk) setVelocity(2);
    else if (
      spineBoy.state.jump &&
      (controller.keys.left.pressed || controller.keys.right.pressed)
    ) {
      setVelocity(2);
    } else {
      setVelocity(0);
    }

    const audio = player.findComponent("audio") as AudioComponent;

    if (audio) {
      audioSM(audio, spineBoy.state);
    }
  }

  //Reach Maxinum line, end game
  // if (time && time.lastTime > 1000) {
  //   const curGameCheck = Math.floor(time.lastTime / 1000);
  //   if (lastGameCheck !== curGameCheck) {
  //     //console.log(time.lastTime, 'check')

  //     if (endCheck(gameManager)) {
  //       // call game end
  //       time.stop();
  //       gameManager.stop();
  //       gameManager.sendSignal("game-over", {});
  //     }
  //     lastGameCheck = curGameCheck;
  //   }
  // }
};

const audioSM = (
  audio: AudioComponent,
  state: SpineAnimatorComponent["state"]
) => {
  if (state.hover) {
    audio.pause("walk");
    audio.pause("running");
    audio.play("hover");
    return;
  } else {
    audio.pause("hover");
  }
  if (state.jump) {
    audio.pause("walk");
    audio.pause("running");
    audio.play("jump");
    return;
  } else {
    audio.pause("jump");
  }
  if (state.run) {
    audio.pause("walk");
    audio.play("running");
    return;
  } else {
    audio.pause("running");
  }
  if (state.walk) {
    audio.pause("running");
    audio.play("walk");
    return;
  } else {
    audio.pause("walk");
  }
};

export const onAsycUpdate = () => {};