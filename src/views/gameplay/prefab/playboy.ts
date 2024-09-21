import { Assets, Sprite, Texture } from "pixi.js";
import Matter from "matter-js";
import { GameObject } from "@/modules/hex-engine/scene/GameObject";
import {
  SpineComponent,
  Physics2DComponent,
  Physics2DColliderComponent,
  SpineAnimatorComponent,
  AudioComponent,
} from "@/modules/hex-engine/scene/Component";
import { Prefab } from "@/modules/hex-engine/scene/Prefab";
import { Spine } from "@pixi/spine-pixi";

type Status = "pending" | "ready";

const AUDIOS_SOURCE = {
  walk: { src: "audio/walking.mp3", rate: 0.6 },
  hover: { src: "audio/jump.mp3", rate: 1 },
  jump: { src: "audio/hover.mp3", rate: 1 },
  running: { src: "audio/walking.mp3", rate: 1 },
  spawn: { src: "audio/spawn.mp3", rate: 1 },
};
export class Playboy extends Prefab {
  label = "playboy";
  components = [];
  status: Status = "pending";
  spine: Spine | undefined;
  size: number;
  prefab = "playboy";
  waitingList: Array<() => Promise<GameObject | void>>;
  constructor(label: string, { src, size }: { src?: string; size: number }) {
    super(label);
    this.size = size;
    this.waitingList = [];

    Promise.resolve()
      .then(async () => {
        //console.log(that);
        return Promise.resolve().then(async () => {
          await Assets.load([
            {
              alias: "spineSkeleton",
              src: "spine/spineboy-pro.skel",
            },
            {
              alias: "spineAtlas",
              src: "spine/spineboy-pma.atlas",
            },
          ]);
          this.status = "ready";
        });
      })
      .then(() => {
        this.waitingList.forEach((genTask) => {
          genTask();
        });
        this.waitingList = [];
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
    label?: string;
  }) {
    return new Promise<GameObject>((resolve) => {
      const DEFAULT_SIZE = 24;
      if (this.status === "ready") {
        // Create a new Sprite from an image path.
        this.spine = Spine.from({
          skeleton: "spineSkeleton",
          atlas: "spineAtlas",
        });

        this.spine.scale.set(0.25);
        const box = Matter.Bodies.rectangle(
          x,
          y,
          this.spine.width,
          this.spine.height,
          { inertia: Infinity }
        );

        resolve(
          new GameObject(
            label ?? "playboy",
            { posX: x, posY: y },
            { width: this.spine!.width, height: this.spine!.height },
            "playboy"
          ).addComponents([
            new SpineComponent(this.spine, { x: 0, y: this.spine.height / 2 }),
            new Physics2DComponent(box),
            new Physics2DColliderComponent(space || "playboy", box),
            new SpineAnimatorComponent(this.spine),
            new AudioComponent(AUDIOS_SOURCE),
          ])
        );
      } else {
        this.waitingList.push(() =>
          this.generate({ x, y, size, label, space }).then((res) =>
            resolve(res)
          )
        );
      }
    });
  }
}

export default Playboy;
