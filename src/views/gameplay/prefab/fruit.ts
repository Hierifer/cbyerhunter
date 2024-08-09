import { Assets, Sprite, Texture } from "pixi.js";
import Matter from "matter-js";
import { GameObject } from "@/modules/hex-engine/scene/GameObject";
import {
  SpriteComponent,
  Physics2DComponent,
} from "@/modules/hex-engine/scene/Component";
import { Prefab } from "@/modules/hex-engine/scene/Prefab";

type Status = "pending" | "ready";

export class Fruit extends Prefab {
  label = "Fruit";
  src = "https://pixijs.com/assets/bunny.png";
  components = [];
  sprite: Sprite | undefined;
  status: Status = "pending";
  texture: Texture;
  waitingList: Array<() => Promise<GameObject | void>>;
  constructor(label: string, { src, size }: { src?: string; size: number }) {
    super(label);

    this.waitingList = [];
    Promise.resolve()
      .then(async () => {
        this.texture = await Assets.load(src ?? this.src);
        this.status = "ready";
      })
      .then(() => {
        this.waitingList.forEach((genTask) => {
          genTask();
        });
      });

    // 设置 physics
  }

  /**
   * 异步生成对象
   * @param param0
   * @returns
   */
  generate({ x, y }: { x: number; y: number }) {
    return new Promise<GameObject>((resolve) => {
      if (this.status === "ready" && this.texture) {
        // Create a new Sprite from an image path.
        this.sprite = new Sprite(this.texture);
        const box = Matter.Bodies.circle(x, y, 20, {}, 16);
        this.sprite.position.set(x, y);
        // Center the sprite's anchor point.
        this.sprite.anchor.set(0.5);

        resolve(
          new GameObject(
            "fruit",
            { posX: x, posY: y },
            { width: this.sprite!.width, height: this.sprite!.height }
          ).addComponents([
            new SpriteComponent(this.sprite),
            new Physics2DComponent(box),
          ])
        );
      } else {
        this.waitingList.push(() =>
          this.generate({ x, y }).then((res) => resolve(res))
        );
      }
    });
  }
}

export default Fruit;
