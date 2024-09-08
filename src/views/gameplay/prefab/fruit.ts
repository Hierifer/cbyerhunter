import { Assets, Sprite, Texture } from "pixi.js";
import Matter from "matter-js";
import { GameObject } from "@/modules/hex-engine/scene/GameObject";
import {
  SpriteComponent,
  Physics2DComponent,
  Physics2DColliderComponent,
} from "@/modules/hex-engine/scene/Component";
import { Prefab } from "@/modules/hex-engine/scene/Prefab";
import { FruitBucket } from "../script/gm";

type Status = "pending" | "ready";

export class Fruit extends Prefab {
  label = "cherry";
  src = "https://pixijs.com/assets/bunny.png";
  components = [];
  sprite: Sprite | undefined;
  status: Status = "pending";
  texture: Map<keyof typeof FruitBucket, Texture> = new Map<
    keyof typeof FruitBucket,
    Texture
  >();
  size: number;
  prefab = 'Fruit';
  waitingList: Array<() => Promise<GameObject | void>>;
  constructor(label: string, { src, size }: { src?: string; size: number }) {
    super(label);
    this.size = size;
    this.waitingList = [];

    Promise.resolve()
      .then(async () => {
        await Promise.all(
          Object.entries(FruitBucket).map(async (k, v) => {
            //console.log(that);
            return Promise.resolve().then(async () => {
              // @ts-expect-error check here
              this.texture.set(k[0], await Assets.load(k[1].src));
            });
          })
        );
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
  generate({
    x,
    y,
    size,
    space,
    label,
  }: {
    x: number;
    y: number;
    size?: number;
    space?: string;
    label?: keyof typeof FruitBucket;
  }) {
    return new Promise<GameObject>((resolve) => {
      const DEFAULT_SIZE = 30;
      if (this.status === "ready" && this.texture) {
        // Create a new Sprite from an image path.

        this.sprite = new Sprite(this.texture.get(label ?? "cherry"));
        const box = Matter.Bodies.circle(x, y, size || DEFAULT_SIZE, {}, 16);
        this.sprite.position.set(x, y);
        
        // Center the sprite's anchor point.
        this.sprite.anchor.set(0.5);
        this.sprite.setSize((size ?? 12) * 2 || DEFAULT_SIZE);

        resolve(
          new GameObject(
            label ?? "cherry",
            { posX: x, posY: y },
            { width: this.sprite!.width, height: this.sprite!.height },
            "fruit"
          ).addComponents([
            new SpriteComponent(this.sprite),
            new Physics2DComponent(box),
            new Physics2DColliderComponent(space || "fruit", box),
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
