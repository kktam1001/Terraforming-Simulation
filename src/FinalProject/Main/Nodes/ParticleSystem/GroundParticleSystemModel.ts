import { ASerializable, ATexture, Color, GetAppState, Vec3 } from "../../../../anigraph";
import { Direction, GroundParticle } from "./GroundParticle";
import { AInstancedParticleSystemModel } from "../../../../anigraph/effects";
import * as PlayerInterface from "../../InteractionModes/PlayerInterface";
import { Mode } from "../Mode";

@ASerializable("GroundParticleSystemModel")
export class GroundParticleSystemModel extends AInstancedParticleSystemModel<GroundParticle> {

    static DEFAULT_MAX_PARTICLES = 300;

    lastEmittedIndex: number = 0;
    lastTimeUpdate: number = -1;

    particlesPerSecond: number = 30;
    lastEmitTime: number = -1;

    mousePos: Vec3 = new Vec3();
    player: PlayerInterface.PlayerInterface;

    /**
     * This will emit a new particle. The starter implementation does this in a round-robin order, so it will recycle
     * the particle that was emitted least recently.
     * @param dir
     * @param radius
     * @param t0
     */
    emitTerraformParticle(mode: Mode, groundPos: Vec3, color: Color, t0: number) {
        if (mode === Mode.NONE || mode === Mode.FLATTEN) {
            return;
        }

        if (t0 - this.lastEmitTime < 1 / this.particlesPerSecond) {
            return;
        }

        let i = (this.lastEmittedIndex + 1) % this.nParticles;

        let startPos: Vec3;
        let targetPos: Vec3;
        let particleDir: Direction;

        if (mode === Mode.ADD) {
            startPos = this.player.position.clone();
            targetPos = groundPos.clone();
            particleDir = Direction.MOUSE;
        } else {
            startPos = groundPos.clone();
            targetPos = this.player.position.clone();
            particleDir = Direction.PLAYER;
        }

        this.particles[i].reset(particleDir, t0, startPos, targetPos, color);

        this.lastEmittedIndex = i;
        this.lastEmitTime = t0;
    }

    /**
     * Here you initialize the particles
     * @param nParticles
     */
    initParticles(nParticles: number) {
        for (let i = 0; i < nParticles; i++) {
            let newp = new GroundParticle(Direction.PLAYER);

            /**
             * Here we will initialize the particles to be invisible.
             * This won't do anything on its own, though; you will have to ensure that invisible particles are not visible in your corresponding custom view class.
             */
            newp.visible = false;

            /**
             * Let's add the particle...
             */
            this.addParticle(newp);
        }
    }

    static Create(player: PlayerInterface.PlayerInterface, nParticles?: number, particleTexture?: ATexture, ...args: any[]) {
        let psystem = new this(player, nParticles, ...args);
        let mat = this.CreateMaterial(particleTexture)
        psystem.setMaterial(mat);
        return psystem;
    }

    constructor(player: PlayerInterface.PlayerInterface, nParticles?: number, ...args: any[]) {
        super(nParticles);
        this.player = player;
        this.initParticles(nParticles ?? GroundParticleSystemModel.DEFAULT_MAX_PARTICLES);
        this.signalParticlesUpdated();
    }

    timeUpdate(t: number, ...args: any[]) {
        let appState = GetAppState();
        super.timeUpdate(t, ...args);

        if (this.lastTimeUpdate < 0) {
            this.lastTimeUpdate = t;
        }

        let timePassed = t - this.lastTimeUpdate;
        this.lastTimeUpdate = t;

        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];
            if (p.visible) {
                let direction = p.getTarget(this.player.position, this.mousePos).minus(p.position);
                let currentDistance = direction.L2();

                let speed = p.getSpeed(currentDistance, t);
                let moveDistance = speed * timePassed;

                if (moveDistance >= currentDistance || currentDistance < 0.01) {
                    p.visible = false;
                } else {
                    p.position.addVector(direction.getNormalized().times(moveDistance));
                }
            }
        }

        this.signalParticlesUpdated();
    }

}
