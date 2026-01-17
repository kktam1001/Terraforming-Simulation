import { AParticle3D, Color, Vec3 } from "../../../../anigraph";

export enum Direction {
    PLAYER,
    MOUSE
}

/**
 * A particle subclass for you to customize
 */
export class GroundParticle extends AParticle3D {
    color!: Color;
    t0: number = 0;
    direction: Direction;
    baseSpeed: number;
    initialDistance: number = 1;
    previousProgress: number = 0;
    targetPos: Vec3 = new Vec3();

    constructor(dir: Direction, speed?: number, position?: Vec3, velocity?: Vec3, mass?: number, size?: number, color?: Color) {
        super(position, velocity, mass, size);
        this.direction = dir;
        this.color = color ?? Color.FromString("#00ff00");
        this.baseSpeed = speed ?? 3;
    }

    getTarget(playerPos: Vec3, mousePos: Vec3) {
        if (this.direction === Direction.PLAYER) {
            return playerPos;
        }
        return this.targetPos;
    }

    getSpeed(currentDistance: number, t: number): number {
        if (this.initialDistance <= 0) return this.baseSpeed;

        const progress = 1 - (currentDistance / this.initialDistance) + (t - this.t0);
        if (this.previousProgress < progress) {
            this.previousProgress = progress;
        }
        if (this.previousProgress > 1) {
            this.previousProgress = 1;
        }

        const speedUp = 0.8 + 2.2 * this.previousProgress * this.previousProgress;

        return this.baseSpeed * speedUp;
    }

    reset(dir: Direction, t0: number, position: Vec3, target: Vec3, color?: Color, speed?: number, velocity?: Vec3,
        mass?: number, size?: number) {
        this.velocity = velocity ?? new Vec3();
        this.position = position ?? new Vec3();
        this.mass = mass ?? 1;
        this.size = size ?? 0.1;
        this.direction = dir;
        this.color = color ?? Color.FromString("#00ff00");
        this.baseSpeed = speed ?? 3;
        this.t0 = t0;
        this.visible = true;
        this.targetPos = target.clone();
        this.initialDistance = position.minus(target).L2();
        this.previousProgress = 0;
    }
}
