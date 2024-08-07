import { Assets, Sprite } from "pixi.js";
import Matter from "matter-js";
import { GameObject } from "@/modules/hex-engine/scene/GameObject";
import {
  SpriteComponent,
  Physics2DComponent,
} from "@/modules/hex-engine/scene/Component";

type Status = "pending" | "ready";
abstract class Prefab {
  label = "";
  constructor(label: string) {
    this.label = label;
  }
  abstract generate(...args: any): GameObject | undefined;
}

export class Fruit extends Prefab {
  label = "Fruit";
  src = "https://pixijs.com/assets/bunny.png";
  components = [];
  sprite: Sprite;
  box: Matter.Body;
  status: Status = "pending";
  constructor(label: string, { src, size }: { src?: string; size: number }) {
    super(label);
    Promise.resolve().then(async () => {
      const texture = await Assets.load(src ?? this.src);

      // Create a new Sprite from an image path.
      this.sprite = new Sprite(texture);
      //this.sprite.resize(size, size);

      // Center the sprite's anchor point.
      this.sprite.anchor.set(0.5);
      this.status = "ready";
    });

    // 设置 physics
  }

  generate({ x, y }: { x: number; y: number }) {
    if (this.status === "ready") {
      this.box = Matter.Bodies.circle(x, y, 20, {}, 16);
      return new GameObject(
        { posX: x, posY: y },
        { width: this.sprite.width, height: this.sprite.height }
      ).addComponents([
        new SpriteComponent(this.sprite),
        new Physics2DComponent(this.box),
      ]);
    }
  }
}

export default Fruit;
